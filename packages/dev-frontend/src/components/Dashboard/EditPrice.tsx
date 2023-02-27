import { Decimal, LiquityStoreState as ThresholdStoreState } from "@liquity/lib-base";
import { useThresholdSelector } from "@liquity/lib-react";
import { useState } from "react";
import { Button, Flex, Input, ThemeUICSSProperties } from "theme-ui";
import { useThreshold } from "../../hooks/ThresholdContext";
import { SystemStat } from "../SystemStat";
import { Transaction } from "../Transaction";

const editableStyle: ThemeUICSSProperties = {
  bg: "white",
  py: "0.1em",
  border: 1,
  borderColor: "border",
  borderRadius: 8,
  flexGrow: 1,
  pl: "0.4rem",
  boxShadow: 0
};

type EditPriceProps = {
  version: string
  collateral: string
}

const selector = ({
  price,
  symbol,
}: ThresholdStoreState) => ({
  price,
  symbol,
});

export const EditPrice = ({ version, collateral }: EditPriceProps): JSX.Element => {
  const thresholdSelectorStores = useThresholdSelector(selector);
  const thresholdStore = thresholdSelectorStores.find((store) => {
    return store.version === version && store.collateral === collateral;
  });
  const store = thresholdStore?.store!;
  const symbol = store.symbol;
  const price = store.price;
  
  const { threshold } = useThreshold()
  const collateralThreshold = threshold.find((versionedThreshold) => {
    return versionedThreshold.version === version && versionedThreshold.collateral === collateral;
  })!;
  
  const canSetPrice = collateralThreshold.store.connection._priceFeedIsTestnet
  const [editedPrice, setEditedPrice] = useState(price.toString(2))

  return (
    <Flex sx={{ flexDirection: "column", gridColumn: "span 2", gap: 3 }}>
      <Flex sx={{
        width: "100%",
        gap: 1,
        pb: 2,
        borderBottom: 1,
        borderColor: "border"
      }}>
        { symbol } Price
      </Flex>
      <SystemStat>
        {canSetPrice ? (
          <Flex sx={{ mb:1, alignItems: "center", height: "1.2em", }}>
            <Input
              variant="layout.balanceRow"
              sx={{
              ...editableStyle,
              color: "inputText",
              fontSize: "11px",
              paddingY: "0.3rem"
              }}
              type="number"
              step="any"
              value={editedPrice}
              onChange={e => setEditedPrice(e.target.value)}
            />
            <Transaction
              id="set-price"
              tooltip="Set the collateral price in the testnet"
              tooltipPlacement="bottom"
              send={overrides => {
                if (!editedPrice) {
                  throw new Error("Invalid price");
                }
                return collateralThreshold.store.send.setPrice(Decimal.from(editedPrice), overrides);
              }}
              version={version}
              collateral={collateral}
            >
              <Button sx={{
                ml: 1,
                mr: 2,
                fontSize: "11px",
                width: "0.1rem",
                height: "1rem",
                borderRadius: 6,
                top: 0
              }}>
                Set
              </Button>
            </Transaction>
          </Flex>
        ) : (
          price.toString(2)
        )}
      </SystemStat>
    </Flex>
  );
};
