import { Container, Flex, Box } from "theme-ui";

type NavPopUpProps = {
  children: React.ReactNode
}

export const NavPopUp = ({ children }: NavPopUpProps): JSX.Element => {
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
