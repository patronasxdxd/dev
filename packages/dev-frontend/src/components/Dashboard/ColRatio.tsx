import React, { useEffect, useState } from "react";
import { Card } from "theme-ui";
import { Decimal, Percent, LiquityStoreState as ThresholdStoreState} from "@liquity/lib-base";
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
  const [totalCollateralRatioPct, setTotalCollateralRatioPct] = useState<Percent<Decimal, { gte(n: string): boolean; }>>()
  const thresholdSelector = useThresholdSelector(select);

  useEffect(() => {
    if (thresholdSelector) {
      // TODO needs to set dynamic versioning
      const { total, price } = thresholdSelector.v1
      setTotalCollateralRatioPct(new Percent(total.collateralRatio(price)))
    }
    return () => {
      setTotalCollateralRatioPct(undefined)
    }
  }, [thresholdSelector])

  return (
    <Card {...{ variant }}>
      <TopCard 
        name="Total Col. Ratio" 
        tooltip="The ratio of the Dollar value of the entire system collateral at the current ETH:USD price, to the entire system debt." 
        imgSrc="./icons/col-ratio.svg" 
      >
        {totalCollateralRatioPct && totalCollateralRatioPct.prettify()}
      </TopCard>
    </Card>
  );
};
