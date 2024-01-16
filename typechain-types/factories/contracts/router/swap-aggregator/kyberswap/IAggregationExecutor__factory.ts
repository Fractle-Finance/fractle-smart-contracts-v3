/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from "ethers";
import type {
  IAggregationExecutor,
  IAggregationExecutorInterface,
} from "../../../../../contracts/router/swap-aggregator/kyberswap/IAggregationExecutor";

const _abi = [
  {
    inputs: [
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "callBytes",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "tokenIn",
        type: "address",
      },
      {
        internalType: "address",
        name: "tokenOut",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "destTokenFeeData",
        type: "bytes",
      },
    ],
    name: "finalTransactionProcessing",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "swapSingleSequence",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export class IAggregationExecutor__factory {
  static readonly abi = _abi;
  static createInterface(): IAggregationExecutorInterface {
    return new Interface(_abi) as IAggregationExecutorInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): IAggregationExecutor {
    return new Contract(
      address,
      _abi,
      runner
    ) as unknown as IAggregationExecutor;
  }
}