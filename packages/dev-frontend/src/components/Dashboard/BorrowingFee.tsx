import React from "react";
import { Card } from "theme-ui";
import { Percent, LiquityStoreState } from "@liquity/lib-base";
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

export const BorrowingFee: React.FC<BorrowingFeeProps> = ({ variant = "mainCards" }) => {
  // TODO needs to set dynamic versioning
  const {
    v1: {
      borrowingRate,
    }
  } = useThresholdSelector(select);

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
