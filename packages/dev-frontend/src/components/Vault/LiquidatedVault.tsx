import { useCallback } from "react";
import { Card, Button, Flex, Link } from "theme-ui";
import { CollateralSurplusAction } from "../CollateralSurplusAction";
import { LiquityStoreState as ThresholdStoreState} from "@liquity/lib-base";
import { useThresholdSelector} from "@liquity/lib-react";
import { useVaultView } from "./context/VaultViewContext";
import { COIN } from "../../strings";
import { InfoMessage } from "../InfoMessage";

const select = ({ collateralSurplusBalance, symbol }: ThresholdStoreState) => ({
  hasSurplusCollateral: !collateralSurplusBalance.isZero,
  symbol
});

type LiquidatedVaultProps = {
  version: string
}

export const LiquidatedVault = ({ version }: LiquidatedVaultProps): JSX.Element => {
  const { [version]: { hasSurplusCollateral, symbol } } = useThresholdSelector(select);
  const { dispatchEvent } = useVaultView();

  const handleOpenVault = useCallback(() => {
    dispatchEvent("OPEN_VAULT_PRESSED", version);
  }, [dispatchEvent, version]);

  return (
    <Card variant="mainCards">
      <Card variant="layout.columns">
        <Flex sx={{
          justifyContent: "space-between",
          width: "100%",
          gap: 1,
          pb: "1em",
          borderBottom: 1, 
          borderColor: "border"
        }}>
          <Flex sx={{ gap: 1 }}>
            Liquidated Vault
          </Flex>
          {symbol} Collateral
        </Flex>
        <Flex sx={{
          width: "100%",
          flexDirection: "column",
          px: ["1em", 0, "1.7em"],
          mt: 4
        }}>
          <InfoMessage title="Your Vault has been liquidated.">
            {hasSurplusCollateral
              ? "Please reclaim your remaining collateral before opening a new Vault."
              : `You can borrow ${ COIN } by opening a Vault.`}
          </InfoMessage>

          <Flex variant="layout.actions">
            {hasSurplusCollateral && <CollateralSurplusAction version={version} />}
            {!hasSurplusCollateral && <Button onClick={handleOpenVault} sx={{ width: "100%" }}>Open Vault</Button>}
          </Flex>
          <Flex sx={{ 
            justifyContent: "center",
            fontSize: 11,
            fontWeight: "body",
            mt: "1.5em"
          }}>
            <Link variant="cardLinks" href="https://github.com/Threshold-USD/dev#readme" target="_blank">Read about</Link>
            in the documentation
          </Flex>
        </Flex>
      </Card>
    </Card>
  );
};
