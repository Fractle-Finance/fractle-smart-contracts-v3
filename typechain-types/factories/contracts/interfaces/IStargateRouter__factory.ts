/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from "ethers";
import type {
  IStargateRouter,
  IStargateRouterInterface,
} from "../../../contracts/interfaces/IStargateRouter";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_poolId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_amountLD",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_to",
        type: "address",
      },
    ],
    name: "addLiquidity",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint16",
        name: "_srcPoolId",
        type: "uint16",
      },
      {
        internalType: "uint256",
        name: "_amountLP",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_to",
        type: "address",
      },
    ],
    name: "instantRedeemLocal",
    outputs: [
      {
        internalType: "uint256",
        name: "amountSD",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export class IStargateRouter__factory {
  static readonly abi = _abi;
  static createInterface(): IStargateRouterInterface {
    return new Interface(_abi) as IStargateRouterInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): IStargateRouter {
    return new Contract(address, _abi, runner) as unknown as IStargateRouter;
  }
}