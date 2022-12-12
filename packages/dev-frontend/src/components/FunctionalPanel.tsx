import React from "react";
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

  const { threshold } = useThreshold();

  // For console tinkering ;-)
  Object.assign(window, {

    threshold,
    Trove,
    Decimal,
    Difference,
    Wallet
  });

  const thresholdStores = threshold.map((thresholdInstance) => {
    return thresholdInstance.store;
  })

  return (
    <>
      <ThresholdStoreProvider {...{ loader }} thresholdStores={thresholdStores}>
        <TroveViewProvider>
          {children}
        </TroveViewProvider>
      </ThresholdStoreProvider>
      <TransactionMonitor />
    </>            
  );
};
