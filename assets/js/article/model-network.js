/* model2 part G: weighted directed network, diffusion with default switch, Leontief benchmark, centralities, cycles */
const GN = ['oai', 'orcl', 'cw', 'msft', 'nv', 'meta', 'amzn', 'sb', 'lend', 'anth'];
const GL = { oai: 'OpenAI', orcl: 'Oracle', cw: 'CoreWeave', msft: 'Microsoft', nv: 'Nvidia', meta: 'Meta', amzn: 'Amazon', sb: 'SoftBank', lend: 'Lenders', anth: 'Anthropic' };
const GBASE = { oai: 'contracted purchases cut', orcl: 'RPO', cw: 'revenue or backlog', msft: 'quarterly revenue', nv: 'annual revenue', meta: 'n/a (not hit)', amzn: 'n/a (no sourced weight)', sb: 'OpenAI mark', lend: 'sourced AI credit book', anth: 'sentiment only' };
const GCREDIT = { cw: 35, orcl: 125.34, anth: 36 };

/* Edge list. w is the fraction of the TARGET's base lost if the SOURCE stops completely.
   status: reported = ratio of two sourced figures; derived = needs the GPU-share assumption; assumed = back edge scaled by kappa. */
function edges(p) {
  p = Object.assign({ gs: 0.5, kappa: 0.1 }, p);
  const book = GCREDIT.cw + GCREDIT.orcl + GCREDIT.anth, nvAnn = 4 * K.nv.qRev;
  return [
    { a: 'oai', b: 'orcl', w: K.orcl.oai / ((K.orcl.rpoLo + K.orcl.rpoHi) / 2), kind: 'demand', st: 'reported', note: '$300B of ~$651B RPO' },
    { a: 'oai', b: 'cw', w: K.cw.oai / K.cw.backlog, kind: 'demand', st: 'reported', note: '$22.4B of $104.2B backlog' },
    { a: 'oai', b: 'msft', w: K.msft.oaiQ / K.msft.qRev, kind: 'demand', st: 'reported', note: '$10.0B of $92.3B quarterly revenue' },
    { a: 'oai', b: 'sb', w: 1, kind: 'equity', st: 'reported', note: 'mark moves one for one with the OpenAI valuation' },
    { a: 'meta', b: 'cw', w: 0.338, kind: 'demand', st: 'reported', note: '~33.8% of CoreWeave backlog' },
    { a: 'msft', b: 'cw', w: 0.67, kind: 'demand', st: 'reported', note: '67% of 2025 revenue (revenue basis, not backlog)' },
    { a: 'orcl', b: 'nv', w: K.orcl.capex * p.gs / nvAnn, kind: 'demand', st: 'derived', note: '$55.6B capex x GPU share / Nvidia annualised revenue' },
    { a: 'cw', b: 'nv', w: K.cw.capex * p.gs / nvAnn, kind: 'demand', st: 'derived', note: '$37B capex x GPU share / Nvidia annualised revenue' },
    { a: 'msft', b: 'nv', w: 157.6 * p.gs / nvAnn, kind: 'demand', st: 'derived', note: '$157.6B capex run-rate x GPU share / Nvidia annualised revenue' },
    { a: 'meta', b: 'nv', w: 4 * META.capex * p.gs / nvAnn, kind: 'demand', st: 'derived', note: 'Q3 capex x 4 x GPU share / Nvidia annualised revenue' },
    { a: 'cw', b: 'lend', w: GCREDIT.cw / book, kind: 'credit', st: 'reported', note: '$35B of the $196B sourced AI credit book' },
    { a: 'orcl', b: 'lend', w: GCREDIT.orcl / book, kind: 'credit', st: 'reported', note: '$125B of the $196B sourced AI credit book' },
    { a: 'anth', b: 'lend', w: GCREDIT.anth / book, kind: 'credit', st: 'reported', note: '$36B SPV of the $196B sourced AI credit book' },
    { a: 'nv', b: 'oai', w: p.kappa, kind: 'funding', st: 'assumed', note: 'share of OpenAI purchasing power conditional on Nvidia' },
    { a: 'orcl', b: 'oai', w: p.kappa, kind: 'capacity', st: 'assumed', note: 'share of OpenAI capacity delivered by Oracle' },
    { a: 'cw', b: 'oai', w: p.kappa, kind: 'capacity', st: 'assumed', note: 'share of OpenAI capacity delivered by CoreWeave' },
    { a: 'msft', b: 'oai', w: p.kappa, kind: 'funding', st: 'assumed', note: 'share of OpenAI funding and capacity from Microsoft' },
    { a: 'sb', b: 'oai', w: p.kappa, kind: 'funding', st: 'assumed', note: 'share of OpenAI funding conditional on SoftBank' },
    { a: 'oai', b: 'anth', w: p.kappa, kind: 'sentiment', st: 'assumed', note: 'investor sentiment spillover to Anthropic' }
  ];
}
function matrix(E) {   // W[i][j] = weight of edge j -> i
  const n = GN.length, W = Array.from({ length: n }, () => new Array(n).fill(0));
  E.forEach(e => { W[GN.indexOf(e.b)][GN.indexOf(e.a)] += e.w; });
  return W;
}
function spectralRadius(W) {
  const n = W.length; let x = new Array(n).fill(1 / Math.sqrt(n)), lam = 0;
  for (let it = 0; it < 500; it++) {
    const y = W.map(r => r.reduce((s, w, j) => s + w * x[j], 0));
    const norm = Math.sqrt(y.reduce((s, v) => s + v * v, 0));
    if (norm < 1e-14) return { rho: 0, vec: x };
    const nx = y.map(v => v / norm);
    const d = nx.reduce((s, v, i) => s + Math.abs(v - x[i]), 0);
    x = nx; lam = norm; if (d < 1e-13) break;
  }
  return { rho: lam, vec: x };
}
function inverse(A) {   // Gauss-Jordan
  const n = A.length, M = A.map((r, i) => r.concat(Array.from({ length: n }, (_, j) => i === j ? 1 : 0)));
  for (let c = 0; c < n; c++) {
    let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    [M[c], M[p]] = [M[p], M[c]];
    const d = M[c][c]; for (let j = 0; j < 2 * n; j++) M[c][j] /= d;
    for (let r = 0; r < n; r++) if (r !== c) { const f = M[r][c]; if (f) for (let j = 0; j < 2 * n; j++) M[r][j] -= f * M[c][j]; }
  }
  return M.map(r => r.slice(n));
}
/* Linear benchmark: h = (I-W)^-1 e_oai s0 (no caps, no switches). Valid only if rho<1. */
const exoOf = s0 => typeof s0 === 'number' ? { oai: s0 } : s0;
function leontief(W, s0) {
  const n = W.length, I = W.map((r, i) => r.map((w, j) => (i === j ? 1 : 0) - w)), L = inverse(I), ex = exoOf(s0);
  const h = L.map(r => GN.reduce((a, id, j) => a + r[j] * (ex[id] || 0), 0));
  const out = GN.map((_, j) => L.reduce((s, r, i) => s + (i === j ? 0 : r[j]), 0));   // total downstream multiplier of node j
  return { L, h, out };
}
/* Fragility thresholds in units of each node's own stress h. cw: default when interest coverage < k. orcl: capex freeze when leverage trips the trigger. */
function thresholds(p) {
  p = Object.assign({ k: 1.5, phi: 0.2, lam: 0.5, L: 4.4, trig: 4.5, on: true }, p);
  const nc = neocloud({ phi: p.phi, k: p.k, c: 1, f: 1 });
  return { cw: nc.xK, orcl: (1 - p.L / p.trig) / p.lam, on: p.on };
}
const GMODE = { cw: 'default', orcl: 'freeze' };
/* Synchronous diffusion with caps and a switch. A failed node sends signal 1 on demand edges.
   Only a DEFAULT (cw) also sends signal 1 on funding, capacity and credit edges. A freeze (orcl) halts capex but is not a default.
   Credit edges carry default only (binary), never partial revenue stress. */
function diffuse(E, s0, th, rounds) {
  rounds = rounds || 25;
  const n = GN.length, ex = exoOf(s0), idx = id => GN.indexOf(id);
  let h = GN.map(id => ex[id] || 0);
  const failed = {}, failRound = {}, firstRound = {}, hist = [h.slice()];
  GN.forEach(id => { if (h[idx(id)] > 0.0005) firstRound[id] = 0; });
  for (let t = 1; t <= rounds; t++) {
    const nh = GN.map(id => ex[id] || 0);
    E.forEach(e => {
      const j = idx(e.a), i = idx(e.b);
      let sig = h[j];
      if (e.kind === 'credit') sig = (failed[e.a] && GMODE[e.a] === 'default') ? 1 : 0;
      else if (failed[e.a]) sig = (GMODE[e.a] === 'default' || e.kind === 'demand') ? 1 : h[j];
      nh[i] += e.w * sig;
    });
    for (let i = 0; i < n; i++) nh[i] = Math.min(1, nh[i]);
    GN.forEach((id, i) => {
      if (th.on && th[id] !== undefined && !failed[id] && nh[i] >= th[id]) { failed[id] = true; failRound[id] = t; }
      if (nh[i] > 0.0005 && firstRound[id] === undefined) firstRound[id] = t;
    });
    const diff = nh.reduce((a, v, i) => a + Math.abs(v - h[i]), 0);
    h = nh; hist.push(h.slice());
    if (diff < 1e-10 && t > 3) break;
  }
  return { h, hist, failed: GN.filter(id => failed[id]), failRound, firstRound };
}
/* Dollar translation. Nvidia revenue loss = h_nv x annualised revenue. Lender loss = defaulted share of book x LGD. */
function dollars(d, s0) {
  const so = exoOf(s0).oai || 0, r = run(so, so), g = id => d.h[GN.indexOf(id)];
  const book = GCREDIT.cw + GCREDIT.orcl + GCREDIT.anth, cwDef = d.failed.includes('cw');
  return {
    cwDef, orclFreeze: d.failed.includes('orcl'),
    nvLoss: g('nv') * 4 * K.nv.qRev, nvPct: g('nv'),
    book, lenderLoss: g('lend') * book * (1 - K.cw.rec), lenderBookPct: g('lend'),
    lenderExpected: r.cw.expLoss, base: r
  };
}
/* Centralities */
function pagerank(W, d) {   // random surfer follows the direction of shock transmission: j -> i with prob w_ij / out_j
  d = d || 0.85; const n = W.length, out = new Array(n).fill(0);
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) out[j] += W[i][j];
  let pr = new Array(n).fill(1 / n);
  for (let it = 0; it < 300; it++) {
    const dang = pr.reduce((s, v, j) => s + (out[j] === 0 ? v : 0), 0);
    const np = pr.map((_, i) => (1 - d) / n + d * (dang / n + W[i].reduce((s, w, j) => s + (out[j] ? w / out[j] * pr[j] : 0), 0)));
    pr = np;
  }
  return pr;
}
function betweenness(W) {   // shortest paths on cost = -ln(min(w,0.999)); Floyd-Warshall with path counts
  const n = W.length, D = Array.from({ length: n }, () => new Array(n).fill(Infinity)), S = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) { D[i][i] = 0; S[i][i] = 1; }
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (W[i][j] > 0) { D[j][i] = -Math.log(Math.min(W[i][j], 0.999)); S[j][i] = 1; }
  const D0 = D.map(r => r.slice());
  for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    if (i === j || i === k || j === k) continue;
    const nd = D[i][k] + D[k][j];
    if (nd < D[i][j] - 1e-12) { D[i][j] = nd; S[i][j] = S[i][k] * S[k][j]; }
    else if (Math.abs(nd - D[i][j]) < 1e-12 && nd < Infinity) { S[i][j] += S[i][k] * S[k][j]; }
  }
  const B = new Array(n).fill(0);
  for (let s = 0; s < n; s++) for (let t = 0; t < n; t++) {
    if (s === t || D[s][t] === Infinity) continue;
    for (let v = 0; v < n; v++) {
      if (v === s || v === t) continue;
      if (Math.abs(D[s][v] + D[v][t] - D[s][t]) < 1e-9 && S[s][t] > 0) B[v] += S[s][v] * S[v][t] / S[s][t];
    }
  }
  return B;
}
function hhi(W) {   // concentration of each node's inbound dependence
  return W.map(r => { const tot = r.reduce((a, b) => a + b, 0); return tot ? r.reduce((a, w) => a + (w / tot) * (w / tot), 0) : 0; });
}
/* All simple cycles through DFS, length <= maxLen. Gain = product of weights. */
function cycles(E, maxLen) {
  maxLen = maxLen || 5;
  const adj = {}; GN.forEach(id => adj[id] = []);
  E.forEach(e => adj[e.a].push(e));
  const res = [];
  GN.forEach((start, si) => {
    const dfs = (node, path, ed) => {
      adj[node].forEach(e => {
        if (e.b === start && path.length >= 2) res.push({ nodes: path.slice(), edges: ed.concat([e]), gain: ed.concat([e]).reduce((g, x) => g * x.w, 1) });
        else if (!path.includes(e.b) && GN.indexOf(e.b) > si && path.length < maxLen) dfs(e.b, path.concat([e.b]), ed.concat([e]));
      });
    };
    dfs(start, [start], []);
  });
  return res.sort((a, b) => b.gain - a.gain);
}
/* kappa at which spectral radius reaches 1 (null if none in (0,1]) */
function kappaCritical(p) {
  const rho = k => spectralRadius(matrix(edges(Object.assign({}, p, { kappa: k })))).rho;
  if (rho(1) < 1) return null;
  let lo = 0, hi = 1; for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2; rho(m) < 1 ? lo = m : hi = m; }
  return (lo + hi) / 2;
}

