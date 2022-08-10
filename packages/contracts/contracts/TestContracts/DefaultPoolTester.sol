// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

import "../DefaultPool.sol";

contract DefaultPoolTester is DefaultPool {
    using SafeMath for uint256;

    function unprotectedIncreaseTHUSDDebt(uint _amount) external {
        THUSDDebt  = THUSDDebt.add(_amount);
    }

    function unprotectedPayable() external payable {
        collateral = collateral.add(msg.value);
    }
}
