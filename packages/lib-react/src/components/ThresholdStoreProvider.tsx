import { LiquityStore as ThresholdBaseStore } from "@liquity/lib-base";
import { BlockPolledLiquityStore as BlockPolledThresholdStore, CollateralsVersionedDeployments, EthersLiquityWithStore as EthersThresholdWithStore } from "@liquity/lib-ethers";

import React, { createContext, useEffect, useState } from "react";

export const ThresholdStoreContext = createContext<ThresholdLoadedStore<unknown>[] | undefined>(undefined);

export interface VersionedCollateral {
  collateral: keyof CollateralsVersionedDeployments;
  version: string;
}

export interface Threshold extends VersionedCollateral {
  store: EthersThresholdWithStore<BlockPolledThresholdStore>;
}

export interface ThresholdStore extends VersionedCollateral {
  store: BlockPolledThresholdStore;
}

export interface ThresholdLoadedStore<T> extends VersionedCollateral {
  store: ThresholdBaseStore<T>;
}

export type ThresholdStoreProviderProps = {
  threshold: Threshold[];
  loader?: React.ReactNode;
};

export const ThresholdStoreProvider: React.FC<ThresholdStoreProviderProps> = ({
  threshold,
  loader,
  children
}) => {
  const [thresholdStores, setThresholdStores] = useState<{
    collateral: string;
    version: string;
    store: BlockPolledThresholdStore;
  }[]>([]);
  const [loadedStore, setLoadedStore] = useState<ThresholdLoadedStore<unknown>[]>([]);

  useEffect(() => {
    const newThresholdStores = threshold.map(({ collateral, version, store }) => ({
      collateral,
      version,
      store: store.store,
    }));
    setThresholdStores(newThresholdStores);
  }, [threshold]);

  // Effect to start and stop the threshold stores, and update the loaded stores when they are loaded
  useEffect(() => {
    for (const thresholdStore of thresholdStores) {
      // Set the onLoaded callback to update the loaded store state when the store is loaded
      thresholdStore.store.onLoaded = async () => setLoadedStore(prev => [
        ...prev, 
        {
          collateral: thresholdStore.collateral,
          version: thresholdStore.version,
          store: thresholdStore.store
        }
      ])
      // Start the threshold store
      thresholdStore.store.start();
    }
    // Return a cleanup function that stops the threshold stores and resets the loaded store state
    return () => {
      for (const thresholdStore of thresholdStores) {
        setLoadedStore([]);
        thresholdStore.store.onLoaded = undefined;
        const stop = thresholdStore.store.start();
        stop()
      }
    };
  }, [thresholdStores]);

  // If the number of loaded stores is less than the total number of stores, show the loader component
  if (loadedStore.length !== thresholdStores.length) {
    return <>{loader}</>
  }

  // Otherwise, provide the loaded stores to the children via context
  return <ThresholdStoreContext.Provider value={loadedStore}>{children}</ThresholdStoreContext.Provider>;
};
