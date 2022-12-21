import React from "react";
import { TroveManager } from "./TroveManager";
import { ReadOnlyTrove } from "./ReadOnlyTrove";
import { NoTrove } from "./NoTrove";
import { Opening } from "./Opening";
import { Adjusting } from "./Adjusting";
import { RedeemedTrove } from "./RedeemedTrove";
import { useTroveView } from "./context/TroveViewContext";
import { LiquidatedTrove } from "./LiquidatedTrove";
import { Decimal,  UserTrove } from "@liquity/lib-base";

export type VaultProps = {
  vault: UserTrove
  version: string 
  children?: React.ReactNode
}

export const Vault = (props: VaultProps): JSX.Element => {
  const { version } = props;
  const { views } = useTroveView();

  switch (views[version]) {
    // loading state not needed, as main app has a loading spinner that blocks render until the threshold backend data is available
    case "ACTIVE": {
      return <ReadOnlyTrove {...props} version={version} />;
    }
    case "ADJUSTING": {
      return <Adjusting {...props} version={version} />;
    }
    case "CLOSING": {
      return <TroveManager {...props} collateral={Decimal.ZERO} debt={Decimal.ZERO} version={version} />;
    }
    case "OPENING": {
      return <Opening {...props} version={version} />;
    }
    case "LIQUIDATED": {
      return <LiquidatedTrove {...props} version={version} />;
    }
    case "REDEEMED": {
      return <RedeemedTrove {...props} version={version} />;
    }
    case "NONE": {
      return <NoTrove {...props} version={version} />;
    }
  }
};
