import React from "react";
import { Box, Card, Flex } from "theme-ui";
import { LiquityStoreState } from "@liquity/lib-base";
import { useLiquitySelector } from "@liquity/lib-react";

import { InfoIcon } from "../InfoIcon";

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
          fontWeight: "bold",
          flexDirection: "column",
          color: "text",
          pt: "2em",
          gap: "1em"
        }}>
          <Flex sx={{
            justifyContent: "space-between",
            color: "text"
          }}>
            <Flex sx={{ gap: "4px" }}>
              TVL
              <InfoIcon size="sm" tooltip={<Card variant="tooltip">Lorem Ipsum</Card>} />
            </Flex>
            {total.collateral.shorten()} ETH
          </Flex>
          <Flex sx={{
            justifyContent: "space-between",
            color: "text"
          }}>
            <Flex sx={{ gap: "4px" }}>
              LUSD in Stability Pool
              <InfoIcon size="sm" tooltip={<Card variant="tooltip">Lorem Ipsum</Card>} />
            </Flex>
            {lusdInStabilityPool.shorten()}
          </Flex>
          <Flex sx={{
            justifyContent: "space-between",
            color: "text"
          }}>
            <Flex sx={{ gap: "4px" }}>
              LUSD Supply
              <InfoIcon size="sm" tooltip={<Card variant="tooltip">Lorem Ipsum</Card>} />
            </Flex>
            {total.debt.shorten()}
          </Flex>
          <Flex sx={{
            justifyContent: "space-between",
            color: "text"
          }}>
            <Flex sx={{ gap: "4px" }}>
              Recovery Mode
              <InfoIcon size="sm" tooltip={<Card variant="tooltip">Lorem Ipsum</Card>} />
            </Flex>
            {total.collateralRatioIsBelowCritical(price) ? <Box color="danger">Yes</Box> : "No"}
          </Flex>
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
          justifyContent: "space-between",
          width: "100%",
          fontSize: "0.9em",
          fontWeight: "bold",
          color: "text",
          pt: 14,
          pb: 3
        }}>
          ${price.toString(2)}
        </Flex>
      </Card>
    </Card>
  );
};
