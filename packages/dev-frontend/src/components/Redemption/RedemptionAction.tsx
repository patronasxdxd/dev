import { Button } from "theme-ui";

import { Decimal } from "@threshold-usd/lib-base";

import { useThreshold } from "../../hooks/ThresholdContext";
import { useTransactionFunction } from "../Transaction";

type RedemptionActionProps = {
  version: string;
  collateral: string;
  transactionId: string;
  disabled?: boolean;
  thusdAmount: Decimal;
  maxRedemptionRate: Decimal;
};

export const RedemptionAction = ({
  version,
  collateral,
  transactionId,
  disabled,
  thusdAmount,
  maxRedemptionRate
}: RedemptionActionProps): JSX.Element => {
  const { threshold } = useThreshold()
  const collateralThreshold = threshold.find((versionedThreshold) => {
    return versionedThreshold.version === version && versionedThreshold.collateral === collateral;
  })!;
  
  const send = collateralThreshold.store.send

  const [sendTransaction] = useTransactionFunction(
    transactionId,
    send.redeemTHUSD.bind(send, thusdAmount, maxRedemptionRate),
    version,
    collateral
  );

  return (
    <Button disabled={disabled} onClick={sendTransaction} sx={{ width: '100%' }}>
      Confirm
    </Button>
  );
};
