import { Container } from "theme-ui";
import { RiskyVaults } from "../components/RiskyVaults";
import { PageHeading } from "../components/PageHeading";
import { PageRow } from "../components/PageRow";
import { LiquidationManager } from "../components/LiquidationManager";

export const RiskyVaultsPage = (): JSX.Element => {
  return <Container variant="singlePage">
      <PageHeading
        heading="Risky Vaults"
        descriptionTitle="Liquidations"
        description="Liquidation is expected to be carried out by bots. Early on you may be able to manually liquidate Troves, but as the system matures this will become less likely."
        link="https://github.com/Threshold-USD/dev"
      />
      <PageRow Component={LiquidationManager} />
      <PageRow Component={RiskyVaults} />
  </Container>
};
