// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.17;

import "../..//interfaces/IPMarketFactory.sol";
import "../..//interfaces/IPMarket.sol";
import "../..//interfaces/IPMarketSwapCallback.sol";
import "../..//core/libraries/Errors.sol";

import "./MarketApproxLib.sol";
import "./ActionBaseMintRedeem.sol";
import "./CallbackHelper.sol";

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

abstract contract ActionBaseCallback is IPMarketSwapCallback, CallbackHelper, TokenHelper {
    using PMath for int256;
    using PMath for uint256;
    using PYIndexLib for PYIndex;
    using PYIndexLib for IPYieldTokenV3;

    address internal immutable marketFactory;

    modifier onlyEuphratesMarket(address caller) {
        if (!IPMarketFactory(marketFactory).isValidMarket(caller))
            revert Errors.RouterCallbackNotEuphratesMarket(caller);
        _;
    }

    /// @dev since this contract will be proxied, it must not contains non-immutable variables
    constructor(address _marketFactory) {
        marketFactory = _marketFactory;
    }

    /**
     * @dev The callback is only callable by a Euphrates Market created by the factory
     */
    function swapCallback(
        int256 ptToAccount,
        int256 syToAccount,
        bytes calldata data
    ) external override {
        ActionType swapType = _getActionType(data);
        if (swapType == ActionType.SwapExactSyForYt) {
            _callbackSwapExactSyForYt(ptToAccount, syToAccount, data);
        } else if (swapType == ActionType.SwapSyForExactYt) {
            _callbackSwapSyForExactYt(ptToAccount, syToAccount, data);
        } else if (swapType == ActionType.SwapYtForSy) {
            _callbackSwapYtForSy(ptToAccount, syToAccount, data);
        } else if (swapType == ActionType.SwapExactYtForPt) {
            _callbackSwapExactYtForPt(ptToAccount, syToAccount, data);
        } else if (swapType == ActionType.SwapExactPtForYt) {
            _callbackSwapExactPtForYt(ptToAccount, syToAccount, data);
        } else {
            assert(false);
        }
    }

    /// @dev refer to _swapExactSyForYt
    function _callbackSwapExactSyForYt(
        int256 ptToAccount,
        int256 /*syToAccount*/,
        bytes calldata data
    ) internal {
        (address receiver, uint256 minYtOut, IPYieldTokenV3 YT) = _decodeSwapExactSyForYt(data);

        uint256 ptOwed = ptToAccount.abs();
        uint256 netPyOut = YT.mintPY(msg.sender, receiver);

        if (netPyOut < ptOwed) revert Errors.RouterInsufficientPtRepay(netPyOut, ptOwed);
        if (netPyOut < minYtOut) revert Errors.RouterInsufficientYtOut(netPyOut, minYtOut);
    }

    /// @dev refer to _swapSyForExactYt
    /// @dev we require msg.sender to be market here to make sure payer is the original msg.sender
    function _callbackSwapSyForExactYt(
        int256 ptToAccount,
        int256 syToAccount,
        bytes calldata data
    ) internal onlyEuphratesMarket(msg.sender) {
        (
            address payer,
            address receiver,
            uint256 maxSyToPull,
            IStandardizedYield SY,
            IPYieldTokenV3 YT
        ) = _decodeSwapSyForExactYt(data);

        /// ------------------------------------------------------------
        /// calc totalSyNeed
        /// ------------------------------------------------------------
        PYIndex pyIndex = YT.newIndex();
        uint256 ptOwed = ptToAccount.abs();
        uint256 totalSyNeed = pyIndex.assetToSyUp(ptOwed);

        /// ------------------------------------------------------------
        /// calc netSyToPull
        /// ------------------------------------------------------------
        uint256 syReceived = syToAccount.Uint();
        uint256 netSyToPull = totalSyNeed.subMax0(syReceived);

        if (netSyToPull > maxSyToPull)
            revert Errors.RouterExceededLimitSyIn(netSyToPull, maxSyToPull);

        /// ------------------------------------------------------------
        /// mint & transfer
        /// ------------------------------------------------------------
        if (netSyToPull > 0) {
            _transferFrom(IERC20(SY), payer, address(YT), netSyToPull);
        }

        uint256 netPyOut = YT.mintPY(msg.sender, receiver);
        if (netPyOut < ptOwed) revert Errors.RouterInsufficientPtRepay(netPyOut, ptOwed);
    }

    /// @dev refer to _swapExactYtForSy or _swapYtForExactSy
    function _callbackSwapYtForSy(
        int256 ptToAccount,
        int256 syToAccount,
        bytes calldata data
    ) internal {
        (address receiver, uint256 minSyOut, IPYieldTokenV3 YT) = _decodeSwapYtForSy(data);
        PYIndex pyIndex = YT.newIndex();

        uint256 syOwed = syToAccount.neg().Uint();

        address[] memory receivers = new address[](2);
        uint256[] memory amountPYToRedeems = new uint256[](2);

        (receivers[0], amountPYToRedeems[0]) = (msg.sender, pyIndex.syToAssetUp(syOwed));
        (receivers[1], amountPYToRedeems[1]) = (
            receiver,
            ptToAccount.Uint() - amountPYToRedeems[0]
        );

        uint256[] memory amountSyOuts = YT.redeemPYMulti(receivers, amountPYToRedeems);
        if (amountSyOuts[1] < minSyOut)
            revert Errors.RouterInsufficientSyOut(amountSyOuts[1], minSyOut);
    }

    function _callbackSwapExactPtForYt(
        int256 ptToAccount,
        int256 /*syToAccount*/,
        bytes calldata data
    ) internal {
        (
            address receiver,
            uint256 exactPtIn,
            uint256 minYtOut,
            IPYieldTokenV3 YT
        ) = _decodeSwapExactPtForYt(data);
        uint256 netPtOwed = ptToAccount.abs();

        uint256 netPyOut = YT.mintPY(msg.sender, receiver);
        if (netPyOut < minYtOut) revert Errors.RouterInsufficientYtOut(netPyOut, minYtOut);
        if (exactPtIn + netPyOut < netPtOwed)
            revert Errors.RouterInsufficientPtRepay(exactPtIn + netPyOut, netPtOwed);
    }

    function _callbackSwapExactYtForPt(
        int256 ptToAccount,
        int256 syToAccount,
        bytes calldata data
    ) internal {
        (
            address receiver,
            uint256 exactYtIn,
            uint256 minPtOut,
            IPPrincipalToken PT,
            IPYieldTokenV3 YT
        ) = _decodeSwapExactYtForPt(data);

        uint256 netSyOwed = syToAccount.abs();

        _transferOut(address(PT), address(YT), exactYtIn);
        uint256 netSyToMarket = YT.redeemPY(msg.sender);

        if (netSyToMarket < netSyOwed)
            revert Errors.RouterInsufficientSyRepay(netSyToMarket, netSyOwed);

        uint256 netPtOut = ptToAccount.Uint() - exactYtIn;
        if (netPtOut < minPtOut) revert Errors.RouterInsufficientPtOut(netPtOut, minPtOut);

        _transferOut(address(PT), receiver, netPtOut);
    }
}
