import { BigNumber } from "@ethersproject/bignumber";

import { Decimal } from "@threshold-usd/lib-base";

export const DEFAULT_COLLATERAL_FOR_TESTING = "tst";
export const DEFAULT_VERSION_FOR_TESTING = "v1";

export const supportedNetworks: SupportedNetworks = { 
  1: "mainnet", 
  11155111: "sepolia", 
  111: "bob_testnet", 
  60808: "bob_mainnet",
};

export const numberify = (bigNumber: BigNumber): number => bigNumber.toNumber();

export const decimalify = (bigNumber: BigNumber): Decimal =>
  Decimal.fromBigNumberString(bigNumber.toHexString());

export const panic = <T>(e: unknown): T => {
  throw e;
};

export type SupportedNetworks = {
  [key: string]: "mainnet" | "sepolia" | "bob_testnet" | "bob_mainnet";
};

export type Resolved<T> = T extends Promise<infer U> ? U : T;
export type ResolvedValues<T> = { [P in keyof T]: Resolved<T[P]> };

/**
 * Takes an object with promises as values and returns a new promise that resolves with an object
 * containing the resolved values of the input promises.
 *
 * @param object - An object with properties containing promises
 * @returns A promise that resolves with an object containing the resolved values of the input promises
 */
export const promiseAllValues = <T>(object: T): Promise<ResolvedValues<T>> => {
  return Promise.all(
    Object.entries(object).map(async ([key, valuePromise]) => [key, await valuePromise])
  ).then(Object.fromEntries) as Promise<ResolvedValues<T>>;
};
