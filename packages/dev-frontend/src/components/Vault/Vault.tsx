import React from "react";
import { VaultManager } from "./VaultManager";
import { ReadOnlyVault } from "./ReadOnlyVault";
import { NoVault } from "./NoVault";
import { Opening } from "./Opening";
import { Adjusting } from "./Adjusting";
import { RedeemedVault } from "./RedeemedVault";
import { useVaultView } from "./context/VaultViewContext";
import { LiquidatedVault } from "./LiquidatedVault";
import { Decimal } from "@threshold-usd/lib-base";
import { VaultStatus } from "./context/VaultViewProvider";

export type VaultProps = {
  version: string;
  collateral: string;
  isMintList: boolean;
  children?: React.ReactNode;
}

export const Vault = (props: VaultProps): JSX.Element => {
  const { version, collateral } = props;
  const { views } = useVaultView();
  const currentCollateralView = views.find((view) => {
    return view.version === version && view.collateral === collateral;
  });

  switch ((currentCollateralView as VaultStatus).initialView) {
    // loading state not needed, as main app has a loading spinner that blocks render until the threshold backend data is available
    case "ACTIVE": {
      return <ReadOnlyVault {...props} />;
    }
    case "ADJUSTING": {
      return <Adjusting {...props} />;
    }
    case "CLOSING": {
      return <VaultManager {...props} collateralAmount={Decimal.ZERO} debt={Decimal.ZERO} />;
    }
    case "OPENING": {
      return <Opening {...props} />;
    }
    case "LIQUIDATED": {
      return <LiquidatedVault {...props} />;
    }
    case "REDEEMED": {
      return <RedeemedVault {...props} />;
    }
    case "NONE": {
      return <NoVault {...props} />;
    }
  }
};
