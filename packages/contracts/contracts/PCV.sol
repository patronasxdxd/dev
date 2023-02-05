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
    
    uint256 public immutable governanceTimeDelay;

    ITHUSDToken public thusdToken;
    BorrowerOperations public borrowerOperations;
    IERC20 public collateralERC20;
    BAMM public bamm;

    // TODO ideal initialization in constructor/setAddresses
    uint256 public debtToPay;
    bool public isInitialized;

    address public council;
    address public treasury;
    
    mapping(address => bool) public recipientsWhitelist;
    
    address public pendingCouncilAddress;
    address public pendingTreasuryAddress;
    uint256 public changingRolesInitiated;

    constructor(uint256 _governanceTimeDelay) {
        governanceTimeDelay = _governanceTimeDelay;
    }

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

    modifier onlyWhitelistedRecipient(address _recipient) {
        require(recipientsWhitelist[_recipient], "PCV: recipient must be in whitelist");
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

    // TODO move bamm initialization to setAddresses or constructor
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

    function withdrawTHUSD(
        address _recipient, 
        uint256 _thusdAmount
    ) 
        external 
        override 
        onlyAfterDebtPaid 
        onlyOwnerOrCouncilOrTreasury
        onlyWhitelistedRecipient(_recipient)
    {
        require(_thusdAmount <= thusdToken.balanceOf(address(this)), "PCV: not enough tokens");
        require(thusdToken.transfer(_recipient, _thusdAmount), "PCV: sending thUSD failed");
        
        emit THUSDWithdraw(_recipient, _thusdAmount); 
    }

    function withdrawCollateral(
        address _recipient, 
        uint256 _collateralAmount
    ) 
        external 
        override 
        onlyAfterDebtPaid 
        onlyOwnerOrCouncilOrTreasury
        onlyWhitelistedRecipient(_recipient)
    {
        if (address(collateralERC20) == address(0)) {
            // ETH
            require(_collateralAmount <= address(this).balance, "PCV: not enough ETH");
            (bool success, ) = _recipient.call{ value: _collateralAmount }(""); // re-entry is fine here
            require(success, "PCV: sending ETH failed");
        } else {
            // ERC20
            require(_collateralAmount <= collateralERC20.balanceOf(address(this)), "PCV: not enough collateral");
            bool success = collateralERC20.transfer(_recipient, _collateralAmount);
            require(success, "PCV: sending collateral failed");
        }
        
        emit CollateralWithdraw(_recipient, _collateralAmount); 
    }

    function payDebt(uint256 _thusdToBurn) external override onlyOwnerOrCouncilOrTreasury {
        require(debtToPay > 0, "PCV: debt has already paid");
        require(_thusdToBurn <= thusdToken.balanceOf(address(this)), "PCV: not enough tokens");
        uint256 thusdToBurn = LiquityMath._min(_thusdToBurn, debtToPay);
        debtToPay -= thusdToBurn;
        borrowerOperations.burnDebtFromPCV(thusdToBurn);
        emit PCVDebtPaid(thusdToBurn);
    }
    
    // --- Maintain roles ---

    function startChangingRoles(address _council, address _treasury)
        external
        override
        onlyOwner
    {
        require(_council != council || _treasury != treasury, "PCV: these roles already set");

        changingRolesInitiated = block.timestamp;
        if (council == address(0) && treasury == address(0)) {
            changingRolesInitiated -= governanceTimeDelay; // skip delay if no roles set
        }
        pendingCouncilAddress = _council;
        pendingTreasuryAddress = _treasury;
    }

    function cancelChangingRoles() external override onlyOwner {
        require(changingRolesInitiated != 0, "PCV: Change not initiated");

        changingRolesInitiated = 0;
        pendingCouncilAddress = address(0);
        pendingTreasuryAddress = address(0);
    }

    function finalizeChangingRoles() external override onlyOwner {
        require(changingRolesInitiated > 0, "PCV: Change not initiated");
        require(
            block.timestamp >= changingRolesInitiated + governanceTimeDelay,
            "PCV: Governance delay has not elapsed"
        );

        council = pendingCouncilAddress;
        treasury = pendingTreasuryAddress;
        emit RolesSet(council, treasury);

        changingRolesInitiated = 0;
        pendingCouncilAddress = address(0);
        pendingTreasuryAddress = address(0);
    }

    // --- Maintain recipients whitelist ---

    function addRecipientToWhitelist(address _recipient) public override onlyOwner {
        require(!recipientsWhitelist[_recipient], "PCV: Recipient has already added to whitelist");
        recipientsWhitelist[_recipient] = true;
        emit RecipientAdded(_recipient);
    }

    function addRecipientsToWhitelist(address[] calldata _recipients) external override onlyOwner {
        require(_recipients.length > 0, "PCV: Recipients array must not be empty");
        for(uint256 i = 0; i < _recipients.length; i++) {
            addRecipientToWhitelist(_recipients[i]);
        }
    }

    function removeRecipientFromWhitelist(address _recipient) public override onlyOwner {
        require(recipientsWhitelist[_recipient], "PCV: Recipient is not in whitelist");
        recipientsWhitelist[_recipient] = false;
        emit RecipientRemoved(_recipient);
    }

    function removeRecipientsFromWhitelist(address[] calldata _recipients) external override onlyOwner {
        require(_recipients.length > 0, "PCV: Recipients array must not be empty");
        for(uint256 i = 0; i < _recipients.length; i++) {
            removeRecipientFromWhitelist(_recipients[i]);
        }
    }

    receive() external payable {}
}
