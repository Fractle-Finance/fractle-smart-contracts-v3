/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumberish,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  EventFragment,
  AddressLike,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedLogDescription,
  TypedListener,
  TypedContractMethod,
} from "../../common";

export type ApproxParamsStruct = {
  guessMin: BigNumberish;
  guessMax: BigNumberish;
  guessOffchain: BigNumberish;
  maxIteration: BigNumberish;
  eps: BigNumberish;
};

export type ApproxParamsStructOutput = [
  guessMin: bigint,
  guessMax: bigint,
  guessOffchain: bigint,
  maxIteration: bigint,
  eps: bigint
] & {
  guessMin: bigint;
  guessMax: bigint;
  guessOffchain: bigint;
  maxIteration: bigint;
  eps: bigint;
};

export interface IPActionStorageStaticInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "claimOwnership"
      | "getBulkSellerFactory"
      | "getDefaultApproxParams"
      | "getOwnerAndPendingOwner"
      | "setBulkSellerFactory"
      | "setDefaultApproxParams"
      | "transferOwnership"
  ): FunctionFragment;

  getEvent(nameOrSignatureOrTopic: "OwnershipTransferred"): EventFragment;

  encodeFunctionData(
    functionFragment: "claimOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getBulkSellerFactory",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getDefaultApproxParams",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getOwnerAndPendingOwner",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "setBulkSellerFactory",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "setDefaultApproxParams",
    values: [ApproxParamsStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "transferOwnership",
    values: [AddressLike, boolean, boolean]
  ): string;

  decodeFunctionResult(
    functionFragment: "claimOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getBulkSellerFactory",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getDefaultApproxParams",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getOwnerAndPendingOwner",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setBulkSellerFactory",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setDefaultApproxParams",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferOwnership",
    data: BytesLike
  ): Result;
}

export namespace OwnershipTransferredEvent {
  export type InputTuple = [previousOwner: AddressLike, newOwner: AddressLike];
  export type OutputTuple = [previousOwner: string, newOwner: string];
  export interface OutputObject {
    previousOwner: string;
    newOwner: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface IPActionStorageStatic extends BaseContract {
  connect(runner?: ContractRunner | null): IPActionStorageStatic;
  waitForDeployment(): Promise<this>;

  interface: IPActionStorageStaticInterface;

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

  claimOwnership: TypedContractMethod<[], [void], "nonpayable">;

  getBulkSellerFactory: TypedContractMethod<[], [string], "view">;

  getDefaultApproxParams: TypedContractMethod<
    [],
    [ApproxParamsStructOutput],
    "view"
  >;

  getOwnerAndPendingOwner: TypedContractMethod<
    [],
    [[string, string] & { _owner: string; _pendingOwner: string }],
    "view"
  >;

  setBulkSellerFactory: TypedContractMethod<
    [_bulkSellerFactory: AddressLike],
    [void],
    "nonpayable"
  >;

  setDefaultApproxParams: TypedContractMethod<
    [params: ApproxParamsStruct],
    [void],
    "nonpayable"
  >;

  transferOwnership: TypedContractMethod<
    [newOwner: AddressLike, direct: boolean, renounce: boolean],
    [void],
    "nonpayable"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "claimOwnership"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "getBulkSellerFactory"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "getDefaultApproxParams"
  ): TypedContractMethod<[], [ApproxParamsStructOutput], "view">;
  getFunction(
    nameOrSignature: "getOwnerAndPendingOwner"
  ): TypedContractMethod<
    [],
    [[string, string] & { _owner: string; _pendingOwner: string }],
    "view"
  >;
  getFunction(
    nameOrSignature: "setBulkSellerFactory"
  ): TypedContractMethod<
    [_bulkSellerFactory: AddressLike],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "setDefaultApproxParams"
  ): TypedContractMethod<[params: ApproxParamsStruct], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "transferOwnership"
  ): TypedContractMethod<
    [newOwner: AddressLike, direct: boolean, renounce: boolean],
    [void],
    "nonpayable"
  >;

  getEvent(
    key: "OwnershipTransferred"
  ): TypedContractEvent<
    OwnershipTransferredEvent.InputTuple,
    OwnershipTransferredEvent.OutputTuple,
    OwnershipTransferredEvent.OutputObject
  >;

  filters: {
    "OwnershipTransferred(address,address)": TypedContractEvent<
      OwnershipTransferredEvent.InputTuple,
      OwnershipTransferredEvent.OutputTuple,
      OwnershipTransferredEvent.OutputObject
    >;
    OwnershipTransferred: TypedContractEvent<
      OwnershipTransferredEvent.InputTuple,
      OwnershipTransferredEvent.OutputTuple,
      OwnershipTransferredEvent.OutputObject
    >;
  };
}