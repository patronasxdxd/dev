import React, { useEffect, useState } from "react";
import { Card } from "theme-ui";
import { Decimal, Percent, LiquityStoreState as ThresholdStoreState } from "@liquity/lib-base";
import { useLiquitySelector as useThresholdSelector } from "@liquity/lib-react";

import { TopCard } from "./TopCard";

type BorrowingFeeProps = {
  variant?: string;
};

const select = ({
  borrowingRate,
}: ThresholdStoreState) => ({
  borrowingRate,
});

export const BorrowingFee: React.FC<BorrowingFeeProps> = ({ variant = "mainCards" }) => {
  const [borrowingFeePct, setBorrowingFeePct] = useState<Percent<Decimal, { gte(n: string): boolean; }>>()
  const thresholdSelector = useThresholdSelector(select);

  useEffect(() => {
    if (thresholdSelector) {
      // TODO needs to set dynamic versioning
      setBorrowingFeePct(new Percent(thresholdSelector.v1.borrowingRate))
    }
    return () => {
      setBorrowingFeePct(undefined)
    }
  }, [thresholdSelector])


  return (
    <Card {...{ variant }} sx={{ display: ['none', 'block'] }}>
      <TopCard 
        name="Borrowing Fee" 
        tooltip="The Borrowing Fee is a one-off fee charged as a percentage of the borrowed amount, and is part of a Vault's debt." 
        imgSrc="./icons/borrowing-fee.svg" 
      >
        {borrowingFeePct && borrowingFeePct.toString(2)}
      </TopCard>
    </Card>
  );
};
