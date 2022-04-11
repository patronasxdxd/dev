import React from "react";
import { Card } from "theme-ui";

import { LiquityStoreState } from "@liquity/lib-base";
import { useLiquitySelector } from "@liquity/lib-react";

import { BottomCard } from "./BottomCard";

type StabilityPoolCardProps = {
  variant?: string;
};

const select = ({  lusdBalance }: LiquityStoreState) => ({
  lusdBalance
});

export const StabilityPoolCard: React.FC<StabilityPoolCardProps> = ({ variant = "mainCards" }) => {
  const {  lusdBalance } = useLiquitySelector(select);

  return (
    <Card {...{ variant }}>
      <BottomCard 
        title='Stability Pool'
        action='Deposit'
        tooltip='The Stability Pool is the first line of defense in maintaining system solvency. It achieves that by acting as the source of liquidity to repay debt from liquidated Troves—ensuring that the total LUSD supply always remains backed.'
        token='LUSD'
        path='/earn'
      >
        {! lusdBalance.eq(0) ?  lusdBalance.prettify() : '--'}
      </BottomCard>
    </Card>
  );
};
