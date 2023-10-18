import assert from "assert";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import "colors";

import { JsonFragment } from "@ethersproject/abi";
import { Wallet } from "@ethersproject/wallet";
import { Signer } from "@ethersproject/abstract-signer";
import { ContractFactory, Overrides } from "@ethersproject/contracts";

import { task, HardhatUserConfig, types, extendEnvironment } from "hardhat/config";
import { HardhatRuntimeEnvironment, NetworkUserConfig } from "hardhat/types";
import "@nomiclabs/hardhat-ethers";

import { Decimal } from "@liquity/lib-base";

import { deployAndSetupContracts, deployTellorCaller, initiatePCVAndWithdrawFromBamm, setSilent, transferContractsOwnership } from "./utils/deploy";
import { _connectToContracts, _LiquityDeploymentJSON, _priceFeedIsTestnet } from "./src/contracts";

import accounts from "./accounts.json";
import { getFolderInfo } from "./utils/fsScripts";
import { mkdir, writeFile } from "fs/promises";
import { ZERO_ADDRESS, MAINNET_TBTC_ADDRESS, SEPOLIA_TBTC_ADDRESS } from "./utils/constants";

interface IOracles {
  chainlink: string,
  tellor: string,
}

export interface IAssets {
  eth: IOracles,
  tbtc: IOracles,
}

export interface INetworkOracles {
  mainnet: IAssets,
  goerli: IAssets,
  sepolia: IAssets,
}

export interface IQueryIds {
  ["eth"]: string,
  ["tbtc"]: string,
}

dotenv.config();

const numAccounts = 100;

const useLiveVersionEnv = (process.env.USE_LIVE_VERSION ?? "false").toLowerCase();
const useLiveVersion = !["false", "no", "0"].includes(useLiveVersionEnv);

const contractsDir = path.join("..", "contracts");
const artifacts = path.join(contractsDir, "artifacts");
const cache = path.join(contractsDir, "cache");

const contractsVersion = fs
  .readFileSync(path.join(useLiveVersion ? "live" : artifacts, "version"))
  .toString()
  .trim();

if (useLiveVersion) {
  console.log(`Using live version of contracts (${contractsVersion}).`.cyan);
}

const generateRandomAccounts = (numberOfAccounts: number) => {
  const accounts = new Array<string>(numberOfAccounts);

  for (let i = 0; i < numberOfAccounts; ++i) {
    accounts[i] = Wallet.createRandom().privateKey;
  }

  return accounts;
};

const deployerAccount = process.env.DEPLOYER_PRIVATE_KEY || Wallet.createRandom().privateKey;
const devChainRichAccount = "0x4d5db4107d237df6a3d58ee5f70ae63d73d7658d4026f2eefd2f204c81682cb7";

const infuraApiKey = "ad9cef41c9c844a7b54d10be24d416e5";

const infuraNetwork = (name: string): { [name: string]: NetworkUserConfig } => ({
  [name]: {
    url: `https://${name}.infura.io/v3/${infuraApiKey}`,
    accounts: [deployerAccount]
  }
});

// https://docs.chain.link/docs/ethereum-addresses
// https://docs.tellor.io/tellor/the-basics/contracts-reference

export const oracleAddresses: INetworkOracles = {
  mainnet: {
    tbtc: {
      chainlink: "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c",
      tellor: "0xD9157453E2668B2fc45b7A803D3FEF3642430cC0"
    },
    eth: {
      chainlink: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
      tellor: "0xD9157453E2668B2fc45b7A803D3FEF3642430cC0"
    }
  },
  goerli: {
    tbtc: {
      chainlink: "0xA39434A63A52E749F02807ae27335515BA4b07F7",
      tellor: "0xD9157453E2668B2fc45b7A803D3FEF3642430cC0"
    },
    eth: {
      chainlink: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
      tellor: "0xD9157453E2668B2fc45b7A803D3FEF3642430cC0"
    }
  },
  sepolia: {
    tbtc: {
      chainlink: "0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43",
      tellor: "0x199839a4907ABeC8240D119B606C98c405Bb0B33"
    },
    eth: {
      chainlink: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
      tellor: "0x199839a4907ABeC8240D119B606C98c405Bb0B33"
    }
  },
};

export const tellorQueryIds: IQueryIds = {
  eth: "0x83a7f3d48786ac2667503a61e8c415438ed2922eb86a2906e4ee66d9a2ce4992",
  tbtc: "0xa6f013ee236804827b77696d350e9f0ac3e879328f2a3021d473a0b778ad78ac"
};

const hasOracles = (network: string): network is keyof typeof oracleAddresses =>
  network in oracleAddresses;

const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      accounts: accounts.slice(0, numAccounts),

      gas: 12e6, // tx gas limit
      blockGasLimit: 12e6,

      // Let Ethers throw instead of Buidler EVM
      // This is closer to what will happen in production
      throwOnCallFailures: false,
      throwOnTransactionFailures: false
    },

    dev: {
      url: "http://localhost:8545",
      accounts: [deployerAccount, devChainRichAccount, ...generateRandomAccounts(numAccounts - 2)]
    },

    ...infuraNetwork("goerli"),
    ...infuraNetwork("sepolia"),
    ...infuraNetwork("mainnet")
  },

  paths: {
    artifacts,
    cache
  }
};

declare module "hardhat/types/runtime" {
  interface HardhatRuntimeEnvironment {
    deployLiquity: (
      deployer: Signer,
      oracleAddresses: INetworkOracles,
      firstCollateralSymbol: (keyof IAssets),
      firstCollateralAddress: string,
      secondCollateralSymbol: (keyof IAssets),
      secondCollateralAddress: string,
      delay?: number,
      stablecoinAddress?: string,
      contractsVersion?: string,
      useRealPriceFeed?: boolean,
      overrides?: Overrides
    ) => Promise<_LiquityDeploymentJSON[]>;
  }
}

const getLiveArtifact = (name: string): { abi: JsonFragment[]; bytecode: string } =>
  require(`./live/${name}.json`);

  const getContractFactory: (
    env: HardhatRuntimeEnvironment
  ) => (name: string, signer: Signer) => Promise<ContractFactory> = useLiveVersion
    ? env => (name, signer) => {
        const { abi, bytecode } = getLiveArtifact(name);
        return env.ethers.getContractFactory(abi, bytecode, signer);
      }
    : env => env.ethers.getContractFactory;

extendEnvironment(env => {
  env.deployLiquity = async (
    deployer,
    oracleAddresses,
    firstCollateralSymbol = "eth",
    firstCollateralAddress = ZERO_ADDRESS,
    secondCollateralSymbol = "tbtc",
    secondCollateralAddress = MAINNET_TBTC_ADDRESS,
    delay = 90 * 24 * 60 * 60,
    stablecoinAddress = "",
    contractsVersion = "v1",
    useRealPriceFeed = false,
    overrides?: Overrides
  ) => await deployAndSetupContracts(
      deployer,
      oracleAddresses,
      firstCollateralSymbol,
      firstCollateralAddress,
      secondCollateralSymbol,
      secondCollateralAddress,
      getContractFactory(env),
      delay,
      stablecoinAddress,
      contractsVersion,
      useRealPriceFeed,
      env.network.name === "dev",
      overrides
    );
});

type DeployParams = {
  channel: string;
  firstCollateralSymbol: keyof IAssets;
  firstCollateralAddress: string;
  secondCollateralSymbol: keyof IAssets;
  secondCollateralAddress: string
  contractsVersion: string;
  delay: number;
  stablecoinAddress: string;
  gasPrice?: number;
  useRealPriceFeed?: boolean;
};

const defaultChannel = process.env.DEFAULT_CHANNEL || "default";
const firstDefaultCollateralSymbol = process.env.FIRST_DEFAULT_COLLATERAL_SYMBOL || "eth";
const firstDefaultCollateralAddress = process.env.FIRST_DEFAULT_COLLATERAL_ADDRESS || ZERO_ADDRESS;
const secondDefaultCollateralSymbol = process.env.SECOND_DEFAULT_COLLATERAL_SYMBOL || "tbtc";
const secondDefaultCollateralAddress = process.env.SECOND_DEFAULT_COLLATERAL_ADDRESS || MAINNET_TBTC_ADDRESS;
const defaultVersion = process.env.DEFAULT_VERSION || "v1";
const defaultThusdAddress = process.env.DEFAULT_THUSD_ADDRESS || "";
const defaultDelay = process.env.DEFAULT_DELAY || 90 * 24 * 60 * 60;

task("deploy", "Deploys the contracts to the network")
  .addOptionalParam("channel", "Deployment channel to deploy into", defaultChannel, types.string)
  .addOptionalParam("firstCollateralSymbol", "Asset symbol to use as collateral", firstDefaultCollateralSymbol, types.string)
  .addOptionalParam("firstCollateralAddress", "Asset address to use as collateral", firstDefaultCollateralAddress, types.string)
  .addOptionalParam("secondCollateralSymbol", "Asset symbol to use as collateral", secondDefaultCollateralSymbol, types.string)
  .addOptionalParam("secondCollateralAddress", "Asset address to use as collateral", secondDefaultCollateralAddress, types.string)
  .addOptionalParam("contractsVersion", "Version of contracts for collateral type", defaultVersion, types.string)
  .addOptionalParam("gasPrice", "Price to pay for 1 gas [Gwei]", undefined, types.float)
  .addOptionalParam(
    "useRealPriceFeed",
    "Deploy the production version of PriceFeed and connect it to Chainlink",
    undefined,
    types.boolean
  )
  .addOptionalParam(
    "delay",
    "Governance time set to thUSD contract",
    defaultDelay,
    types.int
  )
  .addOptionalParam(
    "stablecoinAddress",
    "Address of existing stablecoin to add the new collateral to",
    defaultThusdAddress,
    types.string
  )
  .setAction(
    async ({ 
      channel, 
      firstCollateralSymbol, 
      firstCollateralAddress, 
      secondCollateralSymbol, 
      secondCollateralAddress, 
      contractsVersion, 
      delay, 
      stablecoinAddress, 
      gasPrice, 
      useRealPriceFeed 
    }: DeployParams, env) => {     
      const overrides = { gasPrice: gasPrice && Decimal.from(gasPrice).div(1000000000).hex };
      const [deployer] = await env.ethers.getSigners();
      useRealPriceFeed ??= env.network.name === "mainnet";

      if (useRealPriceFeed && !hasOracles(env.network.name)) {
        throw new Error(`PriceFeed not supported on ${env.network.name}`);
      }

      console.log('network', env.network.name);
      console.log('firstCollateralSymbol', firstCollateralSymbol);
      console.log('firstCollateralAddress', firstCollateralAddress);
      console.log('secondCollateralSymbol', secondCollateralSymbol);
      console.log('secondCollateralAddress', secondCollateralAddress);
      console.log('version', contractsVersion);
      console.log('delay', delay);
      console.log('stablecoin address:', stablecoinAddress);
      console.log('gas price: ', gasPrice);
      setSilent(false);

      const deployments = await env
        .deployLiquity(
          deployer, 
          oracleAddresses, 
          firstCollateralSymbol, 
          firstCollateralAddress,
          secondCollateralSymbol, 
          secondCollateralAddress, 
          delay, 
          stablecoinAddress, 
          contractsVersion,
          useRealPriceFeed,
          overrides
        );

      for (const deployment of deployments) {
        const contracts = _connectToContracts(deployer, deployment);

        if (useRealPriceFeed) {
          assert(!_priceFeedIsTestnet(contracts.priceFeed));

          if (hasOracles(env.network.name)) {
            const tellorCallerAddress = await deployTellorCaller(
              deployer,
              getContractFactory(env),
              oracleAddresses[env.network.name][deployment.collateralSymbol as keyof IAssets].tellor,
              tellorQueryIds[deployment.collateralSymbol as keyof IQueryIds],
              overrides
            );

            console.log(`Hooking up PriceFeed with oracles ...`);

            const tx = await contracts.priceFeed.setAddresses(
              oracleAddresses[env.network.name][deployment.collateralSymbol as keyof IAssets].chainlink,
              tellorCallerAddress,
              overrides
            );

            await tx.wait();
          }
        }

        await initiatePCVAndWithdrawFromBamm(contracts, deployer, overrides);

        console.log("Transferring Contracts Ownership...");
        await transferContractsOwnership(contracts, deployer, overrides);
        
        const deploymentChannelPath = path.posix.join("deployments", channel);

        try {
          await mkdir(path.join("deployments", channel, deployment.collateralSymbol, contractsVersion), { recursive: true });
          await writeFile(
            path.join("deployments", channel, deployment.collateralSymbol, contractsVersion, `${env.network.name}.json`),
            JSON.stringify(deployment, undefined, 2),
            { flag: 'w+' } // add the flag option to overwrite the file if it exists
          );
        
          const folderInfo = await getFolderInfo(deploymentChannelPath);
        
          await mkdir(path.join("deployments", "collaterals"), { recursive: true });
          await writeFile(
            path.join("deployments", "collaterals", "collaterals.json"),
            JSON.stringify(folderInfo, null, 2),
            { flag: 'w+' } // add the flag option to overwrite the file if it exists
          );
        } catch (err) {
          console.error(err);
        }

        console.log();
        console.log(deployment);
        console.log();
      }
    }
  );

export default config;
