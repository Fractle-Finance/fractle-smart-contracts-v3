// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import "../../core/libraries/math/PMath.sol";
import "../../core/libraries/Errors.sol";
import "../../core/libraries/BoringOwnableUpgradeable.sol";

import "../libraries/WeekMath.sol";

import "../../interfaces/IPGaugeController.sol";
import "../../interfaces/IPGaugeController.sol";
import "../../interfaces/IPMarketFactory.sol";
import "../../interfaces/IPMarket.sol";

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";

/**
 * @dev Gauge controller provides no write function to any party other than voting controller
 * @dev Gauge controller will receive (lpTokens[], points per sec[]) from voting controller and
 * set it directly to contract state
 * @dev All of the core data in this function are set to private to prevent unintended assignments
 * on inheriting contracts
 */

abstract contract PointsDistributor is IPGaugeController, BoringOwnableUpgradeable {
    using SafeERC20 for IERC20;
    using PMath for uint256;

    struct MarketRewardData {
        uint128 pointsPerSec;
        uint128 accumulatedPoints;
        uint128 lastUpdated;
        uint128 incentiveEndsAt;
    }

    uint128 internal constant WEEK = 1 weeks;

    address public immutable points;
    IPMarketFactory public immutable marketFactory;

    mapping(address => MarketRewardData) public rewardData;

    uint256[100] private __gap;

    modifier onlyPointsMarket() {
        if (marketFactory.isValidMarket(msg.sender)) {
            _;
        } else {
            revert Errors.GCNotPointsMarket(msg.sender);
        }
    }

    constructor(address _points, address _marketFactory) {
        points = _points;
        marketFactory = IPMarketFactory(_marketFactory);
    }

    /**
     * @notice claim the rewards allocated by gaugeController
     * @dev only points market can call this
     */
    function redeemMarketReward() external onlyPointsMarket {
        address market = msg.sender;
        rewardData[market] = _getUpdatedMarketReward(market);

        uint256 amount = rewardData[market].accumulatedPoints;
        if (amount != 0) {
            rewardData[market].accumulatedPoints = 0;
            IERC20(points).safeTransfer(market, amount);
        }

        emit MarketClaimReward(market, amount);
    }

    function setPointsPerSec(uint128 pointsPerSec) external onlyOwner {
        rewardData[msg.sender].pointsPerSec = pointsPerSec;
    }

    function fundPoints(uint256 amount) external {
        IERC20(points).safeTransferFrom(msg.sender, address(this), amount);
    }

    function withdrawPoints(uint256 amount) external onlyOwner {
        IERC20(points).safeTransfer(msg.sender, amount);
    }

    /**
     * @notice get the updated state of the market, to the current time with all the undistributed
     * points distributed to the accumulatedPoints
     * @dev expect to update accumulatedPoints & lastUpdated in MarketRewardData
     */
    function _getUpdatedMarketReward(address market) internal view returns (MarketRewardData memory) {
        MarketRewardData memory rwd = rewardData[market];
        uint128 newLastUpdated = uint128(PMath.min(uint128(block.timestamp), rwd.incentiveEndsAt));
        rwd.accumulatedPoints += rwd.pointsPerSec * (newLastUpdated - rwd.lastUpdated);
        rwd.lastUpdated = newLastUpdated;
        return rwd;
    }
}
