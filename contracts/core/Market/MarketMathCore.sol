// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import "../libraries/math/PMath.sol";
import "../libraries/math/LogExpMath.sol";

import "../StandardizedYield/PYIndex.sol";
import "../libraries/MiniHelpers.sol";
import "../libraries/Errors.sol";
import "../../router/base/MarketApproxLib.sol";

struct MarketState {
    int256 totalPt;
    int256 totalSy;
    int256 totalLp;
    address treasury;
    /// immutable variables ///
    int256 scalarRoot;
    uint256 expiry;
    uint256 lifecircle;//new,from yt
    /// fee data ///
    uint256 lnFeeRateRoot;
    uint256 reserveFeePercent; // base 100
    /// last trade data ///
    uint256 lastLnImpliedRate;
}

// params that are expensive to compute, therefore we pre-compute them
struct MarketPreCompute {
    int256 rateScalar;
    int256 totalAsset;
    int256 rateAnchor;
    int256 feeRate;
}

// solhint-disable ordering
library MarketMathCore {
    using PMath for uint256;
    using PMath for int256;
    using LogExpMath for int256;
    using PYIndexLib for PYIndex;

    int256 internal constant MINIMUM_LIQUIDITY = 10 ** 3;
    int256 internal constant PERCENTAGE_DECIMALS = 100;
    uint256 internal constant DAY = 86400;
    uint256 internal constant IMPLIED_RATE_TIME = 365 * DAY;

    int256 internal constant MAX_MARKET_PROPORTION = (1e18 * 96) / 100;

    using PMath for uint256;
    using PMath for int256;

    /*///////////////////////////////////////////////////////////////
                UINT FUNCTIONS TO PROXY TO CORE FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function addLiquidity(
        MarketState memory market,
        uint256 syDesired,
        uint256 ptDesired,
        uint256 blockTime
    )
        internal
        pure
        returns (uint256 lpToReserve, uint256 lpToAccount, uint256 syUsed, uint256 ptUsed)
    {
        (
            int256 _lpToReserve,
            int256 _lpToAccount,
            int256 _syUsed,
            int256 _ptUsed
        ) = addLiquidityCore(market, syDesired.Int(), ptDesired.Int(), blockTime);

        lpToReserve = _lpToReserve.Uint();
        lpToAccount = _lpToAccount.Uint();
        syUsed = _syUsed.Uint();
        ptUsed = _ptUsed.Uint();
    }

    function removeLiquidity(
        MarketState memory market,
        uint256 lpToRemove
    ) internal pure returns (uint256 netSyToAccount, uint256 netPtToAccount) {
        (int256 _syToAccount, int256 _ptToAccount) = removeLiquidityCore(market, lpToRemove.Int());

        netSyToAccount = _syToAccount.Uint();
        netPtToAccount = _ptToAccount.Uint();
    }

    function swapExactPtForSy(
        MarketState memory market,
        PYIndex index,
        uint256 exactPtToMarket,
        ApproxParams calldata guessNewImpliedRate,//new
        uint256 sAPR,//new
        uint256 blockTime//daily,newest interest day
    ) internal pure returns (uint256 netSyToAccount, uint256 netSyFee, uint256 netSyToReserve) {
        (int256 _netSyToAccount, int256 _netSyFee, int256 _netSyToReserve) = executeTradeCore(
            market,
            index,
            exactPtToMarket.neg(),
            guessNewImpliedRate,//new
            sAPR,//new
            blockTime//daily
        );

        netSyToAccount = _netSyToAccount.Uint();
        netSyFee = _netSyFee.Uint();
        netSyToReserve = _netSyToReserve.Uint();
    }

    function swapSyForExactPt(
        MarketState memory market,
        PYIndex index,
        uint256 exactPtToAccount,
        ApproxParams calldata guessNewImpliedRate,//new
        uint256 sAPR,//new
        uint256 blockTime//daily newest interest day
    ) internal pure returns (uint256 netSyToMarket, uint256 netSyFee, uint256 netSyToReserve) {
        (int256 _netSyToAccount, int256 _netSyFee, int256 _netSyToReserve) = executeTradeCore(
            market,
            index,
            exactPtToAccount.Int(),
            guessNewImpliedRate,//new
            sAPR,//new
            blockTime//daily
        );

        netSyToMarket = _netSyToAccount.neg().Uint();
        netSyFee = _netSyFee.Uint();
        netSyToReserve = _netSyToReserve.Uint();
    }

    /*///////////////////////////////////////////////////////////////
                    CORE FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function addLiquidityCore(
        MarketState memory market,
        int256 syDesired,
        int256 ptDesired,
        uint256 blockTime
    )
        internal
        pure
        returns (int256 lpToReserve, int256 lpToAccount, int256 syUsed, int256 ptUsed)
    {
        /// ------------------------------------------------------------
        /// CHECKS
        /// ------------------------------------------------------------
        if (syDesired == 0 || ptDesired == 0) revert Errors.MarketZeroAmountsInput();
        if (MiniHelpers.isExpired(market.expiry, blockTime)) revert Errors.MarketExpired();

        /// ------------------------------------------------------------
        /// MATH
        /// ------------------------------------------------------------
        if (market.totalLp == 0) {
            lpToAccount = PMath.sqrt((syDesired * ptDesired).Uint()).Int() - MINIMUM_LIQUIDITY;
            lpToReserve = MINIMUM_LIQUIDITY;
            syUsed = syDesired;
            ptUsed = ptDesired;
        } else {
            int256 netLpByPt = (ptDesired * market.totalLp) / market.totalPt;
            int256 netLpBySy = (syDesired * market.totalLp) / market.totalSy;
            if (netLpByPt < netLpBySy) {
                lpToAccount = netLpByPt;
                ptUsed = ptDesired;
                syUsed = (market.totalSy * lpToAccount) / market.totalLp;
            } else {
                lpToAccount = netLpBySy;
                syUsed = syDesired;
                ptUsed = (market.totalPt * lpToAccount) / market.totalLp;
            }
        }

        if (lpToAccount <= 0) revert Errors.MarketZeroAmountsOutput();

        /// ------------------------------------------------------------
        /// WRITE
        /// ------------------------------------------------------------
        market.totalSy += syUsed;
        market.totalPt += ptUsed;
        market.totalLp += lpToAccount + lpToReserve;
    }

    function removeLiquidityCore(
        MarketState memory market,
        int256 lpToRemove
    ) internal pure returns (int256 netSyToAccount, int256 netPtToAccount) {
        /// ------------------------------------------------------------
        /// CHECKS
        /// ------------------------------------------------------------
        if (lpToRemove == 0) revert Errors.MarketZeroAmountsInput();

        /// ------------------------------------------------------------
        /// MATH
        /// ------------------------------------------------------------
        netSyToAccount = (lpToRemove * market.totalSy) / market.totalLp;
        netPtToAccount = (lpToRemove * market.totalPt) / market.totalLp;

        if (netSyToAccount == 0 && netPtToAccount == 0) revert Errors.MarketZeroAmountsOutput();

        /// ------------------------------------------------------------
        /// WRITE
        /// ------------------------------------------------------------
        market.totalLp = market.totalLp.subNoNeg(lpToRemove);
        market.totalPt = market.totalPt.subNoNeg(netPtToAccount);
        market.totalSy = market.totalSy.subNoNeg(netSyToAccount);
    }

    function executeTradeCore(
        MarketState memory market,
        PYIndex index,
        int256 netPtToAccount,
        ApproxParams calldata guessNewImpliedRate,//new
        uint256 sAPR,//new
        uint256 blockTime//daily
    ) internal pure returns (int256 netSyToAccount, int256 netSyFee, int256 netSyToReserve) {
        /// ------------------------------------------------------------
        /// CHECKS
        /// ------------------------------------------------------------
        if (MiniHelpers.isExpired(market.lifecircle, blockTime)) revert Errors.MarketExpired();
        if (market.totalPt <= netPtToAccount)
            revert Errors.MarketInsufficientPtForTrade(market.totalPt, netPtToAccount);

        /// ------------------------------------------------------------
        /// MATH
        /// ------------------------------------------------------------
        MarketPreCompute memory comp = getMarketPreCompute(market, index, sAPR, blockTime);

        (netSyToAccount, netSyFee, netSyToReserve) = calcTrade(
            market,
            comp,
            index,
            netPtToAccount
        );

        /// ------------------------------------------------------------
        /// WRITE
        /// ------------------------------------------------------------
        _setNewMarketStateTrade(
            market,
            comp,
            index,
            netPtToAccount,
            netSyToAccount,
            netSyToReserve,
            guessNewImpliedRate,//new
            sAPR,//new
            blockTime//daily，day index
        );
    }

    function getMarketPreCompute(
        MarketState memory market,
        PYIndex index,
        uint256 sAPR,//new
        uint256 blockTime//daily
    ) internal pure returns (MarketPreCompute memory res) {
        if (MiniHelpers.isExpired(market.lifecircle, blockTime)) revert Errors.MarketExpired();

        //uint256 timeToExpiry = market.expiry - blockTime;
        uint256 timeToExpiry = market.lifecircle - blockTime;//how many days left before expiry

        res.rateScalar = _getRateScalar(market, timeToExpiry*DAY);
        res.totalAsset = index.syToAsset(market.totalSy);

        if (market.totalPt == 0 || res.totalAsset == 0)
            revert Errors.MarketZeroTotalPtOrTotalAsset(market.totalPt, res.totalAsset);

        res.rateAnchor = _getRateAnchor(
            market.totalPt,
            market.lastLnImpliedRate,
            res.totalAsset,
            res.rateScalar,
            sAPR,//new
            timeToExpiry//daily
        );
        res.feeRate = _getExchangeRateFromImpliedRate(market.lnFeeRateRoot, timeToExpiry);
    }

    function calcTrade(
        MarketState memory market,
        MarketPreCompute memory comp,
        PYIndex index,
        int256 netPtToAccount
    ) internal pure returns (int256 netSyToAccount, int256 netSyFee, int256 netSyToReserve) {
        int256 preFeeExchangeRate = _getExchangeRate(
            market.totalPt,
            comp.totalAsset,
            comp.rateScalar,
            comp.rateAnchor,
            netPtToAccount
        );

        int256 preFeeAssetToAccount = netPtToAccount.divDown(preFeeExchangeRate).neg();
        int256 fee = comp.feeRate;

        if (netPtToAccount > 0) {
            int256 postFeeExchangeRate = preFeeExchangeRate.divDown(fee);
            if (postFeeExchangeRate < PMath.IONE)
                revert Errors.MarketExchangeRateBelowOne(postFeeExchangeRate);

            fee = preFeeAssetToAccount.mulDown(PMath.IONE - fee);
        } else {
            fee = ((preFeeAssetToAccount * (PMath.IONE - fee)) / fee).neg();
        }

        int256 netAssetToReserve = (fee * market.reserveFeePercent.Int()) / PERCENTAGE_DECIMALS;
        int256 netAssetToAccount = preFeeAssetToAccount - fee;

        netSyToAccount = netAssetToAccount < 0
            ? index.assetToSyUp(netAssetToAccount)
            : index.assetToSy(netAssetToAccount);
        netSyFee = index.assetToSy(fee);
        netSyToReserve = index.assetToSy(netAssetToReserve);
    }

    function _setNewMarketStateTrade(
        MarketState memory market,
        MarketPreCompute memory comp,
        PYIndex index,
        int256 netPtToAccount,
        int256 netSyToAccount,
        int256 netSyToReserve,
        ApproxParams calldata guessNewImpliedRate,//new
        uint256 sAPR,//new
        uint256 blockTime//daily
    ) internal pure {
        uint256 timeToExpiry = market.lifecircle - blockTime;//daily,how many days left before expiry,n

        market.totalPt = market.totalPt.subNoNeg(netPtToAccount);
        market.totalSy = market.totalSy.subNoNeg(netSyToAccount + netSyToReserve);
        //_getLnImpliedRate now is a validation method,not a calculation function
        market.lastLnImpliedRate = _getLnImpliedRate(
            market.totalPt,
            index.syToAsset(market.totalSy),
            comp.rateScalar,
            comp.rateAnchor,
            guessNewImpliedRate,//new
            sAPR,//new
            timeToExpiry//daily,n in e**(-rn/365)
        );

        if (market.lastLnImpliedRate == 0) revert Errors.MarketZeroLnImpliedRate();
    }

    function _getRateAnchor(
        int256 totalPt,
        uint256 lastLnImpliedRate,//1e18 decimal
        int256 totalAsset,
        int256 rateScalar,
        uint256 sAPR,//new
        uint256 timeToExpiry//daily,how many days left before expiry
    ) internal pure returns (int256 rateAnchor) {
        //int256 newExchangeRate = _getExchangeRateFromImpliedRate(lastLnImpliedRate, timeToExpiry);
        int256 newExchangeRate = _getFPTExchangeRateFromImpliedRate(lastLnImpliedRate, sAPR, timeToExpiry);

        if (newExchangeRate < PMath.IONE) revert Errors.MarketExchangeRateBelowOne(newExchangeRate);

        {
            int256 proportion = totalPt.divDown(totalPt + totalAsset);

            int256 lnProportion = _logProportion(proportion);

            rateAnchor = newExchangeRate - lnProportion.divDown(rateScalar);
        }
    }

    /// @notice Calculates the current market implied rate.
    /// @return lnImpliedRate the implied rate
    function _getLnImpliedRate(
        int256 totalPt,
        int256 totalAsset,
        int256 rateScalar,
        int256 rateAnchor,
        ApproxParams calldata guessNewImpliedRate,//new
        uint256 sAPR,//new
        uint256 timeToExpiry
    ) internal pure returns (uint256 lnImpliedRate) {
        // This will check for exchange rates < PMath.IONE
        int256 exchangeRate = _getExchangeRate(totalPt, totalAsset, rateScalar, rateAnchor, 0);

        // exchangeRate >= 1 so its ln >= 0
        //uint256 lnRate = exchangeRate.ln().Uint();
        //this should never be a calculation method, it should be a validation method
        //lnImpliedRate = (lnRate * IMPLIED_RATE_TIME) / timeToExpiry;

        //use guessNewImpliedRate to estimate
        if (guessNewImpliedRate.guessOffchain == 0) {
            guessNewImpliedRate.guessMax = PMath.ONE;
            guessNewImpliedRate.guessMin = 0;
        }

        for (uint256 iter = 0; iter < guessNewImpliedRate.maxIteration; ++iter) {
            uint256 guess = nextGuessImpliedRate(guessNewImpliedRate, iter);
            int256 exchangeRateFromImpliedRate = _getFPTExchangeRateFromImpliedRate(guess, sAPR, timeToExpiry);

            if (exchangeRateFromImpliedRate.Uint() >= exchangeRate.Uint()) {
                if (PMath.isAGreaterApproxB(exchangeRateFromImpliedRate.Uint(), exchangeRate.Uint(), guessNewImpliedRate.eps))
                    return guess;
                guessNewImpliedRate.guessMax = guess;
            } else {
                guessNewImpliedRate.guessMin = guess;
            }
        }

        revert Errors.ApproxFail();
    }

    function nextGuessImpliedRate(ApproxParams memory approx, uint256 iter) internal pure returns (uint256) {
        if (iter == 0 && approx.guessOffchain != 0) return approx.guessOffchain;
        if (approx.guessMin <= approx.guessMax) return (approx.guessMin + approx.guessMax) / 2;
        revert Errors.ApproxFail();
    }

    /// @notice Converts an implied rate to an exchange rate given a time to expiry. The
    /// formula is E = e^rt
    function _getExchangeRateFromImpliedRate(
        uint256 lnImpliedRate,//1e18 decimal
        uint256 timeToExpiry//days left before expiry
    ) internal pure returns (int256 exchangeRate) {
        uint256 rt = (lnImpliedRate * timeToExpiry * DAY) / IMPLIED_RATE_TIME;

        exchangeRate = LogExpMath.exp(rt.Int());
    }

    function _getFPTExchangeRateFromImpliedRate(
        uint256 lnImpliedRate,//1e18 decimal
        uint256 sAPR,//1e18 decimal
        uint256 timeToExpiry//daily,how many days left before expiry
    ) internal pure returns(int256 exchangeRate){
        int256 price;//1e18 decimal
        int256 multiplier = (sAPR/365).Int();//1e18 decimal
        uint256 rdiv365 = lnImpliedRate/365;//1e18 decimal,r/365
        uint256 rndiv365 = timeToExpiry*rdiv365;//1e18 decimal,rn/365
        int256 x = LogExpMath.exp(rdiv365.neg());//e**(-r/365),1e18 decimal
        int256 xn = LogExpMath.exp(rndiv365.neg());//e**(-rn/365),1e18 decimal
        int256 sumSequence = (PMath.IONE - xn).divDown(PMath.IONE - x).mulDown(x);//x(1-xn)/(1-x),1e18 decimal
        price = multiplier.mulDown(sumSequence) + xn;//1e18 decimal
        exchangeRate = PMath.IONE.divDown(price);//1e18 decimal
    }

    function _getExchangeRate(
        int256 totalPt,
        int256 totalAsset,
        int256 rateScalar,
        int256 rateAnchor,
        int256 netPtToAccount
    ) internal pure returns (int256 exchangeRate) {
        int256 numerator = totalPt.subNoNeg(netPtToAccount);

        int256 proportion = (numerator.divDown(totalPt + totalAsset));

        if (proportion > MAX_MARKET_PROPORTION)
            revert Errors.MarketProportionTooHigh(proportion, MAX_MARKET_PROPORTION);

        int256 lnProportion = _logProportion(proportion);

        exchangeRate = lnProportion.divDown(rateScalar) + rateAnchor;

        if (exchangeRate < PMath.IONE) revert Errors.MarketExchangeRateBelowOne(exchangeRate);
    }

    function _logProportion(int256 proportion) internal pure returns (int256 res) {
        if (proportion == PMath.IONE) revert Errors.MarketProportionMustNotEqualOne();

        int256 logitP = proportion.divDown(PMath.IONE - proportion);

        res = logitP.ln();
    }

    function _getRateScalar(
        MarketState memory market,
        uint256 timeToExpiry//days left * 86400
    ) internal pure returns (int256 rateScalar) {
        rateScalar = (market.scalarRoot * IMPLIED_RATE_TIME.Int()) / timeToExpiry.Int();
        if (rateScalar <= 0) revert Errors.MarketRateScalarBelowZero(rateScalar);
    }

    function setInitialLnImpliedRate(
        MarketState memory market,
        PYIndex index,
        int256 initialAnchor,
        ApproxParams calldata guessInitialImpliedRate,
        uint256 sAPR
    ) internal pure {
        /// ------------------------------------------------------------
        /// CHECKS
        /// ------------------------------------------------------------
        if (MiniHelpers.isExpired(market.lifecircle, blockTime)) revert Errors.MarketExpired();

        /// ------------------------------------------------------------
        /// MATH
        /// ------------------------------------------------------------
        int256 totalAsset = index.syToAsset(market.totalSy);
        uint256 timeToExpiry = market.lifecircle;//market.expiry - blockTime;
        int256 rateScalar = _getRateScalar(market, timeToExpiry*DAY);

        /// ------------------------------------------------------------
        /// WRITE
        /// ------------------------------------------------------------
        market.lastLnImpliedRate = _getLnImpliedRate(
            market.totalPt,
            totalAsset,
            rateScalar,
            initialAnchor,
            guessInitialImpliedRate,
            sAPR,
            timeToExpiry
        );
    }
}

