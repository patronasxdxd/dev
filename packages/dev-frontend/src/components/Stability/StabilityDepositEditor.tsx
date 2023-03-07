import React, { useState } from "react";
import { Card, Flex } from "theme-ui";
import { ActionDescription } from "../ActionDescription";

import {
  selectForStabilityDepositChangeValidation,
  validateStabilityDepositChange
} from "./validation/validateStabilityDepositChange";

import { useMyTransactionState } from "../Transaction";
import {
  Decimal,
  Decimalish,
  BammDeposit,
  LiquityStoreState as ThresholdStoreState,
  Difference
} from "@liquity/lib-base";

import { useThresholdSelector } from "@liquity/lib-react";

import { COIN } from "../../utils/constants";

import { EditableRow, StaticRow } from "../Vault/Editor";
import { LoadingOverlay } from "../LoadingOverlay";
import { InfoIcon } from "../InfoIcon";
import { checkTransactionCollateral } from "../../utils/checkTransactionCollateral";

const select = ({ thusdBalance, thusdInStabilityPool, bammDeposit, symbol }: ThresholdStoreState) => ({
  thusdBalance,
  thusdInStabilityPool,
  bammDeposit,
  symbol
});

type StabilityDepositEditorProps = {
  version: string;
  collateral: string;
  isMintList: boolean;
  originalDeposit: BammDeposit;
  editedUSD: Decimal;
  changePending: boolean;
  dispatch: (action: { type: "setDeposit"; newValue: Decimalish } | { type: "revert" }) => void;
  children?: React.ReactNode
};

export const StabilityDepositEditor = ({
  version,
  collateral,
  isMintList,
  originalDeposit,
  editedUSD,
  changePending,
  dispatch,
  children
}: StabilityDepositEditorProps): JSX.Element => {
  const thresholdSelectorStores = useThresholdSelector(select);
  const thresholdStore = thresholdSelectorStores.find((store) => {
    return store.version === version && store.collateral === collateral;
  });
  const store = thresholdStore?.store!;
  const thusdBalance = store.thusdBalance;
  const thusdInStabilityPool = store.thusdInStabilityPool;
  const bammDeposit = store.bammDeposit;
  const collateralSymbol = store.symbol;

  const editingState = useState<string>();
  const validationContextStores = useThresholdSelector(selectForStabilityDepositChangeValidation);
  const validationContextStore = validationContextStores.find((store) => {
    return store.version === version && store.collateral === collateral;
  });

  const maxAmount = bammDeposit.currentUSD.add(thusdBalance);
  const maxedOut = editedUSD.eq(maxAmount);

  const originalPoolShare = originalDeposit.currentTHUSD.mulDiv(100, thusdInStabilityPool);

  const { bammPoolShare } = bammDeposit;

  const userTotalUsdInBamm = bammDeposit.currentUSD
  const totalUsdInBamm = userTotalUsdInBamm.mulDiv(100, bammPoolShare);
  const editedUserUsd = userTotalUsdInBamm.sub(bammDeposit.currentUSD).add(editedUSD);
  const editedTotalUsdInBamm = totalUsdInBamm.infinite ? Decimal.from(0) : totalUsdInBamm.sub(bammDeposit.currentUSD).add(editedUSD);
  const editedBammPoolShare = editedTotalUsdInBamm.nonZero ? editedUserUsd.mulDiv(100, editedTotalUsdInBamm) : Decimal.from(0)

  /* USD balance
  ====================================================================*/
  const usdDiff = Difference.between(editedUSD, bammDeposit.currentUSD)

  const bammPoolShareChange =
  bammDeposit.currentUSD.nonZero &&
    Difference.between(editedBammPoolShare, bammPoolShare).nonZero;

  let newTotalThusd, newTotalCollateral;
  if(bammPoolShareChange && (!bammPoolShareChange?.nonZero || bammPoolShareChange?.positive)){
    newTotalThusd = bammDeposit.totalThusdInBamm.add(Decimal.from(usdDiff.absoluteValue||0));
    newTotalCollateral = bammDeposit.totalCollateralInBamm;
  } else {
    newTotalThusd = bammDeposit.totalThusdInBamm.mul((editedTotalUsdInBamm.div(totalUsdInBamm)))
    newTotalCollateral = bammDeposit.totalCollateralInBamm.mul((editedTotalUsdInBamm.div(totalUsdInBamm)))
  }

  const allowanceTxState = useMyTransactionState("bamm-unlock");
  const isCollateralChecked = checkTransactionCollateral(
    useMyTransactionState,
    version,
    collateral
  );

  const waitingForTransaction = isCollateralChecked &&
    (allowanceTxState.type === "waitingForApproval" ||
    allowanceTxState.type === "waitingForConfirmation");

  /* Collateral balance
  ====================================================================*/
  const newCollateralBalance = editedBammPoolShare.mul(newTotalCollateral).div(100)
  const collateralDiff = Difference.between(newCollateralBalance, bammDeposit.collateralGain).nonZero

  /* THUSD balance
  ====================================================================*/
  const newThusdBalance = editedBammPoolShare.mul(newTotalThusd).div(100)
  const thusdDiff = Difference.between(newThusdBalance, bammDeposit.currentTHUSD).nonZeroish(15)
  
  const [, description] = validateStabilityDepositChange(
    version,
    collateral,
    isMintList,
    originalDeposit,
    editedUSD,
    validationContextStore?.store!,
    thusdDiff,
    collateralDiff,
  );
  const makingNewDeposit = originalDeposit.isEmpty;

  /* pool share
  ====================================================================*/
  const thusdInStabilityPoolAfterChange = thusdInStabilityPool
    .add(newTotalThusd)
    .sub(bammDeposit.totalThusdInBamm);

  const newPoolShare = (newTotalThusd.mulDiv(editedBammPoolShare, 100)).mulDiv(100, thusdInStabilityPoolAfterChange);
  const poolShareChange =
    originalDeposit.currentTHUSD.nonZero &&
    Difference.between(newPoolShare, originalPoolShare).nonZero;

  const collateralDiffInUsd = bammDeposit.currentUSD.sub(bammDeposit.currentTHUSD)
  const collateralIsImportant = (collateralDiffInUsd.div(bammDeposit.currentUSD)).gt(1/1000)

  const showOverlay = changePending || waitingForTransaction
  return (
    <Card variant="mainCards">
      <Card variant="layout.columns">
      <Flex sx={{
          justifyContent: "space-between",
          width: "100%",
          gap: 1,
          pb: "1em",
          px: ["2em", 0],
          borderBottom: 1, 
          borderColor: "border"
        }}>
          <Flex sx={{ gap: 1 }}>
            Stability Pool
          </Flex>
          { collateralSymbol } Collateral
        </Flex>
        <Flex sx={{
          width: "100%",
          flexDirection: "column",
          px: ["1em", 0, "1.7em"],
          pb: "1em",
          mt: 2
        }}>
          <EditableRow
            label="Deposit"
            inputId="deposit-thusd"
            amount={editedUSD.prettify()}
            maxAmount={maxAmount.toString()}
            maxedOut={maxedOut}
            unit={COIN}
            {...{ editingState }}
            editedAmount={editedUSD.toString(2)}
            setEditedAmount={newValue => dispatch({ type: "setDeposit", newValue })}
          />
          {!originalDeposit.isEmpty && (
            <>
            <Flex sx={{ justifyContent: 'space-between', flexWrap: "wrap" }}>
              <StaticRow
                  label={`${COIN} balance`}
                  inputId="deposit-gain"
                  amount={newThusdBalance.prettify(2)}
                  unit={COIN}
                  pendingAmount={thusdDiff?.prettify(2).concat(COIN)}
                  pendingColor={thusdDiff?.positive ? "success" : "danger"}
              />

              {collateralIsImportant && <StaticRow
                label={`${collateralSymbol} balance`}
                inputId="deposit-gain"
                amount={newCollateralBalance.prettify(4)}
                unit={collateralSymbol}
                pendingAmount={collateralDiff?.prettify(4).concat(collateralSymbol)}
                pendingColor={collateralDiff?.positive ? "success" : "danger"}
                infoIcon={
                  <InfoIcon
                    tooltip={
                      <Card variant="tooltip" sx={{ width: "240px" }}>
                      Temporary {collateralSymbol} balance until rebalance takes place
                      </Card>
                    }
                  />
                }
              />
            }
            </Flex>
            {newPoolShare.infinite ? (
              <StaticRow label="Pool share" inputId="deposit-share" amount="N/A" />
            ) : (
              <StaticRow
                label="Pool share"
                inputId="deposit-share"
                amount={newPoolShare.prettify(4)}
                pendingAmount={poolShareChange?.prettify(4).concat("%")}
                pendingColor={poolShareChange?.positive ? "success" : "danger"}
                unit="%"
              />
            )}
            <div className="hide" >
              {bammPoolShare.infinite ? (
                <StaticRow label="BAMM Pool share" inputId="deposit-share" amount="N/A" />
              ) : (
                <StaticRow
                  label="BAMM Pool share"
                  inputId="deposit-share"
                  amount={editedBammPoolShare.prettify(4)}
                  pendingAmount={bammPoolShareChange?.prettify(4).concat("%")}
                  pendingColor={bammPoolShareChange?.positive ? "success" : "danger"}
                  unit="%"
                />
              )}
            </div>
            </>
          )}
          {description ??
            (makingNewDeposit ? (
              <ActionDescription>Enter the amount of {COIN} you'd like to deposit.</ActionDescription>
            ) : (
              <ActionDescription>Adjust the {COIN} amount to deposit or withdraw.</ActionDescription>
            ))}
          {children}
        </Flex>
        {showOverlay && <LoadingOverlay />}
      </Card>
    </Card>
  );
};
