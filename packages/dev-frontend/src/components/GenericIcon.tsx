import React from "react";
import { Box, Image } from "theme-ui";

type GenericIconProps = React.ComponentProps<typeof Box> & {
  height?: number | string;
  imgSrc: string;
};

export const GenericIcon: React.FC<GenericIconProps> = ({ imgSrc, height, ...boxProps }) => (
  <Box sx={{ lineHeight: 0 }} {...boxProps}>
    <Image src={imgSrc} sx={{ height }} />
  </Box>
);
