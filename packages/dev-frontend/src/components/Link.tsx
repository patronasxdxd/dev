import { NavLink as RouterLink, NavLinkProps as RouterLinkProps } from "react-router-dom";
import { NavLink as ThemeUINavLink, NavLinkProps as ThemeUILinkProps } from "theme-ui";

type CombinedProps = ThemeUILinkProps & RouterLinkProps<{}>;

const ExactLink = (props: CombinedProps): JSX.Element => {
  return <RouterLink exact {...props} />;
};

export const Link = (props: CombinedProps): JSX.Element => {
  return <ThemeUINavLink {...props} as={ExactLink} />;
};
