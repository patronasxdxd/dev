export function checkTransactionCollateral(
  myTransactionState: any,
  version: string,
  collateral: string
): boolean {
  return (
    myTransactionState.version === version &&
    myTransactionState.collateral === collateral
  );
}
