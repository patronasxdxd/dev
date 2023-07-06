import { Text, Flex, Box } from "theme-ui";

import { shortenAddress } from "../utils/shortenAddress";
import { useConnectWallet } from "@web3-onboard/react";

export const UserAccount = (): JSX.Element => {
  const [{ wallet }, connect, disconnect] = useConnectWallet();

  if (wallet?.accounts[0]) {
    return (
      <Box
        sx={{ cursor: "pointer" }}
        onClick={() => {
          disconnect(wallet);
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
