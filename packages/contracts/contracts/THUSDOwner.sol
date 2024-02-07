// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "./THUSDToken.sol";
import "./Dependencies/CheckContract.sol";
import "./Dependencies/Ownable.sol";

contract THUSDOwner is Ownable, CheckContract {
    THUSDToken public immutable thusdToken;

    address public immutable governorBravoAddress;

    constructor(
        address _governorBravoAddress, 
        address _thusdTokenAddress,
        address _integrationsGuild
    ) {
        checkContract(_thusdTokenAddress);
        thusdToken = THUSDToken(_thusdTokenAddress);

        require(_integrationsGuild != address(0), "Integrations Guild address must be specified");
        require(_governorBravoAddress != address(0), "Governor Bravo address must be specified");

        governorBravoAddress = _governorBravoAddress;

        _transferOwnership(_integrationsGuild);
    }

    function startRevokeMintList(address _account) external onlyOwner {
        thusdToken.startRevokeMintList(_account);
    }

    function finalizeRevokeMintList() external onlyOwner {
        thusdToken.finalizeRevokeMintList();
    }

    function transferThusdOwnershipToGovernorBravo() external onlyOwner {
        thusdToken.transferOwnership(governorBravoAddress);
    }
}
