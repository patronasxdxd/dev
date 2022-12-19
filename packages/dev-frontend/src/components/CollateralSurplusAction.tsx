import React, { useEffect } from "react";
import { Button, Flex, Spinner } from "theme-ui";

import { LiquityStoreState as ThresholdStoreState } from "@liquity/lib-base";
import { useLiquitySelector as useThresholdSelector } from "@liquity/lib-react";

import { useThreshold } from "../hooks/ThresholdContext";

import { Transaction, useMyTransactionState } from "./Transaction";
import { useTroveView } from "./Trove/context/TroveViewContext";

const select = ({ collateralSurplusBalance }: ThresholdStoreState) => ({
  collateralSurplusBalance
});

export const CollateralSurplusAction = () => {
  const thresholdSelector = useThresholdSelector(select);
  const { threshold } = useThreshold();

  const myTransactionId = "claim-coll-surplus";
  const myTransactionState = useMyTransactionState(myTransactionId);

  const { dispatchEvent } = useTroveView();

  useEffect(() => {
    if (myTransactionState.type === "confirmedOneShot") {
      // TODO needs to set dynamic versioning
      dispatchEvent("TROVE_SURPLUS_COLLATERAL_CLAIMED", 'v1');
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
        {thresholdSelector &&
          <Transaction
            id={myTransactionId}
            // TODO needs to set dynamic versioning
            send={threshold[0].send.claimCollateralSurplus.bind(threshold, undefined)}
          >
            {/* TODO needs to set dynamic versioning */}
            <Button sx={{ mx: 2 }}>Claim {thresholdSelector['v1'].collateralSurplusBalance.prettify()} ETH</Button>
          </Transaction>
        }
      </Flex>
    ) : null;
};
