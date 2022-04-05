import React from "react";
import { Card, Flex } from "theme-ui";

type OpenVaultProps = {
  variant?: string;
};

export const OpenVault: React.FC<OpenVaultProps> = ({ variant = "mainCards" }) => {
  
  return (
    <Card {...{ variant }} sx={{pt:"18em"}}>
      <Flex sx={{
        alignItems: "center",
        justifyContent: "center",
        gap: ["1em", "1.5em", "4em"]
      }}>
        <Flex>
          
        </Flex>
        <Flex sx={{   
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",}}
        >
          <Flex sx={{ fontSize: ".9em", mb: ".2em", gap: 1 }}>
          </Flex>
          <Flex sx={{ fontSize: "1.8em", fontWeight: "bold", color: "text" }}>
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
};
