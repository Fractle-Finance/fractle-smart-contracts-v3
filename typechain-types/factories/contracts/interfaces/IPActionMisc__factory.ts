/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from "ethers";
import type {
  IPActionMisc,
  IPActionMiscInterface,
} from "../../../contracts/interfaces/IPActionMisc";

const _abi = [
  {
    inputs: [
      {
        components: [
          {
            internalType: "address[]",
            name: "tokens",
            type: "address[]",
          },
          {
            internalType: "address",
            name: "spender",
            type: "address",
          },
        ],
        internalType: "struct IPActionMisc.MultiApproval[]",
        name: "",
        type: "tuple[]",
      },
    ],
    name: "approveInf",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "bool",
            name: "allowFailure",
            type: "bool",
          },
          {
            internalType: "bytes",
            name: "callData",
            type: "bytes",
          },
        ],
        internalType: "struct IPActionMisc.Call3[]",
        name: "calls",
        type: "tuple[]",
      },
    ],
    name: "batchExec",
    outputs: [
      {
        components: [
          {
            internalType: "bool",
            name: "success",
            type: "bool",
          },
          {
            internalType: "bytes",
            name: "returnData",
            type: "bytes",
          },
        ],
        internalType: "struct IPActionMisc.Result[]",
        name: "returnData",
        type: "tuple[]",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export class IPActionMisc__factory {
  static readonly abi = _abi;
  static createInterface(): IPActionMiscInterface {
    return new Interface(_abi) as IPActionMiscInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): IPActionMisc {
    return new Contract(address, _abi, runner) as unknown as IPActionMisc;
  }
}