import React from "react";
import { Card } from "theme-ui";
import { Percent, LiquityStoreState as ThresholdStoreState} from "@liquity/lib-base";
import { useLiquitySelector as useThresholdSelector } from "@liquity/lib-react";

import { TopCard } from "./TopCard";

type SystemStatsProps = {
  variant?: string;
};

const select = ({
  price,
  total
}: ThresholdStoreState) => ({
  price,
  total
});

export const ColRatio: React.FC<SystemStatsProps> = ({ variant = "mainCards" }) => {
  // TODO
  const {
    price,
    total
  } = useThresholdSelector(1, select);

  const totalCollateralRatioPct = new Percent(total.collateralRatio(price));

  return (
    <Card {...{ variant }}>
      <TopCard 
        name="Total Col. Ratio" 
        tooltip="The ratio of the Dollar value of the entire system collateral at the current ETH:USD price, to the entire system debt." 
        imgSrc="./icons/col-ratio.svg" 
      >
        {totalCollateralRatioPct.prettify()}
      </TopCard>
    </Card>
  );
};
