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

export interface RewardManagerInterface extends Interface {
  getFunction(
    nameOrSignature: "lastRewardBlock" | "rewardState" | "userReward"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "lastRewardBlock",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "rewardState",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "userReward",
    values: [AddressLike, AddressLike]
  ): string;

  decodeFunctionResult(
    functionFragment: "lastRewardBlock",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "rewardState",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "userReward", data: BytesLike): Result;
}

export interface RewardManager extends BaseContract {
  connect(runner?: ContractRunner | null): RewardManager;
  waitForDeployment(): Promise<this>;

  interface: RewardManagerInterface;

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

  lastRewardBlock: TypedContractMethod<[], [bigint], "view">;

  rewardState: TypedContractMethod<
    [arg0: AddressLike],
    [[bigint, bigint] & { index: bigint; lastBalance: bigint }],
    "view"
  >;

  userReward: TypedContractMethod<
    [arg0: AddressLike, arg1: AddressLike],
    [[bigint, bigint] & { index: bigint; accrued: bigint }],
    "view"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "lastRewardBlock"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "rewardState"
  ): TypedContractMethod<
    [arg0: AddressLike],
    [[bigint, bigint] & { index: bigint; lastBalance: bigint }],
    "view"
  >;
  getFunction(
    nameOrSignature: "userReward"
  ): TypedContractMethod<
    [arg0: AddressLike, arg1: AddressLike],
    [[bigint, bigint] & { index: bigint; accrued: bigint }],
    "view"
  >;

  filters: {};
}