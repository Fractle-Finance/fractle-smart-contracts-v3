import {network} from 'hardhat';
import {MarketMathCore, MarketState} from "./calculation";
import {ethers} from "hardhat";
import {ZeroAddress} from "ethers";
import BigNumber from "bignumber.js";

async function main() {
    console.log('detected network ' + network.name);
    const signers = await ethers.getSigners();

    // step0: deploy the EUSD
    const _EUSD = await ethers.getContractFactory(
        'EUSDMock',
    );
    const EUSD = await _EUSD.deploy(
       ZeroAddress,
    );
    console.log("EUSD deployed at: " + await EUSD.getAddress());

    // step1: deploy the SY, in this case we deploy the EuphratesEUSDSY.sol
    const _EuphratesEUSDSY = await ethers.getContractFactory(
        'EuphratesEUSDSY',
    );
    const EuphratesEUSDSY = await _EuphratesEUSDSY.deploy(
        'EUSDSY',
        'EUSDSY',
        await EUSD.getAddress(),
    );
    console.log("SY deployed at: " + await EuphratesEUSDSY.getAddress());

    // deploy oracleLib
    const OracleLib = await ethers.getContractFactory("OracleLib");
    const oracleLib = await OracleLib.deploy();
    console.log("OracleLib deployed to:",await oracleLib.getAddress());

    const _EuphratesYieldTokenFactoryV2 = await ethers.getContractFactory("EuphratesYieldContractFactoryV2");
    const EuphratesYieldTokenFactoryV2 = await _EuphratesYieldTokenFactoryV2.deploy();

    console.log("yield token factory deployed at: " + await EuphratesYieldTokenFactoryV2.getAddress());
    // now we initialize the factory
    await EuphratesYieldTokenFactoryV2.initialize(
        // a day
        86400,
        // 6%
        ethers.parseEther(String(0.06)),
        // 2%
        ethers.parseEther(String(0.02)),
        // treasury
        await EUSD.getAddress()
    );

    // begin to deployPT and YT
    const ptToDeploy = await ethers.getContractFactory("EuphratesPrincipalTokenV2");
    const deployedPT = await ptToDeploy.deploy(
        await EuphratesEUSDSY.getAddress(),
        "EUSD1735689600",
        "EUSD1735689600",
        18,
        1735689600
    );//1735689600
    console.log("successfully deployed pt", await deployedPT.getAddress());

    // then we deploy the YT
    const ytToDeploy = await ethers.getContractFactory("EuphratesYieldTokenV2");
    const deployedYT = await ytToDeploy.deploy(
        await EuphratesEUSDSY.getAddress(),
        await deployedPT.getAddress(),
        await EuphratesYieldTokenFactoryV2.getAddress(),
        "EUSD1735689600YT",
        "EUSD1735689600YT",
        18,
        1735689600,
        false
    );
    console.log("successfully deployed yt",await deployedYT.getAddress());

    // the use the YT to initialize the PT.
    await EuphratesYieldTokenFactoryV2.initializePTYT(
        await EuphratesEUSDSY.getAddress(),
        await deployedPT.getAddress(),
        await deployedYT.getAddress(),
        1735689600
    );

    // we can check if yt and sy address are stored in the pt address sucessfully.
    const syAddressFromPt = await deployedPT.SY();
    const ytAddressFromPt = await deployedPT.YT();
    console.log("sy address from pt: " + syAddressFromPt);
    console.log("yt address from pt: " + ytAddressFromPt);

    const ytContract = await ethers.getContractFactory("EuphratesYieldTokenV2");
    const yt = ytContract.attach(await deployedYT.getAddress());
    console.log(await yt.isExpired());

    // we deploy and initialize the marketFactory.
    const _EuphratesMarketFactoryV2 = await ethers.getContractFactory("EuphratesMarketFactoryV2");
    const EuphratesMarketFactoryV2 = await _EuphratesMarketFactoryV2.deploy(
        await EuphratesYieldTokenFactoryV2.getAddress(),
    );
    console.log("market factory deployed at: " + await EuphratesMarketFactoryV2.getAddress());
    // now we initialize the factory
    await EuphratesMarketFactoryV2.initialize(
        await EUSD.getAddress(),
        ethers.parseEther(String(0.000999500333083533)),
        80,
        // external rewards distributor, don't need to set it currently.
        await EUSD.getAddress()
    );

    // we have to deploy the market manually.
    const _EuphratesMarket = await ethers.getContractFactory("EuphratesMarketV2", {
        libraries: {
            OracleLib: await oracleLib.getAddress()
        }
    });

    const deployedEuphratesMarket = await _EuphratesMarket.deploy(
        await deployedPT.getAddress(),
        ethers.parseEther(String(76.56895)),
        ethers.parseEther(String(1.104003)),
        await EUSD.getAddress(),
        await EUSD.getAddress(),
        await EuphratesMarketFactoryV2.getAddress()
    );

    console.log("market deployed at" +await deployedEuphratesMarket.getAddress());

    const deployedMarket = await EuphratesMarketFactoryV2.createNewMarket(
        await deployedPT.getAddress(),
        await deployedEuphratesMarket.getAddress(),
        ethers.parseEther(String(76.56895)),
        ethers.parseEther(String(1.104003)),
    );

    // then we begin to deploy actions
    const actionInfoStatic = await ethers.getContractFactory("ActionInfoStatic");
    const actionInfoStaticInstance = await actionInfoStatic.deploy();
    console.log("actionInfoStatic deployed at: " + await actionInfoStaticInstance.getAddress());

    const actionMarketAuxStatic = await ethers.getContractFactory("ActionMarketAuxStatic");
    const actionMarketAuxStaticInstance = await actionMarketAuxStatic.deploy();
    console.log("auctionMarketStatic deployed at: " + await actionMarketAuxStaticInstance.getAddress());

    const actionMarketCoreStatic =  await ethers.getContractFactory("ActionMarketCoreStatic");
    const actionMarketCoreStaticInstance = await actionMarketCoreStatic.deploy();
    console.log("actionMarketCoreStatic deployed at: " + await actionMarketCoreStaticInstance.getAddress());

    const actionMintRedeemStatic = await ethers.getContractFactory("ActionMintRedeemStatic");
    const actionMintRedeemStaticInstance = await actionMintRedeemStatic.deploy();
    console.log("auctionMintRedeemStatic deployed at: " + await actionMintRedeemStaticInstance.getAddress());

    const actionStorageStatic = await ethers.getContractFactory("ActionStorageStatic");
    const actionStorageStaticInstance = await actionStorageStatic.deploy();
    console.log("actionStorageStatic deployed at: " + await actionStorageStaticInstance.getAddress());

    const actionAddRemoveLiq = await ethers.getContractFactory("ActionAddRemoveLiq");
    const actionAddRemoveLiqInstance = await actionAddRemoveLiq.deploy();
    console.log("actionAddRemoveLiq deployed at: " + await actionAddRemoveLiqInstance.getAddress());

    const actionMintRedeem = await ethers.getContractFactory("ActionMintRedeem");
    const actionMintRedeemInstance = await actionMintRedeem.deploy();
    console.log("actionMintRedeem deployed at: " + await actionMintRedeemInstance.getAddress());

    const actionMisc = await ethers.getContractFactory("ActionMisc");
    const actionMiscInstance = await actionMisc.deploy();
    console.log("actionMisc deployed at: " + await actionMiscInstance.getAddress());

    const actionSwapPT = await ethers.getContractFactory("ActionSwapPT");
    const actionSwapPTInstance = await actionSwapPT.deploy();
    console.log("actionSwapPT deployed at: " + await actionSwapPTInstance.getAddress());

    const addressProvider = await ethers.getContractFactory("AddressProvider");
    const addressProviderInstance = await addressProvider.deploy();
    console.log("addressProvider deployed at: " + await addressProviderInstance.getAddress());

    // set market factory
    await addressProviderInstance.initialize();
    await addressProviderInstance.set(10086,await EuphratesMarketFactoryV2.getAddress());

    const actionSwapYT = await ethers.getContractFactory("ActionSwapYT");
    const actionSwapYTInstance = await actionSwapYT.deploy(await addressProviderInstance.getAddress(),10086);
    console.log("actionSwapYT deployed at: " + await actionSwapYTInstance.getAddress());

    await EUSD.approve(await EuphratesEUSDSY.getAddress(), ethers.parseEther("1000000000000000000000000000000000"));
    console.log(await actionMintRedeemInstance.getAddress());
    console.log(await EuphratesEUSDSY.getAddress());
    await EUSD.approve(await actionMintRedeemInstance.getAddress(), ethers.parseEther("10000000000000000000000000000"));
    const swapData = {
        swapType: 0,
        extRouter: ZeroAddress,
        extCalldata: ethers.AbiCoder.defaultAbiCoder().encode(["address"], [ZeroAddress]),
        needScale:false
    }
    // first of all, we have to mint sy from token.
    const input = {
        tokenIn: await EUSD.getAddress(),
        netTokenIn: 1000000,
        tokenMintSy:await EUSD.getAddress(),
        bulk: ZeroAddress,
        euphratesSwap: await deployedEuphratesMarket.getAddress(),
        swapData: swapData
    }
    const mintedToken = await actionMintRedeemInstance.mintSyFromToken(signers[0].getAddress(),await EuphratesEUSDSY.getAddress(), 0, input);
    console.log(await EuphratesEUSDSY.balanceOf(signers[0].getAddress()));

    /**
     * @notice Tokenize SY into PT + YT of equal qty. Every unit of asset of SY will create 1 PT + 1 YT
     * @dev SY must be transferred to this contract prior to calling
     * 要先把SY转到合约中，然后再mintPTYT，否则出错。
     */
    await EuphratesEUSDSY.transfer(await deployedYT.getAddress(), 100000);

    // begin to mint ptyt
    await deployedYT.mintPY(signers[0].getAddress(), signers[0].getAddress());
    console.log(await deployedYT.balanceOf(signers[0].getAddress()));
    console.log(await deployedPT.balanceOf(signers[0].getAddress()));

    // read state
    const market_instance = await ethers.getContractFactory("EuphratesMarketV2", {
        libraries: {
            OracleLib: await oracleLib.getAddress()
        }
    });
    const deployedMarketV2 = market_instance.attach(await deployedEuphratesMarket.getAddress());
    console.log(await deployedMarketV2.isExpired());

    // now we can begin to add liquidity
    //     /**
    //      * @notice Adds liquidity to the SY/PT market, granting LP tokens in return
    //      * @dev Will mint as much LP as possible given no more than `netSyDesired` and `netPtDesired`,
    //      * while not changing the market's price
    //      * @dev Only the necessary SY/PT amount will be transferred
    //      * @dev Reverts if market is expired
    //      */
    //     function addLiquidityDualSyAndPt(
    //         address receiver,
    //         address market,
    //         uint256 netSyDesired,
    //         uint256 netPtDesired,
    //         uint256 minLpOut
    //     )
    console.log("actionAddRemoveLiqInstanceAddress",await actionAddRemoveLiqInstance.getAddress());

    console.log("deployedPTAddress", await deployedPT.getAddress());

    await deployedPT.approve(await actionAddRemoveLiqInstance.getAddress(), ethers.parseEther("100000000000000000"));
    await EuphratesEUSDSY.approve(await actionAddRemoveLiqInstance.getAddress(), ethers.parseEther("10000000000000000000"));
    await deployedPT.approve(await deployedEuphratesMarket.getAddress(), ethers.parseEther("100000000000000000"));
    await EuphratesEUSDSY.approve(await deployedEuphratesMarket.getAddress(), ethers.parseEther("10000000000000000000"));

    await actionAddRemoveLiqInstance.addLiquidityDualSyAndPt(
        signers[0].getAddress(),
        await deployedEuphratesMarket.getAddress(),
        300000,
        100000,
        0
    )

    // how much lp do we have? // 16230
    console.log(await deployedEuphratesMarket.balanceOf(signers[0].getAddress()));
    await deployedEuphratesMarket.approve(await actionAddRemoveLiqInstance.getAddress(), ethers.parseEther("100000000"));

   //部署合约时暂不进行如下操作 20240102

//    // swap exact sy 100 for pt
//    await EuphratesEUSDSY.approve(actionSwapPTInstance.getAddress(),ethers.parseEther("100000000000"));
//    const state0 = await deployedEuphratesMarket.readState(actionSwapPTInstance.getAddress());

//     console.log(state0);
//     const market0: MarketState = {
//         totalPt: BigNumber(state0.totalPt.toString()),
//         totalSy: BigNumber(state0.totalSy.toString()),
//         totalLp: BigNumber(state0.totalLp.toString()),
//         treasury: state0.treasury as `0x${string}`,
//         scalarRoot: BigNumber(state0.scalarRoot.toString()),
//         expiry: BigNumber(state0.expiry.toString()),
//         lnFeeRateRoot: BigNumber(state0.lnFeeRateRoot.toString()),
//         reserveFeePercent: BigNumber(state0.reserveFeePercent.toString()),
//         lastLnImpliedRate: BigNumber(state0.lastLnImpliedRate.toString()),
//     };

//     const sm0 = new MarketMathCore();
//     const comp0 = sm0.getMarketPreCompute(
//         market0,
//         BigNumber("1100000000000000000"),
//         BigNumber(((new Date().getTime()) / 1000).toFixed(0))
//     )

//     const r0 = sm0.calculateSwapExactSyForPt(
//         market0,
//         BigNumber("1100000000000000000"),
//         comp0,
//         BigNumber("100"),
//     );


//     const beforeSwapSY0 = await EuphratesEUSDSY.balanceOf(signers[0].getAddress());
//     console.log("before swap sy: " + beforeSwapSY0);
//     const beforeSwapPt0 = await deployedPT.balanceOf(signers[0].getAddress());
//     console.log("before swap pt: " + beforeSwapPt0);

//     const calldata0 = {
//         guessMin: String(r0.guessMin),
//         guessMax: String(r0.guessMax),
//         guessOffchain: String(r0.guessOffchain),
//         maxIteration: String(r0.maxIteration),
//         eps: String(r0.eps)
//     };
//     console.log("max:" + calldata0.guessMax + "min:" + calldata0.guessMin + "off:" + calldata0.guessOffchain);
//     await actionSwapPTInstance.swapExactSyForPt(signers[0].getAddress(), await deployedEuphratesMarket.getAddress(), 100, 0, calldata0);

//     const afterSwapSY0 = await EuphratesEUSDSY.balanceOf(signers[0].getAddress());
//     console.log("after swap sy: " + afterSwapSY0);
//     const afterSwapPt0 = await deployedPT.balanceOf(signers[0].getAddress());
//     console.log("before swap pt: " + afterSwapPt0);
// //-----------------------------------------//

// //-----swap exact 100 sy for yt-------//
//    await EuphratesEUSDSY.approve(actionSwapYTInstance.getAddress(),ethers.parseEther("100000000000"));
//    const state0 = await deployedEuphratesMarket.readState(actionSwapYTInstance.getAddress());

//     console.log(state0);
//     const market0: MarketState = {
//         totalPt: BigNumber(state0.totalPt.toString()),
//         totalSy: BigNumber(state0.totalSy.toString()),
//         totalLp: BigNumber(state0.totalLp.toString()),
//         treasury: state0.treasury as `0x${string}`,
//         scalarRoot: BigNumber(state0.scalarRoot.toString()),
//         expiry: BigNumber(state0.expiry.toString()),
//         lnFeeRateRoot: BigNumber(state0.lnFeeRateRoot.toString()),
//         reserveFeePercent: BigNumber(state0.reserveFeePercent.toString()),
//         lastLnImpliedRate: BigNumber(state0.lastLnImpliedRate.toString()),
//     };

//     const sm0 = new MarketMathCore();
//     const comp0 = sm0.getMarketPreCompute(
//         market0,
//         BigNumber("1100000000000000000"),
//         BigNumber(((new Date().getTime()) / 1000).toFixed(0))
//     )

//     const r0 = sm0.calculateSwapExactSyForYt(
//         market0,
//         BigNumber("1100000000000000000"),
//         comp0,
//         BigNumber("100"),
//     );


//     const beforeSwapSY0 = await EuphratesEUSDSY.balanceOf(signers[0].getAddress());
//     console.log("before swap sy: " + beforeSwapSY0);
//     const beforeSwapYt0 = await deployedYT.balanceOf(signers[0].getAddress());
//     console.log("before swap yt: " + beforeSwapYt0);

//     const calldata0 = {
//         guessMin: String(r0.guessMin),
//         guessMax: String(r0.guessMax),
//         guessOffchain: String(r0.guessOffchain),
//         maxIteration: String(r0.maxIteration),
//         eps: String(r0.eps)
//     };
//     console.log("max:" + calldata0.guessMax + ",min:" + calldata0.guessMin + ",off:" + calldata0.guessOffchain);
//     await actionSwapYTInstance.swapExactSyForYt(signers[0].getAddress(), await deployedEuphratesMarket.getAddress(), 100, 0, calldata0);

//     const afterSwapSY0 = await EuphratesEUSDSY.balanceOf(signers[0].getAddress());
//     console.log("after swap sy: " + afterSwapSY0);
//     const afterSwapYt0 = await deployedYT.balanceOf(signers[0].getAddress());
//     console.log("after swap yt: " + afterSwapYt0);
// //-----------------------------------------//


// //-----swap exact 100 pt for yt -----//
// await deployedPT.approve(actionSwapYTInstance.getAddress(),ethers.parseEther("100000000000"));
// const state0 = await deployedEuphratesMarket.readState(actionSwapYTInstance.getAddress());

//  console.log(state0);
//  const market0: MarketState = {
//      totalPt: BigNumber(state0.totalPt.toString()),
//      totalSy: BigNumber(state0.totalSy.toString()),
//      totalLp: BigNumber(state0.totalLp.toString()),
//      treasury: state0.treasury as `0x${string}`,
//      scalarRoot: BigNumber(state0.scalarRoot.toString()),
//      expiry: BigNumber(state0.expiry.toString()),
//      lnFeeRateRoot: BigNumber(state0.lnFeeRateRoot.toString()),
//      reserveFeePercent: BigNumber(state0.reserveFeePercent.toString()),
//      lastLnImpliedRate: BigNumber(state0.lastLnImpliedRate.toString()),
//  };

//  const sm0 = new MarketMathCore();
//  const comp0 = sm0.getMarketPreCompute(
//      market0,
//      BigNumber("1100000000000000000"),
//      BigNumber(((new Date().getTime()) / 1000).toFixed(0))
//  )

//  const r0 = sm0.calculateSwapExactPtForYt(
//      market0,
//      BigNumber("1100000000000000000"),
//      comp0,
//      BigNumber("100"),
//  );


//  const beforeSwapPt0 = await deployedPT.balanceOf(signers[0].getAddress());
//  console.log("before swap pt: " + beforeSwapPt0);
//  const beforeSwapYt0 = await deployedYT.balanceOf(signers[0].getAddress());
//  console.log("before swap yt: " + beforeSwapYt0);

//  const calldata0 = {
//      guessMin: String(r0.guessMin),
//      guessMax: String(r0.guessMax),
//      guessOffchain: String(r0.guessOffchain),
//      maxIteration: String(r0.maxIteration),
//      eps: String(r0.eps)
//  };
//  console.log("max:" + calldata0.guessMax + ",min:" + calldata0.guessMin + ",off:" + calldata0.guessOffchain);
//  await actionSwapYTInstance.swapExactPtForYt(signers[0].getAddress(), await deployedEuphratesMarket.getAddress(), 100, 0, calldata0);

//  const afterSwapPt0 = await deployedPT.balanceOf(signers[0].getAddress());
//  console.log("after swap pt: " + afterSwapPt0);
//  const afterSwapYt0 = await deployedYT.balanceOf(signers[0].getAddress());
//  console.log("after swap yt: " + afterSwapYt0);
// //-----------------------------------------//


// //----swap 1000 yt for pt----//
// await deployedYT.approve(actionSwapYTInstance.getAddress(),ethers.parseEther("100000000000"));
// const state0 = await deployedEuphratesMarket.readState(actionSwapYTInstance.getAddress());

//  console.log(state0);
//  const market0: MarketState = {
//      totalPt: BigNumber(state0.totalPt.toString()),
//      totalSy: BigNumber(state0.totalSy.toString()),
//      totalLp: BigNumber(state0.totalLp.toString()),
//      treasury: state0.treasury as `0x${string}`,
//      scalarRoot: BigNumber(state0.scalarRoot.toString()),
//      expiry: BigNumber(state0.expiry.toString()),
//      lnFeeRateRoot: BigNumber(state0.lnFeeRateRoot.toString()),
//      reserveFeePercent: BigNumber(state0.reserveFeePercent.toString()),
//      lastLnImpliedRate: BigNumber(state0.lastLnImpliedRate.toString()),
//  };

//  const sm0 = new MarketMathCore();
//  const comp0 = sm0.getMarketPreCompute(
//      market0,
//      BigNumber("1100000000000000000"),
//      BigNumber(((new Date().getTime()) / 1000).toFixed(0))
//  )

//  const r0 = sm0.calculateSwapExactYtForPt(
//      market0,
//      BigNumber("1100000000000000000"),
//      comp0,
//      BigNumber("1000"),
//  );


//  const beforeSwapPt0 = await deployedPT.balanceOf(signers[0].getAddress());
//  console.log("before swap pt: " + beforeSwapPt0);
//  const beforeSwapYt0 = await deployedYT.balanceOf(signers[0].getAddress());
//  console.log("before swap yt: " + beforeSwapYt0);

//  const calldata0 = {
//      guessMin: String(r0.guessMin),
//      guessMax: String(r0.guessMax),
//      guessOffchain: String(r0.guessOffchain),
//      maxIteration: String(r0.maxIteration),
//      eps: String(r0.eps)
//  };
//  console.log("max:" + calldata0.guessMax + ",min:" + calldata0.guessMin + ",off:" + calldata0.guessOffchain);
//  await actionSwapYTInstance.swapExactYtForPt(signers[0].getAddress(), await deployedEuphratesMarket.getAddress(), 1000, 0, calldata0);

//  const afterSwapPt0 = await deployedPT.balanceOf(signers[0].getAddress());
//  console.log("after swap pt: " + afterSwapPt0);
//  const afterSwapYt0 = await deployedYT.balanceOf(signers[0].getAddress());
//  console.log("after swap yt: " + afterSwapYt0);
// //-------------------//


//    //---------try remove liquidity-------------//
//    await actionAddRemoveLiqInstance.removeLiquiditySingleSy(signers[0].getAddress(), deployedEuphratesMarket.getAddress(), 10000, 0);
//    console.log(await deployedEuphratesMarket.balanceOf(signers[0].getAddress()));

//     console.log("my yt balance, sy balance");
//     console.log(await deployedYT.balanceOf(signers[0].getAddress()), await EuphratesEUSDSY.balanceOf(signers[0].getAddress()));
//     await deployedYT.approve(actionSwapYTInstance.getAddress(), ethers.parseEther("100000000000"));
//     await actionSwapYTInstance.swapExactYtForSy(signers[0].getAddress(), deployedEuphratesMarket.getAddress(), 1000, 0);
//     console.log("after swapping, my yt balance, sy balance");
//     console.log(await deployedYT.balanceOf(signers[0].getAddress()), await EuphratesEUSDSY.balanceOf(signers[0].getAddress()));

//     // redeemPYToToken
//     // approve YT
//     await deployedPT.approve(actionMintRedeemInstance.getAddress(), ethers.parseEther("100000000000"));
//     await deployedYT.approve(actionMintRedeemInstance.getAddress(), ethers.parseEther("100000000000"));
//     console.log(await EUSD.balanceOf(signers[0].getAddress()));
//     await actionMintRedeemInstance.redeemPyToToken(signers[0].getAddress(), deployedYT.getAddress(), 30, EUSD.getAddress());
//     console.log(await EUSD.balanceOf(signers[0].getAddress()));

//     //swap exact sy for yt
//     const state = await deployedEuphratesMarket.readState(actionSwapYTInstance.getAddress());

//     console.log(state);
//     const market: MarketState = {
//         totalPt: BigNumber(state.totalPt.toString()),
//         totalSy: BigNumber(state.totalSy.toString()),
//         totalLp: BigNumber(state.totalLp.toString()),
//         treasury: state.treasury as `0x${string}`,
//         scalarRoot: BigNumber(state.scalarRoot.toString()),
//         expiry: BigNumber(state.expiry.toString()),
//         lnFeeRateRoot: BigNumber(state.lnFeeRateRoot.toString()),
//         reserveFeePercent: BigNumber(state.reserveFeePercent.toString()),
//         lastLnImpliedRate: BigNumber(state.lastLnImpliedRate.toString()),
//     };

//     const sm = new MarketMathCore();
//     const comp = sm.getMarketPreCompute(
//         market,
//         BigNumber("1100000000000000000"),
//         BigNumber(((new Date().getTime()) / 1000).toFixed(0))
//     )

//     const r = sm.calculateSwapExactSyForYt(
//         market,
//         BigNumber("1100000000000000000"),
//         comp,
//         BigNumber("100"),
//     );

//     // const s = sm.calculateAddLiquiditySignleSy(
//     //     market,
//     //     BigNumber("1100000000000000000"),
//     //     comp,
//     //     BigNumber("120"),
//     // );

//     const beforeSwapSY = await EuphratesEUSDSY.balanceOf(signers[0].getAddress());
//     console.log("before swap sy: " + beforeSwapSY);
//     const beforeSwapYt = await deployedYT.balanceOf(signers[0].getAddress());
//     console.log("before swap yt: " + beforeSwapYt);

//     await EuphratesEUSDSY.approve(actionSwapYTInstance.getAddress(), ethers.parseEther("100000000000"));
//     const calldata = {
//         guessMin: String(r.guessMin),
//         guessMax: String(r.guessMax),
//         guessOffchain: String(r.guessOffchain),
//         maxIteration: String(r.maxIteration),
//         eps: String(r.eps)
//     };
//    //await actionSwapYTInstance.swapExactSyForYt(signers[0].getAddress(), await deployedEuphratesMarket.getAddress(), 100, 0, calldata);

//     const afterSwapSY = await EuphratesEUSDSY.balanceOf(signers[0].getAddress());
//     console.log("after swap sy: " + afterSwapSY);
//     const afterSwapYt = await deployedYT.balanceOf(signers[0].getAddress());
//     console.log("after swap yt: " + afterSwapYt);

    //--------------------------//
    // add liquidity single sy
    const state1 = await deployedEuphratesMarket.readState(actionAddRemoveLiqInstance.getAddress());

    console.log(state1);
    const market1: MarketState = {
        totalPt: BigNumber(state1.totalPt.toString()),
        totalSy: BigNumber(state1.totalSy.toString()),
        totalLp: BigNumber(state1.totalLp.toString()),
        treasury: state1.treasury as `0x${string}`,
        scalarRoot: BigNumber(state1.scalarRoot.toString()),
        expiry: BigNumber(state1.expiry.toString()),
        lnFeeRateRoot: BigNumber(state1.lnFeeRateRoot.toString()),
        reserveFeePercent: BigNumber(state1.reserveFeePercent.toString()),
        lastLnImpliedRate: BigNumber(state1.lastLnImpliedRate.toString()),
    };

    const sm1 = new MarketMathCore();


    const comp1 = sm1.getMarketPreCompute(
        market1,
        BigNumber("1100000000000000000"),
        BigNumber(((new Date().getTime()) / 1000).toFixed(0))
    )
    const s = sm1.calculateAddLiquiditySignleSy(
        market1,
        BigNumber("1100000000000000000"),
        comp1,
        BigNumber("200"),
    );
    console.log("before add liquidity sy: " + await EuphratesEUSDSY.balanceOf(signers[0].getAddress()));
    console.log("before add liqudity lp: " + await deployedEuphratesMarket.balanceOf(signers[0].getAddress()))
    const calldataSingleSy = {
        guessMin: String(s.guessMin),
        guessMax: String(s.guessMax),
        guessOffchain: String(s.guessOffchain),
        maxIteration: String(s.maxIteration),
        eps: String(s.eps)
    };
    console.log("guess off chain is: "+ calldataSingleSy.guessOffchain);

    await actionAddRemoveLiqInstance.addLiquiditySingleSy(signers[0].getAddress(), deployedEuphratesMarket.getAddress(),200, 0, calldataSingleSy);
    console.log("after add liquidity sy: " + await EuphratesEUSDSY.balanceOf(signers[0].getAddress()));
    console.log("after add liqudity lp: " + await deployedEuphratesMarket.balanceOf(signers[0].getAddress()))
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
