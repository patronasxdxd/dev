import React, { useMemo } from "react";
import { Wallet } from "@ethersproject/wallet";

import { Decimal, Difference, Trove } from "@liquity/lib-base";
import { LiquityStoreProvider as ThresholdStoreProvider } from "@liquity/lib-react";

import { useThreshold } from "../hooks/ThresholdContext";
import { TroveViewProvider } from "./Trove/context/TroveViewProvider";
import { TransactionMonitor } from "./Transaction";

type FunctionalPanelProps = {
  loader?: React.ReactNode;
};

export const FunctionalPanel: React.FC<FunctionalPanelProps> = ({ children, loader }) => {
  const { account, provider, threshold } = useThreshold();

  // For console tinkering ;-)
  Object.assign(window, {
    account,
    provider,
    threshold,
    Trove,
    Decimal,
    Difference,
    Wallet
  });
  
  const thresholdStores = useMemo(() => {
    return Object.values(threshold).map((thresholdStore) => thresholdStore.store)
  }, [threshold])

  return (
    <>
      <ThresholdStoreProvider {...{ loader }} thresholdStores={thresholdStores}>
        <TroveViewProvider {...{ loader}}>
          {children}
        </TroveViewProvider>
      </ThresholdStoreProvider>
      <TransactionMonitor />
    </>            
  );
};
