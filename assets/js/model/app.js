/* Inside the Model. Wrapped in a function so its names stay apart from the article's;
   parts.js calls it the first time the tab is shown, and calls the returned update() on later visits. */
window.startModel = function () {
const DATA = window.MODEL_DATA;
const N = DATA.nodes, S = DATA.S, FLAGS = DATA.flags;
const CAPEXWIDE = new Set(['TSM', 'SKH', 'MU', 'SSNLF', 'INTC', 'SNDK', 'WDC']);
const EQUIP = new Set(['Chips', 'Memory', 'Systems', 'Power', 'Foundry & tools']);
const BUILDERS = new Set(['Hyperscaler', 'Neocloud', 'Landlord']);
const REITS = new Set(['EQIX', 'DLR']);
const nm = t => (N[t] ? N[t].name : t).replace(' (private, S-1)', ' (private)').replace(' (incl. xAI)', '').replace('End users of AI (consumers and businesses)', 'End users').replace('Other buyers (enterprises, sovereigns, China, others)', 'Other buyers');
const B = x => '$' + (Math.abs(x) >= 100 ? Math.round(x) : Math.abs(x) >= 10 ? x.toFixed(1) : x.toFixed(2)) + 'B';
const B1 = x => '$' + (Math.abs(x) >= 100 ? Math.round(x) : x.toFixed(1)) + 'B';
const P = (x, d = 0) => (x * 100).toFixed(d) + '%';
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// payments F[buyer][seller]
// f scales the share set aside for buyers outside the map, for sellers whose buyers are allocated (G links).
function buildF(f) {
  const out = {};
  for (const [sel, sh] of Object.entries(S)) {
    const A = N[sel].A || 0, r = sh.ROW || 0;
    const tg = Object.entries(sh).filter(([b]) => b !== 'ROW' && FLAGS[b + '>' + sel] === 'G').reduce((a, [, x]) => a + x, 0);
    let k = 1;
    if (f !== 1 && r > 0 && tg > 0) { const r2 = Math.max(0, Math.min(r + tg, r * f)); k = (tg - (r2 - r)) / tg; }
    for (const [b, x] of Object.entries(sh)) { if (b === 'ROW') continue; const g = FLAGS[b + '>' + sel] === 'G'; (out[b] = out[b] || {})[sel] = (g ? x * k : x) * A; }
  }
  return out;
}
let F = buildF(1);
const base = i => { const n = N[i]; if (CAPEXWIDE.has(i) && n.R) return n.R; return n.A || n.R; };
// reported leverage for self-funded firms, backed out of the stored break line at the 5x (7.5x REIT) trigger
const LEV0 = {};
for (const [k, n] of Object.entries(N)) if (n.rule === 'A' && n.ebitda && n.gm) { const trig = REITS.has(k) ? 7.5 : 5; LEV0[k] = trig * (1 - n.gm * n.line * n.A / n.ebitda); }
const lineA = (k, trig) => { const n = N[k]; const T = REITS.has(k) ? trig + 2.5 : trig; return n.ebitda * (1 - LEV0[k] / T) / (n.gm * n.A); };

// ---------- financing feedback: funder -> recipient links ----------
const FUND = DATA.fund, GSH = DATA.gshare;
const RULEB = new Set(Object.keys(N).filter(k => N[k].rule === 'B'));
const TOTF = {}; FUND.forEach(([f, r, v]) => { TOTF[r] = (TOTF[r] || 0) + v; });
const PHI = {}; FUND.forEach(([f, r, v]) => { PHI[r] = PHI[r] || {}; PHI[r][f] = (PHI[r][f] || 0) + GSH[r] * v / TOTF[r]; });
const BOOKB = FUND.filter(([f, r]) => f === 'LEND' && RULEB.has(r)).reduce((a, x) => a + x[2], 0);
const FUNDERS = ['NVDA', 'SFTBY', 'AMZN', 'GOOGL', 'MSFT', 'APO', 'LEND'];
const DEF = { eps: 1, finLine: 0.2, lgd: 0.6, levTrig: 5, breaks: true, row: 0.3, fb: false, kappa: 1, lam: 1, sb: 1 };
let AS = Object.assign({}, DEF);

function run(c0, o = {}) {
  const eps = o.eps ?? AS.eps, lgd = o.lgd ?? AS.lgd, breaks = o.breaks ?? AS.breaks, finLine = o.finLine ?? AS.finLine, levTrig = o.levTrig ?? AS.levTrig;
  const edge0 = o.edge0 || {}, exclude = o.exclude || new Set(), failed = o.failed || new Set();
  const fb = o.fb ?? AS.fb, kappa = o.kappa ?? AS.kappa, lam = o.lam ?? AS.lam, sbm = o.sb ?? AS.sb, p0 = o.p0 || {};
  let c = Object.assign({}, c0); const broken = {}; const trace = [];
  const losses = cc => { const L = {}; for (const [b, row] of Object.entries(F)) { const cb = cc[b] || 0, eb = edge0[b]; for (const [s, f] of Object.entries(row)) { let x = cb; if (eb && EQUIP.has(N[s].layer)) x = Math.max(x, eb); if (x > 0) L[s] = (L[s] || 0) + x * f; } } return L; };
  const lineOf = i => { const n = N[i]; if (n.rule === 'B') return finLine; if (n.rule === 'A') return levTrig === 5 ? n.line : lineA(i, levTrig); return null; };
  const sumL = (L) => Object.entries(L).reduce((a, [k, v]) => a + (exclude.has(k) ? 0 : v), 0);
  let prevTot = 0;
  for (let it = 0; it < 300; it++) {
    const L = losses(c); const nw = Object.assign({}, c0); const newly = [];
    for (const [i, l] of Object.entries(L)) {
      const Bs = base(i); if (!Bs) continue;
      let ci = Math.min(1, eps * l / Bs); const n = N[i], A = n.A || Bs, ln = lineOf(i);
      if (breaks && (n.rule === 'A' || n.rule === 'B') && ln != null && l >= ln * A - 1e-12 && !broken[i]) { broken[i] = n.rule === 'A' ? 'freezes AI capex' : 'stops buying, lenders lose'; newly.push(i); }
      nw[i] = Math.max(nw[i] || 0, ci);
    }
    if (fb) {
      let lend = 0; for (const i in broken) if (N[i].rule === 'B') lend += lgd * (N[i].debt || 0);
      const st = k => { if (k === 'SFTBY') return Math.max(p0.SFTBY || 0, Math.min(1, sbm * (c.OAI || 0))); if (k === 'APO') return p0.APO || 0; if (broken[k]) return 1; const Bs = base(k); return Math.max(p0[k] || 0, Bs ? Math.min(1, eps * (L[k] || 0) / Bs) : 0); };
      const stL = Math.max(p0.LEND || 0, Math.min(1, lam * lend / BOOKB));
      for (const [r, d] of Object.entries(PHI)) {
        let x = 0; for (const [f, w] of Object.entries(d)) x += w * (f === 'LEND' ? (RULEB.has(r) ? stL : (p0.LEND || 0)) : st(f));
        x = Math.min(1, kappa * x); if (x > 0) nw[r] = 1 - (1 - (nw[r] || 0)) * (1 - x);
      }
    }
    for (const i in broken) nw[i] = 1;
    const tot = sumL(L); trace.push({ round: it + 1, total: tot, added: tot - prevTot, breaks: newly }); prevTot = tot;
    const keys = new Set([...Object.keys(nw), ...Object.keys(c)]); let same = true; for (const k of keys) if (Math.abs((nw[k] || 0) - (c[k] || 0)) > 1e-9) { same = false; break; }
    c = nw; if (same) break;
  }
  const L = losses(c); const dmg = sumL(L);
  const first = sumL(losses(c0));
  let lender = 0; const defaulted = new Set([...Object.keys(broken).filter(i => N[i].rule === 'B'), ...failed]);
  defaulted.forEach(i => lender += lgd * (N[i].debt || 0));
  // compress trace: drop trailing rounds that add nothing
  const tr = trace.filter((t, i) => i === 0 || Math.abs(t.added) > 0.005 || t.breaks.length);
  return { dmg, first, broken, lender, L, c, trace: tr };
}

// spectral radius of the linearised system (payments + funding links), by power iteration
function rhoOf(kappa, sbm, eps) {
  const ids = Object.keys(N).filter(k => k !== 'ROW'), ix = {}; ids.forEach((k, i) => ix[k] = i); const n = ids.length;
  const W = Array.from({ length: n }, () => new Float64Array(n));
  for (const [b, row] of Object.entries(F)) for (const [s, f] of Object.entries(row)) { const Bs = base(s); if (Bs && f > 0 && ix[b] != null) W[ix[s]][ix[b]] += eps * f / Bs; }
  for (const [r, d] of Object.entries(PHI)) for (const [f, w] of Object.entries(d)) if (f !== 'LEND' && f !== 'APO') W[ix[r]][ix[f]] += kappa * w;
  W[ix.SFTBY][ix.OAI] += sbm;
  let x = new Float64Array(n).fill(1), lam = 0;
  for (let it = 0; it < 3000; it++) { const y = new Float64Array(n); for (let i = 0; i < n; i++) { let t = 0; const Wi = W[i]; for (let j = 0; j < n; j++) t += Wi[j] * x[j]; y[i] = t; } let nr = 0; for (const v of y) nr = Math.max(nr, Math.abs(v)); if (nr < 1e-12) return 0; for (let i = 0; i < n; i++) x[i] = y[i] / nr + 1e-12; if (Math.abs(nr - lam) < 1e-10 && it > 50) { lam = nr; break; } lam = nr; }
  return lam;
}
const _kc = {};
function kappaCrit(sbm, eps) { const key = sbm + '|' + eps; if (_kc[key] != null) return _kc[key]; let lo = 0, hi = 50; if (rhoOf(hi, sbm, eps) < 1) return (_kc[key] = Infinity); for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (rhoOf(m, sbm, eps) < 1) lo = m; else hi = m; } return (_kc[key] = lo); }

// ---------- modes ----------
const ORIGINS = ['USERS', ...Object.keys(F).filter(b => b !== 'USERS')].filter(k => N[k]);
ORIGINS.sort((a, b) => (a === 'USERS' ? -1 : b === 'USERS' ? 1 : 0) || layerOrder(a) - layerOrder(b) || (N[b].A || 0) - (N[a].A || 0));
function layerOrder(k) { return ['Other', 'Lab', 'Hyperscaler', 'Neocloud', 'Landlord', 'Chips', 'Foundry & tools', 'Memory', 'Systems', 'Power'].indexOf(N[k].layer); }
const FIN = Object.keys(N).filter(k => N[k].rule === 'B');
const MODES = [
  ['one', 'One firm cuts its spending'],
  ['joint', 'Several firms cut at once'],
  ['policy', 'Building slows down'],
  ['squeeze', 'Funding squeeze'],
  ['contagion', 'One firm fails, lenders pull back'],
  ['funder', 'A funder pulls back']
];
let M = { mode: 'one', origin: 'OAI', cut: 30, theme: 0, custom: new Set(['OAI', 'ANTH']), customCut: 30, d: 20, withSqueeze: false, fall: 35, roundCut: 33.3, failer: 'WULF', phi: 30, funder: 'NVDA', pull: 30 };

function slider(id, label, min, max, step, val, fmt, help) {
  return `<div class="ctl"><div class="row"><label class="lbl" for="${id}">${label}</label><span class="val" id="${id}v">${fmt(val)}</span></div><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}">${help ? `<p class="help">${help}</p>` : ''}</div>`;
}
const opt = (k, sel) => `<option value="${k}"${k === sel ? ' selected' : ''}>${esc(nm(k))}</option>`;

function renderModes() {
  document.getElementById('modes').innerHTML = MODES.map(([k, l]) => `<button type="button" data-m="${k}" aria-pressed="${M.mode === k}">${l}</button>`).join('');
  document.querySelectorAll('#modes button').forEach(b => b.onclick = () => { M.mode = b.dataset.m; if (M.mode === 'funder' && !AS.fb) { AS.fb = true; renderFb(); } renderModes(); renderModeCtl(); update(); });
}
function renderModeCtl() {
  const h = document.getElementById('modectl'); let s = '';
  if (M.mode === 'one') {
    s = `<div class="ctl"><label class="lbl" for="origin">Which firm cuts its AI spending?</label><select id="origin">${ORIGINS.map(k => opt(k, M.origin)).join('')}</select><p class="help">"End users" means users pay the labs less.</p></div>` +
      slider('cut', 'By how much?', 5, 100, 5, M.cut, v => v + '%', 'Default: 30%, the same size for every firm so results can be compared.');
  } else if (M.mode === 'joint') {
    s = `<div class="ctl"><label class="lbl" for="theme">Which scenario?</label><select id="theme">${DATA.themes.map((t, i) => `<option value="${i}"${i === M.theme ? ' selected' : ''}>${esc(t.name)}</option>`).join('')}<option value="-1"${M.theme === -1 ? ' selected' : ''}>Build your own</option></select><p class="help" id="themenote">${M.theme >= 0 ? esc(DATA.themes[M.theme].note) : 'Tick the firms that cut, then set the size of the cut.'}</p></div>`;
    if (M.theme === -1) s += `<div class="ctl"><label class="lbl">Firms that cut</label><div class="checks">${ORIGINS.map(k => `<label><input type="checkbox" value="${k}"${M.custom.has(k) ? ' checked' : ''}> ${esc(nm(k))}</label>`).join('')}</div></div>` + slider('ccut', 'Each cuts by', 5, 100, 5, M.customCut, v => v + '%');
  } else if (M.mode === 'policy') {
    s = slider('d', 'Builders buy this much less equipment for one year', 5, 50, 5, M.d, v => v + '%', 'Builders are the big clouds, neoclouds, landlords and SpaceX. Rented capacity keeps being paid for. Default: 20%. UBS puts about 30% of 2028 additions at risk from state pauses.') +
      `<div class="ctl"><label><input type="checkbox" id="wsq"${M.withSqueeze ? ' checked' : ''}> Add the funding squeeze at the same time</label></div>`;
  } else if (M.mode === 'squeeze') {
    s = slider('fall', 'Neoclouds and landlords raise this much less outside money', 0, 80, 5, M.fall, v => v + '%', 'Default: 35%, the midpoint of their 26% to 40% share-price fall in October and early November 2026.') +
      slider('rc', 'OpenAI raises this much less from investors', 0, 80, 1, M.roundCut, v => Math.round(v) + '%', 'Default: a third, matching the cut in its funding round from $30B to $20B on 30 October 2026.');
  } else if (M.mode === 'contagion') {
    s = `<div class="ctl"><label class="lbl" for="failer">Which borrowed-money firm fails?</label><select id="failer">${FIN.map(k => opt(k, M.failer)).join('')}</select></div>` +
      slider('phi', 'After the failure, lenders cut new money to every similar firm by', 0, 100, 5, M.phi, v => v + '%', 'Default: 30%. Set it to 0% to see the firm fail alone.');
  }
  else if (M.mode === 'funder') {
    s = `<div class="ctl"><label class="lbl" for="funder">Which funder pulls back?</label><select id="funder">${FUNDERS.map(k => opt(k, M.funder)).join('')}</select><p class="help">A funder pulls back by withholding part of the equity, loans or guarantees it has committed. This shock works only through the funding links, so financing feedback is switched on for it.</p></div>` +
      slider('pull', 'By how much?', 5, 100, 5, M.pull, v => v + '%', 'Default: 30%.');
  }
  h.innerHTML = s;
  const bind = (id, key, num = true) => { const e = document.getElementById(id); if (!e) return; e.oninput = () => { M[key] = num ? +e.value : e.value; const v = document.getElementById(id + 'v'); if (v) v.textContent = e.type === 'range' ? fmtFor(id, +e.value) : ''; update(); }; };
  bind('cut', 'cut'); bind('ccut', 'customCut'); bind('d', 'd'); bind('fall', 'fall'); bind('rc', 'roundCut'); bind('phi', 'phi'); bind('pull', 'pull');
  const so = document.getElementById('origin'); if (so) so.onchange = () => { M.origin = so.value; update(); };
  const sfu = document.getElementById('funder'); if (sfu) sfu.onchange = () => { M.funder = sfu.value; update(); };
  const sf = document.getElementById('failer'); if (sf) sf.onchange = () => { M.failer = sf.value; update(); };
  const st = document.getElementById('theme'); if (st) st.onchange = () => { M.theme = +st.value; renderModeCtl(); update(); };
  const ws = document.getElementById('wsq'); if (ws) ws.onchange = () => { M.withSqueeze = ws.checked; update(); };
  h.querySelectorAll('.checks input').forEach(x => x.onchange = () => { x.checked ? M.custom.add(x.value) : M.custom.delete(x.value); update(); });
}
function fmtFor(id, v) { return id === 'rc' ? Math.round(v) + '%' : v + '%'; }

function renderAssume() {
  const h = document.getElementById('assume');
  h.innerHTML = slider('eps', 'Spending response', 0.25, 1.5, 0.05, AS.eps, v => (+v).toFixed(2) + '&times;', 'How hard a firm cuts its own spending per unit of lost revenue. 1 means in proportion.') +
    slider('fin', 'Break line for borrowed-money firms', 0.05, 0.5, 0.01, AS.finLine, v => P(+v), 'Share of contracted AI revenue a neocloud or landlord can lose before it stops buying. Calibrated on CoreWeave at about 20%.') +
    slider('lgd', 'Lenders lose, when a firm defaults', 0.2, 1, 0.05, AS.lgd, v => P(+v), 'Share of the failed firm\'s debt that lenders do not get back.') +
    slider('lev', 'Leverage line for self-funded firms', 4, 8, 0.25, AS.levTrig, v => (+v).toFixed(2) + '&times; EBITDA', 'Debt to EBITDA at which a self-funded firm freezes AI capex. The two REITs get 2.5 more.') +
    slider('row', 'Share of supplier revenue from buyers outside the map', 0.1, 0.6, 0.05, AS.row, v => P(+v), 'Applies to suppliers whose buyers are allocated. Disclosed links stay fixed. Default: 30%.') +
    `<div class="ctl"><label><input type="checkbox" id="brk"${AS.breaks ? ' checked' : ''}> Break lines switched on</label><p class="help">Switch off to see the network effect alone.</p></div>`;
  const b = (id, key, f) => { const e = document.getElementById(id); e.oninput = () => { AS[key] = +e.value; document.getElementById(id + 'v').innerHTML = f(+e.value); update(); }; };
  b('eps', 'eps', v => v.toFixed(2) + '&times;'); b('fin', 'finLine', v => P(v)); b('lgd', 'lgd', v => P(v)); b('lev', 'levTrig', v => v.toFixed(2) + '&times; EBITDA');
  { const e = document.getElementById('row'); e.oninput = () => { AS.row = +e.value; document.getElementById('rowv').innerHTML = P(AS.row); F = buildF(AS.row / 0.3); update(); }; }
  document.getElementById('brk').onchange = e => { AS.breaks = e.target.checked; update(); };
}
function renderFb() {
  const h = document.getElementById('fbctl'); if (!h) return;
  h.innerHTML = `<div class="modes" id="fbmode"><button type="button" data-v="0" aria-pressed="${!AS.fb}">Payments only</button><button type="button" data-v="1" aria-pressed="${AS.fb}">With financing feedback</button></div>` +
    (AS.fb ? `<div class="grid2c">` + slider('kap', 'How hard funders pull back', 0, 3, 0.05, AS.kappa, v => (+v).toFixed(2) + '&times;', 'A funder whose AI revenue falls 10% cuts what it provides by 10% times this. 1 means in proportion. 0 switches the feedback off.') +
      slider('sbm', 'SoftBank\'s funding follows OpenAI', 0, 1, 0.05, AS.sb, v => (+v).toFixed(2) + '&times;', 'SoftBank funds OpenAI partly with borrowed money against its holdings. At 1, it cuts its funding by the same share OpenAI cuts its spending. Set to 0 to drop this link.') +
      slider('lam', 'How hard lenders pull back after losses', 0, 5, 0.25, AS.lam, v => (+v).toFixed(2) + '&times;', 'Lenders cut new money to neoclouds and landlords by their loss rate on that book ($' + Math.round(BOOKB) + 'B) times this.') + `</div>` : `<p class="small" style="margin:0">Payments only is the model described below. Switch on financing feedback to let a funder in trouble cut the money it provides to its customers.</p>`);
  h.querySelectorAll('#fbmode button').forEach(b => b.onclick = () => { AS.fb = b.dataset.v === '1'; if (!AS.fb && M.mode === 'funder') { M.mode = 'one'; renderModes(); renderModeCtl(); } renderFb(); update(); });
  const bb = (id, key) => { const e = document.getElementById(id); if (!e) return; e.oninput = () => { AS[key] = +e.value; document.getElementById(id + 'v').innerHTML = (+e.value).toFixed(2) + '&times;'; update(); }; };
  bb('kap', 'kappa'); bb('sbm', 'sb'); bb('lam', 'lam');
}
const isDefault = () => AS.eps === DEF.eps && Math.abs(AS.finLine - DEF.finLine) < 1e-9 && Math.abs(AS.lgd - DEF.lgd) < 1e-9 && AS.levTrig === DEF.levTrig && AS.breaks === DEF.breaks && Math.abs(AS.row - DEF.row) < 1e-9;

function squeezeS0(fall, rc) { const s0 = {}; for (const [k, x] of Object.entries(DATA.ext)) s0[k] = +(fall / 100 * x).toFixed(3); s0.OAI = +(rc / 100 * DATA.extOAI).toFixed(3); return s0; }

function scenario() {
  // returns {title, c0, opts, article}
  if (M.mode === 'one') {
    const c0 = { [M.origin]: M.cut / 100 }; const r = DATA.res[M.origin];
    return { title: `${nm(M.origin)} cuts its AI spending by ${M.cut}%`, c0, o: {}, article: (M.cut === 30 && r) ? { v: r.caused, label: `a 30% cut at ${nm(M.origin)} (Part 3)` } : null, origins: [M.origin] };
  }
  if (M.mode === 'joint') {
    if (M.theme >= 0) { const t = DATA.themes[M.theme]; return { title: t.name, c0: t.s0, o: {}, article: { v: t.total, label: `the "${t.name}" scenario (Part 5)` }, origins: Object.keys(t.s0) }; }
    const c0 = {}; M.custom.forEach(k => c0[k] = M.customCut / 100);
    return { title: `${M.custom.size} firms each cut AI spending by ${M.customCut}%`, c0, o: {}, article: null, origins: [...M.custom] };
  }
  if (M.mode === 'policy') {
    const e0 = {}; for (const [k, n] of Object.entries(N)) if (BUILDERS.has(n.layer) || k === 'SPCX') e0[k] = M.d / 100;
    const c0 = M.withSqueeze ? squeezeS0(35, 33.3) : {};
    let art = null;
    if (!M.withSqueeze) { const p = DATA.policy.find(p => Math.abs(p.delay * 100 - M.d) < 0.01); if (p) art = { v: p.damage, label: `a ${M.d}% building slowdown (Part 5)` }; }
    else if (M.d === 20) art = { v: DATA.policyFund.damage, label: 'a 20% slowdown with the funding squeeze (Part 5)' };
    return { title: `Builders buy ${M.d}% less equipment for a year` + (M.withSqueeze ? ', plus the funding squeeze' : ''), c0, o: { edge0: e0 }, article: art, origins: [] };
  }
  if (M.mode === 'squeeze') {
    const c0 = squeezeS0(M.fall, M.roundCut);
    const art = (M.fall === 35 && Math.abs(M.roundCut - 33.3) < 0.01) ? { v: DATA.reflex.damage, label: 'the funding squeeze (Part 6)' } : null;
    return { title: `Funding squeeze: neoclouds raise ${M.fall}% less, OpenAI ${Math.round(M.roundCut)}% less`, c0, o: {}, article: art, origins: [] };
  }
  if (M.mode === 'funder') return { title: `${nm(M.funder)} pulls back ${M.pull}% of its funding`, c0: {}, o: { p0: { [M.funder]: M.pull / 100 }, fb: true }, article: null, origins: [] };
  const o = M.failer, c0 = { [o]: 1 };
  if (M.phi > 0) for (const k of FIN) if (k !== o && DATA.ext[k] != null) c0[k] = Math.max(c0[k] || 0, M.phi / 100 * DATA.ext[k]);
  const ct = DATA.contagion.find(x => x.origin === o); let art = null;
  if (ct) { const key = M.phi === 0 ? 'alone' : M.phi === 30 ? 'phi0.3' : M.phi === 60 ? 'phi0.6' : null; if (key) art = { v: ct[key].damage, label: `${nm(o)} failing${M.phi ? ' with lenders cutting ' + M.phi + '%' : ' alone'} (Part 6)` }; }
  return { title: `${nm(o)} fails` + (M.phi ? `, then lenders cut new money ${M.phi}%` : ', alone'), c0, o: { exclude: new Set([o]), failed: new Set([o]) }, article: art, origins: [o] };
}

function update() {
  const sc = scenario(); const r = run(sc.c0, sc.o); const lin = run(sc.c0, Object.assign({}, sc.o, { breaks: false })); const fbOn = sc.o.fb ?? AS.fb; const r0 = fbOn ? run(sc.c0, Object.assign({}, sc.o, { fb: false })) : null;
  const out = document.getElementById('out'); const brk = Object.keys(r.broken);
  const amp = r.first > 0.01 ? r.dmg / r.first : null;
  const chk = '';
  const losers = Object.entries(r.L).filter(([k]) => !(sc.o.exclude && sc.o.exclude.has(k))).map(([k, v]) => [k, v, v / (N[k].A || base(k) || 1)]).filter(x => x[1] > 0.005).sort((a, b) => b[1] - a[1]);
  const top = losers.slice(0, 15), mx = top.length ? top[0][1] : 1;
  const narrow = innerWidth < 640, fw = narrow ? 0.4 : 0.62;
  const bars = top.map(([k, v, sh]) => { const w = Math.max(0.5, 100 * v / mx); const b = !!r.broken[k]; return `<div class="r"><div class="nm${b ? ' brkname' : ''}" title="${esc(nm(k))}">${esc(nm(k))}</div><div class="tr"><div class="bar${b ? ' brk' : ''}" style="width:${(w * fw).toFixed(1)}%"></div><div class="tx" style="left:calc(${(w * fw).toFixed(1)}% + 6px)">${B(v)} · ${P(sh, sh < 0.1 ? 1 : 0)}${narrow ? '' : ' of AI revenue'}${b ? ' · breaks' : ''}</div></div></div>`; }).join('') + (narrow ? '<p class="small" style="margin:6px 0 0">Percentages are shares of each firm\'s AI revenue.</p>' : '');
  const rounds = r.trace.map(t => `<tr><td>${t.round}</td><td class="n">${B(t.added)}</td><td class="n">${B(t.total)}</td><td>${t.breaks.length ? t.breaks.map(k => `<span class="brkname">${esc(nm(k))}</span>`).join(', ') : ''}</td></tr>`).join('');
  out.innerHTML = `<h3 style="margin:0 0 10px">Result: ${esc(sc.title)}</h3>
  <div class="tiles"><div class="stat crit"><b>${B1(r.dmg)}</b><span>a year of revenue lost by other firms</span></div>
  ${sc.o.p0 && r.first < 0.05 ? (() => { const tc = Object.entries(r.c).filter(([k]) => N[k] && !r.broken[k] && !['SFTBY', 'APO', 'LEND'].includes(k)).sort((x, y) => (y[1] * Object.values(F[y[0]] || {}).reduce((a, v) => a + v, 0)) - (x[1] * Object.values(F[x[0]] || {}).reduce((a, v) => a + v, 0)))[0] || ['', 0]; return `<div class="stat"><b>${P(tc[1])}</b><span>cut in ${esc(nm(tc[0]))}'s spending, the largest in dollars. No purchase is cut at the start: all the damage travels through funding.</span></div>`; })() : `<div class="stat"><b>${B1(r.first)}</b><span>of it in the first round${amp ? ` (the network multiplies it ${amp.toFixed(2)} times)` : ''}</span></div>`}
  <div class="stat${brk.length ? ' crit' : ''}"><b>${brk.length}</b><span>${brk.length ? (brk.length === 1 ? 'firm breaks: ' : 'firms break: ') + brk.map(nm).join(', ') : 'firms break'}</span></div>
  <div class="stat"><b>${B1(r.lender)}</b><span>lost by lenders</span></div></div>
  ${fbOn ? (() => { const add = r.dmg - r0.dmg, nb = Object.keys(r.broken).filter(k => !r0.broken[k]); const rh = rhoOf(AS.kappa, AS.sb, AS.eps), kc = kappaCrit(AS.sb, AS.eps);
    return `<div class="check info"><b>Financing feedback adds ${B1(add)}</b>${r0.dmg > 0.05 ? ` (${(100 * add / r0.dmg).toFixed(0)}% on top of the ${B1(r0.dmg)} from payments only)` : ''}. ${nb.length ? 'It also breaks ' + nb.map(k => `<span class="brkname">${esc(nm(k))}</span>`).join(', ') + '.' : 'It breaks no extra firm.'} ${r.c.OAI != null && (sc.c0.OAI || 0) < 1 && r.c.OAI > (sc.c0.OAI || 0) + 0.005 ? `OpenAI ends up cutting ${P(r.c.OAI)} of its spending.` : ''}<br>Loop strength at these settings: spectral radius ${rh.toFixed(2)}. ${isFinite(kc) ? `The loops would feed on themselves without limit only if funders pulled back ${kc.toFixed(1)} times harder than their revenue loss.` : 'The loops never feed on themselves without limit at these settings.'}</div>`; })() : ''}
  ${chk}
  <p class="small">With break lines switched off, the same shock costs ${B1(lin.dmg)}. ${AS.breaks ? (r.dmg - lin.dmg > 0.05 ? `Break lines add ${B1(r.dmg - lin.dmg)}.` : 'No firm crosses its line, so break lines add nothing here.') : 'Break lines are switched off in this run.'}</p>
  <h4 style="margin:16px 0 8px">Who loses most</h4><div class="bars">${bars || '<p class="small">No firm loses revenue in this run.</p>'}</div>
  <h4 style="margin:16px 0 8px">Round by round</h4><div class="scroll"><table class="t"><thead><tr><th>Round</th><th>Added</th><th>Running total</th><th>Firms that break</th></tr></thead><tbody>${rounds}</tbody></table></div>
  <details class="how"><summary>Every firm's loss in this run</summary><div class="scroll"><table class="t"><thead><tr><th>Firm</th><th>Layer</th><th>Loss a year</th><th>Share of AI revenue</th><th>Break line</th><th>Status</th></tr></thead><tbody>${losers.map(([k, v, sh]) => { const n = N[k]; const ln = n.rule === 'B' ? AS.finLine : n.rule === 'A' ? (AS.levTrig === 5 ? n.line : lineA(k, AS.levTrig)) : null; return `<tr><td>${esc(nm(k))}</td><td>${esc(n.layer)}</td><td class="n">${B(v)}</td><td class="n">${P(sh, 1)}</td><td class="n">${ln == null ? 'none' : P(ln, 1)}</td><td>${r.broken[k] ? `<span class="brkname">${r.broken[k]}</span>` : ''}</td></tr>`; }).join('')}</tbody></table></div></details>`;
}

function tables() {
  const rows = Object.entries(N).filter(([k]) => !['USERS', 'ROW', 'LEND'].includes(k)).map(([k, n]) => `<tr><td>${esc(nm(k))}</td><td>${esc(n.layer)}</td><td class="n">${n.A != null ? B(n.A) : ''}</td><td>${esc(n.basis || '')}</td><td class="n">${n.R != null ? B(n.R) : ''}</td><td class="n">${n.ebitda != null ? B(n.ebitda) : ''}</td><td class="n">${n.debt != null ? B(n.debt) : ''}</td><td class="n">${n.gm != null ? P(n.gm) : ''}</td><td>${n.rule === 'A' ? 'self-funded' : n.rule === 'B' ? 'borrowed money' : ''}</td><td class="n">${n.line != null ? P(n.line, 1) : ''}</td></tr>`).join('');
  document.getElementById('tnodes').innerHTML = `<table class="t"><thead><tr><th>Firm</th><th>Layer</th><th>AI revenue at stake</th><th>How it is built</th><th>Revenue (12m)</th><th>EBITDA</th><th>Debt</th><th>Gross margin</th><th>Type</th><th>Break line</th></tr></thead><tbody>${rows}</tbody></table><p class="small">USD billions. Break line is the share of AI revenue the firm can lose before it breaks.</p>`;
  const lr = Object.entries(S).map(([sel, sh]) => `<tr><td>${esc(nm(sel))}</td><td class="n">${B(N[sel].A || 0)}</td><td>${Object.entries(sh).filter(([, x]) => x > 0.0005).sort((a, b) => b[1] - a[1]).map(([b, x]) => `${esc(nm(b))} ${P(x, 1)}${b !== 'ROW' && FLAGS[b + '>' + sel] ? ' <span class="tag">' + FLAGS[b + '>' + sel] + '</span>' : ''}`).join('; ')}</td></tr>`).join('');
  document.getElementById('tlinks').innerHTML = `<table class="t"><thead><tr><th>Seller</th><th>AI revenue</th><th>Paid by (share of AI revenue, source code)</th></tr></thead><tbody>${lr}</tbody></table><p class="small">S: disclosed. E: estimate from contracts or reports. G: allocated in proportion to buyers' capex.</p>`;

}
document.getElementById('reset').onclick = () => { const f = AS.fb; AS = Object.assign({}, DEF, { fb: f || M.mode === 'funder' }); F = buildF(1); renderAssume(); renderFb(); update(); };
document.getElementById('copyjson').onclick = async () => { try { await navigator.clipboard.writeText(JSON.stringify(DATA)); document.getElementById('copied').textContent = 'Copied.'; } catch (e) { document.getElementById('copied').textContent = 'Copy was blocked by the browser.'; } };
renderModes(); renderModeCtl(); renderFb(); renderAssume(); update(); tables();

addEventListener('resize', () => { clearTimeout(window._rz); window._rz = setTimeout(update, 150); });
return update;
};
