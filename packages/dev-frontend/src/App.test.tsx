import { render, fireEvent } from "@testing-library/react";

import { Decimal, THUSD_MINIMUM_NET_DEBT, Trove as Vault } from "@liquity/lib-base";

import App from "./App";

const params = { depositCollateral: Decimal.from(20), borrowTHUSD: THUSD_MINIMUM_NET_DEBT };
const vault = Vault.create(params);

console.log(`${vault}`);

/*
 * Just a quick and dirty testcase to prove that the approach can work in our CI pipeline.
 */
test("there's no smoke", async () => {
  const { getByText, getByLabelText, findByText } = render(<App />);

  expect(await findByText(/open a vault/i)).toBeInTheDocument();

  fireEvent.click(getByText(/open a vault/i));
  fireEvent.click(getByText(/open a vault/i));
  fireEvent.click(getByLabelText(/collateral/i));
  fireEvent.change(getByLabelText(/^collateral$/i), { target: { value: `${vault.collateral}` } });
  fireEvent.click(getByLabelText(/^borrow$/i));
  fireEvent.change(getByLabelText(/^borrow$/i), { target: { value: `${vault.debt}` } });

  const confirmButton = await findByText(/confirm/i);
  fireEvent.click(confirmButton);

  expect(await findByText(/adjust/i)).toBeInTheDocument();
});
