import { LiquityStoreState as ThresholdStoreState } from "@liquity/lib-base";
import { useThresholdSelector } from "@liquity/lib-react";
import { useEffect, useState } from "react";
import { Box, Container, Flex, Heading } from "theme-ui";
import { SystemStatsCard } from "./SystemStatsCard";

type PageRowProps = {
  Component: (props: {version: string, isMintList: boolean}) => JSX.Element
  isWidthFull?: boolean
}

const select = ({ mintList }: ThresholdStoreState) => ({
  mintList
});

export const PageRow = ({ Component, isWidthFull }: PageRowProps ): JSX.Element => {
  const mintLists = useThresholdSelector(select);
  const [notApprovedVersions, setNotApprovedVersions] = useState<string[]>([]);
  const [approvedVersions, setApprovedVersions] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState<boolean>(true);

  useEffect(() => {
    if (!mintLists || !isMounted) {
      return
    }
    let mintListApproved = []
    let mintListNotApproved = []
    
    for (const [version] of Object.entries(mintLists)) {
      if (mintLists[version].mintList === true) {
        mintListApproved.push(version)
      } else {
        mintListNotApproved.push(version)
      }
    }
    setApprovedVersions(mintListApproved)
    setNotApprovedVersions(mintListNotApproved)
    return () => {
      setIsMounted(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <Flex sx={{ flexDirection: "column", flexWrap: "wrap", }}>
    <Heading as="h3" sx={{ marginTop: "2em" }}>{approvedVersions.length > 0 && "Active Collaterals"}</Heading>
    <Container variant="pageRow">
      {approvedVersions.map((version, index) => 
        <Box key={index} sx={{ width: ["100%", "100%", isWidthFull ? "100%" : "50%"], pr: [0, "1em", "2em"] }}>
          <Component key={version} version={version} isMintList={true} />
        </Box>
      )}
      {(approvedVersions.length <= 1 && !isWidthFull) && (
        <Container variant="secondHalf" sx={{display: "flex", width: "100%"}}>
          <SystemStatsCard IsPriceEditable={false} />
        </Container>
      )}
    </Container>
    <Heading as="h3" sx={{ marginTop: "3em" }}>{notApprovedVersions.length > 0 && "Non-active Collaterals"}</Heading>
    <Container variant="pageRow">
      {notApprovedVersions.map((version, index) => 
        <Box key={index} sx={{ width: ["100%", "100%", isWidthFull ? "100%" : "50%"], pr: [0, "1em", "2em"] }}>
          <Component key={version} version={version} isMintList={false} />
        </Box>
      )}
    </Container>
  </Flex>
};
