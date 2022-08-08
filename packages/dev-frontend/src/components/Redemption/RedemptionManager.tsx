import React, { useEffect, useState } from "react";
import { Box, Flex, Card, Link } from "theme-ui";

import { Decimal, Percent, LiquityStoreState, MINIMUM_COLLATERAL_RATIO } from "@liquity/lib-base";
import { useLiquitySelector } from "@liquity/lib-react";

import { COIN } from "../../strings";

import { LoadingOverlay } from "../LoadingOverlay";
import { EditableRow, StaticRow } from "../Trove/Editor";
import { ActionDescription, Amount } from "../ActionDescription";
import { ErrorDescription } from "../ErrorDescription";
import { useMyTransactionState } from "../Transaction";

import { RedemptionAction } from "./RedemptionAction";
import { InfoIcon } from "../InfoIcon";

const mcrPercent = new Percent(MINIMUM_COLLATERAL_RATIO).toString(0);

const select = ({ price, fees, total, thusdBalance }: LiquityStoreState) => ({
  price,
  fees,
  total,
  thusdBalance
});

const transactionId = "redemption";

export const RedemptionManager: React.FC = () => {
  const { price, fees, total, thusdBalance } = useLiquitySelector(select);
  const [thusdAmount, setLUSDAmount] = useState(Decimal.ZERO);
  const [changePending, setChangePending] = useState(false);
  const editingState = useState<string>();

  const dirty = !thusdAmount.isZero;
  const ethAmount = thusdAmount.div(price);
  const redemptionRate = fees.redemptionRate(thusdAmount.div(total.debt));
  const feePct = new Percent(redemptionRate);
  const ethFee = ethAmount.mul(redemptionRate);
  const maxRedemptionRate = redemptionRate.add(0.001); // TODO slippage tolerance

  const myTransactionState = useMyTransactionState(transactionId);

  useEffect(() => {
    if (
      myTransactionState.type === "waitingForApproval" ||
      myTransactionState.type === "waitingForConfirmation"
    ) {
      setChangePending(true);
    } else if (myTransactionState.type === "failed" || myTransactionState.type === "cancelled") {
      setChangePending(false);
    } else if (myTransactionState.type === "confirmed") {
      setLUSDAmount(Decimal.ZERO);
      setChangePending(false);
    }
  }, [myTransactionState.type, setChangePending, setLUSDAmount]);

  const [canRedeem, description] = total.collateralRatioIsBelowMinimum(price)
    ? [
        false,
        <ErrorDescription>
          You can't redeem LUSD when the total collateral ratio is less than{" "}
          <Amount>{mcrPercent}</Amount>. Please try again later.
        </ErrorDescription>
      ]
    : thusdAmount.gt(thusdBalance)
    ? [
        false,
        <ErrorDescription>
          The amount you're trying to redeem exceeds your balance by{" "}
          <Amount>
            {thusdAmount.sub(thusdBalance).prettify()} {COIN}
          </Amount>
          .
        </ErrorDescription>
      ]
    : [
        true,
        <ActionDescription>
          You will receive <Amount>{ethAmount.sub(ethFee).prettify(4)} ETH</Amount> in exchange for{" "}
          <Amount>
            {thusdAmount.prettify()} {COIN}
          </Amount>
          .
        </ActionDescription>
      ];

  return (
    <Card variant="mainCards">
      <Card variant="layout.columns">
        <Flex sx={{
            width: "100%",
            gap: 1,
            pb: "1em",
            borderBottom: 1, 
            borderColor: "border"
        }}>
          Redeem
        </Flex>
        
        <Flex sx={{
          width: "100%",
          flexDirection: "column",
          px: ["1em", 0, "1.6em"],
        }}>
          <EditableRow
            label="Redeem"
            inputId="redeem-thusd"
            amount={thusdAmount.prettify()}
            maxAmount={thusdBalance.toString()}
            maxedOut={thusdAmount.eq(thusdBalance)}
            unit={COIN}
            {...{ editingState }}
            editedAmount={thusdAmount.toString(2)}
            setEditedAmount={amount => setLUSDAmount(Decimal.from(amount))}
          />
          <Box sx={{ mt: -3 }}>
            <StaticRow
              label="Redemption Fee"
              inputId="redeem-fee"
              amount={ethFee.toString(4)}
              pendingAmount={feePct.toString(2)}
              unit="ETH"
              infoIcon={
                <InfoIcon
                  tooltip={
                    <Card variant="tooltip" sx={{ minWidth: "240px" }}>
                      The Redemption Fee is charged as a percentage of the redeemed Ether. The Redemption
                      Fee depends on LUSD redemption volumes and is 0.5% at minimum.
                    </Card>
                  }
                />
              }
            />
          </Box>

          {((dirty || !canRedeem) && description) || (
            <ActionDescription>Enter the amount of {COIN} you'd like to redeem.</ActionDescription>
          )}

          <Flex variant="layout.actions">
            <RedemptionAction
              transactionId={transactionId}
              disabled={!dirty || !canRedeem}
              thusdAmount={thusdAmount}
              maxRedemptionRate={maxRedemptionRate}
            />
          </Flex>
          <Flex sx={{ 
            alignSelf: "center",
            fontSize: 11,
            fontWeight: "body",
            mt: 3
          }}>
            <Link variant="cardLinks" href="https://github.com/Threshold-USD/dev#readme" target="_blank">Read about</Link>
            in the documentation
          </Flex>
        </Flex>
        {changePending && <LoadingOverlay />}
      </Card>
    </Card>
  );
};
