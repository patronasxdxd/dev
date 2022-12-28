import { useCallback } from "react";
import { Card, Box, Flex, Button, Link } from "theme-ui";
import { useThresholdSelector} from "@liquity/lib-react";
import { LiquityStoreState as ThresholdStoreState} from "@liquity/lib-base";
import { DisabledEditableRow } from "./Editor";
import { useTroveView } from "./context/TroveViewContext";
import { Icon } from "../Icon";
import { InfoIcon } from "../InfoIcon";
import { COIN } from "../../strings";
import { CollateralRatio } from "./CollateralRatio";

const select = ({ trove, price, symbol }: ThresholdStoreState) => ({ trove, price, symbol });

type ReadOnlyTroveProps = {
version: string
}

export const ReadOnlyTrove = ({ version }: ReadOnlyTroveProps): JSX.Element => {
  const { dispatchEvent } = useTroveView();
  const handleAdjustTrove = useCallback(() => {
    dispatchEvent("ADJUST_TROVE_PRESSED", version);
  }, [dispatchEvent, version]);
  const handleCloseTrove = useCallback(() => {
    dispatchEvent("CLOSE_TROVE_PRESSED", version);
  }, [dispatchEvent, version]);

  const { [version]: { trove, price, symbol } } = useThresholdSelector(select);

  return (
    <Card variant="mainCards">
      <Card variant="layout.columns">
        <Flex sx={{
          width: "100%",
          gap: 1,
          pb: "1em",
          borderBottom: 1, 
          borderColor: "border",
        }}>
          Opened Vault
          <InfoIcon size="sm" tooltip={<Card variant="tooltip">To mint and borrow { COIN } you must open a vault and deposit a certain amount of collateral ({ symbol }) to it.</Card>} />
        </Flex>
        <Flex sx={{
          width: "100%",
          flexDirection: "column",
          px: ["1em", 0, "1.7em"],
          mt: 2
        }}>
          <Box>
            <DisabledEditableRow
              label="Collateral"
              inputId="trove-collateral"
              amount={trove.collateral.prettify(4)}
              unit={ symbol }
            />

            <DisabledEditableRow
              label="Debt"
              inputId="trove-debt"
              amount={trove.debt.prettify()}
              unit={ COIN }
            />

            <CollateralRatio value={trove.collateralRatio(price)} sx={{ mt: -3 }} />
          </Box>
          <Flex variant="layout.actions" sx={{ flexDirection: "column" }}>
            <Button onClick={handleAdjustTrove}>
              <Icon name="pen" size="sm" />
              &nbsp;Adjust
            </Button>
            <Button variant="outline" onClick={handleCloseTrove} sx={{ borderRadius: "12px", mt: 3 }}>
              Close Trove
            </Button>
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
