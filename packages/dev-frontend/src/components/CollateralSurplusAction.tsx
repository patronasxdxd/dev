import React, { useEffect } from "react";
import { Button, Flex, Spinner } from "theme-ui";

import { LiquityStoreState as ThresholdStoreState } from "@liquity/lib-base";
import { useThresholdSelector } from "@liquity/lib-react";

import { useThreshold } from "../hooks/ThresholdContext";

import { Transaction, useMyTransactionState } from "./Transaction";
import { useVaultView } from "./Vault/context/VaultViewContext";
import { checkTransactionCollateral } from "../utils/checkTransactionCollateral";

const select = ({ collateralSurplusBalance, symbol }: ThresholdStoreState) => ({
  collateralSurplusBalance, symbol
});

type CollateralSurplusActionProps = {
  version: string
  collateral: string
}

export const CollateralSurplusAction = ({ version, collateral }: CollateralSurplusActionProps): JSX.Element => {
  const thresholdSelectorStores = useThresholdSelector(select);
  const thresholdStore = thresholdSelectorStores.find((store) => {
    return store.version === version && store.collateral === collateral;
  });
  const store = thresholdStore?.store!;
  const collateralSurplusBalance = store.collateralSurplusBalance;
  const symbol = store.symbol;
  
  const { threshold } = useThreshold()
  const collateralThreshold = threshold.find((versionedThreshold) => {
    return versionedThreshold.version === version && versionedThreshold.collateral === collateral;
  })!;
  
  const send = collateralThreshold.store.send

  const myTransactionId = "claim-coll-surplus";
  const myTransactionState = useMyTransactionState(myTransactionId, version, collateral);

  const { dispatchEvent } = useVaultView();

  const isCollateralChecked = checkTransactionCollateral(
    myTransactionState,
    version,
    collateral
  );

  useEffect(() => {
    if (isCollateralChecked && myTransactionState.type === "confirmedOneShot") {
      dispatchEvent("VAULT_SURPLUS_COLLATERAL_CLAIMED", version, collateral);
    }
  }, [isCollateralChecked, myTransactionState.type, dispatchEvent, version, collateral]);

  return isCollateralChecked && myTransactionState.type === "waitingForApproval" ? (
    <Flex variant="layout.actions">
      <Button disabled sx={{ mx: 2 }}>
        <Spinner sx={{ mr: 2, color: "white" }} size="20px" />
        Waiting for your approval
      </Button>
    </Flex>
  ) : isCollateralChecked && myTransactionState.type !== "waitingForConfirmation" &&
    myTransactionState.type !== "confirmed" ? (
    <Flex variant="layout.actions">
      <Transaction
        id={myTransactionId}
        send={send.claimCollateralSurplus.bind(send, undefined)}
        version={version}
        collateral={collateral}
      >
        <Button sx={{ mx: 2 }}>Claim {collateralSurplusBalance.prettify()} {symbol}</Button>
      </Transaction>
    </Flex>
  ) : <></>;
};
