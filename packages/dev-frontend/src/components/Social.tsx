import React from "react";
import { Text, Flex, Box, Heading } from "theme-ui";

import { LiquityStoreState as ThresholdStoreState } from "@liquity/lib-base";
import { useLiquitySelector as useThresholdSelector } from "@liquity/lib-react";

import { COIN } from "../strings";
import { useThreshold } from "../hooks/ThresholdContext";
import { shortenAddress } from "../utils/shortenAddress";

import { Icon } from "./Icon";

const select = ({ accountBalance, thusdBalance }: ThresholdStoreState) => ({
  accountBalance,
  thusdBalance
});

export const Social: React.FC = () => {
  const { account } = useThreshold();
    // TODO
  const { accountBalance, thusdBalance } = useThresholdSelector(1, select);

  return (
    <Box sx={{ display: ["none", "flex"] }}>
      <Flex sx={{ alignItems: "center" }}>
        <Icon name="user-circle" size="lg" />
        <Flex sx={{ ml: 3, mr: 4, flexDirection: "column" }}>
          <Heading sx={{ fontSize: 1 }}>Connected as</Heading>
          <Text as="span" sx={{ fontSize: 1 }}>
            {shortenAddress(account)}
          </Text>
        </Flex>
      </Flex>
      <Flex sx={{ alignItems: "center" }}>
        <Icon name="wallet" size="lg" />
        {([
          ["ETH", accountBalance],
          [COIN, thusdBalance]
        ] as const).map(([currency, balance], i) => (
          <Flex key={i} sx={{ ml: 3, flexDirection: "column" }}>
            <Heading sx={{ fontSize: 1 }}>{currency}</Heading>
            <Text sx={{ fontSize: 1 }}>{balance.prettify()}</Text>
          </Flex>
        ))}
      </Flex>
    </Box>
  );
};
