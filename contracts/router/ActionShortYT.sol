// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.17;

import "./base/ActionBaseMintRedeem.sol";
import "./base/CallbackHelper.sol";
import "../interfaces/IPActionSwapYT.sol";
import "../interfaces/IPActionSwapPT.sol";
import "../interfaces/IAddressProvider.sol";
import "../interfaces/IPMarket.sol";
import "../core/libraries/Errors.sol";

import "./base/ActionBaseCallback.sol";
import "../core/libraries/TokenHelper.sol";

contract ActionShortYT is TokenHelper {
    using PMath for uint256;
    using PMath for int256;
    using MarketMathCore for MarketState;
    using MarketApproxPtInLib for MarketState;
    using MarketApproxPtOutLib for MarketState;
    using PYIndexLib for IPYieldTokenV3;

    IPActionSwapYT ActionSwapYT;
    IPActionSwapPT ActionSwapPT;
    uint256 internal collateralRate;

    mapping(address => uint256) public shortPositionOf;

    constructor(
        address _actionSwapYT,
        address _actionSwapPT,
        uint256 _collateralRate
    ) {
        ActionSwapYT = IPActionSwapYT(_actionSwapYT);
        ActionSwapPT = IPActionSwapPT(_actionSwapPT);
        collateralRate = _collateralRate;
    }

    function fundUnderlying(
        address tokenIn,
        uint256 amountIn
    ) external returns (bool) {
        IStandardizedYield SY = IStandardizedYield(tokenIn);
        _transferFrom(IERC20(SY), msg.sender, address(this), amountIn);
        return true;
    }

    function shortYT(
        address market,
        uint256 exactYtShort,
        ApproxParams calldata guessNewImpliedRate
    ) external returns (uint256 SyAsCollateral, uint256 netSyIn) {
        //use swap sy for exact pt
        (IStandardizedYield SY, , IPYieldTokenV3 YT) = IPMarket(market)
            .readTokens();

        MarketState memory state = IPMarket(market).readState(
            address(ActionSwapPT)
        );
        uint256 sAPR = IPMarket(market).sAPR(); //new
        uint256 blockTime = YT.lastGlobalInterestUpdatedDayIndexByOracle(); //new,daily,newest interest day

        //exactYtShort == exactPtLong
        (netSyIn, , ) = state.swapSyForExactPt(
            YT.newIndex(),
            exactYtShort,
            guessNewImpliedRate,
            sAPR,
            blockTime
        );

        //deposit collateral
        SyAsCollateral = netSyIn.mulDown(collateralRate);
        _transferFrom(IERC20(SY), msg.sender, address(this), SyAsCollateral);

        SY.approve(address(ActionSwapPT), netSyIn);
        ActionSwapPT.swapSyForExactPt(
            address(this),
            market,
            exactYtShort,
            netSyIn + 1,
            guessNewImpliedRate
        );
        shortPositionOf[msg.sender] += exactYtShort;
    }
}
