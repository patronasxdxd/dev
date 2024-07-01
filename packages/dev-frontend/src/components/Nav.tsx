import { Flex, Box } from "theme-ui";
import { Link } from "./Link";
import { Icon } from "./Icon";

import { ExternalLinks } from "./ExternalLinks";
import { UserAccount } from "./UserAccount";
import { UserNetwork } from "./UserNetwork";

export const Nav = (): JSX.Element => {
  return (
    <Box sx={{
      bg: "background",
      display: "flex",
      justifyContent: "space-between",
      flexDirection: "column",
      width: "100%"
    }}>
      <Flex sx={{
        display: "flex",
        flexGrow: 1,
        flexDirection: "column",
      }}>
        <Link to="/">
          <Icon name="chart-bar" />
          Dashboard
        </Link>
        <Link to="/borrow" >
          <Flex sx={{ transform: "rotate(155deg)" }}>
            <Icon name="exchange-alt" />
          </Flex>
          Borrow
        </Link>
        <Link to="/redemption">
          <Icon name="check" />
          Redeem
        </Link>
        <Link to="/vaults">
          <Icon name="chart-pie" />
          Vaults
        </Link>
        <Link to="/stability">
          <Icon name="chart-line" />
          Stability
        </Link>
        <Flex sx={{ mt:"1.5em", gap: "1.5em", flexDirection: "column", alignSelf: "center", display: ["flex", "none"] }}>
          <UserAccount />
          <UserNetwork />
        </Flex>
      </Flex>
      <Flex sx={{ justifyContent: "end", flexDirection: "column", flex: 1 }}>
        <ExternalLinks />
      </Flex>
    </Box>
  );
};
