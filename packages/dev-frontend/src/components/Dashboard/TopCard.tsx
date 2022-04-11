import React from "react";
import { Card, Flex } from "theme-ui";
import { InfoIcon } from "../InfoIcon";

import { GenericIcon } from "../GenericIcon";

type TopCardProps = {
  name: React.ReactNode;
  tooltip?: React.ReactNode;
  imgSrc: string
};

export const TopCard: React.FC<TopCardProps> = ({ name, tooltip, imgSrc, children }) => {
    return (
      <Flex sx={{
        alignItems: "center",
        justifyContent: "center",
        gap: ["1em", "1.5em", "3.5em"],
        py: "1em"
      }}>
        <Flex sx={{minWidth: "72px"}}>
          <GenericIcon imgSrc={imgSrc} height="72px" />
        </Flex>
        <Flex sx={{   
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <Flex sx={{ fontSize: "1em", mb: ".2em", gap: 1 }}>
            {name}
            <InfoIcon size="sm" tooltip={<Card variant="tooltip">{tooltip}</Card>} />
          </Flex>
          <Flex sx={{ fontSize: "1.9em", fontWeight: "bold", color: "text" }}>
            {children}
          </Flex>
        </Flex>
      </Flex>
  );
};
