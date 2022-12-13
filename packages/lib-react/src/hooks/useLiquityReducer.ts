import { useCallback, useEffect, useReducer, useRef } from "react";

import { LiquityStoreState } from "@liquity/lib-base";

import { equals } from "../utils/equals";
import { useLiquityStore } from "./useLiquityStore";

export type LiquityStoreUpdate<T = unknown> = {
  type: "updateStore";
  newState: LiquityStoreState<T>;
  oldState: LiquityStoreState<T>;
  stateChange: Partial<LiquityStoreState<T>>;
};

export const useLiquityReducer = <S, A, T>(
  index: number,
  reduce: (state: S, action: A | LiquityStoreUpdate<T>) => S,
  init: (storeState: LiquityStoreState<T>) => S
): [S, (action: A | LiquityStoreUpdate<T>) => void] => {
  const stores = useLiquityStore<T>();
  const oldStore = useRef(stores[index]);
  const state = useRef(init(stores[index].state));
  const [, rerender] = useReducer(() => ({}), {});

  const dispatch = useCallback(
    (action: A | LiquityStoreUpdate<T>) => {
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
