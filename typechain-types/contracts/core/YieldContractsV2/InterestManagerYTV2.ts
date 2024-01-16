/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  AddressLike,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedListener,
  TypedContractMethod,
} from "../../../common";

export interface InterestManagerYTV2Interface extends Interface {
  getFunction(
    nameOrSignature:
      | "globalInterestIndex"
      | "lastInterestBlock"
      | "userInterest"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "globalInterestIndex",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "lastInterestBlock",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "userInterest",
    values: [AddressLike]
  ): string;

  decodeFunctionResult(
    functionFragment: "globalInterestIndex",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "lastInterestBlock",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "userInterest",
    data: BytesLike
  ): Result;
}

export interface InterestManagerYTV2 extends BaseContract {
  connect(runner?: ContractRunner | null): InterestManagerYTV2;
  waitForDeployment(): Promise<this>;

  interface: InterestManagerYTV2Interface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(
    event?: TCEvent
  ): Promise<this>;

  globalInterestIndex: TypedContractMethod<[], [bigint], "view">;

  lastInterestBlock: TypedContractMethod<[], [bigint], "view">;

  userInterest: TypedContractMethod<
    [arg0: AddressLike],
    [
      [bigint, bigint, bigint] & {
        index: bigint;
        accrued: bigint;
        pyIndex: bigint;
      }
    ],
    "view"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "globalInterestIndex"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "lastInterestBlock"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "userInterest"
  ): TypedContractMethod<
    [arg0: AddressLike],
    [
      [bigint, bigint, bigint] & {
        index: bigint;
        accrued: bigint;
        pyIndex: bigint;
      }
    ],
    "view"
  >;

  filters: {};
}