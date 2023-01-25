import { Box, Flex, Text } from "theme-ui";

import { GenericIcon } from "./GenericIcon";

type ActionDescriptionProps = {
  children: React.ReactNode
  title?: string;
};

export const ActionDescription = ({ title, children }: ActionDescriptionProps): JSX.Element => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-around",
      mt: "1.5em", 
      mb: "0.9em", 
      p: "0.9em",

      border: 1,
      borderRadius: "8px",
      borderColor: "accent",
      bg: "rgba(250, 253, 255)"
    }}
  >
    <Flex sx={{ alignItems: "center", fontSize: "0.9em" }}>
      <GenericIcon imgSrc="./icons/rounded-info.svg" height={"18px"} />
      <Flex sx={{ alignItems: "start", flexDirection: "column", ml: "1.8em", gap: "0.5em" }}>
        <Text sx={{ color: "black" }}>{title}</Text>
        <Text sx={{ color: "grey" }}>{children}</Text>
      </Flex>
    </Flex>
  </Box>
);

type AmountProps = {
  children: React.ReactNode
}

export const Amount = ({ children }: AmountProps): JSX.Element => (
  <Text sx={{ whiteSpace: "nowrap" }}>{children}</Text>
);
