import BigNumber from "bignumber.js";
import { exp, log, abs } from "mathjs";

export interface MarketState {
    totalPt: BigNumber;
    totalSy: BigNumber;
    totalLp: BigNumber;
    treasury: `0x${string}`;
    scalarRoot: BigNumber;
    expiry: BigNumber;
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
        tolerance = BigNumber(1e-7),
        maxIterations = BigNumber(1000)
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
        tolerance = BigNumber(1e-7),
        maxIterations = BigNumber(1000)
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
        tolerance = BigNumber(1e-7),
        maxIterations = BigNumber(1000)
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

    getMarketPreCompute(
        market: MarketState,
        exchangeRate: BigNumber,
        blockTime: BigNumber
    ) {
        if (MiniHelpers.isExpired(market.expiry, blockTime)) {
            throw new Error("Market is expired");
        }

        let timeToExpiry = market.expiry.minus(blockTime);
        let res: MarketPreCompute = {
            rateScalar: BigNumber(0),
            totalAsset: BigNumber(0),
            rateAnchor: BigNumber(0),
            feeRate: BigNumber(0),
        };

        // TODO: .int()
        res.rateScalar = market.scalarRoot
            .dividedBy(1e18)
            .multipliedBy(MarketMathCore.IMPLIED_RATE_TIME)
            .dividedBy(timeToExpiry);

        res.totalAsset = market.totalSy.multipliedBy(exchangeRate.dividedBy(1e18));

        if (market.totalPt.isEqualTo(0) || res.totalAsset.isEqualTo(0)) {
            throw new Error("Market is expired");
        }

        res.rateAnchor = this._getRateAnchor(
            market.totalPt,
            market.lastLnImpliedRate.dividedBy(1e18),
            res.totalAsset,
            res.rateScalar,
            timeToExpiry
        );

        res.feeRate = this._getExchangeRateFromImpliedRate(
            market.lnFeeRateRoot.dividedBy(1e18),
            timeToExpiry
        );

        return res;
    }

    _getExchangeRateFromImpliedRate(
        lnImpliedRate: BigNumber,
        timeToExpiry: BigNumber
    ) {
        const rt = lnImpliedRate
            .multipliedBy(timeToExpiry)
            .dividedBy(MarketMathCore.IMPLIED_RATE_TIME)
            .toNumber();
        return BigNumber(exp(rt));
    }

    _getRateAnchor(
        totalPt: BigNumber,
        lastLnImpliedRate: BigNumber,
        totalAsset: BigNumber,
        rateScalar: BigNumber,
        timeToExpiry: BigNumber
    ) {
        const newExchangeRate = this._getExchangeRateFromImpliedRate(
            lastLnImpliedRate,
            timeToExpiry
        );
        console.log(
            "newExchangeRatenewExchangeRate=====>>>>>",
            newExchangeRate.toNumber()
        );

        if (newExchangeRate.isLessThan(MarketMathCore.IONE)) {
            throw new Error("Exchange rate cannot be less than one");
        }
        const proportion = totalPt.dividedBy(totalPt.plus(totalAsset));
        const lnProportion = this._logProportion(proportion);
        console.log("proportion=====>>>>>", proportion.toNumber());
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
        input: BigNumber
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
        input: BigNumber
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
        input: BigNumber
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
        input: BigNumber
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
        input: BigNumber
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
        input: BigNumber
    ) {
        let [Q, a, b] = this.calculateSectionOne(market, exchangeRate, comp, input);
        const eq = Q.plus(1);
        const X = Q.multipliedBy(b).dividedBy(eq).minus(a);
        console.log(X.toNumber(), "x-------");

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
        input: BigNumber
    ) {
        let [Q, a, b] = this.calculateSectionTwo(market, exchangeRate, comp, input);
        const eq = Q.plus(1);
        const X = Q.multipliedBy(b).dividedBy(eq).minus(a);
        console.log(X.toNumber(), "x-------");

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
        input: BigNumber
    ) {
        let [Q, a, b] = this.calculateSectionThree(
            market,
            exchangeRate,
            comp,
            input
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

    calculateSwapExactYtForPt(
        market: MarketState,
        exchangeRate: BigNumber,
        comp: MarketPreCompute,
        input: BigNumber
    ) {
        let [Q, a, b] = this.calculateSectionFour(
            market,
            exchangeRate,
            comp,
            input
        );
        const eq = Q.plus(1);
        const X = a.minus(Q.multipliedBy(b).dividedBy(eq));
        console.log(X.toNumber(), "x-------");

        return {
            guessMin: X.multipliedBy(0.95).integerValue(),
            guessMax: X.multipliedBy(1.05).integerValue(),
            guessOffchain: X.integerValue(),
            maxIteration: BigNumber(7),
            eps: BigNumber(1e16),
        };
    }

    calculateAddLiquiditySignleSy(
        market: MarketState,
        exchangeRate: BigNumber,
        comp: MarketPreCompute,
        input: BigNumber
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
