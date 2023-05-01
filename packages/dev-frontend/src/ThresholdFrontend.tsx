import React from "react";
import { Flex, Container, Heading, Paragraph } from "theme-ui";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import { Nav } from "./components/Nav";
import { SideBar } from "./components/SideBar";
import { HamburgerMenu } from "./components/HamburgerMenu";
import { Icon } from "./components/Icon";
import { Header } from "./components/Header";
import { WalletConnectorProvider } from "./hooks/WalletConnectorContext";
import { TransactionProvider } from "./components/Transaction";
import { FunctionalPanel } from "./components/FunctionalPanel";

import { Dashboard } from "./pages/Dashboard";
import { RedemptionPage } from "./pages/RedemptionPage";
import { RiskyVaultsPage } from "./pages/RiskyVaultsPage";

import { VaultPage } from "./pages/VaultPage";

import { ThresholdProvider, supportedNetworks } from "./hooks/ThresholdContext";
import { StabilityPoolPage } from "./pages/StabilityPoolPage";

type ThresholdFrontendProps = {
  loader?: React.ReactNode;
};

const UnsupportedMainnetFallback = (): JSX.Element => (
  <Flex
    sx={{
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "80vh",
      textAlign: "center"
    }}
  >
    <Heading sx={{ mb: 3 }}>
      <Icon name="exclamation-triangle" /> This app is for testing purposes only.
    </Heading>

    <Paragraph sx={{ mb: 3 }}>
      Please change your network to Sepolia.
    </Paragraph>
  </Flex>
);

export const ThresholdFrontend = ({ loader }: ThresholdFrontendProps): JSX.Element => {
  const unsupportedNetworkFallback = (chainId: number) => (
    <Flex
      sx={{
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "80vh",
        textAlign: "center"
      }}
    >
      <Heading sx={{ display: "flex", gap: 1, mb: 3 }}>
        <Icon name="exclamation-triangle" /> Threshold USD is not yet deployed to{" "}
        <Flex sx={supportedNetworks[chainId] && {textTransform: "capitalize"}}>
          {chainId === 1 ? "Ethereum Mainnet" : supportedNetworks[chainId] ?? "this network"}
        </Flex>.
      </Heading>
      Please switch to Sepolia.
    </Flex>
  );

  return (
    <>
      <Router>
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
            <WalletConnectorProvider loader={loader}>
              <ThresholdProvider
                loader={loader}
                unsupportedNetworkFallback={unsupportedNetworkFallback}
                unsupportedMainnetFallback={<UnsupportedMainnetFallback />}
              >
                <TransactionProvider>
                  <FunctionalPanel loader={loader}>
                      <Switch>
                        <Route path="/" exact>
                          <Dashboard />
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
                  </FunctionalPanel>
                </TransactionProvider>
              </ThresholdProvider>
            </WalletConnectorProvider>
          </Container>
        </Flex>
      </Router>
    </>            
  );
};
