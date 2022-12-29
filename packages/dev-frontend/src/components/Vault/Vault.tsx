import React from "react";
import { VaultManager } from "./VaultManager";
import { ReadOnlyVault } from "./ReadOnlyVault";
import { NoVault } from "./NoVault";
import { Opening } from "./Opening";
import { Adjusting } from "./Adjusting";
import { RedeemedVault } from "./RedeemedVault";
import { useVaultView } from "./context/VaultViewContext";
import { LiquidatedVault } from "./LiquidatedVault";
import { Decimal } from "@liquity/lib-base";

export type VaultProps = {
  version: string 
  children?: React.ReactNode
}

export const Vault = (props: VaultProps): JSX.Element => {
  const { version } = props;
  const { views } = useVaultView();

  switch (views[version]) {
    // loading state not needed, as main app has a loading spinner that blocks render until the threshold backend data is available
    case "ACTIVE": {
      return <ReadOnlyVault {...props} version={version} />;
    }
    case "ADJUSTING": {
      return <Adjusting {...props} version={version} />;
    }
    case "CLOSING": {
      return <VaultManager {...props} collateral={Decimal.ZERO} debt={Decimal.ZERO} version={version} />;
    }
    case "OPENING": {
      return <Opening {...props} version={version} />;
    }
    case "LIQUIDATED": {
      return <LiquidatedVault {...props} version={version} />;
    }
    case "REDEEMED": {
      return <RedeemedVault {...props} version={version} />;
    }
    case "NONE": {
      return <NoVault {...props} version={version} />;
    }
  }
};
