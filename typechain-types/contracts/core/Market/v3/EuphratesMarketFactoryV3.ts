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
} from "../../../../common";

export interface EuphratesMarketFactoryV3Interface extends Interface {
  getFunction(
    nameOrSignature:
      | "claimOwnership"
      | "createNewMarket"
      | "defaultFee"
      | "externalRewardDistributor"
      | "getMarketConfig"
      | "initialize"
      | "isValidMarket"
      | "maxLnFeeRateRoot"
      | "maxReserveFeePercent"
      | "minInitialAnchor"
      | "overriddenFee"
      | "owner"
      | "pendingOwner"
      | "setDefaultFee"
      | "setOverriddenFee"
      | "setTreasury"
      | "transferOwnership"
      | "treasury"
      | "unsetOverriddenFee"
      | "yieldContractFactory"
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic:
      | "CreateNewMarket"
      | "Initialized"
      | "NewMarketConfig"
      | "OwnershipTransferred"
      | "SetOverriddenFee"
      | "UnsetOverriddenFee"
  ): EventFragment;

  encodeFunctionData(
    functionFragment: "claimOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "createNewMarket",
    values: [AddressLike, AddressLike, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "defaultFee",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "externalRewardDistributor",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getMarketConfig",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "initialize",
    values: [AddressLike, BigNumberish, BigNumberish, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "isValidMarket",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "maxLnFeeRateRoot",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "maxReserveFeePercent",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "minInitialAnchor",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "overriddenFee",
    values: [AddressLike]
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "pendingOwner",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "setDefaultFee",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "setOverriddenFee",
    values: [AddressLike, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "setTreasury",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "transferOwnership",
    values: [AddressLike, boolean, boolean]
  ): string;
  encodeFunctionData(functionFragment: "treasury", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "unsetOverriddenFee",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "yieldContractFactory",
    values?: undefined
  ): string;

  decodeFunctionResult(
    functionFragment: "claimOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "createNewMarket",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "defaultFee", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "externalRewardDistributor",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getMarketConfig",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "initialize", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "isValidMarket",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "maxLnFeeRateRoot",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "maxReserveFeePercent",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "minInitialAnchor",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "overriddenFee",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "pendingOwner",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setDefaultFee",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setOverriddenFee",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setTreasury",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "treasury", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "unsetOverriddenFee",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "yieldContractFactory",
    data: BytesLike
  ): Result;
}

export namespace CreateNewMarketEvent {
  export type InputTuple = [
    market: AddressLike,
    PT: AddressLike,
    scalarRoot: BigNumberish,
    initialAnchor: BigNumberish
  ];
  export type OutputTuple = [
    market: string,
    PT: string,
    scalarRoot: bigint,
    initialAnchor: bigint
  ];
  export interface OutputObject {
    market: string;
    PT: string;
    scalarRoot: bigint;
    initialAnchor: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace InitializedEvent {
  export type InputTuple = [version: BigNumberish];
  export type OutputTuple = [version: bigint];
  export interface OutputObject {
    version: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace NewMarketConfigEvent {
  export type InputTuple = [
    treasury: AddressLike,
    defaultLnFeeRateRoot: BigNumberish,
    reserveFeePercent: BigNumberish
  ];
  export type OutputTuple = [
    treasury: string,
    defaultLnFeeRateRoot: bigint,
    reserveFeePercent: bigint
  ];
  export interface OutputObject {
    treasury: string;
    defaultLnFeeRateRoot: bigint;
    reserveFeePercent: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
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

export namespace SetOverriddenFeeEvent {
  export type InputTuple = [
    router: AddressLike,
    lnFeeRateRoot: BigNumberish,
    reserveFeePercent: BigNumberish
  ];
  export type OutputTuple = [
    router: string,
    lnFeeRateRoot: bigint,
    reserveFeePercent: bigint
  ];
  export interface OutputObject {
    router: string;
    lnFeeRateRoot: bigint;
    reserveFeePercent: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace UnsetOverriddenFeeEvent {
  export type InputTuple = [router: AddressLike];
  export type OutputTuple = [router: string];
  export interface OutputObject {
    router: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface EuphratesMarketFactoryV3 extends BaseContract {
  connect(runner?: ContractRunner | null): EuphratesMarketFactoryV3;
  waitForDeployment(): Promise<this>;

  interface: EuphratesMarketFactoryV3Interface;

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

  createNewMarket: TypedContractMethod<
    [
      PT: AddressLike,
      market: AddressLike,
      scalarRoot: BigNumberish,
      initialAnchor: BigNumberish
    ],
    [void],
    "nonpayable"
  >;

  defaultFee: TypedContractMethod<
    [],
    [
      [bigint, bigint, boolean] & {
        lnFeeRateRoot: bigint;
        reserveFeePercent: bigint;
        active: boolean;
      }
    ],
    "view"
  >;

  externalRewardDistributor: TypedContractMethod<[], [string], "view">;

  getMarketConfig: TypedContractMethod<
    [router: AddressLike],
    [
      [string, bigint, bigint] & {
        _treasury: string;
        _lnFeeRateRoot: bigint;
        _reserveFeePercent: bigint;
      }
    ],
    "view"
  >;

  initialize: TypedContractMethod<
    [
      _treasury: AddressLike,
      _defaultLnFeeRateRoot: BigNumberish,
      _defaultReserveFeePercent: BigNumberish,
      newExternalRewardDistributor: AddressLike
    ],
    [void],
    "nonpayable"
  >;

  isValidMarket: TypedContractMethod<[market: AddressLike], [boolean], "view">;

  maxLnFeeRateRoot: TypedContractMethod<[], [bigint], "view">;

  maxReserveFeePercent: TypedContractMethod<[], [bigint], "view">;

  minInitialAnchor: TypedContractMethod<[], [bigint], "view">;

  overriddenFee: TypedContractMethod<
    [arg0: AddressLike],
    [
      [bigint, bigint, boolean] & {
        lnFeeRateRoot: bigint;
        reserveFeePercent: bigint;
        active: boolean;
      }
    ],
    "view"
  >;

  owner: TypedContractMethod<[], [string], "view">;

  pendingOwner: TypedContractMethod<[], [string], "view">;

  setDefaultFee: TypedContractMethod<
    [newLnFeeRateRoot: BigNumberish, newReserveFeePercent: BigNumberish],
    [void],
    "nonpayable"
  >;

  setOverriddenFee: TypedContractMethod<
    [
      router: AddressLike,
      newLnFeeRateRoot: BigNumberish,
      newReserveFeePercent: BigNumberish
    ],
    [void],
    "nonpayable"
  >;

  setTreasury: TypedContractMethod<
    [newTreasury: AddressLike],
    [void],
    "nonpayable"
  >;

  transferOwnership: TypedContractMethod<
    [newOwner: AddressLike, direct: boolean, renounce: boolean],
    [void],
    "nonpayable"
  >;

  treasury: TypedContractMethod<[], [string], "view">;

  unsetOverriddenFee: TypedContractMethod<
    [router: AddressLike],
    [void],
    "nonpayable"
  >;

  yieldContractFactory: TypedContractMethod<[], [string], "view">;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "claimOwnership"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "createNewMarket"
  ): TypedContractMethod<
    [
      PT: AddressLike,
      market: AddressLike,
      scalarRoot: BigNumberish,
      initialAnchor: BigNumberish
    ],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "defaultFee"
  ): TypedContractMethod<
    [],
    [
      [bigint, bigint, boolean] & {
        lnFeeRateRoot: bigint;
        reserveFeePercent: bigint;
        active: boolean;
      }
    ],
    "view"
  >;
  getFunction(
    nameOrSignature: "externalRewardDistributor"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "getMarketConfig"
  ): TypedContractMethod<
    [router: AddressLike],
    [
      [string, bigint, bigint] & {
        _treasury: string;
        _lnFeeRateRoot: bigint;
        _reserveFeePercent: bigint;
      }
    ],
    "view"
  >;
  getFunction(
    nameOrSignature: "initialize"
  ): TypedContractMethod<
    [
      _treasury: AddressLike,
      _defaultLnFeeRateRoot: BigNumberish,
      _defaultReserveFeePercent: BigNumberish,
      newExternalRewardDistributor: AddressLike
    ],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "isValidMarket"
  ): TypedContractMethod<[market: AddressLike], [boolean], "view">;
  getFunction(
    nameOrSignature: "maxLnFeeRateRoot"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "maxReserveFeePercent"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "minInitialAnchor"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "overriddenFee"
  ): TypedContractMethod<
    [arg0: AddressLike],
    [
      [bigint, bigint, boolean] & {
        lnFeeRateRoot: bigint;
        reserveFeePercent: bigint;
        active: boolean;
      }
    ],
    "view"
  >;
  getFunction(
    nameOrSignature: "owner"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "pendingOwner"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "setDefaultFee"
  ): TypedContractMethod<
    [newLnFeeRateRoot: BigNumberish, newReserveFeePercent: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "setOverriddenFee"
  ): TypedContractMethod<
    [
      router: AddressLike,
      newLnFeeRateRoot: BigNumberish,
      newReserveFeePercent: BigNumberish
    ],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "setTreasury"
  ): TypedContractMethod<[newTreasury: AddressLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "transferOwnership"
  ): TypedContractMethod<
    [newOwner: AddressLike, direct: boolean, renounce: boolean],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "treasury"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "unsetOverriddenFee"
  ): TypedContractMethod<[router: AddressLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "yieldContractFactory"
  ): TypedContractMethod<[], [string], "view">;

  getEvent(
    key: "CreateNewMarket"
  ): TypedContractEvent<
    CreateNewMarketEvent.InputTuple,
    CreateNewMarketEvent.OutputTuple,
    CreateNewMarketEvent.OutputObject
  >;
  getEvent(
    key: "Initialized"
  ): TypedContractEvent<
    InitializedEvent.InputTuple,
    InitializedEvent.OutputTuple,
    InitializedEvent.OutputObject
  >;
  getEvent(
    key: "NewMarketConfig"
  ): TypedContractEvent<
    NewMarketConfigEvent.InputTuple,
    NewMarketConfigEvent.OutputTuple,
    NewMarketConfigEvent.OutputObject
  >;
  getEvent(
    key: "OwnershipTransferred"
  ): TypedContractEvent<
    OwnershipTransferredEvent.InputTuple,
    OwnershipTransferredEvent.OutputTuple,
    OwnershipTransferredEvent.OutputObject
  >;
  getEvent(
    key: "SetOverriddenFee"
  ): TypedContractEvent<
    SetOverriddenFeeEvent.InputTuple,
    SetOverriddenFeeEvent.OutputTuple,
    SetOverriddenFeeEvent.OutputObject
  >;
  getEvent(
    key: "UnsetOverriddenFee"
  ): TypedContractEvent<
    UnsetOverriddenFeeEvent.InputTuple,
    UnsetOverriddenFeeEvent.OutputTuple,
    UnsetOverriddenFeeEvent.OutputObject
  >;

  filters: {
    "CreateNewMarket(address,address,int256,int256)": TypedContractEvent<
      CreateNewMarketEvent.InputTuple,
      CreateNewMarketEvent.OutputTuple,
      CreateNewMarketEvent.OutputObject
    >;
    CreateNewMarket: TypedContractEvent<
      CreateNewMarketEvent.InputTuple,
      CreateNewMarketEvent.OutputTuple,
      CreateNewMarketEvent.OutputObject
    >;

    "Initialized(uint8)": TypedContractEvent<
      InitializedEvent.InputTuple,
      InitializedEvent.OutputTuple,
      InitializedEvent.OutputObject
    >;
    Initialized: TypedContractEvent<
      InitializedEvent.InputTuple,
      InitializedEvent.OutputTuple,
      InitializedEvent.OutputObject
    >;

    "NewMarketConfig(address,uint80,uint8)": TypedContractEvent<
      NewMarketConfigEvent.InputTuple,
      NewMarketConfigEvent.OutputTuple,
      NewMarketConfigEvent.OutputObject
    >;
    NewMarketConfig: TypedContractEvent<
      NewMarketConfigEvent.InputTuple,
      NewMarketConfigEvent.OutputTuple,
      NewMarketConfigEvent.OutputObject
    >;

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

    "SetOverriddenFee(address,uint80,uint8)": TypedContractEvent<
      SetOverriddenFeeEvent.InputTuple,
      SetOverriddenFeeEvent.OutputTuple,
      SetOverriddenFeeEvent.OutputObject
    >;
    SetOverriddenFee: TypedContractEvent<
      SetOverriddenFeeEvent.InputTuple,
      SetOverriddenFeeEvent.OutputTuple,
      SetOverriddenFeeEvent.OutputObject
    >;

    "UnsetOverriddenFee(address)": TypedContractEvent<
      UnsetOverriddenFeeEvent.InputTuple,
      UnsetOverriddenFeeEvent.OutputTuple,
      UnsetOverriddenFeeEvent.OutputObject
    >;
    UnsetOverriddenFee: TypedContractEvent<
      UnsetOverriddenFeeEvent.InputTuple,
      UnsetOverriddenFeeEvent.OutputTuple,
      UnsetOverriddenFeeEvent.OutputObject
    >;
  };
}