import { Container } from "theme-ui";
import { Vaults } from "../components/Vaults";
import { PageHeading } from "../components/PageHeading";
import { PageRow } from "../components/PageRow";
import { LiquidationManager } from "../components/LiquidationManager";

export const VaultsPage = (): JSX.Element => {
  return <Container variant="singlePage">
      <PageHeading
        heading="Vaults"
        descriptionTitle="Liquidations"
        description="Liquidation is expected to be carried out by bots. Early on you may be able to manually liquidate Vaults, but as the system matures this will become less likely."
        link="https://docs.threshold.network/applications/threshold-usd/stability-pool-and-liquidations"
      />
      <PageRow Component={LiquidationManager} />
      <PageRow isWidthFull={true} Component={Vaults} />
  </Container>
};
