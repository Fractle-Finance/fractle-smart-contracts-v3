// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.17;

import "../core/libraries/BoringOwnableUpgradeable.sol";
import "../core/libraries/TokenHelper.sol";

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/proxy/Proxy.sol";

contract Broadcaster is Initializable, BoringOwnableUpgradeable, UUPSUpgradeable, TokenHelper {
    uint256 public lastBroadcastedWeek;

    constructor() initializer {}

    function initialize() external initializer {
        __BoringOwnable_init();
    }

    function withdrawETH() external onlyOwner {
        _transferOut(NATIVE, owner, address(this).balance);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    receive() external payable {}
}
