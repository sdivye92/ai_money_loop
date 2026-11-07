/* Cascade model. Inputs: v = OpenAI valuation drop (0..1), f = share of OpenAI contracted purchases cut (0..1).
   Every constant is a figure from the research report (USD billions unless stated). */
const K = {
  oaiVal: 852,                                  // OpenAI post-money, Mar 2026 round
  orcl: { oai: 300, rpoLo: 638, rpoHi: 664, capex: 55.6, oaiYr: 60, borrow: 125.34, fy27new: 40 },
  cw: { oai: 22.4, backlog: 104.2, capex: 37, debt: 35, intQ: 0.640, revQ: 2.575, niQ: -0.626,
        oaiYears: 5, revFY: 12.8, cds: 0.11945, rec: 0.4 },
  msft: { stake: 0.24, qRev: 92.3, oaiQ: 10.0 },
  amzn: { closed: 15, agg: 138, contingent: 35 },
  sb: { cost: 64.6, stake: 0.13 },
  nv: { stake: 0.035, guar: 105, backstop: 6.3, buyback: 36, qRev: 96.2, mcap: 5260 },
  anth: { spv: 36, bcomGuar: 31 }
};

function run(v, f) {
  const o = K.orcl, c = K.cw, m = K.msft, a = K.amzn, s = K.sb, n = K.nv, V = K.oaiVal;
  const out = {};

  out.oai = { valBefore: V, valAfter: V * (1 - v), markLoss: V * v };

  const share = o.oai / ((o.rpoLo + o.rpoHi) / 2);
  const oLost = f * o.oai;
  out.orcl = {
    share,
    backlogLost: oLost,
    pctLo: oLost / o.rpoHi, pctHi: oLost / o.rpoLo,
    revLostYr: f * o.oaiYr,
    capexCut: f * share * o.capex,
    per100bpStack: o.borrow * 0.01,
    per100bpNew: o.fy27new * 0.01
  };

  const cLost = f * c.oai;
  const pd5 = 1 - Math.exp(-5 * c.cds / (1 - c.rec));
  const lostYr = cLost / c.oaiYears;
  out.cw = {
    backlogLost: cLost,
    pct: cLost / c.backlog,
    lostYr,
    lostYrPctRev: lostYr / c.revFY,
    interestYr: 4 * c.intQ,
    lostYrOverInterest: lostYr / (4 * c.intQ),
    preInterestQ: c.niQ + c.intQ,
    capexCut: f * (c.oai / c.backlog) * c.capex,
    pd5,
    expLoss: pd5 * (1 - c.rec) * c.debt,
    lgd: (1 - c.rec) * c.debt
  };

  out.msft = {
    stakeVal: m.stake * V,
    loss: m.stake * V * v,
    payCutQ: f * m.oaiQ,
    payCutPct: f * m.oaiQ / m.qRev
  };

  const aStake = a.closed / V;
  out.amzn = {
    stakeVal: a.closed,
    loss: a.closed * v,
    backlogLost: f * a.agg,
    contingent: a.contingent
  };

  const sbVal = s.stake * V * (1 - v);
  out.sb = {
    mark: sbVal,
    markLoss: s.stake * V * v,
    vsCost: sbVal - s.cost,
    breakevenDrop: 1 - s.cost / (s.stake * V),
    belowCost: sbVal < s.cost
  };

  out.nv = {
    eqLoss: n.stake * V * v,
    demandCut: out.orcl.capexCut + out.cw.capexCut,
    demandPct: (out.orcl.capexCut + out.cw.capexCut) / (4 * n.qRev),
    backstopRatio: cLost / n.backstop,
    backstopBreakF: n.backstop / c.oai,
    guarPctMcap: n.guar / n.mcap,
    guarVsQuarter: n.guar / n.qRev
  };

  const holders = m.stake + aStake + s.stake + n.stake;
  out.holders = { frac: holders, loss: V * v * holders, ofTotal: holders };

  // Real event, 8 Oct 2026 (static)
  const o8 = K.orcl.oai / ((o.rpoLo + o.rpoHi) / 2);
  out.event = [
    { name: 'CoreWeave', move: 7.8, expo: c.oai / c.backlog * 100, basis: 'OpenAI share of backlog' },
    { name: 'Oracle', move: 5.5, expo: o8 * 100, basis: 'OpenAI share of RPO' },
    { name: 'Microsoft', move: 1.3, expo: m.oaiQ / m.qRev * 100, basis: 'OpenAI share of quarter revenue' },
    { name: 'Broadcom', move: 4.3, expo: null, basis: 'not sourced' },
    { name: 'AMD', move: 3.9, expo: null, basis: 'not sourced' },
    { name: 'Nvidia', move: 2.9, expo: null, basis: 'not sourced' },
    { name: 'Amazon', move: 2.3, expo: null, basis: 'not sourced' }
  ];
  out.nvEventLoss = 0.029 * n.mcap;
  return out;
}

