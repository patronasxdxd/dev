import { Container, Heading } from "theme-ui";

import { BorrowingFee } from "../components/Dashboard/BorrowingFee";
import { OpenedVaults } from "../components/Dashboard/OpenedVaults";
import { ColRatio } from "../components/Dashboard/ColRatio";
import { Chart } from "../components/Dashboard/Chart/Chart";
import { VaultCard } from "../components/Dashboard/VaultCard";
import { StabilityPoolCard } from "../components/Dashboard/StabilityPoolCard";
import { SystemStatsCard } from "../components/SystemStatsCard";
import { useThreshold } from "../hooks/ThresholdContext";
import {
  LiquityStoreState as ThresholdStoreState,
  Decimal,
  Trove,
  THUSD_LIQUIDATION_RESERVE,
  Percent,
  Difference
} from "@liquity/lib-base";
import { useLiquitySelector as useThresholdSelector } from "@liquity/lib-react";
import {
  selectForTroveChangeValidation,
  validateTroveChange
} from "../components/Trove/validation/validateTroveChange";

const selector = (state: ThresholdStoreState) => {
  const { trove, fees, price, erc20TokenBalance } = state;
  return {
    trove,
    fees,
    price,
    erc20TokenBalance,
    validationContext: selectForTroveChangeValidation(state)
  };
};

export const Dashboard = () => {
  const { threshold } = useThreshold()
  const thresholdSelector = useThresholdSelector(1, selector)

  return (
  <Container>
    <Heading as="h2" sx={{ mt: "2.5em", fontWeight: "semibold" }}>
      Dashboard
    </Heading>
    <Container variant="dashboardGrid">
      <Container variant="oneThird">
        {/* TODO */}
        {/* <BorrowingFee /> */}
      </Container>
      <Container variant="oneThird">
        {/* <OpenedVaults /> */}
      </Container>
      <Container variant="oneThird">
        {/* <ColRatio /> */}
      </Container>
      <Container variant="twoThirds">
        <Chart />
      </Container>
      <Container variant="oneThird">
        {/* <SystemStatsCard /> */}
      </Container>
      <Container variant="half">
        {/* <VaultCard /> */}
      </Container>
      <Container variant="half">
        {/* <StabilityPoolCard /> */}
      </Container>
    </Container>
  </Container>
  )
};
