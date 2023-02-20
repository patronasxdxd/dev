import { useMemo } from "react";
import { Card } from "theme-ui";
import { Percent, LiquityStoreState, Decimal } from "@liquity/lib-base";
import { useThresholdSelector } from "@liquity/lib-react";

import { TopCard } from "./TopCard";

type BorrowingFeeProps = {
  variant?: string;
};

const select = ({ borrowingRate }: LiquityStoreState) => ({
  borrowingRate,
});

export const BorrowingFee = ({ variant = "mainCards" }: BorrowingFeeProps): JSX.Element => {
  // Get the selected threshold stores using `useThresholdSelector`
  const thresholdSelectorStores = useThresholdSelector(select);

  // Compute `borrowingRates` array from `thresholdSelectorStores` using `useMemo` and memoize its value
  const borrowingRates = useMemo(() => {
    // If there are no selected threshold stores, return an empty array
    if (!thresholdSelectorStores) return [];

    // Map each threshold store to a `CollateralBorrowingRate` object
    return thresholdSelectorStores.map((thresholdStore) => ({
      version: thresholdStore.version,
      collateral: thresholdStore.collateral,
      collateralBorrowingRate: thresholdStore.store?.borrowingRate || Decimal.from(0),
    }));
  }, [thresholdSelectorStores]);

  // Compute `borrowingFeeAvgPct` from `borrowingRates` using `useMemo` and memoize its value
  const borrowingFeeAvgPct = useMemo(() => {
    // If `borrowingRates` is empty, return null
    if (borrowingRates.length === 0) return null;

    // Compute the total borrowing rate by adding up the `collateralBorrowingRate` of each `CollateralBorrowingRate` object in `borrowingRates`
    const totalBorrowingRate = borrowingRates.reduce(
      (total, { collateralBorrowingRate }) => total.add(collateralBorrowingRate),
      Decimal.from(0)
    );

    // Compute the average borrowing fee percentage from `totalBorrowingRate` and the length of `borrowingRates`
    const borrowingFeeAvg = totalBorrowingRate.div(Decimal.from(borrowingRates.length));
    return new Percent(borrowingFeeAvg);
  }, [borrowingRates]);

  // Render the `BorrowingFee` component with the computed `borrowingFeeAvgPct` value
  return (
    <Card {...{ variant }} sx={{ display: ["none", "block"], width: "100%" }}>
      <TopCard
        name={thresholdSelectorStores.length > 1 ? "Borrowing Fee Avg." : "Borrowing Fee"}
        tooltip="The Borrowing Fee is a one-off fee charged as a percentage of the borrowed amount, and is part of a Vault's debt."
        imgSrc="./icons/borrowing-fee.svg"
      >
        {borrowingFeeAvgPct ? borrowingFeeAvgPct.toString(2) : null}
      </TopCard>
    </Card>
  );
};
