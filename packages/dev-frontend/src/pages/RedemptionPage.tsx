import React from "react";
import { Box, Card, Container, Heading, Link, Paragraph } from "theme-ui";
import { SystemStatsCard } from "../components/SystemStatsCard";
import { Redemption } from "../components/Redemption/Redemption";
import { InfoMessage } from "../components/InfoMessage";

export const RedemptionPage: React.FC = () => {
  return (
    <Container variant="singlePage">
      <Heading as="h2" sx={{ ml: "1em", mt: "2.5em", fontWeight: "semibold" }}>
        Redeem
      </Heading>
      <Card sx={{ mr: [0, "2em"] }}>
        <Box sx={{ px: "2.5em", py: "1.5em" }}>
          <InfoMessage title="About this functionality">
            <Paragraph sx={{ mb: "0.5em" }}>
              Redemptions are expected to be carried out by bots when arbitrage opportunities emerge.
            </Paragraph>
            <Paragraph sx={{ mb: "0.5em" }}>
              Most of the time you will get a better rate for converting thUSD to tBTC on Uniswap  or other exchanges.
            </Paragraph>
            <Paragraph sx={{ mb: "0.5em" }}>
            Note: Redemption is not for repaying your loan. To repay your loan, adjust your Trove on the Dashboard.
            </Paragraph>
            <Link variant="infoLink" href="https://github.com/Threshold-USD/dev" target="_blank">
              Read more
            </Link>
          </InfoMessage>
        </Box>
      </Card>
      <Container variant="pageRow">
        <Container variant="firstHalf">
          <Redemption />
        </Container>
        <Container variant="secondHalf">
          <SystemStatsCard />
        </Container>
      </Container>
    </Container>
  );
};
