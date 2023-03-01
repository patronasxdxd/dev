import React from "react";
import { Button } from "theme-ui";
import { useThreshold } from "../../../hooks/ThresholdContext";
import { useTransactionFunction } from "../../Transaction";

type ClaimAndMoveProps = {
  version: string;
  collateral: string;
  disabled?: boolean;
  children?: React.ReactNode
};

export const ClaimAndMove= ({ version, collateral, disabled, children }: ClaimAndMoveProps): JSX.Element => {
  const { threshold } = useThreshold();
  const collateralThreshold = threshold.find((versionedThreshold) => {
    return versionedThreshold.version === version && versionedThreshold.collateral === collateral;
  })!;
  
  const send = collateralThreshold.store.send


  const [sendTransaction] = useTransactionFunction(
    "stability-deposit",
    send.transferBammCollateralGainToTrove.bind(send),
    version,
    collateral
  );

  return (
    <Button
      variant="outline"
      sx={{ mt: 3, width: "100%" }}
      onClick={sendTransaction}
      disabled={disabled}
    >
      {children}
    </Button>
  );
};
