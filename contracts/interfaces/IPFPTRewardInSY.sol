// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

interface IPFPTRewardInSY {
    function mintForMarket(address market, uint256 amount) external;
    function redeemForSy(address market, uint256 amount, address user) external;
}
