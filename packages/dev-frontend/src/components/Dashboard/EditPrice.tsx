import { Decimal, LiquityStoreState as ThresholdStoreState } from "@liquity/lib-base";
import { useThresholdSelector } from "@liquity/lib-react";
import { useState } from "react";
import { Button, Flex, Input, ThemeUICSSProperties } from "theme-ui";
import { useThreshold } from "../../hooks/ThresholdContext";
import { SystemStat } from "../SystemStat";
import { Transaction } from "../Transaction";

const editableStyle: ThemeUICSSProperties = {
  bg: "white",
  px: "1.1em",
  py: "0.3em",
  border: 1,
  borderColor: "border",
  borderRadius: 8,
  flexGrow: 1,
  pl: 2,
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
    <Flex sx={{ flexDirection: "column", gap: "1rem"}}>
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
              color: "inputText"
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
                width: "0.5rem",
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
