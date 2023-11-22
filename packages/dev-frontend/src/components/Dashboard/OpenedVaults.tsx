import { useEffect, useState } from "react";
import { Card } from "theme-ui";
import { Decimal, LiquityStoreState as ThresholdStoreState} from "@threshold-usd/lib-base";
import { useThresholdSelector} from "@threshold-usd/lib-react";

import { TopCard } from "./TopCard";

type SystemStatsProps = {
  variant?: string;
};

const selector = ({
  numberOfTroves,
}: ThresholdStoreState) => ({
  numberOfTroves,
});

export const OpenedVaults = ({ variant = "mainCards" }: SystemStatsProps): JSX.Element => {
  const thresholdSelectorStores = useThresholdSelector(selector);
  const [numberOfTroves, setNumberOfVaults] = useState(0)

  useEffect(() => {
    thresholdSelectorStores.map(thresholdSelector => {
      return setNumberOfVaults(prev => prev + thresholdSelector.store.numberOfTroves)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  return (
    <Card {...{ variant }} sx={{ display: ['none', 'block'], width:"100%" }}>
      <TopCard
        name="Total Opened Vaults" 
        tooltip="The total number of active Vaults in the system." 
        imgSrc="./icons/opened-vaults.svg"
      >
        {Decimal.from(numberOfTroves).prettify(0)}
      </TopCard>
    </Card>
  );
};
