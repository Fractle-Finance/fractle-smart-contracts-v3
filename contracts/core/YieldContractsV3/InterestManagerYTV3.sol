// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.17;

import "../../interfaces/IPYieldTokenV3.sol";
import "../../interfaces/IPPrincipalToken.sol";
import "../../interfaces/IPInterestManagerYTV2.sol";
import "../../interfaces/IPYieldContractFactory.sol";
import "../../interfaces/IPMarketFactory.sol";
import "../../interfaces/IPFPTRewardInSY.sol";

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "../libraries/math/PMath.sol";
import "../libraries/TokenHelper.sol";
import "../StandardizedYield/SYUtils.sol";

/*
With YT yielding more SYs overtime, which is allowed to be redeemed by users, the reward distribution should
be based on the amount of SYs that their YT currently represent, plus with their dueInterest.

It has been proven and tested that totalSyRedeemable will not change over time, unless users redeem their interest or redeemPY.

Due to this, it is required to update users' accruedReward STRICTLY BEFORE redeeming their interest.
*/
abstract contract InterestManagerYTV3 is TokenHelper, IPInterestManagerYTV2 {
    using PMath for uint256;

    struct UserInterest {
        uint128 index;
        uint128 accrued;
        uint256 pyIndex;
    }

    struct UserInterestFPT {
        uint128 index;
        uint128 accrued;
        uint256 pyIndex;
    }

    uint256 public lastInterestBlock;

    uint256 public globalInterestIndex;

    uint256 public globalInterestIndexFPT;

    address private externalRewardDistributor;

    address private marketFactory;

    //"day index" is index of day, 1,2,3,...,N
    //last interest day index is the day index of prev interest updating day.
    //it will be 0,1,2,3,....,N
    uint256 internal _lastInterestDayIndex;

    //ticked by chain link automization hosting, +=1 when pyindex grows
    //no matter there are transactions in the market or not
    //it will be 0,1,2,3,....,N
    uint256 internal _lastGlobalInterestUpdatedDayIndexByOracle;

    uint256 internal sAPRForFPT;//sAPR is for FPT, wei decimal

    mapping(address => UserInterest) public userInterest;

    mapping(address => UserInterestFPT) public userInterestFPT;

    uint256 internal constant INITIAL_INTEREST_INDEX = 1;

    constructor(uint256 _sAPR, address _externalRewardDistributor, address _marketFactory) {
        sAPRForFPT = _sAPR;
        externalRewardDistributor = _externalRewardDistributor;
        marketFactory = _marketFactory;
    }

    function lastGlobalInterestUpdatedDayIndexByOracle() public view returns(uint256){
        return _lastGlobalInterestUpdatedDayIndexByOracle;
    }

    function _updateAndDistributeInterest(address user) internal virtual {
        _updateAndDistributeInterestForTwo(user, address(0));
    }

    function _updateAndDistributeInterestFPT(address user) internal virtual {
        _updateAndDistributeInterestForTwoFPT(user, address(0));
    }    

    function _updateAndDistributeInterestForTwo(address user1, address user2) internal virtual {
        (uint256 index, , uint256 pyIndex) = _updateInterestIndex();

        if (user1 != address(0) && user1 != address(this))
            _distributeInterestPrivate(user1, index, pyIndex);
        if (user2 != address(0) && user2 != address(this))
            _distributeInterestPrivate(user2, index, pyIndex);
    }

    function _updateAndDistributeInterestForTwoFPT(address user1, address user2) internal virtual {
        (,uint256 indexFPT, uint256 pyIndex) = _updateInterestIndex();

        if (user1 != address(0) && user1 != address(this))
            _distributeInterestPrivateFPT(user1, indexFPT, pyIndex);
        if (user2 != address(0) && user2 != address(this))
            _distributeInterestPrivateFPT(user2, indexFPT, pyIndex);
    }

    function _doTransferOutInterest(
        address user,
        address SY
    ) internal returns (uint256 interestAmount) {
        interestAmount = userInterest[user].accrued;
        userInterest[user].accrued = 0;
        _transferOut(SY, user, interestAmount);
    }

    function _doTransferOutInterestFPT(
        address user,
        address SY
    ) internal returns (uint256 interestAmount) {
        interestAmount = userInterestFPT[user].accrued;
        userInterestFPT[user].accrued = 0;
        if (IPMarketFactory(marketFactory).isValidMarket(user)) {
            _transferOut(SY, externalRewardDistributor, interestAmount);
            IPFPTRewardInSY(externalRewardDistributor).mintForMarket(address(this), interestAmount);
        } else {
            _transferOut(SY, user, interestAmount);
        }
    }

    // should only be callable from `_distributeInterestForTwo` & make sure user != address(0) && user != address(this)
    function _distributeInterestPrivate(
        address user,
        uint256 currentIndex,
        uint256 pyIndex
    ) private {
        assert(user != address(0) && user != address(this));

        uint256 prevIndex = userInterest[user].index;
        // uint256 interestFeeRate = _getInterestFeeRate();

        if (prevIndex == currentIndex) return;

        if (prevIndex == 0) {
            userInterest[user].index = currentIndex.Uint128();
            userInterest[user].pyIndex = pyIndex;
            return;
        }

        userInterest[user].accrued += _YTbalance(user).mulDown(currentIndex - prevIndex).Uint128();
        userInterest[user].index = currentIndex.Uint128();
        userInterest[user].pyIndex = pyIndex;
    }

    function _distributeInterestPrivateFPT(
        address user,
        uint256 currentIndex,
        uint256 pyIndex
    ) private {
        assert(user != address(0) && user != address(this));

        uint256 prevIndex = userInterestFPT[user].index;
        // uint256 interestFeeRate = _getInterestFeeRate();

        if (prevIndex == currentIndex) return;

        if (prevIndex == 0) {
            userInterestFPT[user].index = currentIndex.Uint128();
            userInterestFPT[user].pyIndex = pyIndex;
            return;
        }

        userInterestFPT[user].accrued += _FPTbalance(user).mulDown(currentIndex - prevIndex).Uint128();
        userInterestFPT[user].index = currentIndex.Uint128();
        userInterestFPT[user].pyIndex = pyIndex;
    }
  
    //update index and collect doest not seperate for FPT/DYT
    //need to deal with FPT DYT userInterest data 
    function _updateInterestIndex() internal returns (uint256 index, uint256 indexFPT, uint256 pyIndex) {
        if (lastInterestBlock != block.number) {
            // if we have not yet update the index for this block
            lastInterestBlock = block.number;

            uint256 totalShares = _YTSupply();
            uint256 accrued;

            (accrued, pyIndex) = _collectInterest();
            //  distribute between FPT and DYT and update the index
            index = globalInterestIndex;
            indexFPT = globalInterestIndexFPT;
            
            if (index == 0) index = INITIAL_INTEREST_INDEX;
            if (indexFPT == 0) indexFPT = INITIAL_INTEREST_INDEX;
            
            // update _lastGlobalInterestUpdatedDayIndexByOracle
            if (totalShares != 0){
                uint256 deltaDay = _lastGlobalInterestUpdatedDayIndexByOracle - _lastInterestDayIndex; // normal number without decimals
                uint256 accruedForFPT = sAPRForFPT * deltaDay;
                uint256 accruedForDYT = accrued > accruedForFPT ? accrued-accruedForFPT : 0;
                index += accruedForDYT.divDown(totalShares);
                indexFPT += accruedForFPT.divDown(totalShares);
                _lastInterestDayIndex = _lastGlobalInterestUpdatedDayIndexByOracle;
            }

            globalInterestIndex = index;
            globalInterestIndexFPT = indexFPT;
        } else {
            index = globalInterestIndex;
            indexFPT = globalInterestIndexFPT;
            pyIndex = _getGlobalPYIndex();
        }
    }

    function _getGlobalPYIndex() internal view virtual returns (uint256);

    function _collectInterest() internal virtual returns (uint256, uint256);

    function _YTbalance(address user) internal view virtual returns (uint256);

    function _FPTbalance(address user) internal view virtual returns (uint256);

    function _YTSupply() internal view virtual returns (uint256);
}
