// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "./IRedstoneAdapter.sol";

contract MockRedstoneAdapterBase is IRedstoneAdapter {
    uint256 private latestPrice;
    uint256 private previousPrice;
    uint256 private latestRoundId;
    uint256 private blockTimestampFromLatestUpdate;
    uint128 private blockTimestampFromPreviousUpdate;

    bool latestRevert;
    bool previousRevert;

    // --- Setter Functions ---

    function setPrice(uint256 _price) external {
        latestPrice = _price;
    }

    function setPrevPrice(uint256 _price) external {
        previousPrice = _price;
    }

    function setUpdateTime(uint256 _blockTimestampFromLatestUpdate) external {
        blockTimestampFromLatestUpdate = _blockTimestampFromLatestUpdate;
    }

    function setPrevTime(uint128 _blockTimestampFromPreviousUpdate) external {
        blockTimestampFromPreviousUpdate = _blockTimestampFromPreviousUpdate;
    }

    function setLatestRoundId(uint256 _latestRoundId) external {
        latestRoundId = _latestRoundId;
    }

    function setLatestRevert() external  {
        latestRevert = !latestRevert;
    }

    function setPrevRevert() external  {
        previousRevert = !previousRevert;
    }

    // --- Getters that adhere to the RedstoneAdapter interface ---

    /**
     * @notice Returns the latest properly reported value of the data feed
     * @return value The latest value of the given data feed
     */
    function getValueForDataFeed(bytes32) public view returns (uint256) {
        if (latestRevert) {require( 1== 0, "getRoundData reverted");}
        return latestPrice;
    }

    /**
     * @notice Returns details for the given round and data feed
     * @return dataFeedValue
     * @return roundDataTimestamp
     * @return roundBlockTimestamp
     */
    function getRoundDataFromAdapter(bytes32, uint256) public view returns (
        uint256 dataFeedValue, 
        uint128 roundDataTimestamp, 
        uint128 roundBlockTimestamp
    ) {
        if (previousRevert) {require( 1== 0, "getRoundData reverted");}
        dataFeedValue = previousPrice;
        roundDataTimestamp = blockTimestampFromPreviousUpdate;
        roundBlockTimestamp = blockTimestampFromPreviousUpdate;
    }

    /**
     * @notice Returns block timestamp of the latest successful update
     * @return blockTimestamp The block timestamp of the latest successful update
     */
    function getBlockTimestampFromLatestUpdate() public view returns (uint256) {
        return blockTimestampFromLatestUpdate;
    }

    /**
     * @notice Returns latest successful round number
     * @return latestRoundId
     */
    function getLatestRoundId() public view returns (uint256) {
        return latestRoundId;
    }
}
