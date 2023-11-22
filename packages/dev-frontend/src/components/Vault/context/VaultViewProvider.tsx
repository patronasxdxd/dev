import React, { useState, useCallback, useEffect, useRef } from "react";
import { useThresholdSelector} from "@threshold-usd/lib-react";
import { LiquityStoreState as ThresholdStoreState, UserTroveStatus as UserVaultStatus } from "@threshold-usd/lib-base";
import { VaultViewContext } from "./VaultViewContext";
import type { VaultView, VaultEvent } from "./types";

type VaultEventTransitions = Record<VaultView, Partial<Record<VaultEvent, VaultView>>>;

const transitions: VaultEventTransitions = {
  NONE: {
    OPEN_VAULT_PRESSED: "OPENING",
    VAULT_OPENED: "ACTIVE"
  },
  LIQUIDATED: {
    OPEN_VAULT_PRESSED: "OPENING",
    VAULT_SURPLUS_COLLATERAL_CLAIMED: "NONE",
    VAULT_OPENED: "ACTIVE"
  },
  REDEEMED: {
    OPEN_VAULT_PRESSED: "OPENING",
    VAULT_SURPLUS_COLLATERAL_CLAIMED: "NONE",
    VAULT_OPENED: "ACTIVE"
  },
  OPENING: {
    CANCEL_ADJUST_VAULT_PRESSED: "NONE",
    VAULT_OPENED: "ACTIVE"
  },
  ADJUSTING: {
    CANCEL_ADJUST_VAULT_PRESSED: "ACTIVE",
    VAULT_ADJUSTED: "ACTIVE",
    VAULT_CLOSED: "NONE",
    VAULT_LIQUIDATED: "LIQUIDATED",
    VAULT_REDEEMED: "REDEEMED"
  },
  CLOSING: {
    CANCEL_ADJUST_VAULT_PRESSED: "ACTIVE",
    VAULT_CLOSED: "NONE",
    VAULT_ADJUSTED: "ACTIVE",
    VAULT_LIQUIDATED: "LIQUIDATED",
    VAULT_REDEEMED: "REDEEMED"
  },
  ACTIVE: {
    ADJUST_VAULT_PRESSED: "ADJUSTING",
    CLOSE_VAULT_PRESSED: "CLOSING",
    VAULT_CLOSED: "NONE",
    VAULT_LIQUIDATED: "LIQUIDATED",
    VAULT_REDEEMED: "REDEEMED"
  }
};

type VaultStateEvents = Partial<Record<UserVaultStatus, VaultEvent>>;

const vaultStatusEvents: VaultStateEvents = {
  open: "VAULT_OPENED",
  closedByOwner: "VAULT_CLOSED",
  closedByLiquidation: "VAULT_LIQUIDATED",
  closedByRedemption: "VAULT_REDEEMED"
};

const transition = (view: VaultView, event: VaultEvent): VaultView => {
  const nextView = transitions[view][event] ?? view;
  return nextView;
};

const getInitialView = (vaultStatus: UserVaultStatus): VaultView => {
  if (vaultStatus === "closedByLiquidation") {
    return "LIQUIDATED";
  }
  if (vaultStatus === "closedByRedemption") {
    return "REDEEMED";
  }
  if (vaultStatus === "open") {
    return "ACTIVE";
  }
  return "NONE";
};

const select = ({ trove } : ThresholdStoreState) => trove;

type VaultViewProps = {
  loader: React.ReactNode;
  children: React.ReactNode;
};

export type VaultStatus = {
  version: string;
  collateral: string;
  initialView: VaultView;
};

export const VaultViewProvider = ({
  loader,
  children
}: VaultViewProps): JSX.Element => {
  const thresholdSelectorStores = useThresholdSelector(select);
  const [views, setViews] = useState<VaultStatus[]>([]);
  const [isMounted, setIsMounted] = useState<boolean>(true);

  useEffect(() => {
    if (!thresholdSelectorStores || !isMounted) {
      return
    }
    let vaultsInitialStatus: VaultStatus[] = []
    for (const thresholdSelectorStore of thresholdSelectorStores) {
      const store = thresholdSelectorStore?.store!;
      const { status } = store;

      vaultsInitialStatus = [
        ...vaultsInitialStatus, 
        {
          version: thresholdSelectorStore.version,
          collateral: thresholdSelectorStore.collateral,
          initialView: getInitialView(status)
        }
      ]
    }
    
    setViews(vaultsInitialStatus)
    return () => {
      setIsMounted(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  const viewsRef = useRef<VaultStatus[]>(views);

  const dispatchEvent = useCallback((event: VaultEvent, version: string, collateral: string) => {
    if (viewsRef.current.length === 0) {
      return
    }

    const current = viewsRef.current.find((view) => {
      return view.version === version && view.collateral === collateral;
    });
    const nextView = transition((current as VaultStatus).initialView as VaultView, event);

    console.log(
      "dispatchEvent() [current-view, event, next-view]",
      (current as VaultStatus).initialView,
      event,
      nextView
    );
    
    setViews(prev => {
      const index = prev.findIndex(view => view.version === version && view.collateral === collateral);
      const nextView = transition(prev[index].initialView, event);
    
      if (index !== -1) {
        const updatedView = { ...prev[index], initialView: nextView };
        return [...prev.slice(0, index), updatedView, ...prev.slice(index + 1)];
      } else {
        return [...prev, { version, collateral, initialView: nextView }];
      }
    });
    
  }, []);

  useEffect(() => {
      viewsRef.current = views;
  }, [views]);

  useEffect(() => {
    if (!thresholdSelectorStores) {
      return
    }

    for (const thresholdSelectorStore of thresholdSelectorStores) {
      const store = thresholdSelectorStore?.store;
      const { status } = store;

      const event = vaultStatusEvents[status] ?? null;
      if (event !== null) {
        dispatchEvent(event, thresholdSelectorStore.version, thresholdSelectorStore.collateral);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const provider = {
    views,
    dispatchEvent
  };

  if (!thresholdSelectorStores || views.length === 0) {
    return <>{loader}</>;
  }

  return <VaultViewContext.Provider value={provider}>{children}</VaultViewContext.Provider>;
};
