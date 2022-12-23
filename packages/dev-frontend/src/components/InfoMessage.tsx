import { Box, Flex, Text } from "theme-ui";

type InfoMessageProps = {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode
};

export const InfoMessage = ({ title, children, icon }: InfoMessageProps): JSX.Element => (
  <Box sx={{ mx: 2, fontSize: "0.85em" }}>
    <Flex sx={{ alignItems: "center" }}>
      {icon && (
        <Box sx={{ mr: "12px" }}>{icon}</Box>
      )}
      <Text sx={{ mb: 2,  fontWeight: "bold" }}>{title}</Text>
    </Flex>
    <Text sx={{ color: "greytext" }}>{children}</Text>
  </Box>
);
