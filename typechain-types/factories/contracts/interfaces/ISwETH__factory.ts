/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from "ethers";
import type {
  ISwETH,
  ISwETHInterface,
} from "../../../contracts/interfaces/ISwETH";

const _abi = [
  {
    inputs: [],
    name: "deposit",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "ethToSwETHRate",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getRate",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export class ISwETH__factory {
  static readonly abi = _abi;
  static createInterface(): ISwETHInterface {
    return new Interface(_abi) as ISwETHInterface;
  }
  static connect(address: string, runner?: ContractRunner | null): ISwETH {
    return new Contract(address, _abi, runner) as unknown as ISwETH;
  }
}