import { Card } from "theme-ui";
import { Percent, LiquityStoreState, Decimal, Trove } from "@liquity/lib-base";
import { useThresholdSelector } from "@liquity/lib-react";

import { TopCard } from "./TopCard";
import { useEffect, useState } from "react";

type SystemStatsProps = {
  variant?: string;
};

type mintListApproved = {
  [key:string]: {
    mintList: boolean;
    price: Decimal;
    total: Trove;
  }
}

const selector = ({
  mintList,
  price,
  total
}: LiquityStoreState) => ({
  mintList,
  price,
  total
});

export const ColRatio = ({ variant = "mainCards" }: SystemStatsProps): JSX.Element => {
  const thresholdSelector = useThresholdSelector(selector)
  const thresholdSelectorKeys = Object.keys(thresholdSelector)
  const [collateralData, setCollateralData] = useState({versionsQty: 0, collateralRatioAvgPct: new Percent(Decimal.from(0))})
  const [isMounted, setIsMounted] = useState<boolean>(true);

  useEffect(() => {
    if (!isMounted) {
      return
    }
    let mintListApproved: mintListApproved = {}
    for (const [version] of Object.entries(thresholdSelector)) {
      if (thresholdSelector[version].mintList === true) {
        mintListApproved = {...mintListApproved, [version]: {
          mintList: true, 
          price: thresholdSelector[version].price, 
          total:thresholdSelector[version].total}}
      }
    }
    let collateralRatio = Decimal.from(0)   
    for (const [version] of Object.entries(mintListApproved)) {
      const versionedCollateralRatio = mintListApproved[version].total.collateralRatio(thresholdSelector[version].price)
      
      collateralRatio = collateralRatio ===  Decimal.INFINITY || versionedCollateralRatio === Decimal.INFINITY
        ? Decimal.INFINITY 
        : collateralRatio.add(versionedCollateralRatio) 
    }
    const collateralRatioAvg = collateralRatio === Decimal.INFINITY 
      ? Decimal.INFINITY 
      : collateralRatio.div(thresholdSelectorKeys.length)
      
      setCollateralData(
      {
        versionsQty: Object.entries(mintListApproved).length, 
        collateralRatioAvgPct: new Percent(collateralRatioAvg)
      }
    )
    return () => {
      setIsMounted(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Card {...{ variant }} sx={{ width:"100%"}}>
      <TopCard 
        name={`${collateralData.versionsQty > 1 ? "Col. Ratio Avg." : "Total Col. Ratio"}`}
        tooltip="The ratio of the Dollar value of the entire system collateral at the current ETH:USD price, to the entire system debt." 
        imgSrc="./icons/col-ratio.svg" 
      >
        {collateralData.collateralRatioAvgPct.prettify()}
      </TopCard>
    </Card>
  );
};
