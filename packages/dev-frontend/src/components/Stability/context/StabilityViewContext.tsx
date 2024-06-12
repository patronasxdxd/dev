import { createContext, useContext } from "react";
import { StabilityStatus } from "./StabilityViewProvider";
import type { StabilityEvent } from "./types";

type StabilityViewContextType = {
  views: StabilityStatus[];
  dispatchEvent: (event: StabilityEvent, version: string, collateral: string) => void;
};

export const StabilityViewContext = createContext<StabilityViewContextType | null>(null);

export const useStabilityView = (): StabilityViewContextType => {
  const context: StabilityViewContextType | null = useContext(StabilityViewContext);

  if (context === null) {
    throw new Error("You must add a <StabilityViewProvider> into the React tree");
  }

  return context;
};
