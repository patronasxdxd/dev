import React from "react";
import { Wallet } from "@ethersproject/wallet";

import { Decimal, Difference, Trove as Vault } from "@threshold-usd/lib-base";
import { ThresholdStoreProvider } from "@threshold-usd/lib-react";

import { useThreshold } from "../hooks/ThresholdContext";
import { VaultViewProvider } from "./Vault/context/VaultViewProvider";
import { TransactionMonitor } from "./Transaction";
import { StabilityViewProvider } from "./Stability/context/StabilityViewProvider";

type FunctionalPanelProps = {
  loader?: React.ReactNode;
  children: React.ReactNode;
};

export const FunctionalPanel = ({ children, loader }: FunctionalPanelProps): JSX.Element => {
  const { account, provider, threshold } = useThreshold();

  // For console tinkering ;-)
  Object.assign(window, {
    account,
    provider,
    threshold,
    Vault,
    Decimal,
    Difference,
    Wallet
  });

  return (
    <>
      <ThresholdStoreProvider {...{ loader }} threshold={threshold}>
        <VaultViewProvider {...{ loader}}>
          <StabilityViewProvider {...{ loader}}>
            {children}
          </StabilityViewProvider>
        </VaultViewProvider>
      </ThresholdStoreProvider>
      <TransactionMonitor />
    </>            
  );
};
