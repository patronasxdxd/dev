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
  
  const [owner, alice, council, treasury] = accounts;

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
    let bootstrapLoan

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

        
      bootstrapLoan = await borrowerOperations.PCV_BOOTSTRAP_LOAN()
    })

    it('initialize(): reverts when bootstrap loan is not minted', async () => {
      await thusdToken.unprotectedBurn(pcv.address, bootstrapLoan)
      await assertRevert(pcv.initialize(bamm.address, { from: owner }), "PCV: not enough tokens to bootstrap")
    })

    it('initialize(): reverts when caller is not owner', async () => {
      await assertRevert(pcv.initialize(bamm.address, { from: council }))
    })

    context("when PCV is initialized", () => {

      beforeEach(async () => {
        await pcv.initialize(bamm.address, { from: owner })
        await pcv.setRoles(council, treasury, { from: owner })
      })

      it('initialize(): reverts when trying to initialize second time', async () => {
        await assertRevert(pcv.initialize(bamm.address, { from: owner }), "PCV: already initialized")
      })

      it('initialize(): bootstrap loan deposited to SP and tracked in PCV', async () => {
        assert.isTrue(await pcv.isInitialized())
        const debtToPay = await pcv.debtToPay()
        assert.equal(debtToPay.toString(), bootstrapLoan.toString())
        const pcvBalance = await thusdToken.balanceOf(pcv.address)
        assert.equal(pcvBalance.toString(), "0")
        const bammBalance = Number(await bamm.balanceOf(pcv.address))
        assert.isAbove(bammBalance, 0)
        const spBalance = await stabilityPool.getCompoundedTHUSDDeposit(bamm.address)
        assert.equal(spBalance.toString(), debtToPay)
      })

      it('depositToBAMM(): reverts if not enough thUSD', async () => {
        await assertRevert(pcv.depositToBAMM(1, { from: council }), "PCV: not enough tokens")
        await thusdToken.unprotectedMint(pcv.address, 10*18)
        await assertRevert(pcv.depositToBAMM(1 + 10*18, { from: treasury }), "PCV: not enough tokens")
      })

      it('depositToBAMM(): deposits additional thUSD to BAMM', async () => {
        const value = toBN(dec(20, 18))
        await thusdToken.unprotectedMint(pcv.address, value)
        await pcv.depositToBAMM(value, { from: council })

        const pcvBalance = await thusdToken.balanceOf(pcv.address)
        assert.equal(pcvBalance.toString(), "0")
        const bammBalance = await bamm.balanceOf(pcv.address)
        const bammTotal = await bamm.total()
        assert.equal(bammBalance.toString(), bammTotal.toString())
      })

      it('withdrawFromBAMM(): reverts if specified number of shares is too big', async () => {
        // await assertRevert(pcv.withdrawFromBAMM(1, { from: owner }), "PCV: not enough shares")

        const value = toBN(dec(20, 18))
        await thusdToken.unprotectedMint(pcv.address, value)
        await pcv.depositToBAMM(value, { from: treasury })
        const bammBalance = await bamm.balanceOf(pcv.address)
        await assertRevert(pcv.withdrawFromBAMM(bammBalance + 1, { from: council }), "PCV: not enough shares")
      })

      it('withdrawFromBAMM(): withdraw only deposit', async () => {
        let value = toBN(dec(20, 18))
        await thusdToken.unprotectedMint(pcv.address, value)
        await pcv.depositToBAMM(value, { from: council })
        value = value.add(bootstrapLoan)

        const bammBalance = await bamm.balanceOf(pcv.address)
        await pcv.withdrawFromBAMM(bammBalance.div(toBN(2)), { from: treasury })
        let pcvBalance = await thusdToken.balanceOf(pcv.address)
        assert.equal(pcvBalance.toString(), value.div(toBN(2)).toString())
        
        await pcv.withdrawFromBAMM(bammBalance.div(toBN(2)), { from: council })
        pcvBalance = await thusdToken.balanceOf(pcv.address)
        assert.equal(pcvBalance.toString(), value.toString())
      })

      it('withdrawFromBAMM(): withdraw deposit and collateral', async () => {
        const collateralAmount = toBN(dec(3, 18))
        sendCollateral(bamm.address, collateralAmount)

        let thUSDAmount = toBN(dec(20, 18))
        await thusdToken.unprotectedMint(pcv.address, thUSDAmount)
        await pcv.depositToBAMM(thUSDAmount.div(toBN(2)), { from: treasury })
        await pcv.depositToBAMM(thUSDAmount.div(toBN(2)), { from: council })
        thUSDAmount = thUSDAmount.add(bootstrapLoan)

        const bammBalance = await bamm.balanceOf(pcv.address)
        await pcv.withdrawFromBAMM(bammBalance, { from: treasury })
        let pcvTHUSDBalance = await thusdToken.balanceOf(pcv.address)
        assert.equal(pcvTHUSDBalance.toString(), thUSDAmount.toString())
        let pcvCollateralBalance = await getCollateralBalance(pcv.address)
        assert.equal(pcvCollateralBalance.toString(), collateralAmount.toString())
      })

      it('withdrawTHUSD(): reverts when debt is not paid', async () => {
        await assertRevert(pcv.withdrawTHUSD(alice, 1, { from: treasury }), "PCV: debt must be paid")
      })

      it('payDebt(): reverts when caller is not council or treasury', async () => {
        await assertRevert(pcv.payDebt(1, { from: owner }), "PCV: caller must be council or treasury")
      })

      it('payDebt(): reverts when not enough tokens to burn', async () => {
        await assertRevert(pcv.payDebt(1, { from: council }), "PCV: not enough tokens")
      })

      it('payDebt(): pays some value of debt', async () => {
        const value = bootstrapLoan.div(toBN(3))
        await thusdToken.unprotectedMint(pcv.address, value)
        await pcv.payDebt(value, { from: treasury })
        const debtToPay = await pcv.debtToPay()
        assert.equal(debtToPay.toString(), bootstrapLoan.sub(value).toString())
      })

      it('setRoles(): reverts when caller is not owner', async () => {
        await assertRevert(pcv.setRoles(council, treasury, { from: council }))
      })

      it('setRoles(): sets new roles', async () => {
        await pcv.setRoles(owner, owner, { from: owner })
        assert.equal(await pcv.council(), owner)
        assert.equal(await pcv.treasury(), owner)
      })

      context("when debt is paid", () => {

        beforeEach(async () => {
          const debtToPay = await pcv.debtToPay()
          await thusdToken.unprotectedMint(pcv.address, debtToPay)
          await pcv.payDebt(debtToPay, { from: treasury })
        })

        it('payDebt(): when debt is fully paid', async () => {
          const debtToPay = await pcv.debtToPay()
          assert.equal(debtToPay.toString(), "0")
        })
        
        it('payDebt(): reverts when trying to pay again', async () => {
          await thusdToken.unprotectedMint(pcv.address, bootstrapLoan)
          await assertRevert(pcv.payDebt(bootstrapLoan, { from: council }), "PCV: debt has already paid")
        })

        it('withdrawTHUSD(): reverts when caller is not council or treasury', async () => {
          await assertRevert(pcv.withdrawTHUSD(alice, 1, { from: owner }), "PCV: caller must be council or treasury")
        })

        it('withdrawTHUSD(): reverts if not enough thUSD', async () => {
          await assertRevert(pcv.withdrawTHUSD(alice, 1, { from: treasury }), "PCV: not enough tokens")
          await thusdToken.unprotectedMint(pcv.address, 10*18)
          await assertRevert(pcv.withdrawTHUSD(alice, 1 + 10*18, { from: council }), "PCV: not enough tokens")
        })

        it('withdrawTHUSD(): withdraws thUSD to recepient', async () => {
          const value = toBN(dec(20, 18))
          await thusdToken.unprotectedMint(pcv.address, value)
          await pcv.withdrawTHUSD(alice, value, { from: treasury })

          const pcvBalance = await thusdToken.balanceOf(pcv.address)
          assert.equal(pcvBalance.toString(), "0")
          const aliceBalance = await thusdToken.balanceOf(alice)
          assert.equal(aliceBalance.toString(), value.toString())
        })

        it('withdrawCollateral(): reverts if not enough collateral', async () => {
          await assertRevert(pcv.withdrawCollateral(alice, 1, { from: council }))
          await sendCollateral(pcv.address, 10*18)
          await assertRevert(pcv.withdrawCollateral(alice, 1 + 10*18, { from: treasury }))
        })

        it('withdrawCollateral(): withdraws collateral to recepient', async () => {
          const value = toBN(dec(20, 18))
          await sendCollateral(pcv.address, value)
          const aliceBalanceBefore = await getCollateralBalance(alice)
          await pcv.withdrawCollateral(alice, value, { from: council })

          const pcvBalance = await getCollateralBalance(pcv.address)
          assert.equal(pcvBalance.toString(), "0")
          const aliceBalance = await getCollateralBalance(alice)
          assert.equal(aliceBalance.sub(aliceBalanceBefore).toString(), value.toString())
        })
      })
    })
  }

  context("when collateral is ERC20 token", () => {
    contextTestPCV( true )
  })

  context("when collateral is eth", () => {
    contextTestPCV( false )
  })

})
