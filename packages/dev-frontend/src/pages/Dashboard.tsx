import { Container, Heading } from "theme-ui";

import { BorrowingFee } from "../components/Dashboard/BorrowingFee";
import { OpenedVaults } from "../components/Dashboard/OpenedVaults";
import { ColRatio } from "../components/Dashboard/ColRatio";
import { OpenVault } from "../components/Dashboard/OpenVault";
// import { Trove } from "../components/Trove/Trove";
// import { Stability } from "../components/Stability/Stability";
// import { SystemStats } from "../components/SystemStats";
// import { PriceManager } from "../components/PriceManager";
// import { Staking } from "../components/Staking/Staking";

export const Dashboard: React.FC = () => (
  <Container>
    <Heading as="h2" sx={{ mt: 5, fontWeight: "semibold" }}>
      Dashboard
    </Heading>
    <Container variant="columns">
      <Container variant="left">
        <BorrowingFee />
        <OpenVault />
        {/* <Trove />
        <Stability />
        <Staking /> */}
      </Container>

      <Container variant="middle">
        <OpenedVaults />
        <OpenVault />
        {/* <Trove />
        <Stability />
        <Staking /> */}
      </Container>

      <Container variant="right">
        <ColRatio />
        <OpenVault />
        {/* <SystemStats />
        <PriceManager /> */}
      </Container>
    </Container>
  </Container>
);
