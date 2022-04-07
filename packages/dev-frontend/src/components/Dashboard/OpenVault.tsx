import React from "react";
import { Box, Button, Card, Flex } from "theme-ui";
import { InfoIcon } from "../InfoIcon";

type OpenVaultProps = {
  variant?: string;
};

export const OpenVault: React.FC<OpenVaultProps> = ({ variant = "mainCards" }) => {
  
  return (
    <Card {...{ variant }}>
      <Card variant="layout.columns">
        <Flex sx={{
          fontSize: "0.9em",
          width: "100%",
          gap: 1,
          pb: 3,
          borderBottom: 1, 
          borderColor: "border"
        }}>
          Open a Vault
          {<InfoIcon size="sm" tooltip={<Card variant="tooltip">Lorem Ipsum</Card>} />}
        </Flex>
        <Flex sx={{
          width: "100%",
          flexDirection: "column",
          fontSize: "0.9em",
          p: "1.8em",
          gap: "1em"
        }}>
          
          ETH available
          
          <Flex variant="layout.balanceRow">
            <Box>img</Box>
            <Box sx={{ fontSize: 4 }}>--</Box>
            <Box sx={{ fontSize: 1 }}>ETH</Box>
          </Flex>
          <Button sx={{ mt: 2 }}>Open a Vault</Button>
        </Flex>
      </Card>
    </Card>
  );
};
