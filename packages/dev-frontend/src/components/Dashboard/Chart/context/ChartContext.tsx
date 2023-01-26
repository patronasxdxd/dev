import { createContext, useContext } from "react";
import { tvlData, TimestampsObject } from "./ChartProvider"

type ChartContextType = {
  tvl: Array<tvlData>;
  timestamps: Array<TimestampsObject>;
};

export const ChartContext = createContext<ChartContextType | null>(null);

export const useTvl = async (): Promise<ChartContextType | null> => {
  const context: ChartContextType | null = useContext(ChartContext);
  
  return context;
};
