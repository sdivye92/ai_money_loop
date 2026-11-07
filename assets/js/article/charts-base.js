/* ===== charts: sections 1 to 4 ===== */
const CAP = 'var(--s1)', PUR = 'var(--s2)', CRD = 'var(--crit)', GRN = 'var(--s3)';

chart('c-years', h => {
  gcols(h, { cats: DATA_YEARS.map(y => String(y[0])), series: [{ name: 'Deal legs', c: 'var(--s1)', vals: DATA_YEARS.map(y => y[1]) }], h: 200, max: 60, yfmt: v => v, aria: 'Deal legs per year' });
});

chart('c-timeline', h => {
  const items = [
    ['Jan 2023', '<b>Microsoft to OpenAI</b>, reported $10B. Third phase, largely Azure credits.', 10, CAP],
    ['2023', '<b>Amazon and Google to Anthropic</b>, $4B and $2B. Both are also its cloud suppliers.', 6, CAP],
    ['Mar 2025', '<b>OpenAI to CoreWeave</b>, up to $11.9B, signed just before CoreWeave listed. CoreWeave also gave OpenAI $0.35B of stock.', 11.9, PUR],
    ['Sep 2025', '<b>OpenAI to Oracle</b>, about $300B over five years. Reported by the WSJ and never confirmed by either company.', 300, PUR],
    ['Sep 2025', '<b>Nvidia to Intel</b>, $5B of equity.', 5, CAP],
    ['Oct 2025', '<b>Blue Owl and Meta, Hyperion</b>, about $27B joint venture with a 16-year residual value guarantee.', 27, CRD],
    ['Oct 2025', '<b>AMD and OpenAI</b>, up to 6 GW of GPUs with warrants for up to 160M AMD shares. Only the first 1 GW is binding.', 0, PUR],
    ['Mar 2026', '<b>Nvidia to OpenAI</b>, $30B of equity at an $852B post-money valuation. It replaced a non-binding "up to $100B" letter of intent.', 30, CAP],
    ['May 2026', '<b>Broadcom</b> backs about $31B of debt in the $36B Anthropic TPU vehicle.', 31, CRD],
    ['Aug 2026', '<b>Nvidia guarantee</b> of up to $105B on OpenAI\'s Ohio campus leases.', 105, CRD],
    ['Oct 2026', '<b>Apollo lease</b> of about $40B of Nvidia chips to SpaceX. <b>Anthropic S-1</b> filed with $430B of take-or-pay compute.', 40, CRD]
  ];
  const mx = Math.sqrt(300);
  let s = '<div class="tl">';
  items.forEach(it => {
    const w = it[2] > 0 ? Math.max(3, Math.sqrt(it[2]) / mx * 100) : 0;
    s += `<div class="d">${it[0]}</div><div class="k"><i style="background:${it[3]}"></i></div><div class="t">${it[1]}${w ? `<div class="amt" data-tip="${esc('USD ' + it[2] + 'B (square-root scale)')}" style="width:${w.toFixed(1)}%;background:${it[3]}"></div>` : ''}</div>`;
  });
  s += '</div>' + legend([{ c: CAP, n: 'Capital' }, { c: PUR, n: 'Purchase commitment' }, { c: CRD, n: 'Credit support or vehicle' }]);
  h.innerHTML = s;
});

chart('c-moneyloop', h => {
  const W = 760, H = 400, N = {
    ohio: [110, 50, 'Ohio campus|(SB Energy)'], nv: [420, 50, 'Nvidia'], oai: [110, 220, 'OpenAI'], cl: [660, 220, 'Clouds|Oracle, Microsoft,|Amazon, CoreWeave'], sb: [110, 355, 'SoftBank']
  };
  const E = [
    ['nv', 'oai', '$30B equity', CAP, 0, 1], ['oai', 'cl', '$250B + $300B + $138B + $22B|cloud commitments', PUR, -12, 1], ['cl', 'nv', 'buy Nvidia systems', PUR, 26, 1],
    ['nv', 'cl', '$6.3B CoreWeave backstop|$36B capacity buybacks', CRD, 26, 0], ['nv', 'ohio', 'guarantees up to $105B', CRD, 0, 1], ['ohio', 'oai', '20-year lease', PUR, 0, 0], ['sb', 'oai', '$64.6B equity', CAP, 0, 0]
  ];
  let s = `<defs>${[['a1', CAP], ['a2', PUR], ['a3', CRD]].map(m => `<marker id="${m[0]}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0L10 5L0 10z" style="fill:${m[1]}"/></marker>`).join('')}</defs>`;
  E.forEach(e => {
    const A = N[e[0]], B = N[e[1]], dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, off = e[4];
    const x1 = A[0] + ux * 66, y1 = A[1] + uy * 32, x2 = B[0] - ux * 70, y2 = B[1] - uy * 36;
    const cx = (x1 + x2) / 2 - uy * off * 2, cy = (y1 + y2) / 2 + ux * off * 2;
    const m = e[3] === CAP ? 'a1' : e[3] === PUR ? 'a2' : 'a3';
    s += `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}" fill="none" stroke-width="2.4" marker-end="url(#${m})" style="stroke:${e[3]}"/>`;
    const lx = 0.25 * x1 + 0.5 * cx + 0.25 * x2, ly = 0.25 * y1 + 0.5 * cy + 0.25 * y2, ls = e[2].split('|');
    ls.forEach((t, k) => { s += T(lx, (off < 0 ? ly - 8 - (ls.length - 1 - k) * 13 : ly + (off > 0 ? 6 + k * 13 : 4 + k * 13 - (ls.length - 1) * 6.5)), esc(t), { a: 'middle', s: 11, f: 'var(--ink)', halo: 1 }); });
  });
  Object.values(N).forEach(n => {
    const ls = n[2].split('|');
    s += `<rect x="${n[0] - 62}" y="${n[1] - 28}" width="124" height="56" rx="8" style="fill:var(--surf);stroke:var(--axis)" stroke-width="1.5"/>`;
    ls.forEach((t, k) => { s += T(n[0], n[1] + (k - (ls.length - 1) / 2) * 13 + 4, esc(t), { a: 'middle', s: k ? 10.5 : 13, w: k ? 400 : 700, f: 'var(--ink)' }); });
  });
  h.innerHTML = svgWrap(W, H, s, 'The central financing loop between Nvidia, OpenAI, the cloud providers, SoftBank and the Ohio campus') + legend([{ c: CAP, n: 'Capital' }, { c: PUR, n: 'Purchase or lease commitment' }, { c: CRD, n: 'Credit support' }]);
});

chart('c-headline', h => {
  const rows = [
    { label: 'Nvidia into OpenAI', bars: [{ v: 100, c: 'var(--axis)', lab: '$100B letter of intent (non-binding)' }, { v: 30, c: CAP, lab: '$30B equity closed' }] },
    { label: 'Support for OpenAI', bars: [{ v: 600, c: 'var(--axis)', lab: '$600B reported' }, { v: 105, c: CRD, lab: '$105B guarantee (signed)' }] }
  ];
  hbars(h, rows, { rh: 42, bh: 12, max: 700, legend: [{ c: 'var(--axis)', n: 'Headline or reported' }, { c: CAP, n: 'Signed or closed' }] });
  h.insertAdjacentHTML('beforeend', '<p class="small" style="margin:8px 0 0">The reported $600B for OpenAI combined a $250B guarantee and $350B of financing; what was signed is a guarantee capped at $105B. AMD and OpenAI is the same pattern in power and not dollars: 6 GW agreed, 1 GW binding.</p>');
});

chart('c-firm', h => {
  const col = { S: CAP, E: CAP, C: 'var(--s3)', G: CRD, D: 'var(--s3)', N: 'var(--axis)', X: 'var(--mut)', A: 'var(--mut)' };
  hbars(h, WB.firm.map(f => ({ label: f.label, note: f.n + ' legs', bars: [{ v: f.amt, c: col[f.code], lab: '$' + f.amt.toFixed(0) + 'B', tip: f.label + '<br>' + f.n + ' legs, $' + f.amt.toFixed(1) + 'B gross' }] })), { rh: 38, max: 2000, fmt: v => '$' + v + 'B' });
});

/* ===== network figure ===== */
const POS = { oai: [130, 250], orcl: [390, 80], cw: [390, 250], msft: [390, 420], meta: [130, 450], nv: [660, 250], lend: [660, 70], sb: [130, 60], anth: [660, 430], amzn: [840, 340] };
let NETSEL = 1;
function edgeGeom(e, E) {
  const a = POS[e.a], b = POS[e.b], dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len;
  const rev = E.some(o => o.a === e.b && o.b === e.a), sign = rev ? (e.a < e.b ? 1 : -1) * 0.16 : 0.07;
  const sx = a[0] + ux * 28, sy = a[1] + uy * 28, ex = b[0] - ux * 34, ey = b[1] - uy * 34;
  const cx = (a[0] + b[0]) / 2 - uy * len * sign, cy = (a[1] + b[1]) / 2 + ux * len * sign;
  return { d: `M${sx.toFixed(1)} ${sy.toFixed(1)}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`, lx: 0.25 * sx + 0.5 * cx + 0.25 * ex, ly: 0.25 * sy + 0.5 * cy + 0.25 * ey };
}
chart('c-net', h => {
  const sc = DATA.scen[NETSEL], E = DATA.edges, hv = sc.h;
  const btns = document.getElementById('netbtns');
  btns.innerHTML = DATA.scen.map((s, i) => `<button type="button" aria-pressed="${i === NETSEL}" data-i="${i}">${esc(s.name)}</button>`).join('');
  btns.querySelectorAll('button').forEach(b => b.onclick = () => { NETSEL = +b.dataset.i; renderAll(); });
  let s = `<defs><marker id="ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="9" markerHeight="9" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0L10 5L0 10z" style="fill:var(--ink2)"/></marker></defs>`;
  E.forEach(e => {
    const g = edgeGeom(e, E), w = 1 + 4 * Math.min(1, e.w), dash = e.st === 'assumed' ? 'stroke-dasharray="6 4"' : e.st === 'derived' ? 'stroke-dasharray="2 3"' : '';
    s += `<path d="${g.d}" fill="none" stroke-width="${w.toFixed(1)}" ${dash} marker-end="url(#ar)" style="stroke:var(--ink2);opacity:.5"/>`;
    s += `<path d="${g.d}" fill="none" stroke-width="12" stroke="transparent" data-tip="${esc(DATA_GL[e.a] + ' to ' + DATA_GL[e.b] + '<br>weight ' + e.w.toFixed(3) + ' (' + e.st + ', ' + e.kind + ')')}"/>`;
    if (e.w >= 0.06 && e.st !== 'assumed') s += T(g.lx, g.ly, e.w.toFixed(2), { a: 'middle', s: 11, m: 1, f: 'var(--ink)', halo: 1 });
  });
  DATA_GN.forEach(id => {
    const [x, y] = POS[id], v = hv[id], fail = sc.failed.includes(id), tag = fail ? (id === 'cw' ? 'DEFAULT RISK' : 'CAPEX FREEZE') : '';
    s += `<g data-tip="${esc('<b>' + DATA_GL[id] + '</b><br>stress ' + pc(v) + ' of ' + DATA_BASE[id])}"><circle cx="${x}" cy="${y}" r="26" style="fill:var(--surf);stroke:${fail ? 'var(--crit)' : 'var(--axis)'}" stroke-width="${fail ? 3 : 1.5}"/><circle cx="${x}" cy="${y}" r="26" style="fill:var(--s1);opacity:${(0.06 + 0.94 * Math.min(1, v)).toFixed(2)}"/>` +
      T(x, y + 4, (v * 100).toFixed(0) + '%', { a: 'middle', s: 12, w: 700, m: 1, f: v > 0.55 ? 'var(--on)' : 'var(--ink)' }) + T(x, y - 34, DATA_GL[id], { a: 'middle', s: 13, w: 500, f: 'var(--ink)', halo: 1 }) +
      (tag ? T(x, y + 46, tag, { a: 'middle', s: 10, w: 700, m: 1, f: 'var(--crit)', halo: 1 }) : '') + '</g>';
  });
  h.innerHTML = svgWrap(900, 500, s, 'Weighted dependency network of ten firms shaded by stress');
  const strip = document.getElementById('netstrip');
  strip.innerHTML = stat('OpenAI shock s0', pc(sc.s0, 0)) + stat('Microsoft and Meta cut', pc(sc.cut, 0)) + stat('Fails', sc.failed.length ? sc.failed.map(f => DATA_GL[f]).join(' and ') : 'none', sc.failed.length ? 'crit' : '') + stat('Nvidia revenue at risk', fB(sc.nvLoss, 1) + ' a year') + stat('Lender loss', fB(sc.lenderLoss, 1), sc.lenderLoss > 0 ? 'crit' : '') + stat('Spectral radius', f2(DATA.rho, 3));
});

chart('c-binding', h => {
  const rows = WB.nodes.filter(n => n.outBind + n.inBind > 20).sort((a, b) => (b.outBind + b.inBind) - (a.outBind + a.inBind)).slice(0, 12);
  hbars(h, rows.map(n => ({ label: n.node, bars: [{ v: n.outBind, c: 'var(--s2)', lab: 'sends $' + n.outBind.toFixed(0) + 'B', tip: n.node + ' sends $' + n.outBind.toFixed(1) + 'B binding' }, { v: n.inBind, c: 'var(--s1)', lab: 'receives $' + n.inBind.toFixed(0) + 'B', tip: n.node + ' receives $' + n.inBind.toFixed(1) + 'B binding' }] })), { rh: 36, bh: 10, max: 800, legend: [{ c: 'var(--s2)', n: 'Binding commitments sent' }, { c: 'var(--s1)', n: 'Binding commitments received' }] });
});

chart('c-outmult', h => {
  const rows = DATA_GN.map((id, i) => ({ id, v: DATA.cent.out[i] })).filter(r => r.v > 0).sort((a, b) => b.v - a.v);
  hbars(h, rows.map(r => ({ label: DATA_GL[r.id], bars: [{ v: r.v, c: r.v > 1 ? 'var(--crit)' : 'var(--s1)', lab: r.v.toFixed(2), tip: DATA_GL[r.id] + ' out multiplier ' + r.v.toFixed(3) }] })), { rh: 28, bh: 10, max: 2.7 });
});

/* ===== stress timeline ===== */
chart('c-stress', h => {
  const it = [
    ['Mar', 'OpenAI and Oracle drop the Abilene expansion. Nvidia puts down a $150M deposit.', 0, PUR],
    ['28 Apr', 'WSJ: OpenAI missed internal sales targets.', 0, PUR],
    ['9 Jul', 'S&P cuts Oracle to BBB-, citing leverage above 4x, negative free cash flow and OpenAI dependence.', 0, CRD],
    ['27 Jul', 'Nvidia guarantee talks unsettle the debt market. Huang\'s $600B figure is an estimate and not a contract.', 0, PUR],
    ['Aug', 'Nvidia signs the $105B Ohio guarantee and $500B platform MOUs.', 0, CAP],
    ['8 Oct', 'FT: OpenAI annualised revenue about $50B against $68B reported. CoreWeave -7.8%, Oracle -5.5%, Nvidia -2.9%.', 0, CRD],
    ['13 Oct', 'IMF Global Financial Stability Report names an AI correction among three salient risks.', 0, CRD],
    ['15 Oct', 'CoreWeave 5-year CDS reaches a record 1,194.5bp.', 0, CRD],
    ['26 Oct', 'Anthropic files its S-1. Microsoft offers 60,000 voluntary buyouts.', 0, CAP],
    ['27 Oct', 'Meta prices a $25B stock offering at $625, about five times oversubscribed. SpaceX $40B Apollo lease.', 0, CAP],
    ['30 Oct', 'OpenAI cuts its round from $30B to $20B and its target valuation from $1.4T to $1.25T. Only about $11B is secured.', 0, CRD],
    ['4 Nov', 'Neocloud stocks are down 26% to 40% since early October. CoreWeave debt including leases is $51.6B against about $30B of market value (Trending Topics, secondary source).', 0, CRD]
  ];
  h.innerHTML = '<div class="tl">' + it.map(i => `<div class="d">${i[0]}</div><div class="k"><i style="background:${i[3]}"></i></div><div class="t">${i[1]}</div>`).join('') + '</div>' + legend([{ c: CRD, n: 'Stress signal' }, { c: PUR, n: 'Setback or dispute' }, { c: CAP, n: 'Capital raised or deal signed' }]);
});

chart('c-oct8', h => {
  const rows = [['CoreWeave', 7.8, 21.5, 'OpenAI is 21.5% of backlog'], ['Oracle', 5.5, 46.1, 'OpenAI is 46.1% of RPO'], ['Microsoft', 1.3, 10.8, 'OpenAI is 10.8% of quarterly revenue']];
  hbars(h, rows.map(r => ({ label: r[0] + ': fell ' + r[1] + '% on 8 October', note: r[3], bars: [{ v: r[1] / r[2], c: r[0] === 'CoreWeave' ? 'var(--crit)' : 'var(--s1)', lab: (r[1] / r[2]).toFixed(2) + ' points per point', tip: r[0] + ': ' + r[1] + '% fall over ' + r[2] + '% exposure' }] })), { rh: 40, bh: 11, max: 0.45 });
});

chart('c-capex', h => {
  gcols(h, { cats: ['Meta|Q3 2026 (quarter)', 'Oracle|FY2026 (year)'], series: [{ name: 'Operating cash flow', c: 'var(--s1)', vals: [32.79, 32.0], fmt: v => '$' + v.toFixed(1) + 'B' }, { name: 'Capex', c: 'var(--s2)', vals: [34.91, 55.6], fmt: v => '$' + v.toFixed(1) + 'B' }], h: 250, max: 65, yfmt: v => '$' + v });
});

/* ===== joints ===== */
chart('c-heat', h => {
  const cs = [0.2, 0.33, 0.5, 0.67, 0.8, 1.0], fs = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6];
  const w = widthOf(h), cw = (w - 120) / fs.length, chh = 34, top = 44; let s = '';
  fs.forEach((f, j) => { s += T(110 + cw * (j + 0.5), top - 10, pc(f, 0), { a: 'middle', s: 11.5, f: 'var(--ink2)' }); });
  s += T(110 + cw * fs.length / 2, 14, 'Cut in that customer\'s orders', { a: 'middle', s: 12, f: 'var(--ink)' });
  cs.forEach((c, i) => {
    s += T(100, top + chh * (i + 0.5) + 4, pc(c, 0) + ' of revenue', { a: 'end', s: 11.5, f: 'var(--ink2)' });
    fs.forEach((f, j) => {
      const n = neocloud({ c, f }), v = n.cov, fill = v < 1 ? 'var(--crit)' : v < 1.5 ? 'var(--warn)' : 'var(--s1)', op = v < 1.5 ? 0.9 : 0.15 + 0.5 * Math.min(1, (v - 1.5) / 0.8);
      const sel = Math.abs(c - 0.67) < 1e-9 && Math.abs(f - 0.3) < 1e-9;
      s += `<rect x="${(110 + cw * j + 1).toFixed(1)}" y="${top + chh * i + 1}" width="${(cw - 2).toFixed(1)}" height="${chh - 2}" rx="3" data-tip="${esc('customer ' + pc(c, 0) + ' of revenue, cut ' + pc(f, 0) + '<br>cover ' + v.toFixed(2) + 'x<br>' + (n.insolvent ? 'below 1.0x' : n.breach ? 'covenant breached' : 'above covenant'))}" style="fill:${fill};opacity:${op}" ${sel ? 'stroke="var(--ink)" stroke-width="2"' : ''}/>`;
      s += T(110 + cw * (j + 0.5), top + chh * (i + 0.5) + 4, v.toFixed(2), { a: 'middle', s: 11, m: 1, f: v < 1 ? 'var(--on)' : 'var(--ink)' });
    });
  });
  h.innerHTML = svgWrap(w, top + chh * cs.length + 6, s, 'Heat map of CoreWeave interest cover') + legend([{ c: 'var(--s1)', n: 'Above 1.5x covenant' }, { c: 'var(--warn)', n: 'Covenant breached' }, { c: 'var(--crit)', n: 'Cover below 1.0x' }]);
});

let COLSEL = 'bullet';
chart('c-collat', h => {
  const b = document.getElementById('collbtns');
  b.innerHTML = [['bullet', 'Bullet loan'], ['amort', 'Amortising loan']].map(x => `<button type="button" aria-pressed="${COLSEL === x[0]}" data-m="${x[0]}">${x[1]}</button>`).join('');
  b.querySelectorAll('button').forEach(x => x.onclick = () => { COLSEL = x.dataset.m; renderAll(); });
  const c = collateral({ bullet: COLSEL === 'bullet', d: 0.2, adv: 0.65, haircut: 0.4, years: 6, term: 5 });
  lines(h, {
    aria: 'GPU loan collateral value and balance over time', xlab: 'years since the loan', xname: 'year', xfmt: x => x + 'y', yfmt: v => v.toFixed(0), y0: 0, y1: 105, x0: 0, x1: 6, h: 280,
    series: [{ name: 'Market value', c: 'var(--s1)', pts: c.rows.map(r => [r.t, r.V]) }, { name: 'Forced-sale recovery', c: 'var(--s2)', pts: c.rows.map(r => [r.t, r.rec]) }, { name: 'Loan balance', c: 'var(--crit)', pts: c.rows.map(r => [r.t, r.L]) }]
  });
});

chart('c-breakeven', h => {
  const pts = []; for (let n = 2; n <= 8; n += 0.25) pts.push([n, breakevenRent({ n })]);
  lines(h, { aria: 'Break-even rent against economic life', xlab: 'economic life of the GPU, years', xname: 'life', xfmt: x => x + 'y', yfmt: v => '$' + v.toFixed(2), y0: 0, y1: 4.2, x0: 2, x1: 8, h: 270, series: [{ name: 'Break-even rent', c: 'var(--s1)', pts }], refs: [{ y: 2.35, label: 'Rent now $2.35', c: 'var(--s3)' }, { y: 1.7, label: 'Rent now $1.70', c: 'var(--warn)' }], mark: { x: 5, y: breakevenRent({ n: 5 }), label: '5 years: $' + breakevenRent({ n: 5 }).toFixed(2) } });
});

chart('c-eff', h => {
  const mk = (eps, name, c) => { const pts = []; for (let k = 1; k <= 4.001; k += 0.1) pts.push([k, effShock({ e: k, eps }).p1]); return { name, c, pts }; };
  lines(h, { aria: 'Equilibrium GPU rent after an efficiency gain', xlab: 'efficiency gain k (same output with 1/k of the compute)', xname: 'k', xfmt: x => x + 'x', yfmt: v => '$' + v.toFixed(2), y0: 0, x0: 1, x1: 4, h: 280, series: [mk(0.6, 'Inelastic, ε = 0.6', 'var(--s2)'), mk(1.0, 'Unit elastic, ε = 1', 'var(--axis)'), mk(1.5, 'Elastic, ε = 1.5', 'var(--s3)')], refs: [{ y: breakevenRent({ n: 5 }), label: 'Break-even $1.71', c: 'var(--crit)' }] });
});

chart('c-delay', h => {
  const mk = (g, name, c) => { const pts = []; for (let m = 0; m <= 18; m += 1) pts.push([m, delayLoss({ g, m }).loss]); return { name, c, pts }; };
  lines(h, { aria: 'Value lost per GPU by months idle', xlab: 'months the GPU sits idle', xname: 'months', xfmt: x => x + 'm', yfmt: v => '$' + v.toFixed(0), y0: 0, x0: 0, x1: 18, h: 260, series: [mk(0.25, 'Decay 25% a year', 'var(--s2)'), mk(0.1, 'Decay 10% a year', 'var(--s1)'), mk(0, 'No decay', 'var(--axis)')], mark: { x: 6, y: delayLoss({ m: 6 }).loss, label: '6 months: $' + delayLoss({ m: 6 }).loss.toFixed(0) } });
});

chart('c-tencent', h => {
  const rows = [[0.25, 0.6], [0.5, 0.8], [0.75, 0.9], [1.0, 1.0]].map(x => ({ hh: x[0], s: x[1], c: cancelledContract({ h: x[0], s: x[1] }) }));
  hbars(h, rows.map(r => ({ label: pc(r.hh, 0) + ' of GPUs re-let at ' + pc(r.s, 0) + ' of the old price', note: 'lost ' + pc(r.c.lostPct, 0), bars: [{ v: r.c.recovered, c: 'var(--s3)', lab: 'recovered $' + r.c.recovered.toFixed(1) + 'B' }, { v: r.c.lost, c: 'var(--crit)', lab: 'lost $' + r.c.lost.toFixed(1) + 'B' }] })), { rh: 52, bh: 10, max: 8.2, legend: [{ c: 'var(--s3)', n: 'Recovered' }, { c: 'var(--crit)', n: 'Lost' }] });
});

chart('c-consumer', h => {
  const o = consumerLoop({});
  hbars(h, [{ label: 'Memory price rise', bars: [{ v: o.openPm * 100, c: 'var(--axis)', lab: 'open loop ' + (o.openPm * 100).toFixed(1) + '%' }, { v: o.closedPm * 100, c: 'var(--s1)', lab: 'with feedback ' + (o.closedPm * 100).toFixed(1) + '%' }] },
    { label: 'Device price rise', bars: [{ v: o.devicePrice * 100, c: 'var(--s2)', lab: (o.devicePrice * 100).toFixed(2) + '%' }] }, { label: 'Device units sold', bars: [{ v: Math.abs(o.units) * 100, c: 'var(--crit)', lab: '-' + (Math.abs(o.units) * 100).toFixed(2) + '%' }] }], { rh: 40, bh: 10, max: 14 });
});
chart('c-vendor', h => {
  const v = vendorHit({});
  hbars(h, [{ label: 'Intel data-centre and AI share of product revenue', bars: [{ v: 32.5, c: 'var(--axis)', lab: 'before 32.5%' }, { v: 47.4, c: 'var(--s1)', lab: 'now 47.4%' }] }, { label: 'Revenue lost in a 20% AI capex cut', bars: [{ v: v.hitBefore * 100, c: 'var(--axis)', lab: 'before ' + (v.hitBefore * 100).toFixed(1) + '%' }, { v: v.hitAfter * 100, c: 'var(--crit)', lab: 'now ' + (v.hitAfter * 100).toFixed(1) + '%' }] }], { rh: 40, bh: 10, max: 55 });
});

chart('c-neosell', h => {
  const r = [['WhiteFiber', 39.8], ['CoreWeave', 39.2], ['IREN', 39.0], ['HIVE Digital', 38.3], ['Nebius', 36.1], ['ChronoScale', 29.7], ['Hut 8', 25.9], ['PHLX Semiconductor Index', 15.4], ['Nasdaq Composite (October)', 5.3]];
  hbars(h, r.map(x => ({ label: x[0], bars: [{ v: x[1], c: x[1] > 20 ? 'var(--crit)' : 'var(--axis)', lab: '-' + x[1] + '%', tip: x[0] + ': -' + x[1] + '%' }] })), { rh: 30, bh: 10, max: 45 });
});

/* ===== charts: sections 5 to 14 ===== */
const LNK = (u, t) => `<a href="${u}" target="_blank" rel="noopener">${t}</a>`;
const IDX = id => GN.indexOf(id);

chart('c-scentable', h => {
  const rows = DATA.scen.map(s => [`<b>${esc(s.name)}</b>`, pc(s.s0, 0), pc(s.cut, 0), pc(s.h.orcl), pc(s.h.cw), pc(s.h.nv), s.failed.length ? s.failed.map(f => GL[f]).join(' and ') : 'none', fB(s.nvLoss, 1), fB(s.nvLossLin, 1), fB(s.lenderLoss, 1)]);
  h.innerHTML = table(['Scenario', 'OpenAI shock', 'MSFT and Meta cut', 'Oracle stress', 'CoreWeave stress', 'Nvidia stress', 'Fails', 'Nvidia at risk (switched)', 'Nvidia at risk (linear)', 'Lender loss'], rows, { num: [1, 2, 3, 4, 5, 7, 8, 9] });
});

chart('c-rounds', h => {
  const ids = [['oai', 'OpenAI', 'var(--ink2)'], ['orcl', 'Oracle', 'var(--s2)'], ['cw', 'CoreWeave', 'var(--crit)'], ['nv', 'Nvidia', 'var(--s1)'], ['msft', 'Microsoft', 'var(--s3)']];
  lines(h, { aria: 'Stress by round in the base case', xlab: 'round', xname: 'round', xfmt: x => x, yfmt: v => (v * 100).toFixed(0) + '%', y0: 0, x0: 0, x1: 13, h: 280, series: ids.map(d => ({ name: d[1], c: d[2], pts: DATA.hist.map((r, i) => [i, r[d[0]]]) })), refs: [{ y: DATA.th.cw, label: 'CW default 19.4%', c: 'var(--crit)' }, { y: DATA.th.orcl, label: 'Oracle freeze 4.4%', c: 'var(--warn)' }], rpad: 130 });
});

chart('c-sweep', h => {
  lines(h, { aria: 'Nvidia revenue at risk against OpenAI shock', xlab: 'OpenAI shock s0', xname: 's0', xfmt: x => pc(x, 0), yfmt: v => '$' + v.toFixed(0) + 'B', y0: 0, x0: 0, x1: 0.8, h: 300, rpad: 120,
    series: [{ name: 'With thresholds', c: 'var(--crit)', pts: DATA.sweep.map(r => [r.s, r.nv]) }, { name: 'Linear (no thresholds)', c: 'var(--s1)', dash: 1, pts: DATA.sweep.map(r => [r.s, r.nvLin]) }],
    xrefs: [{ x: DATA.tip.orclFreeze, label: 'Oracle freezes', c: 'var(--warn)' }, { x: DATA.tip.cwDefaultS0Only, label: 'CoreWeave defaults', c: 'var(--crit)' }] });
});

chart('c-loopgain', h => {
  const nm = c => c.nodes.map(n => GL[n]).join(' > ') + ' > ' + GL[c.nodes[0]];
  hbars(h, DATA.cyc.map(c => ({ label: nm(c), note: 'x' + c.mult.toFixed(3), bars: [{ v: c.gain, c: 'var(--s1)', lab: 'gain ' + c.gain.toFixed(4), tip: nm(c) + '<br>gain ' + c.gain.toFixed(5) + '<br>multiplier ' + c.mult.toFixed(4) }] })), { rh: 36, bh: 10, max: 0.12 });
  document.getElementById('loopstats').innerHTML = stat('Spectral radius of the demand network', f2(DATA.rho, 3), 'good') + stat('Critical back-edge strength κ', f2(DATA.kc, 3)) + stat('Assumed κ', '0.100') + stat('Largest loop multiplier', 'x' + DATA.cyc[0].mult.toFixed(2));
});

chart('c-loops', h => {
  const L = [
    { id: 'l1', title: 'OpenAI and SoftBank', nodes: ['OpenAI|valuation', 'SoftBank|stake and funding'], signs: ['+', '+'], kind: 'R', center: 'x1.11' },
    { id: 'l2', title: 'OpenAI and Oracle', nodes: ['OpenAI|revenue', 'Oracle|backlog and capex'], signs: ['+', '+'], kind: 'R', center: 'x1.05' },
    { id: 'l3', title: 'Oracle and Nvidia loop', nodes: ['OpenAI', 'Oracle|capex', 'Nvidia|revenue and stake'], signs: ['+', '+', '+'], kind: 'R', center: 'x1.003' },
    { id: 'l4', title: 'GPU collateral loop', nodes: ['Chip resale|price', 'Collateral|value', 'Lender|tightening', 'Forced|sales'], signs: ['+', '-', '+', '-'], kind: 'R', center: 'not modelled' },
    { id: 'l5', title: 'Consumer memory loop', nodes: ['Memory|demand', 'Memory|price', 'Device|price', 'Device|sales'], signs: ['+', '+', '-', '+'], kind: 'B', center: 'x0.88' }
  ];
  h.innerHTML = L.map(l => `<div class="stat" style="padding:8px"><span style="font-weight:600;color:var(--ink)">${esc(l.title)}</span>${loopSvg(l)}</div>`).join('');
});

chart('c-cent', h => {
  const rows = GN.map((id, i) => [GL[id], DATA.cent.pr[i].toFixed(3), DATA.cent.bt[i], DATA.cent.hh[i].toFixed(2), DATA.cent.out[i].toFixed(2)]).sort((a, b) => b[1] - a[1]);
  h.innerHTML = table(['Firm', 'PageRank', 'Betweenness', 'Incoming concentration (HHI)', 'Out multiplier'], rows, { num: [1, 2, 3, 4] });
});

chart('c-tip', h => {
  const E = edges({ gs: 0.5, kappa: 0.1 }), pts = [];
  const find = L => { const th = thresholds({ k: 1.5, lam: 0.5, L, on: true }); let lo = 0, hi = 1; for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; diffuse(E, { oai: m }, th, 40).failed.includes('orcl') ? hi = m : lo = m; } return hi; };
  for (let L = 3.6; L <= 4.451; L += 0.05) pts.push([+L.toFixed(2), find(L)]);
  lines(h, { aria: 'Shock needed to freeze Oracle by leverage', xlab: 'Oracle leverage (debt over EBITDA)', xname: 'leverage', xfmt: x => x.toFixed(1) + 'x', yfmt: v => pc(v, 0), y0: 0, x0: 3.6, x1: 4.5, h: 270, series: [{ name: 'Shock that freezes Oracle', c: 'var(--crit)', pts }], mark: { x: 4.4, y: find(4.4), label: '4.4x: ' + pc(find(4.4)) }, rpad: 24, endlab: false });
});

chart('c-copula', h => {
  const p1 = pdFromCds(0.11945, 5, 0.4), p2 = pdFromCds(0.0315, 5, 0.4), pts = [];
  for (let r = 0; r <= 0.951; r += 0.05) pts.push([+r.toFixed(2), jointDefault(p2, p1, r).joint]);
  lines(h, { aria: 'Joint default probability against correlation', xlab: 'asset correlation ρ', xname: 'ρ', xfmt: x => x.toFixed(1), yfmt: v => pc(v, 0), y0: 0, x0: 0, x1: 0.95, h: 270, rpad: 130,
    series: [{ name: 'Gaussian copula', c: 'var(--crit)', pts }], refs: [{ y: p1 * p2, label: 'Independence ' + pc(p1 * p2), c: 'var(--axis)' }, { y: Math.min(p1, p2), label: 'Upper bound ' + pc(Math.min(p1, p2)), c: 'var(--warn)' }] });
});

chart('c-ledger', h => {
  const S = [DATA.scen[0], DATA.scen[1], DATA.scen[2]], c = S.map(s => s.cascade);
  const rows = [
    ['OpenAI valuation markdown', c.map(x => fB(x.oaiMark, 1))], ['Oracle backlog lost', c.map(x => fB(x.orclBacklog, 1))], ['CoreWeave backlog lost', c.map(x => fB(x.cwBacklog, 1))],
    ['Microsoft stake loss', c.map(x => fB(x.msft, 1))], ['SoftBank stake loss', c.map(x => fB(x.sb, 1))], ['Nvidia demand cut (direct)', c.map(x => fB(x.nvDemand, 1))], ['Nvidia backstop ratio', c.map(x => x.backstop.toFixed(2) + 'x')],
    ['CoreWeave 5-year default probability (CDS)', c.map(x => pc(x.cwPD, 0))]
  ].map(r => [r[0]].concat(r[1]));
  h.innerHTML = table(['Item', 'Mild (10%)', 'Base (30%)', 'Severe (60%)'], rows, { num: [1, 2, 3] });
});

chart('c-rates', h => {
  const rows = [0, 100, 200, 300].map(bp => { const r = rates({ bp }); return [bp + 'bp', '$' + r.dO.toFixed(2) + 'B', '$' + r.dC.toFixed(2) + 'B', (NEO.E / (NEO.I + r.dC / 4)).toFixed(2) + 'x']; });
  h.innerHTML = table(['Rate rise', 'Oracle extra interest a year', 'CoreWeave extra interest a year', 'CoreWeave interest cover'], rows, { num: [1, 2, 3] }) +
    `<div class="tiles" style="margin-top:12px">${stat('Oracle EBITDA fall that trips 4.5x from 4.4x', pc(leverage({}).ebitdaDropToTrip), 'crit')}${stat('CoreWeave cover today', f2(NEO.E / NEO.I) + 'x')}</div>`;
});

chart('c-revpath', h => {
  const mk = (g, name, c) => ({ name, c, pts: [0, 1, 2, 3, 4, 5].map(t => [t, 50 * Math.pow(1 + g, t)]) });
  lines(h, { aria: 'Revenue paths against the requirement', xlab: 'years from now', xname: 'year', xfmt: x => x + 'y', yfmt: v => '$' + v.toFixed(0) + 'B', y0: 0, x0: 0, x1: 5, h: 280, rpad: 100,
    series: [mk(0.15, '15% a year', 'var(--s1)'), mk(0.25, '25% a year', 'var(--s2)'), mk(0.32, '32% a year', 'var(--s3)')], refs: [{ y: valuation({}).need, label: 'Needed: $200B', c: 'var(--crit)' }] });
});

chart('c-cover', h => {
  hbars(h, [{ label: 'OpenAI revenue run rate', bars: [{ v: 50, c: 'var(--s1)', lab: '$50B' }] }, { label: 'Annual payments to Oracle and CoreWeave', bars: [{ v: 64.5, c: 'var(--crit)', lab: '$64.5B (coverage 78%)' }] },
    { label: 'Bain: AI market needed by 2031', bars: [{ v: 6000, c: 'var(--axis)', lab: '$6.0T a year' }, { v: 1800, c: 'var(--s3)', lab: 'today $1.2T to $1.8T' }] }].slice(0, 2), { rh: 38, bh: 11, max: 75 });
  h.insertAdjacentHTML('beforeend', `<div class="tiles" style="margin-top:12px">${stat('OpenAI commitments over run-rate revenue', '28x', 'crit')}${stat('Price over sales at $1.25T', f2(valuation({}).impliedPS, 0) + 'x')}${stat('Industry growth needed (Bain)', '27% to 38% a year')}</div>`);
});

chart('c-buyout', h => {
  const rows = [100000, 250000, 500000].map(c => { const b = buyout({ accept: 0.5, cost: c }); return { label: '$' + (c / 1000) + 'k per head, 50% accept', bars: [{ v: b.total, c: 'var(--s2)', lab: '$' + b.total.toFixed(1) + 'B  (' + pc(b.ofCapex) + ' of capex run rate)' }] }; });
  rows.push({ label: 'Microsoft annualised capex', bars: [{ v: 157.6, c: 'var(--s1)', lab: '$157.6B' }] });
  hbars(h, rows, { rh: 34, bh: 11, max: 170 });
});

chart('c-buffer', h => {
  const rows = [
    ['Microsoft: OpenAI stake markdown, Base (30%)', 61.344 / 4127, 'var(--s1)'], ['Microsoft: OpenAI stake markdown, Severe (60%)', 122.688 / 4127, 'var(--s1)'],
    ['Nvidia: listed guarantees, stakes and buybacks', 268.5 / 4832, 'var(--s1)'], ['Oracle: borrowings', 125.34 / 375.08, 'var(--warn)'], ['CoreWeave: debt of $35B over $31B (21 Oct)', 35 / 31, 'var(--crit)'], ['CoreWeave: debt incl. leases $51.6B over $30B (4 Nov)', 51.6 / 30, 'var(--crit)']
  ];
  hbars(h, rows.map(r => ({ label: r[0], bars: [{ v: r[1] * 100, c: r[2], lab: (r[1] * 100).toFixed(1) + '%', tip: r[0] + ': ' + (r[1] * 100).toFixed(1) + '% of market value' }] })), { rh: 36, bh: 11, max: 180 });
});
chart('c-mcap', h => {
  const rows = [['Nvidia', '$4.832T'], ['Microsoft', '$4.127T'], ['Alphabet', '$3.532T'], ['Amazon', '$2.876T'], ['Meta', '$1.610T'], ['Broadcom', '$1.553T'], ['AMD', '$797.9B'], ['Oracle', '$375.1B'], ['Intel', '$309.7B'], ['CoreWeave', 'about $30B to $31B (21 Oct and 4 Nov articles)'], ['SoftBank', 'not on the page']];
  h.innerHTML = table(['Firm', 'Market value'], rows, { num: [1] });
});

/* ===== blocks rewritten for the six-part structure ===== */
chart('c-themes', h => {
  const rows = [
    ['1. Risk accumulates through the network', 'Parts 2 and 6', 'Yes, through thresholds more than loops. Spectral radius 0.46, but Oracle and CoreWeave jump at their triggers. Part 2 shows the same concentration at every anchor and not only OpenAI.'],
    ['2. Small order-dependent firms may fail', 'Part 5', 'Tested on the whole neocloud class and not only CoreWeave. In the CoreWeave calibration a 28.9% cut by its main customer breaches an assumed 1.5x covenant. Failure looks more likely: CDS implies 63% for CoreWeave, listings are being cut or shelved and Microsoft cancelled the Nscale deal. The Gartner 80% figure is a consolidation forecast and not a default forecast. No default or covenant breach has been reported.'],
    ['3. Systemic risk to the tech market', 'Parts 4 and 6', 'Nvidia at $30B to $144B of annualised revenue at risk in the lab, depending on whether hyperscalers also cut. The anchor-neutral test gives $4.8B to $99.7B depending on which buyers cut.'],
    ['4. Geopolitics and idle chips', 'Part 5', 'The $7B Tencent cancellation is confirmed. Idle chips are not. If half the chips are re-let at 80% of the old price, 60% of the contract is lost.'],
    ['5. Microsoft idle GPUs and power limits', 'Part 5', 'Power is a real constraint (Nadella, Zuckerberg). The earlier Meta-hoarding claim is unsupported; Nadella’s statement concerns Microsoft. Delay cost per GPU modelled.'],
    ['6. Overbuild, efficiency shock, GPU collateral', 'Part 5', 'Rent against break-even, efficiency curves and loan paths modelled. The sign of the efficiency effect depends on a demand elasticity that could not be sourced.'],
    ['7. Consumer devices and the chip-vendor cycle', 'Part 5', 'The memory loop is a brake (gain 0.14). Vendor concentration rose (Intel 32.5% to 47.4%).'],
    ['8. Recent market events', 'Parts 4 and 7', 'Intel, Sandisk, Meta FCF, Fed and Reddit checked. The earlier Meta-hoarding claim is not supported; Nadella’s idle-GPU observation concerns Microsoft. The November neocloud sell-off is covered in Part 4.'],
    ['9. Trillion-dollar valuations and a usage slowdown', 'Part 7', 'Revenue gap quantified. Usage data could not be sourced.'],
    ['10. Microsoft\'s 60,000', 'Part 7', 'A voluntary buyout, about $7.5B under stated assumptions.']
  ];
  h.innerHTML = table(['Theme', 'Where', 'Finding'], rows);
});

chart('c-assume', h => {
  const rows = [
    ['Back-edge strength κ', '0.10', 'Share of OpenAI funding or capacity that depends on each partner', 'Critical value 0.519'],
    ['GPU share of capex', '50%', 'Weights from Oracle, CoreWeave, Microsoft and Meta to Nvidia. Also used for the Nvidia orders at risk in both models', 'Scales every Nvidia number'],
    ['Oracle leverage and trigger', '4.4x and 4.5x', 'Reported mid-4x. S&P trigger from the report', 'Freeze shock 4% to 62% for 4.45x to 3.6x'],
    ['Backlog to EBITDA pass-through λ', '0.5', 'Share of lost backlog that is lost EBITDA', 'Moves the Oracle line'],
    ['CoreWeave covenant', '1.5x', 'Terms not disclosed', 'Moves the default line'],
    ['CoreWeave depreciation', '$1.4B a quarter', 'Approximate', 'Moves EBITDA and cover'],
    ['Flexible cost share φ', '20%', 'Share of cash cost that flexes with revenue', 'Moves cover'],
    ['Share of backlog lost as proxy for share of revenue lost', '1 to 1', 'Used for the CoreWeave line in the anchor-neutral test. Backlog is multi-year so the timing differs', 'Moves when the line is crossed'],
    ['Break lines exist only for Oracle and CoreWeave', 'Two sellers', 'Debt and earnings for the others were not retrieved in that version', 'Other sellers show a loss but no break'],
    ['Look-through attribution', 'Customers fund a seller\'s purchases in proportion to their share of its backlog', 'Attribution rule used for the roster in Part 2. It is not an observed flow', 'Moves the look-through totals only'],
    ['Loss given default', '60% (recovery 40%)', 'Standard CDS convention', 'Scales lender loss'],
    ['GPU economic depreciation', '20% a year', 'Between the 11.6% and 23.4% implied by the 45% to 69% three-year residuals', 'Moves LTV paths'],
    ['Advance rate and forced-sale haircut', '65% and 40%', 'Illustrative GPU loan', 'Moves loss timing'],
    ['GPU cost, cost of capital, utilisation, opex', '$40,000, 10%, 80%, $0.20 an hour', 'Illustrative unit economics', 'Moves break-even rent'],
    ['Rent decay', '25% a year (delay model)', 'Observed fall since 2023 was about 38% a year', 'Moves delay cost'],
    ['Memory loop inputs', 'AI share 30%, supply elasticity 0.5, memory 12% of device cost', 'Elasticity of 0.83 is the middle of a sourced 0.78 to 0.88 range', 'Moves loop gain'],
    ['Floating-rate shares', '30% Oracle, 70% CoreWeave', 'Not disclosed', 'Moves the rate table'],
    ['Margin and multiple for valuation', '25% and 25x', 'Illustrative', 'Moves the required revenue'],
    ['Buyout acceptance and cost', '50% and $100k to $500k', 'Not public', 'Scales buyout cost']
  ];
  h.innerHTML = table(['Assumption', 'Value', 'Basis', 'What it moves'], rows);
});

chart('c-cover2', h => {
  const n = document.querySelectorAll('figure.fig').length;
  const rows = [
    ['How things started', 'Part 1'], ['How things are going', 'Part 4 (market evidence, October and November)'], ['Where they are heading', 'Part 7'],
    ['Risks', 'Parts 2, 5 and 6'], ['Precautionary mindset shift', 'Part 7'],
    ['Scenarios from the lab, numerically', 'Part 6 (the lab cascade and the anchor-neutral stress tests)'], ['Graphs, charts, networks', 'Every part, ' + n + ' figures in all'],
    ['Loops with their impact', 'Parts 1 and 6 (three-move diagrams, loop gains and five diagrams)'], ['Graph and diffusion math', 'Parts 2 and 6 (diffusion rule, Leontief, spectral radius, centrality)'],
    ['Less company-driven, more idea-driven', 'Part 1 (three moves) and Part 5 (three tests of a weak joint)'], ['Less focus on OpenAI', 'Part 2 (every anchor measured the same way) and Part 6 (anchor-neutral stress tests)'],
    ['Neoclouds beyond CoreWeave', 'Part 5 (the whole class), Part 2 (Nebius, Nscale, landlords) and Part 6'], ['Connected flow between sections', 'A recap at the start and a bridge at the end of every part'],
    ['Premise corrections', 'Part 7'], ['What could not be sourced', 'Part 7']
  ];
  h.innerHTML = table(['You asked for', 'Where it is'], rows);
});

chart('c-dash', h => {
  const be = breakevenRent({ n: 5 }), cv = neocloud({}), cb = collateral({ bullet: true });
  const rows = [
    ['CoreWeave 5-year CDS', '1,194.5bp (15 Oct)', 'Above 1,000bp', '<span class="pill v-no">Breached</span>', 'Sourced'],
    ['Oracle leverage', 'Mid-4x (lab uses 4.4x)', '4.5x S&P trigger', '<span class="pill v-part">Near</span>', 'Level reported, trigger sourced'],
    ['CoreWeave interest cover', f2(cv.cov0) + 'x', '1.5x covenant', '<span class="pill v-part">Passes. Breach at a ' + pc(cv.fK, 0) + ' cut by the main customer</span>', 'Covenant is an assumption'],
    ['H100-class rent against break-even', '$1.70 to $2.35 against $' + be.toFixed(2), 'Rent below break-even', '<span class="pill v-ok">Above, for a 5-year life</span>', 'Rent sourced, life assumed'],
    ['Bullet GPU loan LTV', 'Reaches 100% in ' + cb.tBullet.toFixed(1) + ' years', 'LTV above 100%', '<span class="pill v-part">Watch structure</span>', 'Depreciation assumed'],
    ['OpenAI commitments over revenue', '28x', 'No fixed trigger', '<span class="pill v-no">Extreme</span>', 'Sourced'],
    ['OpenAI round', '$11B secured of $20B', 'First close below target', '<span class="pill v-no">Short</span>', 'WSJ report']
  ];
  h.innerHTML = table(['Indicator', 'Now', 'Trigger', 'Status', 'Basis'], rows);
});

chart('c-prem', h => {
  const rows = [
    ['Intel revenue growth down 5% year on year', 'part', 'Total revenue rose 21%. The 5% fall is the client segment only.', LNK('https://www.intc.com/news-events/press-releases/detail/1786/intel-reports-third-quarter-2026-financial-results', 'Intel Q3 2026 release')],
    ['Sandisk hurt despite good numbers', 'part', 'The record quarter is confirmed. The price reaction comes from a secondary source.', LNK('https://www.thedailyupside.com/technology/semiconductors/sandisk-completes-its-best-quarter-in-history/', 'The Daily Upside') + ' ' + LNK('https://www-web.itiger.com/news/2632664599', 'Tiger')],
    ['Meta, Google and Amazon free cash flow down', 'part', 'Meta confirmed: Q3 capex $34.91B, operating cash flow $32.79B, free cash flow -$2.12B. Google and Amazon rest on an aggregator headline only.', LNK('https://www.hl.co.uk/shares/stock-market-news/company--news/meta-shares-tumble-as-free-cash-flow-nosedives', 'Hargreaves Lansdown') + ' ' + LNK('https://tradethepool.com/pre-market-prep/meta-stock-price-after-q3-earnings-record/', 'Trade the Pool')],
    ['Fed raising rates', 'no', 'Not supported. The October FOMC held rates. One headline claimed a cut. A 4 November article cites hotter inflation data raising rate fears, which is a worry and not a rise. The rate rise in the lab is a what-if.', LNK('https://admiralmarkets.com/analytics/traders-blog/fomc-october-2026-fed-holds-rates', 'Admiral Markets')],
    ['Google and Reddit hurt by users and AI chatbots', 'part', 'Reddit fell 12.6% after Q3 (another source says 25%). Its CEO says chatbots are not a traffic driver. The chatbot cause is not established and Google is not covered.', LNK('https://stockstory.org/us/stocks/nyse/rddt/news/earnings/reddit-nyserddt-surprises-with-q3-2026-sales-but-stock-drops-126percent', 'StockStory') + ' ' + LNK('https://www.pulse.bot/saas/news/reddit-ceo-says-chatbots-are-not-a-traffic-driver-9d19f435-5866-4d5c-a86b-f635fa31bd7b/', 'Pulse')],
    ['Oracle lost a $7B Tencent lease under US pressure', 'ok', 'Confirmed by several outlets. The claim that Oracle then held idle chips is not confirmed.', LNK('https://finance.yahoo.com/technology/ai/articles/oracle-cancels-7-billion-tencent-113659321.html', 'Yahoo Finance') + ' ' + LNK('https://www.remio.ai/de/post/oracle-tencent-gpu-deal-tests-the-limits-of-u-s-chip-controls-de', 'Remio')],
    ['Microsoft had GPUs sitting idle because it could not plug them in', 'part', 'Satya Nadella said Microsoft had chips in inventory it could not plug in because power and completed data-centre capacity were not ready. This indicates a deployment bottleneck, not deliberate hoarding. Meta’s separate energy comments do not substantiate the earlier Meta-hoarding claim.', LNK('https://www.techzine.eu/news/infrastructure/135966/satya-nadella-power-shortage-not-gpu-inventory-is-the-problem', 'Techzine') + ' ' + LNK('https://www.sdxcentral.com/news/metas-mark-zuckerberg-says-energy-constraints-are-holding-back-ai-data-center-buildout/', 'SDxCentral')],
    ['Banks lend against fast-depreciating GPUs', 'ok', 'GPU-collateralised debt exists and Nvidia has asked insurers to cover resale value. A bond deal pledged chips worth a fraction by mid-decade.', LNK('https://letsdatascience.com/blog/nvidia-asking-insurers-cover-what-happens-if-gpus-dont-resell', 'Let\'s Data Science') + ' ' + LNK('https://www.techtimes.com/articles/328723/20261007/spacex-bond-deal-30-year-maturities-nvidia-chip-collateral-worth-fraction-mid-decade.htm', 'Tech Times')],
    ['OpenAI and Anthropic at trillion-dollar valuations', 'part', 'OpenAI is $852B post-money and seeking $1.25T. Anthropic is about $965B with IPO talk of $1.5T to $2T.', LNK('https://www.cnbc.com/2026/03/31/openai-funding-round-ipo.html', 'CNBC on OpenAI') + ' ' + LNK('https://www.pymnts.com/news/artificial-intelligence/2026/anthropic-aims-to-nearly-double-valuation-in-new-funding-round/', 'PYMNTS on Anthropic')],
    ["Microsoft's 60,000 voluntary buyout offer", 'part', 'It is a voluntary buyout offer and not layoffs.', LNK('https://www.hawaiinewsnow.com/2026/10/26/microsoft-offers-60000-employees-voluntary-buyouts-ai-spending-accelerates/', 'Hawaii News Now')],
    ['Oracle credit stress', 'ok', 'Oracle default insurance is at high-yield levels. The CoreWeave 1,194.5bp figure is from Bloomberg via the research report.', LNK('https://www.wealthprofessional.ca/investments/equity-markets/oracles-default-insurance-hits-high-yield-levels-as-ai-debt-mounts/393817', 'Wealth Professional')]
  ];
  const lab = { ok: ['Verified', 'v-ok'], part: ['Partly verified', 'v-part'], no: ['Not supported', 'v-no'] };
  h.innerHTML = table(['Premise', 'Verdict', 'What the sources say', 'Sources'], rows.map(r => [r[0], `<span class="pill ${lab[r[1]][1]}">${lab[r[1]][0]}</span>`, r[2], r[3]]));
});

chart('c-watch', h => {
  const rows = [
    ['About 19 to 20 Nov 2026', 'Anthropic listing (Nasdaq "ANT")', 'Unconfirmed date, no price range filed. A weak debut reprices Amazon, Google, Microsoft and Nvidia stakes and tests Broadcom\'s $31B guarantee.'],
    ['Open', 'OpenAI round', 'Target cut to $20B at $1.25T with about $11B secured. The research report notes a first close below $20B.'],
    ['Open', 'Oracle rating action', 'S&P lists evidence that OpenAI cannot pay as a trigger for a further cut. Moody\'s is at Baa2 with a negative outlook.'],
    ['Daily', 'CoreWeave CDS', 'Record 1,194.5bp on 15 October. S&P Global Market Intelligence treats a spread above 1,000bp as distress.'],
    ['Ongoing', 'Anthropic compute payments', 'Take-or-pay of about $430B continues whatever usage does. The $120.5B SpaceXAI contract can be cancelled by either side on 90 days\' notice.'],
    ['Near term', 'Nscale IPO pricing (NYSE: NSCL)', 'Target $30B to $35B against reported bids of $16B to $19B. A pricing below target would lower the value of every private neocloud mark.'],
    ['Near term', 'Microsoft and Meta orders to neoclouds', 'They are most of the customer base of CoreWeave, Nebius, Nscale and IREN. Watch for cancelled or re-timed contracts like the reported Nscale cancellation.'],
    ['Near term', 'Neocloud acquisitions', 'Gartner and Forrester expect consolidation. The first distressed sale prices the class.'],
    ['By 19 Nov 2027', 'Meta forward contracts settle', 'Nvidia and AMD become holders of Meta stock through forwards.'],
    ['Nvidia FY2029', 'Ohio guarantee phases begin', 'The $105B guarantee starts with the first phase in FY2029 and ends if OpenAI earns a satisfactory rating.']
  ];
  h.innerHTML = table(['When', 'What', 'Why it matters'], rows);
});

chart('c-sources', h => {
  const rows = [
    ['IMF blog and Global Financial Stability Report, 13 October 2026 (exact URL not retrieved)', null], ['Nvidia Form 10-Q, quarter to 26 July 2026', 'https://www.sec.gov/Archives/edgar/data/0001045810/000104581026000075/nvda-20260726.htm'],
    ['Anthropic S-1, filed 26 October 2026', 'https://www.sec.gov/Archives/edgar/data/0002130357/000162828026067168/anthropicpbc-sx1.htm'], ['Meta 424B5 and FWP, October 2026', 'https://www.sec.gov/Archives/edgar/data/0001326801/000119312526431036/d116268dfwp.htm'],
    ['CNBC: OpenAI funding round and valuation, 31 March 2026', 'https://www.cnbc.com/2026/03/31/openai-funding-round-ipo.html'], ['CNBC: OpenAI cuts funding target, 31 October 2026', 'https://www.cnbc.com/amp/2026/10/31/openai-funding-target-cut-10-billion.html'],
    ['Nvidia $105B Ohio guarantee', 'https://live.euronext.com/en/financial-news/nvidia-provide-105-billion-guarantee-openais-ohio-data-center'], ['Axios: Nvidia and OpenAI financing, 27 July 2026', 'https://www.axios.com/2026/07/27/nvidia-openai-financing-ai-jensen-huang-ssi'],
    ['CoreWeave Q2 2026 results summary', 'https://marketdaily.com/coreweave-q2-2026-earnings-revenue-doubles-ai-backlog-104-billion/'], ['Oracle downgrade to BBB-', 'https://www.bondsupermart.com/bsm/article-detail/oracle-downgraded-to-bbb-yields-as-high-as-7-8-is-it-an-opportunity-or-a-warning-sign-RSS380'],
    ['Meta 25 billion stock sale demand', 'https://247wallst.com/investing/2026/10/28/metas-25-billion-stock-sale-drew-five-times-the-demand/'], ['Apollo and Blackstone $36B Anthropic chip debt', 'https://thenextweb.com/news/apollo-blackstone-36bn-anthropic-chip-debt'],
    ['SpaceX bond deal and GPU collateral', 'https://www.techtimes.com/articles/328723/20261007/spacex-bond-deal-30-year-maturities-nvidia-chip-collateral-worth-fraction-mid-decade.htm'], ['Intel Q3 2026 results', 'https://www.intc.com/news-events/press-releases/detail/1786/intel-reports-third-quarter-2026-financial-results'],
    ['Nadella on power versus GPU inventory', 'https://www.techzine.eu/news/infrastructure/135966/satya-nadella-power-shortage-not-gpu-inventory-is-the-problem'], ['Zuckerberg on energy constraints', 'https://www.sdxcentral.com/news/metas-mark-zuckerberg-says-energy-constraints-are-holding-back-ai-data-center-buildout/'],
    ['Microsoft voluntary buyouts', 'https://www.hawaiinewsnow.com/2026/10/26/microsoft-offers-60000-employees-voluntary-buyouts-ai-spending-accelerates/'], ['BBC: lesser-known firms at the centre of concerns about AI infrastructure financing', 'https://www.bbc.com/news/articles/cje36degrgv5o'], ['Trending Topics: neocloud stocks crash, 4 November 2026 (secondary, co-produced with AI)', 'https://www.trendingtopics.eu/neocloud-stocks-crash/'], ['VARINDIA: neoclouds at a crossroads, 3 November 2026 (secondary)', 'https://www.varindia.com/news/neoclouds-at-a-crossroads-boom-or-bust'], ['Oracle cancels $7B Tencent lease', 'https://finance.yahoo.com/technology/ai/articles/oracle-cancels-7-billion-tencent-113659321.html'],
    ['Google Cloud backlog and $924B commitments, Q3 2026 call (secondary summary)', 'https://fourweekmba.com/ai-googles-commitments-hit-924b-1-65x-its-cloud-backlog/'],
    ['Anthropic S-1: Google commitments and funding (secondary summary)', 'https://fourweekmba.com/ai-googles-anthropic-loop-114-5b-committed-30b-funding/'],
    ['Amazon Q3 2026 filing analysis: $578B backlog, Anthropic and OpenAI commitments (secondary)', 'https://sec-api.io/insights/amazon-amzn-q3-2026-earnings-sec-filing-analysis'],
    ['Microsoft commercial backlog of $678B (secondary; OpenAI share is an estimate)', 'https://www.webull.com/news/15317720163771392'],
    ['Microsoft Q1 FY2027: OpenAI revenue and receivables (secondary summary)', 'https://aiweekly.co/fr/alerts/microsoft-encaisse-10-md-dopenai-au-t1-fy27-11-de-son-chiffre-et-72-md-de'],
    ['Nebius commitments and backlog, 5 October 2026 (Motley Fool via Nasdaq)', 'https://www.nasdaq.com/articles/nebius-has-40-billion-customer-commitments-most-it-comes-2-customers'],
    ['Nscale Form S-1, 18 September 2026', 'https://www.sec.gov/Archives/edgar/data/0002110365/000119312526395475/ck0002110365-20260918.htm'],
    ['Nscale S-1 analysis (Daloopa)', 'https://daloopa.com/blog/analyst-pov/scout-built-the-nscl-model-i-read-the-fine-print'],
    ['IREN Form 10-K, year to 30 June 2026', 'https://www.sec.gov/Archives/edgar/data/0001878848/000187884826000052/iren-20260630.htm'],
    ['Applied Digital debt and leases, 27 March 2026 (Yahoo Finance)', 'https://finance.yahoo.com/markets/stocks/articles/applied-digital-under-debt-overhang-141012229.html'],
    ['CoreWeave customer concentration, backlog and debt (sec-api summary of filings)', 'https://sec-api.io/insights/coreweave-crwv-2026-revenue-analysis-top-customer-concentration-exposure'],
    ['Neocloud operator wiki, updated 10 May 2026 (mixed source quality)', 'https://drops-154.pages.dev/ai-capex/wiki/operators/neoclouds/'],
    ['Neocloud valuations, 30 and 31 October 2026', 'https://valueaddvc.com/blog/neocloud-valuations-2026'],
    ['Hyperscaler capex totals, 30 October 2026 (Hargreaves Lansdown)', 'https://www.hl.co.uk/news/ai-hyperscalers-are-expected-to-finish-the-year-spending-a-whopping-828-billion-on-capex']
  ];
  h.innerHTML = '<ul class="small" style="padding-left:20px">' + rows.map(r => `<li>${r[1] ? LNK(r[1], esc(r[0])) : esc(r[0])}</li>`).join('') + '</ul><p class="small">The underlying research drew on about 95 sources in total.</p>';
});

