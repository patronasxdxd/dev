import { Text, Flex, Box } from "theme-ui";

import { shortenAddress } from "../utils/shortenAddress";
import { useConnectWallet } from "@web3-onboard/react";
import { WalletState } from "@web3-onboard/core";

export const UserAccount = (): JSX.Element => {
  const [{ wallet }, connect, disconnect] = useConnectWallet();

  const disconnectWallet = (wallet: WalletState) => {
    localStorage.removeItem('walletLabel')
    disconnect(wallet)
  }

  if (wallet?.accounts[0]) {
    return (
      <Box
        sx={{ cursor: "pointer" }}
        onClick={() => {
          disconnectWallet(wallet);
        }}
      >
        <Flex variant="layout.userAccount">
          <Flex variant="layout.account">
            <Text as="span" sx={{ fontSize: "0.8rem", fontWeight: "bold" }}>
              {wallet?.accounts[0].address ?  shortenAddress(wallet?.accounts[0].address) : 'Connect Wallet'}
            </Text>
          </Flex>
        </Flex>
      </Box>
    );
  } else {
    return (
      <Box
        sx={{ cursor: "pointer" }}
        onClick={() => {
          connect();
        }}
      >
        <Flex variant="layout.userAccount">
          <Flex variant="layout.account">
            <Text as="span" sx={{ fontSize: "0.8rem", fontWeight: "bold" }}>
              Connect Wallet
            </Text>
          </Flex>
        </Flex>
      </Box>
    )}
};
