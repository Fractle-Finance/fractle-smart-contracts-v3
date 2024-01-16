/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Contract,
  ContractFactory,
  ContractTransactionResponse,
  Interface,
} from "ethers";
import type {
  Signer,
  BigNumberish,
  AddressLike,
  ContractDeployTransaction,
  ContractRunner,
} from "ethers";
import type { NonPayableOverrides } from "../../../../common";
import type {
  EuphratesPrincipalTokenV2,
  EuphratesPrincipalTokenV2Interface,
} from "../../../../contracts/core/YieldContractsV2/EuphratesPrincipalTokenV2";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_SY",
        type: "address",
      },
      {
        internalType: "string",
        name: "_name",
        type: "string",
      },
      {
        internalType: "string",
        name: "_symbol",
        type: "string",
      },
      {
        internalType: "uint8",
        name: "__decimals",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "_expiry",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "InvalidShortString",
    type: "error",
  },
  {
    inputs: [],
    name: "OnlyYT",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "str",
        type: "string",
      },
    ],
    name: "StringTooLong",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [],
    name: "EIP712DomainChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint8",
        name: "version",
        type: "uint8",
      },
    ],
    name: "Initialized",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [],
    name: "DOMAIN_SEPARATOR",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "SY",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "YT",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "allowance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "burnByYT",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "eip712Domain",
    outputs: [
      {
        internalType: "bytes1",
        name: "fields",
        type: "bytes1",
      },
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "version",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "chainId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "verifyingContract",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "salt",
        type: "bytes32",
      },
      {
        internalType: "uint256[]",
        name: "extensions",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "expiry",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "factory",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_YT",
        type: "address",
      },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "isExpired",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "mintByYT",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "nonces",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
      {
        internalType: "uint8",
        name: "v",
        type: "uint8",
      },
      {
        internalType: "bytes32",
        name: "r",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "s",
        type: "bytes32",
      },
    ],
    name: "permit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x6101e06040523480156200001257600080fd5b50604051620021f4380380620021f48339810160408190526200003591620002f6565b83838382604051806040016040528060018152602001603160f81b815250848484826003908162000067919062000435565b50600462000076838262000435565b5060ff16608052505060028054600160f81b6001600160f81b03909116179055620000af8260056200018a602090811b62000a8c17901c565b61014052620000cc8160066200018a602090811b62000a8c17901c565b61016052815160208084019190912061010052815190820120610120524660c0526200015c6101005161012051604080517f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f60208201529081019290925260608201524660808201523060a082015260009060c00160405160208183030381529060405280519060200120905090565b60a05250503060e0525050506001600160a01b0394909416610180525050506101c052336101a0526200055b565b6000602083511015620001aa57620001a283620001da565b9050620001d4565b82620001c1836200022660201b62000abd1760201c565b90620001ce908262000435565b5060ff90505b92915050565b600080829050601f8151111562000211578260405163305a27a960e01b815260040162000208919062000501565b60405180910390fd5b80516200021e8262000536565b179392505050565b90565b634e487b7160e01b600052604160045260246000fd5b60005b838110156200025c57818101518382015260200162000242565b50506000910152565b600082601f8301126200027757600080fd5b81516001600160401b038082111562000294576200029462000229565b604051601f8301601f19908116603f01168101908282118183101715620002bf57620002bf62000229565b81604052838152866020858801011115620002d957600080fd5b620002ec8460208301602089016200023f565b9695505050505050565b600080600080600060a086880312156200030f57600080fd5b85516001600160a01b03811681146200032757600080fd5b60208701519095506001600160401b03808211156200034557600080fd5b6200035389838a0162000265565b955060408801519150808211156200036a57600080fd5b50620003798882890162000265565b935050606086015160ff811681146200039157600080fd5b80925050608086015190509295509295909350565b600181811c90821680620003bb57607f821691505b602082108103620003dc57634e487b7160e01b600052602260045260246000fd5b50919050565b601f8211156200043057600081815260208120601f850160051c810160208610156200040b5750805b601f850160051c820191505b818110156200042c5782815560010162000417565b5050505b505050565b81516001600160401b0381111562000451576200045162000229565b6200046981620004628454620003a6565b84620003e2565b602080601f831160018114620004a15760008415620004885750858301515b600019600386901b1c1916600185901b1785556200042c565b600085815260208120601f198616915b82811015620004d257888601518255948401946001909101908401620004b1565b5085821015620004f15787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b6020815260008251806020840152620005228160408501602087016200023f565b601f01601f19169190910160400192915050565b80516020808301519190811015620003dc5760001960209190910360031b1b16919050565b60805160a05160c05160e05161010051610120516101405161016051610180516101a0516101c051611c0b620005e96000396000818161020201526103d20152600061034c015260006103120152600061062d0152600061060201526000611119015260006110f10152600061104c01526000611076015260006110a00152600061022e0152611c0b6000f3fe608060405234801561001057600080fd5b50600436106101775760003560e01c80637ecebe00116100d8578063b64761f91161008c578063d505accf11610066578063d505accf14610381578063dd62ed3e14610394578063e184c9be146103cd57600080fd5b8063b64761f914610334578063c45a015514610347578063c4d66de81461036e57600080fd5b806395d89b41116100bd57806395d89b41146102f2578063a9059cbb146102fa578063afd27bf51461030d57600080fd5b80637ecebe00146102c457806384b0196e146102d757600080fd5b80632f13b60c1161012f5780633644e515116101145780633644e5151461026257806370a082311461026a578063781c18db1461029357600080fd5b80632f13b60c14610200578063313ce5671461022957600080fd5b806312a31dcc1161016057806312a31dcc146101bd57806318160ddd146101d257806323b872dd146101ed57600080fd5b806306fdde031461017c578063095ea7b31461019a575b600080fd5b6101846103f4565b60405161019191906117c4565b60405180910390f35b6101ad6101a83660046117fa565b610486565b6040519015158152602001610191565b6101d06101cb3660046117fa565b6104a0565b005b6002546001600160f81b03165b604051908152602001610191565b6101ad6101fb366004611824565b6104f8565b7f00000000000000000000000000000000000000000000000000000000000000004210156101ad565b6102507f000000000000000000000000000000000000000000000000000000000000000081565b60405160ff9091168152602001610191565b6101df6105cc565b6101df610278366004611860565b6001600160a01b031660009081526020819052604090205490565b6008546102ac906201000090046001600160a01b031681565b6040516001600160a01b039091168152602001610191565b6101df6102d2366004611860565b6105d6565b6102df6105f4565b604051610191979695949392919061187b565b610184610699565b6101ad6103083660046117fa565b6106a8565b6102ac7f000000000000000000000000000000000000000000000000000000000000000081565b6101d06103423660046117fa565b610766565b6102ac7f000000000000000000000000000000000000000000000000000000000000000081565b6101d061037c366004611860565b6107ba565b6101d061038f36600461192d565b610928565b6101df6103a23660046119a0565b6001600160a01b03918216600090815260016020908152604080832093909416825291909152205490565b6101df7f000000000000000000000000000000000000000000000000000000000000000081565b606060038054610403906119d3565b80601f016020809104026020016040519081016040528092919081815260200182805461042f906119d3565b801561047c5780601f106104515761010080835404028352916020019161047c565b820191906000526020600020905b81548152906001019060200180831161045f57829003601f168201915b5050505050905090565b600033610494818585610ac0565b60019150505b92915050565b6008546201000090046001600160a01b031633146104ea576040517fb114ba9800000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6104f48282610c19565b5050565b600254600090600119600160f81b90910460ff160161055e5760405162461bcd60e51b815260206004820152601f60248201527f5265656e7472616e637947756172643a207265656e7472616e742063616c6c0060448201526064015b60405180910390fd5b600280546001600160f81b03167f02000000000000000000000000000000000000000000000000000000000000001790553361059b858285610d35565b6105a6858585610dc7565b6001915050600280546001600160f81b0316600160f81b1790559392505050565b905090565b60006105c761103f565b6001600160a01b03811660009081526007602052604081205461049a565b6000606080828080836106287f0000000000000000000000000000000000000000000000000000000000000000600561116a565b6106537f0000000000000000000000000000000000000000000000000000000000000000600661116a565b604080516000808252602082019092527f0f000000000000000000000000000000000000000000000000000000000000009b939a50919850469750309650945092509050565b606060048054610403906119d3565b600254600090600119600160f81b90910460ff16016107095760405162461bcd60e51b815260206004820152601f60248201527f5265656e7472616e637947756172643a207265656e7472616e742063616c6c006044820152606401610555565b600280546001600160f81b03167f020000000000000000000000000000000000000000000000000000000000000017905533610746818585610dc7565b6001915050600280546001600160f81b0316600160f81b17905592915050565b6008546201000090046001600160a01b031633146107b0576040517fb114ba9800000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6104f4828261120e565b600854610100900460ff16158080156107da5750600854600160ff909116105b806107f45750303b1580156107f4575060085460ff166001145b6108665760405162461bcd60e51b815260206004820152602e60248201527f496e697469616c697a61626c653a20636f6e747261637420697320616c72656160448201527f647920696e697469616c697a65640000000000000000000000000000000000006064820152608401610555565b600880547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0016600117905580156108a7576008805461ff0019166101001790555b600880547fffffffffffffffffffff0000000000000000000000000000000000000000ffff16620100006001600160a01b0385160217905580156104f4576008805461ff0019169055604051600181527f7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb38474024989060200160405180910390a15050565b834211156109785760405162461bcd60e51b815260206004820152601d60248201527f45524332305065726d69743a206578706972656420646561646c696e650000006044820152606401610555565b60007f6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c98888886109a78c6113c9565b6040805160208101969096526001600160a01b0394851690860152929091166060840152608083015260a082015260c0810186905260e0016040516020818303038152906040528051906020012090506000610a02826113f1565b90506000610a1282878787611439565b9050896001600160a01b0316816001600160a01b031614610a755760405162461bcd60e51b815260206004820152601e60248201527f45524332305065726d69743a20696e76616c6964207369676e617475726500006044820152606401610555565b610a808a8a8a610ac0565b50505050505050505050565b6000602083511015610aa857610aa183611461565b905061049a565b81610ab38482611a6b565b5060ff905061049a565b90565b6001600160a01b038316610b3b5760405162461bcd60e51b8152602060048201526024808201527f45524332303a20617070726f76652066726f6d20746865207a65726f2061646460448201527f72657373000000000000000000000000000000000000000000000000000000006064820152608401610555565b6001600160a01b038216610bb75760405162461bcd60e51b815260206004820152602260248201527f45524332303a20617070726f766520746f20746865207a65726f20616464726560448201527f73730000000000000000000000000000000000000000000000000000000000006064820152608401610555565b6001600160a01b0383811660008181526001602090815260408083209487168084529482529182902085905590518481527f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92591015b60405180910390a3505050565b6001600160a01b038216610c6f5760405162461bcd60e51b815260206004820152601f60248201527f45524332303a206d696e7420746f20746865207a65726f2061646472657373006044820152606401610555565b610c78816114b8565b60028054600090610c939084906001600160f81b0316611b41565b92506101000a8154816001600160f81b0302191690836001600160f81b0316021790555080600080846001600160a01b03166001600160a01b031681526020019081526020016000206000828254610ceb9190611b68565b90915550506040518181526001600160a01b038316906000907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9060200160405180910390a35050565b6001600160a01b038381166000908152600160209081526040808320938616835292905220546000198114610dc15781811015610db45760405162461bcd60e51b815260206004820152601d60248201527f45524332303a20696e73756666696369656e7420616c6c6f77616e63650000006044820152606401610555565b610dc18484848403610ac0565b50505050565b6001600160a01b038316610e435760405162461bcd60e51b815260206004820152602560248201527f45524332303a207472616e736665722066726f6d20746865207a65726f20616460448201527f64726573730000000000000000000000000000000000000000000000000000006064820152608401610555565b6001600160a01b038216610ebf5760405162461bcd60e51b815260206004820152602360248201527f45524332303a207472616e7366657220746f20746865207a65726f206164647260448201527f65737300000000000000000000000000000000000000000000000000000000006064820152608401610555565b816001600160a01b0316836001600160a01b031603610f205760405162461bcd60e51b815260206004820152601760248201527f45524332303a207472616e7366657220746f2073656c660000000000000000006044820152606401610555565b6001600160a01b03831660009081526020819052604090205481811015610faf5760405162461bcd60e51b815260206004820152602660248201527f45524332303a207472616e7366657220616d6f756e742065786365656473206260448201527f616c616e636500000000000000000000000000000000000000000000000000006064820152608401610555565b6001600160a01b03808516600090815260208190526040808220858503905591851681529081208054849290610fe6908490611b68565b92505081905550826001600160a01b0316846001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef8460405161103291815260200190565b60405180910390a3610dc1565b6000306001600160a01b037f00000000000000000000000000000000000000000000000000000000000000001614801561109857507f000000000000000000000000000000000000000000000000000000000000000046145b156110c257507f000000000000000000000000000000000000000000000000000000000000000090565b6105c7604080517f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f60208201527f0000000000000000000000000000000000000000000000000000000000000000918101919091527f000000000000000000000000000000000000000000000000000000000000000060608201524660808201523060a082015260009060c00160405160208183030381529060405280519060200120905090565b606060ff831461117d57610aa1836114d2565b818054611189906119d3565b80601f01602080910402602001604051908101604052809291908181526020018280546111b5906119d3565b80156112025780601f106111d757610100808354040283529160200191611202565b820191906000526020600020905b8154815290600101906020018083116111e557829003601f168201915b5050505050905061049a565b6001600160a01b03821661128a5760405162461bcd60e51b815260206004820152602160248201527f45524332303a206275726e2066726f6d20746865207a65726f2061646472657360448201527f73000000000000000000000000000000000000000000000000000000000000006064820152608401610555565b6001600160a01b038216600090815260208190526040902054818110156113195760405162461bcd60e51b815260206004820152602260248201527f45524332303a206275726e20616d6f756e7420657863656564732062616c616e60448201527f63650000000000000000000000000000000000000000000000000000000000006064820152608401610555565b6001600160a01b0383166000908152602081905260409020828203905561133f826114b8565b6002805460009061135a9084906001600160f81b0316611b7b565b92506101000a8154816001600160f81b0302191690836001600160f81b0316021790555060006001600160a01b0316836001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef84604051610c0c91815260200190565b505050565b6001600160a01b03811660009081526007602052604090208054600181018255905b50919050565b600061049a6113fe61103f565b836040517f19010000000000000000000000000000000000000000000000000000000000008152600281019290925260228201526042902090565b600080600061144a87878787611511565b91509150611457816115d5565b5095945050505050565b600080829050601f815111156114a557826040517f305a27a900000000000000000000000000000000000000000000000000000000815260040161055591906117c4565b80516114b082611b9b565b179392505050565b60006001600160f81b038211156114ce57600080fd5b5090565b606060006114df8361173d565b604080516020808252818301909252919250600091906020820181803683375050509182525060208101929092525090565b6000807f7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a083111561154857506000905060036115cc565b6040805160008082526020820180845289905260ff881692820192909252606081018690526080810185905260019060a0016020604051602081039080840390855afa15801561159c573d6000803e3d6000fd5b5050604051601f1901519150506001600160a01b0381166115c5576000600192509250506115cc565b9150600090505b94509492505050565b60008160048111156115e9576115e9611bbf565b036115f15750565b600181600481111561160557611605611bbf565b036116525760405162461bcd60e51b815260206004820152601860248201527f45434453413a20696e76616c6964207369676e617475726500000000000000006044820152606401610555565b600281600481111561166657611666611bbf565b036116b35760405162461bcd60e51b815260206004820152601f60248201527f45434453413a20696e76616c6964207369676e6174757265206c656e677468006044820152606401610555565b60038160048111156116c7576116c7611bbf565b0361173a5760405162461bcd60e51b815260206004820152602260248201527f45434453413a20696e76616c6964207369676e6174757265202773272076616c60448201527f75650000000000000000000000000000000000000000000000000000000000006064820152608401610555565b50565b600060ff8216601f81111561049a576040517fb3512b0c00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6000815180845260005b818110156117a457602081850181015186830182015201611788565b506000602082860101526020601f19601f83011685010191505092915050565b6020815260006117d7602083018461177e565b9392505050565b80356001600160a01b03811681146117f557600080fd5b919050565b6000806040838503121561180d57600080fd5b611816836117de565b946020939093013593505050565b60008060006060848603121561183957600080fd5b611842846117de565b9250611850602085016117de565b9150604084013590509250925092565b60006020828403121561187257600080fd5b6117d7826117de565b7fff00000000000000000000000000000000000000000000000000000000000000881681526000602060e0818401526118b760e084018a61177e565b83810360408501526118c9818a61177e565b606085018990526001600160a01b038816608086015260a0850187905284810360c0860152855180825283870192509083019060005b8181101561191b578351835292840192918401916001016118ff565b50909c9b505050505050505050505050565b600080600080600080600060e0888a03121561194857600080fd5b611951886117de565b965061195f602089016117de565b95506040880135945060608801359350608088013560ff8116811461198357600080fd5b9699959850939692959460a0840135945060c09093013592915050565b600080604083850312156119b357600080fd5b6119bc836117de565b91506119ca602084016117de565b90509250929050565b600181811c908216806119e757607f821691505b6020821081036113eb57634e487b7160e01b600052602260045260246000fd5b634e487b7160e01b600052604160045260246000fd5b601f8211156113c457600081815260208120601f850160051c81016020861015611a445750805b601f850160051c820191505b81811015611a6357828155600101611a50565b505050505050565b815167ffffffffffffffff811115611a8557611a85611a07565b611a9981611a9384546119d3565b84611a1d565b602080601f831160018114611ace5760008415611ab65750858301515b600019600386901b1c1916600185901b178555611a63565b600085815260208120601f198616915b82811015611afd57888601518255948401946001909101908401611ade565b5085821015611b1b5787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b634e487b7160e01b600052601160045260246000fd5b6001600160f81b03818116838216019080821115611b6157611b61611b2b565b5092915050565b8082018082111561049a5761049a611b2b565b6001600160f81b03828116828216039080821115611b6157611b61611b2b565b805160208083015191908110156113eb5760001960209190910360031b1b16919050565b634e487b7160e01b600052602160045260246000fdfea2646970667358221220cf35125cb10ea596eb00c88c3178d1163b6a74f7ee46eb0853d6820f277a2d6664736f6c63430008110033";

type EuphratesPrincipalTokenV2ConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: EuphratesPrincipalTokenV2ConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class EuphratesPrincipalTokenV2__factory extends ContractFactory {
  constructor(...args: EuphratesPrincipalTokenV2ConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override getDeployTransaction(
    _SY: AddressLike,
    _name: string,
    _symbol: string,
    __decimals: BigNumberish,
    _expiry: BigNumberish,
    overrides?: NonPayableOverrides & { from?: string }
  ): Promise<ContractDeployTransaction> {
    return super.getDeployTransaction(
      _SY,
      _name,
      _symbol,
      __decimals,
      _expiry,
      overrides || {}
    );
  }
  override deploy(
    _SY: AddressLike,
    _name: string,
    _symbol: string,
    __decimals: BigNumberish,
    _expiry: BigNumberish,
    overrides?: NonPayableOverrides & { from?: string }
  ) {
    return super.deploy(
      _SY,
      _name,
      _symbol,
      __decimals,
      _expiry,
      overrides || {}
    ) as Promise<
      EuphratesPrincipalTokenV2 & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(
    runner: ContractRunner | null
  ): EuphratesPrincipalTokenV2__factory {
    return super.connect(runner) as EuphratesPrincipalTokenV2__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): EuphratesPrincipalTokenV2Interface {
    return new Interface(_abi) as EuphratesPrincipalTokenV2Interface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): EuphratesPrincipalTokenV2 {
    return new Contract(
      address,
      _abi,
      runner
    ) as unknown as EuphratesPrincipalTokenV2;
  }
}