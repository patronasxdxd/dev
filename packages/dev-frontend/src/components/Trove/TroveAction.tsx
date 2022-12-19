import { Button } from "theme-ui";

import { Decimal, TroveChange } from "@liquity/lib-base";

import { useThreshold } from "../../hooks/ThresholdContext";
import { useTransactionFunction } from "../Transaction";

type TroveActionProps = {
  transactionId: string;
  change: Exclude<TroveChange<Decimal>, { type: "invalidCreation" }>;
  maxBorrowingRate: Decimal;
  borrowingFeeDecayToleranceMinutes: number;
};

export const TroveAction: React.FC<TroveActionProps> = ({
  children,
  transactionId,
  change,
  maxBorrowingRate,
  borrowingFeeDecayToleranceMinutes
}) => {
  // TODO needs to set dynamic versioning
  const { threshold: { v1 } } = useThreshold();

  const [sendTransaction] = useTransactionFunction(
    transactionId,
    change.type === "creation"
      ? v1.send.openTrove.bind(v1.send, change.params, {
          maxBorrowingRate,
          borrowingFeeDecayToleranceMinutes
        })
      : change.type === "closure"
      ? v1.send.closeTrove.bind(v1.send)
      : v1.send.adjustTrove.bind(v1.send, change.params, {
          maxBorrowingRate,
          borrowingFeeDecayToleranceMinutes
        })
  );

  return <Button onClick={sendTransaction}>{children}</Button>;
};
