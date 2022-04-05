import React from "react";
import { Card } from "theme-ui";
import { Percent, LiquityStoreState } from "@liquity/lib-base";
import { useLiquitySelector } from "@liquity/lib-react";

import { InfoData } from "./InfoData";

type BorrowingFeeProps = {
  variant?: string;
};

const select = ({
  borrowingRate,
}: LiquityStoreState) => ({
  borrowingRate,
});


export const BorrowingFee: React.FC<BorrowingFeeProps> = ({ variant = "mainCards" }) => {
  
  const {
    borrowingRate,
  } = useLiquitySelector(select);

  const borrowingFeePct = new Percent(borrowingRate);

  return (
    <Card {...{ variant }}>
      <InfoData 
        name="Borrowing Fee" 
        tooltip="Lorem Ipsum" 
        imgSrc="./icons/borrowing-fee.svg" 
        logoHeight="68px"
      >
        {borrowingFeePct.toString(2)}
      </InfoData>
    </Card>
  );
};
