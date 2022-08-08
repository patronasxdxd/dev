import React from "react";
import { Card } from "theme-ui";

import { LiquityStoreState } from "@liquity/lib-base";
import { useLiquitySelector } from "@liquity/lib-react";

import { FIRST_ERC20_COLLATERAL } from "../../strings";
import { BottomCard } from "./BottomCard";

type OpenVaultCardProps = {
  variant?: string;
};

const select = ({ erc20TokenBalance }: LiquityStoreState) => ({
  erc20TokenBalance
});

export const OpenVaultCard: React.FC<OpenVaultCardProps> = ({ variant = "mainCards" }) => {
  const { erc20TokenBalance } = useLiquitySelector(select);

  return (
    <Card {...{ variant }}>
      <BottomCard 
        title='Open a Vault'
        tooltip={`To mint and borrow thUSD you must open a vault and deposit a certain amount of collateral (${ FIRST_ERC20_COLLATERAL }) to it.`}
        action='Open a Vault'
        token={ FIRST_ERC20_COLLATERAL }
        path='/borrow'
      >
        {!erc20TokenBalance.eq(0) ? erc20TokenBalance.prettify() : '--'}
      </BottomCard>
    </Card>
  );
};
