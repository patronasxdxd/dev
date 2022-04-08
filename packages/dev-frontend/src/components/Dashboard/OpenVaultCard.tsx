import React from "react";
import { Card } from "theme-ui";

import { LiquityStoreState } from "@liquity/lib-base";
import { useLiquitySelector } from "@liquity/lib-react";

import { BottomCard } from "./BottomCard";

type OpenVaultCardProps = {
  variant?: string;
};

const select = ({ accountBalance }: LiquityStoreState) => ({
  accountBalance
});

export const OpenVaultCard: React.FC<OpenVaultCardProps> = ({ variant = "mainCards" }) => {
  const { accountBalance } = useLiquitySelector(select);

  return (
    <Card {...{ variant }}>
      <BottomCard 
        title='Open a Vault'
        tooltip='lorem ipsum'
        action='Open a Vault'
        token='ETH'
        path='/borrow'
      >
        {!accountBalance.eq(0) ? accountBalance.prettify() : '--'}
      </BottomCard>
    </Card>
  );
};
