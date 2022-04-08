import React from "react";
import { Box, Card, Flex } from "theme-ui";
import { LiquityStoreState } from "@liquity/lib-base";
import { useLiquitySelector } from "@liquity/lib-react";

import { InfoIcon } from "../InfoIcon";
import { SystemStat } from "./SystemStat";

type SystemStatsCardProps = {
  variant?: string;
};

const select = ({
  numberOfTroves,
  price,
  total,
  lusdInStabilityPool,
  borrowingRate,
  redemptionRate
}: LiquityStoreState) => ({
  numberOfTroves,
  price,
  total,
  lusdInStabilityPool,
  borrowingRate,
  redemptionRate
});

export const SystemStatsCard: React.FC<SystemStatsCardProps> = ({ variant = "info" }) => {

  const {
    price,
    total,
    lusdInStabilityPool
  } = useLiquitySelector(select);

  return (
    <Card {...{ variant }}>
      <Card variant="layout.columns">
        <Flex sx={{
          width: "100%",
          gap: 1,
          pb: 3,
          borderBottom: 1, 
          borderColor: "border"
        }}>
          Network Stats
          <InfoIcon size="sm" tooltip={<Card variant="tooltip">Lorem Ipsum</Card>} />
        </Flex>
        <Flex sx={{
          width: "100%",
          fontSize: "0.9em",
          flexDirection: "column",
          color: "text",
          pt: "2em",
          gap: "1em"
        }}>
          <SystemStat 
            info="TVL" 
            tooltip="Lorem Ipsum" 
          >
            {total.collateral.shorten()} ETH
          </SystemStat>
          <SystemStat 
            info="LUSD in Stability Pool" 
            tooltip="Lorem Ipsum" 
          >
            {lusdInStabilityPool.shorten()}
          </SystemStat>
          <SystemStat 
            info="LUSD Supply" 
            tooltip="Lorem Ipsum" 
          >
            {total.debt.shorten()}
          </SystemStat>
          <SystemStat 
            info="Recovery Mode" 
            tooltip="Lorem Ipsum" 
          >
            {total.collateralRatioIsBelowCritical(price) ? <Box color="danger">Yes</Box> : "No"}
          </SystemStat>
        </Flex>
        <Flex sx={{
          width: "100%",
          gap: 1,
          pt: 4,
          pb: 2,
          borderBottom: 1, 
          borderColor: "border"
        }}>
          ETH Price
        </Flex>
        <Flex sx={{
          width: "100%",
          fontSize: "0.9em",
          pt: 14,
          pb: 3
        }}>
          <SystemStat>
            ${price.toString(2)}
          </SystemStat>
        </Flex>
      </Card>
    </Card>
  );
};
