import { useEffect, useReducer } from "react";
import { LiquityStoreState as ThresholdStoreState, LiquityStore as ThresholdStore } from "@liquity/lib-base";

import { equals } from "../utils/equals";
import { useThresholdStore } from "./useThresholdStore";

const subscribeStores = <S, T>(
  stores: ThresholdStore<T>[],
  select: (state: ThresholdStoreState<T>) => S ,
  rerender: React.DispatchWithoutAction
) => {
  for (const key in stores) {
    stores[key].subscribe(({ newState, oldState }) => {
      if (!equals(select(newState), select(oldState))) {
        rerender();
      }
    })
  }
}

const getSelectedStoreStates = <S, T>(
  stores: ThresholdStore<T>[],
  select: (state: ThresholdStoreState<T>) => S
) => {
  let version = 0
  let selectedStores: Record<string, S> = {}

  for (const key in stores) {
    version ++
    selectedStores = {...selectedStores, ["v" + version]: select(stores[key].state)};
  }
  return selectedStores
}

export const useThresholdSelector = <S, T>(select: (state: ThresholdStoreState<T>) => S): Record<string, S> => {
  const stores = useThresholdStore<T>();
  const [, rerender] = useReducer(() => ({}), {});

  useEffect(
    () =>
      subscribeStores(
        stores, 
        select, 
        rerender
      ),
    [stores, select]
  );

  return getSelectedStoreStates(
    stores,
    select
  )
};
