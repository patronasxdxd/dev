import { useCallback, useEffect, useReducer, useRef } from "react";

import { LiquityStoreState as ThresholdStoreState } from "@liquity/lib-base";

import { equals } from "../utils/equals";
import { useThresholdStore } from "./useThresholdStore";

export type ThresholdStoreUpdate<T = unknown> = {
  type: "updateStore";
  newState: ThresholdStoreState<T>;
  oldState: ThresholdStoreState<T>;
  stateChange: Partial<ThresholdStoreState<T>>;
};

export const useThresholdReducer = <S, A, T>(
  index: number,
  reduce: (state: S, action: A | ThresholdStoreUpdate<T>) => S,
  init: (storeState: ThresholdStoreState<T>) => S
): [S, (action: A | ThresholdStoreUpdate<T>) => void] => {

  const stores = useThresholdStore<T>();
  const oldStore = useRef(stores[index]);
  const state = useRef(init(stores[index].state));
  const [, rerender] = useReducer(() => ({}), {});

  const dispatch = useCallback(
    (action: A | ThresholdStoreUpdate<T>) => {
      const newState = reduce(state.current, action);

      if (!equals(newState, state.current)) {
        state.current = newState;
        rerender();
      }
    },
    [reduce]
  );

  useEffect(() => stores[index].subscribe(params => dispatch({ type: "updateStore", ...params })), [
    index,
    stores,
    dispatch
  ]);

  if (oldStore.current !== stores[index]) {
    state.current = init(stores[index].state);
    oldStore.current = stores[index];
  }

  return [state.current, dispatch];
};
