// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "../Interfaces/ITHUSDToken.sol";
import "../Dependencies/CheckContract.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract THUSDOwnerUpgradeableProxy is Initializable, CheckContract, OwnableUpgradeable {
    ITHUSDToken private thusdToken;

    address public governorBravoAddress;

    function initialize(
        address _governorBravoAddress, 
        address _thusdTokenAddress
    ) 
        public 
        initializer 
    {
        __Ownable_init();

        checkContract(_thusdTokenAddress);
        thusdToken = ITHUSDToken(_thusdTokenAddress);

        governorBravoAddress = _governorBravoAddress;
    }

    function startRevokeMintList(address _account) external onlyOwner {
        thusdToken.startRevokeMintList(_account);
    }

    function cancelRevokeMintList() external onlyOwner {
        thusdToken.cancelRevokeMintList();
    }

    function finalizeRevokeMintList() external onlyOwner {
        thusdToken.finalizeRevokeMintList();
    }

    function transferOwnershipToGovernorBravo(address _account) 
        external 
        onlyOwner 
    {
        require(_account == governorBravoAddress, "THUSDOwner: new owner must be Governor Bravo");
        _transferOwnership(_account);
    }

}
