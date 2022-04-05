import React from "react";
import { Card, Flex } from "theme-ui";
import { InfoIcon } from "../InfoIcon";

import { GenericIcon } from "../GenericIcon";

type InfoDataProps = {
  name: React.ReactNode;
  tooltip?: React.ReactNode;
  imgSrc: string
  logoHeight?: string | number;
};

export const InfoData: React.FC<InfoDataProps> = ({ name, tooltip, imgSrc, logoHeight, children }) => {
    return (
      <Flex sx={{
        alignItems: "center",
        justifyContent: "center",
        gap: ["1em", "1.5em", "4em"]
      }}>
        <Flex>
          <GenericIcon imgSrc={imgSrc} height={logoHeight} />
        </Flex>
        <Flex sx={{   
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",}}
        >
          <Flex sx={{ fontSize: ".9em", mb: ".2em", gap: 1 }}>
            {name}
            {<InfoIcon size="sm" tooltip={<Card variant="tooltip">{tooltip}</Card>} />}
          </Flex>
          <Flex sx={{ fontSize: "1.8em", fontWeight: "bold", color: "text" }}>
            {children}
          </Flex>
        </Flex>
      </Flex>
  );
};
