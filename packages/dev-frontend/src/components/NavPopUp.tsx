import React from "react";
import { Container, Flex, Box } from "theme-ui";

export const NavPopUp: React.FC = ({ children }) => {

  return (
    <Container sx={{right: 0}}>
      <Flex sx={{ alignItems: "start", flex: 1 }}>
        <Box variant="layout.sidenav">
          {children}
        </Box>
      </Flex>
    </Container>
  );
};
