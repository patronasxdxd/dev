// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;


import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


contract Dummy {

    address immutable public owner = address(this);
    IERC20 public collateralERC20 = IERC20(address(0));
    address public thusdToken = address(0);

    function setCollateral(address _collateralERC20) external {
        collateralERC20 = IERC20(_collateralERC20);
    }
    
    receive() external payable {}
    
    fallback() external payable {}

}
