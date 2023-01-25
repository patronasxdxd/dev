import { useEffect, useState } from "react";
import { Decimal, TroveChange as VaultChange } from "@liquity/lib-base";

export type ValidVaultChange = Exclude<VaultChange<Decimal>, { type: "invalidCreation" }>;

const paramsEq = (a?: Decimal, b?: Decimal) => (a && b ? a.eq(b) : !a && !b);

const equals = (a: ValidVaultChange, b: ValidVaultChange): boolean => {
  return (
    a.type === b.type &&
    paramsEq(a.params.borrowTHUSD, b.params.borrowTHUSD) &&
    paramsEq(a.params.repayTHUSD, b.params.repayTHUSD) &&
    paramsEq(a.params.depositCollateral, b.params.depositCollateral) &&
    paramsEq(a.params.withdrawCollateral, b.params.withdrawCollateral)
  );
};

export const useStableVaultChange = (
  vaultChange: ValidVaultChange | undefined
): ValidVaultChange | undefined => {
  const [stableVaultChange, setStableVaultChange] = useState(vaultChange);

  useEffect(() => {
    if (!!stableVaultChange !== !!vaultChange) {
      setStableVaultChange(vaultChange);
    } else if (stableVaultChange && vaultChange && !equals(stableVaultChange, vaultChange)) {
      setStableVaultChange(vaultChange);
    }
  }, [stableVaultChange, vaultChange]);

  return stableVaultChange;
};
