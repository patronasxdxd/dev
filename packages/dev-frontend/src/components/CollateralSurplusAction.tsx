import React, { useEffect } from "react";
import { Button, Flex, Spinner } from "theme-ui";

import { LiquityStoreState as ThresholdStoreState } from "@liquity/lib-base";
import { useThresholdSelector } from "@liquity/lib-react";

import { useThreshold } from "../hooks/ThresholdContext";

import { Transaction, useMyTransactionState } from "./Transaction";
import { useVaultView } from "./Vault/context/VaultViewContext";

const select = ({ collateralSurplusBalance, symbol }: ThresholdStoreState) => ({
  collateralSurplusBalance, symbol
});

type CollateralSurplusActionProps = {
  version: string
}

export const CollateralSurplusAction = ({ version }: CollateralSurplusActionProps): JSX.Element => {
  const { [version]: { collateralSurplusBalance, symbol } } = useThresholdSelector(select);
  const {
    threshold: { [version]: { send: threshold } }
  } = useThreshold();

  const myTransactionId = "claim-coll-surplus";
  const myTransactionState = useMyTransactionState(myTransactionId);

  const { dispatchEvent } = useVaultView();
  useEffect(() => {
    if (myTransactionState.type === "confirmedOneShot") {
      dispatchEvent("VAULT_SURPLUS_COLLATERAL_CLAIMED", version);
    }
  }, [myTransactionState.type, dispatchEvent, version]);

  return myTransactionState.type === "waitingForApproval" ? (
    <Flex variant="layout.actions">
      <Button disabled sx={{ mx: 2 }}>
        <Spinner sx={{ mr: 2, color: "white" }} size="20px" />
        Waiting for your approval
      </Button>
    </Flex>
  ) : myTransactionState.type !== "waitingForConfirmation" &&
    myTransactionState.type !== "confirmed" ? (
    <Flex variant="layout.actions">
      <Transaction
        id={myTransactionId}
        send={threshold.claimCollateralSurplus.bind(threshold, undefined)}
        version={version}
      >
        <Button sx={{ mx: 2 }}>Claim {collateralSurplusBalance.prettify()} {symbol}</Button>
      </Transaction>
    </Flex>
  ) : <></>;
};
