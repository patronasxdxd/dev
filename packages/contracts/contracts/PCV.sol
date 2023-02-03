// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

import "./Dependencies/Ownable.sol";
import "./Dependencies/CheckContract.sol";
import "./Interfaces/IPCV.sol";
import "./Interfaces/ITHUSDToken.sol";
import "./Dependencies/IERC20.sol";
import "./B.Protocol/BAMM.sol";
import "./BorrowerOperations.sol";

contract PCV is IPCV, Ownable, CheckContract {

    // --- Data ---
    string constant public NAME = "PCV";

    uint256 constant public BOOTSTRAP_LOAN = 10 * 10**18; 

    ITHUSDToken public thusdToken;
    BorrowerOperations public borrowerOperations;
    IERC20 public collateralERC20;
    BAMM public bamm;

    // TODO ideal initialization in constructor/setAddresses
    uint256 public debtToPay;
    bool public isInitialized;

    address public council;
    address public treasury;

    modifier onlyAfterDebtPaid() {
        require(isInitialized && debtToPay == 0, "PCV: debt must be paid");
        _;
    }

    modifier onlyOwnerOrCouncilOrTreasury() {
        require(
            msg.sender == owner() || 
            msg.sender == council || 
            msg.sender == treasury, 
            "PCV: caller must be owner or council or treasury"
        );
        _;
    }

    // --- Functions ---

    // TODO maybe move to constructor?
    function setAddresses(address _thusdTokenAddress, address _borrowerOperations, address _collateralERC20)
        external
        override
        onlyOwner
    {
        require(address(thusdToken) == address(0), "PCV: contacts already set");
        checkContract(_thusdTokenAddress);
        checkContract(_borrowerOperations);
        if (_collateralERC20 != address(0)) {
            checkContract(_collateralERC20);
        }

        thusdToken = ITHUSDToken(_thusdTokenAddress);
        collateralERC20 = IERC20(_collateralERC20);
        borrowerOperations = BorrowerOperations(_borrowerOperations);

        emit THUSDTokenAddressSet(_thusdTokenAddress);
        emit BorrowerOperationsAddressSet(_borrowerOperations);
        emit CollateralAddressSet(_collateralERC20);
    }

    // --- Initialization ---

    function initialize(address payable _bammAddress) external override onlyOwnerOrCouncilOrTreasury {
        require(!isInitialized, "PCV: already initialized");
        checkContract(_bammAddress);
        bamm = BAMM(_bammAddress);
        emit BAMMAddressSet(_bammAddress);

        debtToPay = BOOTSTRAP_LOAN;
        borrowerOperations.mintBootstrapLoanFromPCV(debtToPay);

        thusdToken.approve(address(bamm), debtToPay);
        bamm.deposit(debtToPay);
        emit BAMMDeposit(debtToPay);  

        isInitialized = true;
    }

    // --- Backstop protocol ---

    function depositToBAMM(uint256 _thusdAmount) public override onlyOwnerOrCouncilOrTreasury {
        require(_thusdAmount <= thusdToken.balanceOf(address(this)), "PCV: not enough tokens");
        thusdToken.approve(address(bamm), _thusdAmount);
        bamm.deposit(_thusdAmount);
        
        emit BAMMDeposit(_thusdAmount);     
    }

    function withdrawFromBAMM(uint256 _numShares) external override onlyOwnerOrCouncilOrTreasury {
        require(_numShares <= bamm.balanceOf(address(this)), "PCV: not enough shares");
        bamm.withdraw(_numShares);
        
        emit BAMMWithdraw(_numShares); 
    }

    // --- Maintain thUSD and collateral ---

    function withdrawTHUSD(address _recepient, uint256 _thusdAmount) external override onlyAfterDebtPaid onlyOwnerOrCouncilOrTreasury {
        require(_thusdAmount <= thusdToken.balanceOf(address(this)), "PCV: not enough tokens");
        require(thusdToken.transfer(_recepient, _thusdAmount), "PCV: sending thUSD failed");
        
        emit THUSDWithdraw(_recepient, _thusdAmount); 
    }

    function withdrawCollateral(
        address _recepient, 
        uint256 _collateralAmount
    ) 
        external 
        override 
        onlyAfterDebtPaid 
        onlyOwnerOrCouncilOrTreasury 
    {
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

    function payDebt(uint256 _thusdToBurn) external override onlyOwnerOrCouncilOrTreasury {
        require(debtToPay > 0, "PCV: debt has already paid");
        require(_thusdToBurn <= thusdToken.balanceOf(address(this)), "PCV: not enough tokens");
        uint256 thusdToBurn = LiquityMath._min(_thusdToBurn, debtToPay);
        debtToPay -= thusdToBurn;
        borrowerOperations.burnDebtFromPCV(thusdToBurn);
        emit PCVDebtPaid(thusdToBurn);
    }

    function setRoles(address _council, address _treasury) external onlyOwner {
        council = _council;
        treasury = _treasury;
        emit RolesSet(council, treasury);
    }

    receive() external payable {}
}
