// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

import "../TroveManager.sol";
import "../BorrowerOperations.sol";
import "../ActivePool.sol";
import "../DefaultPool.sol";
import "../StabilityPool.sol";
import "../GasPool.sol";
import "../CollSurplusPool.sol";
import "../THUSDToken.sol";
import "./PriceFeedTestnet.sol";
import "../SortedTroves.sol";
import "./EchidnaProxy.sol";
//import "../Dependencies/console.sol";

// Run with:
// rm -f fuzzTests/corpus/* # (optional)
// ~/.local/bin/echidna-test contracts/TestContracts/EchidnaTester.sol --contract EchidnaTester --config fuzzTests/echidna_config.yaml

contract EchidnaTester {

    uint256 constant private NUMBER_OF_ACTORS = 100;
    uint256 constant private INITIAL_BALANCE = 1e24;
    uint256 private MCR;
    uint256 private CCR;
    uint256 private THUSD_GAS_COMPENSATION;

    TroveManager public troveManager;
    BorrowerOperations public borrowerOperations;
    ActivePool public activePool;
    DefaultPool public defaultPool;
    StabilityPool public stabilityPool;
    GasPool public gasPool;
    CollSurplusPool public collSurplusPool;
    THUSDToken public thusdToken;
    PriceFeedTestnet priceFeedTestnet;
    SortedTroves sortedTroves;

    EchidnaProxy[NUMBER_OF_ACTORS] public echidnaProxies;

    uint256 private numberOfTroves;

    constructor() payable {
        troveManager = new TroveManager();
        borrowerOperations = new BorrowerOperations();
        activePool = new ActivePool();
        defaultPool = new DefaultPool();
        stabilityPool = new StabilityPool();
        gasPool = new GasPool();
        thusdToken = new THUSDToken(
            address(troveManager),
            address(stabilityPool),
            address(borrowerOperations),
            90 * 24 * 60 * 60
        );

        collSurplusPool = new CollSurplusPool();
        priceFeedTestnet = new PriceFeedTestnet();

        sortedTroves = new SortedTroves();

        troveManager.setAddresses(address(borrowerOperations),
            address(activePool), address(defaultPool),
            address(stabilityPool), address(gasPool), address(collSurplusPool),
            address(priceFeedTestnet), address(thusdToken),
            address(sortedTroves), address(0));

        borrowerOperations.setAddresses(address(troveManager),
            address(activePool), address(defaultPool),
            address(stabilityPool), address(gasPool), address(collSurplusPool),
            address(priceFeedTestnet), address(sortedTroves),
            address(thusdToken), address(0), address(0));

        activePool.setAddresses(address(borrowerOperations),
            address(troveManager), address(stabilityPool), address(defaultPool), address(collSurplusPool), address(0));

        defaultPool.setAddresses(address(troveManager), address(activePool), address(0));

        stabilityPool.setAddresses(address(borrowerOperations),
            address(troveManager), address(activePool), address(thusdToken),
            address(sortedTroves), address(priceFeedTestnet), address(0));

        collSurplusPool.setAddresses(address(borrowerOperations),
             address(troveManager), address(activePool), address(0));

        sortedTroves.setParams(1e18, address(troveManager), address(borrowerOperations));

        for (uint256 i = 0; i < NUMBER_OF_ACTORS; i++) {
            echidnaProxies[i] = new EchidnaProxy(troveManager, borrowerOperations, stabilityPool, thusdToken);
            (bool success, ) = address(echidnaProxies[i]).call{value: INITIAL_BALANCE}("");
            require(success);
        }

        MCR = borrowerOperations.MCR();
        CCR = borrowerOperations.CCR();
        THUSD_GAS_COMPENSATION = borrowerOperations.THUSD_GAS_COMPENSATION();
        require(MCR > 0);
        require(CCR > 0);

        // TODO:
        priceFeedTestnet.setPrice(1e22);
    }

    // TroveManager

    function liquidateExt(uint256 _i, address _user) external {
        uint256 actor = _i % NUMBER_OF_ACTORS;
        echidnaProxies[actor].liquidatePrx(_user);
    }

    function liquidateTrovesExt(uint256 _i, uint256 _n) external {
        uint256 actor = _i % NUMBER_OF_ACTORS;
        echidnaProxies[actor].liquidateTrovesPrx(_n);
    }

    function batchLiquidateTrovesExt(uint256 _i, address[] calldata _troveArray) external {
        uint256 actor = _i % NUMBER_OF_ACTORS;
        echidnaProxies[actor].batchLiquidateTrovesPrx(_troveArray);
    }

    function redeemCollateralExt(
        uint256 _i,
        uint256 _THUSDAmount,
        address _firstRedemptionHint,
        address _upperPartialRedemptionHint,
        address _lowerPartialRedemptionHint,
        uint256 _partialRedemptionHintNICR
    ) external {
        uint256 actor = _i % NUMBER_OF_ACTORS;
        echidnaProxies[actor].redeemCollateralPrx(_THUSDAmount, _firstRedemptionHint, _upperPartialRedemptionHint, _lowerPartialRedemptionHint, _partialRedemptionHintNICR, 0, 0);
    }

    // Borrower Operations

    function getAdjustedCollateral(uint256 actorBalance, uint256 _collateral, uint256 ratio) internal view returns (uint) {
        uint256 price = priceFeedTestnet.getPrice();
        require(price > 0);
        uint256 minCollateral = ratio * THUSD_GAS_COMPENSATION / price;
        require(actorBalance > minCollateral);
        uint256 collateral = minCollateral + _collateral % (actorBalance - minCollateral);
        return collateral;
    }

    function getAdjustedTHUSD(uint256 collateral, uint256 _THUSDAmount, uint256 ratio) internal view returns (uint) {
        uint256 price = priceFeedTestnet.getPrice();
        uint256 THUSDAmount = _THUSDAmount;
        uint256 compositeDebt = THUSDAmount + THUSD_GAS_COMPENSATION;
        uint256 ICR = LiquityMath._computeCR(collateral, compositeDebt, price);
        if (ICR < ratio) {
            compositeDebt = collateral * price / ratio;
            THUSDAmount = compositeDebt - THUSD_GAS_COMPENSATION;
        }
        return THUSDAmount;
    }

    function openTroveExt(uint256 _i, uint256 _collateral, uint256 _THUSDAmount) public payable {
        uint256 actor = _i % NUMBER_OF_ACTORS;
        EchidnaProxy echidnaProxy = echidnaProxies[actor];
        uint256 actorBalance = address(echidnaProxy).balance;

        // we pass in CCR instead of MCR in case it’s the first one
        uint256 collateral = getAdjustedCollateral(actorBalance, _collateral, CCR);
        uint256 THUSDAmount = getAdjustedTHUSD(collateral, _THUSDAmount, CCR);

        //console.log('collateral', collateral);
        //console.log('THUSDAmount', THUSDAmount);

        echidnaProxy.openTrovePrx(collateral, THUSDAmount, address(0), address(0), 0);

        numberOfTroves = troveManager.getTroveOwnersCount();
        assert(numberOfTroves > 0);
        // canary
        //assert(numberOfTroves == 0);
    }

    function openTroveRawExt(uint256 _i, uint256 _collateral, uint256 _THUSDAmount, address _upperHint, address _lowerHint, uint256 _maxFee) public payable {
        uint256 actor = _i % NUMBER_OF_ACTORS;
        echidnaProxies[actor].openTrovePrx(_collateral, _THUSDAmount, _upperHint, _lowerHint, _maxFee);
    }

    function addCollExt(uint256 _i, uint256 _collateral) external payable {
        uint256 actor = _i % NUMBER_OF_ACTORS;
        EchidnaProxy echidnaProxy = echidnaProxies[actor];
        uint256 actorBalance = address(echidnaProxy).balance;

        uint256 collateral = getAdjustedCollateral(actorBalance, _collateral, MCR);

        echidnaProxy.addCollPrx(collateral, address(0), address(0));
    }

    function addCollRawExt(uint256 _i, uint256 _collateral, address _upperHint, address _lowerHint) external payable {
        uint256 actor = _i % NUMBER_OF_ACTORS;
        echidnaProxies[actor].addCollPrx(_collateral, _upperHint, _lowerHint);
    }

    function withdrawCollExt(uint256 _i, uint256 _amount, address _upperHint, address _lowerHint) external {
        uint256 actor = _i % NUMBER_OF_ACTORS;
        echidnaProxies[actor].withdrawCollPrx(_amount, _upperHint, _lowerHint);
    }

    function withdrawTHUSDExt(uint256 _i, uint256 _amount, address _upperHint, address _lowerHint, uint256 _maxFee) external {
        uint256 actor = _i % NUMBER_OF_ACTORS;
        echidnaProxies[actor].withdrawTHUSDPrx(_amount, _upperHint, _lowerHint, _maxFee);
    }

    function repayTHUSDExt(uint256 _i, uint256 _amount, address _upperHint, address _lowerHint) external {
        uint256 actor = _i % NUMBER_OF_ACTORS;
        echidnaProxies[actor].repayTHUSDPrx(_amount, _upperHint, _lowerHint);
    }

    function closeTroveExt(uint256 _i) external {
        uint256 actor = _i % NUMBER_OF_ACTORS;
        echidnaProxies[actor].closeTrovePrx();
    }

    function adjustTroveExt(uint256 _i, uint256 _collateral, uint256 _collWithdrawal, uint256 _debtChange, bool _isDebtIncrease) external payable {
        uint256 actor = _i % NUMBER_OF_ACTORS;
        EchidnaProxy echidnaProxy = echidnaProxies[actor];
        uint256 actorBalance = address(echidnaProxy).balance;

        uint256 collateral = getAdjustedCollateral(actorBalance, _collateral, MCR);
        uint256 debtChange = _debtChange;
        if (_isDebtIncrease) {
            // TODO: add current amount already withdrawn:
            debtChange = getAdjustedTHUSD(collateral, uint(_debtChange), MCR);
        }
        // TODO: collWithdrawal, debtChange
        echidnaProxy.adjustTrovePrx(collateral, _collWithdrawal, debtChange, _isDebtIncrease, address(0), address(0), 0);
    }

    function adjustTroveRawExt(uint256 _i, uint256 _collateral, uint256 _collWithdrawal, uint256 _debtChange, bool _isDebtIncrease, address _upperHint, address _lowerHint, uint256 _maxFee) external payable {
        uint256 actor = _i % NUMBER_OF_ACTORS;
        echidnaProxies[actor].adjustTrovePrx(_collateral, _collWithdrawal, _debtChange, _isDebtIncrease, _upperHint, _lowerHint, _maxFee);
    }

    // Pool Manager

    function provideToSPExt(uint256 _i, uint256 _amount) external {
        uint256 actor = _i % NUMBER_OF_ACTORS;
        echidnaProxies[actor].provideToSPPrx(_amount);
    }

    function withdrawFromSPExt(uint256 _i, uint256 _amount) external {
        uint256 actor = _i % NUMBER_OF_ACTORS;
        echidnaProxies[actor].withdrawFromSPPrx(_amount);
    }

    // THUSD Token

    function transferExt(uint256 _i, address recipient, uint256 amount) external returns (bool) {
        uint256 actor = _i % NUMBER_OF_ACTORS;
        return echidnaProxies[actor].transferPrx(recipient, amount);
    }

    function approveExt(uint256 _i, address spender, uint256 amount) external returns (bool) {
        uint256 actor = _i % NUMBER_OF_ACTORS;
        return echidnaProxies[actor].approvePrx(spender, amount);
    }

    function transferFromExt(uint256 _i, address sender, address recipient, uint256 amount) external returns (bool) {
        uint256 actor = _i % NUMBER_OF_ACTORS;
        return echidnaProxies[actor].transferFromPrx(sender, recipient, amount);
    }

    function increaseAllowanceExt(uint256 _i, address spender, uint256 addedValue) external returns (bool) {
        uint256 actor = _i % NUMBER_OF_ACTORS;
        return echidnaProxies[actor].increaseAllowancePrx(spender, addedValue);
    }

    function decreaseAllowanceExt(uint256 _i, address spender, uint256 subtractedValue) external returns (bool) {
        uint256 actor = _i % NUMBER_OF_ACTORS;
        return echidnaProxies[actor].decreaseAllowancePrx(spender, subtractedValue);
    }

    // PriceFeed

    function setPriceExt(uint256 _price) external {
        bool result = priceFeedTestnet.setPrice(_price);
        assert(result);
    }

    // --------------------------
    // Invariants and properties
    // --------------------------

    function echidna_canary_number_of_troves() public view returns(bool) {
        if (numberOfTroves > 20) {
            return false;
        }

        return true;
    }

    function echidna_canary_active_pool_balance() public view returns(bool) {
        if (address(activePool).balance > 0) {
            return false;
        }
        return true;
    }

    function echidna_troves_order() external view returns(bool) {
        address currentTrove = sortedTroves.getFirst();
        address nextTrove = sortedTroves.getNext(currentTrove);

        while (currentTrove != address(0) && nextTrove != address(0)) {
            if (troveManager.getNominalICR(nextTrove) > troveManager.getNominalICR(currentTrove)) {
                return false;
            }
            // Uncomment to check that the condition is meaningful
            //else return false;

            currentTrove = nextTrove;
            nextTrove = sortedTroves.getNext(currentTrove);
        }

        return true;
    }

    /**
     * Status
     * Minimum debt (gas compensation)
     * Stake > 0
     */
    function echidna_trove_properties() public view returns(bool) {
        address currentTrove = sortedTroves.getFirst();
        while (currentTrove != address(0)) {
            // Status
            if (TroveManager.Status(troveManager.getTroveStatus(currentTrove)) != TroveManager.Status.active) {
                return false;
            }
            // Uncomment to check that the condition is meaningful
            //else return false;

            // Minimum debt (gas compensation)
            if (troveManager.getTroveDebt(currentTrove) < THUSD_GAS_COMPENSATION) {
                return false;
            }
            // Uncomment to check that the condition is meaningful
            //else return false;

            // Stake > 0
            if (troveManager.getTroveStake(currentTrove) == 0) {
                return false;
            }
            // Uncomment to check that the condition is meaningful
            //else return false;

            currentTrove = sortedTroves.getNext(currentTrove);
        }
        return true;
    }

    function echidna_collateral_balances() public view returns(bool) {
        if (address(troveManager).balance > 0) {
            return false;
        }

        if (address(borrowerOperations).balance > 0) {
            return false;
        }

        if (address(activePool).balance != activePool.getCollateralBalance()) {
            return false;
        }

        if (address(defaultPool).balance != defaultPool.getCollateralBalance()) {
            return false;
        }

        if (address(stabilityPool).balance != stabilityPool.getCollateralBalance()) {
            return false;
        }

        if (address(thusdToken).balance > 0) {
            return false;
        }

        if (address(priceFeedTestnet).balance > 0) {
            return false;
        }

        if (address(sortedTroves).balance > 0) {
            return false;
        }

        return true;
    }

    // TODO: What should we do with this? Should it be allowed? Should it be a canary?
    function echidna_price() public view returns(bool) {
        uint256 price = priceFeedTestnet.getPrice();

        if (price == 0) {
            return false;
        }
        // Uncomment to check that the condition is meaningful
        //else return false;

        return true;
    }

    // Total THUSD matches
    function echidna_THUSD_global_balances() public view returns(bool) {
        uint256 totalSupply = thusdToken.totalSupply();
        uint256 gasPoolBalance = thusdToken.balanceOf(address(gasPool));

        uint256 activePoolBalance = activePool.getTHUSDDebt();
        uint256 defaultPoolBalance = defaultPool.getTHUSDDebt();
        if (totalSupply != activePoolBalance + defaultPoolBalance) {
            return false;
        }

        uint256 stabilityPoolBalance = stabilityPool.getTotalTHUSDDeposits();
        address currentTrove = sortedTroves.getFirst();
        uint256 trovesBalance;
        while (currentTrove != address(0)) {
            trovesBalance += thusdToken.balanceOf(address(currentTrove));
            currentTrove = sortedTroves.getNext(currentTrove);
        }
        // we cannot state equality because tranfers are made to external addresses too
        if (totalSupply <= stabilityPoolBalance + trovesBalance + gasPoolBalance) {
            return false;
        }

        return true;
    }

    /*
    function echidna_test() public view returns(bool) {
        return true;
    }
    */
}
