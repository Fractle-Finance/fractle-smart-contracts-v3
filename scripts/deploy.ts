import { ethers, network } from "hardhat";
import { MarketMathCore, MarketState } from "./calculation";
import {
  ContractTransactionResponse,
  Signer,
  toBigInt,
  ZeroAddress,
} from "ethers";
import BigNumber from "bignumber.js";
import {
  ActionAddRemoveLiq,
  ActionSwapPT,
  ActionSwapYT,
  FractleMarketV3,
  FractleYieldTokenV3,
} from "../typechain-types";
import { delay } from "@nomiclabs/hardhat-etherscan/dist/src/etherscan/EtherscanService";

async function main() {
  console.log("detected network " + network.name);
  const signers = await ethers.getSigners();

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

  // Step0: deploy the STETH
  const _STETH = await ethers.getContractFactory("STETHMock");
  const STETH = await _STETH.deploy(
    ZeroAddress,
    await actionMintRedeemInstance.getAddress(),
  );
  await STETH.deploymentTransaction()?.wait();
  console.log("STETH deployed at: " + (await STETH.getAddress()));
  // step1: deploy the SY, in this case we deploy the FractleEUSDSY.sol
  const _FractleSTETHSY = await ethers.getContractFactory("FractleSTETHSY");
  const FractleSTETHSY = await _FractleSTETHSY.deploy(
    "STETHSY",
    "STETHSY",
    await STETH.getAddress(),
  );
  await FractleSTETHSY.deploymentTransaction()?.wait();
  console.log("SY deployed at: " + (await FractleSTETHSY.getAddress()));

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
    await STETH.getAddress(),
  );
  await initializationTx.wait();

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
    await STETH.getAddress(),
    ethers.parseEther(String(0.000999500333083533)),
    80,
    // external rewards distributor, don't need to set it currently.
    await STETH.getAddress(),
  );
  await initializeFractleMarket.wait();

  // we have to deploy the market manually.
  const _FractleMarket = await ethers.getContractFactory("FractleMarketV3", {
    libraries: {
      OracleLib: await OracleLib.getAddress(),
    },
  });

  // begin to deployPT and YT
  const ptToDeploy = await ethers.getContractFactory("FractlePrincipalTokenV3");
  const deployedPT = await ptToDeploy.deploy(
    await FractleSTETHSY.getAddress(),
    "EUSD1739145600",
    "EUSD1739145600",
    18,
    1739145600,
  ); //1739145600 is 20250208
  await deployedPT.deploymentTransaction()?.wait();
  console.log("successfully deployed pt at", await deployedPT.getAddress());

  const _externalRewardDistributor = await ethers.getContractFactory(
    "FractleExternalRewardDistributor",
  );
  const externalRewardsDistributor = await _externalRewardDistributor.deploy(
    await FractleMarketFactoryV3.getAddress(),
    "ExternalRewards",
    "ER",
    18,
  );
  await externalRewardsDistributor.deploymentTransaction()?.wait();
  console.log(
    "externalRewardDistributor deployed at: " +
      (await externalRewardsDistributor.getAddress()),
  );

  // then we deploy the YT
  const ytToDeploy = await ethers.getContractFactory("FractleYieldTokenV3");
  const deployedYT = await ytToDeploy.deploy(
    await FractleSTETHSY.getAddress(), //SY
    await deployedPT.getAddress(), //PT
    await FractleYieldTokenFactoryV3.getAddress(), //factory
    "EUSD1739145600YT", //name
    "EUSD1739145600YT", //symbol
    18, //decimal
    1739145600, //expiry
    ethers.parseEther(String(0.02)), //sapr 2%
    365, //lifeCircle
    false,
    // external reward distributor
    await externalRewardsDistributor.getAddress(),
    // market factory
    await FractleMarketFactoryV3.getAddress(),
  );
  await deployedYT.deploymentTransaction()?.wait();
  console.log("successfully deployed yt", await deployedYT.getAddress());

  // the use the YT to initialize the PT.
  const initializationTxPTYT = await FractleYieldTokenFactoryV3.initializePTYT(
    await FractleSTETHSY.getAddress(),
    await deployedPT.getAddress(),
    await deployedYT.getAddress(),
    1739145600,
  );
  await initializationTxPTYT.wait();

  const deployedFractleMarket = await _FractleMarket.deploy(
    await deployedPT.getAddress(),
    ethers.parseEther(String(76.56895)),
    ethers.parseEther(String(1.04573897412)), //1.04573897412,absolutely 1 year round
    await STETH.getAddress(),
    // external distributor,
    await externalRewardsDistributor.getAddress(),
    await FractleMarketFactoryV3.getAddress(),
  );
  await deployedFractleMarket.deploymentTransaction()?.wait();
  console.log(
    "market deployed at :" + (await deployedFractleMarket.getAddress()),
  );

  // we can check if yt and sy address are stored in the pt address sucessfully.
  const syAddressFromPt = await deployedPT.SY();
  const ytAddressFromPt = await deployedPT.YT();
  console.log("sy address from pt: " + syAddressFromPt);
  console.log("yt address from pt: " + ytAddressFromPt);

  const ytContract = await ethers.getContractFactory("FractleYieldTokenV3");
  const yt = ytContract.attach(await deployedYT.getAddress());
  console.log(await yt.isExpired());

  const createMarket = await FractleMarketFactoryV3.createNewMarket(
    await deployedPT.getAddress(),
    await deployedFractleMarket.getAddress(),
    ethers.parseEther(String(76.56895)),
    ethers.parseEther(String(1.04573897412)),
  );
  await createMarket.wait();

  // // then we begin to deploy actions
  // const actionInfoStatic = await ethers.getContractFactory("ActionInfoStatic");
  // const actionInfoStaticInstance = await actionInfoStatic.deploy();
  // console.log(
  //   "actionInfoStatic deployed at: " +
  //     (await actionInfoStaticInstance.getAddress()),
  // );
  //
  // const actionMarketAuxStatic = await ethers.getContractFactory(
  //   "ActionMarketAuxStatic",
  // );
  // const actionMarketAuxStaticInstance = await actionMarketAuxStatic.deploy();
  // console.log(
  //   "auctionMarketStatic deployed at: " +
  //     (await actionMarketAuxStaticInstance.getAddress()),
  // );
  //
  // const actionMarketCoreStatic = await ethers.getContractFactory(
  //   "ActionMarketCoreStatic",
  // );
  // const actionMarketCoreStaticInstance = await actionMarketCoreStatic.deploy();
  // console.log(
  //   "actionMarketCoreStatic deployed at: " +
  //     (await actionMarketCoreStaticInstance.getAddress()),
  // );
  //
  // const actionMintRedeemStatic = await ethers.getContractFactory(
  //   "ActionMintRedeemStatic",
  // );
  // const actionMintRedeemStaticInstance = await actionMintRedeemStatic.deploy();
  // console.log(
  //   "auctionMintRedeemStatic deployed at: " +
  //     (await actionMintRedeemStaticInstance.getAddress()),
  // );
  //
  // const actionStorageStatic = await ethers.getContractFactory(
  //   "ActionStorageStatic",
  // );
  // const actionStorageStaticInstance = await actionStorageStatic.deploy();
  // console.log(
  //   "actionStorageStatic deployed at: " +
  //     (await actionStorageStaticInstance.getAddress()),
  // );

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

  const approval1 = await STETH.approve(
    await FractleSTETHSY.getAddress(),
    ethers.parseEther("1000000000000000000000000000000000"),
  );
  await approval1.wait();
  const approval2 = await STETH.approve(
    await actionMintRedeemInstance.getAddress(),
    ethers.parseEther("10000000000000000000000000000"),
  );
  await approval2.wait();

  const signer = signers[0];
  const mintedToken = await STETH.mintAndWrap(
    await FractleSTETHSY.getAddress(),
    signer.getAddress(),
  );

  await mintedToken.wait();
  console.log(
    "successfully minted sy from stETH",
    await FractleSTETHSY.balanceOf(signers[0].getAddress()),
  );

  const balance = await FractleSTETHSY.balanceOf(signers[0].getAddress());
  /**
   * @notice Tokenize SY into PT + YT of equal qty. Every unit of asset of SY will create 1 PT + 1 YT
   * @dev SY must be transferred to this contract prior to calling
   */
  const transfer = await FractleSTETHSY.transfer(
    await deployedYT.getAddress(),
    balance / BigInt(5),
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

  // dyt case
  console.log(
    "SY balance before initial mint :" +
      (await FractleSTETHSY.balanceOf(signers[0].getAddress())),
  );

  await STETH.changeTotalSupply(10001);

  // now we can claim dyt tokens
  await actionMintRedeemInstance.redeemDueInterestAndRewards(
    await signers[0].getAddress(),
    [],
    [await deployedYT.getAddress()],
    [await deployedFractleMarket.getAddress()],
  );
  console.log(
    "SY balance after claim yt rewards:" +
      (await FractleSTETHSY.balanceOf(signers[0].getAddress())),
  );

  await STETH.changeTotalSupply(10001);

  // now we can claim fpt tokens
  await actionMintRedeemInstance.redeemFPTRewards(
    await signers[0].getAddress(),
    [await deployedPT.getAddress()],
  );
  console.log(
    "SY balance after claim fpt rewards:" +
      (await FractleSTETHSY.balanceOf(signers[0].getAddress())),
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
  const approvalEUSDSYtoPool = await FractleSTETHSY.approve(
    await actionAddRemoveLiqInstance.getAddress(),
    ethers.parseEther("100000000000"),
  );
  await approvalEUSDSYtoPool.wait();
  const approvalPTtoMarket = await deployedPT.approve(
    await deployedFractleMarket.getAddress(),
    ethers.parseEther("100000000000"),
  );
  await approvalPTtoMarket.wait();
  const approvalEUSDSYtoMarket = await FractleSTETHSY.approve(
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
  console.log((balance / BigInt(5)) * BigInt(3));
  console.log(balance / BigInt(5));
  console.log("begin add liquidity");
  const addLiquidity = await actionAddRemoveLiqInstance.addLiquidityDualSyAndPt(
    signers[0].getAddress(),
    await deployedFractleMarket.getAddress(),
    (balance / BigInt(5)) * BigInt(3),
    balance / BigInt(5),
    0,
    calldata00,
  );
  console.log("end addliquidity");
  await addLiquidity.wait();

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
  const approvalSY = await FractleSTETHSY.approve(
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

  // swap exact 0.01 Sy for Pt
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
  // no need to approx in fractle version but need to estimate new r now
  await deployedYT.approve(
    actionSwapYTInstance.getAddress(),
    ethers.parseEther("1000000000000000000"),
  );

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
  await FractleSTETHSY.approve(
    actionSwapYTInstance.getAddress(),
    ethers.parseEther("1000000000000000000"),
  );
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
  await deployedPT.approve(
    actionSwapYTInstance.getAddress(),
    ethers.parseEther("100000000000"),
  );
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
  await deployedYT.approve(
    actionSwapYTInstance.getAddress(),
    ethers.parseEther("100000000000"),
  );
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
    await delay(100);
    await res.wait();
  }
}
