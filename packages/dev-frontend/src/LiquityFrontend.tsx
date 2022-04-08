import React from "react";
import { Flex, Container } from "theme-ui";
import { HashRouter as Router, Switch, Route } from "react-router-dom";
import { Wallet } from "@ethersproject/wallet";

import { Decimal, Difference, Trove } from "@liquity/lib-base";
import { LiquityStoreProvider } from "@liquity/lib-react";

import { useLiquity } from "./hooks/LiquityContext";
import { TransactionMonitor } from "./components/Transaction";
import { Nav } from "./components/Nav";
import { SideBar } from "./components/SideBar";
import { HamburgerMenu } from "./components/HamburgerMenu";
import { Header } from "./components/Header";

import { PageSwitcher } from "./pages/PageSwitcher";
import { RedemptionPage } from "./pages/RedemptionPage";
import { RiskyVaultsPage } from "./pages/RiskyVaultsPage";
import { StabilityPoolPage } from "./pages/StabilityPoolPage";
import { VaultPage } from "./pages/VaultPage";

import { TroveViewProvider } from "./components/Trove/context/TroveViewProvider";
import { StabilityViewProvider } from "./components/Stability/context/StabilityViewProvider";

type LiquityFrontendProps = {
  loader?: React.ReactNode;
};
export const LiquityFrontend: React.FC<LiquityFrontendProps> = ({ loader }) => {
  const { account, provider, liquity } = useLiquity();

  // For console tinkering ;-)
  Object.assign(window, {
    account,
    provider,
    liquity,
    Trove,
    Decimal,
    Difference,
    Wallet
  });

  return (
    <LiquityStoreProvider {...{ loader }} store={liquity.store}>
      <Router>
        <TroveViewProvider>
          <StabilityViewProvider>
                <Flex variant="layout.wrapper">
                  <Header>
                    <HamburgerMenu />
                  </Header>
                  <SideBar>
                    <Nav />
                  </SideBar>
                  <Container
                    variant="main"
                    sx={{
                      flexGrow: 1,
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <Switch>
                      <Route path="/" exact>
                        <PageSwitcher />
                      </Route>
                      <Route path="/borrow" exact>
                        <VaultPage />
                      </Route>
                      <Route path="/earn" exact>
                        <StabilityPoolPage />
                      </Route>
                      <Route path="/redemption">
                        <RedemptionPage />
                      </Route>
                      <Route path="/risky-vaults">
                        <RiskyVaultsPage />
                      </Route>
                    </Switch>
                  </Container>
                </Flex>
          </StabilityViewProvider>
        </TroveViewProvider>
      </Router>
      <TransactionMonitor />
    </LiquityStoreProvider>
  );
};
