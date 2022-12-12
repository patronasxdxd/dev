import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Provider } from "@ethersproject/abstract-provider";
import { getNetwork } from "@ethersproject/networks";
import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";

import { isBatchedProvider, isWebSocketAugmentedProvider } from "@liquity/providers";
import {
  BlockPolledLiquityStore as BlockPolledThresholdStore,
  EthersLiquity as EthersThreshold,
  EthersLiquityWithStore as EthersThresholdWithStore,
  _connectByChainId,
  _getVersionedDeployments,
  EthersLiquityConnection
} from "@liquity/lib-ethers";
import { _VersionedLiquityDeployments } from "@liquity/lib-ethers/dist/src/contracts";

import { ThresholdConfig, getConfig } from "../config";

type ThresholdContextValue = {
  config: ThresholdConfig;
  account: string;
  provider: Provider;
  threshold: EthersThresholdWithStore<BlockPolledThresholdStore>[];
};

const ThresholdContext = createContext<ThresholdContextValue | undefined>(undefined);

type ThresholdProviderProps = {
  loader?: React.ReactNode;
  unsupportedNetworkFallback?: (chainId: number) => React.ReactNode;
  unsupportedMainnetFallback?: React.ReactNode;
};

const wsParams = (network: string, infuraApiKey: string): [string, string] => [
  `wss://${network === "homestead" ? "mainnet" : network}.infura.io/ws/v3/${infuraApiKey}`,
  network
];

const supportedNetworks = ["homestead", "goerli"];

const getDeploymentVersions = async (chainId: number): Promise<{versionedDeployments: _VersionedLiquityDeployments}> => {
  return await _getVersionedDeployments(chainId === 1 ? 'mainnet' : 'goerli');
}

const getConnections = async (
    result: { versionedDeployments: _VersionedLiquityDeployments; }, 
    provider: Web3Provider, 
    account: string, 
    chainId: number,
    setConnections: Function
  ) => {
    const connectionsByChainId: any = [];
    for (const [key, value] of Object.entries(result.versionedDeployments)) {
      connectionsByChainId.push(_connectByChainId(
        key, 
        value, 
        provider, 
        provider.getSigner(account), chainId, 
        { userAddress: account, useStore: "blockPolled" }
      ))
    }
    return setConnections(connectionsByChainId)
}

export const ThresholdProvider: React.FC<ThresholdProviderProps> = ({
  children,
  loader,
  unsupportedNetworkFallback,
  unsupportedMainnetFallback
}) => {
  const { library: provider, account, chainId } = useWeb3React<Web3Provider>();
  const [config, setConfig] = useState<ThresholdConfig>();
  const [connections, setConnections] = useState<EthersLiquityConnection[]>();

  useEffect(() => {
    if (chainId) {
      getDeploymentVersions(chainId)
        .then((result) => {
          if (provider && account && config) {
            getConnections(result, provider, account, chainId, setConnections)
          }
        })
    }
  }, [chainId, provider, account, config])
  
  useEffect(() => {
    getConfig().then(setConfig);
  }, []);

  useEffect(() => {
    if (config && connections) {
      //Get the connection of the first collateral ("v1") for network identification
      if (connections) {
        const { provider, chainId } = connections[0];

        if (isBatchedProvider(provider) && provider.chainId !== chainId) {
          provider.chainId = chainId;
        }

        if (isWebSocketAugmentedProvider(provider)) {
          const network = getNetwork(chainId);

          if (network.name && supportedNetworks.includes(network.name) && config.infuraApiKey) {
            provider.openWebSocket(...wsParams(network.name, config.infuraApiKey));
          } else if (connections[0]._isDev) {
            provider.openWebSocket(`ws://${window.location.hostname}:8546`, chainId);
          }

          return () => {
            provider.closeWebSocket();
          };
        }
      }
    }
  }, [config, connections]);


  if (!config || !provider || !account || !chainId) {
    return <>{loader}</>;
  }

  //This conditional should be habilitated only in test-net version
  if (chainId === 1) {
    return <>{unsupportedMainnetFallback}</>;
  }

  //Forcing goerli connection
  if (!connections || chainId !== 5) {
    return unsupportedNetworkFallback ? <>{unsupportedNetworkFallback(chainId)}</> : null;
  }

  const threshold = connections.map((connection: any) => {
    return EthersThreshold._from(connection);
  })

  for (const thresholdInstance of threshold) {
    thresholdInstance.store.logging = true;
  }

  return (
    <ThresholdContext.Provider value={{ config, account, provider, threshold }}>
      {children}
    </ThresholdContext.Provider>
  );
};

export const useThreshold = () => {
  const thresholdContext = useContext(ThresholdContext);

  if (!thresholdContext) {
    throw new Error("You must provide a ThresholdContext via ThresholdProvider");
  }

  return thresholdContext;
};
