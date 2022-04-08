import React from "react";
import { Container } from "theme-ui";
import { SystemStats } from "../components/SystemStats";
import { Trove } from "../components/Trove/Trove";

export const VaultPage: React.FC = () => {
  return (
    <Container variant="pageColumns" sx={{ mt: 4 }}>
      <Container variant="firstHalf">
        <Trove />
      </Container>

      <Container variant="secondHalf">
        <SystemStats />
      </Container>
    </Container>
  );
};
