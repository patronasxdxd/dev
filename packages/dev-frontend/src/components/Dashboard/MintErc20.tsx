import { LiquityStoreState as ThresholdStoreState } from "@threshold-usd/lib-base";
import { useThresholdSelector } from "@threshold-usd/lib-react";
import { Button, Flex, } from "theme-ui";
import { useThreshold } from "../../hooks/ThresholdContext";
import { SystemStat } from "../SystemStat";
import { Transaction } from "../Transaction";

type MintErc20Props = {
  version: string
  collateral: string
}

const selector = ({
  symbol,
}: ThresholdStoreState) => ({
  symbol,
});

export const MintErc20 = ({ version, collateral }: MintErc20Props): JSX.Element => {
  const thresholdSelectorStores = useThresholdSelector(selector);
  const thresholdStore = thresholdSelectorStores.find((store) => {
    return store.version === version && store.collateral === collateral;
  });
  const store = thresholdStore?.store!;
  const symbol = store.symbol;
  
  const { threshold } = useThreshold()
  const collateralThreshold = threshold.find((versionedThreshold) => {
    return versionedThreshold.version === version && versionedThreshold.collateral === collateral;
  })!;
  const isUsingRealPriceFeed = collateralThreshold.store.connection._useRealPriceFeed

  return (
    <SystemStat>
      {!isUsingRealPriceFeed && symbol === "TST" ? (
        <Flex sx={{ mb: 2, mt: 2, alignItems: "center", height: "1.2em", width: "100%" }}>
          <Transaction
            id="set-price"
            tooltip="Set the collateral price in the testnet"
            tooltipPlacement="bottom"
            send={overrides => {
              return collateralThreshold.store.send.mint(overrides);
            }}
            version={version}
            collateral={collateral}
          >
            <Button sx={{
              ml: 1,
              fontSize: "11px",
              height: "1rem",
              borderRadius: 6,
              top: 0,
              cursor: "pointer"
            }}>
              Mint 100.00 testnet erc20
            </Button>
          </Transaction>
        </Flex>
      ) : (
        <></>
      )}
    </SystemStat>
  );
};