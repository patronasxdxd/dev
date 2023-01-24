import { RedemptionManager } from "./RedemptionManager";

type RedemptionProps = {
  version: string
  isMintList: boolean
}

export const Redemption = ({ version, isMintList }: RedemptionProps): JSX.Element => {
  return <RedemptionManager version={version} />;
};
