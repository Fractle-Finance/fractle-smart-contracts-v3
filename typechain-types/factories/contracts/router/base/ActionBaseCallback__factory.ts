/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from "ethers";
import type {
  ActionBaseCallback,
  ActionBaseCallbackInterface,
} from "../../../../contracts/router/base/ActionBaseCallback";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "caller",
        type: "address",
      },
    ],
    name: "RouterCallbackNotEuphratesMarket",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "actualSyIn",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "limitSyIn",
        type: "uint256",
      },
    ],
    name: "RouterExceededLimitSyIn",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "actualPtOut",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "requiredPtOut",
        type: "uint256",
      },
    ],
    name: "RouterInsufficientPtOut",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "actualPtRepay",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "requiredPtRepay",
        type: "uint256",
      },
    ],
    name: "RouterInsufficientPtRepay",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "actualSyOut",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "requiredSyOut",
        type: "uint256",
      },
    ],
    name: "RouterInsufficientSyOut",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "actualSyRepay",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "requiredSyRepay",
        type: "uint256",
      },
    ],
    name: "RouterInsufficientSyRepay",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "actualYtOut",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "requiredYtOut",
        type: "uint256",
      },
    ],
    name: "RouterInsufficientYtOut",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "int256",
        name: "ptToAccount",
        type: "int256",
      },
      {
        internalType: "int256",
        name: "syToAccount",
        type: "int256",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "swapCallback",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export class ActionBaseCallback__factory {
  static readonly abi = _abi;
  static createInterface(): ActionBaseCallbackInterface {
    return new Interface(_abi) as ActionBaseCallbackInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): ActionBaseCallback {
    return new Contract(address, _abi, runner) as unknown as ActionBaseCallback;
  }
}
