/* ===== v3 charts: premise network ===== */
(function () {
  const D = D3, N = D.nodes;
  const GCOL = { Labs: 'var(--s2)', Clouds: 'var(--s1)', Suppliers: 'var(--s3)', Outside: 'var(--mut)', Finance: 'var(--s4)' };
  const grp = l => (l === 'Lab' || l === 'Other') ? 'Labs' : (l === 'Hyperscaler' || l === 'Neocloud' || l === 'Landlord') ? 'Clouds' : (l === 'Software' || l === 'Devices') ? 'Outside' : l === 'Finance' ? 'Finance' : 'Suppliers';
  const GNAME = { Labs: 'Labs and their users', Clouds: 'Clouds, neoclouds, landlords', Suppliers: 'Suppliers', Outside: 'Software and devices', Finance: 'Finance' };
  const col = t => t === 'USERS' ? 'var(--s2)' : GCOL[grp(N[t] ? N[t].layer : 'Other')];
  const nm = t => t === 'SSNLF' ? 'Samsung' : t === 'CEG' ? 'Constellation' : t === 'USERS' ? 'End users' : t === 'ROW' ? 'Other buyers' : (N[t] ? N[t].name.replace(' (private, S-1)', '').replace(' (private)', '').replace(' (incl. xAI)', '') : t);
  const B = (x, d) => '$' + (Math.abs(x) >= 100 ? Math.round(x) : (+x).toFixed(d === undefined ? 1 : d)) + 'B';
  const P = (x, d) => (x * 100).toFixed(d === undefined ? 0 : d) + '%';
  const legendG = keys => legend(keys.map(k => ({ c: GCOL[k], n: GNAME[k] })));
  const FLOWS = {}; Object.keys(D.S).forEach(s => Object.entries(D.S[s]).forEach(([b, sh]) => { (FLOWS[b] = FLOWS[b] || {})[s] = sh * (N[s].A || 0); }));
  window.V3FLOWS = FLOWS;
  const wrapLines = (text, maxw, size) => { const cw = size * 0.56, words = text.split(' '), out = []; let cur = '';
    words.forEach(wd => { const t = cur ? cur + ' ' + wd : wd; if (t.length * cw > maxw && cur) { out.push(cur); cur = wd; } else cur = t; }); if (cur) out.push(cur); return out; };
  window.V3H = { nm, col, grp, GCOL, GNAME, B, P, wrapLines, legendG };

  /* ---------- Part 1 ---------- */
  chart('n-gap', h => {
    const w = widthOf(h), two = w > 640;
    h.innerHTML = `<div class="${two ? 'grid2' : ''}" style="gap:18px"><div><h4>Per year</h4><div id="n-gap-a"></div></div><div><h4>Promised or outstanding</h4><div id="n-gap-b"></div></div></div>`;
    hbars(document.getElementById('n-gap-a'), [
      { label: 'Users pay the two leading labs', bars: [{ v: 117.8, c: 'var(--s2)', lab: '$117.8B' }] },
      { label: 'Labs owe clouds and suppliers (contracts, straight-line)', bars: [{ v: 210.7, c: 'var(--s2)', lab: '$211B' }] },
      { label: 'Capex of the mapped buyers, last 12 months', bars: [{ v: 781.4, c: 'var(--s1)', lab: '$781B' }] },
      { label: 'Capex planned by the five largest spenders, 2026', bars: [{ v: 815.5, c: 'var(--s1)', lab: '$803B to $828B', tip: 'Hargreaves Lansdown, 30 Oct 2026: $803B to $828B' }] }
    ], { rh: 38, max: 900, aria: 'annual flows' });
    hbars(document.getElementById('n-gap-b'), [
      { label: 'OpenAI compute commitments', bars: [{ v: 1400, c: 'var(--s2)', lab: '~$1.4T' }] },
      { label: 'Anthropic non-cancelable compute', bars: [{ v: 430, c: 'var(--s2)', lab: '~$430B' }] },
      { label: 'Backlog at four big clouds', bars: [{ v: 2468, c: 'var(--s1)', lab: '$2.47T' }] },
      { label: 'US data-centre and related debt', bars: [{ v: 1300, c: 'var(--s4)', lab: '$1.3T+' }] }
    ], { rh: 38, max: 2700, aria: 'stocks' });
  });

  chart('n-loop', h => {
    const W = 780, H = 490;
    const box = (x, y, w, hh, title, sub, c) => {
      const tint = c === 'var(--s2)' ? '#F4E5DC' : c === 'var(--s1)' ? '#E2EDF2' : c === 'var(--s3)' ? '#E4EEE5' : '#ECE7F1';
      return `<rect x="${x}" y="${y}" width="${w}" height="${hh}" rx="10" style="fill:${tint};stroke:${c};stroke-width:3"/>` + T(x + w / 2, y + 24, title, { a: 'middle', s: 15, w: 700, f: 'var(--ink)' }) + sub.map((s, i) => T(x + w / 2, y + 44 + i * 16, s, { a: 'middle', s: 12, f: 'var(--ink2)' })).join('');
    };
    const path = (d, c, dash, id) => `<path d="${d}" fill="none" stroke-width="2.4" ${dash ? 'stroke-dasharray="6 5"' : ''} marker-end="url(#ar-${id})" style="stroke:${c}"/>`;
    const mk = (id, c) => `<marker id="ar-${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" style="fill:${c}"/></marker>`;
    const lab = (x, y, lines, a) => lines.map((l, i) => T(x, y + i * 15, l, { a: a || 'middle', s: 12, f: 'var(--ink)', halo: 1 })).join('');
    let g = `<defs>${mk('o', 'var(--s2)')}${mk('b', 'var(--s1)')}${mk('g', 'var(--s3)')}${mk('p', 'var(--s4)')}</defs>`;
    g += box(60, 60, 230, 100, 'AI labs', ['OpenAI, Anthropic, xAI', 'revenue about $118B a year'], 'var(--s2)');
    g += box(470, 60, 240, 100, 'Clouds and neoclouds', ['Microsoft, Amazon, Google, Oracle,', 'CoreWeave, Nebius, Nscale and others'], 'var(--s1)');
    g += box(470, 330, 240, 100, 'Suppliers', ['Nvidia, AMD, Broadcom, SK hynix,', 'Micron, TSMC, ASML, Vertiv and others'], 'var(--s3)');
    g += box(60, 330, 230, 100, 'Investors and lenders', ['SoftBank, venture funds, banks,', 'private credit, bond buyers'], 'var(--s4)');
    g += T(175, 18, 'End users and businesses pay', { a: 'middle', s: 12.5, w: 700, f: 'var(--ink2)' });
    g += path('M175 26 L175 56', 'var(--s2)', 0, 'o');
    g += path('M292 92 L466 92', 'var(--s2)', 0, 'o') + lab(380, 82, ['contracts: about $211B a year']);
    g += path('M468 140 L296 140', 'var(--s1)', 1, 'b') + lab(380, 160, ['equity: Microsoft ~24% of OpenAI;', 'Google and Amazon in Anthropic']);
    g += path('M640 164 L640 326', 'var(--s1)', 0, 'b') + lab(648, 236, ['capex: $781B', 'in 12 months'], 'start');
    g += path('M560 326 L560 166', 'var(--s3)', 1, 'g') + lab(552, 268, ['backstops: Nvidia', 'for CoreWeave, Google', 'for Fluidstack leases'], 'end');
    g += path('M468 342 L250 166', 'var(--s3)', 1, 'g') + lab(372, 238, ['equity back into labs:', 'Nvidia $30B in OpenAI,', 'AMD warrants'], 'end');
    g += path('M200 326 L200 166', 'var(--s4)', 0, 'p') + lab(192, 236, ['equity: SoftBank', '$64.6B in OpenAI'], 'end');
    g += path('M175 432 L175 462 L740 462 L740 110 L714 110', 'var(--s4)', 0, 'p') + lab(458, 456, ['loans against contracts and GPUs: at least $1.3T of US data-centre debt']);
    h.innerHTML = `<div style="overflow-x:auto"><div style="min-width:640px">${svgWrap(W, H, g, 'loop of payments and financing').replace('<svg ', '<svg style="width:100%;height:auto" ')}</div></div>` +
      legend([{ c: 'var(--s2)', n: 'paid by labs or users' }, { c: 'var(--s1)', n: 'paid by clouds' }, { c: 'var(--s3)', n: 'supplier support (dashed)' }, { c: 'var(--s4)', n: 'investors and lenders' }]);
  });

  /* ---------- Part 2 ---------- */
  const SKL = t => {
    if (t === 'USERS') return 'End users'; if (t === 'ROW') return 'Other buyers'; if (t === 'TSM') return 'Foundry'; if (['ASML', 'AMAT', 'LRCX'].includes(t)) return 'Equipment';
    return { Lab: 'Labs', Hyperscaler: 'Big clouds', Neocloud: 'Neoclouds', Landlord: 'Landlords', Chips: 'Chip designers', Systems: 'Servers and network', Power: 'Power and cooling', Memory: 'Memory' }[N[t].layer] || N[t].layer;
  };
  const SKCOL = { 'End users': 0, 'Other buyers': 0, Labs: 1, 'Big clouds': 2, Neoclouds: 3, Landlords: 3, 'Chip designers': 4, 'Servers and network': 4, 'Power and cooling': 4, Memory: 5, Foundry: 5, Equipment: 6 };
  chart('n-sankey', h => {
    const agg = {}; Object.entries(FLOWS).forEach(([b, outs]) => Object.entries(outs).forEach(([s, v]) => { const k = SKL(b) + '>' + SKL(s); agg[k] = (agg[k] || 0) + v; }));
    const links = Object.entries(agg).map(([k, v]) => { const [a, b] = k.split('>'); return { a, b, v }; }).filter(l => l.v > 0.5 && SKCOL[l.a] < SKCOL[l.b] && l.a !== 'Other buyers');
    const nodes = {}; Object.keys(SKCOL).forEach(n => nodes[n] = { n, c: SKCOL[n], in: 0, out: 0 });
    links.forEach(l => { nodes[l.a].out += l.v; nodes[l.b].in += l.v; });
    Object.values(nodes).forEach(n => n.v = Math.max(n.in, n.out));
    const W = 1000, H = 520, ncol = 7, nw = 14, padT = 24, gap = 18, xs = c => 20 + c * (W - 150) / (ncol - 1);
    const cols = [...Array(ncol)].map((_, c) => Object.values(nodes).filter(n => n.c === c && n.v > 0));
    const k = Math.min(...cols.map(cs => (H - padT - 20 - gap * (cs.length - 1)) / cs.reduce((a, n) => a + n.v, 0)));
    cols.forEach((cs, c) => { let y = padT; cs.forEach(n => { n.x = xs(c); n.y = y; n.h = Math.max(2, n.v * k); y += n.h + gap; n.oy = 0; n.iy = 0; }); });
    links.sort((p, q) => nodes[p.b].y - nodes[q.b].y || nodes[p.a].y - nodes[q.a].y);
    const colOf = n => n === 'End users' ? 'var(--s2)' : n === 'Other buyers' ? 'var(--mut)' : n === 'Labs' ? 'var(--s2)' : ['Big clouds', 'Neoclouds', 'Landlords'].includes(n) ? 'var(--s1)' : 'var(--s3)';
    let g = '';
    links.forEach(l => {
      const A = nodes[l.a], Bn = nodes[l.b], t = Math.max(1, l.v * k);
      const y0 = A.y + A.oy + t / 2, y1 = Bn.y + Bn.iy + t / 2; A.oy += t; Bn.iy += t;
      const x0 = A.x + nw, x1 = Bn.x, mx = (x0 + x1) / 2;
      g += `<path d="M${x0} ${y0.toFixed(1)}C${mx} ${y0.toFixed(1)} ${mx} ${y1.toFixed(1)} ${x1} ${y1.toFixed(1)}" fill="none" stroke-width="${t.toFixed(1)}" style="stroke:${colOf(l.a)};opacity:${l.a === 'Other buyers' ? 0.16 : 0.32}" data-tip="${esc(l.a + ' to ' + l.b + ': ' + B(l.v) + ' a year')}"/>`;
    });
    Object.values(nodes).filter(n => n.v > 0).forEach(n => {
      g += `<rect x="${n.x}" y="${n.y.toFixed(1)}" width="${nw}" height="${n.h.toFixed(1)}" rx="2" style="fill:${colOf(n.n)}" data-tip="${esc(n.n + ': ' + B(n.v) + ' a year through this layer')}"/>`;
      const lx = n.x + nw + 5, a = 'start';
      g += T(lx, n.y + Math.min(n.h / 2, 14) + 4, n.n, { a, s: 12, w: 600, f: 'var(--ink)', halo: 1 }) + T(lx, n.y + Math.min(n.h / 2, 14) + 18, B(n.v), { a, s: 11, m: 1, f: 'var(--ink2)', halo: 1 });
    });
    h.innerHTML = `<div style="overflow-x:auto"><div style="min-width:760px">${svgWrap(W, H, g, 'layer flows').replace('<svg ', '<svg style="width:100%;height:auto" ')}</div></div><p class="small" style="margin:6px 0 0">Not drawn: payments from buyers outside the map (about $681B a year on the 30% assumption) and small flows within a column (neoclouds to landlords, about $1.6B).</p>`;
  });

  chart('n-firmmap', h => {
    const OUTS = {"SPCX": 0.7340823970037454, "MSFT": 0, "GOOGL": 0, "AMZN": 0.2179004600585529, "META": 0, "ORCL": 0.3795929156753899, "CRWV": 0.664, "NBIS": 0.528, "IREN": 0.515, "CIFR": 1.0, "WULF": 1.0, "HUT": 1.0, "WYFI": 0.705, "APLD": 0.95, "CORZ": 0.649, "EQIX": 0.3738738738738739, "DLR": 0.1461095100864553, "NVDA": 0, "AMD": 0, "AVGO": 0, "MRVL": 0, "INTC": 0, "QCOM": 0, "ARM": 0, "ASML": 0, "AMAT": 0, "LRCX": 0, "MU": 0, "SKH": 0, "SSNLF": 0, "SNDK": 0, "WDC": 0, "DELL": 0, "HPE": 0, "CSCO": 0, "ANET": 0, "CLS": 0, "VRT": 0, "ETN": 0, "GEV": 0, "CEG": 0, "VST": 0, "PLTR": 0, "CRM": 0, "NOW": 0, "ADBE": 0, "RDDT": 0, "AAPL": 0, "HPQ": 0, "SFTBY": 1, "BX": 0, "OAI": 0.648, "ANTH": 0.01013731866602341};
    const sig = D.sig, ok = t => sig.concentration[t] != null && OUTS[t] != null && N[t].A;
    const all = Object.keys(sig.funding).filter(ok);
    const grpOf = t => { const l = N[t].layer; return l === 'Hyperscaler' ? 'clouds' : (l === 'Neocloud' || l === 'Landlord') ? 'neo' : 'sup'; };
    const med = a => { const s = [...a].sort((x, y) => x - y), n = s.length; return n ? (n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2) : 0; };
    const groups = [
      { k: 'sup', title: 'Suppliers: many buyers, fund themselves', col: 'var(--s3)', limit: 8 },
      { k: 'clouds', title: 'Big clouds: a few large buyers, mostly fund themselves', col: 'var(--s1)' },
      { k: 'neo', title: 'Neoclouds and landlords: one or two buyers, need outside money', col: 'var(--crit)' }
    ];
    const pc = v => Math.round(v * 100).toLocaleString('en-US') + '%';
    let html = `<div class="fm-head"><span></span><span><b>&#9312; Dependence on one buyer</b>Largest buyer's share of the firm's AI revenue</span><span><b>&#9313; Need for outside money</b>Share of its spending paid with outside money</span></div>`;
    groups.forEach(gr => {
      const ids = all.filter(t => grpOf(t) === gr.k);
      const c = med(ids.map(t => sig.concentration[t])), f = med(ids.map(t => OUTS[t]));
      let rows = gr.k === 'sup' ? ids.sort((a, b) => N[b].A - N[a].A).slice(0, gr.limit) : ids.sort((a, b) => OUTS[b] - OUTS[a]);
      html += `<div class="fm-group"><div class="fm-gt" style="border-left-color:${gr.col}">${esc(gr.title)}<span class="fm-med">Typical firm: largest buyer ${pc(c)}, outside money ${f < 0.005 ? 'none' : pc(f)}</span></div><div class="fm-row fm-sub"><span></span><span>&#9312; largest buyer</span><span>&#9313; outside money</span></div>`;
      rows.forEach(t => {
        const cv = sig.concentration[t], fv = OUTS[t];
        html += `<div class="fm-row"><span class="fm-n">${esc(nm(t))}</span>
          <span class="fm-c"><i style="--w:${(cv * 100).toFixed(1)};background:${gr.col}"></i><b>${pc(cv)}</b></span>
          <span class="fm-c"><i style="--w:${(Math.min(1, fv) * 100).toFixed(1)};background:${gr.col}"></i><b>${fv < 0.005 ? 'none' : pc(fv)}</b></span></div>`;
      });
      if (gr.k === 'sup') { const rest = ids.length - rows.length; const cs = ids.map(t => sig.concentration[t]); html += `<div class="fm-note">The other ${rest} suppliers look the same: largest buyer between ${pc(Math.min(...cs))} and ${pc(Math.max(...cs))} of AI revenue, and no outside money needed.</div>`; }
      html += '</div>';
    });
    html += `<div class="fm-group"><div class="fm-gt" style="border-left-color:var(--s2)">AI labs: paid by millions of users, funded by investors and suppliers<span class="fm-med">Their buyers are spread out, but most of their spending rests on funders</span></div><div class="fm-row fm-sub"><span></span><span>&#9312; largest buyer</span><span>&#9313; outside money</span></div>` +
      ['OAI', 'ANTH'].map(t => `<div class="fm-row"><span class="fm-n">${esc(nm(t))}</span><span class="fm-c"><b style="font-family:var(--head);font-weight:400;color:var(--mut)">many users, no single buyer</b></span><span class="fm-c"><i style="--w:${(OUTS[t] * 100).toFixed(1)};background:var(--s2)"></i><b>${pc(OUTS[t])}</b></span></div>`).join('') + `</div>`;
    h.innerHTML = html;
  });
  chart('n-lines', h => {
    const nb = Object.keys(N).filter(t => N[t].rule === 'B' && N[t].A).length;
    const rows = Object.keys(N).filter(t => N[t].line != null && N[t].A && N[t].rule === 'A').sort((a, b) => N[a].line - N[b].line);
    const R = [{ label: 'All ' + nb + ' financing-dependent firms (neoclouds and landlords)', bars: [{ v: 20, c: 'var(--crit)', lab: '20%', tip: 'Neoclouds and landlords break after losing 20% of contracted AI revenue' }] }]
      .concat(rows.map(t => ({ label: nm(t), bars: [{ v: Math.min(1.5, N[t].line) * 100, c: t === 'ORCL' ? 'var(--crit)' : col(t), lab: N[t].line > 1.5 ? 'over 150%' : P(N[t].line, N[t].line < 0.1 ? 1 : 0), tip: nm(t) + ': breaks after losing ' + P(N[t].line, 1) + ' of AI revenue at stake (' + B(N[t].A) + ' a year)' }] })));
    R.sort((a, b) => a.bars[0].v - b.bars[0].v);
    hbars(h, R, { rh: 26, bh: 9, max: 150, aria: 'break lines' });
  });

  /* ---------- Part 4 ---------- */
  chart('n-caused', h => {
    const rows = Object.entries(D.res).filter(([o, r]) => r.caused >= 1).sort((a, b) => b[1].caused - a[1].caused);
    const w = widthOf(h), rh = 40, labw = Math.min(150, w * 0.3), bw = w - labw - 70, max = rows[0][1].caused; let g = '', y = 0;
    rows.forEach(([o, r]) => {
      const l1 = r.lin / max * bw, l2 = Math.max(0, r.caused - r.lin) / max * bw;
      g += T(labw - 6, y + 14, nm(o), { a: 'end', s: 12.5, f: 'var(--ink)' });
      g += `<rect x="${labw}" y="${y + 3}" width="${l1.toFixed(1)}" height="14" rx="2" style="fill:${col(o)};opacity:.55" data-tip="${esc(nm(o) + ': ' + B(r.lin) + ' if no firm breaks')}"/>`;
      if (l2 > 0.5) g += `<rect x="${(labw + l1).toFixed(1)}" y="${y + 3}" width="${l2.toFixed(1)}" height="14" rx="2" style="fill:${col(o)}" data-tip="${esc('extra from firms breaking: ' + B(r.caused - r.lin))}"/>`;
      g += T(labw + l1 + l2 + 5, y + 14, B(r.caused), { s: 11, m: 1, f: 'var(--ink)' });
      const fz = FBC.res[o]; if (fz) { const lf = fz[0] / max * bw; g += `<rect x="${labw}" y="${y + 19}" width="${lf.toFixed(1)}" height="4" rx="1" style="fill:var(--s2)" data-tip="${esc(nm(o) + ' with funding ties: ' + B(fz[0]) + (fz[1].length !== Object.keys(r.broken).length ? ', ' + fz[1].length + ' firms break' : ''))}"/>`; g += T(labw + lf + 5, y + 24, (fz[0] - r.caused > 0.05 ? '+' + B(fz[0] - r.caused) + ' with funding ties' : 'unchanged with funding ties'), { s: 10, f: 'var(--s2)' }); y += 8; }
      const br = Object.keys(r.broken).map(nm);
      if (br.length) { const ls = wrapLines('breaks: ' + br.join(', ') + (r.lender > 0.05 ? '; lenders lose ' + B(r.lender) : ''), w - labw - 4, 10.5); ls.forEach((l, k) => { g += T(labw, y + 31 + k * 13, esc(l), { s: 10.5, f: 'var(--crit)' }); }); y += rh + (ls.length - 1) * 13; } else y += 24;
    });
    h.innerHTML = svgWrap(w, y + 2, g, 'damage caused') + legendG(['Labs', 'Clouds', 'Suppliers']) + legend([{ c: 'var(--s2)', n: 'thin orange bar: the same shock with funding ties switched on' }]);
  });

  chart('n-twocuts', h => {
    const w = widthOf(h), two = w > 640;
    h.innerHTML = `<div class="${two ? 'grid2' : ''}" style="gap:18px"><div><h4>OpenAI cuts 30%</h4><div id="tc-a"></div><p class="small" id="tc-a2"></p></div><div><h4>Anthropic cuts 30%</h4><div id="tc-b"></div><p class="small" id="tc-b2"></p></div></div>`;
    [['OAI', 'tc-a'], ['ANTH', 'tc-b']].forEach(([o, id]) => {
      const r = D.res[o];
      hbars(document.getElementById(id), r.top.slice(0, 8).map(([t, v]) => ({ label: nm(t), bars: [{ v, c: r.broken[t] ? 'var(--crit)' : col(t), lab: B(v) + (r.broken[t] ? ' (breaks)' : '') }] })), { rh: 30, bh: 10, max: 28 });
      const fz = FBC.res[o]; document.getElementById(id + '2').innerHTML = `<b>Breaks:</b> ${Object.entries(r.broken).map(([t, k]) => nm(t) + ' (' + k + ')').join(', ')}. <b>Total:</b> ${B(r.caused)} a year. <b>Lenders lose:</b> ${B(r.lender)}.<br><span style="color:var(--s2)"><b>With funding ties:</b> ${B(fz[0])} a year; ${fz[1].length} firms break${fz[1].length === Object.keys(r.broken).length ? ', the same ones' : ''}; lenders lose ${B(fz[2])}.</span>`;
    });
  });

  let SWSEL = 'OAI';
  chart('n-sweep', h => {
    const b = document.getElementById('sweepbtns'), opts = [['USERS', 'End users'], ['OAI', 'OpenAI'], ['ANTH', 'Anthropic'], ['MSFT', 'Microsoft'], ['AMZN', 'Amazon'], ['GOOGL', 'Alphabet'], ['META', 'Meta'], ['NVDA', 'Nvidia'], ['CRWV', 'CoreWeave']];
    b.innerHTML = opts.map(([k, l]) => `<button type="button" aria-pressed="${k === SWSEL}" data-k="${k}">${l}</button>`).join('');
    b.querySelectorAll('button').forEach(x => x.onclick = () => { SWSEL = x.dataset.k; renderAll(); });
    const pts = D.sweep[SWSEL];
    lines(h, { aria: 'damage against size of cut', xlab: 'size of the cut at ' + nm(SWSEL), xname: 'cut', xfmt: v => v + '%', yfmt: v => '$' + Math.round(v) + 'B', rpad: 120,
      series: [{ name: 'with break points', c: 'var(--crit)', pts: pts.map(p => [p[0], p[1]]) }, { name: 'no firm breaks', c: 'var(--s1)', dash: 1, pts: pts.map(p => [p[0], p[2]]) }].concat(FBC.sweep[SWSEL] ? [{ name: 'with funding ties', c: 'var(--s2)', pts: FBC.sweep[SWSEL].map(p => [p[0], p[1]]) }] : []) });
    h.querySelectorAll('circle[data-tip]').forEach((c, i) => { const p = pts[i % pts.length]; if (i < pts.length) c.setAttribute('data-tip', esc('cut ' + p[0] + '%<br>damage ' + B(p[1]) + '<br>firms broken: ' + p[3] + '<br>lenders lose ' + B(p[4]))); });
  });

  /* ---------- Part 5 ---------- */
  chart('n-worst', h => {
    const rows = Object.entries(D.worst).filter(([t, v]) => v[1] >= 0.05 && N[t].layer !== 'Lab').sort((a, b) => b[1][1] - a[1][1]);
    const w = widthOf(h), labw = Math.min(140, w * 0.34), bw = w - labw - 120, rh = 24; let g = '', y = 0;
    rows.forEach(([t, v]) => {
      const len = Math.min(1, v[1]) * bw, ln = N[t].line;
      g += T(labw - 6, y + 13, nm(t), { a: 'end', s: 12, f: 'var(--ink)' });
      g += `<rect x="${labw}" y="${y + 3}" width="${len.toFixed(1)}" height="12" rx="2" style="fill:${col(t)}" data-tip="${esc(nm(t) + ': worst single shock removes ' + P(v[1]) + ' of AI revenue (' + B(v[2]) + '), from ' + nm(v[0]) + (ln != null ? '<br>break line ' + P(ln, 1) : ''))}"/>`;
      if (ln != null && ln <= 1) g += `<line x1="${(labw + ln * bw).toFixed(1)}" x2="${(labw + ln * bw).toFixed(1)}" y1="${y}" y2="${y + 18}" stroke-width="2.4" style="stroke:var(--crit)"/>`;
      const fw = FBC.worst[t]; if (fw && fw[1] - v[1] > 0.002) { const lf = Math.min(1, fw[1]) * bw; g += `<rect x="${(labw + len).toFixed(1)}" y="${y + 3}" width="${Math.max(1.5, lf - len).toFixed(1)}" height="12" rx="1" style="fill:var(--s2)" data-tip="${esc(nm(t) + ' with funding ties: ' + P(fw[1]) + ' from ' + nm(fw[0]))}"/>`; }
      const lx = fw ? Math.max(len, Math.min(1, fw[1]) * bw) : len;
      g += T(labw + lx + 5, y + 13, P(v[1]) + (fw && fw[1] - v[1] > 0.002 ? ' (' + P(fw[1]) + ' with ties)' : '') + ' from ' + nm(v[0]), { s: 10.5, m: 1, f: 'var(--ink2)' });
      y += rh;
    });
    h.innerHTML = svgWrap(w, y + 4, g, 'worst loss') + legend([{ c: 'var(--s1)', n: 'clouds, neoclouds, landlords' }, { c: 'var(--s3)', n: 'suppliers' }, { c: 'var(--crit)', n: 'tick: own break line' }, { c: 'var(--s2)', n: 'orange: extra loss with funding ties' }]);
  });
  chart('n-par', h => {
    const rows = Object.entries(D.par).filter(([t, p]) => p.share >= 0.03).sort((a, b) => b[1].share - a[1].share);
    hbars(h, rows.map(([t, p]) => ({ label: nm(t), bars: [{ v: p.share * 100, c: t === 'ORCL' ? 'var(--crit)' : col(t), lab: P(p.share) + ' (from ' + nm(p.origin) + ')', tip: nm(t) + ': ' + B(p.profit) + ' of gross profit lost, ' + P(p.share, 1) + ' of EBITDA, worst origin ' + nm(p.origin) }] })), { rh: 26, bh: 10, max: 40 });
  });
  chart('n-stakes', h => {
    hbars(h, D.stakes.map(s => ({ label: nm(s.holder) + ' in ' + nm(s.lab), bars: [{ v: s.share_mcap * 100, c: s.holder === 'SFTBY' ? 'var(--crit)' : col(s.holder), lab: P(s.share_mcap, 1) + ' (' + B(s.loss30) + ')', tip: nm(s.holder) + ': stake about ' + B(s.value) + '; 30% markdown ' + B(s.loss30) + '<br>' + s.basis }] })).sort((a, b) => b.bars[0].v - a.bars[0].v), { rh: 30, bh: 11, max: 25 });
  });
  chart('n-lenders', h => {
    const L = [['TD Bank', 26.8], ['Pimco', 23], ['Goldman Sachs', 16.5], ['Wells Fargo', 16.4], ['JPMorgan Chase', 13.3], ['Bank of America', 12.8], ['MUFG', 11.8], ['SMBC', 11.5], ['Blue Owl', 11], ['Citibank', 10.5], ['Morgan Stanley', 9.3], ['ING', 8.5], ['Royal Bank of Canada', 8.3], ['Blackstone Credit', 8], ['Mizuho', 8]];
    const priv = new Set(['Pimco', 'Blue Owl', 'Blackstone Credit']);
    hbars(h, L.map(([n, v]) => ({ label: n, bars: [{ v, c: priv.has(n) ? 'var(--s4)' : 'var(--s1)', lab: '$' + v + 'B' }] })), { rh: 22, bh: 9, max: 30 });
    h.insertAdjacentHTML('beforeend', legend([{ c: 'var(--s1)', n: 'banks' }, { c: 'var(--s4)', n: 'private credit' }]));
  });
  chart('n-mirror', h => {
    const ids = ['SNDK', 'MRVL', 'WDC', 'DELL', 'HPE', 'SKH', 'SSNLF', 'AMD', 'TSM', 'AAPL', 'HPQ', 'MSFT', 'NVDA', 'CRM', 'AVGO', 'META', 'ADBE', 'CEG', 'RDDT', 'NOW', 'APLD', 'ORCL', 'CIFR', 'IREN', 'CRWV', 'WYFI'];
    const rows = ids.filter(t => N[t] && N[t].chg52 != null).map(t => [t, N[t].chg52]).sort((a, b) => b[1] - a[1]);
    const w = widthOf(h), labw = Math.min(130, w * 0.26), rh = 20, zero = labw + (w - labw - 60) * 0.18, scP = (w - zero - 60) / 470, scN = (zero - labw) / 75; let g = '', y = 0;
    rows.forEach(([t, v]) => {
      const x = v >= 0 ? zero : zero - (-v) * scN, len = v >= 0 ? v * scP : (-v) * scN;
      g += T(labw - 6, y + 12, nm(t), { a: 'end', s: 11.5, f: 'var(--ink)' });
      g += `<rect x="${x.toFixed(1)}" y="${y + 3}" width="${Math.max(1, len).toFixed(1)}" height="11" rx="2" style="fill:${v >= 0 ? 'var(--s3)' : 'var(--crit)'}" data-tip="${esc(nm(t) + ': ' + (v > 0 ? '+' : '') + v.toFixed(1) + '% over 52 weeks')}"/>`;
      g += T(v >= 0 ? zero + len + 4 : zero + 4, y + 12, (v > 0 ? '+' : '') + Math.round(v) + '%', { s: 10.5, m: 1, f: 'var(--ink2)' });
      y += rh;
    });
    g += `<line x1="${zero}" x2="${zero}" y1="0" y2="${y}" style="stroke:var(--axis)"/>`;
    h.innerHTML = svgWrap(w, y + 4, g, 'one-year price change');
  });
  chart('n-cv', h => {
    const w = widthOf(h), H = 420, m = { l: 50, r: 20, t: 14, b: 44 };
    const ids = Object.keys(D.worst).filter(t => N[t].A);
    const pts = ids.map(t => ({ t, x: (D.res[t] ? D.res[t].caused : 0), y: Math.min(1, D.worst[t][1]), br: D.victim[t] && D.victim[t].n_break > 0 }));
    pts.push({ t: 'USERS', x: D.res.USERS.caused, y: 0, br: false });
    const lx = v => Math.log10(Math.max(0.1, v)), x0 = -1, x1 = Math.log10(260), X = v => m.l + (lx(v) - x0) / (x1 - x0) * (w - m.l - m.r), Y = v => H - m.b - v * (H - m.t - m.b);
    let g = '';
    [0, 0.25, 0.5, 0.75, 1].forEach(v => { g += `<line x1="${m.l}" x2="${w - m.r}" y1="${Y(v)}" y2="${Y(v)}" style="stroke:var(--grid)"/>` + T(m.l - 6, Y(v) + 4, (v * 100) + '%', { a: 'end', s: 11, f: 'var(--mut)' }); });
    [0.1, 1, 10, 100].forEach(v => { g += T(X(v), H - m.b + 16, v < 1 ? '$0.1B or less' : '$' + v + 'B', { a: 'middle', s: 11, f: 'var(--mut)' }); });
    g += T((m.l + w - m.r) / 2, H - 6, 'culprit side: damage to others from its own 30% cut', { a: 'middle', s: 11.5 });
    g += T(m.l + 4, m.t + 4, 'victim side: worst share of own AI revenue lost', { s: 11, f: 'var(--ink2)' });
    const show = new Set(['USERS', 'OAI', 'ANTH', 'MSFT', 'AMZN', 'NVDA', 'ORCL', 'CRWV', 'WULF', 'HUT', 'APLD', 'CRSO', 'IREN', 'FLST']);
    const labs = [];
    pts.forEach(p => {
      g += `<circle cx="${X(p.x).toFixed(1)}" cy="${Y(p.y).toFixed(1)}" r="6" style="fill:${col(p.t)};fill-opacity:.7;stroke:${p.br ? 'var(--crit)' : 'var(--surf)'};stroke-width:${p.br ? 2.2 : 1}" data-tip="${esc(nm(p.t) + '<br>damage caused ' + B(p.x) + '<br>worst loss ' + P(p.y) + (p.br ? '<br>breaks in at least one run' : ''))}"/>`;
      if (show.has(p.t)) labs.push({ x: X(p.x) + 8, y: Y(p.y) + 4, t: nm(p.t) });
    });
    labs.sort((a, b) => a.y - b.y || a.x - b.x); labs.forEach((l, i) => { labs.slice(0, i).forEach(q => { if (Math.abs(q.x - l.x) < 80 && Math.abs(q.y - l.y) < 12) l.y = q.y + 12; }); g += T(Math.min(l.x, w - 70), l.y, l.t, { s: 11, f: 'var(--ink)', halo: 1 }); });
    h.innerHTML = svgWrap(w, H, g, 'culprit against victim') + legendG(['Labs', 'Clouds', 'Suppliers']);
  });

  /* ---------- Part 6 ---------- */
  let STSORT = 'score';
  chart('n-stress', h => {
    const comps = [['funding', 'Funding need'], ['leverage', 'Leverage'], ['concentration', 'Concentration'], ['valuation', 'Valuation'], ['drawdown', 'Price fall']];
    const rank = {}; comps.forEach(([k]) => { const vals = Object.values(D.sig[k]).filter(v => v != null); rank[k] = v => v == null ? null : (vals.filter(x => x < v).length + 0.5 * vals.filter(x => x === v).length) / vals.length; });
    let ids = Object.keys(D.stress).filter(t => D.stress[t] != null);
    ids.sort((a, b) => STSORT === 'score' ? D.stress[b] - D.stress[a] : ((rank[STSORT](D.sig[STSORT][b]) || 0) - (rank[STSORT](D.sig[STSORT][a]) || 0)));
    const fmt = { funding: v => P(v), leverage: v => v.toFixed(1) + 'x', concentration: v => P(v), valuation: v => v.toFixed(1) + 'x', drawdown: v => Math.abs(v) < 0.5 ? '0%' : (v > 0 ? '-' : '+') + Math.abs(v).toFixed(0) + '%' };
    const cell = (k, t) => { const v = D.sig[k][t], r = rank[k](v); if (r == null) return '<td class="c z">n/a</td>'; return `<td class="c" style="background:color-mix(in srgb, var(--crit) ${Math.round(r * 70)}%, transparent)" data-tip="${esc(nm(t) + ' ' + k + ': ' + fmt[k](v) + ', rank ' + P(r))}">${fmt[k](v)}</td>`; };
    const head = `<tr><th data-s="score" style="cursor:pointer">Firm / stress score</th>${comps.map(([k, l]) => `<th data-s="${k}" style="cursor:pointer">${l}</th>`).join('')}</tr>`;
    const rows = ids.slice(0, 30).map(t => `<tr><td><b>${esc(nm(t))}</b> <span class="small">${D.stress[t].toFixed(2)}</span></td>${comps.map(([k]) => cell(k, t)).join('')}</tr>`).join('');
    h.innerHTML = `<div class="scroll"><table class="heat" style="min-width:620px"><thead>${head}</thead><tbody>${rows}</tbody></table></div><p class="small">Showing the 30 most strained of ${ids.length} listed firms. Sorted by ${STSORT === 'score' ? 'stress score' : comps.find(c => c[0] === STSORT)[1].toLowerCase()}.</p>`;
    h.querySelectorAll('th[data-s]').forEach(th => th.onclick = () => { STSORT = th.dataset.s; renderAll(); });
  });
  chart('n-matrix', h => {
    const w = widthOf(h), H = 400, m = { l: 56, r: 24, t: 14, b: 44 };
    const ids = Object.keys(D.stress).filter(t => D.stress[t] != null && D.res[t]);
    const pts = ids.map(t => ({ t, x: D.stress[t], y: D.res[t].caused }));
    const ly = v => Math.log10(Math.max(0.1, v)), y0 = -1, y1 = Math.log10(400), X = v => m.l + v * (w - m.l - m.r), Y = v => H - m.b - (ly(v) - y0) / (y1 - y0) * (H - m.t - m.b);
    let g = '';
    [0.1, 1, 10, 100].forEach(v => { g += `<line x1="${m.l}" x2="${w - m.r}" y1="${Y(v)}" y2="${Y(v)}" style="stroke:var(--grid)"/>` + T(m.l - 6, Y(v) + 4, v < 1 ? '$0.1B or less' : '$' + v + 'B', { a: 'end', s: 11, f: 'var(--mut)' }); });
    [0, 0.25, 0.5, 0.75, 1].forEach(v => { g += T(X(v), H - m.b + 16, v.toFixed(2), { a: 'middle', s: 11, f: 'var(--mut)' }); });
    g += T((m.l + w - m.r) / 2, H - 6, 'stress score (0 least strained, 1 most)', { a: 'middle', s: 11.5 });
    g += T(m.l + 4, m.t + 4, 'damage to others from its own 30% cut', { s: 11, f: 'var(--ink2)' });
    [['OAI', 0.97], ['ANTH', 0.93]].forEach(([t, x]) => pts.push({ t, x, y: D.res[t].caused, lab: 1 }));
    const labs = [];
    pts.forEach(p => {
      g += `<circle cx="${X(p.x).toFixed(1)}" cy="${Y(p.y).toFixed(1)}" r="6" style="fill:${col(p.t)};fill-opacity:${p.lab ? .35 : .75};stroke:${p.lab ? col(p.t) : 'var(--surf)'};stroke-dasharray:${p.lab ? '3 2' : '0'}" data-tip="${esc(nm(p.t) + '<br>' + (p.lab ? 'no stress score (private)' : 'stress ' + p.x.toFixed(2)) + '<br>damage caused ' + B(p.y))}"/>`;
      if (p.y > 3 || (p.x > 0.8 && p.y >= 1)) labs.push({ x: X(p.x) + 8, y: Y(p.y) + 4, t: nm(p.t) });
    });
    labs.sort((a, b) => a.y - b.y); labs.forEach((l, i) => { labs.slice(0, i).forEach(q => { if (Math.abs(q.x - l.x) < 80 && Math.abs(q.y - l.y) < 12) l.y = q.y + 12; }); g += T(Math.min(l.x, w - 70), l.y, l.t, { s: 11, f: 'var(--ink)', halo: 1 }); });
    const low = pts.filter(p => p.y < 0.15 && p.x > 0.6).sort((a, b) => b.x - a.x).map(p => nm(p.t));
    h.innerHTML = svgWrap(w, H, g, 'likelihood against damage') + legendG(['Labs', 'Clouds', 'Suppliers']) + '<p class="small" style="margin:6px 0 0">On the bottom line, most strained first: ' + low.join(', ') + '.</p>';
  });
  chart('n-themes', h => {
    const w = widthOf(h), labw = w < 560 ? 4 : Math.min(210, w * 0.36), bw = w - labw - 150, max = 220, rh = 46, top = w < 560 ? 16 : 0; let g = '', y = 0;
    D.themes.forEach(th => {
      const len = th.total / max * bw, br = Object.keys(th.broken).map(nm);
      if (top) { g += T(4, y + 12, th.name, { s: 12.5, w: 600, f: 'var(--ink)' }); y += top; } else g += T(labw - 6, y + 14, th.name, { a: 'end', s: 12.5, w: 600, f: 'var(--ink)' });
      g += `<rect x="${labw}" y="${y + 3}" width="${len.toFixed(1)}" height="14" rx="2" style="fill:var(--s1)" data-tip="${esc(th.name + ': ' + th.note)}"/>`;
      g += T(labw + len + 5, y + 14, B(th.total), { s: 11, m: 1 });
      const ft = FBC.themes.find(x => x[0] === th.name); if (ft) { const lf = ft[1] / max * bw; g += `<rect x="${labw}" y="${y + 19}" width="${lf.toFixed(1)}" height="5" rx="1" style="fill:var(--s2)" data-tip="${esc(th.name + ' with funding ties: ' + B(ft[1]))}"/>`; const nb = ft[2].length - Object.keys(th.broken).length; g += T(labw + lf + 5, y + 25, B(ft[1]) + (w < 560 ? '' : ' with funding ties') + (nb > 0 ? ', ' + nb + ' more break' : ''), { s: 10, f: 'var(--s2)' }); y += 10; }
      const ls = wrapLines(br.length ? br.length + ' break: ' + br.join(', ') : 'no firm breaks', w - labw - 4, 10.5);
      ls.forEach((l, k) => { g += T(labw, y + 31 + k * 13, esc(l), { s: 10.5, f: br.length ? 'var(--crit)' : 'var(--mut)' }); });
      g += T(labw, y + 43 + (ls.length - 1) * 13, th.lender > 0.05 ? 'lenders lose ' + B(th.lender) : '', { s: 10.5, f: 'var(--ink2)' });
      y += rh + (ls.length - 1) * 13 + (top ? 8 : 0);
    });
    h.innerHTML = svgWrap(w, y + 2, g, 'joint shocks') + legend([{ c: 'var(--s1)', n: 'payments only' }, { c: 'var(--s2)', n: 'with funding ties' }]);
  });

  /* ---------- Part 7 ---------- */
  chart('n-valuation', h => {
    const ids = Object.keys(N).filter(t => N[t].mcap && N[t].R && N[t].layer !== 'Finance');
    const rows = ids.map(t => [t, N[t].mcap / N[t].R]).filter(([t, v]) => v >= 10 || ['MSFT', 'GOOGL', 'AMZN', 'META', 'ORCL', 'OAI', 'ANTH'].includes(t)).sort((a, b) => b[1] - a[1]);
    hbars(h, rows.map(([t, v]) => ({ label: nm(t), bars: [{ v, c: col(t), lab: v.toFixed(0) + 'x' }] })), { rh: 30, bh: 9, max: 95, aria: 'Market value as a multiple of trailing revenue' });
    h.insertAdjacentHTML('beforeend', legendG(['Labs', 'Clouds', 'Suppliers', 'Outside']));
  });
  chart('n-watch', h => {
    const rows = [
      ['About 19 to 20 Nov 2026', 'Anthropic listing (reported, unconfirmed)', 'A weak debut marks down Amazon, Alphabet and Microsoft stakes and tests the Fluidstack and Lambda chain (Part 4).'],
      ['Open', 'OpenAI round ($11B secured of $20B)', 'A short close weakens the premise behind Oracle, Crusoe and Applied Digital.'],
      ['Any time', 'Oracle rating action', 'A cut to junk is the first break line in the map (4.3% of contracted revenue).'],
      ['Daily', 'CoreWeave credit default swap', 'Record 1,194.5bp on 15 October. Above 1,000bp is treated as distress.'],
      ['Before year end', 'Nscale listing price', 'Bids of $16B to $19B against a $30B to $35B target. A cut or pulled listing confirms closing access to equity.'],
      ['Quarterly', 'Neocloud filings', 'Covenant waivers, going-concern language or customer reassignments at CoreWeave, Nebius, IREN, Applied Digital, TeraWulf, Hut 8 or Cipher.'],
      ['Quarterly', 'Big-cloud capex guidance', 'Microsoft already trimmed for data-centre delays. A cut by all five is the $131B joint shock in Part 6.'],
      ['Monthly', 'Memory contract prices', 'A turn in DRAM prices flips the memory makers from winners to victims and relieves device makers.'],
      ['Ongoing', 'Software seat counts', 'Evidence that AI agents replace paid seats confirms the mirror premise (Part 5).']
    ];
    h.innerHTML = table(['When', 'What', 'Why it matters'], rows);
  });

  /* ---------- Part 8 ---------- */
  chart('n-assume', h => {
    const p = D.params;
    const rows = [
      ['Shock size at each origin', P(p.ORIG_SHOCK), 'Same for every firm so damage is comparable', 'Damage scales almost in proportion between break points'],
      ['Spending response (epsilon)', p.EPS.toFixed(1), 'A firm cuts AI spending in proportion to AI revenue lost', 'Tested at 0.5 and 1.5 below'],
      ['Buyers outside the map', P(p.ROW_SHARE), 'Share of each supplier\'s AI revenue not traced to a mapped buyer', 'Lower share means larger losses for mapped suppliers'],
      ['Leverage line (self-funded firms)', p.LEV_TRIG + 'x debt/EBITDA', 'Common rating boundary; Oracle trigger reported at 4.5x', 'Sets Oracle\'s 4.3% line'],
      ['Leverage line (REITs)', p.REIT_TRIG + 'x', 'REITs carry more debt by design', 'Equinix and Digital Realty only'],
      ['Break line (financing-dependent)', P(p.FIN_TRIG), 'Calibrated on CoreWeave with an assumed 1.5x covenant', 'Moves which neoclouds break'],
      ['Loss given default', P(p.LGD), 'Market convention for unsecured credit', 'Scales lender losses'],
      ['Freeze response', 'all AI capex stops', 'A firm that crosses its leverage line stops new AI capex', 'Halving it lowers the OpenAI result from $135B to $101B'],
      ['Contract life', '5 years unless disclosed', 'Amazon 6.1; leases 10 to 15 years where reported', 'Converts backlog to a yearly figure'],
      ['AI share of revenue', 'firm by firm', 'Sourced for AMD, Broadcom, Intel, TSMC, Micron, Dell, Arista; estimated elsewhere', 'Sets each supplier\'s AI revenue at stake'],
      ['Stake values in labs', 'as listed in Part 5', 'Filings and secondary sources', 'Equity channel only'],
      ['GPU loan, rent and efficiency inputs', 'Part 5 and 6 captions', 'Illustrative unit economics', 'Collateral, break-even and efficiency charts only'],
      ['Outside funding share of private firms', '80%', 'No cash-flow data for Nscale, Lambda, Crusoe, Fluidstack', 'Contagion and reflexive tests'],
      ['Lender pullback after a first failure', '30% and 60%', 'Illustrative range; no history to calibrate', 'Contagion test (Part 7)'],
      ['Funding cut in the reflexive test', '35% for neoclouds; a third for OpenAI', 'Midpoint of the 26% to 40% share fall; OpenAI round cut from $30B to $20B', 'Reflexive test and policy-plus-funding test'],
      ['Building slowdown', '10%, 20%, 30% for a year', 'UBS: about 30% of 2028 additions at risk; Goldman: pauses temporary', 'Policy test (Part 6)'],
      ['Market falls applied', '35%, 15.4%, 10%', 'Observed October to November moves by group', 'Market value at risk (Part 7)']
    ];
    h.innerHTML = table(['Assumption', 'Value', 'Basis', 'What it moves'], rows);
  });
  chart('n-sens', h => {
    const e = D.sens.filter(s => s.param === 'EPS'), f = D.sens.filter(s => s.param === 'freeze_cut');
    const metric = (label, value, breaks) => `<div class="sens-metric"><small>${label}</small><b>${value}</b>${breaks == null ? '' : `<span>${breaks} firms break</span>`}</div>`;
    const row = (label, cells) => `<div class="sens-row"><div class="sens-setting">${label}</div><div class="sens-results">${cells.join('')}</div></div>`;
    h.innerHTML = `<section class="sens-group"><h4>1 · Spending response (ε)</h4><p>How strongly a firm cuts its AI spending when its AI revenue is hit. The same 30% initial shock is applied in each run.</p><div class="sens-head"><span>Setting</span><span>End users cut 30%</span><span>OpenAI cuts 30%</span><span>Anthropic cuts 30%</span></div>${e.map(s => row('ε = ' + s.value, [metric('End users', B(s.users), null), metric('OpenAI', B(s.oai), s.oai_breaks), metric('Anthropic', B(s.anth), s.anth_breaks)])).join('')}</section><section class="sens-group"><h4>2 · Oracle response to a funding freeze</h4><p>How much of its AI capex Oracle stops after crossing its leverage trigger. The other assumptions stay unchanged.</p><div class="sens-head sens-head-one"><span>Oracle cuts</span><span>OpenAI cuts 30%</span></div>${f.map(s => row(P(s.value) + ' of Oracle capex', [metric('OpenAI shock', B(s.oai), s.oai_breaks)])).join('')}</section>`;
  });
  chart('n-links', h => {
    const fl = D.flags;
    const rows = Object.keys(D.S).filter(s => N[s] && N[s].A).sort((a, b) => N[b].A - N[a].A).map(s => {
      const parts = Object.entries(D.S[s]).sort((a, b) => b[1] - a[1]).filter(([b, v]) => v >= 0.01).map(([b, v]) => nm(b) + ' ' + P(v) + (b === 'ROW' || b === 'USERS' ? '' : ' <span class="tag ' + ((fl[b + '>' + s] || 'G') === 'S' ? 'src' : 'asm') + '">' + (fl[b + '>' + s] || 'G') + '</span>'));
      return [esc(nm(s)), B(N[s].A), esc(N[s].basis || ''), parts.join('; ')];
    });
    h.innerHTML = table(['Seller', 'AI revenue at stake a year', 'How it was built', 'Paid by'], rows);
  });
  chart('n-nodes', h => {
    const f = (v, d) => v == null ? 'n/a' : (+v).toFixed(d === undefined ? 1 : d);
    const ids = Object.keys(N).filter(t => !['USERS', 'ROW', 'LEND'].includes(t));
    const rows = ids.map(t => { const n = N[t]; return [esc(nm(t)), n.layer, f(n.R), f(n.ebitda), f(n.capex), f(n.fcf), f(n.debt), f(n.cash), f(n.mcap, 0), n.gm == null ? 'n/a' : P(n.gm), n.chg52 == null ? 'n/a' : Math.round(n.chg52) + '%', n.stress == null ? 'n/a' : n.stress.toFixed(2)]; });
    h.innerHTML = table(['Firm', 'Layer', 'Revenue', 'EBITDA', 'Capex', 'FCF', 'Debt', 'Cash', 'Mkt value', 'Gross margin', '1-year price', 'Stress'], rows, { num: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11] }) + '<p class="small">Sources: stockanalysis.com statistics pages (price dates 26 October to 5 November 2026), companiesmarketcap.com (USD page, fetched 6 November, undated), Micron 8-K (30 September), TSMC release (15 October), Anthropic S-1, Nscale S-1, tipranks for Cipher and Arista. Private firms show only what press reports give.</p>';
  });
  chart('n-coverage', h => {
    const rows = [
      ['Every public deal since January 2023 in a spreadsheet', 'The workbook (92 legs) behind Part 1; firmness coding and build-up by year in Part 1'],
      ['Real math on how a shock cascades, with real examples', 'Part 4 (Microsoft worked example, every origin) and the equations above'],
      ['A graph of how the firms are interconnected', 'Part 2: interactive network of 59 firms with payments, equity, guarantees, loans and a shock-origin selector'],
      ['Risk accumulating in the network', 'Part 1 (build-up over time), Part 4 (loops add little, break lines add a lot), Part 7 (belief network and contagion)'],
      ['Small order-dependent firms whose failure could hit everything', 'Parts 2, 5 and 6 (concentration, break lines, stress); Part 7 (cash runway, contagion through lenders: $0.1B alone becomes $11B to $22B)'],
      ['Risk to the overall tech market', 'Parts 4 and 6 (damage to 59 firms, joint shocks); Part 7 (about $3.7T of market value at risk; seven mega-caps are a third of the S&P 500)'],
      ['Oracle and Tencent; Microsoft idle GPUs', 'Part 6 (Tencent lease, H200 charge, power delays); Microsoft idle GPUs attributed to Nadella (Part 8)'],
      ['Overbuild, new architectures, banks lending against fast-depreciating GPUs', 'Part 5 (collateral, break-even rent, recovery by GPU age) and Part 6 (efficiency elasticity, credit shock)'],
      ['Chip, RAM and battery prices, device demand and vendor orders', 'Part 5 (memory prices, consumer loop, Intel exposure, latest results from HP, Apple, Qualcomm, AMD and Intel, battery cells)'],
      ['Market events: Intel, Sandisk, big-tech cash flow, inflation and the Fed, Google and Reddit', 'Part 6 (rates corrected, 2026 timeline), Part 7 (event table), Part 8 (claims checked)'],
      ['Human perception, overreaction and market sentiment', 'Part 7: two networks, event table, 8 October and 5 November tests, mechanisms, reflexive loop'],
      ['The 5 November crash and AI policy after the midterms', 'Part 6 (what changed, proposals and feasibility, no-bailout stance, building-slowdown test) and Part 7 (5 November test)'],
      ['OpenAI and Anthropic valuations and a usage slowdown', 'Part 8 (multiples, OpenAI revenue paths, PwC return survey); usage data not available'],
      ['Microsoft\'s 60,000', 'Part 8'],
      ['Everyone is culprit and victim of their own premise', 'Parts 1, 4 and 5; both sides charted for every firm in Part 5; policy and the labs\' own warnings in Part 6'],
      ['Sector-wide, not 4 or 5 companies', '59 firms in Part 2; every firm shocked in Part 4'],
      ['A story with flow, every number explained', 'Each part opens with where it stands and closes with what it leads to']
    ];
    h.innerHTML = table(['You asked for', 'Where it is'], rows);
  });
  chart('n-sources2', h => {
    const L = (u, t) => `<a href="${u}" target="_blank" rel="noopener">${esc(t)}</a>`;
    const rows = [
      ['https://stockanalysis.com/stocks/nvda/statistics/', 'stockanalysis.com statistics pages (one per listed firm; Nvidia shown)'],
      ['https://companiesmarketcap.com/', 'companiesmarketcap.com, largest companies by market value (USD)'],
      ['https://www.sec.gov/Archives/edgar/data/0000723125/000072312526000018/a2026q4ex991-pressrelease.htm', 'Micron fiscal Q4 2026 results (8-K, 30 Sep 2026)'],
      ['https://pr.tsmc.com/english/news/3346', 'TSMC Q3 2026 results (15 Oct 2026)'],
      ['https://www.metirai.com/blog/tsmc-q3-2026-earnings-gross-margin-hpc-mix-capex-guidance-2026', 'TSMC HPC share and 2026 capex (secondary)'],
      ['https://www.sec.gov/Archives/edgar/data/0001730168/000173016826000076/avgo-08022026x8kxex99.htm', 'Broadcom Q3 FY2026 results (8-K)'],
      ['https://ir.amd.com/news-events/press-releases/detail/1303/amd-reports-third-quarter-2026-financial-results', 'AMD Q3 2026 results (3 Nov 2026)'],
      ['https://www.placera.se/pressmeddelanden/sk-hynix-announces-3q26-financial-results-20261028', 'SK hynix 3Q26 results (28 Oct 2026)'],
      ['https://www.sec.gov/Archives/edgar/data/0001045810/000104581026000075/nvda-20260726.htm', 'Nvidia 10-Q, quarter to 26 July 2026'],
      ['https://fourweekmba.com/ai-where-nvidias-42b-of-taiwan-revenue-really-ends-up/', 'Nvidia customer concentration (secondary)'],
      ['https://henryfund.tippie.uiowa.edu/sites/henryfund.tippie.uiowa.edu/files/2026-04/ANET-S26_0.pdf', 'Arista customer concentration (Henry Fund report citing the 10-K)'],
      ['https://pulse2.com/dell-technologies-q2-revenue-hits-record-47-billion-as-ai-server-backlog-reaches-95-billion-and-fy27-outlook-rises-to-192-billion/', 'Dell Q2 FY2027 results'],
      ['https://aiweekly.co/alerts/alphabet-posts-1276b-q3-with-google-cloud-up-103-to-307b-as-2027-capex-set-to', 'Alphabet Q3 2026 results'],
      ['https://vestedfinance.com/blog/microsoft-q1-fy27-results-revenue-jumps-19-to-92-3-billion-as-azure-grows-48/', 'Microsoft Q1 FY2027 results'],
      ['https://letsdatascience.com/news/meta-narrows-2026-capital-spending-range-to-135-billion-145-46f12e07', 'Meta Q3 2026 results'],
      ['https://www.softwareseni.com/dram-prices-in-2026-have-doubled-and-the-numbers-are-getting-worse/', 'Memory prices and device shipment forecasts (compiles TrendForce, IDC, Gartner, Counterpoint, HP)'],
      ['https://www.indmoney.com/blog/us-stocks/servicenow-down-now-stock-ai-saaspocalypse-selloff-analysis', 'The 2026 software sell-off'],
      ['https://www.bisnow.com/news/national/data-center-capital-markets/these-15-companies-leading-trillion-dollar-data-center-lending-boom', 'US data-centre debt and top lenders (Bisnow, AtriumData)'],
      ['https://www.poundsterlinglive.com/history/USD-KRW-2026', 'Won exchange rate, 2026'],
      ['https://www.tipranks.com/stocks/cifr/statistics', 'Cipher Mining statistics'],
      ['https://www.tipranks.com/stocks/anet/statistics', 'Arista statistics'],
      ['https://stockanalysis.com/stocks/spcx/statistics/', 'SpaceX statistics'],
      ['https://www.scotsmanguide.com/news/federal-reserve-hikes-interest-rates-finally-putting-its-foot-down-on-inflation/', 'Scotsman Guide: Fed raises rates (September 2026)'],
      ['https://admiralmarkets.com/analytics/traders-blog/fed-rate-decision-october-2026', 'Admiral Markets: October 2026 Fed decision'],
      ['https://admiralmarkets.com/analytics/traders-blog/us-cpi-preview-september-2026-forecasts-and-the-core-cpi-outlook', 'Admiral Markets: US CPI, September 2026'],
      ['https://www.relevantaudience.com/google-ads-en/alphabet-q3-2026-search-revenue-ai-mode-monetization/', 'Alphabet Q3 2026: search revenue and AI Mode'],
      ['https://www.tekedia.com/alphabet-shares-slide-10-as-ai-spending-drains-cash-and-google-search-misses-estimates/', 'Tekedia: Alphabet shares and cash flow'],
      ['https://www.heygotrade.com/en/news/meta-meta-stock-news-october-23-2026/', 'Gotrade: Meta falls 7.0% (22 October)'],
      ['https://thenextweb.com/news/apple-earnings-q4-2026-memory-costs-margins', 'The Next Web: Apple Q4 FY2026 and memory costs'],
      ['https://www.benzinga.com/trading-ideas/movers/26/07/60791225/rising-memory-costs-are-hurting-smartphones-qualcomm-warns', 'Benzinga: Qualcomm on memory costs'],
      ['https://parameter.io/hp-inc-hpq-stock-plunges-9-despite-beating-earnings-memory-shortages-take-toll/', 'Parameter: HP Q3 FY2026'],
      ['https://www.energy-storage.news/price-jump-chinese-firms-battery-cell-quotes-approach-0-4-rmb-wh-system-prices-follow-suit/', 'Energy-Storage.News: battery cell prices'],
      ['https://siliconanalysts.com/market-data/hyperscaler-ai-capex', 'Silicon Analysts: hyperscaler capex by quarter'],
      ['https://aiweekly.co/alerts/amazon-microsoft-alphabet-meta-plan-725b-ai-capex-in-2026', 'AI Weekly: 2026 capex plans'],
      ['https://www.webpronews.com/pwc-survey-56-of-firms-report-no-roi-from-ai-investments/', 'WebProNews: PwC survey on AI returns'],
      ['https://www.tomshardware.com/tech-industry/artificial-intelligence/nvidia-loses-usd589-billion-in-market-cap-broad-stock-plunge-triggered-by-deepseek-ai-release', 'Tom\'s Hardware: Nvidia loses $589B on DeepSeek'],
      ['https://pluang.com/en/news-feed/coreweave-dan-nebius-turun-9-persen-sentimen-mendekati-ketakutan-ekstrem', 'Pluang: CoreWeave and Nebius sell-off'],
      ['https://finance.yahoo.com/markets/live/stock-market-today-thursday-november-5-dow-sp-500-nasdaq-plunge-chip-stocks-melt-down-193726491.html', 'Yahoo Finance live blog, 5 November 2026'],
      ['https://www.stocktitan.net/articles/stock-market-today-live-november-5-2026', 'StockTitan: market close, 5 November 2026'],
      ['https://sellthenews.org/catalyx/market/2026-11-05', 'Sell the News: 5 November 2026 summary'],
      ['https://www.cbsnews.com/news/midterm-election-results-data-center-buildout-artificial-intelligence-texas/', 'CBS News: midterms and the data-centre build-out'],
      ['https://www.wsls.com/news/politics/2026/11/06/data-centers-took-a-beating-in-the-midterm-elections-a-reckoning-may-be-ahead-for-tech-giants/', 'AP via WSLS: data centres in the midterms'],
      ['https://www.techtimes.com/articles/330158/20261106/democrats-win-senate-lack-60-votes-ai-regulation-cantwell-pushes-federal-model-testing.htm', 'TechTimes: Senate votes and AI regulation'],
      ['https://www.techtimes.com/articles/330145/20261106/bitcoin-drops-below-76000-texas-data-center-moratorium-fears-sink-miners-pivoting-ai.htm', 'TechTimes: Texas moratorium fears and AI miners'],
      ['https://broadbandbreakfast.com/pallone-backs-national-moratorium-on-ai-data-centers/', 'Broadband Breakfast: Pallone backs a national moratorium'],
      ['https://wtop.com/national/2026/03/sanders-ocasio-cortez-push-bill-to-impose-ai-data-center-moratorium/', 'WTOP: Sanders and Ocasio-Cortez moratorium bill'],
      ['https://prospect.org/2026/10/28/house-progressives-ai-bailout-anthropic-google/', 'The American Prospect: no AI bailouts resolution'],
      ['https://migrantinsider.com/p/let-them-fail-democratic-house-inherits', 'Migrant Insider: H.Res. 1642 details'],
      ['https://www.lawcommentary.com/articles/democrats-ai-bailouts-bankruptcy-resolution', 'LawCommentary: the resolution\'s provisions'],
      ['https://www.implicator.ai/openai-walks-back-federal-backstop-talk-after-white-house-rebuke.md', 'Implicator: White House rules out an AI backstop (November 2025)'],
      ['https://primexbt.com/news/bofas-hartnett-warns-stocks-could-fall-more-than-10-on-a-democratic-congress-swe/', 'PrimeXBT: BofA on a Democratic sweep'],
      ['https://www.anthropic.com/news/anthropic-is-endorsing-sb-53', 'Anthropic endorses SB 53']
    ];
    h.innerHTML = '<h3>Added for the sector-wide model</h3><ul class="small" style="padding-left:20px">' + rows.map(r => `<li>${L(r[0], r[1])}</li>`).join('') + '</ul>';
  });
})();

