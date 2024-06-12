import { Button } from "theme-ui";

import { Decimal, TroveChange as VaultChange } from "@threshold-usd/lib-base";

import { useThreshold } from "../../hooks/ThresholdContext";
import { useTransactionFunction } from "../Transaction";

type VaultActionProps = {
  children: React.ReactNode
  version: string,
  collateral: string,
  transactionId: string;
  change: Exclude<VaultChange<Decimal>, { type: "invalidCreation" }>;
  maxBorrowingRate: Decimal;
  borrowingFeeDecayToleranceMinutes: number;
};

export const VaultAction = ({
  children,
  version,
  collateral,
  transactionId,
  change,
  maxBorrowingRate,
  borrowingFeeDecayToleranceMinutes
}: VaultActionProps): JSX.Element => {
  const { threshold } = useThreshold()
  const collateralThreshold = threshold.find((versionedThreshold) => {
    return versionedThreshold.version === version && versionedThreshold.collateral === collateral;
  })!;
  
  const send = collateralThreshold.store.send

  const [sendTransaction] = useTransactionFunction(
    transactionId,
    change.type === "creation"
      ? send.openTrove.bind(send, change.params, {
          maxBorrowingRate,
          borrowingFeeDecayToleranceMinutes
        })
      : change.type === "closure"
      ? send.closeTrove.bind(send)
      : send.adjustTrove.bind(send, change.params, {
          maxBorrowingRate,
          borrowingFeeDecayToleranceMinutes
        }),
    version,
    collateral,
  );

  return <Button onClick={sendTransaction}>{children}</Button>;
};
