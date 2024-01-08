// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import "../../interfaces/IPMsgReceiverApp.sol";
import "../../core/libraries/BoringOwnableUpgradeable.sol";
import "../../core/libraries/Errors.sol";

// solhint-disable no-empty-blocks

abstract contract EuphratesMsgReceiverAppUpg is IPMsgReceiverApp {
    address public immutable euphratesMsgReceiveEndpoint;

    uint256[100] private __gap;

    modifier onlyFromEuphratesMsgReceiveEndpoint() {
        if (msg.sender != euphratesMsgReceiveEndpoint)
            revert Errors.MsgNotFromReceiveEndpoint(msg.sender);
        _;
    }

    constructor(address _euphratesMsgReceiveEndpoint) {
        euphratesMsgReceiveEndpoint = _euphratesMsgReceiveEndpoint;
    }

    function executeMessage(
        bytes calldata message
    ) external virtual onlyFromEuphratesMsgReceiveEndpoint {
        _executeMessage(message);
    }

    function _executeMessage(bytes memory message) internal virtual;
}
