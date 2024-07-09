import { Text, Flex, Box, Container, Card } from "theme-ui";

import { Chain, } from '@web3-onboard/common'
import { useSetChain } from "@web3-onboard/react";
import { ConnectedChain } from "@web3-onboard/core";
import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";

export const UserNetwork = (): JSX.Element => {
  const [userNetworkOpen, setUserNetworkOpen] = useState(false);
  const userNetworkOverlayRef = useRef<HTMLDivElement>(null);
  const [connectedNetwork, setConnectedNetwork] = useState<ConnectedChain | null>({namespace: 'evm', id: '0x1'})
  const [
    {
      chains,
      connectedChain,
    },
    setChain
  ] = useSetChain()

  useEffect(() => {
    if (connectedChain) {
      setConnectedNetwork(connectedChain)
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (userNetworkOpen && userNetworkOverlayRef.current && !userNetworkOverlayRef.current.contains(event.target as Node)) {
        setUserNetworkOpen(false);
      }
    }

    window.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
    }
  }, [userNetworkOpen, connectedChain])

  return (
    <>
      <Box
        sx={{ cursor: "pointer" }}
        onClick={() => setUserNetworkOpen(!userNetworkOpen)}
      >
        <Flex variant="layout.userAccount">
          <Text as="span" sx={{ fontSize: "0.8rem", fontWeight: "bold" }}>
            {chains.find((chain: Chain) => chain.id === connectedNetwork?.id)?.label ?? "Select Network"}
          </Text> 
          <Icon name="caret-down" />
        </Flex>
      </Box>
      {userNetworkOpen && (
        <Box
          ref={userNetworkOverlayRef}
          sx={{ position: "absolute", zIndex: 2 }}
        >
          <Card 
            sx={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              bg: "white", 
              rounded: "sm",
              width: "10.25rem",
              left: [0, "3.60rem"],
              top: "5.5rem",
              overflow: "hidden",
            }}
          >
            {chains.map((chain: Chain) => (
              <Flex
                key={chain.id}
                sx={{ 
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                  p: "0.65rem",
                  bg: chain.id === connectedNetwork?.id ? "primary" : "white",
                  color: chain.id === connectedNetwork?.id ? "white" : "black",
                  ":hover": { bg: chain.id === connectedNetwork?.id ? "primary" : "metaMaskButtonBg" }
                }}
                onClick={() => {
                  setChain({ chainId: chain.id })
                  setUserNetworkOpen(false)
                }}
              >
                <Text as="span" sx={{ fontSize: "0.8rem", fontWeight: "bold" }}>
                  {chain.label}
                </Text>
                {chain.id === connectedNetwork?.id && <Icon name="check" />}
              </Flex>
            ))}
          </Card>
        </Box>
      )}
    </>
  );
};
