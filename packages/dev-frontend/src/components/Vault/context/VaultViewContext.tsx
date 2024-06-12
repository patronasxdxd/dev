import { createContext, useContext } from "react";
import type { VaultEvent } from "./types";
import { VaultStatus } from "./VaultViewProvider";

type VaultViewContextType = {
  views: VaultStatus[];
  dispatchEvent: (event: VaultEvent, version: string, collateral: string) => void;
};

export const VaultViewContext = createContext<VaultViewContextType | null>(null);

export const useVaultView = (): VaultViewContextType => {
  const context: VaultViewContextType | null = useContext(VaultViewContext);

  if (context === null) {
    throw new Error("You must add a <VaultViewProvider> into the React tree");
  }

  return context;
};
