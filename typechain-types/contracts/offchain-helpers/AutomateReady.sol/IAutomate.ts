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
} from "../../../common";

export type ModuleDataStruct = { modules: BigNumberish[]; args: BytesLike[] };

export type ModuleDataStructOutput = [modules: bigint[], args: string[]] & {
  modules: bigint[];
  args: string[];
};

export interface IAutomateInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "cancelTask"
      | "createTask"
      | "gelato"
      | "getFeeDetails"
      | "taskTreasury"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "cancelTask",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "createTask",
    values: [AddressLike, BytesLike, ModuleDataStruct, AddressLike]
  ): string;
  encodeFunctionData(functionFragment: "gelato", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "getFeeDetails",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "taskTreasury",
    values?: undefined
  ): string;

  decodeFunctionResult(functionFragment: "cancelTask", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "createTask", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "gelato", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getFeeDetails",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "taskTreasury",
    data: BytesLike
  ): Result;
}

export interface IAutomate extends BaseContract {
  connect(runner?: ContractRunner | null): IAutomate;
  waitForDeployment(): Promise<this>;

  interface: IAutomateInterface;

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

  cancelTask: TypedContractMethod<[taskId: BytesLike], [void], "nonpayable">;

  createTask: TypedContractMethod<
    [
      execAddress: AddressLike,
      execDataOrSelector: BytesLike,
      moduleData: ModuleDataStruct,
      feeToken: AddressLike
    ],
    [string],
    "nonpayable"
  >;

  gelato: TypedContractMethod<[], [string], "view">;

  getFeeDetails: TypedContractMethod<[], [[bigint, string]], "view">;

  taskTreasury: TypedContractMethod<[], [string], "view">;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "cancelTask"
  ): TypedContractMethod<[taskId: BytesLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "createTask"
  ): TypedContractMethod<
    [
      execAddress: AddressLike,
      execDataOrSelector: BytesLike,
      moduleData: ModuleDataStruct,
      feeToken: AddressLike
    ],
    [string],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "gelato"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "getFeeDetails"
  ): TypedContractMethod<[], [[bigint, string]], "view">;
  getFunction(
    nameOrSignature: "taskTreasury"
  ): TypedContractMethod<[], [string], "view">;

  filters: {};
}