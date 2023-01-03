// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

interface IPCV {

    // --- Events --
    event THUSDTokenAddressSet(address _thusdTokenAddress);
    event TroveManagerAddressSet(address _troveManager);
    event BorrowerOperationsAddressSet(address _borrowerOperationsAddress);
    event ActivePoolAddressSet(address _activePoolAddress);
    event CollateralAddressSet(address _bammAddress);

    event BAMMDeposit(address _bammAddress, uint256 _thusdAmount);
    event BAMMWithdraw(address _bammAddress, uint256 _numShares);
    event THUSDWithdraw(address _recepient, uint256 _thusdAmount);
    event CollateralWithdraw(address _recepient, uint256 _collateralAmount);


    // --- Functions ---

    function setAddresses
    (
        address _thusdTokenAddress,
        address _troveManagerAddress,
        address _borrowerOperationsAddress,
        address _activePoolAddress,
        address _collateralERC20
    )  external;

    function depositToBAMM(address payable _bammAddress, uint256 _thusdAmount) external;
    function withdrawFromBAMM(address payable _bammAddress, uint256 _numShares) external;
    function withdrawTHUSD(address _recepient, uint256 _thusdAmount) external;
    function withdrawCollateral(address _recepient, uint256 _collateralAmount) external;

}
