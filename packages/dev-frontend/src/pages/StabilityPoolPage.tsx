import React from "react";
import { Container } from "theme-ui";
import { SystemStats } from "../components/SystemStats";
import { Stability } from "../components/Stability/Stability";

export const StabilityPoolPage: React.FC = () => {
  return (
    <Container variant="pageColumns">
      <Container variant="firstHalf">
        <Stability />
      </Container>

      <Container variant="secondHalf">
        <SystemStats />
      </Container>
    </Container>
  );
};
