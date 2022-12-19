import { LiquityStore } from "@liquity/lib-base";
import { BlockPolledLiquityStore } from "@liquity/lib-ethers";

import React, { createContext, useEffect, useState } from "react";

export const LiquityStoreContext = createContext<LiquityStore[] | undefined>(undefined);

type LiquityStoreProviderProps = {
  thresholdStores: BlockPolledLiquityStore[];
  loader?: React.ReactNode;
};

export const LiquityStoreProvider: React.FC<LiquityStoreProviderProps> = ({
  thresholdStores,
  loader,
  children
}) => {
  const [loadedStore, setLoadedStore] = useState<LiquityStore[]>([]); 

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
  return <LiquityStoreContext.Provider value={loadedStore}>{children}</LiquityStoreContext.Provider>;
};
