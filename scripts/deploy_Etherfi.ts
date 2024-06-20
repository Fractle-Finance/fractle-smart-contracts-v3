import { ethers, network } from "hardhat";
import { MarketMathCore, MarketState } from "./calculation";
import { ContractTransactionResponse, Signer, ZeroAddress } from "ethers";
import BigNumber from "bignumber.js";
import {
  ActionAddRemoveLiq,
  ActionSwapPT,
  ActionSwapYT,
  FractleMarketV3,
  FractleYieldTokenV3,
} from "../typechain-types";

async function main() {
  console.log("detected network " + network.name);
  const signers = await ethers.getSigners();

  // etherfi address
  // 0x308861A430be4cce5502d0A12724771Fc6DaF216

  // EUSD --> WEETH;
  // 0xcd5fe23c85820f7b72d0926fc9b05b43e359b7ee
  const weETH = "0xcd5fe23c85820f7b72d0926fc9b05b43e359b7ee";
  // step1: deploy the SY, in this case we deploy the FractleWEETHFI.sol
  const _FractleWEEthSY = await ethers.getContractFactory("FractleWEEthSY");
  const FractleWEEthSY = await _FractleWEEthSY.deploy(weETH, ZeroAddress);
  // await FractleWEEthSY.deploymentTransaction()?.wait();
  console.log("SY deployed at: " + (await FractleWEEthSY.getAddress()));
  // deploy oracleLib
  const _OracleLib = await ethers.getContractFactory("OracleLib");
  const OracleLib = await _OracleLib.deploy();
  await OracleLib.deploymentTransaction()?.wait();
  console.log("OracleLib deployed to:", await OracleLib.getAddress());

  const _FractleYieldTokenFactoryV3 = await ethers.getContractFactory(
    "FractleYieldContractFactoryV3",
  );
  const FractleYieldTokenFactoryV3 = await _FractleYieldTokenFactoryV3.deploy();
  await FractleYieldTokenFactoryV3.deploymentTransaction()?.wait();
  console.log(
    "yield token factory deployed at: " +
      (await FractleYieldTokenFactoryV3.getAddress()),
  );
  // now we initialize the factory
  const initializationTx = await FractleYieldTokenFactoryV3.initialize(
    // a day
    86400,
    // 6%
    ethers.parseEther(String(0.06)),
    // 2%
    ethers.parseEther(String(0.02)),
    // treasury
    weETH,
  );
  await initializationTx.wait();

  // begin to deployPT and YT
  const ptToDeploy = await ethers.getContractFactory("FractlePrincipalTokenV3");
  const deployedPT = await ptToDeploy.deploy(
    await FractleWEEthSY.getAddress(),
    "WEETH_SY_1739145600",
    "WEETH_SY_1739145600",
    18,
    1739145600,
  ); //1739145600 is 20250208
  await deployedPT.deploymentTransaction()?.wait();
  console.log("successfully deployed pt", await deployedPT.getAddress());

  // then we deploy the YT
  const ytToDeploy = await ethers.getContractFactory("FractleYieldTokenV3");
  const deployedYT = await ytToDeploy.deploy(
    await FractleWEEthSY.getAddress(), //SY
    await deployedPT.getAddress(), //PT
    await FractleYieldTokenFactoryV3.getAddress(), //factory
    "WEETH_SY_1739145600YT", //name
    "WETH_SY_1739145600YT", //symbol
    18, //decimal
    1739145600, //expiry
    ethers.parseEther(String(0.02)), //sapr 2%
    365, //lifeCircle
    false,
  );
  await deployedYT.deploymentTransaction()?.wait();
  console.log("successfully deployed yt", await deployedYT.getAddress());

  // the use the YT to initialize the PT.
  const initializationTxPTYT = await FractleYieldTokenFactoryV3.initializePTYT(
    await FractleWEEthSY.getAddress(),
    await deployedPT.getAddress(),
    await deployedYT.getAddress(),
    1739145600,
  );
  await initializationTxPTYT.wait();

  // we can check if yt and sy address are stored in the pt address .
  const syAddressFromPt = await deployedPT.SY();
  const ytAddressFromPt = await deployedPT.YT();
  console.log("sy address from pt: " + syAddressFromPt);
  console.log("yt address from pt: " + ytAddressFromPt);

  const ytContract = await ethers.getContractFactory("FractleYieldTokenV3");
  const yt = ytContract.attach(await deployedYT.getAddress());
  console.log(await yt.isExpired());

  // we deploy and initialize the marketFactory.
  const _FractleMarketFactoryV3 = await ethers.getContractFactory(
    "FractleMarketFactoryV3",
  );
  const FractleMarketFactoryV3 = await _FractleMarketFactoryV3.deploy(
    await FractleYieldTokenFactoryV3.getAddress(),
  );
  await FractleMarketFactoryV3.deploymentTransaction()?.wait();
  console.log(
    "market factory deployed at: " +
      (await FractleMarketFactoryV3.getAddress()),
  );
  // now we initialize the factory
  const initializeFractleMarket = await FractleMarketFactoryV3.initialize(
    weETH,
    ethers.parseEther(String(0.000999500333083533)),
    80,
    // external rewards distributor, don't need to set it currently.
    weETH,
  );
  await initializeFractleMarket.wait();

  // we have to deploy the market manually.
  const _FractleMarket = await ethers.getContractFactory("FractleMarketV3", {
    libraries: {
      OracleLib: await OracleLib.getAddress(),
    },
  });
  const deployedFractleMarket = await _FractleMarket.deploy(
    await deployedPT.getAddress(),
    ethers.parseEther(String(76.56895)),
    ethers.parseEther(String(1.04573897412)), //1.04573897412,absolutely 1 year round
    weETH,
    weETH,
    await FractleMarketFactoryV3.getAddress(),
  );
  await deployedFractleMarket.deploymentTransaction()?.wait();
  console.log(
    "market deployed at :" + (await deployedFractleMarket.getAddress()),
  );

  const createMarket = await FractleMarketFactoryV3.createNewMarket(
    await deployedPT.getAddress(),
    await deployedFractleMarket.getAddress(),
    ethers.parseEther(String(76.56895)),
    ethers.parseEther(String(1.04573897412)),
  );
  await createMarket.wait();

  const actionAddRemoveLiq =
    await ethers.getContractFactory("ActionAddRemoveLiq");
  const actionAddRemoveLiqInstance = await actionAddRemoveLiq.deploy();
  await actionAddRemoveLiqInstance.deploymentTransaction()?.wait();
  console.log(
    "actionAddRemoveLiq deployed at: " +
      (await actionAddRemoveLiqInstance.getAddress()),
  );

  const actionMintRedeem = await ethers.getContractFactory("ActionMintRedeem");
  const actionMintRedeemInstance = await actionMintRedeem.deploy();
  await actionMintRedeemInstance.deploymentTransaction()?.wait();
  console.log(
    "actionMintRedeem deployed at: " +
      (await actionMintRedeemInstance.getAddress()),
  );

  const actionMisc = await ethers.getContractFactory("ActionMisc");
  const actionMiscInstance = await actionMisc.deploy();
  await actionMiscInstance.deploymentTransaction()?.wait();
  console.log(
    "actionMisc deployed at: " + (await actionMiscInstance.getAddress()),
  );

  const actionSwapPT = await ethers.getContractFactory("ActionSwapPT");
  const actionSwapPTInstance = await actionSwapPT.deploy();
  await actionSwapPTInstance.deploymentTransaction()?.wait();
  console.log(
    "actionSwapPT deployed at: " + (await actionSwapPTInstance.getAddress()),
  );

  const addressProvider = await ethers.getContractFactory("AddressProvider");
  const addressProviderInstance = await addressProvider.deploy();
  await addressProviderInstance.deploymentTransaction()?.wait();
  console.log(
    "addressProvider deployed at: " +
      (await addressProviderInstance.getAddress()),
  );

  // set market factory
  const initializeProviderInstance = await addressProviderInstance.initialize();
  await initializeProviderInstance.wait();
  const setProviderInstance = await addressProviderInstance.set(
    10086,
    await FractleMarketFactoryV3.getAddress(),
  );
  await setProviderInstance.wait();

  const actionSwapYT = await ethers.getContractFactory("ActionSwapYT");
  const actionSwapYTInstance = await actionSwapYT.deploy(
    await addressProviderInstance.getAddress(),
    10086,
  );
  await actionSwapYTInstance.deploymentTransaction()?.wait();
  console.log(
    "actionSwapYT deployed at: " + (await actionSwapYTInstance.getAddress()),
  );

  // Define the ERC20 contract ABI
  const abi = [
    "function approve(address spender, uint256 amount) external returns (bool)",
  ];
  // Create a contract instance
  const weETHInstance = new ethers.Contract(weETH, abi, signers[0]);

  const approval1 = await weETHInstance.approve(
    await FractleWEEthSY.getAddress(),
    ethers.parseEther("10000000000000000000000000000"),
  );
  await approval1.wait();
  const approval2 = await weETHInstance.approve(
    await actionMintRedeemInstance.getAddress(),
    ethers.parseEther("10000000000000000000000000000"),
  );
  await approval2.wait();
  console.log("approved");

  const depositSomeETH = await FractleWEEthSY.deposit(
    signers[0].getAddress(),
    ZeroAddress,
    10000000000000000000000000n,
    0,
    { value: 10000000000000000000000000n },
  );
  const depositSomeETHReceipt = await depositSomeETH.wait();
  console.log("successfully deposit some eth into the pool");
  console.log(
    "now the address has",
    await FractleWEEthSY.balanceOf(signers[0].getAddress()),
  );

  // // first of all, we have to mint sy from token.
  // const input = {
  //   tokenIn: weETH,
  //   netTokenIn: 10000000000000000000000n,
  //   tokenMintSy: weETH,
  // };
  // const mintedToken = await actionMintRedeemInstance.mintSyFromToken(
  //   signers[0].getAddress(),
  //   await FractleWEEthSY.getAddress(),
  //   0,
  //   input,
  // );
  // await mintedToken.wait();
  // console.log(await FractleWEEthSY.balanceOf(signers[0].getAddress()));

  /**
   * @notice Tokenize SY into PT + YT of equal qty. Every unit of asset of SY will create 1 PT + 1 YT
   * @dev SY must be transferred to this contract prior to calling
   * 要先把SY转到合约中，然后再mintPTYT，否则出错。
   */
  const transfer = await FractleWEEthSY.transfer(
    await deployedYT.getAddress(),
    5000000000000000000000n,
  );
  await transfer.wait();

  // begin to mint ptyt
  await deployedYT.mintPY(signers[0].getAddress(), signers[0].getAddress());
  console.log(
    "FPT balance after initial mint :" +
      (await deployedYT.balanceOf(signers[0].getAddress())),
  );
  console.log(
    "DYT balance after initial mint :" +
      (await deployedPT.balanceOf(signers[0].getAddress())),
  );

  console.log(
    "SY balance after initial mint :" +
      (await FractleWEEthSY.balanceOf(signers[0].getAddress())),
  );
  await mineBlocks(signers[0], 10);
  // now we can redeem
  await actionMintRedeemInstance.redeemDueInterestAndRewards(
    await signers[0].getAddress(),
    [],
    [await deployedYT.getAddress()],
    [await deployedFractleMarket.getAddress()],
  );
  console.log(
    "SY balance after initial mint :" +
      (await FractleWEEthSY.balanceOf(signers[0].getAddress())),
  );

  // read state
  const market_instance = await ethers.getContractFactory("FractleMarketV3", {
    libraries: {
      OracleLib: await OracleLib.getAddress(),
    },
  });
  const deployedMarketV3 = market_instance.attach(
    await deployedFractleMarket.getAddress(),
  );
  console.log(await deployedMarketV3.isExpired());

  // now we can begin to add liquidity
  console.log(
    "actionAddRemoveLiqInstanceAddress",
    await actionAddRemoveLiqInstance.getAddress(),
  );
  console.log("deployedPTAddress", await deployedPT.getAddress());

  const approvalPTtoPool = await deployedPT.approve(
    await actionAddRemoveLiqInstance.getAddress(),
    ethers.parseEther("100000000000"),
  );
  await approvalPTtoPool.wait();
  const approvalEUSDSYtoPool = await FractleWEEthSY.approve(
    await actionAddRemoveLiqInstance.getAddress(),
    ethers.parseEther("100000000000"),
  );
  await approvalEUSDSYtoPool.wait();
  const approvalPTtoMarket = await deployedPT.approve(
    await deployedFractleMarket.getAddress(),
    ethers.parseEther("100000000000"),
  );
  await approvalPTtoMarket.wait();
  const approvalEUSDSYtoMarket = await FractleWEEthSY.approve(
    await deployedFractleMarket.getAddress(),
    ethers.parseEther("100000000000"),
  );
  await approvalEUSDSYtoMarket.wait();

  //actually, we'd better get this approx data with a calculation function
  //but if we have determined the inital implied rata. we are sure what to fill in here
  //and we calculate the initial anchor by this initial implied rate
  //the calculated anchor has been used just now while initiating the market
  const calldata00 = {
    guessMin: String(BigNumber(495e14)), //4.95%
    guessMax: String(BigNumber(505e14)), //5.05%
    guessOffchain: String(BigNumber(5e16)), //5%
    maxIteration: String(BigNumber(7)),
    eps: String(BigNumber(1e14)),
  };
  const addLiquidity = await actionAddRemoveLiqInstance.addLiquidityDualSyAndPt(
    signers[0].getAddress(),
    await deployedFractleMarket.getAddress(),
    300000000000000000000n,
    100000000000000000000n,
    0,
    calldata00,
  );
  await addLiquidity.wait();
  console.log("successfully add liquidity");

  // how much lp do we have? // 172205
  const approvalToMarket = await deployedFractleMarket.approve(
    await actionAddRemoveLiqInstance.getAddress(),
    ethers.parseEther("100000000"),
  );
  await approvalToMarket.wait();

  const approvalPT = await deployedPT.approve(
    actionSwapPTInstance.getAddress(),
    ethers.parseEther("100000000000"),
  );
  await approvalPT.wait();
  const approvalSY = await FractleWEEthSY.approve(
    actionSwapPTInstance.getAddress(),
    ethers.parseEther("100000000000"),
  );
  await approvalSY.wait();

  // begin to swap 0.01 Pt for Sy
  const res_swapPtForSy = await preCalculationSwapPt(
    deployedFractleMarket,
    actionSwapPTInstance,
    deployedYT,
    {
      exactPtIn: BigNumber("-10000000000000000"),
    },
  );
  const actionSwapPtForSy = await actionSwapPTInstance.swapExactPtForSy(
    signers[0].getAddress(),
    await deployedFractleMarket.getAddress(),
    10000000000000000n,
    0,
    res_swapPtForSy.calldata_guessR,
  );
  await actionSwapPtForSy.wait();
  console.log("successfully swap 0.01 pt for sy");

  // swap exact 1 Sy for Pt
  const res_swapSyForPt = await preCalculationSwapPt(
    deployedFractleMarket,
    actionSwapPTInstance,
    deployedYT,
    {
      exactSyIn: BigNumber("1000000000000000000"),
    },
  );
  const actionSwapSyForPt = await actionSwapPTInstance.swapExactSyForPt(
    signers[0].getAddress(),
    await deployedFractleMarket.getAddress(),
    1000000000000000000n,
    0,
    res_swapSyForPt.calldata0,
    res_swapSyForPt.calldata_guessR,
  );
  await actionSwapSyForPt.wait();
  console.log("success swap 0.01 sy for pt");

  //------swap exact 1yt for sy-------------//
  const approvalSwapYtForSy = await deployedYT.approve(
    actionSwapYTInstance.getAddress(),
    ethers.parseEther("1000000000000000000"),
  );
  await approvalSwapYtForSy.wait();
  const res_swapYtForSy = await preCalculationSwapYt(
    deployedFractleMarket,
    actionSwapYTInstance,
    deployedYT,
    { exactYtInForSy: BigNumber("1000000000000000000") },
  );
  const actionSwapYtForSy = await actionSwapYTInstance.swapExactYtForSy(
    signers[0].getAddress(),
    await deployedFractleMarket.getAddress(),
    1000000000000000000n,
    0,
    res_swapYtForSy.calldata_guessR,
  );
  await actionSwapYtForSy.wait();
  console.log("successfully swap 1yt for sy");

  //-----swap exact 0.01sy for yt-------//
  const approvalSyToYt = await FractleWEEthSY.approve(
    actionSwapYTInstance.getAddress(),
    ethers.parseEther("10000000000000000"),
  );
  await approvalSyToYt.wait();
  const res_swapSyForYt = await preCalculationSwapYt(
    deployedFractleMarket,
    actionSwapYTInstance,
    deployedYT,
    { exactSyInForYt: BigNumber("10000000000000000") },
  );
  const actionSwapSyForYt = await actionSwapYTInstance.swapExactSyForYt(
    signers[0].getAddress(),
    await deployedFractleMarket.getAddress(),
    10000000000000000n,
    0,
    res_swapSyForYt.calldata0,
    res_swapSyForYt.calldata_guessR,
  );
  await actionSwapSyForYt.wait();
  console.log("successfully swap 0.01sy for yt");

  //-----swap exact 0.01pt for yt -----//
  const approvalSwapPtToYt = await deployedPT.approve(
    actionSwapYTInstance.getAddress(),
    ethers.parseEther("100000000000"),
  );
  await approvalSwapPtToYt.wait();
  const res_swapPtForYt = await preCalculationSwapYt(
    deployedFractleMarket,
    actionSwapYTInstance,
    deployedYT,
    { exactPtInForYt: BigNumber("10000000000000000") },
  );
  const actionSwapPtForYt = await actionSwapYTInstance.swapExactPtForYt(
    signers[0].getAddress(),
    await deployedFractleMarket.getAddress(),
    10000000000000000n,
    0,
    res_swapPtForYt.calldata0,
    res_swapPtForYt.calldata_guessR,
  );
  await actionSwapPtForYt.wait();
  console.log("successfully swap 0.01pt for yt");

  //--------------swap 1yt for pt--------------//
  const approvalSwapYtForPt = await deployedYT.approve(
    actionSwapYTInstance.getAddress(),
    ethers.parseEther("100000000000"),
  );
  await approvalSwapYtForPt.wait();
  const res_swapYtForPt = await preCalculationSwapYt(
    deployedFractleMarket,
    actionSwapYTInstance,
    deployedYT,
    { exactYtInForPt: BigNumber("1000000000000000000") },
  );
  const actionSwapYtForPt = await actionSwapYTInstance.swapExactYtForPt(
    signers[0].getAddress(),
    await deployedFractleMarket.getAddress(),
    1000000000000000000n,
    0,
    res_swapYtForPt.calldata0,
    res_swapYtForPt.calldata_guessR,
  );
  await actionSwapYtForPt.wait();
  console.log("successfully swap 1yt for pt");

  //---------try remove liquidity-------------//
  const removeLiquidityDual =
    await actionAddRemoveLiqInstance.removeLiquidityDualSyAndPt(
      signers[0].getAddress(),
      deployedFractleMarket,
      100000000000000000000n,
      0,
      0,
    );
  await removeLiquidityDual.wait();
  console.log("successfully remove the liquidity dualSyAndPt");

  // add liquidity single sy 10
  const res_liquidityAdd = await preCalculationLiquidityAddRemoveSingle(
    deployedFractleMarket,
    deployedYT,
    actionAddRemoveLiqInstance,
    {
      addLiquiditySingle: BigNumber("10000000000000000000"),
    },
  );
  const addLiquiditySingle =
    await actionAddRemoveLiqInstance.addLiquiditySingleSy(
      signers[0].getAddress(),
      deployedFractleMarket.getAddress(),
      10000000000000000000n,
      0,
      res_liquidityAdd.calldata0,
      res_liquidityAdd.calldata_guessR,
    );
  await addLiquiditySingle.wait();
  console.log("successfully added the liquidity single sy for 10");

  // remove liquidity single sy 10
  const res_liquidityRemove = await preCalculationLiquidityAddRemoveSingle(
    deployedFractleMarket,
    deployedYT,
    actionAddRemoveLiqInstance,
    {
      removeLiquiditySingle: BigNumber("10000000000000000000"),
    },
  );
  const removeLiquiditySingle =
    await actionAddRemoveLiqInstance.removeLiquiditySingleSy(
      signers[0].getAddress(),
      await deployedFractleMarket.getAddress(),
      10000000000000000000n,
      0,
      res_liquidityRemove.calldata_guessR,
    );
  await removeLiquiditySingle.wait();
  console.log("successfully removed the liquidity single for 10");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

export class PreCalculation_Pt {
  exactSyIn?: BigNumber;
  exactPtIn?: BigNumber;
}

export class PreCalculation_Yt {
  exactSyInForYt?: BigNumber;
  exactYtInForSy?: BigNumber;
  exactPtInForYt?: BigNumber;
  exactYtInForPt?: BigNumber;
}

export class LiquidityAddRemove {
  addLiquiditySingle?: BigNumber;
  removeLiquiditySingle?: BigNumber;
}

async function preCalculationLiquidityAddRemoveSingle(
  deployedFractleMarket: FractleMarketV3 & {
    deploymentTransaction(): ContractTransactionResponse;
  },
  deployedYt: FractleYieldTokenV3 & {
    deploymentTransaction(): ContractTransactionResponse;
  },
  actionAddRemoveLiqInstance: ActionAddRemoveLiq & {
    deploymentTransaction(): ContractTransactionResponse;
  },
  params: LiquidityAddRemove,
) {
  if (params.removeLiquiditySingle && params.addLiquiditySingle) {
    throw new Error("insufficient params");
  }
  const core = new MarketMathCore();
  const state0 = await deployedFractleMarket.readState(
    actionAddRemoveLiqInstance.getAddress(),
  );
  const market0: MarketState = {
    totalPt: BigNumber(state0.totalPt.toString()),
    totalSy: BigNumber(state0.totalSy.toString()),
    totalLp: BigNumber(state0.totalLp.toString()),
    treasury: state0.treasury as `0x${string}`,
    scalarRoot: BigNumber(state0.scalarRoot.toString()),
    expiry: BigNumber(state0.expiry.toString()),
    lifeCircle: BigNumber(state0.lifeCircle.toString()),
    sAPR: BigNumber(state0.sAPR.toString()), //sAPR is 1e18 decimal
    lnFeeRateRoot: BigNumber(state0.lnFeeRateRoot.toString()),
    reserveFeePercent: BigNumber(state0.reserveFeePercent.toString()),
    lastLnImpliedRate: BigNumber(state0.lastLnImpliedRate.toString()),
  };

  const lastGlobalInterestUpdatedDayIndexByOracle =
    await deployedYt.lastGlobalInterestUpdatedDayIndexByOracle(); //so-called blockTime

  const comp0 = core.getMarketPreCompute(
    market0,
    BigNumber("1100000000000000000"),
    market0.sAPR,
    BigNumber(lastGlobalInterestUpdatedDayIndexByOracle.toString()),
  );

  let guess, ptToSwap;
  if (params.addLiquiditySingle) {
    guess = core.calculateAddLiquiditySingleSy(
      market0,
      BigNumber("1100000000000000000"),
      comp0,
      params.addLiquiditySingle,
    );
  } else {
    const resultOfDualRemove = core.calculateRemoveLiquidity(
      market0,
      params.removeLiquiditySingle as BigNumber,
    );
    ptToSwap = resultOfDualRemove.netPtToAccount.negated();
  }

  const estimatedNewImpliedRate = core.estimateNewImpliedRate(
    market0,
    comp0,
    core.calcTrade(
      market0,
      comp0,
      BigNumber("1100000000000000000"),
      params.addLiquiditySingle
        ? (guess?.guessOffchain as BigNumber)
        : (ptToSwap as BigNumber),
    ),
    params.addLiquiditySingle
      ? (guess?.guessOffchain as BigNumber)
      : (ptToSwap as BigNumber),
    BigNumber("1100000000000000000"),
    BigNumber(lastGlobalInterestUpdatedDayIndexByOracle.toString()),
  );
  return {
    calldata0: {
      guessMin: String(guess?.guessMin),
      guessMax: String(guess?.guessMax),
      guessOffchain: String(guess?.guessOffchain),
      maxIteration: String(guess?.maxIteration),
      eps: String(guess?.eps),
    },
    calldata_guessR: {
      guessMin: String(estimatedNewImpliedRate.guessMin),
      guessMax: String(estimatedNewImpliedRate.guessMax),
      guessOffchain: String(estimatedNewImpliedRate.guessOffchain),
      maxIteration: String(estimatedNewImpliedRate.maxIteration),
      eps: String(estimatedNewImpliedRate.eps),
    },
  };
}

async function preCalculationSwapYt(
  deployedFractleMarket: FractleMarketV3 & {
    deploymentTransaction(): ContractTransactionResponse;
  },
  actionSwapYt: ActionSwapYT & {
    deploymentTransaction(): ContractTransactionResponse;
  },
  deployedYt: FractleYieldTokenV3 & {
    deploymentTransaction(): ContractTransactionResponse;
  },
  params: PreCalculation_Yt,
) {
  const core = new MarketMathCore();
  const state0 = await deployedFractleMarket.readState(
    actionSwapYt.getAddress(),
  );
  const market0: MarketState = {
    totalPt: BigNumber(state0.totalPt.toString()),
    totalSy: BigNumber(state0.totalSy.toString()),
    totalLp: BigNumber(state0.totalLp.toString()),
    treasury: state0.treasury as `0x${string}`,
    scalarRoot: BigNumber(state0.scalarRoot.toString()),
    expiry: BigNumber(state0.expiry.toString()),
    lifeCircle: BigNumber(state0.lifeCircle.toString()),
    sAPR: BigNumber(state0.sAPR.toString()), //sAPR is 1e18 decimal
    lnFeeRateRoot: BigNumber(state0.lnFeeRateRoot.toString()),
    reserveFeePercent: BigNumber(state0.reserveFeePercent.toString()),
    lastLnImpliedRate: BigNumber(state0.lastLnImpliedRate.toString()),
  };

  const lastGlobalInterestUpdatedDayIndexByOracle =
    await deployedYt.lastGlobalInterestUpdatedDayIndexByOracle(); //so-called blockTime

  //exact yt in = exact pt out >0
  const comp0 = core.getMarketPreCompute(
    market0,
    BigNumber("1100000000000000000"),
    market0.sAPR,
    BigNumber(lastGlobalInterestUpdatedDayIndexByOracle.toString()),
  );

  let guess, net: any;
  if (params.exactSyInForYt) {
    guess = new MarketMathCore().calculateSwapExactSyForYt(
      market0,
      BigNumber("1100000000000000000"),
      comp0,
      params.exactSyInForYt,
    );
    net = guess.guessOffchain.multipliedBy(-1);
  } else if (params.exactPtInForYt) {
    guess = core.calculateSwapExactPtForYt(
      market0,
      BigNumber("1100000000000000000"),
      comp0,
      params.exactPtInForYt,
    );
    net = guess.guessOffchain.multipliedBy(-1);
  } else if (params.exactYtInForPt) {
    guess = core.calculateSwapExactYtForPt(
      market0,
      BigNumber("1100000000000000000"),
      comp0,
      params.exactYtInForPt,
    );
    net = guess.guessOffchain;
  } else if (params.exactYtInForSy) {
    net = params.exactYtInForSy;
  }

  //estimate new implied rate
  const estimatedNewImpliedRate = core.estimateNewImpliedRate(
    market0,
    comp0,
    core.calcTrade(
      market0,
      comp0,
      BigNumber("1100000000000000000"),
      BigNumber(net),
    ),
    BigNumber(net),
    BigNumber("1100000000000000000"),
    BigNumber(lastGlobalInterestUpdatedDayIndexByOracle.toString()),
  );
  return {
    calldata0: {
      guessMin: String(guess?.guessMin),
      guessMax: String(guess?.guessMax),
      guessOffchain: String(guess?.guessOffchain),
      maxIteration: String(guess?.maxIteration),
      eps: String(guess?.eps),
    },
    calldata_guessR: {
      guessMin: String(estimatedNewImpliedRate.guessMin),
      guessMax: String(estimatedNewImpliedRate.guessMax),
      guessOffchain: String(estimatedNewImpliedRate.guessOffchain),
      maxIteration: String(estimatedNewImpliedRate.maxIteration),
      eps: String(estimatedNewImpliedRate.eps),
    },
  };
}

async function preCalculationSwapPt(
  deployedFractleMarket: FractleMarketV3 & {
    deploymentTransaction(): ContractTransactionResponse;
  },
  actionSwapPt: ActionSwapPT & {
    deploymentTransaction(): ContractTransactionResponse;
  },
  deployedYt: FractleYieldTokenV3 & {
    deploymentTransaction(): ContractTransactionResponse;
  },
  params: PreCalculation_Pt,
) {
  const state0 = await deployedFractleMarket.readState(
    actionSwapPt.getAddress(),
  );
  const market0: MarketState = {
    totalPt: BigNumber(state0.totalPt.toString()),
    totalSy: BigNumber(state0.totalSy.toString()),
    totalLp: BigNumber(state0.totalLp.toString()),
    treasury: state0.treasury as `0x${string}`,
    scalarRoot: BigNumber(state0.scalarRoot.toString()),
    expiry: BigNumber(state0.expiry.toString()),
    lifeCircle: BigNumber(state0.lifeCircle.toString()),
    sAPR: BigNumber(state0.sAPR.toString()), //sAPR is 1e18 decimal
    lnFeeRateRoot: BigNumber(state0.lnFeeRateRoot.toString()),
    reserveFeePercent: BigNumber(state0.reserveFeePercent.toString()),
    lastLnImpliedRate: BigNumber(state0.lastLnImpliedRate.toString()),
  };

  const lastGlobalInterestUpdatedDayIndexByOracle =
    await deployedYt.lastGlobalInterestUpdatedDayIndexByOracle(); //so-called blockTime
  const comp0 = new MarketMathCore().getMarketPreCompute(
    market0,
    BigNumber("1100000000000000000"),
    market0.sAPR,
    //BigNumber(((new Date().getTime()) / 1000).toFixed(0))
    BigNumber(lastGlobalInterestUpdatedDayIndexByOracle.toString()),
  );
  let guessPt: any;
  if (params.exactSyIn && params.exactPtIn) {
    throw new Error("insufficient params");
  }
  if (params.exactSyIn) {
    guessPt = new MarketMathCore().calculateSwapExactSyForPt(
      market0,
      BigNumber("1100000000000000000"),
      comp0,
      params.exactSyIn,
    );
  }
  const estimateNewImpliedRate = new MarketMathCore().estimateNewImpliedRate(
    market0,
    comp0,
    new MarketMathCore().calcTrade(
      market0,
      comp0,
      BigNumber("1100000000000000000"),
      params.exactSyIn
        ? BigNumber(guessPt.guessOffchain)
        : (params.exactPtIn as BigNumber),
    ),
    params.exactSyIn
      ? BigNumber(guessPt.guessOffchain)
      : (params.exactPtIn as BigNumber),
    BigNumber("1100000000000000000"),
    BigNumber(lastGlobalInterestUpdatedDayIndexByOracle.toString()),
  );
  return {
    calldata0: {
      guessMin: String(guessPt?.guessMin),
      guessMax: String(guessPt?.guessMax),
      guessOffchain: String(guessPt?.guessOffchain),
      maxIteration: String(guessPt?.maxIteration),
      eps: String(guessPt?.eps),
    },
    calldata_guessR: {
      guessMin: String(estimateNewImpliedRate.guessMin),
      guessMax: String(estimateNewImpliedRate.guessMax),
      guessOffchain: String(estimateNewImpliedRate.guessOffchain),
      maxIteration: String(estimateNewImpliedRate.maxIteration),
      eps: String(estimateNewImpliedRate.eps),
    },
  };
}

async function mineBlocks(signer: Signer, n: number) {
  for (let i = 0; i < n; i++) {
    const res = await signer.sendTransaction({
      to: ZeroAddress,
      value: 1,
      data: "0x",
    });
    console.log("mining block... ", n);
    await res.wait();
  }
}
