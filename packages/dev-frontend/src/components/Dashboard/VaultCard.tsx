import React from "react";
import { Card } from "theme-ui";

import { LiquityStoreState as ThresholdStoreState } from "@liquity/lib-base";
import { useThresholdSelector } from "@liquity/lib-react";
import { TroveView } from "../Trove/context/types";
import { useTroveView } from "../Trove/context/TroveViewContext";

import { FIRST_ERC20_COLLATERAL } from "../../strings";
import { BottomCard } from "./BottomCard";

type VaultCardProps = {
  variant?: string;
};

const select = ({ erc20TokenBalance }: ThresholdStoreState) => ({
  erc20TokenBalance
});

const vaultStatus = (view: TroveView) => {
  if (view === 'ACTIVE') return 'Adjust Vault'
  else return 'Open a Vault'
}

export const VaultCard: React.FC<VaultCardProps> = ({ variant = "mainCards" }) => {
  // TODO needs to set dynamic versioning
  const { views: { v1 } } = useTroveView();
  // TODO needs to set dynamic versioning
  const {v1: { erc20TokenBalance }} = useThresholdSelector(select);

  return (
    <Card {...{ variant }}>
      <BottomCard
        title={vaultStatus(v1)}
        tooltip={`To mint and borrow thUSD you must open a vault and deposit a certain amount of collateral (${ FIRST_ERC20_COLLATERAL }) to it.`}
        action={vaultStatus(v1)}
        token={ FIRST_ERC20_COLLATERAL }
        path='/borrow'
      >
        {erc20TokenBalance.eq(0) ? erc20TokenBalance.prettify() : '--'}
      </BottomCard>
    </Card>
  );
};
