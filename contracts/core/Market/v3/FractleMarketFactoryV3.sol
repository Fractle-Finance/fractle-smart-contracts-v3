// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.17;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

import "../../../interfaces/IPMarket.sol";
import "../../../interfaces/IPYieldContractFactory.sol";
import "../../../interfaces/IPMarketFactory.sol";

import "../../libraries/BaseSplitCodeFactory.sol";
import "../../libraries/Errors.sol";
import "../../libraries/BoringOwnableUpgradeable.sol";

contract FractleMarketFactoryV3 is BoringOwnableUpgradeable, IPMarketFactory {
    using EnumerableSet for EnumerableSet.AddressSet;

    address public immutable yieldContractFactory;
    uint256 public immutable maxLnFeeRateRoot;
    uint8 public constant maxReserveFeePercent = 100;
    int256 public constant minInitialAnchor = PMath.IONE;

    address public treasury;
    address public externalRewardDistributor;
    FeeConfig public defaultFee;
    /// 1 SLOT

    // router -> overriddenFee
    mapping(address => FeeConfig) public overriddenFee;

    // PT -> scalarRoot -> initialAnchor
    mapping(address => mapping(int256 => mapping(int256 => address)))
        internal markets;
    EnumerableSet.AddressSet internal allMarkets;

    constructor(address _yieldContractFactory) {
        yieldContractFactory = _yieldContractFactory;
        maxLnFeeRateRoot = uint256(
            LogExpMath.ln(int256((105 * PMath.IONE) / 100))
        ); // ln(1.05)
    }

    function initialize(
        address _treasury,
        uint80 _defaultLnFeeRateRoot,
        uint8 _defaultReserveFeePercent,
        address newExternalRewardDistributor
    ) external initializer {
        __BoringOwnable_init();
        setTreasury(_treasury);
        setDefaultFee(_defaultLnFeeRateRoot, _defaultReserveFeePercent);

        externalRewardDistributor = newExternalRewardDistributor;
    }

    /**
     * @notice Create a market between PT and its corresponding SY with scalar & anchor config.
     * Anyone is allowed to create a market on their own.
     */
    function createNewMarket(
        address PT,
        address market,
        int256 scalarRoot,
        int256 initialAnchor
    ) external {
        if (!IPYieldContractFactory(yieldContractFactory).isPT(PT))
            revert Errors.MarketFactoryInvalidPt();
        if (IPPrincipalToken(PT).isExpired())
            revert Errors.MarketFactoryExpiredPt();

        if (markets[PT][scalarRoot][initialAnchor] != address(0))
            revert Errors.MarketFactoryMarketExists();

        if (initialAnchor < minInitialAnchor)
            revert Errors.MarketFactoryInitialAnchorTooLow(
                initialAnchor,
                minInitialAnchor
            );

        markets[PT][scalarRoot][initialAnchor] = market;

        if (!allMarkets.add(market)) assert(false);

        emit CreateNewMarket(market, PT, scalarRoot, initialAnchor);
    }

    function getMarketConfig(
        address router
    )
        external
        view
        returns (
            address _treasury,
            uint80 _lnFeeRateRoot,
            uint8 _reserveFeePercent
        )
    {
        (_treasury, _lnFeeRateRoot, _reserveFeePercent) = (
            treasury,
            defaultFee.lnFeeRateRoot,
            defaultFee.reserveFeePercent
        );

        FeeConfig memory over = overriddenFee[router];
        if (over.active) {
            (_lnFeeRateRoot, _reserveFeePercent) = (
                over.lnFeeRateRoot,
                over.reserveFeePercent
            );
        }
    }

    /// @dev for gas-efficient verification of market
    function isValidMarket(address market) external view returns (bool) {
        return allMarkets.contains(market);
    }

    function setTreasury(address newTreasury) public onlyOwner {
        if (newTreasury == address(0))
            revert Errors.MarketFactoryZeroTreasury();

        treasury = newTreasury;
        _emitNewMarketConfigEvent();
    }

    function setDefaultFee(
        uint80 newLnFeeRateRoot,
        uint8 newReserveFeePercent
    ) public onlyOwner {
        _verifyFeeConfig(newLnFeeRateRoot, newReserveFeePercent);
        defaultFee = FeeConfig(newLnFeeRateRoot, newReserveFeePercent, true);
        _emitNewMarketConfigEvent();
    }

    function setOverriddenFee(
        address router,
        uint80 newLnFeeRateRoot,
        uint8 newReserveFeePercent
    ) public onlyOwner {
        _verifyFeeConfig(newLnFeeRateRoot, newReserveFeePercent);
        overriddenFee[router] = FeeConfig(
            newLnFeeRateRoot,
            newReserveFeePercent,
            true
        );
        emit SetOverriddenFee(router, newLnFeeRateRoot, newReserveFeePercent);
    }

    function unsetOverriddenFee(address router) external onlyOwner {
        delete overriddenFee[router];
        emit UnsetOverriddenFee(router);
    }

    function _verifyFeeConfig(
        uint80 newLnFeeRateRoot,
        uint8 newReserveFeePercent
    ) internal view {
        if (newLnFeeRateRoot > maxLnFeeRateRoot)
            revert Errors.MarketFactoryLnFeeRateRootTooHigh(
                newLnFeeRateRoot,
                maxLnFeeRateRoot
            );
        if (newReserveFeePercent > maxReserveFeePercent)
            revert Errors.MarketFactoryReserveFeePercentTooHigh(
                newReserveFeePercent,
                maxReserveFeePercent
            );
    }

    function _emitNewMarketConfigEvent() internal {
        emit NewMarketConfig(
            treasury,
            defaultFee.lnFeeRateRoot,
            defaultFee.reserveFeePercent
        );
    }
}
