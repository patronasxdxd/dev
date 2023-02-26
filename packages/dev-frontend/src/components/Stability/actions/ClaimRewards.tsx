import { Button } from "theme-ui";

import { useThreshold } from "../../../hooks/ThresholdContext";
import { useTransactionFunction } from "../../Transaction";

type ClaimRewardsProps = {
  version: string;
  collateral: string;
  disabled?: boolean;
  children?: React.ReactNode
};

export const ClaimRewards = ({ version, collateral, disabled, children }: ClaimRewardsProps) => {
  const { threshold } = useThreshold();
  const collateralThreshold = threshold.find((versionedThreshold) => {
    return versionedThreshold.version === version && versionedThreshold.collateral === collateral;
  })!;
  
  const send = collateralThreshold.store.send

  const [sendTransaction] = useTransactionFunction(
    "stability-deposit",
    send.withdrawGainsFromStabilityPool.bind(send),
    version,
    collateral
  );

  return (
    <Button onClick={sendTransaction} disabled={disabled}>
      {children}
    </Button>
  );
};
