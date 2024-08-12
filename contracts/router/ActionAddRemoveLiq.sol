// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.17;

import "./base/ActionBaseMintRedeem.sol";
import "../interfaces/IPActionAddRemoveLiq.sol";
import "../interfaces/IPMarket.sol";
import "../core/libraries/Errors.sol";

/**
 * @dev If market is expired, all actions will revert, except for the following:
 * - removeLiquidityDualSyAndPt()
 * - removeLiquidityDualTokenAndPt()
 * - removeLiquiditySingleSy()
 * - removeLiquiditySingleToken()
 * This is because swapping and adding liquidity are not allowed on an expired market.
 */
contract ActionAddRemoveLiq is IPActionAddRemoveLiq, ActionBaseMintRedeem {
    using PMath for uint256;
    using PMath for int256;
    using MarketMathCore for MarketState;
    using MarketApproxPtInLib for MarketState;
    using MarketApproxPtOutLib for MarketState;
    using PYIndexLib for IPYieldTokenV3;
    using PYIndexLib for PYIndex;

    ApproxParams internal EMPTY_APPROX;

    /**
     * @notice Adds liquidity to the SY/PT market, granting LP tokens in return
     * @dev Will mint as much LP as possible given no more than `netSyDesired` and `netPtDesired`,
     * while not changing the market's price
     * @dev Only the necessary SY/PT amount will be transferred
     * @dev Reverts if market is expired
     */
    function addLiquidityDualSyAndPt(
        address receiver,
        address market,
        uint256 netSyDesired,
        uint256 netPtDesired,
        uint256 minLpOut,
        ApproxParams calldata guessInitialImpliedRate //only used when init a pool,set all 0 if not init
    )
        external
        returns (uint256 netLpOut, uint256 netSyUsed, uint256 netPtUsed)
    {
        (IStandardizedYield SY, IPPrincipalToken PT, ) = IPMarket(market)
            .readTokens();

        // calculate the amount of SY and PT to be used
        MarketState memory state = IPMarket(market).readState(address(this));
        (, netLpOut, netSyUsed, netPtUsed) = state.addLiquidity(
            netSyDesired,
            netPtDesired,
            block.timestamp
        );
        // early-check
        if (netLpOut < minLpOut)
            revert Errors.RouterInsufficientLpOut(netLpOut, minLpOut);

        // execute the addLiquidity
        _transferFrom(IERC20(SY), msg.sender, market, netSyUsed);
        _transferFrom(IERC20(PT), msg.sender, market, netPtUsed);

        (netLpOut, , ) = IPMarket(market).mint(
            receiver,
            netSyUsed,
            netPtUsed,
            guessInitialImpliedRate
        );

        // fail-safe
        if (netLpOut < minLpOut) assert(false);

        emit AddLiquidityDualSyAndPt(
            msg.sender,
            market,
            receiver,
            netSyUsed,
            netPtUsed,
            netLpOut
        );
    }

    /**
     * @notice Swaps partial SY to PT, then use them to add liquidity to SY/PT pair
     * @param netSyIn amount of SY to be transferred in from caller
     * @param guessPtReceivedFromSy approx. output PT from the swap
     * @return netLpOut actual LP output, will not be lower than `minLpOut`
     * @return netSyFee amount of SY fee incurred from the swap
     * @dev Reverts if market is expired
     */
    // no need to set guess initial r here, since this function cannot be called when init
    function addLiquiditySingleSy(
        address receiver,
        address market,
        uint256 netSyIn,
        uint256 minLpOut,
        ApproxParams calldata guessPtReceivedFromSy,
        ApproxParams calldata guessNewImpliedRate
    ) external returns (uint256 netLpOut, uint256 netSyFee) {
        (IStandardizedYield SY, , IPYieldTokenV3 YT) = IPMarket(market)
            .readTokens();

        // transfer SY to market
        _transferFrom(IERC20(SY), msg.sender, market, netSyIn);

        // mint LP
        (netLpOut, netSyFee) = _addLiquiditySingleSy(
            receiver,
            market,
            YT,
            netSyIn,
            minLpOut,
            guessPtReceivedFromSy,
            guessNewImpliedRate
        );

        emit AddLiquiditySingleSy(
            msg.sender,
            market,
            receiver,
            netSyIn,
            netLpOut
        );
    }

    /**
     * @notice Burns LP token to remove SY/PT liquidity
     * @param netLpToRemove amount of LP to be burned from caller
     * @dev Will work even if market is expired
     */
    function removeLiquidityDualSyAndPt(
        address receiver,
        address market,
        uint256 netLpToRemove,
        uint256 minSyOut,
        uint256 minPtOut
    ) external returns (uint256 netSyOut, uint256 netPtOut) {
        _transferFrom(IERC20(market), msg.sender, market, netLpToRemove);

        (netSyOut, netPtOut) = IPMarket(market).burn(
            receiver,
            receiver,
            netLpToRemove
        );

        if (netSyOut < minSyOut)
            revert Errors.RouterInsufficientSyOut(netSyOut, minSyOut);
        if (netPtOut < minPtOut)
            revert Errors.RouterInsufficientPtOut(netPtOut, minPtOut);

        emit RemoveLiquidityDualSyAndPt(
            msg.sender,
            market,
            receiver,
            netLpToRemove,
            netPtOut,
            netSyOut
        );
    }

    /**
     * @notice Removes SY/PT liquidity, then converts all resulting PT to return only SY
     * @dev Conversion is done with market swap if not expired, or with PT redeeming if expired
     * @param netLpToRemove amount of LP to be burned from caller
     * @return netSyOut total SY output, will not be lower than `minSyOut`
     * @return netSyFee amount of SY fee incurred from the swap
     * @dev Will work even if market is expired
     */
    function removeLiquiditySingleSy(
        address receiver,
        address market,
        uint256 netLpToRemove,
        uint256 minSyOut,
        ApproxParams calldata guessNewImpliedRate
    ) external returns (uint256 netSyOut, uint256 netSyFee) {
        // transfer LP to market
        _transferFrom(IERC20(market), msg.sender, market, netLpToRemove);

        // burn LP, SY sent to receiver
        (netSyOut, netSyFee) = _removeLiquiditySingleSy(
            receiver,
            market,
            netLpToRemove,
            minSyOut,
            guessNewImpliedRate
        );

        emit RemoveLiquiditySingleSy(
            msg.sender,
            market,
            receiver,
            netLpToRemove,
            netSyOut
        );
    }

    /// @dev swaps SY to PT, then adds liquidity
    function _addLiquiditySingleSy(
        address receiver,
        address market,
        IPYieldTokenV3 YT,
        uint256 netSyIn,
        uint256 minLpOut,
        ApproxParams calldata guessPtReceivedFromSy,
        ApproxParams calldata guessNewImpliedRate
    ) internal returns (uint256 netLpOut, uint256 netSyFee) {
        MarketState memory state = IPMarket(market).readState(address(this));

        uint256 sAPR = IPMarket(market).sAPR(); //new
        uint256 blockTime = YT.lastGlobalInterestUpdatedDayIndexByOracle(); //new

        // calculate the PT amount needed to add liquidity
        (uint256 netPtFromSwap, , ) = state.approxSwapSyToAddLiquidity(
            YT.newIndex(),
            netSyIn,
            blockTime,
            guessPtReceivedFromSy,
            sAPR
        );

        // execute the swap & the addLiquidity
        uint256 netSySwapped;
        (netSySwapped, netSyFee) = IPMarket(market).swapSyForExactPt(
            market,
            netPtFromSwap,
            guessNewImpliedRate,
            EMPTY_BYTES
        );

        (netLpOut, , ) = IPMarket(market).mint(
            receiver,
            netSyIn - netSySwapped,
            netPtFromSwap,
            EMPTY_APPROX
        );

        if (netLpOut < minLpOut)
            revert Errors.RouterInsufficientLpOut(netLpOut, minLpOut);
    }

    /// @dev removes SY/PT liquidity, then converts PT to SY
    function _removeLiquiditySingleSy(
        address receiver,
        address market,
        uint256 netLpToRemove,
        uint256 minSyOut,
        ApproxParams calldata guessNewImpliedRate
    ) internal returns (uint256 netSyOut, uint256 netSyFee) {
        if (IPMarket(market).isExpired()) {
            netSyOut = __removeLpToSyAfterExpiry(
                receiver,
                market,
                netLpToRemove
            );
        } else {
            (netSyOut, netSyFee) = __removeLpToSyBeforeExpiry(
                receiver,
                market,
                netLpToRemove,
                guessNewImpliedRate
            );
        }

        if (netSyOut < minSyOut)
            revert Errors.RouterInsufficientSyOut(netSyOut, minSyOut);
    }

    /// @dev converts PT to SY post-expiry
    function __removeLpToSyAfterExpiry(
        address receiver,
        address market,
        uint256 netLpToRemove
    ) internal returns (uint256 netSyOut) {
        (, , IPYieldTokenV3 YT) = IPMarket(market).readTokens();
        (uint256 syFromBurn, ) = IPMarket(market).burn(
            receiver,
            address(YT),
            netLpToRemove
        );
        netSyOut = syFromBurn + YT.redeemPY(receiver);
    }

    /// @dev swaps PT to SY pre-expiry
    function __removeLpToSyBeforeExpiry(
        address receiver,
        address market,
        uint256 netLpToRemove,
        ApproxParams calldata guessNewImpliedRate
    ) internal returns (uint256 netSyOut, uint256 netSyFee) {
        (uint256 syFromBurn, uint256 ptFromBurn) = IPMarket(market).burn(
            receiver,
            market,
            netLpToRemove
        );

        uint256 syFromSwap;
        (syFromSwap, netSyFee) = IPMarket(market).swapExactPtForSy(
            receiver,
            ptFromBurn,
            guessNewImpliedRate,
            EMPTY_BYTES
        );

        netSyOut = syFromBurn + syFromSwap;
    }
}
