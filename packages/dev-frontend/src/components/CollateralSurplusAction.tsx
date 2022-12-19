import React, { useEffect } from "react";
import { Button, Flex, Spinner } from "theme-ui";

import { LiquityStoreState as ThresholdStoreState } from "@liquity/lib-base";
import { useThresholdSelector } from "@liquity/lib-react";

import { useThreshold } from "../hooks/ThresholdContext";

import { Transaction, useMyTransactionState } from "./Transaction";
import { useTroveView } from "./Trove/context/TroveViewContext";

const select = ({ collateralSurplusBalance }: ThresholdStoreState) => ({
  collateralSurplusBalance
});

export const CollateralSurplusAction: React.FC = () => {
  // TODO needs to set dynamic versioning
  const { v1: { collateralSurplusBalance } } = useThresholdSelector(select);
  const {
    threshold: { v1: { send: threshold } }
  } = useThreshold();

  const myTransactionId = "claim-coll-surplus";
  const myTransactionState = useMyTransactionState(myTransactionId);

  const { dispatchEvent } = useTroveView();
  // TODO needs to set dynamic versioning
  useEffect(() => {
    if (myTransactionState.type === "confirmedOneShot") {
      dispatchEvent("TROVE_SURPLUS_COLLATERAL_CLAIMED", "v1");
    }
  }, [myTransactionState.type, dispatchEvent]);

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
      >
        <Button sx={{ mx: 2 }}>Claim {collateralSurplusBalance.prettify()} ETH</Button>
      </Transaction>
    </Flex>
  ) : null;
};
