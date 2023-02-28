import { RedemptionManager } from "./RedemptionManager";

type RedemptionProps = {
  version: string;
  collateral: string;
  isMintList: boolean;
}

export const Redemption = ({ version, collateral, isMintList }: RedemptionProps): JSX.Element => {
  return <RedemptionManager version={version} collateral={collateral} />;
};
