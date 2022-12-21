import React from "react";
import { Box, Card, Container, Heading, Link, Paragraph } from "theme-ui";
import { SystemStatsCard } from "../components/SystemStatsCard";
import { InfoMessage } from "../components/InfoMessage";
import { Vault } from "../components/Trove/Vault";
import { COIN, FIRST_ERC20_COLLATERAL } from "../strings";
import { LiquityStoreState as ThresholdStoreState } from "@liquity/lib-base";
import { useThresholdSelector } from "@liquity/lib-react";

const selector = ({ trove }: ThresholdStoreState) => trove;

export const VaultPage: React.FC = () => {
  const thresholdSelector = useThresholdSelector(selector);
  
  return (
    <Container variant="singlePage">
      <Heading as="h2" sx={{ ml: "1em", mt: "2.5em", fontWeight: "semibold" }}>
        Open a Vault
      </Heading>
      <Card sx={{ mr: [0, "2em"] }}>
        <Box sx={{ px: "2.5em", py: "1.5em" }}>
          <InfoMessage title="About this functionality">
            <Paragraph sx={{ mb: "0.5em" }}>
              To borrow you must open a Vault and deposit a certain amount of collateral ({ FIRST_ERC20_COLLATERAL }) to it. Then you can draw { COIN } up to a collateral ratio of 120%. A minimum debt of 2,000 { COIN } is required.
            </Paragraph>
            <Link variant="infoLink" href="https://github.com/Threshold-USD/dev" target="_blank">
              Read more
            </Link>
          </InfoMessage>
        </Box>
      </Card>
      <Container variant="pageRow">
        {Object.keys(thresholdSelector).map((version, index) => 
          <Box key={index} sx={{ width: ["100%", "100%", "50%"], pr: [0, "1em", "2em"] }}>
            <Vault key={version} vault={thresholdSelector[version]} version={version} />
          </Box>
        )}
        {Object.keys(thresholdSelector).length <= 1 && (
          <Box sx={{ width: ["100%", "100%", "50%"], pr: [0, "1em", "2em"] }}>
            <SystemStatsCard />
          </Box>
        )}
      </Container>
    </Container>
  );
};
