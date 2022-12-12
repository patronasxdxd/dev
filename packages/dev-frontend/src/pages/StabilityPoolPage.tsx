import React from "react";
import { Container } from "theme-ui";
import { SystemStatsCard } from "../components/SystemStatsCard";

export const StabilityPoolPage: React.FC = () => {
  return (
    <Container variant="pageRow">
      <Container variant="firstHalf" />
      <Container variant="secondHalf">
        <SystemStatsCard />
      </Container>
    </Container>
  );
};
