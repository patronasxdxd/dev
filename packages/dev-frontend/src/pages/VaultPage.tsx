import { Container } from "theme-ui";
import { Vault } from "../components/Vault/Vault";
import { COIN } from "../utils/constants";
import { PageRow } from "../components/PageRow";
import { PageHeading } from "../components/PageHeading";

export const VaultPage = (): JSX.Element => {  
  return (
    <Container variant="singlePage">
      <PageHeading
        heading="Open a Vault"
        description={
          <>
            <>
              To borrow you must open a Vault and deposit a certain amount of collateral to it. Then you can draw { COIN } up to a collateral ratio of 110%. A minimum debt of 2,000 { COIN } is required.
            </>
            <p>
              <b>Disclaimer: </b> Vaults are at risk of liquidation if the collateral ratio drops below 110% (normal) or 150% (recovery mode).
            </p>
          </>
        }
        link="https://docs.threshold.network/applications/threshold-usd/stability-pool-and-liquidations"
      />
      <PageRow Component={Vault} />
    </Container>
  );
};
