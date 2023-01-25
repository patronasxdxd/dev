import React, { useState, useCallback, useEffect, useRef } from "react";
import { useThresholdSelector} from "@liquity/lib-react";
import { LiquityStoreState as ThresholdStoreState, UserTroveStatus as UserVaultStatus } from "@liquity/lib-base";
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

const select = ({ trove: { status } } : ThresholdStoreState) => status;

type VaultViewProps = {
  loader: React.ReactNode;
  children: React.ReactNode;
};

export const VaultViewProvider = ({
  loader,
  children
}: VaultViewProps): JSX.Element => {
  const vaultsStatus = useThresholdSelector(select);
  const [views, setViews] = useState<Record<string, VaultView>>({});
  const [isMounted, setIsMounted] = useState<boolean>(true);

  useEffect(() => {
    if (!vaultsStatus || !isMounted) {
      return
    }
    let vaultsInitialStatus = {}
    for (const [version, vaultStatus] of Object.entries(vaultsStatus)) {
      vaultsInitialStatus = {...vaultsInitialStatus, [version]: getInitialView(vaultStatus)}
    }
    
    setViews(vaultsInitialStatus)
    return () => {
      setIsMounted(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  const viewsRef = useRef<Record<string, VaultView>>(views);

  const dispatchEvent = useCallback((event: VaultEvent, version: string) => {
    if (Object.keys(viewsRef.current).length > 0) {
      const nextView = transition(viewsRef.current[version], event);

      console.log(
        "dispatchEvent() [current-view, event, next-view]",
        viewsRef.current[version],
        event,
        nextView
      );
      setViews(prev => { return {...prev, [version]: nextView}});
    }
  }, []);

  useEffect(() => {
      viewsRef.current = views;
  }, [views]);

  useEffect(() => {
    if (!vaultsStatus) {
      return
    }

    for (const [version, vaultStatus] of Object.entries(vaultsStatus)) {
      const event = vaultStatusEvents[vaultStatus] ?? null;
      if (event !== null) {
        dispatchEvent(event, version);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const provider = {
    views,
    dispatchEvent
  };

  if (!vaultsStatus || Object.keys(views).length === 0) {
    return <>{loader}</>;
  }

  return <VaultViewContext.Provider value={provider}>{children}</VaultViewContext.Provider>;
};
