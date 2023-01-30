// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

interface IPCV {

    // --- Events --
    event THUSDTokenAddressSet(address _thusdTokenAddress);
    event CollateralAddressSet(address _collateralAddress);
    event BAMMAddressSet(address _bammAddress);
    event RolesSet(address _council, address _treasury);

    event BAMMDeposit(uint256 _thusdAmount);
    event BAMMWithdraw(uint256 _numShares);
    event THUSDWithdraw(address _recepient, uint256 _thusdAmount);
    event CollateralWithdraw(address _recepient, uint256 _collateralAmount);


    // --- Functions ---

    function debtToPay() external returns(uint256);
    function requireOnlyCouncilOrTreasury(address _sender) external view;

    function setAddresses(address _thusdTokenAddress, address _collateralERC20) external;
    function initialize(address payable _bammAddress) external;

    function depositToBAMM(uint256 _thusdAmount) external;
    function withdrawFromBAMM(uint256 _numShares) external;
    function withdrawTHUSD(address _recepient, uint256 _thusdAmount) external;
    function withdrawCollateral(address _recepient, uint256 _collateralAmount) external;

}
