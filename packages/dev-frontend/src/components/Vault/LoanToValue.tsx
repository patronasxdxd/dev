import { Flex, SxProp } from "theme-ui";

import { Decimal, Difference, Percent } from "@threshold-usd/lib-base";

import { StaticRow } from "./Editor";

type LoanToValueProps = SxProp & {
  value?: Decimal;
  change?: Difference;
};

export const LoanToValue = ({ value, change, sx }: LoanToValueProps): JSX.Element => {
  const loanToValuePct = new Percent(value ?? { toString: () => "N/A" });
  const changePct = change && new Percent(change);
  return (
    <>
      <Flex sx={{ ...sx }}>
        <StaticRow
          label="Loan to value"
          inputId="vault-loan-to-value"
          amount={loanToValuePct.prettify()}
          pendingAmount={
            change?.positive?.absoluteValue?.gt(10)
              ? "++"
              : change?.negative?.absoluteValue?.gt(10)
              ? "--"
              : changePct?.nonZeroish(2)?.prettify()
          }
        />
      </Flex>
    </>
  );
};
