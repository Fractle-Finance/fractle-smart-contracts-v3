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
} from "../../../../common";

export interface IExecutorHelperInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "executeBalV2"
      | "executeCamelot"
      | "executeCurve"
      | "executeDODO"
      | "executeFrax"
      | "executeGMX"
      | "executeHashflow"
      | "executeKSClassic"
      | "executeKyberLimitOrder"
      | "executeMaverick"
      | "executePSM"
      | "executePlatypus"
      | "executeRfq"
      | "executeStEth"
      | "executeStableSwap"
      | "executeSynthetix"
      | "executeUniV3KSElastic"
      | "executeUniswap"
      | "executeVelodrome"
      | "executeWrappedstETH"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "executeBalV2",
    values: [BytesLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "executeCamelot",
    values: [BytesLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "executeCurve",
    values: [BytesLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "executeDODO",
    values: [BytesLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "executeFrax",
    values: [BytesLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "executeGMX",
    values: [BytesLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "executeHashflow",
    values: [BytesLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "executeKSClassic",
    values: [BytesLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "executeKyberLimitOrder",
    values: [BytesLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "executeMaverick",
    values: [BytesLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "executePSM",
    values: [BytesLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "executePlatypus",
    values: [BytesLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "executeRfq",
    values: [BytesLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "executeStEth",
    values: [BytesLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "executeStableSwap",
    values: [BytesLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "executeSynthetix",
    values: [BytesLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "executeUniV3KSElastic",
    values: [BytesLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "executeUniswap",
    values: [BytesLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "executeVelodrome",
    values: [BytesLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "executeWrappedstETH",
    values: [BytesLike, BigNumberish]
  ): string;

  decodeFunctionResult(
    functionFragment: "executeBalV2",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "executeCamelot",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "executeCurve",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "executeDODO",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "executeFrax",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "executeGMX", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "executeHashflow",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "executeKSClassic",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "executeKyberLimitOrder",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "executeMaverick",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "executePSM", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "executePlatypus",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "executeRfq", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "executeStEth",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "executeStableSwap",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "executeSynthetix",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "executeUniV3KSElastic",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "executeUniswap",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "executeVelodrome",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "executeWrappedstETH",
    data: BytesLike
  ): Result;
}

export interface IExecutorHelper extends BaseContract {
  connect(runner?: ContractRunner | null): IExecutorHelper;
  waitForDeployment(): Promise<this>;

  interface: IExecutorHelperInterface;

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

  executeBalV2: TypedContractMethod<
    [data: BytesLike, flagsAndPrevAmountOut: BigNumberish],
    [bigint],
    "payable"
  >;

  executeCamelot: TypedContractMethod<
    [data: BytesLike, flagsAndPrevAmountOut: BigNumberish],
    [bigint],
    "payable"
  >;

  executeCurve: TypedContractMethod<
    [data: BytesLike, flagsAndPrevAmountOut: BigNumberish],
    [bigint],
    "payable"
  >;

  executeDODO: TypedContractMethod<
    [data: BytesLike, flagsAndPrevAmountOut: BigNumberish],
    [bigint],
    "payable"
  >;

  executeFrax: TypedContractMethod<
    [data: BytesLike, flagsAndPrevAmountOut: BigNumberish],
    [bigint],
    "payable"
  >;

  executeGMX: TypedContractMethod<
    [data: BytesLike, flagsAndPrevAmountOut: BigNumberish],
    [bigint],
    "payable"
  >;

  executeHashflow: TypedContractMethod<
    [data: BytesLike, flagsAndPrevAmountOut: BigNumberish],
    [bigint],
    "payable"
  >;

  executeKSClassic: TypedContractMethod<
    [data: BytesLike, flagsAndPrevAmountOut: BigNumberish],
    [bigint],
    "payable"
  >;

  executeKyberLimitOrder: TypedContractMethod<
    [data: BytesLike, flagsAndPrevAmountOut: BigNumberish],
    [bigint],
    "payable"
  >;

  executeMaverick: TypedContractMethod<
    [data: BytesLike, flagsAndPrevAmountOut: BigNumberish],
    [bigint],
    "payable"
  >;

  executePSM: TypedContractMethod<
    [data: BytesLike, flagsAndPrevAmountOut: BigNumberish],
    [bigint],
    "payable"
  >;

  executePlatypus: TypedContractMethod<
    [data: BytesLike, flagsAndPrevAmountOut: BigNumberish],
    [bigint],
    "payable"
  >;

  executeRfq: TypedContractMethod<
    [data: BytesLike, flagsAndPrevAmountOut: BigNumberish],
    [bigint],
    "payable"
  >;

  executeStEth: TypedContractMethod<
    [data: BytesLike, flagsAndPrevAmountOut: BigNumberish],
    [bigint],
    "payable"
  >;

  executeStableSwap: TypedContractMethod<
    [data: BytesLike, flagsAndPrevAmountOut: BigNumberish],
    [bigint],
    "payable"
  >;

  executeSynthetix: TypedContractMethod<
    [data: BytesLike, flagsAndPrevAmountOut: BigNumberish],
    [bigint],
    "payable"
  >;

  executeUniV3KSElastic: TypedContractMethod<
    [data: BytesLike, flagsAndPrevAmountOut: BigNumberish],
    [bigint],
    "payable"
  >;

  executeUniswap: TypedContractMethod<
    [data: BytesLike, flagsAndPrevAmountOut: BigNumberish],
    [bigint],
    "payable"
  >;

  executeVelodrome: TypedContractMethod<
    [data: BytesLike, flagsAndPrevAmountOut: BigNumberish],
    [bigint],
    "payable"
  >;

  executeWrappedstETH: TypedContractMethod<
    [data: BytesLike, flagsAndPrevAmountOut: BigNumberish],
    [bigint],
    "payable"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "executeBalV2"
  ): TypedContractMethod<
    [data: BytesLike, flagsAndPrevAmountOut: BigNumberish],
    [bigint],
    "payable"
  >;
  getFunction(
    nameOrSignature: "executeCamelot"
  ): TypedContractMethod<
    [data: BytesLike, flagsAndPrevAmountOut: BigNumberish],
    [bigint],
    "payable"
  >;
  getFunction(
    nameOrSignature: "executeCurve"
  ): TypedContractMethod<
    [data: BytesLike, flagsAndPrevAmountOut: BigNumberish],
    [bigint],
    "payable"
  >;
  getFunction(
    nameOrSignature: "executeDODO"
  ): TypedContractMethod<
    [data: BytesLike, flagsAndPrevAmountOut: BigNumberish],
    [bigint],
    "payable"
  >;
  getFunction(
    nameOrSignature: "executeFrax"
  ): TypedContractMethod<
    [data: BytesLike, flagsAndPrevAmountOut: BigNumberish],
    [bigint],
    "payable"
  >;
  getFunction(
    nameOrSignature: "executeGMX"
  ): TypedContractMethod<
    [data: BytesLike, flagsAndPrevAmountOut: BigNumberish],
    [bigint],
    "payable"
  >;
  getFunction(
    nameOrSignature: "executeHashflow"
  ): TypedContractMethod<
    [data: BytesLike, flagsAndPrevAmountOut: BigNumberish],
    [bigint],
    "payable"
  >;
  getFunction(
    nameOrSignature: "executeKSClassic"
  ): TypedContractMethod<
    [data: BytesLike, flagsAndPrevAmountOut: BigNumberish],
    [bigint],
    "payable"
  >;
  getFunction(
    nameOrSignature: "executeKyberLimitOrder"
  ): TypedContractMethod<
    [data: BytesLike, flagsAndPrevAmountOut: BigNumberish],
    [bigint],
    "payable"
  >;
  getFunction(
    nameOrSignature: "executeMaverick"
  ): TypedContractMethod<
    [data: BytesLike, flagsAndPrevAmountOut: BigNumberish],
    [bigint],
    "payable"
  >;
  getFunction(
    nameOrSignature: "executePSM"
  ): TypedContractMethod<
    [data: BytesLike, flagsAndPrevAmountOut: BigNumberish],
    [bigint],
    "payable"
  >;
  getFunction(
    nameOrSignature: "executePlatypus"
  ): TypedContractMethod<
    [data: BytesLike, flagsAndPrevAmountOut: BigNumberish],
    [bigint],
    "payable"
  >;
  getFunction(
    nameOrSignature: "executeRfq"
  ): TypedContractMethod<
    [data: BytesLike, flagsAndPrevAmountOut: BigNumberish],
    [bigint],
    "payable"
  >;
  getFunction(
    nameOrSignature: "executeStEth"
  ): TypedContractMethod<
    [data: BytesLike, flagsAndPrevAmountOut: BigNumberish],
    [bigint],
    "payable"
  >;
  getFunction(
    nameOrSignature: "executeStableSwap"
  ): TypedContractMethod<
    [data: BytesLike, flagsAndPrevAmountOut: BigNumberish],
    [bigint],
    "payable"
  >;
  getFunction(
    nameOrSignature: "executeSynthetix"
  ): TypedContractMethod<
    [data: BytesLike, flagsAndPrevAmountOut: BigNumberish],
    [bigint],
    "payable"
  >;
  getFunction(
    nameOrSignature: "executeUniV3KSElastic"
  ): TypedContractMethod<
    [data: BytesLike, flagsAndPrevAmountOut: BigNumberish],
    [bigint],
    "payable"
  >;
  getFunction(
    nameOrSignature: "executeUniswap"
  ): TypedContractMethod<
    [data: BytesLike, flagsAndPrevAmountOut: BigNumberish],
    [bigint],
    "payable"
  >;
  getFunction(
    nameOrSignature: "executeVelodrome"
  ): TypedContractMethod<
    [data: BytesLike, flagsAndPrevAmountOut: BigNumberish],
    [bigint],
    "payable"
  >;
  getFunction(
    nameOrSignature: "executeWrappedstETH"
  ): TypedContractMethod<
    [data: BytesLike, flagsAndPrevAmountOut: BigNumberish],
    [bigint],
    "payable"
  >;

  filters: {};
}