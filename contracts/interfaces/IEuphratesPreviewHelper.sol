// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

interface IFractlePreviewHelper {
    function previewDeposit(
        address tokenIn,
        uint256 amountTokenIn
    ) external view returns (uint256 amountSharesOut);

    function previewRedeem(
        address tokenOut,
        uint256 amountSharesToBurn
    ) external view returns (uint256 amountTokenOut);
}
