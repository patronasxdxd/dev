import { Card } from "theme-ui";
import { Percent, LiquityStoreState, Decimal } from "@liquity/lib-base";
import { useThresholdSelector } from "@liquity/lib-react";

import { TopCard } from "./TopCard";
import { useEffect, useState } from "react";

type SystemStatsProps = {
  variant?: string;
};

const selector = ({
  price,
  total
}: LiquityStoreState) => ({
  price,
  total
});

export const ColRatio = ({ variant = "mainCards" }: SystemStatsProps): JSX.Element => {
  const thresholdSelector = useThresholdSelector(selector)
  const thresholdSelectorKeys = Object.keys(thresholdSelector)
  const [collateralRatioAvgPct, setCollateralRatioAvgPct] = useState(new Percent(Decimal.from(0)))

  useEffect(() => {
    let collateralRatio = Decimal.from(0)    
    thresholdSelectorKeys.map(version => {
      const versionedCollateralRatio = thresholdSelector[version].total.collateralRatio(thresholdSelector[version].price)
      return collateralRatio = collateralRatio ===  Decimal.INFINITY || versionedCollateralRatio === Decimal.INFINITY
        ? Decimal.INFINITY 
        : collateralRatio.add(versionedCollateralRatio) 
    })

    const collateralRatioAvg = collateralRatio === Decimal.INFINITY 
      ? Decimal.INFINITY 
      : collateralRatio.div(thresholdSelectorKeys.length)
    
    setCollateralRatioAvgPct(new Percent(collateralRatioAvg))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Card {...{ variant }} sx={{ width:"100%"}}>
      <TopCard 
        name={`${thresholdSelectorKeys.length > 1 ? "Col. Ratio Avg." : "Total Col. Ratio"}`}
        tooltip="The ratio of the Dollar value of the entire system collateral at the current ETH:USD price, to the entire system debt." 
        imgSrc="./icons/col-ratio.svg" 
      >
        {collateralRatioAvgPct && collateralRatioAvgPct.prettify()}
      </TopCard>
    </Card>
  );
};
