import React from "react";
import { Card } from "theme-ui";
import { Decimal, LiquityStoreState } from "@liquity/lib-base";
import { useLiquitySelector } from "@liquity/lib-react";

import { InfoData } from "./InfoData";

type SystemStatsProps = {
  variant?: string;
};

const select = ({
  numberOfTroves,
}: LiquityStoreState) => ({
  numberOfTroves,
});


export const OpenedVaults: React.FC<SystemStatsProps> = ({ variant = "mainCards" }) => {
  
  const {
    numberOfTroves,
  } = useLiquitySelector(select);

  return (
    <Card {...{ variant }} sx={{ display: ['none', 'block'] }}>
      <InfoData 
        name="Opened Vaults" 
        tooltip="Lorem Ipsum" 
        imgSrc="./icons/opened-vaults.svg"
      >
        {Decimal.from(numberOfTroves).prettify(0)}
      </InfoData>
    </Card>
  );
};
