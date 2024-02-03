// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "./Interfaces/ITHUSDToken.sol";
import "./Dependencies/CheckContract.sol";
import "./Dependencies/Ownable.sol";

contract THUSDOwner is Ownable, CheckContract {
    ITHUSDToken private thusdToken;

    address public governorBravoAddress;

    constructor(
        address _governorBravoAddress, 
        address _thusdTokenAddress,
        address _integrationsGuild
    ) {
        checkContract(_thusdTokenAddress);
        thusdToken = ITHUSDToken(_thusdTokenAddress);

        require(_integrationsGuild != address(0), "Integrations Guild address must be specified");
        require(_governorBravoAddress != address(0), "Governor Bravo address must be specified");

        governorBravoAddress = _governorBravoAddress;

        transferOwnership(_integrationsGuild);
    }

    function startRevokeMintList(address _account) external onlyOwner {
        thusdToken.startRevokeMintList(_account);
    }

    function finalizeRevokeMintList() external onlyOwner {
        thusdToken.finalizeRevokeMintList();
    }

    function transferOwnershipToGovernorBravo(address _account) 
        external 
        onlyOwner 
    {
        require(_account == governorBravoAddress, "THUSDOwner: new owner must be Governor Bravo");
        thusdToken.transferOwnership(_account);
    }
}
