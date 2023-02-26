import { Container } from "theme-ui";
import { PageHeading } from "../components/PageHeading";
import { PageRow } from "../components/PageRow";
import { Stability } from "../components/Stability/Stability";
import { COIN } from "../utils/constants";

export const StabilityPoolPage = (): JSX.Element => {
  return (
    <Container variant="singlePage">
      <PageHeading
        heading="Stability Pool"
        description={`The Stability Pool is the first line of defense in maintaining system solvency. It achieves that by acting as the source of liquidity to repay debt from liquidated Vaults—ensuring that the total ${ COIN } supply always remains backed.`}
        link="https://github.com/Threshold-USD/dev"
        isPoweredByBProtocol={true}
      />
      <PageRow Component={Stability} />
    </Container>
  );
};
