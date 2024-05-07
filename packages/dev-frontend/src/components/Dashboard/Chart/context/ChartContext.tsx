import { createContext, useContext } from "react";
import { Tvl, TimestampsObject } from "./ChartProvider"

type ChartContextType = {
  tvl?: Tvl[];
  timestamps?: Array<TimestampsObject>;
  isUnsupportedNetwork?: boolean;
};

export const ChartContext = createContext<ChartContextType | null>(null);

export const useTvl = async (): Promise<ChartContextType | null> => {
  const context = useContext(ChartContext);
  return context;
};
