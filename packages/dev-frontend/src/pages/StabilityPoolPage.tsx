import { Container } from "theme-ui";
import { SystemStatsCard } from "../components/SystemStatsCard";

export const StabilityPoolPage = (): JSX.Element => {
  return (
    <Container variant="pageRow">
      <Container variant="firstHalf" />
      <Container variant="secondHalf">
        <SystemStatsCard />
      </Container>
    </Container>
  );
};
