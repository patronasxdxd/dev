import { Decimal, LiquityStoreState } from "@liquity/lib-base";
import { useLiquitySelector } from "@liquity/lib-react";
import { ValidTroveChange } from "../../../hooks/useStableTroveChange";

const selector = ({
  erc20TokenAllowance
}: LiquityStoreState) => ({
  erc20TokenAllowance
});

type VaultStakeValidation = {
  hasApproved: boolean;
  amountToApprove?: Decimal;
};

export const useValidationState = (stableTroveChange: ValidTroveChange | undefined): VaultStakeValidation => {
  const { erc20TokenAllowance } = useLiquitySelector(selector);

  const CollateralBN = stableTroveChange?.params.depositCollateral;

  if (CollateralBN) {
    const hasApproved =  !erc20TokenAllowance.isZero && erc20TokenAllowance.gte(CollateralBN);
    const amountToApprove = !hasApproved ? CollateralBN : Decimal.from(0);

    return  {
      hasApproved,
      amountToApprove
    };
  }
  return {
    hasApproved: false
  };
};
