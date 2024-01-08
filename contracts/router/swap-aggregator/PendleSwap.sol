// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.17;

import "../../core/libraries/TokenHelper.sol";
import "./IPSwapAggregator.sol";
import "./kyberswap/KyberInputScalingHelper.sol";
import "./oneinch/OneInchAggregationRouterHelper.sol";

contract EuphratesSwap is
    IPSwapAggregator,
    TokenHelper,
    KyberInputScalingHelper,
    OneInchAggregationRouterHelper
{
    using Address for address;

    function swap(
        address tokenIn,
        uint256 amountIn,
        SwapData calldata data
    ) external payable {
        _safeApproveInf(tokenIn, data.extRouter);
        data.extRouter.functionCallWithValue(
            data.needScale
                ? _getScaledInputData(data.swapType, data.extCalldata, amountIn)
                : data.extCalldata,
            tokenIn == NATIVE ? amountIn : 0
        );
    }

    function _getScaledInputData(
        SwapType swapType,
        bytes calldata rawCallData,
        uint256 amountIn
    ) internal pure returns (bytes memory scaledCallData) {
        if (swapType == SwapType.KYBERSWAP) {
            scaledCallData = _getKyberScaledInputData(rawCallData, amountIn);
        } else if (swapType == SwapType.ONE_INCH) {
            scaledCallData = _get1inchScaledInputData(rawCallData, amountIn);
        } else {
            assert(false);
        }
    }

    receive() external payable {}
}
