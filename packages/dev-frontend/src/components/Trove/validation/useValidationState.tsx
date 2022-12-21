import { Decimal, LiquityStoreState as ThresholdStoreState} from "@liquity/lib-base";
import { useThresholdSelector} from "@liquity/lib-react";
import { ValidTroveChange } from "../../../hooks/useStableTroveChange";

const selector = ({
  erc20TokenAllowance
}: ThresholdStoreState) => ({
  erc20TokenAllowance
});

type VaultStakeValidation = {
  hasApproved: boolean;
  amountToApprove?: Decimal;
};

export const useValidationState = (version: string, stableTroveChange: ValidTroveChange | undefined): VaultStakeValidation => {
  const { [ version ]: { erc20TokenAllowance }} = useThresholdSelector(selector);

  const CollateralBN = stableTroveChange?.params.depositCollateral;

  if (CollateralBN) {
    const hasApproved = !erc20TokenAllowance.isZero && erc20TokenAllowance.gte(CollateralBN);
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
