import React from "react";
import { Card } from "theme-ui";
import { Percent, LiquityStoreState as ThresholdStoreState } from "@liquity/lib-base";
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
  // TODO
  const {
    borrowingRate,
  } = useThresholdSelector(1, select);

  const borrowingFeePct = new Percent(borrowingRate);

  return (
    <Card {...{ variant }} sx={{ display: ['none', 'block'] }}>
      <TopCard 
        name="Borrowing Fee" 
        tooltip="The Borrowing Fee is a one-off fee charged as a percentage of the borrowed amount, and is part of a Vault's debt." 
        imgSrc="./icons/borrowing-fee.svg" 
      >
        {borrowingFeePct.toString(2)}
      </TopCard>
    </Card>
  );
};
