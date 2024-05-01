// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.17;

import "./base/ActionBaseMintRedeem.sol";
import "./base/CallbackHelper.sol";
import "../interfaces/IPActionSwapYT.sol";
import "../interfaces/IAddressProvider.sol";
import "../interfaces/IPMarket.sol";
import "../core/libraries/Errors.sol";

import "./base/ActionBaseCallback.sol";

/// @dev All swap actions will revert if market is expired
contract ActionSwapYT is
    ActionBaseCallback,
    IPActionSwapYT,
    ActionBaseMintRedeem
{
    using PMath for uint256;
    using PMath for int256;
    using MarketMathCore for MarketState;
    using MarketApproxPtInLib for MarketState;
    using MarketApproxPtOutLib for MarketState;
    using PYIndexLib for IPYieldTokenV3;

    constructor(
        IAddressProvider provider,
        uint256 providerId
    ) ActionBaseCallback(_getMarketFactory(provider, providerId)) {}

    function _getMarketFactory(
        IAddressProvider provider,
        uint256 providerId
    ) internal view returns (address) {
        return provider.get(providerId);
    }

    /**
     * @notice swap exact SY to YT with the help of flashswaps & YT tokenization / redemption
     * @dev inner working of this function:
     - `exactSyIn` SY is transferred to YT contract
     - `market.swapExactPtForSy` is called, which will transfer more SY directly to YT contract &
       callback is invoked. Note that now we owe PT
     - in callback, all SY in YT contract is used to mint PT + YT, with all PT used to pay back the
       loan, and all YT transferred to the receiver
     * @param exactSyIn will always consume this amount of SY for as much YT as possible
     * @param guessYtOut approximation data for total YT output
     * @dev this function works in conjunction with ActionCallback
     */
    function swapExactSyForYt(
        address receiver,
        address market,
        uint256 exactSyIn,
        uint256 minYtOut,
        ApproxParams calldata guessYtOut,
        ApproxParams calldata guessNewImpliedRate
    ) external returns (uint256 netYtOut, uint256 netSyFee) {
        (IStandardizedYield SY, , IPYieldTokenV3 YT) = IPMarket(market)
            .readTokens();

        _transferFrom(IERC20(SY), msg.sender, address(YT), exactSyIn);

        (netYtOut, netSyFee) = _swapExactSyForYt(
            receiver,
            market,
            YT,
            exactSyIn,
            minYtOut,
            guessYtOut,
            guessNewImpliedRate
        );

        emit SwapYtAndSy(
            msg.sender,
            market,
            receiver,
            netYtOut.Int(),
            exactSyIn.neg()
        );
    }

    /**
     * @notice swap exact YT to SY with the help of flashswaps & YT tokenization / redemption
     * @dev inner working of this function:
     - `exactYtIn` YT is transferred to YT contract
     - `market.swapSyForExactPt` is called, which will transfer PT directly to YT contract &
       callback is invoked. Note that now we owe SY.
     - In callback, all PT + YT in YT contract is used to redeem SY. A portion of SY is used to
       payback the loan, the rest is transferred to the `receiver`
     * @param exactYtIn will consume exactly this much YT for as much SY as possible
     * @dev this function works in conjunction with ActionCallback
     */
    function swapExactYtForSy(
        address receiver,
        address market,
        uint256 exactYtIn,
        uint256 minSyOut,
        ApproxParams calldata guessNewImpliedRate
    ) external returns (uint256 netSyOut, uint256 netSyFee) {
        (IStandardizedYield SY, , IPYieldTokenV3 YT) = IPMarket(market)
            .readTokens();

        _transferFrom(IERC20(YT), msg.sender, address(YT), exactYtIn);

        (netSyOut, netSyFee) = _swapExactYtForSy(
            receiver,
            market,
            SY,
            YT,
            exactYtIn,
            minSyOut,
            guessNewImpliedRate
        );

        emit SwapYtAndSy(
            msg.sender,
            market,
            receiver,
            exactYtIn.neg(),
            netSyOut.Int()
        );
    }

    /**
     * @notice swap SY to exact YT with the help of flashswaps & YT tokenization / redemption
     * @dev inner working of this function:
     - `market.swapExactPtForSy` is called, which will transfer SY directly to YT contract &
       callback is invoked. Note that now we owe PT
     - In callback, we will pull in more SY as needed from caller & mint all SY to PT + YT. PT is
       then used to payback the loan, while YT is transferred to `receiver`
     * @param exactYtOut will output exactly this amount of YT, no approximation is used
     * @dev this function works in conjunction with ActionCallback
     */
    function swapSyForExactYt(
        address receiver,
        address market,
        uint256 exactYtOut,
        uint256 maxSyIn,
        ApproxParams calldata guessNewImpliedRate
    ) external returns (uint256 netSyIn, uint256 netSyFee) {
        (IStandardizedYield SY, , IPYieldTokenV3 YT) = IPMarket(market)
            .readTokens();

        uint256 preSyBalance = SY.balanceOf(msg.sender);

        bytes memory encodingParams = abi.encode(
            msg.sender,
            receiver,
            maxSyIn,
            SY,
            YT
        );

        uint256 netSyFee = _trySwapExactPtForSy(
            market,
            YT,
            exactYtOut,
            guessNewImpliedRate,
            encodingParams,
            false
        );

        netSyIn = preSyBalance - SY.balanceOf(msg.sender);

        emit SwapYtAndSy(
            msg.sender,
            market,
            receiver,
            exactYtOut.Int(),
            netSyIn.neg()
        );
    }

    /**
     * @notice swap YT to exact SY with the help of flashswaps & YT tokenization / redemption
     * @dev inner working of this function:
     - Approximates `netYtIn` using the data from `guessYtIn`
     - Pulls `netYtIn` amount of YT from caller
     - `market.swapSyForExactPt` is called, which will transfer PT directly to YT contract &
       callback is invoked. Note that now we owe SY
     - In callback, we will redeem all PT + YT to get SY. A portion of it is used to payback the
       loan. The rest is transferred to `receiver`
     * @dev this function works in conjunction with ActionCallback
     */
    function swapYtForExactSy(
        address receiver,
        address market,
        uint256 exactSyOut,
        uint256 maxYtIn,
        ApproxParams calldata guessYtIn,
        ApproxParams calldata guessNewImpliedRate
    ) external returns (uint256 netYtIn, uint256 netSyFee) {
        MarketState memory state = IPMarket(market).readState(address(this));
        (, , IPYieldTokenV3 YT) = IPMarket(market).readTokens();

        (netYtIn, , ) = state.approxSwapYtForExactSy(
            YT.newIndex(),
            exactSyOut,
            YT.lastGlobalInterestUpdatedDayIndexByOracle(),
            guessYtIn,
            IPMarket(market).sAPR()
        );

        if (netYtIn > maxYtIn)
            revert Errors.RouterExceededLimitYtIn(netYtIn, maxYtIn);

        _transferFrom(IERC20(YT), msg.sender, address(YT), netYtIn);

        netSyFee = _trySwapSyForExactPt(
            market,
            YT,
            receiver,
            netYtIn,
            exactSyOut,
            guessNewImpliedRate
        );
    }

    function _trySwapSyForExactPt(
        address market,
        IPYieldTokenV3 YT,
        address receiver,
        uint256 netYtIn,
        uint256 exactSyOut,
        ApproxParams calldata guessNewImpliedRate
    ) internal returns (uint256 netSyFee) {
        (, netSyFee) = IPMarket(market).swapSyForExactPt(
            address(YT),
            netYtIn, // exactPtOut = netYtIn
            guessNewImpliedRate,
            _encodeSwapYtForSy(receiver, exactSyOut, YT)
        );
        emit SwapYtAndSy(
            msg.sender,
            market,
            receiver,
            netYtIn.neg(),
            exactSyOut.Int()
        );
    }

    /**
     * @notice swap exact PT to YT with the help of flashswaps & YT tokenization / redemption
     * @dev inner working of this function:
     - `exactPtIn` PT is transferred to market contract
     - `market.swapExactPtForSy` is called, which will transfer SY directly to YT contract & callback is invoked.
        Note that we will owe PT, the amount before is not sufficient
     - in callback, all SY in YT contract is used to mint PT + YT, with PT used to pay the rest of the loan, and YT
        transferred to the receiver
     * @param exactPtIn will always consume this amount of PT for as much YT as possible
     * @param guessTotalPtToSwap approximation data for PT used for the PT-to-SY flashswap
     * @dev this function works in conjunction with ActionCallback
     */
    function swapExactPtForYt(
        address receiver,
        address market,
        uint256 exactPtIn,
        uint256 minYtOut,
        ApproxParams calldata guessTotalPtToSwap,
        ApproxParams calldata guessNewImpliedRate
    ) external returns (uint256 netYtOut, uint256 netSyFee) {
        (, IPPrincipalToken PT, IPYieldTokenV3 YT) = IPMarket(market)
            .readTokens();
        MarketState memory state = IPMarket(market).readState(address(this));

        _transferFrom(IERC20(PT), msg.sender, market, exactPtIn);

        uint256 totalPtToSwap;

        (netYtOut, totalPtToSwap, netSyFee) = state.approxSwapExactPtForYt(
            YT.newIndex(),
            exactPtIn,
            YT.lastGlobalInterestUpdatedDayIndexByOracle(),
            guessTotalPtToSwap,
            IPMarket(market).sAPR()
        );

        if (netYtOut < minYtOut)
            revert Errors.RouterInsufficientYtOut(netYtOut, minYtOut);

        bytes memory encodingParams = abi.encode(
            receiver,
            exactPtIn,
            minYtOut,
            YT
        );

        _trySwapExactPtForSy(
            market,
            YT,
            totalPtToSwap,
            guessNewImpliedRate,
            encodingParams,
            true
        );

        emit SwapPtAndYt(
            msg.sender,
            market,
            receiver,
            exactPtIn.neg(),
            netYtOut.Int()
        );
    }

    function _trySwapExactPtForSy(
        address market,
        IPYieldTokenV3 YT,
        uint256 amountPtToSwap,
        ApproxParams calldata guessNewImpliedRate,
        bytes memory encodingParams,
        bool ptForYt
    ) internal returns (uint256 netSyFee) {
        bytes memory encodingResult;
        if (ptForYt) {
            (
                address receiver,
                uint256 exactPtIn,
                uint256 minYtOut,
                IPYieldTokenV3 YT
            ) = abi.decode(
                    encodingParams,
                    (address, uint256, uint256, IPYieldTokenV3)
                );
            encodingResult = _encodeSwapExactPtForYt(
                receiver,
                exactPtIn,
                minYtOut,
                YT
            );
        } else {
            (
                address sender,
                address receiver,
                uint256 maxSyIn,
                IStandardizedYield SY,
                IPYieldTokenV3 YT
            ) = abi.decode(
                    encodingParams,
                    (
                        address,
                        address,
                        uint256,
                        IStandardizedYield,
                        IPYieldTokenV3
                    )
                );
            encodingResult = _encodeSwapSyForExactYt(
                sender,
                receiver,
                maxSyIn,
                SY,
                YT
            );
        }
        (, uint256 netSyFee) = IPMarket(market).swapExactPtForSy(
            address(YT),
            amountPtToSwap,
            guessNewImpliedRate,
            encodingResult
        );
    }

    /**
     * @notice swap exact YT to PT with the help of flashswaps & YT tokenization / redemption
     * @dev inner working of this function:
     - `exactYtIn` YT is transferred to yield contract
     - `market.swapSyForExactPt` is called, which will transfer PT directly to this contract & callback is invoked.
        Note that we now owe SY
     - in callback, a portion of PT + YT is used to redeem SY, which is then used to payback the loan. The rest of
       of the PT is transferred to `receiver`
     * @param exactYtIn will always consume this amount of YT for as much PT as possible
     * @param guessTotalPtFromSwap approximation data for PT output of the SY-to-PT flashswap
     * @dev this function works in conjunction with ActionCallback
     */
    function swapExactYtForPt(
        address receiver,
        address market,
        uint256 exactYtIn,
        uint256 minPtOut,
        ApproxParams calldata guessTotalPtFromSwap,
        ApproxParams calldata guessNewImpliedRate
    ) external returns (uint256 netPtOut, uint256 netSyFee) {
        (, IPPrincipalToken PT, IPYieldTokenV3 YT) = IPMarket(market)
            .readTokens();
        MarketState memory state = IPMarket(market).readState(address(this));

        _transferFrom(IERC20(YT), msg.sender, address(YT), exactYtIn);

        uint256 totalPtFromSwap;
        (netPtOut, totalPtFromSwap, netSyFee) = state.approxSwapExactYtForPt(
            YT.newIndex(),
            exactYtIn,
            YT.lastGlobalInterestUpdatedDayIndexByOracle(),
            guessTotalPtFromSwap,
            IPMarket(market).sAPR()
        );

        if (netPtOut < minPtOut)
            revert Errors.RouterInsufficientPtOut(netPtOut, minPtOut);

        _trySwapSyForExactPt(
            receiver,
            market,
            PT,
            YT,
            totalPtFromSwap,
            exactYtIn,
            minPtOut,
            guessNewImpliedRate
        );

        emit SwapPtAndYt(
            msg.sender,
            market,
            receiver,
            netPtOut.Int(),
            exactYtIn.neg()
        );
    }

    function _trySwapSyForExactPt(
        address receiver,
        address market,
        IPPrincipalToken PT,
        IPYieldTokenV3 YT,
        uint256 amountPtFromSwap,
        uint256 exactYtIn,
        uint256 minPtOut,
        ApproxParams calldata guessNewImpliedRate
    ) internal {
        IPMarket(market).swapSyForExactPt(
            address(this),
            amountPtFromSwap,
            guessNewImpliedRate,
            _encodeSwapExactYtForPt(receiver, exactYtIn, minPtOut, PT, YT)
        );
    }

    function _swapExactSyForYt(
        address receiver,
        address market,
        IPYieldTokenV3 YT,
        uint256 exactSyIn,
        uint256 minYtOut,
        ApproxParams calldata guessYtOut,
        ApproxParams calldata guessNewImpliedRate
    ) internal returns (uint256 netYtOut, uint256 netSyFee) {
        MarketState memory state = IPMarket(market).readState(address(this));

        (netYtOut, ) = state.approxSwapExactSyForYt(
            YT.newIndex(),
            exactSyIn,
            YT.lastGlobalInterestUpdatedDayIndexByOracle(),
            guessYtOut,
            IPMarket(market).sAPR()
        );

        // early-check
        if (netYtOut < minYtOut)
            revert Errors.RouterInsufficientYtOut(netYtOut, minYtOut);

        (, netSyFee) = IPMarket(market).swapExactPtForSy(
            address(YT),
            netYtOut, // exactPtIn = netYtOut
            guessNewImpliedRate,
            _encodeSwapExactSyForYt(receiver, minYtOut, YT)
        );
    }

    function _swapExactYtForSy(
        address receiver,
        address market,
        IStandardizedYield SY,
        IPYieldTokenV3 YT,
        uint256 exactYtIn,
        uint256 minSyOut,
        ApproxParams calldata guessNewImpliedRate
    ) internal returns (uint256 netSyOut, uint256 netSyFee) {
        uint256 preSyBalance = SY.balanceOf(receiver);

        (, netSyFee) = IPMarket(market).swapSyForExactPt(
            address(YT),
            exactYtIn, // exactPtOut = exactYtIn
            guessNewImpliedRate,
            _encodeSwapYtForSy(receiver, minSyOut, YT)
        );

        netSyOut = SY.balanceOf(receiver) - preSyBalance;
    }
}
