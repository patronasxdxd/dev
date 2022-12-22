import { Box, Container } from "theme-ui";
import { useThreshold } from "../hooks/ThresholdContext";
import { SystemStatsCard } from "./SystemStatsCard";
import { VaultProps } from "./Trove/Vault";

type PageRowProps = {
  Component: (props: VaultProps) => JSX.Element
}

export const PageRow = ({ Component }: PageRowProps ): JSX.Element => {
  const { threshold } = useThreshold();

  return <Container variant="pageRow">
  {Object.keys(threshold).map((version, index) => 
    <Box key={index} sx={{ width: ["100%", "100%", "50%"], pr: [0, "1em", "2em"] }}>
      <Component key={version} version={version} />
    </Box>
  )}
  {Object.keys(threshold).length <= 1 && (
    <Box sx={{ width: ["100%", "100%", "50%"], pr: [0, "1em", "2em"] }}>
      <SystemStatsCard />
    </Box>
  )}
</Container>
};
