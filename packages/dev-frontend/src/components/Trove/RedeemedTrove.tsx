import React, { useCallback } from "react";
import { Card, Button, Flex, Link } from "theme-ui";
import { CollateralSurplusAction } from "../CollateralSurplusAction";
import { LiquityStoreState as ThresholdStoreState} from "@liquity/lib-base";
import { useThresholdSelector} from "@liquity/lib-react";
import { useTroveView } from "./context/TroveViewContext";
import { COIN, FIRST_ERC20_COLLATERAL } from "../../strings";
import { InfoMessage } from "../InfoMessage";

const select = ({ collateralSurplusBalance }: ThresholdStoreState) => ({
  hasSurplusCollateral: !collateralSurplusBalance.isZero
});

type RedeemedTroveProps = {
  version: string
}

export const RedeemedTrove = ({ version }: RedeemedTroveProps): JSX.Element => {
  const { [version]: { hasSurplusCollateral } } = useThresholdSelector(select);
  const { dispatchEvent } = useTroveView();

  const handleOpenTrove = useCallback(() => {
    dispatchEvent("OPEN_TROVE_PRESSED", version);
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
            Redeemed
          </Flex>
          {FIRST_ERC20_COLLATERAL} Collateral
        </Flex>
          <Flex sx={{
            width: "100%",
            flexDirection: "column",
            px: ["1em", 0, "1.7em"],
            mt: 4
          }}>
          <InfoMessage title="Your Trove has been redeemed.">
            {hasSurplusCollateral
              ? "Please reclaim your remaining collateral before opening a new Trove."
              : `You can borrow ${ COIN } by opening a Trove.`}
          </InfoMessage>
          <Flex variant="layout.actions">
            {hasSurplusCollateral && <CollateralSurplusAction version={version} />}
            {!hasSurplusCollateral && <Button onClick={handleOpenTrove} sx={{ width: "100%" }}>Open Trove</Button>}
          </Flex>
          <Flex sx={{ 
            justifyContent: "center",
            fontSize: 11,
            fontWeight: "body",
            mt: "1.5em"
          }}>
            <Link variant="cardLinks" href="https://github.com/Threshold-USD/dev#readme" target="_blank">
              Read about
            </Link>
            in the documentation
          </Flex>
        </Flex>
      </Card>
    </Card>
  );
};
