import React from "react";
import { Card } from "theme-ui";
import { Percent, LiquityStoreState } from "@liquity/lib-base";
import { useLiquitySelector } from "@liquity/lib-react";

import { InfoData } from "./InfoData";

type SystemStatsProps = {
  variant?: string;
};

const select = ({
  price,
  total
}: LiquityStoreState) => ({
  price,
  total
});


export const ColRatio: React.FC<SystemStatsProps> = ({ variant = "mainCards" }) => {
  
  const {
    price,
    total
  } = useLiquitySelector(select);

  const totalCollateralRatioPct = new Percent(total.collateralRatio(price));

  return (
    <Card {...{ variant }}>
      <InfoData 
        name="Total Col. Ratio" 
        tooltip="Lorem Ipsum" 
        imgSrc="./icons/col-ratio.svg" 
        logoHeight="68px"
      >
        {totalCollateralRatioPct.prettify()}
      </InfoData>
    </Card>
  );
};
