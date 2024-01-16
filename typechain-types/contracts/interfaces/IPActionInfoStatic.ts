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
} from "../../common";

export declare namespace IPActionInfoStatic {
  export type TokenAmountStruct = { token: AddressLike; amount: BigNumberish };

  export type TokenAmountStructOutput = [token: string, amount: bigint] & {
    token: string;
    amount: bigint;
  };

  export type UserMarketInfoStruct = {
    lpBalance: IPActionInfoStatic.TokenAmountStruct;
    ptBalance: IPActionInfoStatic.TokenAmountStruct;
    syBalance: IPActionInfoStatic.TokenAmountStruct;
    unclaimedRewards: IPActionInfoStatic.TokenAmountStruct[];
  };

  export type UserMarketInfoStructOutput = [
    lpBalance: IPActionInfoStatic.TokenAmountStructOutput,
    ptBalance: IPActionInfoStatic.TokenAmountStructOutput,
    syBalance: IPActionInfoStatic.TokenAmountStructOutput,
    unclaimedRewards: IPActionInfoStatic.TokenAmountStructOutput[]
  ] & {
    lpBalance: IPActionInfoStatic.TokenAmountStructOutput;
    ptBalance: IPActionInfoStatic.TokenAmountStructOutput;
    syBalance: IPActionInfoStatic.TokenAmountStructOutput;
    unclaimedRewards: IPActionInfoStatic.TokenAmountStructOutput[];
  };

  export type UserPYInfoStruct = {
    ptBalance: IPActionInfoStatic.TokenAmountStruct;
    ytBalance: IPActionInfoStatic.TokenAmountStruct;
    unclaimedInterest: IPActionInfoStatic.TokenAmountStruct;
    unclaimedRewards: IPActionInfoStatic.TokenAmountStruct[];
  };

  export type UserPYInfoStructOutput = [
    ptBalance: IPActionInfoStatic.TokenAmountStructOutput,
    ytBalance: IPActionInfoStatic.TokenAmountStructOutput,
    unclaimedInterest: IPActionInfoStatic.TokenAmountStructOutput,
    unclaimedRewards: IPActionInfoStatic.TokenAmountStructOutput[]
  ] & {
    ptBalance: IPActionInfoStatic.TokenAmountStructOutput;
    ytBalance: IPActionInfoStatic.TokenAmountStructOutput;
    unclaimedInterest: IPActionInfoStatic.TokenAmountStructOutput;
    unclaimedRewards: IPActionInfoStatic.TokenAmountStructOutput[];
  };

  export type UserSYInfoStruct = {
    syBalance: IPActionInfoStatic.TokenAmountStruct;
    unclaimedRewards: IPActionInfoStatic.TokenAmountStruct[];
  };

  export type UserSYInfoStructOutput = [
    syBalance: IPActionInfoStatic.TokenAmountStructOutput,
    unclaimedRewards: IPActionInfoStatic.TokenAmountStructOutput[]
  ] & {
    syBalance: IPActionInfoStatic.TokenAmountStructOutput;
    unclaimedRewards: IPActionInfoStatic.TokenAmountStructOutput[];
  };
}

export interface IPActionInfoStaticInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "getPY"
      | "getTokensInOut"
      | "getUserMarketInfo"
      | "getUserPYInfo"
      | "getUserSYInfo"
  ): FunctionFragment;

  encodeFunctionData(functionFragment: "getPY", values: [AddressLike]): string;
  encodeFunctionData(
    functionFragment: "getTokensInOut",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "getUserMarketInfo",
    values: [AddressLike, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "getUserPYInfo",
    values: [AddressLike, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "getUserSYInfo",
    values: [AddressLike, AddressLike]
  ): string;

  decodeFunctionResult(functionFragment: "getPY", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getTokensInOut",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getUserMarketInfo",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getUserPYInfo",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getUserSYInfo",
    data: BytesLike
  ): Result;
}

export interface IPActionInfoStatic extends BaseContract {
  connect(runner?: ContractRunner | null): IPActionInfoStatic;
  waitForDeployment(): Promise<this>;

  interface: IPActionInfoStaticInterface;

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

  getPY: TypedContractMethod<
    [py: AddressLike],
    [[string, string] & { pt: string; yt: string }],
    "view"
  >;

  getTokensInOut: TypedContractMethod<
    [token: AddressLike],
    [[string[], string[]] & { tokensIn: string[]; tokensOut: string[] }],
    "view"
  >;

  getUserMarketInfo: TypedContractMethod<
    [market: AddressLike, user: AddressLike],
    [IPActionInfoStatic.UserMarketInfoStructOutput],
    "nonpayable"
  >;

  getUserPYInfo: TypedContractMethod<
    [py: AddressLike, user: AddressLike],
    [IPActionInfoStatic.UserPYInfoStructOutput],
    "nonpayable"
  >;

  getUserSYInfo: TypedContractMethod<
    [sy: AddressLike, user: AddressLike],
    [IPActionInfoStatic.UserSYInfoStructOutput],
    "nonpayable"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "getPY"
  ): TypedContractMethod<
    [py: AddressLike],
    [[string, string] & { pt: string; yt: string }],
    "view"
  >;
  getFunction(
    nameOrSignature: "getTokensInOut"
  ): TypedContractMethod<
    [token: AddressLike],
    [[string[], string[]] & { tokensIn: string[]; tokensOut: string[] }],
    "view"
  >;
  getFunction(
    nameOrSignature: "getUserMarketInfo"
  ): TypedContractMethod<
    [market: AddressLike, user: AddressLike],
    [IPActionInfoStatic.UserMarketInfoStructOutput],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "getUserPYInfo"
  ): TypedContractMethod<
    [py: AddressLike, user: AddressLike],
    [IPActionInfoStatic.UserPYInfoStructOutput],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "getUserSYInfo"
  ): TypedContractMethod<
    [sy: AddressLike, user: AddressLike],
    [IPActionInfoStatic.UserSYInfoStructOutput],
    "nonpayable"
  >;

  filters: {};
}