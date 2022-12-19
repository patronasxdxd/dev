import React from "react";
import { Card } from "theme-ui";
import { COIN } from "../../strings";

import { LiquityStoreState as ThresholdStoreState } from "@liquity/lib-base";
import { useLiquitySelector as useThresholdSelector} from "@liquity/lib-react";

import { BottomCard } from "./BottomCard";

type StabilityPoolCardProps = {
  variant?: string;
};

const select = ({  thusdBalance }: ThresholdStoreState) => ({
  thusdBalance
});

export const StabilityPoolCard: React.FC<StabilityPoolCardProps> = ({ variant = "mainCards" }) => {
  const thresholdSelector = useThresholdSelector(select);

  return (
    <Card {...{ variant }}>
      <BottomCard 
        title='Stability Pool'
        action='Deposit'
        tooltip={`The Stability Pool is the first line of defense in maintaining system solvency. It achieves that by acting as the source of liquidity to repay debt from liquidated Vaults—ensuring that the total ${ COIN } supply always remains backed.`}
        token={ COIN }
        path='/earn'
        disabled={ true }
      >
        {/* TODO needs to set dynamic versioning */}
        {thresholdSelector && (!thresholdSelector.v1.thusdBalance.eq(0) ? thresholdSelector.v1.thusdBalance.prettify() : '--')}
      </BottomCard>
    </Card>
  );
};
