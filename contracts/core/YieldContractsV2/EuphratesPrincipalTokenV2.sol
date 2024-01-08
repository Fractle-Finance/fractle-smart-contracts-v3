// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.17;

import "../../interfaces/IPPrincipalToken.sol";
import "../../interfaces/IPYieldToken.sol";

import "../libraries/MiniHelpers.sol";
import "../libraries/Errors.sol";

import "../erc20/EuphratesERC20Permit.sol";

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract EuphratesPrincipalTokenV2 is EuphratesERC20Permit, Initializable, IPPrincipalToken {
    address public immutable SY;
    address public immutable factory;
    uint256 public immutable expiry;
    address public YT;

    modifier onlyYT() {
        if (msg.sender != YT) revert Errors.OnlyYT();
        _;
    }

    modifier onlyYieldFactory() {
        if (msg.sender != factory) revert Errors.OnlyYCFactory();
        _;
    }

    constructor(
        address _SY,
        string memory _name,
        string memory _symbol,
        uint8 __decimals,
        uint256 _expiry
    ) EuphratesERC20Permit(_name, _symbol, __decimals) {
        SY = _SY;
        expiry = _expiry;
        factory = msg.sender;
    }

    function initialize(address _YT) external initializer {
        YT = _YT;
    }

    /**
     * @dev only callable by the YT correspond to this PT
     */
    function burnByYT(address user, uint256 amount) external onlyYT {
        _burn(user, amount);
    }

    /**
     * @dev only callable by the YT correspond to this PT
     */
    function mintByYT(address user, uint256 amount) external onlyYT {
        _mint(user, amount);
    }

    function isExpired() public view returns (bool) {
        return MiniHelpers.isCurrentlyExpired(expiry);
    }
}
