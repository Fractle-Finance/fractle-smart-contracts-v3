// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import "../../../interfaces/IPGauge.sol";
import "../../../interfaces/IStandardizedYield.sol";
import "../../../interfaces/IPMarketFactoryV2.sol";
import "../../../interfaces/IPExternalRewardDistributor.sol";
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

import "../../RewardManager/RewardManager.sol";

/**
Invariants to maintain:
- before any changes to active balance, updateAndDistributeRewards() must be called
 */
abstract contract EuphratesGaugeV2 is RewardManager, IPGauge {
    using PMath for uint256;
    using SafeERC20 for IERC20;
    using ArrayLib for address[];

    address private immutable SY;

    uint256 internal constant TOKENLESS_PRODUCTION = 40;

    address internal immutable EUPHRATES;
    address internal immutable externalRewardDistributor;

    uint256 public totalActiveSupply;
    mapping(address => uint256) public activeBalance;

    constructor(
        address _SY,
        address _EUPHRATES,
        address _externalRewardDistributor
    ) {
        SY = _SY;
        EUPHRATES = _EUPHRATES;
        externalRewardDistributor = _externalRewardDistributor;
    }

    /**
     * @dev Since rewardShares is based on activeBalance, user's activeBalance must be updated AFTER
        rewards is updated
     * @dev It's intended to have user's activeBalance updated when rewards is redeemed
     */
    function _redeemRewards(address user) internal virtual returns (uint256[] memory rewardsOut) {
        _updateAndDistributeRewards(user);
        _updateUserActiveBalance(user);
        rewardsOut = _doTransferOutRewards(user, user);
        emit RedeemRewards(user, rewardsOut);
    }

    function _updateUserActiveBalance(address user) internal virtual {
        _updateUserActiveBalanceForTwo(user, address(0));
    }

    function _updateUserActiveBalanceForTwo(address user1, address user2) internal virtual {
        if (user1 != address(0) && user1 != address(this)) _updateUserActiveBalancePrivate(user1);
        if (user2 != address(0) && user2 != address(this)) _updateUserActiveBalancePrivate(user2);
    }

    /**
     * @dev should only be callable from `_updateUserActiveBalanceForTwo` to guarantee user != address(0) && user != address(this)
     */
    function _updateUserActiveBalancePrivate(address user) private {
        assert(user != address(0) && user != address(this));

        uint256 lpBalance = _stakedBalance(user);

        totalActiveSupply = totalActiveSupply - activeBalance[user] + lpBalance;
        activeBalance[user] = lpBalance;
    }

    function _redeemExternalReward() internal virtual override {
        IStandardizedYield(SY).claimRewards(address(this));
//        IPExternalRewardDistributor(externalRewardDistributor).redeemRewards();
    }

    function _stakedBalance(address user) internal view virtual returns (uint256);

    function _totalStaked() internal view virtual returns (uint256);

    function _rewardSharesTotal() internal view virtual override returns (uint256) {
        return totalActiveSupply;
    }

    function _rewardSharesUser(address user) internal view virtual override returns (uint256) {
        return activeBalance[user];
    }

    function _getRewardTokens()
        internal
        view
        virtual
        override
        returns (address[] memory rewardTokens)
    {
        address[] memory SYRewards = IStandardizedYield(SY).getRewardTokens();
//        address[] memory externalRewards = IPExternalRewardDistributor(externalRewardDistributor)
//            .getRewardTokens(address(this));

//        rewardTokens = SYRewards.merge(externalRewards);
        if (rewardTokens.contains(EUPHRATES)) return rewardTokens;
        return rewardTokens.append(EUPHRATES);
    }

    function _beforeTokenTransfer(address from, address to, uint256) internal virtual {
        _updateAndDistributeRewardsForTwo(from, to);
    }

    function _afterTokenTransfer(address from, address to, uint256) internal virtual {
        _updateUserActiveBalanceForTwo(from, to);
    }
}
