import React, { useEffect, useState } from "react";
import { Card } from "theme-ui";
import { Decimal, LiquityStoreState as ThresholdStoreState} from "@liquity/lib-base";
import { useThresholdSelector} from "@liquity/lib-react";

import { TopCard } from "./TopCard";

type SystemStatsProps = {
  variant?: string;
};

const selector = ({
  numberOfTroves,
}: ThresholdStoreState) => ({
  numberOfTroves,
});

export const OpenedVaults: React.FC<SystemStatsProps> = ({ variant = "mainCards" }) => {
  const thresholdSelector = useThresholdSelector(selector);
  const [numberOfVaults, setNumberOfVaults] = useState(0)

  useEffect(() => {
    Object.keys(thresholdSelector).map(version => {
      return setNumberOfVaults(prev => prev + thresholdSelector[version].numberOfTroves)
    })
  }, [thresholdSelector])
  
  return (
    <Card {...{ variant }} sx={{ display: ['none', 'block'] }}>
      <TopCard
        name="Opened Vaults" 
        tooltip="The total number of active Vaults in the system." 
        imgSrc="./icons/opened-vaults.svg"
      >
        {Decimal.from(numberOfVaults).prettify(0)}
      </TopCard>
    </Card>
  );
};
