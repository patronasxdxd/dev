import React from "react";
import { Flex, Image } from "theme-ui";

type GenericIconProps = React.ComponentProps<typeof Flex> & {
  height?: number | string;
  imgSrc: string;
  justifyContent?: string;
};

export const GenericIcon: React.FC<GenericIconProps> = ({ imgSrc, height, justifyContent, ...boxProps }) => (
  <Flex sx={{ lineHeight: 0, justifyContent }} {...boxProps}>
    <Image src={imgSrc} sx={{ height }} />
  </Flex>
);
