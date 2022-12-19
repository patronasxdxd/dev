import { useReducer } from "react";

import { LiquityStoreState as ThresholdStoreState, LiquityStore as ThresholdStore } from "@liquity/lib-base";

import { equals } from "../utils/equals";
import { useLiquityStore } from "./useLiquityStore";

const getSelectedStoreStates = <S, T>(
  stores: ThresholdStore<T>[],
  select: (state: ThresholdStoreState<T>) => S ,
  rerender: React.DispatchWithoutAction
) => {
  let version = 0
  let selectedStores: Record<string, S> = {}

  for (const [, store] of Object.entries(stores)) {
    version ++

    store.subscribe(({ newState, oldState }) => {
      if (!equals(select(newState), select(oldState))) {
        rerender();
      }
    })
    selectedStores = {...selectedStores, ["v" + version]: select(store.state)};
  }

  return selectedStores
}

export const useLiquitySelector = <S, T>(select: (state: ThresholdStoreState<T>) => S): Record<string, S> => {
  const stores = useLiquityStore<T>();
  const [, rerender] = useReducer(() => ({}), {});

  return getSelectedStoreStates(
    stores,
    select,
    rerender
  )
};
