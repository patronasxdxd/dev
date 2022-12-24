import { useEffect, useMemo, useState } from "react";
import { Card } from "theme-ui";
import { Percent, LiquityStoreState, Decimal } from "@liquity/lib-base";
import { useThresholdSelector } from "@liquity/lib-react";

import { TopCard } from "./TopCard";

type BorrowingFeeProps = {
  variant?: string;
};

const select = ({
  borrowingRate,
}: LiquityStoreState) => ({
  borrowingRate,
});

export const BorrowingFee = ({ variant = "mainCards" }: BorrowingFeeProps): JSX.Element => {
  const [isMounted, setIsMounted] = useState<boolean>(true);
  const thresholdSelectorVersions = useThresholdSelector(select);
  const [borrowingRates, setBorrowingRates] = useState<Record<string, Decimal>>({});

  useEffect(() => {
    if (thresholdSelectorVersions || isMounted) {
      for (const [version, { borrowingRate }] of Object.entries(thresholdSelectorVersions)) {
        setBorrowingRates(prev => { return {...prev, [version]: borrowingRate}})
      }
    }
    return () => {
      setIsMounted(false);
      setBorrowingRates({})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const borrowingFeeAvgPct = useMemo(() => {
    let initialBorrowingRate = Decimal.from(0)
    const BorrowingRatesKeys = Object.keys(borrowingRates)

    if (BorrowingRatesKeys.length !== Object.keys(thresholdSelectorVersions).length) {
      return undefined;
    }

    for (let index = 1; index <= BorrowingRatesKeys.length; index++) {
      initialBorrowingRate = initialBorrowingRate.add(borrowingRates[BorrowingRatesKeys[index - 1]])

      if (BorrowingRatesKeys.length === index) {
        const BorrowingFeeAvg = initialBorrowingRate.div(Decimal.from(BorrowingRatesKeys.length))
        return new Percent(BorrowingFeeAvg)
      }
    };
  }, [borrowingRates, thresholdSelectorVersions])

  return (
    <Card {...{ variant }} sx={{ display: ['none', 'block'], width:"100%" }}>
      <TopCard 
        name={Object.keys(thresholdSelectorVersions).length > 1 ? "Borrowing Fee Avg." : "Borrowing Fee"}
        tooltip="The Borrowing Fee is a one-off fee charged as a percentage of the borrowed amount, and is part of a Vault's debt." 
        imgSrc="./icons/borrowing-fee.svg" 
      >
        {borrowingFeeAvgPct && borrowingFeeAvgPct.toString(2)}
      </TopCard>
    </Card>
  );
};
