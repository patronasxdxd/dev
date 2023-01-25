import { Container } from "theme-ui";

type SideBarProps = {
  children: React.ReactNode
}

export const SideBar = ({ children }: SideBarProps): JSX.Element => {
  return (
    <Container variant="sideBar">
      {children}
    </Container>
  );
};
