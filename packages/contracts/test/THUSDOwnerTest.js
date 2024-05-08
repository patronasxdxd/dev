const deploymentHelper = require("../utils/deploymentHelpers.js")
const testHelpers = require("../utils/testHelpers.js")

const { 
  assertRevert, 
  ZERO_ADDRESS, 
  getLatestBlockTimestamp,
  fastForwardTime,
  SECONDS_IN_ONE_MINUTE
} = testHelpers.TestHelper

contract('THUSDOwner', async accounts => {
  const [owner, integrationsGuild, governorBravo] = accounts;

  let thusdOwner
  let thusdToken
  let borrowerOperations

  let delay

  beforeEach(async () => {
    const contracts = await deploymentHelper.deployTesterContractsHardhat(accounts)
    await deploymentHelper.connectCoreContracts(contracts)

    thusdOwner = contracts.thusdOwner
    thusdToken = contracts.thusdToken
    borrowerOperations = contracts.borrowerOperations

    await thusdToken.increaseGovernanceTimeDelay(
      SECONDS_IN_ONE_MINUTE, 
      { from: owner }
    )
    
    await thusdToken.transferOwnership(
      thusdOwner.address, 
      { from: owner }
    )

    delay = (await thusdToken.governanceTimeDelay()).toNumber()
  })

  it('owner(): owner is integrations guild', async () => {
    await assert.equal(await thusdOwner.owner(), integrationsGuild)
  })
  
  it('startRevokeMintList(): reverts when caller is not owner', async () => {
    await assertRevert(
      thusdOwner.startRevokeMintList(
        borrowerOperations.address, 
        { from: governorBravo }),
        "Ownable: caller is not the owner")
  })

  it('startRevokeMintList(): reverts when account has no minting role', async () => {
    await assertRevert(
      thusdOwner.startRevokeMintList(
        integrationsGuild, 
        { from: integrationsGuild }),
        "Incorrect address to revoke")
  })

  it('startRevokeMintList(): puts account to pending list', async () => {
    await thusdOwner.startRevokeMintList(borrowerOperations.address, { from: integrationsGuild })
    
    const timeNow = await getLatestBlockTimestamp(web3)
    assert.equal(await thusdToken.pendingRevokedMintAddress(), borrowerOperations.address)
    assert.equal(await thusdToken.revokeMintListInitiated(), timeNow)
    
    assert.isTrue(await thusdToken.mintList(borrowerOperations.address))
  })

  it('finalizeRevokeMintList(): reverts when caller is not owner', async () => {
    await assertRevert(
      thusdOwner.finalizeRevokeMintList(
        { from: owner }),
        "Ownable: caller is not the owner")
  })

  it('finalizeRevokeMintList(): reverts when change is not initiated', async () => {
    await assertRevert(
      thusdOwner.finalizeRevokeMintList(
        { from: integrationsGuild }),
        "Change not initiated")
  })

  it('finalizeRevokeMintList(): reverts when passed not enough time', async () => {
    await thusdOwner.startRevokeMintList(
        borrowerOperations.address, 
        { from: integrationsGuild }
      )
    await assertRevert(
      thusdOwner.finalizeRevokeMintList(
        { from: integrationsGuild }),
        "Governance delay has not elapsed")
  })

  it('finalizeRevokeMintList(): removes account from minting list', async () => {
    await thusdOwner.startRevokeMintList(
        borrowerOperations.address, 
        { from: integrationsGuild }
      )
    await fastForwardTime(delay, web3.currentProvider)
    
    await thusdOwner.finalizeRevokeMintList({ from: integrationsGuild })

    assert.equal(await thusdToken.pendingRevokedMintAddress(), ZERO_ADDRESS)
    assert.equal(await thusdToken.revokeMintListInitiated(), 0)
    
    assert.isFalse(await thusdToken.mintList(borrowerOperations.address))
  })

  it('finalizeRevokeMintList(): removes account from minting list', async () => {
    await thusdOwner.startRevokeMintList(
        borrowerOperations.address, 
        { from: integrationsGuild }
      )
    await fastForwardTime(delay, web3.currentProvider)
    
    await thusdOwner.finalizeRevokeMintList({ from: integrationsGuild })

    assert.equal(await thusdToken.pendingRevokedMintAddress(), ZERO_ADDRESS)
    assert.equal(await thusdToken.revokeMintListInitiated(), 0)
    
    assert.isFalse(await thusdToken.mintList(borrowerOperations.address))
  })

  it('transferThusdOwnershipToGovernorBravo(): reverts when caller is not owner', async () => {
    await assertRevert(thusdOwner.transferThusdOwnershipToGovernorBravo(
      { from: owner }), 
      "Ownable: caller is not the owner"
    )
  })
  
  it('transferThusdOwnershipToGovernorBravo(): transfer thusd ownership to governor bravo', async () => {
    await thusdOwner.transferThusdOwnershipToGovernorBravo(
      { from: integrationsGuild }
    )
    await assert.equal(await thusdToken.owner(), governorBravo)
  })
})
