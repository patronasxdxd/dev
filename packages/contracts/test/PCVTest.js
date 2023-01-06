const deploymentHelper = require("../utils/deploymentHelpers.js")
const PCV = artifacts.require("PCV.sol")
const BAMM = artifacts.require("BAMM.sol")
const ChainlinkTestnet = artifacts.require("ChainlinkTestnet.sol")

const testHelpers = require("../utils/testHelpers.js")

const th = testHelpers.TestHelper
const ZERO_ADDRESS = th.ZERO_ADDRESS
const assertRevert = th.assertRevert
const toBN = th.toBN
const dec = th.dec

contract('PCV', async accounts => {
  
  const [owner, alice] = accounts;

  const feePool = "0x1000000000000000000000000000000000000001"

  const contextTestPCV = (isCollateralERC20) => {

    let priceFeed
    let thusdToken
    let sortedTroves
    let troveManager
    let activePool
    let borrowerOperations
    let pcv
    let erc20
    let bamm
    let stabilityPool

    let contracts

    const getCollateralBalance = async (address) => th.getCollateralBalance(erc20, address)
    const sendCollateral = async (recipient, valueToSend) => th.sendCollateral(erc20, owner, recipient, valueToSend)

    beforeEach(async () => {
      contracts = await deploymentHelper.deployTesterContractsHardhat(accounts)
      if (!isCollateralERC20) {
        contracts.erc20.address = ZERO_ADDRESS
      }

      await deploymentHelper.connectCoreContracts(contracts)

      priceFeed = contracts.priceFeedTestnet
      thusdToken = contracts.thusdToken
      sortedTroves = contracts.sortedTroves
      troveManager = contracts.troveManager
      activePool = contracts.activePool
      borrowerOperations = contracts.borrowerOperations
      hintHelpers = contracts.hintHelpers
      erc20 = contracts.erc20
      pcv = contracts.pcv
      stabilityPool = contracts.stabilityPool

      chainlink = await ChainlinkTestnet.new(priceFeed.address)
      thusdChainlink = await ChainlinkTestnet.new(ZERO_ADDRESS)
      bamm = await BAMM.new(
        chainlink.address, 
        thusdChainlink.address, 
        stabilityPool.address, 
        thusdToken.address, 
        400, 
        feePool, 
        erc20.address)
    })

    it('depositToBAMM(): reverts if not enough thUSD', async () => {
      await assertRevert(pcv.depositToBAMM(bamm.address, 1, { from: owner }), "PCV: not enough tokens")
      await thusdToken.unprotectedMint(pcv.address, 10*18)
      await assertRevert(pcv.depositToBAMM(bamm.address, 1 + 10*18, { from: owner }), "PCV: not enough tokens")
    })

    it('depositToBAMM(): deposits thUSD to BAMM', async () => {
      const value = toBN(dec(20, 18))
      await thusdToken.unprotectedMint(pcv.address, value)
      await pcv.depositToBAMM(bamm.address, value, { from: owner })

      const pcvBalance = await thusdToken.balanceOf(pcv.address)
      assert.equal(pcvBalance.toString(), "0")
      const bammBalance = await bamm.balanceOf(pcv.address)
      const bammTotal = await bamm.total()
      assert.equal(bammBalance.toString(), bammTotal.toString())
    })

    it('withdrawFromBAMM(): reverts if specified number of shares is too big', async () => {
      await assertRevert(pcv.withdrawFromBAMM(bamm.address, 1, { from: owner }), "PCV: not enough shares")

      const value = toBN(dec(20, 18))
      await thusdToken.unprotectedMint(pcv.address, value)
      await pcv.depositToBAMM(bamm.address, value, { from: owner })
      const bammBalance = await bamm.balanceOf(pcv.address)
      await assertRevert(pcv.withdrawFromBAMM(bamm.address, bammBalance + 1, { from: owner }), "PCV: not enough shares")
    })

    it('withdrawFromBAMM(): withdraw only deposit', async () => {
      const value = toBN(dec(20, 18))
      await thusdToken.unprotectedMint(pcv.address, value)
      await pcv.depositToBAMM(bamm.address, value, { from: owner })

      const bammBalance = await bamm.balanceOf(pcv.address)
      await pcv.withdrawFromBAMM(bamm.address, bammBalance.div(toBN(2)), { from: owner })
      let pcvBalance = await thusdToken.balanceOf(pcv.address)
      assert.equal(pcvBalance.toString(), value.div(toBN(2)).toString())
      
      await pcv.withdrawFromBAMM(bamm.address, bammBalance.div(toBN(2)), { from: owner })
      pcvBalance = await thusdToken.balanceOf(pcv.address)
      assert.equal(pcvBalance.toString(), value.toString())
    })

    it('withdrawFromBAMM(): withdraw deposit and collateral', async () => {
      const collateralAmount = toBN(dec(3, 18))
      sendCollateral(bamm.address, collateralAmount)

      const thUSDAmount = toBN(dec(20, 18))
      await thusdToken.unprotectedMint(pcv.address, thUSDAmount)
      await pcv.depositToBAMM(bamm.address, thUSDAmount.div(toBN(2)), { from: owner })
      await pcv.depositToBAMM(bamm.address, thUSDAmount.div(toBN(2)), { from: owner })

      const bammBalance = await bamm.balanceOf(pcv.address)
      await pcv.withdrawFromBAMM(bamm.address, bammBalance, { from: owner })
      let pcvTHUSDBalance = await thusdToken.balanceOf(pcv.address)
      assert.equal(pcvTHUSDBalance.toString(), thUSDAmount.toString())
      let pcvCollateralBalance = await getCollateralBalance(pcv.address)
      assert.equal(pcvCollateralBalance.toString(), collateralAmount.toString())
    })

    it('withdrawTHUSD(): reverts if not enough thUSD', async () => {
      await assertRevert(pcv.withdrawTHUSD(alice, 1, { from: owner }), "PCV: not enough tokens")
      await thusdToken.unprotectedMint(pcv.address, 10*18)
      await assertRevert(pcv.withdrawTHUSD(alice, 1 + 10*18, { from: owner }), "PCV: not enough tokens")
    })

    it('withdrawTHUSD(): withdraws thUSD to recepient', async () => {
      const value = toBN(dec(20, 18))
      await thusdToken.unprotectedMint(pcv.address, value)
      await pcv.withdrawTHUSD(alice, value, { from: owner })

      const pcvBalance = await thusdToken.balanceOf(pcv.address)
      assert.equal(pcvBalance.toString(), "0")
      const aliceBalance = await thusdToken.balanceOf(alice)
      assert.equal(aliceBalance.toString(), value.toString())
    })

    it('withdrawCollateral(): reverts if not enough collateral', async () => {
      await assertRevert(pcv.withdrawCollateral(alice, 1, { from: owner }))
      await sendCollateral(pcv.address, 10*18)
      await assertRevert(pcv.withdrawCollateral(alice, 1 + 10*18, { from: owner }))
    })

    it('withdrawCollateral(): withdraws collateral to recepient', async () => {
      const value = toBN(dec(20, 18))
      await sendCollateral(pcv.address, value)
      const aliceBalanceBefore = await getCollateralBalance(alice)
      await pcv.withdrawCollateral(alice, value, { from: owner })

      const pcvBalance = await getCollateralBalance(pcv.address)
      assert.equal(pcvBalance.toString(), "0")
      const aliceBalance = await getCollateralBalance(alice)
      assert.equal(aliceBalance.sub(aliceBalanceBefore).toString(), value.toString())
    })
  }

  context("when collateral is ERC20 token", () => {
    contextTestPCV( true )
  })

  context("when collateral is eth", () => {
    contextTestPCV( false )
  })

})
