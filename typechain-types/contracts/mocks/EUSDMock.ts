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

export interface EUSDMockInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "allowance"
      | "approve"
      | "balanceOf"
      | "burn"
      | "burnShares"
      | "configurator"
      | "decimals"
      | "decreaseAllowance"
      | "getMintedEUSDByShares"
      | "getSharesByMintedEUSD"
      | "getTotalShares"
      | "increaseAllowance"
      | "mint"
      | "name"
      | "sharesOf"
      | "symbol"
      | "totalSupply"
      | "transfer"
      | "transferFrom"
      | "transferShares"
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic:
      | "Approval"
      | "SharesBurnt"
      | "Transfer"
      | "TransferShares"
  ): EventFragment;

  encodeFunctionData(
    functionFragment: "allowance",
    values: [AddressLike, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "approve",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "balanceOf",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "burn",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "burnShares",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "configurator",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "decimals", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "decreaseAllowance",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getMintedEUSDByShares",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getSharesByMintedEUSD",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getTotalShares",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "increaseAllowance",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "mint",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "name", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "sharesOf",
    values: [AddressLike]
  ): string;
  encodeFunctionData(functionFragment: "symbol", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "totalSupply",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "transfer",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "transferFrom",
    values: [AddressLike, AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "transferShares",
    values: [AddressLike, BigNumberish]
  ): string;

  decodeFunctionResult(functionFragment: "allowance", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "approve", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "balanceOf", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "burn", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "burnShares", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "configurator",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "decimals", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "decreaseAllowance",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getMintedEUSDByShares",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getSharesByMintedEUSD",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getTotalShares",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "increaseAllowance",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "mint", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "name", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "sharesOf", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "symbol", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "totalSupply",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "transfer", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "transferFrom",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferShares",
    data: BytesLike
  ): Result;
}

export namespace ApprovalEvent {
  export type InputTuple = [
    owner: AddressLike,
    spender: AddressLike,
    value: BigNumberish
  ];
  export type OutputTuple = [owner: string, spender: string, value: bigint];
  export interface OutputObject {
    owner: string;
    spender: string;
    value: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace SharesBurntEvent {
  export type InputTuple = [
    account: AddressLike,
    preRebaseTokenAmount: BigNumberish,
    postRebaseTokenAmount: BigNumberish,
    sharesAmount: BigNumberish
  ];
  export type OutputTuple = [
    account: string,
    preRebaseTokenAmount: bigint,
    postRebaseTokenAmount: bigint,
    sharesAmount: bigint
  ];
  export interface OutputObject {
    account: string;
    preRebaseTokenAmount: bigint;
    postRebaseTokenAmount: bigint;
    sharesAmount: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace TransferEvent {
  export type InputTuple = [
    from: AddressLike,
    to: AddressLike,
    value: BigNumberish
  ];
  export type OutputTuple = [from: string, to: string, value: bigint];
  export interface OutputObject {
    from: string;
    to: string;
    value: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace TransferSharesEvent {
  export type InputTuple = [
    from: AddressLike,
    to: AddressLike,
    sharesValue: BigNumberish
  ];
  export type OutputTuple = [from: string, to: string, sharesValue: bigint];
  export interface OutputObject {
    from: string;
    to: string;
    sharesValue: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface EUSDMock extends BaseContract {
  connect(runner?: ContractRunner | null): EUSDMock;
  waitForDeployment(): Promise<this>;

  interface: EUSDMockInterface;

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

  allowance: TypedContractMethod<
    [_owner: AddressLike, _spender: AddressLike],
    [bigint],
    "view"
  >;

  approve: TypedContractMethod<
    [_spender: AddressLike, _amount: BigNumberish],
    [boolean],
    "nonpayable"
  >;

  balanceOf: TypedContractMethod<[_account: AddressLike], [bigint], "view">;

  burn: TypedContractMethod<
    [_account: AddressLike, _burnAmount: BigNumberish],
    [bigint],
    "nonpayable"
  >;

  burnShares: TypedContractMethod<
    [_account: AddressLike, _sharesAmount: BigNumberish],
    [bigint],
    "nonpayable"
  >;

  configurator: TypedContractMethod<[], [string], "view">;

  decimals: TypedContractMethod<[], [bigint], "view">;

  decreaseAllowance: TypedContractMethod<
    [spender: AddressLike, subtractedValue: BigNumberish],
    [boolean],
    "nonpayable"
  >;

  getMintedEUSDByShares: TypedContractMethod<
    [_sharesAmount: BigNumberish],
    [bigint],
    "view"
  >;

  getSharesByMintedEUSD: TypedContractMethod<
    [_EUSDAmount: BigNumberish],
    [bigint],
    "view"
  >;

  getTotalShares: TypedContractMethod<[], [bigint], "view">;

  increaseAllowance: TypedContractMethod<
    [_spender: AddressLike, _addedValue: BigNumberish],
    [boolean],
    "nonpayable"
  >;

  mint: TypedContractMethod<
    [_recipient: AddressLike, _mintAmount: BigNumberish],
    [bigint],
    "nonpayable"
  >;

  name: TypedContractMethod<[], [string], "view">;

  sharesOf: TypedContractMethod<[_account: AddressLike], [bigint], "view">;

  symbol: TypedContractMethod<[], [string], "view">;

  totalSupply: TypedContractMethod<[], [bigint], "view">;

  transfer: TypedContractMethod<
    [_recipient: AddressLike, _amount: BigNumberish],
    [boolean],
    "nonpayable"
  >;

  transferFrom: TypedContractMethod<
    [from: AddressLike, to: AddressLike, amount: BigNumberish],
    [boolean],
    "nonpayable"
  >;

  transferShares: TypedContractMethod<
    [_recipient: AddressLike, _sharesAmount: BigNumberish],
    [bigint],
    "nonpayable"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "allowance"
  ): TypedContractMethod<
    [_owner: AddressLike, _spender: AddressLike],
    [bigint],
    "view"
  >;
  getFunction(
    nameOrSignature: "approve"
  ): TypedContractMethod<
    [_spender: AddressLike, _amount: BigNumberish],
    [boolean],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "balanceOf"
  ): TypedContractMethod<[_account: AddressLike], [bigint], "view">;
  getFunction(
    nameOrSignature: "burn"
  ): TypedContractMethod<
    [_account: AddressLike, _burnAmount: BigNumberish],
    [bigint],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "burnShares"
  ): TypedContractMethod<
    [_account: AddressLike, _sharesAmount: BigNumberish],
    [bigint],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "configurator"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "decimals"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "decreaseAllowance"
  ): TypedContractMethod<
    [spender: AddressLike, subtractedValue: BigNumberish],
    [boolean],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "getMintedEUSDByShares"
  ): TypedContractMethod<[_sharesAmount: BigNumberish], [bigint], "view">;
  getFunction(
    nameOrSignature: "getSharesByMintedEUSD"
  ): TypedContractMethod<[_EUSDAmount: BigNumberish], [bigint], "view">;
  getFunction(
    nameOrSignature: "getTotalShares"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "increaseAllowance"
  ): TypedContractMethod<
    [_spender: AddressLike, _addedValue: BigNumberish],
    [boolean],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "mint"
  ): TypedContractMethod<
    [_recipient: AddressLike, _mintAmount: BigNumberish],
    [bigint],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "name"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "sharesOf"
  ): TypedContractMethod<[_account: AddressLike], [bigint], "view">;
  getFunction(
    nameOrSignature: "symbol"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "totalSupply"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "transfer"
  ): TypedContractMethod<
    [_recipient: AddressLike, _amount: BigNumberish],
    [boolean],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "transferFrom"
  ): TypedContractMethod<
    [from: AddressLike, to: AddressLike, amount: BigNumberish],
    [boolean],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "transferShares"
  ): TypedContractMethod<
    [_recipient: AddressLike, _sharesAmount: BigNumberish],
    [bigint],
    "nonpayable"
  >;

  getEvent(
    key: "Approval"
  ): TypedContractEvent<
    ApprovalEvent.InputTuple,
    ApprovalEvent.OutputTuple,
    ApprovalEvent.OutputObject
  >;
  getEvent(
    key: "SharesBurnt"
  ): TypedContractEvent<
    SharesBurntEvent.InputTuple,
    SharesBurntEvent.OutputTuple,
    SharesBurntEvent.OutputObject
  >;
  getEvent(
    key: "Transfer"
  ): TypedContractEvent<
    TransferEvent.InputTuple,
    TransferEvent.OutputTuple,
    TransferEvent.OutputObject
  >;
  getEvent(
    key: "TransferShares"
  ): TypedContractEvent<
    TransferSharesEvent.InputTuple,
    TransferSharesEvent.OutputTuple,
    TransferSharesEvent.OutputObject
  >;

  filters: {
    "Approval(address,address,uint256)": TypedContractEvent<
      ApprovalEvent.InputTuple,
      ApprovalEvent.OutputTuple,
      ApprovalEvent.OutputObject
    >;
    Approval: TypedContractEvent<
      ApprovalEvent.InputTuple,
      ApprovalEvent.OutputTuple,
      ApprovalEvent.OutputObject
    >;

    "SharesBurnt(address,uint256,uint256,uint256)": TypedContractEvent<
      SharesBurntEvent.InputTuple,
      SharesBurntEvent.OutputTuple,
      SharesBurntEvent.OutputObject
    >;
    SharesBurnt: TypedContractEvent<
      SharesBurntEvent.InputTuple,
      SharesBurntEvent.OutputTuple,
      SharesBurntEvent.OutputObject
    >;

    "Transfer(address,address,uint256)": TypedContractEvent<
      TransferEvent.InputTuple,
      TransferEvent.OutputTuple,
      TransferEvent.OutputObject
    >;
    Transfer: TypedContractEvent<
      TransferEvent.InputTuple,
      TransferEvent.OutputTuple,
      TransferEvent.OutputObject
    >;

    "TransferShares(address,address,uint256)": TypedContractEvent<
      TransferSharesEvent.InputTuple,
      TransferSharesEvent.OutputTuple,
      TransferSharesEvent.OutputObject
    >;
    TransferShares: TypedContractEvent<
      TransferSharesEvent.InputTuple,
      TransferSharesEvent.OutputTuple,
      TransferSharesEvent.OutputObject
    >;
  };
}