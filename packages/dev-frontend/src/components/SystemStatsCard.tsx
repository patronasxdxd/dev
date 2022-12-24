import { useState, useEffect } from "react";
import { Box, Card, Flex } from "theme-ui";
import { Decimal, Percent, LiquityStoreState as ThresholdStoreState } from "@liquity/lib-base";
import { useThresholdSelector } from "@liquity/lib-react";
import { COIN, FIRST_ERC20_COLLATERAL } from '../strings';

import { SystemStat } from "./SystemStat";
import { EditPrice } from "./Dashboard/EditPrice";

type SystemStatsCardProps = {
  variant?: string;
};

const selector = ({
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

export const SystemStatsCard = ({ variant = "info" }: SystemStatsCardProps): JSX.Element => {
  const thresholdSelector = useThresholdSelector(selector)
  const thresholdSelectorKeys = Object.keys(thresholdSelector)
  const [borrowingFeeAvgPct, setBorrowingFeeAvgPct] = useState(new Percent(Decimal.from(0)))
  const [totalVaults, setTotalVaults] = useState(0)
  const [thusdInStabilityPool, setThusdInStabilityPool] = useState(Decimal.from(0))
  const [thusdSupply, setThusdSupply] = useState(Decimal.from(0))
  const [pcvBalance, setPcvBalance] = useState(Decimal.from(0))

  useEffect(() => {
    let borrowingFee = Decimal.from(0)
    let thusdSupply = Decimal.from(0)

    thresholdSelectorKeys.forEach(version => {
      const versionedThresholdSelector = thresholdSelector[version]

      borrowingFee = borrowingFee.add(versionedThresholdSelector.borrowingRate)
      setTotalVaults(prev => prev + totalVaults)
      setThusdInStabilityPool(prev => prev.add(thusdInStabilityPool))
      setPcvBalance(prev => prev.add(pcvBalance))
      thusdSupply = thusdSupply.add(versionedThresholdSelector.total.debt)
    })

    const borrowingfeeAvg = borrowingFee.div(thresholdSelectorKeys.length)
    setBorrowingFeeAvgPct(new Percent(borrowingfeeAvg))
    setThusdSupply(thusdSupply)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
          <SystemStat
            info={`Borrowing Fee ${thresholdSelectorKeys.length > 1 && "Avg."}`}
            tooltip="The Borrowing Fee is a one-off fee charged as a percentage of the borrowed amount, and is part of a Vault's debt."
          >
            {borrowingFeeAvgPct && borrowingFeeAvgPct.toString(2)}
          </SystemStat>    
          <SystemStat
            info="Total Vaults"
            tooltip="The total number of active Vaults in the system."
          >
            {Decimal.from(totalVaults).prettify(0)}
          </SystemStat>
          {thresholdSelectorKeys.map((version, index) => (
            <SystemStat
              key={index}
              info={`${FIRST_ERC20_COLLATERAL} deposited collateral`}
              tooltip={`The Total Value Locked (TVL) is the total value of ${ FIRST_ERC20_COLLATERAL } locked as collateral in the system.`}
            >
              {thresholdSelector[version].total.collateral.shorten()} { FIRST_ERC20_COLLATERAL }
            </SystemStat>
          ))}
          <SystemStat
            info={`${ COIN } in Stability Pool`}
            tooltip={`The total ${ COIN } currently held in the Stability Pool, expressed as an amount and a fraction of the ${ COIN } supply.`}
          >
            {thusdInStabilityPool.shorten()}
          </SystemStat>
          <SystemStat
            info={`${ COIN } in PCV`}
            tooltip={`The total ${ COIN } currently held in the PCV, expressed as an amount and a fraction of the ${ COIN } supply.`}
          >
            {pcvBalance.prettify()}
          </SystemStat>             
          <SystemStat
            info={`${ COIN } Supply`}
            tooltip={`The total ${ COIN } minted by the Threshold USD Protocol.`}
          >
            {thusdSupply.shorten()}
          </SystemStat>
          {thresholdSelectorKeys.forEach((version) => {
            thresholdSelector[version].total.collateralRatioIsBelowCritical(thresholdSelector[version].price) &&
              <SystemStat
                info={`${FIRST_ERC20_COLLATERAL} Recovery Mode`}
                tooltip="Recovery Mode is activated when the Total Collateral Ratio (TCR) falls below 150%. When active, your Vault can be liquidated if its collateral ratio is below the TCR. The maximum collateral you can lose from liquidation is capped at 110% of your Trove's debt. Operations are also restricted that would negatively impact the TCR."
              >
                <Box color="danger">Yes</Box>
              </SystemStat>
          })}
        </Flex>
        <Flex sx={{
          width: "100%",
          fontSize: "0.9em",
          pb: 3
        }}>
          {Object.keys(thresholdSelector).map((version, index) => {
            return <EditPrice key={index} version={version} />
          })}
        </Flex>
      </Card>
    </Card>
  );
};
