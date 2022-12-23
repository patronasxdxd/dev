import React from "react";
import { Flex } from "theme-ui";

type BadgeProps = {
  children: React.ReactNode
}

export const Badge = ({ children }: BadgeProps): JSX.Element => {
  return <Flex variant="layout.badge">{children}</Flex>;
};
