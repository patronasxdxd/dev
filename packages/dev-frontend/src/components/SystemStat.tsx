import React from "react";
import { Card, Flex } from "theme-ui";
import { InfoIcon } from "./InfoIcon";

type SystemStatProps = {
  info?: React.ReactNode;
  tooltip?: React.ReactNode;
  children: React.ReactNode
};

export const SystemStat = ({ info, tooltip, children }: SystemStatProps): JSX.Element => {
    return (
      <Flex sx={{
        justifyContent: "space-between",
        color: "text",
        fontWeight: "bold"
      }}>
        <Flex sx={{ gap: "4px" }}>
          {info}
          {tooltip && <InfoIcon size="sm" tooltip={<Card variant="tooltip">{tooltip}</Card>} />}
        </Flex>
        {children}
      </Flex>
  );
};
