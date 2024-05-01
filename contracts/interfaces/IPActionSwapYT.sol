// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import "../router/base/MarketApproxLib.sol";
import "../router/base/ActionBaseMintRedeem.sol";

interface IPActionSwapYT {
    event SwapYtAndSy(
        address indexed caller,
        address indexed market,
        address indexed receiver,
        int256 netYtToAccount,
        int256 netSyToAccount
    );

    event SwapPtAndYt(
        address indexed caller,
        address indexed market,
        address indexed receiver,
        int256 netPtToAccount,
        int256 netYtToAccount
    );

    function swapExactSyForYt(
        address receiver,
        address market,
        uint256 exactSyIn,
        uint256 minYtOut,
        ApproxParams calldata guessYtOut,
        ApproxParams calldata guessNewImpliedRate
    ) external returns (uint256 netYtOut, uint256 netSyFee);

    function swapExactYtForSy(
        address receiver,
        address market,
        uint256 exactYtIn,
        uint256 minSyOut,
        ApproxParams calldata guessNewImpliedRate
    ) external returns (uint256 netSyOut, uint256 netSyFee);

    function swapSyForExactYt(
        address receiver,
        address market,
        uint256 exactYtOut,
        uint256 maxSyIn,
        ApproxParams calldata guessNewImpliedRate
    ) external returns (uint256 netSyIn, uint256 netSyFee);

    function swapYtForExactSy(
        address receiver,
        address market,
        uint256 exactSyOut,
        uint256 maxYtIn,
        ApproxParams calldata guessYtIn,
        ApproxParams calldata guessNewImpliedRate
    ) external returns (uint256 netYtIn, uint256 netSyFee);

    function swapExactPtForYt(
        address receiver,
        address market,
        uint256 exactPtIn,
        uint256 minYtOut,
        ApproxParams calldata guessTotalPtToSwap,
        ApproxParams calldata guessNewImpliedRate
    ) external returns (uint256 netYtOut, uint256 netSyFee);

    function swapExactYtForPt(
        address receiver,
        address market,
        uint256 exactYtIn,
        uint256 minPtOut,
        ApproxParams calldata guessTotalPtSwapped,
        ApproxParams calldata guessNewImpliedRate
    ) external returns (uint256 netPtOut, uint256 netSyFee);
}
