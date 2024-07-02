import { Box } from "theme-ui";
import { ErrorDescription } from "./ErrorDescription";
import { Decimal, Percent, LiquityStoreState as ThresholdStoreState } from "@threshold-usd/lib-base";
import { useEffect } from "react";
import { useThresholdSelector } from "@threshold-usd/lib-react";

const selector = ({
  price,
  total,
}: ThresholdStoreState) => ({
  totalCollateralRatio: total.collateralRatio(price)
});


export const Alert = (): JSX.Element => {
  const thresholdSelectorStores = useThresholdSelector(selector);

  return <Box sx={{position: "absolute", top: "80px", right: "20px", zIndex: "10", px: 4}}>
    {
      thresholdSelectorStores.map(({collateral, store}, index) => {
        if (store.totalCollateralRatio.lt(Decimal.from(2))) {
          return <ErrorDescription key={index}>
          The total collateral ratio for {collateral.toUpperCase()} is currently below 200%, approaching the threshold of 150% for Recovery Mode. Please adjust your vault immediately to avoid the risk of liquidation.
        </ErrorDescription>
        }
        return <Box key={index}></Box>
      })
    }
  </Box>
};
