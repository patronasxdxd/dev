// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

/**
 * @title Interface of RedStone adapter
 * @author The Redstone Oracles team
 */
interface IRedstoneAdapter {

    /**
     * @notice Returns the latest properly reported value of the data feed
     * @return value The latest value of the given data feed
     */
    function getValueForDataFeed(bytes32) external view returns (uint256);

  /**
   * @notice Returns details for the given round and data feed
   * @return dataFeedValue
   * @return roundDataTimestamp
   * @return roundBlockTimestamp
   */
    function getRoundDataFromAdapter(bytes32, uint256) external view returns (uint256 dataFeedValue, uint128 roundDataTimestamp, uint128 roundBlockTimestamp);

    /**
     * @notice Returns the latest properly reported round id
     * @return value The latest value of the round id
     */
    function getLatestRoundId() external view returns (uint256);

    /**
     * @notice Returns block timestamp of the latest successful update
     * @return blockTimestamp The block timestamp of the latest successful update
     */
    function getBlockTimestampFromLatestUpdate() external view returns (uint256 blockTimestamp);
}
