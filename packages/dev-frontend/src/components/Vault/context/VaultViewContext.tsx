import { createContext, useContext } from "react";
import type { VaultView, VaultEvent } from "./types";

type VaultViewContextType = {
  views: Record<string, VaultView>;
  dispatchEvent: (event: VaultEvent, version: string) => void;
};

export const VaultViewContext = createContext<VaultViewContextType | null>(null);

export const useVaultView = (): VaultViewContextType => {
  const context: VaultViewContextType | null = useContext(VaultViewContext);

  if (context === null) {
    throw new Error("You must add a <VaultViewProvider> into the React tree");
  }

  return context;
};
