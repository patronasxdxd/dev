import { Decimal, LiquityStoreState as ThresholdStoreState} from "@liquity/lib-base";
import { useLiquitySelector as useThresholdSelector} from "@liquity/lib-react";
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

export const useValidationState = (stableTroveChange: ValidTroveChange | undefined): VaultStakeValidation => {
    // TODO
  const { erc20TokenAllowance } = useThresholdSelector(selector)[0];

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
