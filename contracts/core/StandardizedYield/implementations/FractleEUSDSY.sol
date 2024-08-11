// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.17;

import "../SYBase.sol";
import "../../../interfaces/Lido/ISTETH.sol";

contract FractleSTETHSY is SYBase {
    address public immutable stETH;

    constructor(
        string memory _name,
        string memory _symbol,
        address _stETH
    ) SYBase(_name, _symbol, _stETH) {
        stETH = _stETH;
    }

    /*///////////////////////////////////////////////////////////////
                    DEPOSIT/REDEEM USING BASE TOKENS
    //////////////////////////////////////////////////////////////*/

    function _deposit(
        address /*tokenIn*/,
        uint256 amountDeposited
    ) internal virtual override returns (uint256 /*amountSharesOut*/) {
        return ISTETH(stETH).getSharesByMintedEUSD(amountDeposited);
    }

    function _redeem(
        address receiver,
        address /*tokenOut*/,
        uint256 amountSharesToRedeem
    ) internal virtual override returns (uint256 /*amountTokenOut*/) {
        return ISTETH(stETH).transferShares(receiver, amountSharesToRedeem);
    }

    /*///////////////////////////////////////////////////////////////
                               EXCHANGE-RATE
    //////////////////////////////////////////////////////////////*/

    function exchangeRate() public view virtual override returns (uint256) {
        return ISTETH(stETH).getMintedEUSDByShares(1e18);
    }

    /*///////////////////////////////////////////////////////////////
                MISC FUNCTIONS FOR METADATA
    //////////////////////////////////////////////////////////////*/

    function _previewDeposit(
        address /*tokenIn*/,
        uint256 amountTokenToDeposit
    ) internal view override returns (uint256 /*amountSharesOut*/) {
        return ISTETH(stETH).getSharesByMintedEUSD(amountTokenToDeposit);
    }

    function _previewRedeem(
        address /*tokenOut*/,
        uint256 amountSharesToRedeem
    ) internal view override returns (uint256 /*amountTokenOut*/) {
        return ISTETH(stETH).getMintedEUSDByShares(amountSharesToRedeem);
    }

    function getTokensIn()
        public
        view
        virtual
        override
        returns (address[] memory res)
    {
        res = new address[](1);
        res[0] = stETH;
    }

    function getTokensOut()
        public
        view
        virtual
        override
        returns (address[] memory res)
    {
        res = new address[](1);
        res[0] = stETH;
    }

    function isValidTokenIn(
        address token
    ) public view virtual override returns (bool) {
        return token == stETH;
    }

    function isValidTokenOut(
        address token
    ) public view virtual override returns (bool) {
        return token == stETH;
    }

    function assetInfo()
        external
        view
        returns (AssetType assetType, address assetAddress, uint8 assetDecimals)
    {
        assetType = AssetType.TOKEN;
        assetAddress = stETH;
        assetDecimals = 18;
    }
}
