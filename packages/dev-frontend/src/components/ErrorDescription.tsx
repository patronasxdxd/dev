import { Box, Close, Flex, Text } from "theme-ui";

import { Icon } from "./Icon";
import { useState } from "react";

type ErrorDescriptionProps = {
  children: React.ReactNode
}

export const ErrorDescription= ({ children }: ErrorDescriptionProps): JSX.Element => {
  const [isVisible, setIsVisible] = useState(true);
  if (!isVisible) return <></>;
  
  return <Box
    sx={{
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-around",
      mt: "1.5em", 
      mb: "0.9em", 
      p: "0.8em",
      color: "white",
      border: 1,
      borderRadius: "8px",
      borderColor: "danger",
      boxShadow: 2,
      bg: "red"
    }}
  >
    <Flex sx={{ alignItems: "center", fontSize: "0.85em" }}>
      <Icon name="exclamation-triangle" size="lg" />
      <Text sx={{ ml: 2 }}>{children}</Text>
    </Flex>
    <Close sx={{ cursor: 'pointer' }} onClick={() => setIsVisible(false)} />
  </Box>
};
