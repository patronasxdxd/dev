import React from "react";
import { Card } from "theme-ui";
import { Decimal, LiquityStoreState as ThresholdStoreState} from "@liquity/lib-base";
import { useLiquitySelector as useThresholdSelector} from "@liquity/lib-react";

import { TopCard } from "./TopCard";

type SystemStatsProps = {
  variant?: string;
};

const select = ({
  numberOfTroves,
}: ThresholdStoreState) => ({
  numberOfTroves,
});


export const OpenedVaults: React.FC<SystemStatsProps> = ({ variant = "mainCards" }) => {
  const thresholdSelector = useThresholdSelector(select);

  return (
    <Card {...{ variant }} sx={{ display: ['none', 'block'] }}>
      <TopCard
        name="Opened Vaults" 
        tooltip="The total number of active Vaults in the system." 
        imgSrc="./icons/opened-vaults.svg"
      >
        {/* TODO needs to set dynamic versioning */}
        {thresholdSelector && Decimal.from(thresholdSelector.v1.numberOfTroves).prettify(0)}
      </TopCard>
    </Card>
  );
};
