import { render } from "@testing-library/react";

import { Decimal, THUSD_MINIMUM_NET_DEBT, Trove } from "@threshold-usd/lib-base";

import App from "./App";

const params = { depositCollateral: Decimal.from(20), borrowTHUSD: THUSD_MINIMUM_NET_DEBT };
const vault = Vault.create(params);

console.log(`${vault}`);

test("there's no smoke", async () => {
  const { findByText } = render(<App />);

  expect(await findByText(/dashboard/i)).toBeInTheDocument();
});
