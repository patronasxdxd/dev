import { LiquityStore as ThresholdStore } from "@liquity/lib-base";
import { BlockPolledLiquityStore as BlockPolledThresholdStore } from "@liquity/lib-ethers";

import React, { createContext, useEffect, useState } from "react";

export const ThresholdStoreContext = createContext<ThresholdStore[] | undefined>(undefined);

type ThresholdStoreProviderProps = {
  thresholdStores: BlockPolledThresholdStore[];
  loader?: React.ReactNode;
};

export const ThresholdStoreProvider: React.FC<ThresholdStoreProviderProps> = ({
  thresholdStores,
  loader,
  children
}) => {
  const [loadedStore, setLoadedStore] = useState<ThresholdStore[]>([]); 

  useEffect(() => {
    for (const thresholdStore of thresholdStores) {
      thresholdStore.onLoaded = () => setLoadedStore(prev => [...prev, thresholdStore]);
      thresholdStore.start();
    }
    return () => {
      for (const thresholdStore of thresholdStores) {
        setLoadedStore([]);
        thresholdStore.onLoaded = undefined;
        const stop = thresholdStore.start();
        stop()
      }
    };
  }, [thresholdStores]);

  if (loadedStore.length !== thresholdStores.length) {
    return <>{loader}</>
  }
  return <ThresholdStoreContext.Provider value={loadedStore}>{children}</ThresholdStoreContext.Provider>;
};
