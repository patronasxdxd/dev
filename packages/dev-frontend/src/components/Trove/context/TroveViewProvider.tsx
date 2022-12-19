import React, { useState, useCallback, useEffect, useRef } from "react";
import { useThresholdSelector} from "@liquity/lib-react";
import { LiquityStoreState as ThresholdStoreState, UserTroveStatus } from "@liquity/lib-base";
import { TroveViewContext } from "./TroveViewContext";
import type { TroveView, TroveEvent } from "./types";

type TroveEventTransitions = Record<TroveView, Partial<Record<TroveEvent, TroveView>>>;

const transitions: TroveEventTransitions = {
  NONE: {
    OPEN_TROVE_PRESSED: "OPENING",
    TROVE_OPENED: "ACTIVE"
  },
  LIQUIDATED: {
    OPEN_TROVE_PRESSED: "OPENING",
    TROVE_SURPLUS_COLLATERAL_CLAIMED: "NONE",
    TROVE_OPENED: "ACTIVE"
  },
  REDEEMED: {
    OPEN_TROVE_PRESSED: "OPENING",
    TROVE_SURPLUS_COLLATERAL_CLAIMED: "NONE",
    TROVE_OPENED: "ACTIVE"
  },
  OPENING: {
    CANCEL_ADJUST_TROVE_PRESSED: "NONE",
    TROVE_OPENED: "ACTIVE"
  },
  ADJUSTING: {
    CANCEL_ADJUST_TROVE_PRESSED: "ACTIVE",
    TROVE_ADJUSTED: "ACTIVE",
    TROVE_CLOSED: "NONE",
    TROVE_LIQUIDATED: "LIQUIDATED",
    TROVE_REDEEMED: "REDEEMED"
  },
  CLOSING: {
    CANCEL_ADJUST_TROVE_PRESSED: "ACTIVE",
    TROVE_CLOSED: "NONE",
    TROVE_ADJUSTED: "ACTIVE",
    TROVE_LIQUIDATED: "LIQUIDATED",
    TROVE_REDEEMED: "REDEEMED"
  },
  ACTIVE: {
    ADJUST_TROVE_PRESSED: "ADJUSTING",
    CLOSE_TROVE_PRESSED: "CLOSING",
    TROVE_CLOSED: "NONE",
    TROVE_LIQUIDATED: "LIQUIDATED",
    TROVE_REDEEMED: "REDEEMED"
  }
};

type TroveStateEvents = Partial<Record<UserTroveStatus, TroveEvent>>;

const troveStatusEvents: TroveStateEvents = {
  open: "TROVE_OPENED",
  closedByOwner: "TROVE_CLOSED",
  closedByLiquidation: "TROVE_LIQUIDATED",
  closedByRedemption: "TROVE_REDEEMED"
};

const transition = (view: TroveView, event: TroveEvent): TroveView => {
  const nextView = transitions[view][event] ?? view;
  return nextView;
};

const getInitialView = (troveStatus: UserTroveStatus): TroveView => {
  if (troveStatus === "closedByLiquidation") {
    return "LIQUIDATED";
  }
  if (troveStatus === "closedByRedemption") {
    return "REDEEMED";
  }
  if (troveStatus === "open") {
    return "ACTIVE";
  }
  return "NONE";
};

const select = ({ trove: { status } } : ThresholdStoreState) => status;

type TroveViewProps = {
  loader: React.ReactNode;
  children: React.ReactNode;
};

export const TroveViewProvider = ({
  loader,
  children
}: TroveViewProps): JSX.Element => {
  const trovesStatus = useThresholdSelector(select);
  const [views, setViews] = useState<Record<string, TroveView>>({});

  useEffect(() => {
    if (!trovesStatus) {
      return
    }
    for (const [version, troveStatus] of Object.entries(trovesStatus)) {
      setViews(prev => { return {...prev, [version]: getInitialView(troveStatus)}})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  const viewsRef = useRef<Record<string, TroveView>>(views);

  const dispatchEvent = useCallback((event: TroveEvent, version: string) => {
    const nextView = transition(viewsRef.current[version], event);

    console.log(
      "dispatchEvent() [current-view, event, next-view]",
      viewsRef.current[version],
      event,
      nextView
    );
    setViews(prev => { return {...prev, [version]: nextView}});
  }, []);

  useEffect(() => {
    viewsRef.current = views;
  }, [views]);

  useEffect(() => {
    if (!trovesStatus) {
      return
    }

    for (const [version, troveStatus] of Object.entries(trovesStatus)) {
      const event = troveStatusEvents[troveStatus] ?? null;
      if (event !== null) {
        dispatchEvent(event, version);
      }
    }
  }, [trovesStatus, dispatchEvent]);

  const provider = {
    views,
    dispatchEvent
  };

  if (!trovesStatus || Object.keys(views).length !== Object.keys(trovesStatus).length) {
    return <>{loader}</>;
  }

  return <TroveViewContext.Provider value={provider}>{children}</TroveViewContext.Provider>;
};
