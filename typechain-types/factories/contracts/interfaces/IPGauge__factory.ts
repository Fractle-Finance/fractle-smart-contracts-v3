/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from "ethers";
import type {
  IPGauge,
  IPGaugeInterface,
} from "../../../contracts/interfaces/IPGauge";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256[]",
        name: "rewardsOut",
        type: "uint256[]",
      },
    ],
    name: "RedeemRewards",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "activeBalance",
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
    name: "totalActiveSupply",
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

export class IPGauge__factory {
  static readonly abi = _abi;
  static createInterface(): IPGaugeInterface {
    return new Interface(_abi) as IPGaugeInterface;
  }
  static connect(address: string, runner?: ContractRunner | null): IPGauge {
    return new Contract(address, _abi, runner) as unknown as IPGauge;
  }
}