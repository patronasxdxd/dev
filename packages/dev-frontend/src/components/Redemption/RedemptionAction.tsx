import { Button } from "theme-ui";

import { Decimal } from "@liquity/lib-base";

import { useThreshold } from "../../hooks/ThresholdContext";
import { useTransactionFunction } from "../Transaction";

type RedemptionActionProps = {
  version: string,
  transactionId: string;
  disabled?: boolean;
  thusdAmount: Decimal;
  maxRedemptionRate: Decimal;
};

export const RedemptionAction = ({
  version,
  transactionId,
  disabled,
  thusdAmount,
  maxRedemptionRate
}: RedemptionActionProps): JSX.Element => {
  const {
    threshold: { [version]: { send: threshold } }
  } = useThreshold();

  const [sendTransaction] = useTransactionFunction(
    transactionId,
    threshold.redeemTHUSD.bind(threshold, thusdAmount, maxRedemptionRate)
  );

  return (
    <Button disabled={disabled} onClick={sendTransaction} sx={{ width: '100%' }}>
      Confirm
    </Button>
  );
};
