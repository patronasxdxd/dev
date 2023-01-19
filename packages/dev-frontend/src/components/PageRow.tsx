import { LiquityStoreState as ThresholdStoreState } from "@liquity/lib-base";
import { useThresholdSelector } from "@liquity/lib-react";
import { useEffect, useState } from "react";
import { Box, Container } from "theme-ui";
import { SystemStatsCard } from "./SystemStatsCard";

type PageRowProps = {
  Component: (props: {version: string}) => JSX.Element
  isWidthFull?: boolean
}

const select = ({ mintList }: ThresholdStoreState) => ({
  mintList
});

export const PageRow = ({ Component, isWidthFull }: PageRowProps ): JSX.Element => {
  const mintLists = useThresholdSelector(select);
  const [versions, setVersions] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState<boolean>(true);

  useEffect(() => {
    if (!mintLists || !isMounted) {
      return
    }
    let mintListApproved = []
    
    for (const [version] of Object.entries(mintLists)) {
      if (mintLists[version].mintList === true) {
        mintListApproved.push(version)
      }
    }
    setVersions(mintListApproved)
    return () => {
      setIsMounted(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <Container variant="pageRow">
  {versions.map((version, index) => 
    <Box key={index} sx={{ width: ["100%", "100%", isWidthFull ? "100%" : "50%"], pr: [0, "1em", "2em"] }}>
      <Component key={version} version={version} />
    </Box>
  )}
  {(versions.length <= 1 && !isWidthFull) && (
    <Box sx={{ width: ["100%", "100%", "50%"], pr: [0, "1em", "2em"] }}>
      <SystemStatsCard />
    </Box>
  )}
</Container>
};
