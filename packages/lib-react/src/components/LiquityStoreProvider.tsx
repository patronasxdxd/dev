import { LiquityStore, } from "@liquity/lib-base";

import React, { createContext, useEffect, useState } from "react";

export const LiquityStoreContext = createContext<LiquityStore | undefined>(undefined);

type LiquityStoreProviderProps = {
  thresholdStores: LiquityStore[];
  loader?: React.ReactNode;
};

export const LiquityStoreProvider: React.FC<LiquityStoreProviderProps> = ({
  thresholdStores,
  loader,
  children
}) => {

  const [loadedStore, setLoadedStore] = useState<LiquityStore>();
 

  useEffect(() => {

    const stopArray: (() => void)[] = []

    thresholdStores.map((thresholdStore) => {

      thresholdStore.onLoaded = () => setLoadedStore(thresholdStore);
      const stop = thresholdStore.start()
      stopArray.push(stop) 
    })

    return () => {

      thresholdStores.forEach((thresholdStore, index) => {
        thresholdStore.onLoaded = undefined;
        const stop = stopArray[index];
        stop();
        setLoadedStore(undefined);
      })
    };
  }, [thresholdStores]);

  if (!loadedStore) {
    return <>{loader}</>;
  }

  return <LiquityStoreContext.Provider value={loadedStore}>{children}</LiquityStoreContext.Provider>;
};
