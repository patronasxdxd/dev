// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

import "./Dependencies/Ownable.sol";
import "./Dependencies/CheckContract.sol";
import "./Interfaces/IPCV.sol";
import "./Interfaces/ITHUSDToken.sol";
import "./Dependencies/IERC20.sol";
import "./B.Protocol/BAMM.sol";

contract PCV is IPCV, Ownable, CheckContract {

    // --- Data ---
    string constant public NAME = "PCV";

    ITHUSDToken public thusdToken;
    IERC20 public collateralERC20;

    address public troveManagerAddress;
    address public borrowerOperationsAddress;
    address public activePoolAddress;

    // --- Functions ---

    // TODO maybe move to constructor?
    function setAddresses
    (
        address _thusdTokenAddress,
        address _troveManagerAddress,
        address _borrowerOperationsAddress,
        address _activePoolAddress,
        address _collateralERC20
    )
        external
        onlyOwner
        override
    {
        require(address(thusdToken) == address(0), "PCV: contacts already set");
        checkContract(_thusdTokenAddress);
        checkContract(_troveManagerAddress);
        checkContract(_borrowerOperationsAddress);
        checkContract(_activePoolAddress);
        if (_collateralERC20 != address(0)) {
            checkContract(_collateralERC20);
        }

        thusdToken = ITHUSDToken(_thusdTokenAddress);
        troveManagerAddress = _troveManagerAddress;
        borrowerOperationsAddress = _borrowerOperationsAddress;
        activePoolAddress = _activePoolAddress;
        collateralERC20 = IERC20(_collateralERC20);

        emit THUSDTokenAddressSet(_thusdTokenAddress);
        emit TroveManagerAddressSet(_troveManagerAddress);
        emit BorrowerOperationsAddressSet(_borrowerOperationsAddress);
        emit ActivePoolAddressSet(_activePoolAddress);
        emit CollateralAddressSet(_collateralERC20);
    }

    // --- Backstop protocol ---

    function depositToBAMM(address payable _bammAddress, uint256 _thusdAmount) external override onlyOwner {
        require(_thusdAmount <= thusdToken.balanceOf(address(this)), "PCV: not enough tokens");
        thusdToken.approve(_bammAddress, _thusdAmount);
        BAMM(_bammAddress).deposit(_thusdAmount);
        
        emit BAMMDeposit(_bammAddress, _thusdAmount);     
    }

    function withdrawFromBAMM(address payable _bammAddress, uint256 _numShares) external override onlyOwner {
        require(_numShares <= BAMM(_bammAddress).balanceOf(address(this)), "PCV: not enough shares");
        BAMM(_bammAddress).withdraw(_numShares);
        
        emit BAMMWithdraw(_bammAddress, _numShares); 
    }

    // --- Maintain thUSD and collateral ---

    function withdrawTHUSD(address _recepient, uint256 _thusdAmount) external override onlyOwner {
        require(_thusdAmount <= thusdToken.balanceOf(address(this)), "PCV: not enough tokens");
        require(thusdToken.transfer(_recepient, _thusdAmount), "PCV: sending thUSD failed");
        
        emit THUSDWithdraw(_recepient, _thusdAmount); 
    }

    function withdrawCollateral(address _recepient, uint256 _collateralAmount) external override onlyOwner {
        if (address(collateralERC20) == address(0)) {
            // ETH
            require(_collateralAmount <= address(this).balance, "PCV: not enough ETH");
            (bool success, ) = _recepient.call{ value: _collateralAmount }(""); // re-entry is fine here
            require(success, "PCV: sending ETH failed");
        } else {
            // ERC20
            require(_collateralAmount <= collateralERC20.balanceOf(address(this)), "PCV: not enough collateral");
            bool success = collateralERC20.transfer(_recepient, _collateralAmount);
            require(success, "PCV: sending collateral failed");
        }
        
        emit CollateralWithdraw(_recepient, _collateralAmount); 
    }

    receive() external payable {}
}
