import React, { createContext, useContext, useEffect, useState } from "react";
import { Provider } from "@ethersproject/abstract-provider";
import { getNetwork } from "@ethersproject/networks";
import { Web3Provider } from "@ethersproject/providers";

import { isBatchedProvider, isWebSocketAugmentedProvider } from "@liquity/providers";
import {
  EthersLiquity as EthersThreshold,
  _connectByChainId,
  getCollateralsDeployments,
  _LiquityDeploymentJSON,
  EthersLiquityConnection
} from "@liquity/lib-ethers";
import { CollateralsVersionedDeployments } from "@liquity/lib-ethers/src/contracts";

import { ThresholdConfig, getConfig } from "../config";
import { Threshold } from "@liquity/lib-react";
import { useWalletConnector } from "./WalletConnectorContext";

type Version = {
  collateral: keyof CollateralsVersionedDeployments
  version: string
  deployment: _LiquityDeploymentJSON
}

type ThresholdContextValue = {
  config: ThresholdConfig;
  account: string;
  provider: Provider | Web3Provider;
  threshold: Threshold[];
};

type SupportedNetworks = {
  [key: string]: "homestead" | "goerli" | "sepolia";
};

const ThresholdContext = createContext<ThresholdContextValue | undefined>(undefined);

type ThresholdProviderProps = {
  children: React.ReactNode;
  loader?: React.ReactNode;
  unsupportedNetworkFallback?: (chainId: number) => React.ReactNode;
  unsupportedMainnetFallback?: React.ReactNode;
};

const wsParams = (network: string, alchemyApiKey: string): [string, string] => [
  `wss://eth-${network === "homestead" ? "mainnet" : network}.g.alchemy.com/v2/${alchemyApiKey}`,
  network
];

export const supportedNetworks: SupportedNetworks = { 1: "homestead", 5: "goerli", 11155111: "sepolia"};

const getCollateralVersions = async (chainId: number): Promise<CollateralsVersionedDeployments> => {
  const network = supportedNetworks[chainId];
  return await getCollateralsDeployments(network === "homestead" ? "mainnet" : network);
}

async function getConnections(
    versionsArray: Version[], 
    provider: Web3Provider, 
    account: string, 
    chainId: number,
    setConnections: Function
  ) {
    const connectionsByChainId: (EthersLiquityConnection & { useStore: "blockPolled"; })[] = versionsArray.map(version => 
      _connectByChainId(
        version.collateral,
        version.version, 
        version.deployment, 
        provider, 
        provider.getSigner(account), chainId, 
        { userAddress: account, useStore: "blockPolled" }
      )
    )
    return setConnections(connectionsByChainId)
};

function iterateVersions(collaterals: CollateralsVersionedDeployments) {
  const result = [];

  // Iterate over the top-level keys in the object (e.g. "btc", "eth")
  for (const collateral in collaterals) {
    if (collaterals.hasOwnProperty(collateral)) {
      const versions = collaterals[collateral];

      // Iterate over the version keys for the current cryptocurrency
      for (const version in versions) {
        if (versions.hasOwnProperty(version)) {
          // Add an object with the cryptocurrency identification and version to the result array
          const versionObj = {
            collateral: collateral,
            version: version,
            deployment: versions[version]
          };
          result.push(versionObj);
        }
      }
    }
  }

  // Return the array of version objects with the cryptocurrency identification
  return result;
}

export const ThresholdProvider = ({
  children,
  loader,
  unsupportedNetworkFallback,
  unsupportedMainnetFallback
}: ThresholdProviderProps): JSX.Element => {
  const { provider, account: { address }, account: {chainId} } = useWalletConnector();
  const [config, setConfig] = useState<ThresholdConfig>();
  const [connections, setConnections] = useState<(EthersLiquityConnection & { useStore: "blockPolled"; })[]>();
  const [threshold, setThreshold] = useState<Threshold[]>([])
  
  useEffect(() => {
    if (!chainId || !provider || !address || !config) {
      return;
    }
    
    if (!(chainId in supportedNetworks)) {
      setThreshold([])
      setConnections(undefined)
      return
    }

    getCollateralVersions(chainId)
      .then((collaterals) => {
        const versionsArray = iterateVersions(collaterals);
        getConnections(versionsArray, provider, address, chainId, setConnections)
      })  
      .catch((err) => console.error('get collateral error: ', err))
  }, [chainId, provider, address, config])

  useEffect(() => {
    getConfig().then(setConfig);
  }, []);

  useEffect(() => {
    if (!chainId || !(chainId in supportedNetworks)) {
      setConnections(undefined)
      return
    }
    
    if (config && connections) {
      //Get the connection of the first collateral for network identification
      if (connections.length > 0) {
        const { provider, chainId } = connections[0];
        let thresholdStores: Threshold[] = []

        for (const connection of connections) {
          const ethersThresholdFromConnection = EthersThreshold._from(connection);
          ethersThresholdFromConnection.store.logging = true;
          thresholdStores.push({
            collateral: connection.deploymentCollateral,
            version: connection.deploymentVersion,
            store: ethersThresholdFromConnection,
          })
        }

        setThreshold(thresholdStores)
        if (isBatchedProvider(provider) && provider.chainId !== chainId) {
          provider.chainId = chainId;
        }
        if (isWebSocketAugmentedProvider(provider)) {
          const network = getNetwork(chainId);
          if (network.name && Object.keys(supportedNetworks).includes(network.name) && process.env.REACT_APP_ALCHEMY_ID) {
            provider.openWebSocket(...wsParams(network.name, process.env.REACT_APP_ALCHEMY_ID));
          } else if (connections[0]._isDev) {
            provider.openWebSocket(`ws://${window.location.hostname}:8546`, chainId);
          }
          return () => {
            provider.closeWebSocket();
          };
        }
      }
    }
  }, [config, connections, chainId]);

  if (!config || !provider || !address || !chainId) {
    return <>{loader}</>;
  }

  //This conditional should be habilitated only in test-net version
  if (config.testnetOnly && chainId === 1) {
    return <>{unsupportedMainnetFallback}</>;
  }

  if (!connections || connections.length === 0) {
    return unsupportedNetworkFallback ? <>{unsupportedNetworkFallback(chainId)}</> : <></>;
  }

  if (threshold.length !== connections.length) {
    return <>{loader}</>;
  }

  return (
    <ThresholdContext.Provider value={{ config, account: address, provider, threshold }}>
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
