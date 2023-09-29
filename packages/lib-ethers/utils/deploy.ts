import { Signer } from "@ethersproject/abstract-signer";
import { ContractTransaction, ContractFactory, Overrides } from "@ethersproject/contracts";
import { IAssets, INetworkOracles } from "../hardhat.config";
import {
  _LiquityContractAddresses,
  _LiquityContracts,
  _LiquityDeploymentJSON,
  _connectToContracts
} from "../src/contracts";

interface IOwners {
  feePool: string
  bammOwner: string
  governorBravo: string
}

const contractOwners: IOwners = {
  feePool: "0x7095F0B91A1010c11820B4E263927835A4CF52c9",
  // Waiting for the bamm owner multisig 
  bammOwner: "0x0000000000000000000000000000000000000001",
  governorBravo: "0x87F005317692D05BAA4193AB0c961c69e175f45f"
}

let silent = true;

export const log = (...args: unknown[]): void => {
  if (!silent) {
    console.log(...args);
  }
};

export const setSilent = (s: boolean): void => {
  silent = s;
};

const deployContractAndGetBlockNumber = async (
  deployer: Signer,
  getContractFactory: (name: string, signer: Signer) => Promise<ContractFactory>,
  contractName: string,
  ...args: unknown[]
): Promise<[address: string, blockNumber: number]> => {
  log(`Deploying ${contractName} ...`);
  const contract = await (await getContractFactory(contractName, deployer)).deploy(...args);

  log(`Waiting for transaction ${contract.deployTransaction.hash} ...`);
  const receipt = await contract.deployTransaction.wait();

  log({
    contractAddress: contract.address,
    blockNumber: receipt.blockNumber,
    gasUsed: receipt.gasUsed.toNumber()
  });

  log();

  return [contract.address, receipt.blockNumber];
};

const deployContract: (
  ...p: Parameters<typeof deployContractAndGetBlockNumber>
) => Promise<string> = (...p) => deployContractAndGetBlockNumber(...p).then(([a]) => a);

const deployContracts = async (
  deployer: Signer,
  oracleAddresses: INetworkOracles,
  collateralSymbol: keyof IAssets,
  collateralAddress: string | undefined,
  getContractFactory: (name: string, signer: Signer) => Promise<ContractFactory>,
  delay: number,
  _useRealPriceFeed: boolean,
  overrides?: Overrides
): Promise<[addresses: Omit<_LiquityContractAddresses, "thusdToken" | "bamm">, startBlock: number]> => {
  const [activePoolAddress, startBlock] = await deployContractAndGetBlockNumber(
    deployer,
    getContractFactory,
    "ActivePool",
    { ...overrides }
  );

  const addresses = {
    activePool: activePoolAddress,
    borrowerOperations: await deployContract(deployer, getContractFactory, "BorrowerOperations", {
      ...overrides
    }),
    troveManager: await deployContract(deployer, getContractFactory, "TroveManager", {
      ...overrides
    }),
    collSurplusPool: await deployContract(deployer, getContractFactory, "CollSurplusPool", {
      ...overrides
    }),
    defaultPool: await deployContract(deployer, getContractFactory, "DefaultPool", { ...overrides }),
    hintHelpers: await deployContract(deployer, getContractFactory, "HintHelpers", { ...overrides }),
    pcv: await deployContract(deployer, getContractFactory, "PCV", delay, { ...overrides }),
    sortedTroves: await deployContract(deployer, getContractFactory, "SortedTroves", {
      ...overrides
    }),
    stabilityPool: await deployContract(deployer, getContractFactory, "StabilityPool", {
      ...overrides
    }),
    bLens: await deployContract(deployer, getContractFactory, "BLens", {
      ...overrides
    }),
    gasPool: await deployContract(deployer, getContractFactory, "GasPool", {
      ...overrides
    }),
    erc20: (collateralAddress !== undefined) 
    ? collateralAddress
    : await deployContract(deployer, getContractFactory, "ERC20Test", {
      ...overrides
    }),
    priceFeed: await deployContract(
      deployer,
      getContractFactory,
      _useRealPriceFeed ? "PriceFeed" : "PriceFeedTestnet",
      8,
      { ...overrides }
    ),
  };

  const chainlink = (_useRealPriceFeed === true) 
    ? oracleAddresses["mainnet"][collateralSymbol as keyof IAssets]["chainlink"]
    : await deployContract(
        deployer,
        getContractFactory,
        "ChainlinkTestnet",
        addresses.priceFeed,
        { ...overrides }
      )

  return [
    {
      ...addresses,
      chainlink: chainlink as string,
      multiTroveGetter: await deployContract(
        deployer,
        getContractFactory,
        "MultiTroveGetter",
        addresses.troveManager,
        addresses.sortedTroves,
        { ...overrides }
      )
    },
    startBlock
  ];
};

export const deployTellorCaller = (
  deployer: Signer,
  getContractFactory: (name: string, signer: Signer) => Promise<ContractFactory>,
  tellorAddress: string,
  queryId: string,
  overrides?: Overrides
): Promise<string> =>
  deployContract(deployer, getContractFactory, "TellorCaller", tellorAddress, queryId, { ...overrides });

const connectContracts = async (
  {
    activePool,
    borrowerOperations,
    troveManager,
    thusdToken,
    collSurplusPool,
    defaultPool,
    hintHelpers,
    pcv,
    priceFeed,
    sortedTroves,
    stabilityPool,
    bamm,
    bLens,
    chainlink,
    gasPool,
    erc20
  }: _LiquityContracts,
  deployer: Signer,
  overrides?: Overrides
) => {
  if (!deployer.provider) {
    throw new Error("Signer must have a provider.");
  }

  const txCount = await deployer.provider.getTransactionCount(deployer.getAddress());

  const connections: ((nonce: number) => Promise<ContractTransaction>)[] = [
    nonce =>
      sortedTroves.setParams(1e6, troveManager.address, borrowerOperations.address, {
        ...overrides,
        nonce
      }),

    nonce => 
      troveManager.setAddresses(
        borrowerOperations.address,
        activePool.address,
        defaultPool.address,
        stabilityPool.address,
        gasPool.address,
        collSurplusPool.address,
        priceFeed.address,
        thusdToken.address,
        sortedTroves.address,
        pcv.address,
        { ...overrides, nonce }
      ),

    nonce =>
      borrowerOperations.setAddresses(
        troveManager.address,
        activePool.address,
        defaultPool.address,
        stabilityPool.address,
        gasPool.address,
        collSurplusPool.address,
        priceFeed.address,
        sortedTroves.address,
        thusdToken.address,
        pcv.address,
        erc20.address,
        { ...overrides, nonce }
      ),

    nonce =>
      stabilityPool.setAddresses(
        borrowerOperations.address,
        troveManager.address,
        activePool.address,
        thusdToken.address,
        sortedTroves.address,
        priceFeed.address,
        erc20.address,
        { ...overrides, nonce }
      ),

    nonce => 
      activePool.setAddresses(
        borrowerOperations.address,
        troveManager.address,
        stabilityPool.address,
        defaultPool.address,
        collSurplusPool.address,
        erc20.address,
        { ...overrides, nonce }
      ),

    nonce => 
      defaultPool.setAddresses(troveManager.address, activePool.address, erc20.address, {
        ...overrides,
        nonce
      }),

    nonce =>  
      collSurplusPool.setAddresses(
        borrowerOperations.address,
        troveManager.address,
        activePool.address,
        erc20.address,
        { ...overrides, nonce }
      ),

    nonce =>
      hintHelpers.setAddresses(sortedTroves.address, troveManager.address, {
        ...overrides,
        nonce
      }),

    nonce => 
      pcv.setAddresses(
        thusdToken.address,
        borrowerOperations.address,
        bamm.address,
        erc20.address,
        { ...overrides, nonce }
      )
  ];

  for (const [index, connect] of connections.entries()) {
    await connect(txCount + index)    
      .then(async (tx: ContractTransaction) =>  await tx.wait())
      .then(() => log(`Connected ${index}`))
  }
};

export const isDeployerOwner = async (
  contract: { owner: () => Promise<string> },
  deployerAddress: string
): Promise<boolean> => {
  const ownerAddress = await contract.owner();
  return ownerAddress.toLowerCase() === deployerAddress.toLowerCase();
};

export const transferContractsOwnership = async (
  {
    thusdToken,
    pcv,
    priceFeed,
    bamm
  }: _LiquityContracts,
  deployer: Signer,
  overrides?: Overrides
): Promise<void> => {
  if (!deployer.provider) {
    throw new Error("Signer must have a provider.");
  }
  const deployerAddress = await deployer.getAddress();
  const txCount = await deployer.provider.getTransactionCount(deployerAddress);

  const contracts: ((nonce: number) => Promise<ContractTransaction | undefined>)[] = [
    // No ownership check for pcv and priceFeed
    nonce => pcv.transferOwnership(
      process.env.GOVERNOR_BRAVO || contractOwners["governorBravo"],
      {
        ...overrides,
        nonce
      }
    ),

    nonce => priceFeed.transferOwnership(
      process.env.GOVERNOR_BRAVO || contractOwners["governorBravo"],
      {
        ...overrides,
        nonce
      }
    ),

    nonce => bamm.transferOwnership(
      process.env.GOVERNOR_BRAVO || contractOwners["governorBravo"],
      {
        ...overrides,
        nonce
      }
    ),

    async nonce => {
      if (await isDeployerOwner(thusdToken, deployerAddress)) {
        return thusdToken.transferOwnership(
          process.env.GOVERNOR_BRAVO || contractOwners["governorBravo"],
          {
            ...overrides,
            nonce
          }
        );
      }
      log("Deployer is not the owner of thusdToken. Skipping transfer.");
      return undefined;
    },
  ];

  for (const [index, transfer] of contracts.entries()) {
    try {
      const tx = transfer && await transfer(txCount + index);
      if (tx) {
        await tx.wait();
        log(`Transferred ${index}`);
      }
    } catch (error) {
      log(`Failed to transfer ${index}: ${error}`);
    }
  }
};

export const initiatePCV = async (
  {
    pcv
  }: _LiquityContracts,
  deployer: Signer,
  overrides?: Overrides
): Promise<void> => {
  if (!deployer.provider) {
    throw new Error("Signer must have a provider.");
  }
  const deployerAddress = await deployer.getAddress();
  const txCount = await deployer.provider.getTransactionCount(deployerAddress);

  try {
    const tx = await pcv.initialize({
      ...overrides,
      nonce: txCount
    });
    await tx.wait();

    console.log(`Successfully initiated PCV contract.`);
  } catch (error) {
    console.log(`Failed to initiate PCV contract: ${error}`);
  }
};

export const deployAndSetupContracts = async (
  deployer: Signer,
  oracleAddresses: INetworkOracles,
  firstCollateralSymbol: keyof IAssets,
  firstCollateralAddress: string,
  secondCollateralSymbol: keyof IAssets,
  secondCollateralAddress: string,
  getContractFactory: (name: string, signer: Signer) => Promise<ContractFactory>,
  delay: number,
  stablecoinAddress: string,
  contractsVersion: string,
  _useRealPriceFeed: boolean,
  _isDev = true,
  overrides?: Overrides
): Promise<_LiquityDeploymentJSON[]> => {
  if (!deployer.provider) {
    throw new Error("Signer must have a provider.");
  }

  log("Deploying contracts...");
  log();

  const deployments: _LiquityDeploymentJSON[] = []

  let firstDeployment: _LiquityDeploymentJSON = {
    chainId: await deployer.getChainId(),
    version: contractsVersion,
    collateralSymbol: firstCollateralSymbol,
    deploymentDate: new Date().getTime(),
    _useRealPriceFeed,
    _isDev,

    ...(await deployContracts(
      deployer, 
      oracleAddresses, 
      firstCollateralSymbol, 
      firstCollateralAddress, 
      getContractFactory, 
      delay, 
      _useRealPriceFeed, 
      overrides
    ).then(
      async ([firstDeploymentAddresses, startBlock]) => ({
        startBlock,

        addresses: {
          ...firstDeploymentAddresses,
          thusdToken: stablecoinAddress ? stablecoinAddress : "",
          bamm: stablecoinAddress 
          ? await deployContract(
              deployer, 
              getContractFactory, 
              "BAMM",
              firstDeploymentAddresses.chainlink,
              firstDeploymentAddresses.stabilityPool,
              stablecoinAddress,
              firstDeploymentAddresses.erc20,
              400,
              process.env.BAMM_FEE_POOL || contractOwners["feePool"],
              process.env.BAMM_OWNER || contractOwners["bammOwner"],
              { ...overrides }
            )
          : ""
        }
      })
    ))
  };

  if (!stablecoinAddress) {
    let thusdTokenAddress = ""

    const secondDeployment: _LiquityDeploymentJSON = {
      chainId: await deployer.getChainId(),
      version: contractsVersion,
      collateralSymbol: secondCollateralSymbol,
      deploymentDate: new Date().getTime(),
      _useRealPriceFeed,
      _isDev,
  
      ...(await deployContracts(
        deployer, 
        oracleAddresses, 
        secondCollateralSymbol, 
        secondCollateralAddress, 
        getContractFactory, 
        delay, 
        _useRealPriceFeed, 
        overrides
      ).then(
        async ([secondDeploymentAddresses, startBlock]) => {
          
          const thusdToken = await deployContract(
            deployer,
            getContractFactory,
            "THUSDToken",
            firstDeployment.addresses.troveManager,
            firstDeployment.addresses.stabilityPool,
            firstDeployment.addresses.borrowerOperations,
            secondDeploymentAddresses.troveManager,
            secondDeploymentAddresses.stabilityPool,
            secondDeploymentAddresses.borrowerOperations,
            delay,
            { ...overrides }
          )
          thusdTokenAddress = thusdToken

          const bamm = await deployContract(
            deployer, 
            getContractFactory, 
            "BAMM",
            secondDeploymentAddresses.chainlink,
            secondDeploymentAddresses.stabilityPool,
            thusdToken,
            secondDeploymentAddresses.erc20,
            400,
            process.env.BAMM_FEE_POOL || contractOwners["feePool"],
            process.env.BAMM_OWNER || contractOwners["bammOwner"],
            { ...overrides }
          )
          
          return {
            startBlock,
            addresses: {
              ...secondDeploymentAddresses,
              thusdToken: thusdToken,
              bamm: bamm
            }
          }}
      ))
    };

    if (thusdTokenAddress) {
      firstDeployment = {
        ...firstDeployment,
        addresses: {
          ...(firstDeployment.addresses),
          thusdToken: thusdTokenAddress,
          bamm: await deployContract(
            deployer, 
            getContractFactory, 
            "BAMM",
            firstDeployment.addresses.chainlink,
            firstDeployment.addresses.stabilityPool,
            thusdTokenAddress,
            firstDeployment.addresses.erc20,
            400,
            process.env.BAMM_FEE_POOL || contractOwners["feePool"],
            process.env.BAMM_OWNER || contractOwners["bammOwner"],
            { ...overrides }
        )
        }
      }
    }
    deployments.push(firstDeployment, secondDeployment)
  } else {
    deployments.push(firstDeployment)
  }
  log("deployments: ", deployments)
  for (const deployment of deployments) {
    const contracts = _connectToContracts(deployer, deployment);

    log("Connecting contracts...");
    await connectContracts(contracts, deployer, overrides);
  }

  return deployments;
};
