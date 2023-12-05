import React, { createContext, useContext, useEffect, useState } from "react";
import { useConnectWallet } from '@web3-onboard/react'

import { Button, Flex, Spinner, Box, Paragraph, useColorMode } from "theme-ui";
import { GenericIcon } from "../components/GenericIcon";
import { BatchedWebSocketAugmentedWeb3Provider } from "@threshold-usd/providers";
import { Web3Provider } from '@ethersproject/providers'

type Account = {
  chainId: number;
  address: string;
  ens: { name: string | undefined, avatar: string | undefined }
}

type WalletConnectorValue = {
  account: Account;
  provider: Web3Provider;
};

const WalletConnectorContext = createContext<WalletConnectorValue | undefined>(undefined);

type WalletConnectorProps = {
  loader?: React.ReactNode;
  children: React.ReactNode
};
type HexChains = {
  "0x1": number;
  "0x5": number;
  "0xaa36a7": number;
}
const hexChains: HexChains = {"0x1": 1, "0x5": 5, "0xaa36a7": 11155111}

export const WalletConnectorProvider = ({ children }: WalletConnectorProps): JSX.Element => {
  const [colorMode] = useColorMode()
  const [{ wallet, connecting }, connect ] = useConnectWallet();
  const [provider, setProvider] = useState<Web3Provider | null>();
  const [account, setAccount] = useState<Account>();

  useEffect(() => {
    const previousWallet = localStorage.getItem('walletLabel');
    const autoSelect = { label: previousWallet!, disableModals: false }
    if (previousWallet) {
        // 'connect' function from useConnectWallet expects a wallet name as an argument
        connect({ autoSelect });
    }
  }, [connect]);

  useEffect(() => {
    if (wallet?.provider) {
      localStorage.setItem('walletLabel', wallet.label)

      const { name, avatar } = wallet?.accounts[0].ens ?? {}

      const account = {
        chainId: hexChains[wallet.chains[0].id as keyof HexChains],
        address: wallet.accounts[0].address,
        ens: { name, avatar: avatar?.url }
      }

      setAccount(account)
    } else setAccount(undefined)
  }, [wallet])

  useEffect(() => {
    // If the wallet has a provider than the wallet is connected
    if (wallet?.provider) {
      const provider = new BatchedWebSocketAugmentedWeb3Provider(wallet.provider) as Web3Provider
      setProvider(provider);
    }
  }, [wallet]);

  if(!provider || !account) {
    return (
      <Flex sx={{
        height: "80vh", 
        justifyContent: "center",
        alignItems: "center"
      }}>
        <Flex sx={{
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          boxShadow: 1,
          borderRadius: "16px",
          bg: "background",
          py: ["3rem", "4.5rem", "5rem"],
          px: ["2.2rem", "7rem"],
          height: "fit-content"
        }}>
          <Flex sx={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            mb: "2.5rem"
          }}>
            <GenericIcon imgSrc={colorMode === "dark" || colorMode === "darkGrey" ? "./dark-main-thresholdusd-logo.svg" : "./light-main-thresholdusd-logo.svg"} height={"66px"} />
          </Flex>
          <Paragraph sx={{
            fontWeight: "bold",
            fontSize: ["1.1rem", "1.2rem"],
            textAlign: "center",
            letterSpacing: -0.6,
            mb: "0.5rem"
          }}>
            No wallet connected.
          </Paragraph>
          <Paragraph sx={{
            color: "grey",
            fontWeight: "bold",
            fontSize: ["0.8rem", "0.9rem"],
            textAlign: "center",
            letterSpacing: -0.6,
            mb: ["1.7rem", "2.2rem"]
          }}>
            Get started by connecting your wallet
          </Paragraph>
          <Box>
            <Button
              sx={{ maxWidth: "16.5rem" }}
              disabled={connecting}
              onClick={async () => {
                connect()
              }}
            >
              <>
                {connecting
                  && <Spinner size="1em" sx={{ mr: [0, 2], color: "white" }} />
                }
                <Flex sx={{ ml: [0, 2], fontSize: ["0.6rem", "0.9rem", "1rem"], justifyContent: "center" }}>Connect wallet</Flex>
              </>
            </Button>
          </Box>
        </Flex>
      </Flex>
    )
  };

  return (
    <WalletConnectorContext.Provider value={{ account, provider }}>
      {children}
    </WalletConnectorContext.Provider>
  );
};

export const useWalletConnector = () => {
  const walletConnectorContext = useContext(WalletConnectorContext);

  if (!walletConnectorContext) {
    throw new Error("You must provide a WalletConnectorContext via WalletConnectorProvider");
  }

  return walletConnectorContext;
};
