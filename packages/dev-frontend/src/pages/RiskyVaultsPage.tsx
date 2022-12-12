import React from "react";
import { Container, Card, Box, Heading, Link, Paragraph } from "theme-ui";
import { SystemStatsCard } from "../components/SystemStatsCard";
import { LiquidationManager } from "../components/LiquidationManager";
import { RiskyVaults } from "../components/RiskyVaults";
import { InfoMessage } from "../components/InfoMessage";

export const RiskyVaultsPage: React.FC = () => (
  <Container variant="singlePage">
    <Heading as="h2" sx={{ ml: "1em", mt: "2.5em", fontWeight: "semibold" }}>
      Risky Vaults
    </Heading>
    <Card sx={{ mr: [0, "2em"] }}>
      <Box sx={{ px: "2.5em", py: "1.5em" }}>
        <InfoMessage title="Liquidations">
          <Paragraph sx={{ mb: "0.5em" }}>
            Liquidation is expected to be carried out by bots. Early on you may be able to manually liquidate Troves, but as the system matures this will become less likely.
          </Paragraph>
          <Link variant="infoLink" href="https://github.com/Threshold-USD/dev" target="_blank">
            Read more
          </Link>
        </InfoMessage>
      </Box>
    </Card>
    <Container variant="pageRow">
      <Container variant="firstHalf">
        {/* <LiquidationManager /> */}
      </Container>
      <Container variant="secondHalf">
        <SystemStatsCard />
      </Container>
    </Container>
    {/* <RiskyVaults pageSize={10} /> */}
  </Container>
);
