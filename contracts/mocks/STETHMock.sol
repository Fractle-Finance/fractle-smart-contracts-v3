// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "../interfaces/Iconfigurator.sol";

import "../router/base/ActionBaseMintRedeem.sol";
import "../interfaces/IPActionMintRedeem.sol";

import "hardhat/console.sol";

/**
 * @title Interest-bearing ERC20-like token for Lido protocol.
 *
 * This contract is abstract.
 *
 * EUSD balances are dynamic and represent the holder's share in the total amount
 * of Ether controlled by the protocol. Account shares aren't normalized, so the
 * contract also stores the sum of all shares to calculate each account's token balance
 * which equals to:
 *
 *   shares[account] * totalSupply / _totalShares
 *
 * For example, assume that we have:
 *
 *   _getTotalMintedEUSD() -> 1000 EUSD
 *   sharesOf(user1) -> 100
 *   sharesOf(user2) -> 400
 *
 * Therefore:
 *
 *   balanceOf(user1) -> 2 tokens which corresponds 200 EUSD
 *   balanceOf(user2) -> 8 tokens which corresponds 800 EUSD
 *
 * Since balances of all token holders change when the amount of total supplied EUSD
 * changes, this token cannot fully implement ERC20 standard: it only emits `Transfer`
 * events upon explicit transfer between holders. In contrast, when total amount of
 * pooled Ether increases, no `Transfer` events are generated: doing so would require
 * emitting an event for each token holder and thus running an unbounded loop.
 */
contract STETHMock is IERC20, Context {
    using SafeMath for uint256;
    Iconfigurator public immutable configurator;
    uint256 private _totalShares;
    uint256 private _totalSupply;
    address private actionMintAndRedeem;
    uint256 constant public UNIT = 1e18;

    /**
     * @dev EUSD balances are dynamic and are calculated based on the accounts' shares
     * and the total supply by the protocol. Account shares aren't
     * normalized, so the contract also stores the sum of all shares to calculate
     * each account's token balance which equals to:
     *
     *   shares[account] * _getTotalMintedEUSD() / _getTotalShares()
     */
    mapping(address => uint256) private shares;

    mapping(address => bool) private minted;

    /**
     * @dev Allowances are nominated in tokens, not token shares.
     */
    mapping(address => mapping(address => uint256)) private allowances;

    /**
     * @notice An executed shares transfer from `sender` to `recipient`.
     *
     * @dev emitted in pair with an ERC20-defined `Transfer` event.
     */
    event TransferShares(
        address indexed from,
        address indexed to,
        uint256 sharesValue
    );

    /**
     * @notice An executed `burnShares` request
     *
     * @dev Reports simultaneously burnt shares amount
     * and corresponding EUSD amount.
     * The EUSD amount is calculated twice: before and after the burning incurred rebase.
     *
     * @param account holder of the burnt shares
     * @param preRebaseTokenAmount amount of EUSD the burnt shares corresponded to before the burn
     * @param postRebaseTokenAmount amount of EUSD the burnt shares corresponded to after the burn
     * @param sharesAmount amount of burnt shares
     */
    event SharesBurnt(
        address indexed account,
        uint256 preRebaseTokenAmount,
        uint256 postRebaseTokenAmount,
        uint256 sharesAmount
    );

    modifier onlyMintVault() {
        require(configurator.mintVault(msg.sender), "");
        _;
    }
    modifier MintPaused() {
        require(!configurator.vaultMintPaused(msg.sender), "");
        _;
    }
    modifier BurnPaused() {
        require(!configurator.vaultBurnPaused(msg.sender), "");
        _;
    }

    constructor(address _config, address _actionMintAndRedeem) {
        actionMintAndRedeem = _actionMintAndRedeem;
        configurator = Iconfigurator(_config);
        _totalShares = 1e24;
        shares[msg.sender] = 1e24;
        _totalSupply = 11e23;
    }

    /**
     * @return the name of the token.
     */
    function name() public pure returns (string memory) {
        return "stETH";
    }

    /**
     * @return the symbol of the token, usually a shorter version of the
     * name.
     */
    function symbol() public pure returns (string memory) {
        return "stETH";
    }

    /**
     * @return the number of decimals for getting user representation of a token amount.
     */
    function decimals() public pure returns (uint8) {
        return 18;
    }

    /**
     * @return the amount of EUSD in existence.
     *
     * @dev Always equals to `_getTotalMintedEUSD()` since token amount
     * is pegged to the total amount of EUSD controlled by the protocol.
     */
    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function changeTotalSupply(uint256 rate) public {
        _totalSupply = (_totalSupply * rate) / 10000;
    }

    /**
     * @return the amount of tokens owned by the `_account`.
     *
     * @dev Balances are dynamic and equal the `_account`'s share in the amount of the
     * total Ether controlled by the protocol. See `sharesOf`.
     */
    function balanceOf(address _account) public view returns (uint256) {
        return getMintedEUSDByShares(_sharesOf(_account));
    }

    /**
     * @notice Moves `_amount` tokens from the caller's account to the `_recipient` account.
     *
     * @return a boolean value indicating whether the operation succeeded.
     * Emits a `Transfer` event.
     * Emits a `TransferShares` event.
     *
     * Requirements:
     *
     * - `_recipient` cannot be the zero address.
     * - the caller must have a balance of at least `_amount`.
     * - the contract must not be paused.
     *
     * @dev The `_amount` argument is the amount of tokens, not shares.
     */
    function transfer(
        address _recipient,
        uint256 _amount
    ) public returns (bool) {
        address owner = _msgSender();
        _transfer(owner, _recipient, _amount);
        return true;
    }

    /**
     * @return the remaining number of tokens that `_spender` is allowed to spend
     * on behalf of `_owner` through `transferFrom`. This is zero by default.
     *
     * @dev This value changes when `approve` or `transferFrom` is called.
     */
    function allowance(
        address _owner,
        address _spender
    ) public view returns (uint256) {
        return allowances[_owner][_spender];
    }

    /**
     * @dev Updates `owner` s allowance for `spender` based on spent `amount`.
     *
     * Does not update the allowance amount in case of infinite allowance.
     * Revert if not enough allowance is available.
     *
     * Might emit an {Approval} event.
     */
    function _spendAllowance(
        address owner,
        address spender,
        uint256 amount
    ) internal virtual {
        uint256 currentAllowance = allowance(owner, spender);
        if (currentAllowance != type(uint256).max) {
            require(
                currentAllowance >= amount,
                "ERC20: insufficient allowance"
            );
            unchecked {
                _approve(owner, spender, currentAllowance - amount);
            }
        }
    }

    /**
     * @notice Sets `_amount` as the allowance of `_spender` over the caller's tokens.
     *
     * @return a boolean value indicating whether the operation succeeded.
     * Emits an `Approval` event.
     *
     * Requirements:
     *
     * - `_spender` cannot be the zero address.
     * - the contract must not be paused.
     *
     * @dev The `_amount` argument is the amount of tokens, not shares.
     */
    function approve(address _spender, uint256 _amount) public returns (bool) {
        address owner = _msgSender();
        _approve(owner, _spender, _amount);
        return true;
    }

    /**
     * @notice Moves `_amount` tokens from `_sender` to `_recipient` using the
     * allowance mechanism. `_amount` is then deducted from the caller's
     * allowance.
     *
     * @return a boolean value indicating whether the operation succeeded.
     *
     * Emits a `Transfer` event.
     * Emits a `TransferShares` event.
     * Emits an `Approval` event indicating the updated allowance.
     *
     * Requirements:
     *
     * - `_sender` and `_recipient` cannot be the zero addresses.
     * - `_sender` must have a balance of at least `_amount`.
     * - the caller must have allowance for `_sender`'s tokens of at least `_amount`.
     * - the contract must not be paused.
     *
     * @dev The `_amount` argument is the amount of tokens, not shares.
     */
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public returns (bool) {
        address spender = _msgSender();
        _transfer(from, to, amount);
        return true;
    }

    /**
     * @notice Atomically increases the allowance granted to `_spender` by the caller by `_addedValue`.
     *
     * This is an alternative to `approve` that can be used as a mitigation for
     * problems described in:
     * https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/IERC20.sol#L42
     * Emits an `Approval` event indicating the updated allowance.
     *
     * Requirements:
     *
     * - `_spender` cannot be the the zero address.
     * - the contract must not be paused.
     */
    function increaseAllowance(
        address _spender,
        uint256 _addedValue
    ) public returns (bool) {
        address owner = _msgSender();
        _approve(owner, _spender, allowances[owner][_spender].add(_addedValue));
        return true;
    }

    /**
     * @notice Atomically decreases the allowance granted to `_spender` by the caller by `_subtractedValue`.
     *
     * This is an alternative to `approve` that can be used as a mitigation for
     * problems described in:
     * https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/IERC20.sol#L42
     * Emits an `Approval` event indicating the updated allowance.
     *
     * Requirements:
     *
     * - `_spender` cannot be the zero address.
     * - `_spender` must have allowance for the caller of at least `_subtractedValue`.
     * - the contract must not be paused.
     */
    function decreaseAllowance(
        address spender,
        uint256 subtractedValue
    ) public virtual returns (bool) {
        address owner = _msgSender();
        uint256 currentAllowance = allowance(owner, spender);
        require(
            currentAllowance >= subtractedValue,
            "ERC20: decreased allowance below zero"
        );
        unchecked {
            _approve(owner, spender, currentAllowance - subtractedValue);
        }

        return true;
    }

    /**
     * @return the total amount of shares in existence.
     *
     * @dev The sum of all accounts' shares can be an arbitrary number, therefore
     * it is necessary to store it in order to calculate each account's relative share.
     */
    function getTotalShares() public view returns (uint256) {
        return _totalShares;
    }

    /**
     * @return the amount of shares owned by `_account`.
     */
    function sharesOf(address _account) public view returns (uint256) {
        return _sharesOf(_account);
    }

    /**
     * @return the amount of shares that corresponds to `_EUSDAmount` protocol-supplied EUSD.
     */
    function getSharesByMintedEUSD(
        uint256 _EUSDAmount
    ) public view returns (uint256) {
        uint256 totalMintedEUSD = _totalSupply;
        if (totalMintedEUSD == 0) {
            return 0;
        } else {
            return _EUSDAmount.mul(_totalShares).div(totalMintedEUSD);
        }
    }

    /**
     * @return the amount of EUSD that corresponds to `_sharesAmount` token shares.
     */
    function getMintedEUSDByShares(
        uint256 _sharesAmount
    ) public view returns (uint256) {
        if (_totalShares == 0) {
            return 0;
        } else {
            return _sharesAmount.mul(_totalSupply).div(_totalShares).mul((block.timestamp) - uint(117096491)).div(1529717628);
        }
    }

    /**
     * @notice Moves `_sharesAmount` token shares from the caller's account to the `_recipient` account.
     *
     * @return amount of transferred tokens.
     * Emits a `TransferShares` event.
     * Emits a `Transfer` event.
     *
     * Requirements:
     *
     * - `_recipient` cannot be the zero address.
     * - the caller must have at least `_sharesAmount` shares.
     * - the contract must not be paused.
     *
     * @dev The `_sharesAmount` argument is the amount of shares, not tokens.
     */
    function transferShares(
        address _recipient,
        uint256 _sharesAmount
    ) public returns (uint256) {
        address owner = _msgSender();
        _transferShares(owner, _recipient, _sharesAmount);
        emit TransferShares(owner, _recipient, _sharesAmount);
        uint256 tokensAmount = getMintedEUSDByShares(_sharesAmount);
        emit Transfer(owner, _recipient, tokensAmount);
        return tokensAmount;
    }

    /**
     * @notice Moves `_amount` tokens from `_sender` to `_recipient`.
     * Emits a `Transfer` event.
     * Emits a `TransferShares` event.
     */
    function _transfer(
        address _sender,
        address _recipient,
        uint256 _amount
    ) internal {
        uint256 _sharesToTransfer = getSharesByMintedEUSD(_amount);
        _transferShares(_sender, _recipient, _sharesToTransfer);
        emit Transfer(_sender, _recipient, _amount);
        emit TransferShares(_sender, _recipient, _sharesToTransfer);
    }

    /**
     * @notice Sets `_amount` as the allowance of `_spender` over the `_owner` s tokens.
     *
     * Emits an `Approval` event.
     *
     * Requirements:
     *
     * - `_owner` cannot be the zero address.
     * - `_spender` cannot be the zero address.
     * - the contract must not be paused.
     */
    function _approve(
        address _owner,
        address _spender,
        uint256 _amount
    ) internal {
        require(_owner != address(0), "APPROVE_FROM_ZERO_ADDRESS");
        require(_spender != address(0), "APPROVE_TO_ZERO_ADDRESS");

        allowances[_owner][_spender] = _amount;
        emit Approval(_owner, _spender, _amount);
    }

    /**
     * @return the amount of shares owned by `_account`.
     */
    function _sharesOf(address _account) internal view returns (uint256) {
        return shares[_account];
    }

    /**
     * @notice Moves `_sharesAmount` shares from `_sender` to `_recipient`.
     *
     * Requirements:
     *
     * - `_sender` cannot be the zero address.
     * - `_recipient` cannot be the zero address.
     * - `_sender` must hold at least `_sharesAmount` shares.
     * - the contract must not be paused.
     */
    function _transferShares(
        address _sender,
        address _recipient,
        uint256 _sharesAmount
    ) internal {
        require(_sender != address(0), "TRANSFER_FROM_THE_ZERO_ADDRESS");
        require(_recipient != address(0), "TRANSFER_TO_THE_ZERO_ADDRESS");

        uint256 currentSenderShares = shares[_sender];
        require(
            _sharesAmount <= currentSenderShares,
            "TRANSFER_AMOUNT_EXCEEDS_BALANCE"
        );

        shares[_sender] = currentSenderShares.sub(_sharesAmount);
        shares[_recipient] = shares[_recipient].add(_sharesAmount);
    }

    function mintAndWrap(
        address _stETHSy,
        address _recipient
    ) external {
        TokenInput memory ti = TokenInput({
            tokenIn: address(this),
            netTokenIn: UNIT,
            tokenMintSy: address(this)
        });
        approve(actionMintAndRedeem, type(uint256).max);
        mint(_recipient);
        IPActionMintRedeem(actionMintAndRedeem).mintSyFromToken(_recipient, _stETHSy, 0, ti);
    }

    /**
     * @notice Creates `_sharesAmount` shares and assigns them to `_recipient`, increasing the total amount of shares.
     * @dev This doesn't increase the token total supply.
     *
     * Requirements:
     *
     * - `_recipient` cannot be the zero address.
     * - the contract must not be paused.
     */
    function mint(
        address _recipient
    ) public returns (uint256 newTotalShares) {
        require(minted[_recipient] == false, "ALREADY_MINTED");
        require(_recipient != address(0), "MINT_TO_THE_ZERO_ADDRESS");

        uint256 sharesAmount = getSharesByMintedEUSD(UNIT);
        if (sharesAmount == 0) {
            //EUSD totalSupply is 0: assume that shares correspond to EUSD 1-to-1
            sharesAmount = UNIT;
        }

        newTotalShares = _totalShares.add(sharesAmount);
        _totalShares = newTotalShares;

        shares[_recipient] = shares[_recipient].add(sharesAmount);

        _totalSupply += UNIT;

        minted[_recipient] = true;

        emit Transfer(address(0), _recipient, UNIT);
    }

    /**
     * @notice Destroys `sharesAmount` shares from `_account`'s holdings, decreasing the total amount of shares.
     * @dev This doesn't decrease the token total supply.
     *
     * Requirements:
     *
     * - `_account` cannot be the zero address.
     * - `_account` must hold at least `sharesAmount` shares.
     * - the contract must not be paused.
     */
    function burn(
        address _account,
        uint256 _burnAmount
    ) external onlyMintVault BurnPaused returns (uint256 newTotalShares) {
        require(_account != address(0), "BURN_FROM_THE_ZERO_ADDRESS");
        uint256 sharesAmount = getSharesByMintedEUSD(_burnAmount);
        newTotalShares = _onlyBurnShares(_account, sharesAmount);
        _totalSupply -= _burnAmount;

        emit Transfer(_account, address(0), _burnAmount);
    }

    /**
     * @notice Destroys `sharesAmount` shares from `_account`'s holdings, decreasing the total amount of shares.
     * @dev This doesn't decrease the token total supply.
     *
     * Requirements:
     *
     * - `_account` cannot be the zero address.
     * - `_account` must hold at least `sharesAmount` shares.
     * - the contract must not be paused.
     */
    function burnShares(
        address _account,
        uint256 _sharesAmount
    ) external onlyMintVault BurnPaused returns (uint256 newTotalShares) {
        require(_account != address(0), "BURN_FROM_THE_ZERO_ADDRESS");
        newTotalShares = _onlyBurnShares(_account, _sharesAmount);
    }

    function _onlyBurnShares(
        address _account,
        uint256 _sharesAmount
    ) private returns (uint256 newTotalShares) {
        uint256 accountShares = shares[_account];
        require(_sharesAmount <= accountShares, "BURN_AMOUNT_EXCEEDS_BALANCE");

        uint256 preRebaseTokenAmount = getMintedEUSDByShares(_sharesAmount);

        newTotalShares = _totalShares.sub(_sharesAmount);
        _totalShares = newTotalShares;

        shares[_account] = accountShares.sub(_sharesAmount);

        uint256 postRebaseTokenAmount = getMintedEUSDByShares(_sharesAmount);

        emit SharesBurnt(
            _account,
            preRebaseTokenAmount,
            postRebaseTokenAmount,
            _sharesAmount
        );

        // Notice: we're not emitting a Transfer event to the zero address here since shares burn
        // works by redistributing the amount of tokens corresponding to the burned shares between
        // all other token holders. The total supply of the token doesn't change as the result.
        // This is equivalent to performing a send from `address` to each other token holder address,
        // but we cannot reflect this as it would require sending an unbounded number of events.

        // We're emitting `SharesBurnt` event to provide an explicit rebase log record nonetheless.
    }
}
