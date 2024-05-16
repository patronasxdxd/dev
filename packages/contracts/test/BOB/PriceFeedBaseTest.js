const PriceFeedBase = artifacts.require("./PriceFeedBase.sol")
const MockRedstoneAdapterBase = artifacts.require("./MockRedstoneAdapterBase.sol")

const testHelpers = require("../../utils/testHelpers.js")
const th = testHelpers.TestHelper

const { dec } = th
const priceFeedBaseDataFeedId = ethers.utils.formatBytes32String("BTC");

contract('PriceFeedBase', async () => {

  let priceFeedBase
  let mockRedstoneAdapterBase
  let now
  let previousUpdate

  beforeEach(async () => {
    mockRedstoneAdapterBase = await MockRedstoneAdapterBase.new()
    MockRedstoneAdapterBase.setAsDeployed(mockRedstoneAdapterBase)

    priceFeedBase = await PriceFeedBase.new(mockRedstoneAdapterBase.address, priceFeedBaseDataFeedId)
    PriceFeedBase.setAsDeployed(priceFeedBase)

    // Set Chainlink latest and prev round Id's to non-zero
    await mockRedstoneAdapterBase.setLatestRoundId(3)

    //Set current and prev prices in both oracles
    await mockRedstoneAdapterBase.setPrice(dec(10, 8))
    await mockRedstoneAdapterBase.setPrevPrice(dec(5, 8))

    // Set mock price updateTimes in both oracles to very recent
    now = await th.getLatestBlockTimestamp(web3)
    previousUpdate = now - 1

    await mockRedstoneAdapterBase.setUpdateTime(now)
    await mockRedstoneAdapterBase.setPrevTime(previousUpdate)
  })

  describe('Tests for getting the price feed details', async accounts => {
    it("should properly get the price feed adapter", async () => {
      const redstoneAdapter = await priceFeedBase.redstoneAdapter()
      assert.equal(redstoneAdapter, mockRedstoneAdapterBase.address)
    })

    it("should properly get data feed id", async () => {
      const dataFeedId = await priceFeedBase.dataFeedId()
      assert.equal(dataFeedId, ethers.utils.formatBytes32String("BTC"))
    })

    it("should properly get the decimals", async () => {
      const decimals = await priceFeedBase.decimals()
      assert.equal(decimals, 8)
    })

    it("should properly get the description", async () => {
      const description = await priceFeedBase.description()
      assert.equal(description, "Redstone Price Feed")
    })

    it("should properly get the version", async () => {
      const version = await priceFeedBase.version()
      assert.equal(version, 1)
    })
  })
  
  describe('Tests for getting the price feed values', async () => {
    it("should properly get latest round data", async () => {
      let latestRoundData = await priceFeedBase.latestRoundData()
      assert.equal(latestRoundData.roundId, 3)
      assert.equal(latestRoundData.answer, dec(10, 8))
      assert.equal(latestRoundData.startedAt, now)
      assert.equal(latestRoundData.updatedAt, now)
      assert.equal(latestRoundData.answeredInRound, 3)

      let updatedTime = await th.getLatestBlockTimestamp(web3)

      await mockRedstoneAdapterBase.setLatestRoundId(4)
      await mockRedstoneAdapterBase.setPrice(dec(12, 8))
      await mockRedstoneAdapterBase.setUpdateTime(updatedTime)

      latestRoundData = await priceFeedBase.latestRoundData()
      assert.equal(latestRoundData.roundId, 4)
      assert.equal(latestRoundData.answer, dec(12, 8))
      assert.equal(latestRoundData.startedAt, updatedTime)
      assert.equal(latestRoundData.updatedAt, updatedTime)
      assert.equal(latestRoundData.answeredInRound, 4)
    })

    it("should properly get a previous round data", async () => {
      let previousRoundData = await priceFeedBase.getRoundData(2)
      assert.equal(previousRoundData.roundId, 2)
      assert.equal(previousRoundData.answer, dec(5, 8))
      assert.equal(previousRoundData.startedAt, previousUpdate)
      assert.equal(previousRoundData.updatedAt, previousUpdate)
      assert.equal(previousRoundData.answeredInRound, 2)

      let updatedPreviousTime = now

      await mockRedstoneAdapterBase.setPrevPrice(dec(10, 8))
      await mockRedstoneAdapterBase.setPrevTime(updatedPreviousTime)

      previousRoundData = await priceFeedBase.getRoundData(3)
      assert.equal(previousRoundData.roundId, 3)
      assert.equal(previousRoundData.answer, dec(10, 8))
      assert.equal(previousRoundData.startedAt, updatedPreviousTime)
      assert.equal(previousRoundData.updatedAt, updatedPreviousTime)
      assert.equal(previousRoundData.answeredInRound, 3)
    })
  })
})
