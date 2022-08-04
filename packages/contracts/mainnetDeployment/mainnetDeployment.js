const { UniswapV2Factory } = require("./ABIs/UniswapV2Factory.js")
const { UniswapV2Pair } = require("./ABIs/UniswapV2Pair.js")
const { UniswapV2Router02 } = require("./ABIs/UniswapV2Router02.js")
const { ChainlinkAggregatorV3Interface } = require("./ABIs/ChainlinkAggregatorV3Interface.js")
const { TestHelper: th, TimeValues: timeVals } = require("../utils/testHelpers.js")
const { dec } = th
const MainnetDeploymentHelper = require("../utils/mainnetDeploymentHelpers.js")
const toBigNum = ethers.BigNumber.from

async function mainnetDeploy(configParams) {
  const date = new Date()
  console.log(date.toUTCString())
  const deployerWallet = (await ethers.getSigners())[0]
  // const account2Wallet = (await ethers.getSigners())[1]
  const mdh = new MainnetDeploymentHelper(configParams, deployerWallet)
  const gasPrice = configParams.GAS_PRICE

  const deploymentState = mdh.loadPreviousDeployment()

  console.log(`deployer address: ${deployerWallet.address}`)
  assert.equal(deployerWallet.address, configParams.liquityAddrs.DEPLOYER)
  // assert.equal(account2Wallet.address, configParams.beneficiaries.ACCOUNT_2)
  let deployerETHBalance = await ethers.provider.getBalance(deployerWallet.address)
  console.log(`deployerETHBalance before: ${deployerETHBalance}`)

  // Get UniswapV2Factory instance at its deployed address
  const uniswapV2Factory = new ethers.Contract(
    configParams.externalAddrs.UNISWAP_V2_FACTORY,
    UniswapV2Factory.abi,
    deployerWallet
  )

  console.log(`Uniswp addr: ${uniswapV2Factory.address}`)
  const uniAllPairsLength = await uniswapV2Factory.allPairsLength()
  console.log(`Uniswap Factory number of pairs: ${uniAllPairsLength}`)

  deployerETHBalance = await ethers.provider.getBalance(deployerWallet.address)
  console.log(`deployer's ETH balance before deployments: ${deployerETHBalance}`)

  // Deploy core logic contracts
  const contracts = await mdh.deployLiquityCoreMainnet(configParams.externalAddrs.TELLOR_MASTER, deploymentState)
  await mdh.logContractObjects(contracts)

  // Check Uniswap Pair LUSD-ETH pair before pair creation
  let LUSDWETHPairAddr = await uniswapV2Factory.getPair(contracts.lusdToken.address, configParams.externalAddrs.WETH_ERC20)
  let WETHLUSDPairAddr = await uniswapV2Factory.getPair(configParams.externalAddrs.WETH_ERC20, contracts.lusdToken.address)
  assert.equal(LUSDWETHPairAddr, WETHLUSDPairAddr)

  // Connect all core contracts up
  await mdh.connectCoreContractsMainnet(contracts, configParams.externalAddrs.CHAINLINK_ETHUSD_PROXY)

  // Deploy a read-only multi-trove getter
  const multiTroveGetter = await mdh.deployMultiTroveGetterMainnet(contracts, deploymentState)


  // // --- TESTS AND CHECKS  ---

  // Deployer repay LUSD
  // console.log(`deployer trove debt before repaying: ${await contracts.troveManager.getTroveDebt(deployerWallet.address)}`)
 // await mdh.sendAndWaitForTransaction(contracts.borrowerOperations.repayLUSD(dec(800, 18), th.ZERO_ADDRESS, th.ZERO_ADDRESS, {gasPrice, gasLimit: 1000000}))
  // console.log(`deployer trove debt after repaying: ${await contracts.troveManager.getTroveDebt(deployerWallet.address)}`)

  // Deployer add coll
  // console.log(`deployer trove coll before adding coll: ${await contracts.troveManager.getTroveColl(deployerWallet.address)}`)
  // await mdh.sendAndWaitForTransaction(contracts.borrowerOperations.addColl(th.ZERO_ADDRESS, th.ZERO_ADDRESS, {value: dec(2, 'ether'), gasPrice, gasLimit: 1000000}))
  // console.log(`deployer trove coll after addingColl: ${await contracts.troveManager.getTroveColl(deployerWallet.address)}`)

  // Check chainlink proxy price ---

  const chainlinkProxy = new ethers.Contract(
    configParams.externalAddrs.CHAINLINK_ETHUSD_PROXY,
    ChainlinkAggregatorV3Interface,
    deployerWallet
  )

  // Get latest price
  let chainlinkPrice = await chainlinkProxy.latestAnswer()
  console.log(`current Chainlink price: ${chainlinkPrice}`)

  // Check Tellor price directly (through our TellorCaller)
  let tellorPriceResponse = await contracts.tellorCaller.getTellorCurrentValue(1) // id == 1: the ETH-USD request ID
  console.log(`current Tellor price: ${tellorPriceResponse[1]}`)
  console.log(`current Tellor timestamp: ${tellorPriceResponse[2]}`)

  // // --- PriceFeed ---
  // console.log("PRICEFEED CHECKS")
  // // Check Pricefeed's status and last good price
  // const lastGoodPrice = await contracts.priceFeed.lastGoodPrice()
  // const priceFeedInitialStatus = await contracts.priceFeed.status()
  // th.logBN('PriceFeed first stored price', lastGoodPrice)
  // console.log(`PriceFeed initial status: ${priceFeedInitialStatus}`)

  // // Check PriceFeed's & TellorCaller's stored addresses
  // const priceFeedCLAddress = await contracts.priceFeed.priceAggregator()
  // const priceFeedTellorCallerAddress = await contracts.priceFeed.tellorCaller()
  // assert.equal(priceFeedCLAddress, configParams.externalAddrs.CHAINLINK_ETHUSD_PROXY)
  // assert.equal(priceFeedTellorCallerAddress, contracts.tellorCaller.address)

  // // Check Tellor address
  // const tellorCallerTellorMasterAddress = await contracts.tellorCaller.tellor()
  // assert.equal(tellorCallerTellorMasterAddress, configParams.externalAddrs.TELLOR_MASTER)

  // console.log("SYSTEM GLOBAL VARS CHECKS")
  // // --- Sorted Troves ---

  // // Check max size
  // const sortedTrovesMaxSize = (await contracts.sortedTroves.data())[2]
  // assert.equal(sortedTrovesMaxSize, '115792089237316195423570985008687907853269984665640564039457584007913129639935')

  // // --- TroveManager ---

  // const liqReserve = await contracts.troveManager.LUSD_GAS_COMPENSATION()
  // const minNetDebt = await contracts.troveManager.MIN_NET_DEBT()

  // th.logBN('system liquidation reserve', liqReserve)
  // th.logBN('system min net debt      ', minNetDebt)

  // // --- Make first LUSD-ETH liquidity provision ---

  // // Open trove if not yet opened
  // const troveStatus = await contracts.troveManager.getTroveStatus(deployerWallet.address)
  // if (troveStatus.toString() != '1') {
  //   let _3kLUSDWithdrawal = th.dec(3000, 18) // 3000 LUSD
  //   let _3ETHcoll = th.dec(3, 'ether') // 3 ETH
  //   console.log('Opening trove...')
  //   await mdh.sendAndWaitForTransaction(
  //     contracts.borrowerOperations.openTrove(
  //       th._100pct,
  //       _3kLUSDWithdrawal,
  //       th.ZERO_ADDRESS,
  //       th.ZERO_ADDRESS,
  //       { value: _3ETHcoll, gasPrice }
  //     )
  //   )
  // } else {
  //   console.log('Deployer already has an active trove')
  // }

  // // Check deployer now has an open trove
  // console.log(`deployer is in sorted list after making trove: ${await contracts.sortedTroves.contains(deployerWallet.address)}`)

  // const deployerTrove = await contracts.troveManager.Troves(deployerWallet.address)
  // th.logBN('deployer debt', deployerTrove[0])
  // th.logBN('deployer coll', deployerTrove[1])
  // th.logBN('deployer stake', deployerTrove[2])
  // console.log(`deployer's trove status: ${deployerTrove[3]}`)

  // // Check deployer has LUSD
  // let deployerLUSDBal = await contracts.lusdToken.balanceOf(deployerWallet.address)
  // th.logBN("deployer's LUSD balance", deployerLUSDBal)

  // // Check Uniswap pool has LUSD and WETH tokens
  const LUSDETHPair = await new ethers.Contract(
    LUSDWETHPairAddr,
    UniswapV2Pair.abi,
    deployerWallet
  )

  // const token0Addr = await LUSDETHPair.token0()
  // const token1Addr = await LUSDETHPair.token1()
  // console.log(`LUSD-ETH Pair token 0: ${th.squeezeAddr(token0Addr)},
  //       LUSDToken contract addr: ${th.squeezeAddr(contracts.lusdToken.address)}`)
  // console.log(`LUSD-ETH Pair token 1: ${th.squeezeAddr(token1Addr)},
  //       WETH ERC20 contract addr: ${th.squeezeAddr(configParams.externalAddrs.WETH_ERC20)}`)

  // // Check initial LUSD-ETH pair reserves before provision
  // let reserves = await LUSDETHPair.getReserves()
  // th.logBN("LUSD-ETH Pair's LUSD reserves before provision", reserves[0])
  // th.logBN("LUSD-ETH Pair's ETH reserves before provision", reserves[1])

  // // Get the UniswapV2Router contract
  // const uniswapV2Router02 = new ethers.Contract(
  //   configParams.externalAddrs.UNISWAP_V2_ROUTER02,
  //   UniswapV2Router02.abi,
  //   deployerWallet
  // )

  // // --- Provide liquidity to LUSD-ETH pair if not yet done so ---
  // let deployerLPTokenBal = await LUSDETHPair.balanceOf(deployerWallet.address)
  // if (deployerLPTokenBal.toString() == '0') {
  //   console.log('Providing liquidity to Uniswap...')
  //   // Give router an allowance for LUSD
  //   await contracts.lusdToken.increaseAllowance(uniswapV2Router02.address, dec(10000, 18))

  //   // Check Router's spending allowance
  //   const routerLUSDAllowanceFromDeployer = await contracts.lusdToken.allowance(deployerWallet.address, uniswapV2Router02.address)
  //   th.logBN("router's spending allowance for deployer's LUSD", routerLUSDAllowanceFromDeployer)

  //   // Get amounts for liquidity provision
  //   const LP_ETH = dec(1, 'ether')

  //   // Convert 8-digit CL price to 18 and multiply by ETH amount
  //   const LUSDAmount = toBigNum(chainlinkPrice)
  //     .mul(toBigNum(dec(1, 10)))
  //     .mul(toBigNum(LP_ETH))
  //     .div(toBigNum(dec(1, 18)))

  //   const minLUSDAmount = LUSDAmount.sub(toBigNum(dec(100, 18)))

  //   latestBlock = await ethers.provider.getBlockNumber()
  //   now = (await ethers.provider.getBlock(latestBlock)).timestamp
  //   let tenMinsFromNow = now + (60 * 60 * 10)

  //   // Provide liquidity to LUSD-ETH pair
  //   await mdh.sendAndWaitForTransaction(
  //     uniswapV2Router02.addLiquidityETH(
  //       contracts.lusdToken.address, // address of LUSD token
  //       LUSDAmount, // LUSD provision
  //       minLUSDAmount, // minimum LUSD provision
  //       LP_ETH, // minimum ETH provision
  //       deployerWallet.address, // address to send LP tokens to
  //       tenMinsFromNow, // deadline for this tx
  //       {
  //         value: dec(1, 'ether'),
  //         gasPrice,
  //         gasLimit: 5000000 // For some reason, ethers can't estimate gas for this tx
  //       }
  //     )
  //   )
  // } else {
  //   console.log('Liquidity already provided to Uniswap')
  // }
  // // Check LUSD-ETH reserves after liquidity provision:
  // reserves = await LUSDETHPair.getReserves()
  // th.logBN("LUSD-ETH Pair's LUSD reserves after provision", reserves[0])
  // th.logBN("LUSD-ETH Pair's ETH reserves after provision", reserves[1])

  // // --- 2nd Account opens trove ---
  // const trove2Status = await contracts.troveManager.getTroveStatus(account2Wallet.address)
  // if (trove2Status.toString() != '1') {
  //   console.log("Acct 2 opens a trove ...")
  //   let _2kLUSDWithdrawal = th.dec(2000, 18) // 2000 LUSD
  //   let _1pt5_ETHcoll = th.dec(15, 17) // 1.5 ETH
  //   const borrowerOpsEthersFactory = await ethers.getContractFactory("BorrowerOperations", account2Wallet)
  //   const borrowerOpsAcct2 = await new ethers.Contract(contracts.borrowerOperations.address, borrowerOpsEthersFactory.interface, account2Wallet)

  //   await mdh.sendAndWaitForTransaction(borrowerOpsAcct2.openTrove(th._100pct, _2kLUSDWithdrawal, th.ZERO_ADDRESS, th.ZERO_ADDRESS, { value: _1pt5_ETHcoll, gasPrice, gasLimit: 1000000 }))
  // } else {
  //   console.log('Acct 2 already has an active trove')
  // }

  // const acct2Trove = await contracts.troveManager.Troves(account2Wallet.address)
  // th.logBN('acct2 debt', acct2Trove[0])
  // th.logBN('acct2 coll', acct2Trove[1])
  // th.logBN('acct2 stake', acct2Trove[2])
  // console.log(`acct2 trove status: ${acct2Trove[3]}`)

  // //  --- deployer withdraws staking gains ---
  // console.log("CHECK DEPLOYER WITHDRAWING STAKING GAINS")

  // // check deployer's LUSD balance before withdrawing staking gains
  // deployerLUSDBal = await contracts.lusdToken.balanceOf(deployerWallet.address)
  // th.logBN('deployer LUSD bal before withdrawing staking gains', deployerLUSDBal)

  // // check deployer's LUSD balance after withdrawing staking gains
  // deployerLUSDBal = await contracts.lusdToken.balanceOf(deployerWallet.address)
  // th.logBN('deployer LUSD bal after withdrawing staking gains', deployerLUSDBal)


  // // --- System stats  ---

  // Uniswap LUSD-ETH pool size
  reserves = await LUSDETHPair.getReserves()
  th.logBN("LUSD-ETH Pair's current LUSD reserves", reserves[0])
  th.logBN("LUSD-ETH Pair's current ETH reserves", reserves[1])

  // Number of troves
  const numTroves = await contracts.troveManager.getTroveOwnersCount()
  console.log(`number of troves: ${numTroves} `)

  // Sorted list size
  const listSize = await contracts.sortedTroves.getSize()
  console.log(`Trove list size: ${listSize} `)

  // Total system debt and coll
  const entireSystemDebt = await contracts.troveManager.getEntireSystemDebt()
  const entireSystemColl = await contracts.troveManager.getEntireSystemColl()
  th.logBN("Entire system debt", entireSystemDebt)
  th.logBN("Entire system coll", entireSystemColl)

  // TCR
  const TCR = await contracts.troveManager.getTCR(chainlinkPrice)

  // current borrowing rate
  const baseRate = await contracts.troveManager.baseRate()
  const currentBorrowingRate = await contracts.troveManager.getBorrowingRateWithDecay()
  th.logBN("Base rate", baseRate)
  th.logBN("Current borrowing rate", currentBorrowingRate)

  // total SP deposits
  const totalSPDeposits = await contracts.stabilityPool.getTotalLUSDDeposits()
  th.logBN("Total LUSD SP deposits", totalSPDeposits)

  // --- State variables ---

  // TroveManager
  console.log("TroveManager state variables:")
  const totalStakes = await contracts.troveManager.totalStakes()
  const totalStakesSnapshot = await contracts.troveManager.totalStakesSnapshot()
  const totalCollateralSnapshot = await contracts.troveManager.totalCollateralSnapshot()
  th.logBN("Total trove stakes", totalStakes)
  th.logBN("Snapshot of total trove stakes before last liq. ", totalStakesSnapshot)
  th.logBN("Snapshot of total trove collateral before last liq. ", totalCollateralSnapshot)

  const L_ETH = await contracts.troveManager.L_ETH()
  const L_LUSDDebt = await contracts.troveManager.L_LUSDDebt()
  th.logBN("L_ETH", L_ETH)
  th.logBN("L_LUSDDebt", L_LUSDDebt)

  // StabilityPool
  console.log("StabilityPool state variables:")
  const P = await contracts.stabilityPool.P()
  const currentScale = await contracts.stabilityPool.currentScale()
  const currentEpoch = await contracts.stabilityPool.currentEpoch()
  const S = await contracts.stabilityPool.epochToScaleToSum(currentEpoch, currentScale)
  th.logBN("Product P", P)
  th.logBN("Current epoch", currentEpoch)
  th.logBN("Current scale", currentScale)
  th.logBN("Sum S, at current epoch and scale", S)

  // PCV
  console.log("PCV state variables:")
  const F_LUSD = await contracts.pcv.F_LUSD()
  const F_ETH = await contracts.pcv.F_ETH()
  th.logBN("F_LUSD", F_LUSD)
  th.logBN("F_ETH", F_ETH)

}

module.exports = {
  mainnetDeploy
}
