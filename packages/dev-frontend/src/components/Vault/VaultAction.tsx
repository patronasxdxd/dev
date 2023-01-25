import { Button } from "theme-ui";

import { Decimal, TroveChange as VaultChange } from "@liquity/lib-base";

import { useThreshold } from "../../hooks/ThresholdContext";
import { useTransactionFunction } from "../Transaction";

type VaultActionProps = {
  children: React.ReactNode
  version: string,
  transactionId: string;
  change: Exclude<VaultChange<Decimal>, { type: "invalidCreation" }>;
  maxBorrowingRate: Decimal;
  borrowingFeeDecayToleranceMinutes: number;
};

export const VaultAction = ({
  children,
  version,
  transactionId,
  change,
  maxBorrowingRate,
  borrowingFeeDecayToleranceMinutes
}: VaultActionProps): JSX.Element => {
  const { threshold } = useThreshold();

  const [sendTransaction] = useTransactionFunction(
    transactionId,
    change.type === "creation"
      ? threshold[version].send.openTrove.bind(threshold[version].send, change.params, {
          maxBorrowingRate,
          borrowingFeeDecayToleranceMinutes
        })
      : change.type === "closure"
      ? threshold[version].send.closeTrove.bind(threshold[version].send)
      : threshold[version].send.adjustTrove.bind(threshold[version].send, change.params, {
          maxBorrowingRate,
          borrowingFeeDecayToleranceMinutes
        }),
    version
  );

  return <Button onClick={sendTransaction}>{children}</Button>;
};
