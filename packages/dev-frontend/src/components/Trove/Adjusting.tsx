import React, { useCallback, useEffect, useState, useRef } from "react";
import { Flex, Button, Card, Link } from "theme-ui";
import {
  LiquityStoreState as ThresholdStoreState,
  Decimal,
  Trove,
  THUSD_LIQUIDATION_RESERVE,
  Percent,
  Difference
} from "@liquity/lib-base";
import { useLiquitySelector as useThresholdSelector } from "@liquity/lib-react";

import { useStableTroveChange } from "../../hooks/useStableTroveChange";
import { useValidationState } from "./validation/useValidationState";
import { ActionDescription } from "../ActionDescription";
import { Transaction, useMyTransactionState } from "../Transaction";
import { useThreshold } from "../../hooks/ThresholdContext";
import { TroveAction } from "./TroveAction";
import { useTroveView } from "./context/TroveViewContext";
import { COIN, FIRST_ERC20_COLLATERAL } from "../../strings";
import { InfoIcon } from "../InfoIcon";
import { LoadingOverlay } from "../LoadingOverlay";
import { CollateralRatio } from "./CollateralRatio";
import { EditableRow, StaticRow } from "./Editor";
import { ExpensiveTroveChangeWarning, GasEstimationState } from "./ExpensiveTroveChangeWarning";
import {
  selectForTroveChangeValidation,
  validateTroveChange
} from "./validation/validateTroveChange";

const selector = (state: ThresholdStoreState) => {
  const { trove, fees, price, erc20TokenBalance } = state;
  return {
    trove,
    fees,
    price,
    erc20TokenBalance,
    validationContext: selectForTroveChangeValidation(state)
  };
};

const TRANSACTION_ID = "trove-adjustment";
const APPROVE_TRANSACTION_ID = "trove-approve";

const feeFrom = (original: Trove, edited: Trove, borrowingRate: Decimal): Decimal => {
  const change = original.whatChanged(edited, borrowingRate);

  if (change && change.type !== "invalidCreation" && change.params.borrowTHUSD) {
    return change.params.borrowTHUSD.mul(borrowingRate);
  } else {
    return Decimal.ZERO;
  }
};

const applyUnsavedCollateralChanges = (unsavedChanges: Difference, trove: Trove) => {
  if (unsavedChanges.absoluteValue) {
    if (unsavedChanges.positive) {
      return trove.collateral.add(unsavedChanges.absoluteValue);
    }
    if (unsavedChanges.negative) {
      if (unsavedChanges.absoluteValue.lt(trove.collateral)) {
        return trove.collateral.sub(unsavedChanges.absoluteValue);
      }
    }
    return trove.collateral;
  }
  return trove.collateral;
};

const applyUnsavedNetDebtChanges = (unsavedChanges: Difference, trove: Trove) => {
  if (unsavedChanges.absoluteValue) {
    if (unsavedChanges.positive) {
      return trove.netDebt.add(unsavedChanges.absoluteValue);
    }
    if (unsavedChanges.negative) {
      if (unsavedChanges.absoluteValue.lt(trove.netDebt)) {
        return trove.netDebt.sub(unsavedChanges.absoluteValue);
      }
    }
    return trove.netDebt;
  }
  return trove.netDebt;
};

export const Adjusting: React.FC = () => {
  // TODO
  // const {
  //   threshold: { send: threshold }
  // } = useThreshold();
  const { dispatchEvent } = useTroveView();
  // TODO
  const { trove, fees, price, erc20TokenBalance, validationContext } = useThresholdSelector(1, selector);
  const editingState = useState<string>();
  const previousTrove = useRef<Trove>(trove);
  const [collateral, setCollateral] = useState<Decimal>(trove.collateral);
  const [netDebt, setNetDebt] = useState<Decimal>(trove.netDebt);

  const transactionState = useMyTransactionState(TRANSACTION_ID);
  const borrowingRate = fees.borrowingRate();

  useEffect(() => {
    if (transactionState.type === "confirmedOneShot") {
      dispatchEvent("TROVE_ADJUSTED");
    }
  }, [transactionState.type, dispatchEvent]);

  useEffect(() => {
    if (!previousTrove.current.collateral.eq(trove.collateral)) {
      const unsavedChanges = Difference.between(collateral, previousTrove.current.collateral);
      const nextCollateral = applyUnsavedCollateralChanges(unsavedChanges, trove);
      setCollateral(nextCollateral);
    }
    if (!previousTrove.current.netDebt.eq(trove.netDebt)) {
      const unsavedChanges = Difference.between(netDebt, previousTrove.current.netDebt);
      const nextNetDebt = applyUnsavedNetDebtChanges(unsavedChanges, trove);
      setNetDebt(nextNetDebt);
    }
    previousTrove.current = trove;
  }, [trove, collateral, netDebt]);

  const handleCancelPressed = useCallback(() => {
    dispatchEvent("CANCEL_ADJUST_TROVE_PRESSED");
  }, [dispatchEvent]);

  const isDirty = !collateral.eq(trove.collateral) || !netDebt.eq(trove.netDebt);
  const isDebtIncrease = netDebt.gt(trove.netDebt);
  const debtIncreaseAmount = isDebtIncrease ? netDebt.sub(trove.netDebt) : Decimal.ZERO;

  const fee = isDebtIncrease
    ? feeFrom(trove, new Trove(trove.collateral, trove.debt.add(debtIncreaseAmount)), borrowingRate)
    : Decimal.ZERO;
  const totalDebt = netDebt.add(THUSD_LIQUIDATION_RESERVE).add(fee);
  const maxBorrowingRate = borrowingRate.add(0.005);
  const updatedTrove = isDirty ? new Trove(collateral, totalDebt) : trove;
  const feePct = new Percent(borrowingRate);
  const availableErc20 = erc20TokenBalance;
  const maxCollateral = trove.collateral.add(availableErc20);
  const collateralMaxedOut = collateral.eq(maxCollateral);
  const collateralRatio =
    !collateral.isZero && !netDebt.isZero ? updatedTrove.collateralRatio(price) : undefined;
  const collateralRatioChange = Difference.between(collateralRatio, trove.collateralRatio(price));

  const [troveChange, description] = validateTroveChange(
    trove,
    updatedTrove,
    borrowingRate,
    validationContext
  );

  const stableTroveChange = useStableTroveChange(troveChange);
  const { hasApproved, amountToApprove } = useValidationState(stableTroveChange);

  const [gasEstimationState, setGasEstimationState] = useState<GasEstimationState>({ type: "idle" });

  const isTransactionPending =
    transactionState.type === "waitingForApproval" ||
    transactionState.type === "waitingForConfirmation";

  if (trove.status !== "open") {
    return null;
  }

  return (
    <Card variant="mainCards">
      <Card variant="layout.columns">
        <Flex sx={{
          width: "100%",
          gap: 1,
          pb: "1em",
          borderBottom: 1, 
          borderColor: "border",

        }}>
          Adjusting Vault
          <InfoIcon size="sm" tooltip={<Card variant="tooltip">To mint and borrow { COIN } you must open a vault and deposit a certain amount of collateral ({ FIRST_ERC20_COLLATERAL }) to it.</Card>} />
        </Flex>

        <Flex sx={{
          width: "100%",
          flexDirection: "column",
          px: ["1em", 0, "1.7em"],
          mt: 2
        }}>
          <EditableRow
            label="Collateral"
            inputId="trove-collateral"
            amount={collateral.prettify(4)}
            maxAmount={maxCollateral.toString()}
            maxedOut={collateralMaxedOut}
            editingState={editingState}
            unit={ FIRST_ERC20_COLLATERAL }
            editedAmount={collateral.toString(4)}
            setEditedAmount={(amount: string) => setCollateral(Decimal.from(amount))}
          />

          <EditableRow
            label="Net debt"
            inputId="trove-net-debt-amount"
            amount={netDebt.prettify()}
            unit={COIN}
            editingState={editingState}
            editedAmount={netDebt.toString(2)}
            setEditedAmount={(amount: string) => setNetDebt(Decimal.from(amount))}
          />

          <StaticRow
            label="Liquidation Reserve"
            inputId="trove-liquidation-reserve"
            amount={`${THUSD_LIQUIDATION_RESERVE}`}
            unit={COIN}
            infoIcon={
              <InfoIcon
                tooltip={
                  <Card variant="tooltip" sx={{ width: "200px" }}>
                    An amount set aside to cover the liquidator’s gas costs if your Trove needs to be
                    liquidated. The amount increases your debt and is refunded if you close your Trove
                    by fully paying off its net debt.
                  </Card>
                }
              />
            }
          />

          <StaticRow
            label="Borrowing Fee"
            inputId="trove-borrowing-fee"
            amount={fee.prettify(2)}
            pendingAmount={feePct.toString(2)}
            unit={COIN}
            infoIcon={
              <InfoIcon
                tooltip={
                  <Card variant="tooltip" sx={{ width: "240px" }}>
                    This amount is deducted from the borrowed amount as a one-time fee. There are no
                    recurring fees for borrowing, which is thus interest-free.
                  </Card>
                }
              />
            }
          />

          <StaticRow
            label="Total debt"
            inputId="trove-total-debt"
            amount={totalDebt.prettify(2)}
            unit={COIN}
            infoIcon={
              <InfoIcon
                tooltip={
                  <Card variant="tooltip" sx={{ width: "240px" }}>
                    The total amount of { COIN } your Trove will hold.{" "}
                    {isDirty && (
                      <>
                        You will need to repay {totalDebt.sub(THUSD_LIQUIDATION_RESERVE).prettify(2)}{" "}
                        { COIN } to reclaim your collateral ({THUSD_LIQUIDATION_RESERVE.toString()} { COIN }
                        Liquidation Reserve excluded).
                      </>
                    )}
                  </Card>
                }
              />
            }
          />

          <CollateralRatio value={collateralRatio} change={collateralRatioChange} />

          {description ?? (
            <ActionDescription>
              Adjust your Trove by modifying its collateral, debt, or both.
            </ActionDescription>
          )}

          {hasApproved &&
          (<ExpensiveTroveChangeWarning
            troveChange={stableTroveChange}
            maxBorrowingRate={maxBorrowingRate}
            borrowingFeeDecayToleranceMinutes={60}
            gasEstimationState={gasEstimationState}
            setGasEstimationState={setGasEstimationState}
          />)}

          <Flex variant="layout.actions" sx={{ flexDirection: "column" }}>
            {/* TODO */}
            {/* {!hasApproved && amountToApprove ?
              <Transaction
                id={APPROVE_TRANSACTION_ID}
                send={threshold.approveErc20.bind(threshold, amountToApprove)}
                showFailure="asTooltip"
                tooltipPlacement="bottom"
              >
                <Button>Approve { FIRST_ERC20_COLLATERAL }</Button>
              </Transaction>
            : stableTroveChange ? (
              <TroveAction
                transactionId={TRANSACTION_ID}
                change={stableTroveChange}
                maxBorrowingRate={maxBorrowingRate}
                borrowingFeeDecayToleranceMinutes={60}
              >
                Confirm
              </TroveAction>
            ) : (
              <Button disabled>Confirm</Button>
            )} */}
            <Button variant="cancel" onClick={handleCancelPressed} sx={{ borderRadius: "12px", mt: 3 }}>
              Cancel
            </Button>
            <Flex sx={{ 
              justifyContent: "center",
              fontSize: 11,
              fontWeight: "body",
              mt: "1.5em"
            }}>
              <Link variant="cardLinks" href="https://github.com/Threshold-USD/dev#readme" target="_blank">Read about</Link>
              in the documentation
            </Flex>
          </Flex>
        </Flex>
        {isTransactionPending && <LoadingOverlay />}
      </Card>
    </Card>
  );
};
