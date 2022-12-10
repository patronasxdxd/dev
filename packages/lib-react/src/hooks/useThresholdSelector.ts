import { useEffect, useReducer } from "react";

import { LiquityStoreState as ThresholdStoreState } from "@liquity/lib-base";

import { equals } from "../utils/equals";
import { useThresholdStore } from "./useThresholdStore";

export const useLiquitySelector = <S, T>(select: (state: ThresholdStoreState<T>) => S): S => {
  const store = useThresholdStore<T>();
  const [, rerender] = useReducer(() => ({}), {});

  useEffect(
    () =>
      store.subscribe(({ newState, oldState }) => {
        if (!equals(select(newState), select(oldState))) {
          rerender();
        }
      }),
    [store, select]
  );

  return select(store.state);
};
