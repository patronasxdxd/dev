import { Decimal, LiquityStoreState as ThresholdStoreState} from "@liquity/lib-base";
import { useThresholdSelector} from "@liquity/lib-react";
import { ValidVaultChange } from "../../../hooks/useStableVaultChange";

const selector = ({
  erc20TokenAllowance
}: ThresholdStoreState) => ({
  erc20TokenAllowance
});

type VaultStakeValidation = {
  hasApproved: boolean;
  amountToApprove?: Decimal;
};

export const useValidationState = (version: string, collateral: string  , stableVaultChange: ValidVaultChange | undefined): VaultStakeValidation => {
  const thresholdSelectorStores = useThresholdSelector(selector);
  const thresholdStore = thresholdSelectorStores.find((store) => {
    return store.version === version && store.collateral === collateral;
  });
  const store = thresholdStore?.store!;
  const erc20TokenAllowance = store.erc20TokenAllowance;

  const CollateralBN = stableVaultChange?.params.depositCollateral;

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
