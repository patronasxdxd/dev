import { StabilityDepositManager } from "./StabilityDepositManager";
import { ActiveDeposit } from "./ActiveDeposit";
import { NoDeposit } from "./NoDeposit";
import { useStabilityView } from "./context/StabilityViewContext";
import { StabilityStatus } from "./context/StabilityViewProvider";

export type StabilityProps = {
  version: string;
  collateral: string;
  isMintList: boolean;
  children?: React.ReactNode;
}

export const Stability = (props: StabilityProps): JSX.Element => {
  const { version, collateral } = props;
  const { views } = useStabilityView();
  const currentCollateralView = views.find((view) => {
    return view.version === version && view.collateral === collateral;
  });
  
  switch ((currentCollateralView as StabilityStatus).initialView) {
    case "ACTIVE": {
      return <ActiveDeposit {...props} />;
    }
    case "ADJUSTING": {
      return <StabilityDepositManager {...props} />;
    }
    case "DEPOSITING": {
      return <StabilityDepositManager {...props} />;
    }
    case "NONE": {
      return <NoDeposit {...props} />;
    }
  }
};
