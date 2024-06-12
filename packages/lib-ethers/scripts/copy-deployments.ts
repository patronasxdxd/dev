import fs from "fs";
import path from "path";

// TODO update this script to support multiple collaterals and versions once the front end is updated to support this.
const outputDir = "deployments";
const inputDir = (channel: string, collateralName?: string, version?: string) => 
  collateralName && version 
    ? path.join("deployments", channel, collateralName, version)
    : path.join("deployments", channel)


// Define constants for the different channels that deployment files can come from.
const backfillChannel = "backfill";
const defaultChannel = process.env.DEFAULT_CHANNEL || "default";
const defaultCollateral = process.env.DEFAULT_COLLATERAL_SYMBOL || "eth";
const defaultVersion = process.env.DEFAULT_VERSION || "v1";

// Define a helper function that checks if a directory exists.
const exists = (dir: string) => {
  return fs.existsSync(dir) && fs.lstatSync(dir).isDirectory();
};

// Define a helper function that copies all the deployment files in a directory to the output directory.
const copyDeploymentsFrom = (deploymentsDir: string) => {
  // Get the list of files in the input directory.
  const deployments = fs.readdirSync(deploymentsDir);

  // For each file, copy it to the output directory.
  for (const deployment of deployments) {
    fs.copyFileSync(
      path.join(deploymentsDir, deployment),
      path.join(outputDir, deployment)
    );
  }
};

console.log(`Deployment channel: ${process.env.DEFAULT_CHANNEL ?? "default"}`);

copyDeploymentsFrom(inputDir(backfillChannel));
copyDeploymentsFrom(inputDir(defaultChannel, defaultCollateral, defaultVersion));
