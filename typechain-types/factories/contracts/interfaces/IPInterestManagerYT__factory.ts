/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from "ethers";
import type {
  IPInterestManagerYT,
  IPInterestManagerYTInterface,
} from "../../../contracts/interfaces/IPInterestManagerYT";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "userInterest",
    outputs: [
      {
        internalType: "uint128",
        name: "lastPYIndex",
        type: "uint128",
      },
      {
        internalType: "uint128",
        name: "accruedInterest",
        type: "uint128",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export class IPInterestManagerYT__factory {
  static readonly abi = _abi;
  static createInterface(): IPInterestManagerYTInterface {
    return new Interface(_abi) as IPInterestManagerYTInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): IPInterestManagerYT {
    return new Contract(
      address,
      _abi,
      runner
    ) as unknown as IPInterestManagerYT;
  }
}