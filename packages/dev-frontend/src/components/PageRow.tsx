import { LiquityStoreState as ThresholdStoreState } from "@liquity/lib-base";
import { useThresholdSelector, VersionedCollateral } from "@liquity/lib-react";
import { useEffect, useState } from "react";
import { Box, Container, Flex, Heading } from "theme-ui";
import { SystemStatsCard } from "./SystemStatsCard";

type PageRowProps = {
  Component: (props: {version: string, collateral: string, isMintList: boolean}) => JSX.Element
  isWidthFull?: boolean
}

const select = ({ mintList }: ThresholdStoreState) => ({
  mintList
});

export const PageRow = ({ Component, isWidthFull }: PageRowProps ): JSX.Element => {
  const thresholdCollateralsStores = useThresholdSelector(select);
  const [notApprovedVersions, setNotApprovedVersions] = useState<VersionedCollateral[]>([]);
  const [approvedVersions, setApprovedVersions] = useState<VersionedCollateral[]>([]);
  const [isMounted, setIsMounted] = useState<boolean>(true);

  useEffect(() => {
    // Make sure the component is still mounted and we have the necessary data
    if (!thresholdCollateralsStores || !isMounted) {
      return;
    }

    // Create two separate lists for mintList-approved and not-approved collateral stores
    const mintListApproved: VersionedCollateral[] = [];
    const mintListNotApproved: VersionedCollateral[] = [];

    thresholdCollateralsStores.forEach((collateralStore) => {
      if (collateralStore.store.mintList === true) {
        // Add the collateral store to the approved list if it is on the mint list
        mintListApproved.push({
          version: collateralStore.version,
          collateral: collateralStore.collateral,
        });
      } else {
        // Add the collateral store to the not-approved list if it is not on the mint list
        mintListNotApproved.push({
          version: collateralStore.version,
          collateral: collateralStore.collateral,
        });
      }
    });

    // Update the state with the not-approved collateral stores
    setNotApprovedVersions(mintListNotApproved);

    // Update the state with the approved collateral stores
    setApprovedVersions(mintListApproved);

    // Set isMounted to false to prevent unnecessary re-renders
    return () => {
      setIsMounted(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Flex sx={{ flexDirection: "column", flexWrap: "wrap" }}>
      <Heading as="h3" sx={{ marginTop: "2em" }}>
        {approvedVersions.length > 0 && "Active Collaterals"}
      </Heading>
      <Container variant="pageRow">
        {approvedVersions.map((approvedVersion, index) => (
          <Box
            key={index}
            sx={{ width: ["100%", "100%", isWidthFull ? "100%" : "50%"], pr: [0, "1em", "2em"] }}
          >
            <Component
              key={approvedVersion.version}
              version={approvedVersion.version}
              collateral={approvedVersion.collateral}
              isMintList={true}
            />
          </Box>
        ))}
        {approvedVersions.length <= 1 && !isWidthFull && (
          <Container variant="secondHalf" sx={{ display: "flex", width: "100%" }}>
            <SystemStatsCard IsPriceEditable={false} />
          </Container>
        )}
      </Container>
      <Heading as="h3" sx={{ marginTop: "3em" }}>
        {notApprovedVersions.length > 0 && "Non-active Collaterals"}
      </Heading>
      <Container variant="pageRow">
        {notApprovedVersions.map((notApprovedVersion, index) => (
          <Box
            key={index}
            sx={{ width: ["100%", "100%", isWidthFull ? "100%" : "50%"], pr: [0, "1em", "2em"] }}
          >
            <Component
              key={notApprovedVersion.version}
              version={notApprovedVersion.version}
              collateral={notApprovedVersion.collateral}
              isMintList={false}
            />
          </Box>
        ))}
      </Container>
    </Flex>
  );
};
