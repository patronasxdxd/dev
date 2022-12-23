import { useState } from "react";
import { Card, Flex, Button, Link, Input, ThemeUICSSProperties } from "theme-ui";
import { StaticAmounts, Row } from "./Trove/Editor";
import { useThreshold } from "../hooks/ThresholdContext";
import { Transaction } from "./Transaction";
import { InfoIcon } from "./InfoIcon";
import { FIRST_ERC20_COLLATERAL } from "../strings";

const editableStyle: ThemeUICSSProperties = {
  backgroundColor: "terciary",
  px: "1.1em",
  py: "0.45em",
  border: 1,
  borderColor: "border",
  borderRadius: 12,
  width: "100%",
  flexGrow: 1,
  mb: [2, 3],
  pl: 3,
  fontSize: 3,
};

type LiquidationManagerProps = {
  version: string
}

export const LiquidationManager = ({ version }: LiquidationManagerProps): JSX.Element => {
  const inputId: string = "liquidate-vaults";
  const { threshold } = useThreshold();
  const [numberOfTrovesToLiquidate, setNumberOfTrovesToLiquidate] = useState("90");
  const [editing, setEditing] = useState<string>();

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
            Liquidate
            <InfoIcon size="sm" tooltip={<Card variant="tooltip">Vaults that fall under the minimum collateral ratio of 110% will be closed (liquidated). The debt of the Vault is canceled and absorbed by the Stability Pool and its collateral distributed among Stability Providers.</Card>} />
          </Flex>
          {FIRST_ERC20_COLLATERAL} Collateral
        </Flex>
        <Flex sx={{
          width: "100%",
          flexDirection: "column",
          flexWrap: "wrap",
          px: ["1em", 0, "1.6em"],
          gap: "0.5em"
        }}>
          {editing === inputId ? (
            <>
              <Row labelId={`${inputId}-label`} {...{ label: "Up to", unit: "Vaults" }} />
              <Input
                type="number"
                min="1"
                step="1"
                value={numberOfTrovesToLiquidate}
                onChange={e => setNumberOfTrovesToLiquidate(e.target.value)}
                onBlur={() => {
                  setEditing(undefined);
                }}
                variant="layout.balanceRow"
                sx={{
                  ...editableStyle,
                  fontWeight: "medium"
                }} 
              />
            </>) 
          : (
            <>
              <Row labelId={`${inputId}-label`} {...{ label: "Up to", unit: "Vaults" }} />
              <StaticAmounts
                sx={{
                  ...editableStyle,
                }}
                labelledBy={`${inputId}-label`}
                onClick={() => setEditing(inputId)}
                {...{ inputId, amount: numberOfTrovesToLiquidate, unit: "Vaults" }}
              />
            </>
          )}
          <Flex sx={{ ml: 2, alignItems: "center" }}>
            <Transaction
              id="batch-liquidate"
              send={overrides => {
                if (!numberOfTrovesToLiquidate) {
                  throw new Error("Invalid number");
                }
                return threshold[version].send.liquidateUpTo(parseInt(numberOfTrovesToLiquidate, 10), overrides);
              }}
            >
              <Button sx={{ width: "100%" }}>Liquidate</Button>
            </Transaction>
          </Flex>
          <Flex sx={{ 
            alignSelf: "center",
            fontSize: 11,
            fontWeight: "body",
            mt: 2
          }}>
            <Link variant="cardLinks" href="https://github.com/Threshold-USD/dev#readme" target="_blank">Read about</Link>
            in the documentation
          </Flex>
        </Flex>
      </Card>
    </Card>
  );
};
