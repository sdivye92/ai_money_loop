/* model2 part A: probability, copula, GPU collateral, neocloud survival. USD billions unless stated. */
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

function erf(x) {
  const s = x < 0 ? -1 : 1; x = Math.abs(x);
  if (x < 4) {
    let sum = x, term = x, n = 0;
    while (Math.abs(term) > 1e-17 * Math.abs(sum) && n < 400) { n++; term *= -x * x / n; sum += term / (2 * n + 1); }
    return s * 2 / Math.sqrt(Math.PI) * sum;
  }
  const x2 = x * x;
  const erfc = Math.exp(-x2) / (x * Math.sqrt(Math.PI)) * (1 - 1 / (2 * x2) + 3 / (4 * x2 * x2) - 15 / (8 * x2 * x2 * x2));
  return s * (1 - erfc);
}
const Phi = x => 0.5 * (1 + erf(x / Math.SQRT2));
const phi = x => Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
function Phinv(p) {
  p = clamp(p, 1e-12, 1 - 1e-12);
  const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
  const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
  const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
  const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];
  let x;
  if (p < 0.02425) { const q = Math.sqrt(-2 * Math.log(p)); x = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
  else if (p > 1 - 0.02425) { const q = Math.sqrt(-2 * Math.log(1 - p)); x = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
  else { const q = p - 0.5, r = q * q; x = (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1); }
  const e = Phi(x) - p, u = e * Math.sqrt(2 * Math.PI) * Math.exp(x * x / 2);
  return x - u / (1 + x * u / 2);
}

/* CDS spread (decimal) to cumulative default probability, flat hazard */
const pdFromCds = (s, T, R) => 1 - Math.exp(-T * s / (1 - R));

/* P(Z1<a, Z2<b; rho) by Simpson on the conditional form */
function bvn(a, b, rho) {
  rho = clamp(rho, -0.999, 0.999);
  const sd = Math.sqrt(1 - rho * rho), lo = -9, N = 4000, h = (a - lo) / N;
  if (a <= lo) return 0;
  const g = z => phi(z) * Phi((b - rho * z) / sd);
  let s = g(lo) + g(a);
  for (let i = 1; i < N; i++) s += g(lo + i * h) * (i % 2 ? 4 : 2);
  return s * h / 3;
}
function jointDefault(p1, p2, rho) {
  const a = Phinv(p1), b = Phinv(p2), j = bvn(a, b, rho);
  return { joint: j, indep: p1 * p2, cond21: j / p1, cond12: j / p2, lift: j / (p1 * p2), either: p1 + p2 - j };
}

/* GPU-backed loan. V(t)=V0(1-d)^t. Loan amortises straight-line over `term` years, or is a bullet (interest only).
   Forced-sale recovery = (1-haircut)*V(t). Loss at default in year t = max(0, L(t) - recovery). */
function collateral(o) {
  const q = Object.assign({ V0: 100, adv: 0.65, d: 0.2, term: 5, bullet: false, haircut: 0.4, years: 7 }, o);
  const L0 = q.adv * q.V0, rows = [];
  let crossLTV = null, crossLoss = null, peak = { loss: 0, t: 0 };
  for (let i = 0; i <= q.years * 4; i++) {
    const t = i / 4, V = q.V0 * Math.pow(1 - q.d, t);
    const L = q.bullet ? L0 : L0 * Math.max(0, 1 - t / q.term);
    const ltv = V > 0 ? L / V : 0, rec = (1 - q.haircut) * V, loss = Math.max(0, L - rec);
    rows.push({ t, V, L, ltv, rec, loss });
    if (crossLTV === null && ltv > 1) crossLTV = t;
    if (crossLoss === null && loss > 0) crossLoss = t;
    if (loss > peak.loss) peak = { loss, t };
  }
  const ltvBullet = (q.bullet ? true : false);
  const tBullet = q.d > 0 ? Math.log(q.adv) / Math.log(1 - q.d) : Infinity;   // year when a bullet loan reaches 100% LTV
  return { q, L0, rows, crossLTV, crossLoss, peak, tBullet, day0Gap: L0 - (1 - q.haircut) * q.V0 };
}
/* annual economic depreciation implied by a residual fraction after n years */
const depFromResidual = (res, n) => 1 - Math.pow(res, 1 / n);
/* annual decay of a price from p0 to p1 over yrs */
const decayRate = (p0, p1, yrs) => 1 - Math.pow(p1 / p0, 1 / yrs);

/* Per-GPU unit economics. rent in $/GPU-hour, C in $, opex in $/GPU-hour, u utilisation.
   Cash flow in year k (k=0..n-1) = 8760 u rent0 (1-g)^k - 8760 u*0 ... opex is paid on hours sold plus idle power ignored. */
function gpuNPV(o) {
  const q = Object.assign({ C: 40000, rent0: 2.35, g: 0.0, u: 0.8, opex: 0.20, r: 0.10, n: 5 }, o);
  let pv = 0;
  for (let k = 0; k < q.n; k++) { const cf = 8760 * q.u * (q.rent0 * Math.pow(1 - q.g, k) - q.opex); pv += cf / Math.pow(1 + q.r, k + 0.5); }
  return { pv, npv: pv - q.C, q };
}
function breakevenDecay(o) {   // decay g at which NPV = 0 (bisection), null if NPV<0 even at g=0
  if (gpuNPV(Object.assign({}, o, { g: 0 })).npv < 0) return null;
  let lo = 0, hi = 0.95;
  for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; (gpuNPV(Object.assign({}, o, { g: m })).npv > 0) ? lo = m : hi = m; }
  return (lo + hi) / 2;
}

/* Neocloud order-shock survival. Quarterly $B. E derived = NI + interest + D&A. A share phi of cash opex flexes with revenue. */
const NEO = { R: 2.575, I: 0.640, NI: -0.626, DA: 1.4, debt: 35 };
NEO.E = NEO.NI + NEO.I + NEO.DA;
function neocloud(o) {
  const q = Object.assign({ phi: 0.2, k: 1.5, c: 0.67, f: 0.3 }, o);
  const R = NEO.R, E = NEO.E, I = NEO.I, O = R - E, x = q.c * q.f;
  const En = E - x * (R - q.phi * O);
  const slope = R - q.phi * O;
  return {
    q, x, En, O, slope, cov0: E / I, cov: En / I, lev0: NEO.debt / (4 * E), lev: En > 0 ? NEO.debt / (4 * En) : Infinity,
    xCov1: (E - I) / slope, xK: (E - q.k * I) / slope,
    fK: (E - q.k * I) / slope / q.c,             // customer cut that trips covenant k, given concentration c
    breach: En / I < q.k, insolvent: En / I < 1
  };
}
/* model2 part B: delay/idle carry, efficiency shock, consumer loop, macro, valuation, buyout */

/* Delay of m months before a GPU earns. Rent decays with CALENDAR time at rate g per year; asset life n years from in-service. */
function delayLoss(o) {
  const q = Object.assign({ C: 40000, rent0: 2.35, g: 0.25, u: 0.8, opex: 0.20, r: 0.10, n: 5, m: 6, N: 100000 }, o);
  const pvAt = m => {
    let pv = 0;
    for (let k = 0; k < q.n * 12; k++) {
      const tc = (k + m) / 12;                                   // calendar years from purchase
      const cf = (8760 / 12) * q.u * (q.rent0 * Math.pow(1 - q.g, tc) - q.opex);
      pv += cf / Math.pow(1 + q.r, tc);
    }
    return pv;
  };
  const pv0 = pvAt(0), pvm = pvAt(q.m), loss = pv0 - pvm;
  const timeValue = pv0 * (1 - Math.pow(1 + q.r, -q.m / 12));
  return { q, pv0, pvm, loss, timeValue, erosion: loss - timeValue, pctOfPV: pv0 > 0 ? loss / pv0 : 0, fleetLoss: loss * q.N / 1e9, fleetCapex: q.C * q.N / 1e9 };
}
/* Contract cancelled; redeploy fraction h at spot/contract price ratio s */
function cancelledContract(o) {
  const q = Object.assign({ contract: 7, price: 1.60, h: 0.5, s: 0.8 }, o);
  const gpuYears = q.contract * 1e9 / (q.price * 8760);
  const recovered = q.contract * q.h * q.s;
  return { q, gpuYears, recovered, lost: q.contract - recovered, lostPct: 1 - q.h * q.s };
}

/* Capital recovery factor and break-even rent */
const crf = (r, n) => r === 0 ? 1 / n : r / (1 - Math.pow(1 + r, -n));
const breakevenRent = o => {
  const q = Object.assign({ C: 40000, r: 0.10, n: 5, opex: 0.20, u: 0.8 }, o);
  return (q.C * crf(q.r, q.n)) / (8760 * q.u) + q.opex;   // opex $/GPU-hour sold
};
/* Efficiency shock. Fixed installed base clears the market. Token demand has price elasticity eps.
   GPU-hours demanded = T0 e^(eps-1) (p/p0)^(-eps)  =>  p/p0 = e^((eps-1)/eps). */
function effShock(o) {
  const q = Object.assign({ e: 2, eps: 0.5, p0: 2.35, C: 40000, r: 0.10, n: 5, opex: 0.20, u: 0.8 }, o);
  const eps = Math.max(0.05, q.eps), ratio = Math.pow(q.e, (eps - 1) / eps);
  const p1 = q.p0 * ratio, pStar = breakevenRent(q);
  const eStar = (eps < 1 && q.p0 > pStar) ? Math.pow(q.p0 / pStar, eps / (1 - eps)) : (q.p0 <= pStar ? 1 : Infinity);
  return { q, ratio, p1, pStar, margin0: q.p0 / pStar - 1, margin1: p1 / pStar - 1, eStar, underwater: p1 < pStar };
}

/* Consumer memory loop. sigma: AI share of memory demand. eta: supply elasticity. eps: device-demand elasticity. b: memory share of device BOM.
   Market clearing: eta dPm = sigma dAI - (1-sigma) eps b dPm  =>  dPm = sigma dAI / (eta + (1-sigma) eps b). Loop gain g = (1-sigma) eps b / eta. Negative feedback. */
function consumerLoop(o) {
  const q = Object.assign({ sigma: 0.3, eta: 0.5, eps: 0.83, b: 0.12, dAI: 0.2 }, o);
  const g = (1 - q.sigma) * q.eps * q.b / q.eta;
  const open = q.sigma * q.dAI / q.eta, closed = open / (1 + g);
  const devicePrice = q.b * closed, units = -q.eps * devicePrice;
  return { q, g, mult: 1 / (1 + g), openPm: open, closedPm: closed, devicePrice, units };
}
/* Vendor concentration. share = AI/datacentre share of revenue; beta = pass-through of AI capex cut to that segment. */
function vendorHit(o) {
  const q = Object.assign({ before: 0.325, after: 0.474, cut: 0.2, beta: 1 }, o);
  return { q, hitBefore: q.before * q.beta * q.cut, hitAfter: q.after * q.beta * q.cut, extra: (q.after - q.before) * q.beta * q.cut, ratio: q.after / q.before };
}

/* Macro */
function rates(o) {
  const q = Object.assign({ stack: 125.34, cw: 35, floatO: 0.3, floatC: 0.7, bp: 100, cwE: NEO.E * 4 }, o);
  const dO = q.stack * q.floatO * q.bp / 1e4, dC = q.cw * q.floatC * q.bp / 1e4;
  return { q, dO, dC, cwCovDrop: (dC / 4) / NEO.I, cwIntNew: 4 * NEO.I + dC };
}
function leverage(o) {
  const q = Object.assign({ L: 4.4, trig: 4.5 }, o);
  return { q, headroom: 1 - q.L / q.trig, ebitdaDropToTrip: 1 - q.L / q.trig };
}
const META = { capex: 34.91, ocf: 32.79 };
META.fcf = META.ocf - META.capex; META.ratio = META.capex / META.ocf; META.debtFunded = (META.capex - META.ocf) / META.capex;

/* Valuation gap */
function valuation(o) {
  const q = Object.assign({ V: 1250, margin: 0.25, pe: 25, R0: 50, yrs: 5, commit: 64.5 }, o);
  const need = q.V / (q.margin * q.pe);
  return { q, need, mult: need / q.R0, cagr: Math.pow(need / q.R0, 1 / q.yrs) - 1, coverage: q.R0 / q.commit, impliedPS: q.V / q.R0 };
}
/* Microsoft buyout arithmetic (all assumption-driven except 60000 and 157.6, 25) */
function buyout(o) {
  const q = Object.assign({ heads: 60000, accept: 1, cost: 250000, runRate: 157.6, memAdd: 25 }, o);
  const total = q.heads * q.accept * q.cost / 1e9;
  return { q, total, ofCapex: total / q.runRate, ofMem: total / q.memAdd };
}
