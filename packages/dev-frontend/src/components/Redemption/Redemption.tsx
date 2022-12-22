import { RedemptionManager } from "./RedemptionManager";

type RedemptionProps = {
  version: string
}

export const Redemption = ({ version }: RedemptionProps): JSX.Element => {
  return <RedemptionManager version={version} />;
};
