import React from "react";
import { Flex, Container } from "theme-ui";
import { HashRouter as Router, Switch, Route } from "react-router-dom";
import { Wallet } from "@ethersproject/wallet";

import { Decimal, Difference, Trove } from "@liquity/lib-base";
import { LiquityStoreProvider } from "@liquity/lib-react";

import { useLiquity } from "./hooks/LiquityContext";
import { TransactionMonitor } from "./components/Transaction";
import { Nav } from "./components/Nav";
import { UserAccount } from "./components/UserAccount";
import { SideBar } from "./components/SideBar";
// import { Social } from "./components/Social";
import { HamburgerMenu } from "./components/HamburgerMenu";
import { Header } from "./components/Header";

import { PageSwitcher } from "./pages/PageSwitcher";
import { Farm } from "./pages/Farm";
import { RiskyTrovesPage } from "./pages/RiskyTrovesPage";
import { RedemptionPage } from "./pages/RedemptionPage";

import { TroveViewProvider } from "./components/Trove/context/TroveViewProvider";
import { StabilityViewProvider } from "./components/Stability/context/StabilityViewProvider";
import { StakingViewProvider } from "./components/Staking/context/StakingViewProvider";
import { FarmViewProvider } from "./components/Farm/context/FarmViewProvider";

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
            <StakingViewProvider>
              <FarmViewProvider>
                <Flex sx={{ flexDirection: "column", minHeight: "100%", backgroundColor: "#F7FAFC" }}>
                  <Header>
                    <UserAccount />
                    <HamburgerMenu />
                  </Header>
                  <SideBar>
                    <Nav />
                    {/*<Social />*/}
                  </SideBar>

                  <Container
                    variant="main"
                    sx={{
                      display: "flex",
                      flexGrow: 1,
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <Switch>
                      <Route path="/" exact>
                        <PageSwitcher />
                      </Route>
                      <Route path="/farm">
                        <Farm />
                      </Route>
                      <Route path="/risky-troves">
                        <RiskyTrovesPage />
                      </Route>
                      <Route path="/redemption">
                        <RedemptionPage />
                      </Route>
                    </Switch>
                  </Container>
                </Flex>
              </FarmViewProvider>
            </StakingViewProvider>
          </StabilityViewProvider>
        </TroveViewProvider>
      </Router>
      <TransactionMonitor />
    </LiquityStoreProvider>
  );
};
