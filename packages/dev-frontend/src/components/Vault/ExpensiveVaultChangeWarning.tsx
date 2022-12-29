import { useEffect } from "react";

import { Decimal, TroveChange as VaultChange } from "@liquity/lib-base";
import { PopulatedEthersLiquityTransaction as PopulatedEthersThresholdTransaction } from "@liquity/lib-ethers";

import { useThreshold } from "../../hooks/ThresholdContext";
import { Warning } from "../Warning";

export type GasEstimationState =
  | { type: "idle" | "inProgress" }
  | { type: "complete"; populatedTx: PopulatedEthersThresholdTransaction };

type ExpensiveVaultChangeWarningParams = {
  version: string,
  vaultChange?: Exclude<VaultChange<Decimal>, { type: "invalidCreation" }>;
  maxBorrowingRate: Decimal;
  borrowingFeeDecayToleranceMinutes: number;
  gasEstimationState: GasEstimationState;
  setGasEstimationState: (newState: GasEstimationState) => void;
};

export const ExpensiveVaultChangeWarning = ({
  version,
  vaultChange,
  maxBorrowingRate,
  borrowingFeeDecayToleranceMinutes,
  gasEstimationState,
  setGasEstimationState
}: ExpensiveVaultChangeWarningParams): JSX.Element => {
  const { threshold } = useThreshold();
  useEffect(() => {
    if (vaultChange && vaultChange.type !== "closure") {
      setGasEstimationState({ type: "inProgress" });

      let cancelled = false;

      const timeoutId = setTimeout(async () => {
        const populatedTx = await (vaultChange.type === "creation"
          ? threshold[version].populate.openTrove(vaultChange.params, {
              maxBorrowingRate,
              borrowingFeeDecayToleranceMinutes
            })
          : threshold[version].populate.adjustTrove(vaultChange.params, {
              maxBorrowingRate,
              borrowingFeeDecayToleranceMinutes
            }));

        if (!cancelled) {
          setGasEstimationState({ type: "complete", populatedTx });
          console.log(
            "Estimated TX cost: " +
              Decimal.from(`${populatedTx.rawPopulatedTransaction.gasLimit}`).prettify(0)
          );
        }
      }, 333);

      return () => {
        clearTimeout(timeoutId);
        cancelled = true;
      };
    } else {
      setGasEstimationState({ type: "idle" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vaultChange]);

  if (
    vaultChange &&
    gasEstimationState.type === "complete" &&
    gasEstimationState.populatedTx.gasHeadroom !== undefined &&
    gasEstimationState.populatedTx.gasHeadroom >= 200000
  ) {
    return vaultChange.type === "creation" ? (
      <Warning>
        The cost of opening a Vault in this collateral ratio range is rather high. To lower it,
        choose a slightly different collateral ratio.
      </Warning>
    ) : (
      <Warning>
        The cost of adjusting a Vault into this collateral ratio range is rather high. To lower it,
        choose a slightly different collateral ratio.
      </Warning>
    );
  }

  return <></>;
};
