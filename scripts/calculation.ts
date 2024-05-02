import BigNumber from "bignumber.js";
import { exp, log, abs, bignumber } from "mathjs";

export interface MarketState {
  totalPt: BigNumber;
  totalSy: BigNumber;
  totalLp: BigNumber;
  treasury: `0x${string}`;
  scalarRoot: BigNumber;
  expiry: BigNumber;
  lifeCircle: BigNumber;
  sAPR: BigNumber;
  lnFeeRateRoot: BigNumber;
  reserveFeePercent: BigNumber;
  lastLnImpliedRate: BigNumber;
}

export interface Approx {
  guessMin: BigNumber;
  guessMax: BigNumber;
  guessOffchain: BigNumber;
  maxIteration: BigNumber;
  eps: BigNumber;
}

interface MarketPreCompute {
  rateScalar: BigNumber;
  totalAsset: BigNumber;
  rateAnchor: BigNumber;
  feeRate: BigNumber;
}

interface CalcTradeResult {
  netSyToAccount: BigNumber;
  netSyFee: BigNumber;
  netSyToReserve: BigNumber;
}

const test_market = {
  totalPt: "10121",
  totalSy: "29903",
  totalLp: "17320",
  treasury: "0x4174770eb8eA662C3b781961ad9d06D65c090f46",
  scalarRoot: "76568950000000000000",
  expiry: "1703980800",
  lnFeeRateRoot: "999500333083533",
  reserveFeePercent: "80",
  lastLnImpliedRate: "839351602021932795",
};

export class MarketMathCore {
  static MINIMUM_LIQUIDITY: BigNumber = BigNumber(10).multipliedBy(3);
  static PERCENTAGE_DECIMALS: BigNumber = BigNumber(100);
  static DAY: BigNumber = BigNumber(86400);
  static IMPLIED_RATE_TIME: BigNumber = MarketMathCore.DAY.multipliedBy(365);
  static MAX_MARKET_PROPORTION: BigNumber = BigNumber(1e18)
    .multipliedBy(96)
    .dividedBy(100);
  static IONE: BigNumber = BigNumber(1);
  static IZERO: BigNumber = BigNumber(0);

  constructor() {}

  bisectionMethodForOneTwo(
    A: BigNumber,
    B: BigNumber,
    C: BigNumber,
    left = BigNumber(0.001),
    right = C,
    tolerance = BigNumber(1e-11),
    maxIterations = BigNumber(10000),
  ): BigNumber {
    let middle = BigNumber(0);
    for (let i = 0; i < maxIterations.toNumber(); i++) {
      middle = left.plus(right).dividedBy(2);

      const flog = BigNumber(log(middle.toNumber()));
      const f = middle
        .multipliedBy(flog)
        .dividedBy(middle.plus(1))
        .plus(A.multipliedBy(middle).dividedBy(middle.plus(1)))
        .plus(B.multipliedBy(flog))
        .minus(C);

      if (BigNumber(abs(f.toNumber())).isLessThan(tolerance)) {
        return middle;
      }

      if (f.isGreaterThan(0)) {
        right = middle;
      } else {
        left = middle;
      }
    }
    return middle;
  }

  bisectionMethodThreeFour(
    A: BigNumber,
    B: BigNumber,
    C: BigNumber,
    left = BigNumber(0.001),
    right = C,
    tolerance = BigNumber(1e-11),
    maxIterations = BigNumber(10000),
  ): BigNumber {
    let middle = BigNumber(0);
    for (let i = 0; i < maxIterations.toNumber(); i++) {
      middle = left.plus(right).dividedBy(2);

      const flog = BigNumber(log(middle.toNumber()));
      const f = A.multipliedBy(flog)
        .plus(B.multipliedBy(middle).dividedBy(middle.plus(1)))
        .minus(C);

      if (BigNumber(abs(f.toNumber())).isLessThan(tolerance)) {
        return middle;
      }

      if (f.isGreaterThan(0)) {
        right = middle;
      } else {
        left = middle;
      }
    }
    return middle;
  }

  bisectionMethodFive(
    A: BigNumber,
    B: BigNumber,
    C: BigNumber,
    D: BigNumber,
    alpha: BigNumber,
    beta: BigNumber,
    Sca: BigNumber,
    Anc: BigNumber,
    left = BigNumber(0.001),
    right = alpha,
    tolerance = BigNumber(1e-11),
    maxIterations = BigNumber(10000),
  ): BigNumber {
    let middle = BigNumber(0);
    for (let i = 0; i < maxIterations.toNumber(); i++) {
      middle = left.plus(right).dividedBy(2);
      const q = BigNumber(1)
        .dividedBy(BigNumber(1).minus(alpha.minus(middle).dividedBy(beta)))
        .minus(1);
      const qlog = BigNumber(log(q.toNumber()));
      const E = qlog.dividedBy(Sca).plus(Anc);
      const f = A.multipliedBy(middle)
        .multipliedBy(E)
        .plus(B.multipliedBy(middle))
        .plus(C.multipliedBy(middle).multipliedBy(middle))
        .minus(D.multipliedBy(E));
      // let q = 1 / (1 - (alpha - middle) / beta) - 1;
      // let E = Math.log(q) / Sca + Anc;
      // let f = A * middle * E + B * middle + C * middle * middle - D * E;

      if (BigNumber(abs(f.toNumber())).isLessThan(tolerance)) {
        return middle;
      }

      if (f.isGreaterThan(0)) {
        right = middle;
      } else {
        left = middle;
      }
    }
    return middle;
  }

  //bisec six is for getting new implied rate
  bisectionMethodSix(
    sapr: BigNumber,
    n: BigNumber,
    price: BigNumber,
    left = BigNumber(0),
    right = BigNumber(2),
    tolerance = BigNumber(1e-11),
    maxIterations = BigNumber(10000),
  ) {
    let middle = BigNumber(0);
    for (let i = 0; i < maxIterations.toNumber(); i++) {
      middle = left.plus(right).dividedBy(2);
      let q = Math.exp(middle.toNumber() / -365);
      let bnq = BigNumber(q);
      let q_to_n = BigNumber(Math.pow(q, n.toNumber()));
      let f = sapr
        .dividedBy(365)
        .multipliedBy(bnq)
        .multipliedBy(MarketMathCore.IONE.minus(q_to_n))
        .plus(q_to_n.multipliedBy(MarketMathCore.IONE.minus(bnq)))
        .minus(price.multipliedBy(MarketMathCore.IONE.minus(bnq)));
      //let f = sapr / 365 * q * (1 - q_to_n) + q_to_n * (1 - q) - price * (1 - q);

      if (f.abs().isLessThan(tolerance)) {
        return middle;
      }

      if (f.isGreaterThan(BigNumber(0))) {
        left = middle;
      } else {
        right = middle;
      }
    }
    return middle;
  }

  getMarketPreCompute(
    market: MarketState,
    exchangeRate: BigNumber,
    sAPR: BigNumber,
    blockTime: BigNumber,
  ) {
    if (MiniHelpers.isExpired(market.expiry, blockTime)) {
      throw new Error("Market is expired");
    }

    //let timeToExpiry = market.expiry.minus(blockTime);
    let timeToExpiry = market.lifeCircle.minus(blockTime); //left days
    let res: MarketPreCompute = {
      rateScalar: BigNumber(0),
      totalAsset: BigNumber(0),
      rateAnchor: BigNumber(0),
      feeRate: BigNumber(0),
    };

    // TODO: .int()
    res.rateScalar = market.scalarRoot
      .dividedBy(1e18)
      .multipliedBy(MarketMathCore.IMPLIED_RATE_TIME) // 86400*365
      .dividedBy(timeToExpiry)
      .dividedBy(MarketMathCore.DAY);

    res.totalAsset = market.totalSy.multipliedBy(exchangeRate.dividedBy(1e18));

    if (market.totalPt.isEqualTo(0) || res.totalAsset.isEqualTo(0)) {
      throw new Error("Market is expired");
    }

    res.rateAnchor = this._getRateAnchor(
      market.totalPt,
      market.lastLnImpliedRate.dividedBy(1e18),
      res.totalAsset,
      res.rateScalar,
      sAPR.dividedBy(1e18),
      timeToExpiry,
    );

    res.feeRate = this._getExchangeRateFromImpliedRate(
      market.lnFeeRateRoot.dividedBy(1e18),
      timeToExpiry,
    );

    return res;
  }

  calcTrade(
    market: MarketState,
    comp: MarketPreCompute,
    exchangeRate: BigNumber,
    netPtToAccount: BigNumber,
  ) {
    let preFeeExchangeRate = this._getExchangeRate(
      market,
      comp,
      netPtToAccount,
    );

    let preFeeAssetToAccount = netPtToAccount
      .dividedBy(preFeeExchangeRate)
      .multipliedBy(-1);
    let fee = comp.feeRate;

    if (netPtToAccount.isGreaterThan(BigNumber(0))) {
      const postFeeExchangeRate = preFeeExchangeRate.dividedBy(fee);
      if (postFeeExchangeRate.isLessThan(MarketMathCore.IONE)) {
        throw new Error("Exchange rate cannot be less than one");
      }
      fee = preFeeAssetToAccount.multipliedBy(MarketMathCore.IONE.minus(fee));
    } else {
      fee = preFeeAssetToAccount
        .multipliedBy(MarketMathCore.IONE.minus(fee))
        .dividedBy(fee)
        .multipliedBy(-1);
    }

    let netAssetToReserve = fee
      .multipliedBy(market.reserveFeePercent)
      .dividedBy(100);
    let netAssetToAccount = preFeeAssetToAccount.minus(fee);

    let res: CalcTradeResult = {
      netSyToAccount: BigNumber(0),
      netSyFee: BigNumber(0),
      netSyToReserve: BigNumber(0),
    };

    res.netSyToAccount = netAssetToAccount.dividedBy(
      exchangeRate.dividedBy(1e18),
    );
    res.netSyFee = fee.dividedBy(exchangeRate.dividedBy(1e18));
    res.netSyToReserve = netAssetToReserve.dividedBy(
      exchangeRate.dividedBy(1e18),
    );

    return res;
  }

  estimateNewImpliedRate(
    market: MarketState,
    comp: MarketPreCompute,
    calcRes: CalcTradeResult,
    netPtToAccount: BigNumber,
    exchangeRate: BigNumber,
    blockTime: BigNumber,
  ) {
    const timeToExpiry = market.lifeCircle.minus(blockTime); //left days
    const newTotalPt = market.totalPt.minus(netPtToAccount);
    const newTotalSy = market.totalSy.minus(
      calcRes.netSyToAccount.plus(calcRes.netSyToReserve),
    );
    let newImpliedRate = this._getLnImpliedRate(
      newTotalPt,
      newTotalSy.multipliedBy(exchangeRate.dividedBy(1e18)),
      comp,
      market.sAPR.dividedBy(1e18),
      timeToExpiry,
    );
    newImpliedRate = newImpliedRate.multipliedBy(1e18);
    return {
      guessMin: newImpliedRate.multipliedBy(0.95).integerValue(),
      guessMax: newImpliedRate.multipliedBy(1.05).integerValue(),
      guessOffchain: newImpliedRate.integerValue(),
      maxIteration: BigNumber(7),
      eps: BigNumber(1e14),
    };
  }

  //use binary search to get new implied rate
  _getLnImpliedRate(
    totalPt: BigNumber,
    totalAsset: BigNumber,
    comp: MarketPreCompute,
    sAPR: BigNumber,
    timeToExpiry: BigNumber,
  ) {
    const proportion = totalPt.dividedBy(totalPt.plus(totalAsset));
    const lnProportion = this._logProportion(proportion);
    const newExchangeRate = lnProportion
      .dividedBy(comp.rateScalar)
      .plus(comp.rateAnchor);
    const newPrice = MarketMathCore.IONE.dividedBy(newExchangeRate); //use this price to do binary search to get new r
    //plug bisec funtion 6 here
    const result = this.bisectionMethodSix(sAPR, timeToExpiry, newPrice);
    return result;
  }

  _getExchangeRate(
    market: MarketState,
    comp: MarketPreCompute,
    netPtToAccount: BigNumber,
  ) {
    const numerator = market.totalPt.minus(netPtToAccount);
    const proportion = numerator.dividedBy(
      market.totalPt.plus(comp.totalAsset),
    );
    const lnProportion = this._logProportion(proportion);
    const newExchangeRate = lnProportion
      .dividedBy(comp.rateScalar)
      .plus(comp.rateAnchor);
    return newExchangeRate;
  }

  _getExchangeRateFromImpliedRate(
    lnImpliedRate: BigNumber,
    timeToExpiry: BigNumber,
  ) {
    const rt = lnImpliedRate
      .multipliedBy(timeToExpiry)
      //.dividedBy(MarketMathCore.IMPLIED_RATE_TIME)//86400*365
      .dividedBy(365)
      .toNumber();
    return BigNumber(exp(rt));
  }

  _getFPTExchangeRateFromImpliedRate(
    lnImpliedRate: BigNumber, //has removed 1e18,can be used directly
    sAPR: BigNumber, ////has removed 1e18,can be used directly
    timeToExpiry: BigNumber, //day
  ) {
    const multiplier = sAPR.dividedBy(365);
    const rdiv365 = lnImpliedRate.dividedBy(365);
    const rndiv365 = rdiv365.multipliedBy(timeToExpiry);
    const x = BigNumber(exp(rdiv365.multipliedBy(-1).toNumber()));
    const xn = BigNumber(exp(rndiv365.multipliedBy(-1).toNumber()));
    const sumSequence = x
      .multipliedBy(MarketMathCore.IONE.minus(xn))
      .dividedBy(MarketMathCore.IONE.minus(x)); //(1-xn)*x/(1-x);
    const price = multiplier.multipliedBy(sumSequence).plus(xn);
    return MarketMathCore.IONE.dividedBy(price);
  }

  _getRateAnchor(
    totalPt: BigNumber,
    lastLnImpliedRate: BigNumber, //has removed 1e18,can be used directly
    totalAsset: BigNumber,
    rateScalar: BigNumber,
    sAPR: BigNumber, //has removed 1e18,can be used directly
    timeToExpiry: BigNumber,
  ) {
    // const newExchangeRate = this._getExchangeRateFromImpliedRate(
    //     lastLnImpliedRate,
    //     timeToExpiry
    // );
    const newExchangeRate = this._getFPTExchangeRateFromImpliedRate(
      lastLnImpliedRate,
      sAPR,
      timeToExpiry,
    );

    if (newExchangeRate.isLessThan(MarketMathCore.IONE)) {
      throw new Error("Exchange rate cannot be less than one");
    }
    const proportion = totalPt.dividedBy(totalPt.plus(totalAsset));
    const lnProportion = this._logProportion(proportion);
    return newExchangeRate.minus(lnProportion.dividedBy(rateScalar));
  }

  _logProportion(proportion: BigNumber) {
    if (proportion.isEqualTo(MarketMathCore.IONE)) {
      throw new Error("Exchange rate cannot be equal than one");
    }

    const logitP = proportion
      .dividedBy(MarketMathCore.IONE.minus(proportion))
      .toNumber();

    return BigNumber(log(logitP));
  }

  // swap exact sy for yt
  calculateSectionOne(
    market: MarketState,
    exchangeRate: BigNumber,
    comp: MarketPreCompute,
    input: BigNumber,
  ) {
    const a = market.totalPt;
    const b = comp.totalAsset.plus(a);
    const sca = comp.rateScalar;
    const anc = comp.rateAnchor;
    const B = input;
    const FR = comp.feeRate;
    const C = FR.multipliedBy(anc).minus(1);
    const ita = exchangeRate.dividedBy(1e18);
    const D = B.multipliedBy(ita).multipliedBy(FR).multipliedBy(anc);

    const AAA = b.multipliedBy(FR).dividedBy(sca);
    const BBB = C.multipliedBy(b);
    const CCC = B.multipliedBy(ita)
      .plus(a)
      .multipliedBy(FR)
      .dividedBy(sca)
      .negated();

    const DDD = C.multipliedBy(a).plus(D);

    const AA = BBB.dividedBy(AAA);
    const BB = CCC.dividedBy(AAA);
    const CC = DDD.dividedBy(AAA);

    return [this.bisectionMethodForOneTwo(AA, BB, CC), a, b];
  }

  // swap exact pt for yt
  calculateSectionTwo(
    market: MarketState,
    exchangeRate: BigNumber,
    comp: MarketPreCompute,
    input: BigNumber,
  ) {
    const a = market.totalPt;
    const b = comp.totalAsset.plus(a);
    const sca = comp.rateScalar;
    const anc = comp.rateAnchor;
    const G = input; // input -> exact pt in
    const FR = comp.feeRate;
    const C = FR.multipliedBy(anc).minus(1);
    const ita = exchangeRate.dividedBy(1e18);
    const D = G.multipliedBy(FR).multipliedBy(anc);

    const AAA = b.multipliedBy(FR).dividedBy(sca);
    const BBB = C.multipliedBy(b);
    const CCC = G.plus(a).multipliedBy(FR).dividedBy(sca).negated();

    const DDD = C.multipliedBy(a).plus(D);

    const AA = BBB.dividedBy(AAA);
    const BB = CCC.dividedBy(AAA);
    const CC = DDD.dividedBy(AAA);

    return [this.bisectionMethodForOneTwo(AA, BB, CC), a, b];
  }

  // swap exact sy for pt
  calculateSectionThree(
    market: MarketState,
    exchangeRate: BigNumber,
    comp: MarketPreCompute,
    input: BigNumber,
  ) {
    const FR = comp.feeRate;
    const ita = exchangeRate.dividedBy(1e18);
    const G = input; // input -> exact sy in
    const sca = comp.rateScalar;
    const a = market.totalPt;
    const b = comp.totalAsset.plus(a);
    const anc = comp.rateAnchor;
    const E = G.multipliedBy(ita).dividedBy(FR);
    const A = E.dividedBy(sca);
    const B = b;
    const C = a.minus(E.multipliedBy(anc));

    return [this.bisectionMethodThreeFour(A, B, C), a, b];
  }

  // swap exact yt for pt
  calculateSectionFour(
    market: MarketState,
    exchangeRate: BigNumber,
    comp: MarketPreCompute,
    input: BigNumber,
  ) {
    const FR = comp.feeRate;
    const ita = exchangeRate.dividedBy(1e18);
    const G = input; // input -> exact yt in
    const sca = comp.rateScalar;
    const a = market.totalPt;
    const b = comp.totalAsset.plus(a);
    const anc = comp.rateAnchor;
    const F = G.dividedBy(FR);
    const A = F.dividedBy(sca);
    const B = b;
    const C = a.minus(F.multipliedBy(anc));

    return [this.bisectionMethodThreeFour(A, B, C), a, b];
  }

  // add liquit signle sy
  calculateSectionFive(
    market: MarketState,
    exchangeRate: BigNumber,
    comp: MarketPreCompute,
    input: BigNumber,
  ) {
    const FR = comp.feeRate;
    const ita = exchangeRate.dividedBy(1e18);
    const a = market.totalPt;
    const b = comp.totalAsset.plus(a);
    const sca = comp.rateScalar;
    const anc = comp.rateAnchor;
    const theta = input; // input -> total sy in
    const phai = market.totalSy;
    const lamda = theta.plus(phai);
    const RF = market.reserveFeePercent.dividedBy(100);

    const A = lamda.multipliedBy(ita);
    const B = a.multipliedBy(FR);
    const C = RF.multipliedBy(BigNumber(1).minus(FR));
    const D = theta.multipliedBy(a).multipliedBy(ita);

    const X = this.bisectionMethodFive(A, B, C, D, a, b, sca, anc);

    return X;
  }

  calculateSwapExactSyForYt(
    market: MarketState,
    exchangeRate: BigNumber,
    comp: MarketPreCompute,
    input: BigNumber,
  ) {
    let [Q, a, b] = this.calculateSectionOne(market, exchangeRate, comp, input);
    const eq = Q.plus(1);
    const X = Q.multipliedBy(b).dividedBy(eq).minus(a);

    return {
      guessMin: X.multipliedBy(0.95).integerValue(),
      guessMax: X.multipliedBy(1.05).integerValue(),
      guessOffchain: X.integerValue(),
      maxIteration: BigNumber(7),
      eps: BigNumber(1e16),
    };
  }

  calculateSwapExactPtForYt(
    market: MarketState,
    exchangeRate: BigNumber,
    comp: MarketPreCompute,
    input: BigNumber,
  ) {
    let [Q, a, b] = this.calculateSectionTwo(market, exchangeRate, comp, input);
    const eq = Q.plus(1);
    const X = Q.multipliedBy(b).dividedBy(eq).minus(a);

    return {
      guessMin: X.multipliedBy(0.95).integerValue(),
      guessMax: X.multipliedBy(1.05).integerValue(),
      guessOffchain: X.integerValue(),
      maxIteration: BigNumber(7),
      eps: BigNumber(1e16),
    };
  }

  calculateSwapExactYtForPt(
    market: MarketState,
    exchangeRate: BigNumber,
    comp: MarketPreCompute,
    input: BigNumber,
  ) {
    let [Q, a, b] = this.calculateSectionFour(
      market,
      exchangeRate,
      comp,
      input,
    );
    const eq = Q.plus(1);
    const X = a.minus(Q.multipliedBy(b).dividedBy(eq));

    return {
      guessMin: X.multipliedBy(0.95).integerValue(),
      guessMax: X.multipliedBy(1.05).integerValue(),
      guessOffchain: X.integerValue(),
      maxIteration: BigNumber(7),
      eps: BigNumber(1e16),
    };
  }

  calculateSwapExactSyForPt(
    market: MarketState,
    exchangeRate: BigNumber,
    comp: MarketPreCompute,
    input: BigNumber,
  ) {
    let [Q, a, b] = this.calculateSectionThree(
      market,
      exchangeRate,
      comp,
      input,
    );
    const eq = Q.plus(1);
    const X = a.minus(Q.multipliedBy(b).dividedBy(eq));

    return {
      guessMin: X.multipliedBy(0.95).integerValue(),
      guessMax: X.multipliedBy(1.05).integerValue(),
      guessOffchain: X.integerValue(),
      maxIteration: BigNumber(7),
      eps: BigNumber(1e16),
    };
  }

  calculateAddLiquiditySingleSy(
    market: MarketState,
    exchangeRate: BigNumber,
    comp: MarketPreCompute,
    input: BigNumber,
  ) {
    let X = this.calculateSectionFive(market, exchangeRate, comp, input);

    return {
      guessMin: X.multipliedBy(0.95).integerValue(),
      guessMax: X.multipliedBy(1.05).integerValue(),
      guessOffchain: X.integerValue(),
      maxIteration: BigNumber(7),
      eps: BigNumber(1e16),
    };
  }

  calculateRemoveLiquidity(market: MarketState, lptoRemove: BigNumber) {
    let netSyToAccount = lptoRemove
      .multipliedBy(market.totalSy)
      .dividedBy(market.totalLp);
    let netPtToAccount = lptoRemove
      .multipliedBy(market.totalPt)
      .dividedBy(market.totalLp);

    market.totalLp = market.totalLp.minus(lptoRemove);
    market.totalSy = market.totalSy.minus(netSyToAccount);
    market.totalPt = market.totalPt.minus(netPtToAccount);

    return {
      netSyToAccount: netSyToAccount,
      netPtToAccount: netPtToAccount,
    };
  }
}

class MiniHelpers {
  constructor() {}
  static isCurrentlyExpired(expiry: BigNumber, blockTime: BigNumber) {
    return expiry <= blockTime;
  }
  static isExpired(expiry: BigNumber, blockTime: BigNumber) {
    return expiry <= blockTime;
  }
  static isTimeInThePast(timestamp: BigNumber, blockTime: BigNumber) {
    return timestamp <= blockTime;
  }
}
