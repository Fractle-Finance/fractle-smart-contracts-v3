/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from "ethers";
import type {
  I1inchAggregationRouterV5,
  I1inchAggregationRouterV5Interface,
} from "../../../../../contracts/router/swap-aggregator/oneinch/I1inchAggregationRouterV5";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "executor",
        type: "address",
      },
      {
        components: [
          {
            internalType: "contract IERC20",
            name: "srcToken",
            type: "address",
          },
          {
            internalType: "contract IERC20",
            name: "dstToken",
            type: "address",
          },
          {
            internalType: "address payable",
            name: "srcReceiver",
            type: "address",
          },
          {
            internalType: "address payable",
            name: "dstReceiver",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "minReturnAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "flags",
            type: "uint256",
          },
        ],
        internalType: "struct I1inchAggregationRouterV5.SwapDescription",
        name: "desc",
        type: "tuple",
      },
      {
        internalType: "bytes",
        name: "permit",
        type: "bytes",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "swap",
    outputs: [
      {
        internalType: "uint256",
        name: "returnAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "spentAmount",
        type: "uint256",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address payable",
        name: "recipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "minReturn",
        type: "uint256",
      },
      {
        internalType: "uint256[]",
        name: "pools",
        type: "uint256[]",
      },
    ],
    name: "uniswapV3SwapTo",
    outputs: [
      {
        internalType: "uint256",
        name: "returnAmount",
        type: "uint256",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address payable",
        name: "recipient",
        type: "address",
      },
      {
        internalType: "address",
        name: "srcToken",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "minReturn",
        type: "uint256",
      },
      {
        internalType: "uint256[]",
        name: "pools",
        type: "uint256[]",
      },
    ],
    name: "unoswapTo",
    outputs: [
      {
        internalType: "uint256",
        name: "returnAmount",
        type: "uint256",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
] as const;

export class I1inchAggregationRouterV5__factory {
  static readonly abi = _abi;
  static createInterface(): I1inchAggregationRouterV5Interface {
    return new Interface(_abi) as I1inchAggregationRouterV5Interface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): I1inchAggregationRouterV5 {
    return new Contract(
      address,
      _abi,
      runner
    ) as unknown as I1inchAggregationRouterV5;
  }
}