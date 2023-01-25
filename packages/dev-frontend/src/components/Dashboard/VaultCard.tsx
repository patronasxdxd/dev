import { Card } from "theme-ui";

import { LiquityStoreState as ThresholdStoreState } from "@liquity/lib-base";
import { useThresholdSelector } from "@liquity/lib-react";
import { VaultView } from "../Vault/context/types";
import { useVaultView } from "../Vault/context/VaultViewContext";

import { BottomCard } from "./BottomCard";

type VaultCardProps = {
  variant?: string;
};

const selector = ({ erc20TokenBalance, symbol }: ThresholdStoreState) => ({
  erc20TokenBalance, symbol
});

const vaultStatus = (view: VaultView) => {
  if (view === 'ACTIVE') return 'Adjust Vault'
  else return 'Open a Vault'
}

export const VaultCard = ({ variant = "mainCards" }: VaultCardProps): JSX.Element => {
  const { views: { v1 } } = useVaultView();
  const {v1: { erc20TokenBalance, symbol }} = useThresholdSelector(selector);
  
  return (
    <Card {...{ variant }}>
      <BottomCard
        title={vaultStatus(v1)}
        tooltip={`To mint and borrow thUSD you must open a vault and deposit a certain amount of collateral (${ symbol }) to it.`}
        action={vaultStatus(v1)}
        token={ symbol }
        path='/borrow'
      >
        {erc20TokenBalance.eq(0) ? '--' : erc20TokenBalance.prettify()}
      </BottomCard>
    </Card>
  );
};
