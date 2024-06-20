// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

interface IPGaugeController {
    event MarketClaimReward(address indexed market, uint256 amount);

    event UpdateMarketReward(
        address indexed market,
        uint256 pointsPerSec,
        uint256 incentiveEndsAt
    );

    function fundPoints(uint256 amount) external;

    function withdrawPoints(uint256 amount) external;

    function points() external returns (address);

    function redeemMarketReward() external;

    function rewardData(
        address pool
    ) external view returns (uint128 pointsPerSec, uint128, uint128, uint128);
}
