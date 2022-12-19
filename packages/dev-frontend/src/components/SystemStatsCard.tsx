import React, { useState, useEffect } from "react";
import { Box, Button, Card, Flex, Input, ThemeUICSSProperties } from "theme-ui";
import { Decimal, Percent, LiquityStoreState as ThresholdStoreState } from "@liquity/lib-base";
import { useLiquitySelector as useThresholdSelector } from "@liquity/lib-react";
import { COIN, FIRST_ERC20_COLLATERAL } from '../strings';
import { useThreshold } from "../hooks/ThresholdContext";

import { SystemStat } from "./SystemStat";
import { Transaction } from "./Transaction";

type SystemStatsCardProps = {
  variant?: string;
};

const editableStyle: ThemeUICSSProperties = {
  bg: "white",
  px: "1.1em",
  py: "0.3em",
  border: 1,
  borderColor: "border",
  borderRadius: 8,
  flexGrow: 1,
  pl: 3,
  boxShadow: 0
};

const select = ({
  numberOfTroves,
  price,
  total,
  thusdInStabilityPool,
  borrowingRate,
  redemptionRate,
  pcvBalance
}: ThresholdStoreState) => ({
  numberOfTroves,
  price,
  total,
  thusdInStabilityPool,
  borrowingRate,
  redemptionRate,
  pcvBalance
});

export const SystemStatsCard: React.FC<SystemStatsCardProps> = ({ variant = "info" }) => {
  const thresholdSelector = useThresholdSelector(select);
  const { threshold } = useThreshold();
  const [borrowingFeePct, setBorrowingFeePct] = useState<Percent<Decimal, { gte(n: string): boolean; }>>()
  const [editedPrice, setEditedPrice] = useState<string>();

  useEffect(() => {
    if (thresholdSelector) {
      // TODO needs to set dynamic versioning
      const { borrowingRate, price } = thresholdSelector.v1
      setBorrowingFeePct(new Percent(borrowingRate))
      setEditedPrice(price.toString(2));
    }
  }, [thresholdSelector])

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
        </Flex>
        <Flex sx={{
          width: "100%",
          fontSize: "0.9em",
          flexDirection: "column",
          color: "text",
          pt: "2em",
          gap: "1em"
        }}>
          {/* TODO needs to set dynamic versioning */}
          {thresholdSelector && (
            <>
              <SystemStat
                info="Borrowing Fee"
                tooltip="The Borrowing Fee is a one-off fee charged as a percentage of the borrowed amount, and is part of a Vault's debt."
              >
                {borrowingFeePct && borrowingFeePct.toString(2)}
              </SystemStat>
              <SystemStat
                info="Vaults"
                tooltip="The total number of active Vaults in the system."
              >
                {Decimal.from(thresholdSelector.v1.numberOfTroves).prettify(0)}
              </SystemStat>
              <SystemStat
                info="TVL"
                tooltip={`The Total Value Locked (TVL) is the total value of Ether locked as collateral in the system, given in ${ FIRST_ERC20_COLLATERAL } and USD.`}
              >
                {thresholdSelector.v1.total.collateral.shorten()} { FIRST_ERC20_COLLATERAL }
              </SystemStat>
              <SystemStat
                info={`${ COIN } in Stability Pool`}
                tooltip={`The total ${ COIN } currently held in the Stability Pool, expressed as an amount and a fraction of the ${ COIN } supply.`}
              >
                {thresholdSelector.v1.thusdInStabilityPool.shorten()}
              </SystemStat>
              <SystemStat
                info={`${ COIN } in PCV`}
                tooltip={`The total ${ COIN } currently held in the PCV, expressed as an amount and a fraction of the ${ COIN } supply.`}
              >
                {thresholdSelector.v1.pcvBalance.prettify()}
              </SystemStat>
              <SystemStat
                info={`${ COIN } Supply`}
                tooltip={`The total ${ COIN } minted by the Threshold USD Protocol.`}
              >
                {thresholdSelector.v1.total.debt.shorten()}
              </SystemStat>
              {thresholdSelector.v1.total.collateralRatioIsBelowCritical(thresholdSelector.v1.price) &&
                (<SystemStat
                  info="Recovery Mode"
                  tooltip="Recovery Mode is activated when the Total Collateral Ratio (TCR) falls below 150%. When active, your Vault can be liquidated if its collateral ratio is below the TCR. The maximum collateral you can lose from liquidation is capped at 110% of your Trove's debt. Operations are also restricted that would negatively impact the TCR."
                >
                  {thresholdSelector.v1.total.collateralRatioIsBelowCritical(thresholdSelector.v1.price) ? <Box color="danger">Yes</Box> : "No"}
                </SystemStat>)
              }
            </>
          )}
        </Flex>
        <Flex sx={{
          width: "100%",
          gap: 1,
          pt: 4,
          pb: 2,
          borderBottom: 1,
          borderColor: "border"
        }}>
          { FIRST_ERC20_COLLATERAL } Price
        </Flex>
        <Flex sx={{
          width: "100%",
          fontSize: "0.9em",
          pt: 14,
          pb: 3
        }}>
          <SystemStat>
            {/* TODO needs to set dynamic versioning */}
            {threshold.v1.connection._priceFeedIsTestnet ? (
              <Flex sx={{ mb:1, alignItems: "center", height: "1.2em", }}>
                <Input
                  variant="layout.balanceRow"
                  sx={{
                  ...editableStyle,
                  color: "inputText"
                  }}
                  type="number"
                  step="any"
                  value={editedPrice}
                  onChange={e => setEditedPrice(e.target.value)}
                />
                <Transaction
                  id="set-price"
                  tooltip="Set the WETH price in the testnet"
                  tooltipPlacement="bottom"
                  send={overrides => {
                    if (!editedPrice) {
                      throw new Error("Invalid price");
                    }
                    return threshold.v1.send.setPrice(Decimal.from(editedPrice), overrides);
                  }}
                >
                  <Button sx={{
                    ml: 3,
                    width: "1rem",
                    height: "1rem",
                    borderRadius: 6,
                    top: 0
                  }}>
                    Set
                  </Button>
                </Transaction>
              </Flex>
            ) : (
              thresholdSelector && thresholdSelector.v1.price.toString(2)
            )}
          </SystemStat>
        </Flex>
      </Card>
    </Card>
  );
};
