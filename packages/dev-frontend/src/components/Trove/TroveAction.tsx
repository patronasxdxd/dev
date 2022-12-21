import { Button } from "theme-ui";

import { Decimal, TroveChange } from "@liquity/lib-base";

import { useThreshold } from "../../hooks/ThresholdContext";
import { useTransactionFunction } from "../Transaction";

type TroveActionProps = {
  version: string,
  transactionId: string;
  change: Exclude<TroveChange<Decimal>, { type: "invalidCreation" }>;
  maxBorrowingRate: Decimal;
  borrowingFeeDecayToleranceMinutes: number;
};

export const TroveAction: React.FC<TroveActionProps> = ({
  children,
  version,
  transactionId,
  change,
  maxBorrowingRate,
  borrowingFeeDecayToleranceMinutes
}) => {
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
        })
  );

  return <Button onClick={sendTransaction}>{children}</Button>;
};
