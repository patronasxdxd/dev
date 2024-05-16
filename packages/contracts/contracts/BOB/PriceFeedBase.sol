// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "./IRedstoneAdapter.sol";
import "../Dependencies/CheckContract.sol";
import "../Dependencies/AggregatorV3Interface.sol";

/**
 * @title Main logic of the price feed contract
 * @author The Redstone Oracles team
 * @dev Implementation of common functions for the PriceFeed contract
 * that queries data from the specified PriceFeedAdapter
 * 
 * It can be used by projects that have already implemented with Chainlink-like
 * price feeds and would like to minimise changes in their existing codebase.
 * 
 * If you are flexible, it's much better (and cheaper in terms of gas) to query
 * the PriceFeedAdapter contract directly
 */
contract PriceFeedBase is AggregatorV3Interface, CheckContract {
    uint256 internal constant UINT80_MAX = uint256(type(uint80).max);
    uint256 internal constant INT256_MAX = uint256(type(int256).max);

    IRedstoneAdapter public immutable redstoneAdapter;
    bytes32 public immutable dataFeedId;

    error UnsafeUintToIntConversion(uint256 value);
    error UnsafeUint256ToUint80Conversion(uint256 value);

    constructor (address _redstoneAdapterAddress, bytes32 _dataFeedId) {
        checkContract(_redstoneAdapterAddress);

        redstoneAdapter = IRedstoneAdapter(_redstoneAdapterAddress);
        dataFeedId = _dataFeedId;
    }

    /**
     * @notice Returns the number of decimals for the price feed
     * @dev By default, RedStone uses 8 decimals for data feeds
     * @return decimals The number of decimals in the price feed values
     */
    function decimals() public virtual pure override returns (uint8) {
        return 8;
    }

    /**
     * @notice Description of the Price Feed
     * @return description
     */
    function description() public view virtual override returns (string memory) {
        return "Redstone Price Feed";
    }

    /**
     * @notice Version of the Price Feed
     * @dev Currently it has no specific motivation and was added
     * only to be compatible with the Chainlink interface
     * @return version
     */
    function version() public virtual pure override returns (uint256) {
        return 1;
    }

    /**
     * @notice Returns details for the given round
     * @param _requestedRoundId Requested round identifier
     */
    function getRoundData(uint80 _requestedRoundId) public view virtual returns (
        uint80 roundId, 
        int256 answer, 
        uint256 startedAt, 
        uint256 updatedAt, 
        uint80 answeredInRound
    ) {
        (
            uint256 dataFeedValue, 
            uint128 roundDataTimestamp, 
            uint128 roundBlockTimestamp
        ) = redstoneAdapter.getRoundDataFromAdapter(dataFeedId, _requestedRoundId);

        roundId = _requestedRoundId;

        if (dataFeedValue > INT256_MAX) {
            revert UnsafeUintToIntConversion(dataFeedValue);
        }

        answer = int256(dataFeedValue);
        startedAt = roundDataTimestamp;
        updatedAt = roundBlockTimestamp;

        // We want to be compatible with Chainlink's interface
        // And in our case the roundId is always equal to answeredInRound
        answeredInRound = _requestedRoundId;
    }

    /**
     * @notice Returns details of the latest successful update round
     * @dev It uses few helpful functions to abstract logic of getting
     * latest round id and value
     * @return roundId The number of the latest round
     * @return answer The latest reported value
     * @return startedAt Block timestamp when the latest successful round started
     * @return updatedAt Block timestamp of the latest successful round
     * @return answeredInRound The number of the latest round
     */
    function latestRoundData()
        public
        view
        override
        virtual
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        roundId = _latestRound();
        answer = _latestAnswer();

        uint256 blockTimestamp = redstoneAdapter.getBlockTimestampFromLatestUpdate();

        // These values are equal after chainlink’s OCR update
        startedAt = blockTimestamp;
        updatedAt = blockTimestamp;

        // We want to be compatible with Chainlink's interface
        // And in our case the roundId is always equal to answeredInRound
        answeredInRound = roundId;
    }

    /**
     * @notice Chainlink function for getting the latest successfully reported value
     * @return latestAnswer The latest successfully reported value
     */
    function _latestAnswer() internal view returns (int256) {
        uint256 uintAnswer = redstoneAdapter.getValueForDataFeed(dataFeedId);

        if (uintAnswer > INT256_MAX) {
            revert UnsafeUintToIntConversion(uintAnswer);
        }

        return int256(uintAnswer);
    }

    /**
     * @notice Chainlink function for getting the number of latest round
     * @return latestRound The number of the latest update round
     */
    function _latestRound() internal view returns (uint80) {
        uint256 roundIdUint256 = redstoneAdapter.getLatestRoundId();

        if (roundIdUint256 > UINT80_MAX) {
            revert UnsafeUint256ToUint80Conversion(roundIdUint256);
        }

        return uint80(roundIdUint256);
    }
}
