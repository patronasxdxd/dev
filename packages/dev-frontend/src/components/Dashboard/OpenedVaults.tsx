import React from "react";
import { Card } from "theme-ui";
import { Decimal, LiquityStoreState } from "@liquity/lib-base";
import { useLiquitySelector } from "@liquity/lib-react";

import { TopCard } from "./TopCard";

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
      <TopCard
        name="Opened Vaults" 
        tooltip="The total number of active Vaults in the system." 
        imgSrc="./icons/opened-vaults.svg"
      >
        {Decimal.from(numberOfTroves).prettify(0)}
      </TopCard>
    </Card>
  );
};
