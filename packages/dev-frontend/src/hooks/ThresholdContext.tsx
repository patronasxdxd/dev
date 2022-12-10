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
  _getVersionedDeployments
} from "@liquity/lib-ethers";

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

export const ThresholdProvider: React.FC<ThresholdProviderProps> = ({
  children,
  loader,
  unsupportedNetworkFallback,
  unsupportedMainnetFallback
}) => {
  const { library: provider, account, chainId } = useWeb3React<Web3Provider>();
  const [config, setConfig] = useState<ThresholdConfig>();

  const deploymentVersions = useMemo(() => {
    if (chainId) {
      try {
        return _getVersionedDeployments(chainId === 1 ? 'mainnet' : 'goerli');
      } catch {}
    }
  }, [chainId]);

  const connections = useMemo(() => {
    if (deploymentVersions && config && provider && account && chainId) {
      try {
        return deploymentVersions.versions.map((version) => {
          return _connectByChainId(
            version, deploymentVersions.versionedDeployments[version], 
            provider, 
            provider.getSigner(account), chainId, 
            { userAddress: account, useStore: "blockPolled" }
          )
        })
      } catch {}
    }
  }, [deploymentVersions, config, provider, account, chainId]);

  useEffect(() => {
    getConfig().then(setConfig);
  }, []);

  useEffect(() => {
    if (config && connections) {
      //Get the connection of the first collateral ("v1") for network identification
      const connection = connections.find(connection => connection.version === "v1");

      if (connection) {
        const { provider, chainId } = connection;

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

  const threshold = connections.map((connection) => {
    return EthersThreshold._from(connection);
  })

  threshold.forEach((thresholdInstance) => {
    thresholdInstance.store.logging = true;
  })


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
