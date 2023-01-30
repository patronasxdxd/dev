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
    BAMM public bamm;

    // TODO ideal initialization in constructor/setAddresses
    uint256 public debtToPay;
    bool public isInitialized;

    address public council;
    address public treasury;

    modifier onlyAfterLoanPaid() {
        require(isInitialized && debtToPay == 0, "PCV: debt must be paid");
        _;
    }

    modifier onlyCouncilOrTreasury() {
        requireOnlyCouncilOrTreasury(msg.sender);
        _;
    }

    // --- Functions ---

    // TODO maybe move to constructor?
    function setAddresses(address _thusdTokenAddress, address _collateralERC20)
        external
        override
        onlyOwner
    {
        require(address(thusdToken) == address(0), "PCV: contacts already set");
        checkContract(_thusdTokenAddress);
        if (_collateralERC20 != address(0)) {
            checkContract(_collateralERC20);
        }

        thusdToken = ITHUSDToken(_thusdTokenAddress);
        collateralERC20 = IERC20(_collateralERC20);

        emit THUSDTokenAddressSet(_thusdTokenAddress);
        emit CollateralAddressSet(_collateralERC20);
    }

    // --- Initialization ---

    function initialize(address payable _bammAddress) external override onlyOwner {
        require(!isInitialized, "PCV: already initialized");
        checkContract(_bammAddress);
        bamm = BAMM(_bammAddress);
        emit CollateralAddressSet(_bammAddress);

        debtToPay = thusdToken.balanceOf(address(this));
        require(debtToPay > 0, "PCV: not enough tokens to bootstrap");

        depositToBAMM(debtToPay);

        isInitialized = true;
    }

    // --- Backstop protocol ---

    function depositToBAMM(uint256 _thusdAmount) public override onlyCouncilOrTreasury {
        require(_thusdAmount <= thusdToken.balanceOf(address(this)), "PCV: not enough tokens");
        thusdToken.approve(address(bamm), _thusdAmount);
        bamm.deposit(_thusdAmount);
        
        emit BAMMDeposit(_thusdAmount);     
    }

    function withdrawFromBAMM(uint256 _numShares) external override onlyCouncilOrTreasury {
        require(_numShares <= bamm.balanceOf(address(this)), "PCV: not enough shares");
        bamm.withdraw(_numShares);
        
        emit BAMMWithdraw(_numShares); 
    }

    // --- Maintain thUSD and collateral ---

    function withdrawTHUSD(address _recepient, uint256 _thusdAmount) external override onlyAfterLoanPaid onlyCouncilOrTreasury {
        require(_thusdAmount <= thusdToken.balanceOf(address(this)), "PCV: not enough tokens");
        require(thusdToken.transfer(_recepient, _thusdAmount), "PCV: sending thUSD failed");
        
        emit THUSDWithdraw(_recepient, _thusdAmount); 
    }

    function withdrawCollateral(address _recepient, uint256 _collateralAmount) external override onlyAfterLoanPaid onlyCouncilOrTreasury {
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

    function requireOnlyCouncilOrTreasury(address _sender) public override view {
        require(_sender == council || _sender == treasury, "PCV: caller must be council or treasury");
    }

    function setRoles(address _council, address _treasury) external onlyOwner {
        council = _council;
        treasury = _treasury;
        emit RolesSet(council, treasury);
    }

    receive() external payable {}
}
