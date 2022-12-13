import { useEffect, useReducer } from "react";

import { LiquityStoreState as ThresholdStoreState } from "@liquity/lib-base";

import { equals } from "../utils/equals";
import { useLiquityStore } from "./useLiquityStore";

export const useLiquitySelector = <S, T>(index: number, select: (state: ThresholdStoreState<T>) => S): S => {
  const stores = useLiquityStore<T>();
  const [, rerender] = useReducer(() => ({}), {});

  useEffect(
    () =>
      stores[index].subscribe(({ newState, oldState }) => {
        if (!equals(select(newState), select(oldState))) {
          rerender();
        }
      }),
    [index, stores, select]
  );

  return select(stores[index].state);
};
