// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

// Common interface for the Pools.
interface IPool {

    // --- Events ---

    event CollateralBalanceUpdated(uint _newBalance);
    event THUSDBalanceUpdated(uint _newBalance);
    event ActivePoolAddressChanged(address _newActivePoolAddress);
    event DefaultPoolAddressChanged(address _newDefaultPoolAddress);
    event StabilityPoolAddressChanged(address _newStabilityPoolAddress);
    event CollateralSent(address _to, uint _amount);

    // --- Functions ---

    function getCollateralBalance() external view returns (uint);

    function getTHUSDDebt() external view returns (uint);

    function increaseTHUSDDebt(uint _amount) external;

    function decreaseTHUSDDebt(uint _amount) external;
}
