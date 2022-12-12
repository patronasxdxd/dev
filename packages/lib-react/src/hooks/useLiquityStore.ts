import { useContext } from "react";

import { LiquityStore as ThresholdStore} from "@liquity/lib-base";

import {LiquityStoreContext } from "../components/LiquityStoreProvider";

export const useLiquityStore = <T>(): ThresholdStore<T> => {
  const store = useContext(LiquityStoreContext);

  if (!store) {
    throw new Error("You must provide a ThresholdStore via ThresholdStoreProvider");
  }

  return store as ThresholdStore<T>;
};
