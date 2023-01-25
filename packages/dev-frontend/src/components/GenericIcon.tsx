import React from "react";
import { Box, Image } from "theme-ui";

type GenericIconProps = React.ComponentProps<typeof Box> & {
  height?: number | string;
  imgSrc: string;
};

export const GenericIcon = ({ imgSrc, height, ...boxProps }: GenericIconProps): JSX.Element => (
  <Box sx={{ lineHeight: 0 }} {...boxProps}>
    <Image src={imgSrc} sx={{ height }} />
  </Box>
);
