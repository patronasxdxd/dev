// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "../Interfaces/ITHUSDToken.sol";
import "../Dependencies/CheckContract.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract THUSDOwnerUpgradeableProxy is Initializable, OwnableUpgradeable {
    ITHUSDToken private thusdToken;

    // --- Addresses to Revoke ---
    mapping(address => bool) public addressesToRevokeList;

    uint256 public governanceTimeDelay;

    address public pendingRevokedMintAddress;

    uint256 public revokeMintListInitiated;

    function initialize(
        address _governorBravoAddress, 
        address _thusdTokenAddress,
        address _borrowerOperationsAddress1,
        address _borrowerOperationsAddress2,
        address _borrowerOperationsAddress3,
        address _borrowerOperationsAddress4,
        uint256 _governanceTimeDelay
    ) 
        public 
        initializer 
    {
        __Ownable_init();
        checkContract(_thusdTokenAddress);

        _addAddressToRevokeList(_borrowerOperationsAddress1);
        _addAddressToRevokeList(_borrowerOperationsAddress2);
        _addAddressToRevokeList(_borrowerOperationsAddress3);
        _addAddressToRevokeList(_borrowerOperationsAddress4);

        thusdToken = ITHUSDToken(_thusdTokenAddress);

        governanceTimeDelay = _governanceTimeDelay;
        require(governanceTimeDelay <= 30 weeks, "Governance delay is too big");

        _transferOwnership(_governorBravoAddress);
    }

    modifier onlyAfterGovernanceDelay(
        uint256 _changeInitializedTimestamp
    ) {
        require(_changeInitializedTimestamp > 0, "Change not initiated");
        require(
            block.timestamp >= _changeInitializedTimestamp + governanceTimeDelay,
            "Governance delay has not elapsed"
        );
        _;
    }

    // --- Governance operations ---

    function startRevokeMintList(address _account) external onlyOwner {
        thusdToken.startRevokeMintList(_account);
    }

    function cancelRevokeMintList() external onlyOwner {
        thusdToken.cancelRevokeMintList();
    }

    function finalizeRevokeMintList() external onlyOwner {
        thusdToken.finalizeRevokeMintList();
    }

    function startAddMintList(address _account) external onlyOwner {
        thusdToken.startAddMintList(_account);
    }

    function cancelAddMintList() external onlyOwner {
        thusdToken.cancelAddMintList();
    }

    function finalizeAddMintList() external onlyOwner {
        thusdToken.finalizeAddMintList();
    }

    function startAddContracts(
        address _troveManagerAddress, 
        address _stabilityPoolAddress, 
        address _borrowerOperationsAddress
    ) 
        external 
        onlyOwner 
    {
        thusdToken.startAddContracts(
            _troveManagerAddress, 
            _stabilityPoolAddress, 
            _borrowerOperationsAddress
        );
    }

    function cancelAddContracts() external onlyOwner {
        thusdToken.cancelAddContracts();
    }

    function finalizeAddContracts() external onlyOwner {
        thusdToken.finalizeAddContracts();
    }

    function startRevokeBurnList(address _account) external onlyOwner {
        thusdToken.startRevokeBurnList(_account);
    }

    function cancelRevokeBurnList() external onlyOwner {
        thusdToken.cancelRevokeBurnList();
    }

    function finalizeRevokeBurnList() external onlyOwner {
        thusdToken.finalizeRevokeBurnList();
    }

    // --- External functions ---

    function startRevokeOldMintList(address _account) external {
        require(addressesToRevokeList[_account], "Incorrect address to revoke");

        revokeMintListInitiated = block.timestamp;
        pendingRevokedMintAddress = _account;
        thusdToken.startRevokeMintList(_account);
    }

    function cancelRevokeOldMintList() external {
        require(revokeMintListInitiated != 0, "Revoking from mint list is not started");

        revokeMintListInitiated = 0;
        pendingRevokedMintAddress = address(0);
        thusdToken.cancelRevokeMintList();
    }

    function finalizeRevokeOldMintList()
        external
        onlyAfterGovernanceDelay(revokeMintListInitiated)
    {
        addressesToRevokeList[pendingRevokedMintAddress] = false;
        revokeMintListInitiated = 0;
        pendingRevokedMintAddress = address(0);
        thusdToken.finalizeRevokeMintList();
    }

    // --- Internal operations ---
    
    function _addAddressToRevokeList(address _account) internal {
        require(checkContract(_account), "Address is not a contract");
        addressesToRevokeList[_account] = true;
    }
}
