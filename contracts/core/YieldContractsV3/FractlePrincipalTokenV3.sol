// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.17;

import "../../interfaces/IPPrincipalToken.sol";
import "../../interfaces/IPYieldTokenV3.sol";

import "../libraries/MiniHelpers.sol";
import "../libraries/Errors.sol";

import "../erc20/FractleERC20Permit.sol";

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract FractlePrincipalTokenV3 is FractleERC20Permit, Initializable, IPPrincipalToken {

    event RedeemInterestFPT(address indexed user,uint256 interestOut);

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

    modifier updateData() {
        if (isExpired()) IPYieldTokenV3(YT).setPostExpiryData();
        _;
        IPYieldTokenV3(YT).updateSyReserve();
    }

    constructor(
        address _SY,
        string memory _name,
        string memory _symbol,
        uint8 __decimals,
        uint256 _expiry
    ) FractleERC20Permit(_name, _symbol, __decimals) {
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

    function redeemInterest(
        address user,
        bool redeemInterest
    ) external nonReentrant updateData returns (uint256 interestOut) {
        if (redeemInterest) {
            IPYieldTokenV3(YT).updateAndDistributeInterestFPT(user);
            interestOut = IPYieldTokenV3(YT).doTransferOutInterestFPT(user, SY);
            emit RedeemInterestFPT(user, interestOut);
        } else {
            interestOut = 0;
        }
    }

    function _beforeTokenTransfer(address from, address to, uint256) internal override {
        if (isExpired()) IPYieldTokenV3(YT).setPostExpiryData();
        IPYieldTokenV3(YT).updateAndDistributeInterestForTwoFPT(from, to);
    }

}
