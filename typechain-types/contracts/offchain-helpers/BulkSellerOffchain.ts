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

export type BulkSellerStateStruct = {
  rateTokenToSy: BigNumberish;
  rateSyToToken: BigNumberish;
  totalToken: BigNumberish;
  totalSy: BigNumberish;
  feeRate: BigNumberish;
};

export type BulkSellerStateStructOutput = [
  rateTokenToSy: bigint,
  rateSyToToken: bigint,
  totalToken: bigint,
  totalSy: bigint,
  feeRate: bigint
] & {
  rateTokenToSy: bigint;
  rateSyToToken: bigint;
  totalToken: bigint;
  totalSy: bigint;
  feeRate: bigint;
};

export interface BulkSellerOffchainInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "calcCurrentRates"
      | "calcCurrentRatesWithAmount"
      | "getCurrentState"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "calcCurrentRates",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "calcCurrentRatesWithAmount",
    values: [AddressLike, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getCurrentState",
    values: [AddressLike]
  ): string;

  decodeFunctionResult(
    functionFragment: "calcCurrentRates",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "calcCurrentRatesWithAmount",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getCurrentState",
    data: BytesLike
  ): Result;
}

export interface BulkSellerOffchain extends BaseContract {
  connect(runner?: ContractRunner | null): BulkSellerOffchain;
  waitForDeployment(): Promise<this>;

  interface: BulkSellerOffchainInterface;

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

  calcCurrentRates: TypedContractMethod<
    [bulk: AddressLike],
    [[bigint, bigint] & { rateTokenToSy: bigint; rateSyToToken: bigint }],
    "view"
  >;

  calcCurrentRatesWithAmount: TypedContractMethod<
    [
      bulk: AddressLike,
      hypoTotalToken: BigNumberish,
      hypoTotalSy: BigNumberish
    ],
    [[bigint, bigint] & { rateTokenToSy: bigint; rateSyToToken: bigint }],
    "view"
  >;

  getCurrentState: TypedContractMethod<
    [bulk: AddressLike],
    [
      [BulkSellerStateStructOutput, bigint, bigint] & {
        state: BulkSellerStateStructOutput;
        tokenProp: bigint;
        hypoTokenBal: bigint;
      }
    ],
    "view"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "calcCurrentRates"
  ): TypedContractMethod<
    [bulk: AddressLike],
    [[bigint, bigint] & { rateTokenToSy: bigint; rateSyToToken: bigint }],
    "view"
  >;
  getFunction(
    nameOrSignature: "calcCurrentRatesWithAmount"
  ): TypedContractMethod<
    [
      bulk: AddressLike,
      hypoTotalToken: BigNumberish,
      hypoTotalSy: BigNumberish
    ],
    [[bigint, bigint] & { rateTokenToSy: bigint; rateSyToToken: bigint }],
    "view"
  >;
  getFunction(
    nameOrSignature: "getCurrentState"
  ): TypedContractMethod<
    [bulk: AddressLike],
    [
      [BulkSellerStateStructOutput, bigint, bigint] & {
        state: BulkSellerStateStructOutput;
        tokenProp: bigint;
        hypoTokenBal: bigint;
      }
    ],
    "view"
  >;

  filters: {};
}