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

export interface IPActionMintRedeemStaticInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "getAmountTokenToMintSy"
      | "getBulkSellerInfo"
      | "mintPyFromSyStatic"
      | "mintPyFromTokenStatic"
      | "mintSyFromTokenStatic"
      | "pyIndexCurrentViewMarket"
      | "pyIndexCurrentViewYt"
      | "redeemPyToSyStatic"
      | "redeemPyToTokenStatic"
      | "redeemSyToTokenStatic"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "getAmountTokenToMintSy",
    values: [AddressLike, AddressLike, AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getBulkSellerInfo",
    values: [AddressLike, AddressLike, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "mintPyFromSyStatic",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "mintPyFromTokenStatic",
    values: [AddressLike, AddressLike, BigNumberish, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "mintSyFromTokenStatic",
    values: [AddressLike, AddressLike, BigNumberish, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "pyIndexCurrentViewMarket",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "pyIndexCurrentViewYt",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "redeemPyToSyStatic",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "redeemPyToTokenStatic",
    values: [AddressLike, BigNumberish, AddressLike, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "redeemSyToTokenStatic",
    values: [AddressLike, AddressLike, BigNumberish, AddressLike]
  ): string;

  decodeFunctionResult(
    functionFragment: "getAmountTokenToMintSy",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getBulkSellerInfo",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "mintPyFromSyStatic",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "mintPyFromTokenStatic",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "mintSyFromTokenStatic",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "pyIndexCurrentViewMarket",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "pyIndexCurrentViewYt",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "redeemPyToSyStatic",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "redeemPyToTokenStatic",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "redeemSyToTokenStatic",
    data: BytesLike
  ): Result;
}

export interface IPActionMintRedeemStatic extends BaseContract {
  connect(runner?: ContractRunner | null): IPActionMintRedeemStatic;
  waitForDeployment(): Promise<this>;

  interface: IPActionMintRedeemStaticInterface;

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

  getAmountTokenToMintSy: TypedContractMethod<
    [
      SY: AddressLike,
      tokenIn: AddressLike,
      bulk: AddressLike,
      netSyOut: BigNumberish
    ],
    [bigint],
    "view"
  >;

  getBulkSellerInfo: TypedContractMethod<
    [
      token: AddressLike,
      SY: AddressLike,
      netTokenIn: BigNumberish,
      netSyIn: BigNumberish
    ],
    [
      [string, bigint, bigint] & {
        bulk: string;
        totalToken: bigint;
        totalSy: bigint;
      }
    ],
    "view"
  >;

  mintPyFromSyStatic: TypedContractMethod<
    [YT: AddressLike, netSyToMint: BigNumberish],
    [bigint],
    "view"
  >;

  mintPyFromTokenStatic: TypedContractMethod<
    [
      YT: AddressLike,
      tokenIn: AddressLike,
      netTokenIn: BigNumberish,
      bulk: AddressLike
    ],
    [bigint],
    "view"
  >;

  mintSyFromTokenStatic: TypedContractMethod<
    [
      SY: AddressLike,
      tokenIn: AddressLike,
      netTokenIn: BigNumberish,
      bulk: AddressLike
    ],
    [bigint],
    "view"
  >;

  pyIndexCurrentViewMarket: TypedContractMethod<
    [market: AddressLike],
    [bigint],
    "view"
  >;

  pyIndexCurrentViewYt: TypedContractMethod<
    [yt: AddressLike],
    [bigint],
    "view"
  >;

  redeemPyToSyStatic: TypedContractMethod<
    [YT: AddressLike, netPYToRedeem: BigNumberish],
    [bigint],
    "view"
  >;

  redeemPyToTokenStatic: TypedContractMethod<
    [
      YT: AddressLike,
      netPYToRedeem: BigNumberish,
      tokenOut: AddressLike,
      bulk: AddressLike
    ],
    [bigint],
    "view"
  >;

  redeemSyToTokenStatic: TypedContractMethod<
    [
      SY: AddressLike,
      tokenOut: AddressLike,
      netSyIn: BigNumberish,
      bulk: AddressLike
    ],
    [bigint],
    "view"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "getAmountTokenToMintSy"
  ): TypedContractMethod<
    [
      SY: AddressLike,
      tokenIn: AddressLike,
      bulk: AddressLike,
      netSyOut: BigNumberish
    ],
    [bigint],
    "view"
  >;
  getFunction(
    nameOrSignature: "getBulkSellerInfo"
  ): TypedContractMethod<
    [
      token: AddressLike,
      SY: AddressLike,
      netTokenIn: BigNumberish,
      netSyIn: BigNumberish
    ],
    [
      [string, bigint, bigint] & {
        bulk: string;
        totalToken: bigint;
        totalSy: bigint;
      }
    ],
    "view"
  >;
  getFunction(
    nameOrSignature: "mintPyFromSyStatic"
  ): TypedContractMethod<
    [YT: AddressLike, netSyToMint: BigNumberish],
    [bigint],
    "view"
  >;
  getFunction(
    nameOrSignature: "mintPyFromTokenStatic"
  ): TypedContractMethod<
    [
      YT: AddressLike,
      tokenIn: AddressLike,
      netTokenIn: BigNumberish,
      bulk: AddressLike
    ],
    [bigint],
    "view"
  >;
  getFunction(
    nameOrSignature: "mintSyFromTokenStatic"
  ): TypedContractMethod<
    [
      SY: AddressLike,
      tokenIn: AddressLike,
      netTokenIn: BigNumberish,
      bulk: AddressLike
    ],
    [bigint],
    "view"
  >;
  getFunction(
    nameOrSignature: "pyIndexCurrentViewMarket"
  ): TypedContractMethod<[market: AddressLike], [bigint], "view">;
  getFunction(
    nameOrSignature: "pyIndexCurrentViewYt"
  ): TypedContractMethod<[yt: AddressLike], [bigint], "view">;
  getFunction(
    nameOrSignature: "redeemPyToSyStatic"
  ): TypedContractMethod<
    [YT: AddressLike, netPYToRedeem: BigNumberish],
    [bigint],
    "view"
  >;
  getFunction(
    nameOrSignature: "redeemPyToTokenStatic"
  ): TypedContractMethod<
    [
      YT: AddressLike,
      netPYToRedeem: BigNumberish,
      tokenOut: AddressLike,
      bulk: AddressLike
    ],
    [bigint],
    "view"
  >;
  getFunction(
    nameOrSignature: "redeemSyToTokenStatic"
  ): TypedContractMethod<
    [
      SY: AddressLike,
      tokenOut: AddressLike,
      netSyIn: BigNumberish,
      bulk: AddressLike
    ],
    [bigint],
    "view"
  >;

  filters: {};
}
