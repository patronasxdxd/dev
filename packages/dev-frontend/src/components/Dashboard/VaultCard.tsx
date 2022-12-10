import React from "react";
import { Card } from "theme-ui";

import { LiquityStoreState as ThresholdStoreState} from "@liquity/lib-base";
import { useLiquitySelector as useThresholdSelector} from "@liquity/lib-react";
import { useTroveView } from "../Trove/context/TroveViewContext";
import { TroveView } from "../Trove/context/types";

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
  const { view } = useTroveView();
  const { erc20TokenBalance } = useThresholdSelector(select);

  return (
    <Card {...{ variant }}>
      <BottomCard
        title={vaultStatus(view)}
        tooltip={`To mint and borrow thUSD you must open a vault and deposit a certain amount of collateral (${ FIRST_ERC20_COLLATERAL }) to it.`}
        action={vaultStatus(view)}
        token={ FIRST_ERC20_COLLATERAL }
        path='/borrow'
      >
        {!erc20TokenBalance.eq(0) ? erc20TokenBalance.prettify() : '--'}
      </BottomCard>
    </Card>
  );
};
