// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

interface IPCV {

    // --- Events --
    event THUSDTokenAddressSet(address _thusdTokenAddress);
    event TroveManagerAddressSet(address _troveManager);
    event BorrowerOperationsAddressSet(address _borrowerOperationsAddress);
    event ActivePoolAddressSet(address _activePoolAddress);

    event F_ETHUpdated(uint _F_ETH);
    event F_THUSDUpdated(uint _F_THUSD);

    // --- Functions ---

    function setAddresses
    (
        address _thusdTokenAddress,
        address _troveManagerAddress,
        address _borrowerOperationsAddress,
        address _activePoolAddress
    )  external;

    function increaseF_ETH(uint _ETHFee) external;

    function increaseF_THUSD(uint _THUSDFee) external;

}
