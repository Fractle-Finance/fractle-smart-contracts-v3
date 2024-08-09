// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.17;

import "../../core/libraries/TokenHelper.sol";
import "../../interfaces/IStandardizedYield.sol";
import "../../interfaces/IPYieldToken.sol";
import "../../core/libraries/Errors.sol";

struct TokenInput {
    // Token/Sy data
    address tokenIn;
    uint256 netTokenIn;
    address tokenMintSy;
}

struct TokenOutput {
    // Token/Sy data
    address tokenOut;
    uint256 minTokenOut;
    address tokenRedeemSy;
}

// solhint-disable no-empty-blocks
abstract contract ActionBaseMintRedeem is TokenHelper {
    bytes internal constant EMPTY_BYTES = abi.encode();

    function _mintSyFromToken(
        address receiver,
        address SY,
        uint256 minSyOut,
        TokenInput calldata inp
    ) internal returns (uint256 netSyOut) {
        uint256 netTokenMintSy;
        _transferIn(inp.tokenIn, msg.sender, inp.netTokenIn);
        netTokenMintSy = inp.netTokenIn;
        netSyOut = __mintSy(receiver, SY, netTokenMintSy, minSyOut, inp);
    }

    /// @dev pre-condition: having netTokenMintSy of tokens in this contract
    function __mintSy(
        address receiver,
        address SY,
        uint256 netTokenMintSy,
        uint256 minSyOut,
        TokenInput calldata inp
    ) private returns (uint256 netSyOut) {
        uint256 netNative = inp.tokenMintSy == NATIVE ? netTokenMintSy : 0;
        netSyOut = IStandardizedYield(SY).deposit{value: netNative}(
            receiver,
            inp.tokenMintSy,
            netTokenMintSy,
            minSyOut
        );
    }

    function _redeemSyToToken(
        address receiver,
        address SY,
        uint256 netSyIn,
        address tokenRedeemSy
    ) internal returns (uint256 netTokenOut) {
        netTokenOut = __redeemSy(receiver, SY, netSyIn, tokenRedeemSy);
    }

    function _redeemSyToToken(
        address receiver,
        address SY,
        uint256 netSyIn,
        TokenOutput calldata out,
        bool doPull
    ) internal returns (uint256 netTokenOut) {
        netTokenOut = __redeemSy(receiver, SY, netSyIn, out, doPull);
        netTokenOut = _selfBalance(out.tokenOut);
        _transferOut(out.tokenOut, receiver, netTokenOut);

        if (netTokenOut < out.minTokenOut) {
            revert Errors.RouterInsufficientTokenOut(
                netTokenOut,
                out.minTokenOut
            );
        }
    }

    function __redeemSy(
        address receiver,
        address SY,
        uint256 netSyIn,
        address tokenRedeemSy
    ) private returns (uint256 netTokenRedeemed) {
        netTokenRedeemed = IStandardizedYield(SY).redeem(
            receiver,
            netSyIn,
            tokenRedeemSy,
            0,
            true
        );
    }

    function __redeemSy(
        address receiver,
        address SY,
        uint256 netSyIn,
        TokenOutput calldata out,
        bool doPull
    ) private returns (uint256 netTokenRedeemed) {
        if (doPull) {
            _transferFrom(IERC20(SY), msg.sender, SY, netSyIn);
        }

        netTokenRedeemed = IStandardizedYield(SY).redeem(
            receiver,
            netSyIn,
            out.tokenRedeemSy,
            0,
            true
        );
    }

    function _mintPyFromSy(
        address receiver,
        address SY,
        address YT,
        uint256 netSyIn,
        uint256 minPyOut,
        bool doPull
    ) internal returns (uint256 netPyOut) {
        if (doPull) {
            _transferFrom(IERC20(SY), msg.sender, YT, netSyIn);
        }

        netPyOut = IPYieldToken(YT).mintPY(receiver, receiver);
        if (netPyOut < minPyOut)
            revert Errors.RouterInsufficientPYOut(netPyOut, minPyOut);
    }

    function _redeemPyToSy(
        address receiver,
        address YT,
        uint256 netPyIn,
        uint256 minSyOut
    ) internal returns (uint256 netSyOut) {
        address PT = IPYieldToken(YT).PT();

        _transferFrom(IERC20(PT), msg.sender, YT, netPyIn);

        bool needToBurnYt = (!IPYieldToken(YT).isExpired());
        if (needToBurnYt) _transferFrom(IERC20(YT), msg.sender, YT, netPyIn);

        netSyOut = IPYieldToken(YT).redeemPY(receiver);
        if (netSyOut < minSyOut)
            revert Errors.RouterInsufficientSyOut(netSyOut, minSyOut);
    }
}
