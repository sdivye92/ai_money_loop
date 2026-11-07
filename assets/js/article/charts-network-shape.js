/*NETPART*/
/* ---------- Part 3: network shape ---------- */
(function () {
  const NP = {"names": {"OAI": "OpenAI", "ANTH": "Anthropic", "SPCX": "xAI (SpaceX)", "MSFT": "Microsoft", "AMZN": "Amazon", "GOOGL": "Alphabet", "META": "Meta", "ORCL": "Oracle", "CRWV": "CoreWeave", "NBIS": "Nebius", "NSCL": "Nscale", "IREN": "IREN", "NVDA": "Nvidia", "AMD": "AMD", "AVGO": "Broadcom"}, "cols": [["OAI", "ANTH", "SPCX"], ["MSFT", "ORCL", "AMZN", "GOOGL", "META"], ["CRWV", "NBIS", "NSCL", "IREN"], ["NVDA", "AMD", "AVGO"]], "pay": [["OAI", "ORCL", 60.0], ["OAI", "MSFT", 50.0], ["OAI", "AMZN", 22.6], ["OAI", "CRWV", 4.5], ["OAI", "AVGO", 5.0], ["ANTH", "MSFT", 8.9], ["ANTH", "AMZN", 18.0], ["ANTH", "GOOGL", 22.9], ["ANTH", "NSCL", 8.9], ["META", "CRWV", 7.0], ["META", "NBIS", 3.0], ["META", "NVDA", 25.6], ["META", "AMD", 2.5], ["META", "AVGO", 10.0], ["MSFT", "CRWV", 6.2], ["MSFT", "NBIS", 3.5], ["MSFT", "NSCL", 8.8], ["MSFT", "IREN", 1.9], ["MSFT", "NVDA", 33.4], ["MSFT", "AMD", 3.3], ["ORCL", "NVDA", 18.6], ["ORCL", "AMD", 1.8], ["AMZN", "NVDA", 52.8], ["AMZN", "AMD", 5.2], ["CRWV", "NVDA", 5.0], ["GOOGL", "NVDA", 39.2], ["GOOGL", "AMD", 3.8], ["GOOGL", "AVGO", 22.4], ["SPCX", "NVDA", 6.5], ["NBIS", "NVDA", 2.7], ["NSCL", "NVDA", 1.6], ["IREN", "NVDA", 1.1]], "fin": [["MSFT", "OAI", "equity", "Microsoft's stake in OpenAI"], ["NVDA", "OAI", "equity+loan", "Nvidia's $30B stake and its guarantee of up to $105B for OpenAI's Ohio site"], ["AMD", "OAI", "equity", "AMD's warrants giving OpenAI up to 10% of AMD"], ["AMZN", "OAI", "equity", "Amazon's $50B investment in OpenAI"], ["CRWV", "OAI", "equity", "CoreWeave shares issued to OpenAI"], ["NVDA", "CRWV", "support", "Nvidia's promise to buy up to $6.3B of CoreWeave's unused capacity"], ["MSFT", "ANTH", "equity", "Microsoft's stake in Anthropic (up to $5B)"], ["NVDA", "ANTH", "equity", "Nvidia's stake in Anthropic"], ["AMZN", "ANTH", "equity+loan", "Amazon's stake in and loan to Anthropic"], ["GOOGL", "ANTH", "equity", "Google's stake in Anthropic"], ["ANTH", "AVGO", "loan", "Financing of Anthropic's Broadcom-built chips (recorded as a loan)"], ["NVDA", "SPCX", "equity", "Nvidia's stake in xAI"], ["NVDA", "META", "equity", "Nvidia's purchase of Meta shares"], ["AMD", "META", "equity", "AMD's purchase of Meta shares"], ["AVGO", "META", "equity", "Broadcom's purchase of Meta shares"], ["NVDA", "NBIS", "equity", "Nvidia's stake in Nebius"]], "loops": [{"n": "OpenAI, Oracle, Nvidia", "p": ["OAI", "ORCL", "NVDA"], "s": ["OpenAI pays Oracle for cloud capacity: about $300B over several years.", "Oracle fills that capacity with Nvidia chips.", "Nvidia sends money back to OpenAI: a $30B stake and a guarantee of up to $105B for its Ohio site."]}, {"n": "OpenAI, Oracle, AMD", "p": ["OAI", "ORCL", "AMD"], "s": ["OpenAI pays Oracle for cloud capacity.", "Oracle buys AMD chips for it.", "AMD gave OpenAI warrants for up to 10% of AMD, which vest as OpenAI deploys AMD chips."]}, {"n": "Anthropic, Microsoft, Nvidia", "p": ["ANTH", "MSFT", "NVDA"], "s": ["Anthropic committed $30B to Microsoft's Azure cloud in 2025. Its S-1 lists about $45B owed to Microsoft.", "Microsoft fills Azure with Nvidia chips.", "Nvidia committed up to $10B to Anthropic in the same deal."]}, {"n": "OpenAI and Amazon", "p": ["OAI", "AMZN"], "s": ["OpenAI committed $138B to Amazon's AWS cloud.", "Amazon committed $50B to OpenAI, $15B of it upfront."]}, {"n": "Anthropic and Alphabet", "p": ["ANTH", "GOOGL"], "s": ["Anthropic committed at least $114.5B to Google Cloud.", "Google has put about $13B into Anthropic."]}, {"n": "CoreWeave and Nvidia", "p": ["CRWV", "NVDA"], "s": ["CoreWeave buys Nvidia GPUs to rent out.", "Nvidia agreed to buy up to $6.3B of CoreWeave's unused capacity."]}], "nloops": 43, "hubs": [["Nvidia", 76, 18.7, 24.2, 74.6], ["TSMC", 54, 13.3, 6.1, 20.4], ["Amazon", 48, 11.8, 47.8, 135.3], ["Microsoft", 38, 9.4, 47.1, 108.1], ["OpenAI", 34, 8.4, 134.7, 142.2], ["CoreWeave", 20, 4.9, 7.9, 23.8], ["Alphabet", 9, 2.2, 44.3, 124.7], ["Anthropic", 8, 2.0, 44.8, 68.5]], "reach": 406, "cent": [["ASML", 1, 0.067, 0], ["Applied Materials", 2, 0.067, 0], ["Vertiv", 3, 0.131, 0], ["Lam Research", 4, 0.067, 0], ["TSMC", 5, 0.086, 0], ["SK hynix", 6, 0.13, 0], ["Nvidia", 7, 0.125, 0], ["Dell", 8, 0.061, 0]], "conc": [["IREN", 1.0, 0.3, 1], ["Core Scientific", 1.0, 0.3, 1], ["TeraWulf", 0.91, 0.95, 3], ["Hut 8", 0.91, 0.95, 3], ["Lambda", 0.82, 0.27, 2], ["Fluidstack", 0.68, 0.24, 2], ["Alphabet", 0.68, 0.061, 0], ["Applied Digital", 0.57, 0.383, 3]], "pred": {"caused": [["Spending with firms in the map", 0.99], ["Share of money routes through the firm (betweenness)", 0.54], ["Number of ties", 0.49]], "victim": [["Buyer concentration", 0.49], ["Share of money routes through the firm (betweenness)", -0.04], ["Number of ties", -0.45], ["Money received from firms in the map", -0.45], ["PageRank (where money ends up)", -0.46]]}, "inloops": {"AMD": 5, "OAI": 23, "ORCL": 3, "MSFT": 17, "AMZN": 8, "AVGO": 5, "META": 9, "NVDA": 27, "CRWV": 11, "NBIS": 4, "NSCL": 3, "IREN": 2, "ANTH": 14, "GOOGL": 2, "SPCX": 1}, "fbbars": [["End users pay 30% less", 214.8110808902281, 243.12693187696226, 8, 9], ["OpenAI cuts 30%", 134.6642258273559, 155.7118317961525, 3, 3], ["Amazon cuts 30%", 47.82246259786911, 54.37432620502086, 0, 0], ["Microsoft cuts 30%", 47.103098981470566, 53.059577989024326, 1, 1], ["Anthropic cuts 30%", 44.796182835217245, 54.37571711779479, 5, 5], ["Alphabet cuts 30%", 44.297144235806186, 50.021542505182715, 0, 0], ["Meta cuts 30%", 35.45829608928141, 39.62973257937432, 0, 0], ["Oracle cuts 30%", 18.704579716251175, 21.111773313363898, 0, 0], ["CoreWeave cuts 30%", 7.891210999866568, 10.458636433087156, 2, 2], ["Nvidia withholds 30% of its funding", 0, 96.37859858989545, 0, 3]]};
  const nmL = t => NP.names[t];
  const nmS = t => t === 'SPCX' ? 'xAI' : NP.names[t];
  let LM = 'pay', LS = -1;
  const ek = (a, b) => a + '>' + b;
  const PAY = {}, FIN = {};
  NP.pay.forEach(e => PAY[ek(e[0], e[1])] = e);
  NP.fin.forEach(e => FIN[ek(e[0], e[1])] = e);
  const loopEdges = L => { const s = new Set(); L.p.forEach((t, i) => s.add(ek(t, L.p[(i + 1) % L.p.length]))); return s; };
  function clip(c, o, hw, hh) {
    const dx = o.x - c.x, dy = o.y - c.y; if (!dx && !dy) return { x: c.x, y: c.y };
    const t = Math.min(dx ? hw / Math.abs(dx) : 1e9, dy ? hh / Math.abs(dy) : 1e9);
    return { x: c.x + dx * t, y: c.y + dy * t };
  }
  const draw = h => {
    const w = widthOf(h), vert = w < 560;
    const cols = NP.cols, heads = ['AI labs', 'Big clouds', 'Neoclouds', 'Chip makers'];
    const pos = {}; let W, H, nw, nh, fs;
    const xs = vert ? [40, 133, 227, 320] : [70, 265, 458, 650], gap = vert ? 56 : 62;
    if (!vert) { W = 720; nw = 104; nh = 30; fs = 13; }
    else { W = 360; nw = 74; nh = 24; fs = 10.5; }
    H = 64 + 5 * gap;
    cols.forEach((c, i) => { const top = 70 + (5 - c.length) * gap / 2; c.forEach((t, j) => pos[t] = { x: xs[i], y: top + j * gap }); });
    const L = LS >= 0 ? NP.loops[LS] : null, LE = L ? loopEdges(L) : null, LN = L ? new Set(L.p) : null;
    const hw = nw / 2 + 3, hh = nh / 2 + 3;
    let g = `<defs><marker id="lpA" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" style="fill:var(--axis)"/></marker><marker id="lpB" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" style="fill:var(--s2)"/></marker><marker id="lpC" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" style="fill:var(--ink)"/></marker></defs>`;
    heads.forEach((t, i) => { g += `<text x="${xs[i]}" y="22" text-anchor="middle" style="font:600 ${vert ? 10.5 : 12.5}px var(--head);fill:var(--mut)">${t}</text>`; });
    const edge = (a, b, fin, tip) => {
      const A = pos[a], Bp = pos[b]; if (!A || !Bp) return '';
      const on = LE && LE.has(ek(a, b)), dim = LE && !on;
      let d, ctrl;
      if (!fin) { const p1 = clip(A, Bp, hw, hh), p2 = clip(Bp, A, hw, hh); d = `M${p1.x.toFixed(1)} ${p1.y.toFixed(1)}L${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`; }
      else {
        const mx = (A.x + Bp.x) / 2, my = (A.y + Bp.y) / 2, dx = Bp.x - A.x, dy = Bp.y - A.y, len = Math.hypot(dx, dy) || 1;
        const k = 0.22, sgn = dy >= 0 ? -1 : 1;
        ctrl = { x: mx - dy / len * len * k * sgn, y: my + dx / len * len * k * sgn };
        const p1 = clip(A, ctrl, hw, hh), p2 = clip(Bp, ctrl, hw, hh);
        d = `M${p1.x.toFixed(1)} ${p1.y.toFixed(1)}Q${ctrl.x.toFixed(1)} ${ctrl.y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
      }
      const c = on ? 'var(--ink)' : fin ? 'var(--s2)' : 'var(--axis)';
      const op = dim ? 0.1 : on ? 1 : fin ? 0.85 : (LM === 'pay' ? 0.75 : 0.45);
      const sw = on ? 3 : fin ? 1.8 : 1.3;
      return `<path d="${d}" fill="none" style="stroke:${c};opacity:${op}" stroke-width="${sw}" ${fin && !on ? 'stroke-dasharray="6 4"' : ''} marker-end="url(#${on ? 'lpC' : fin ? 'lpB' : 'lpA'})" data-tip="${esc(tip)}"/><path d="${d}" fill="none" stroke="transparent" stroke-width="10" data-tip="${esc(tip)}"/>`;
    };
    NP.pay.forEach(e => { g += edge(e[0], e[1], false, nmL(e[0]) + ' pays ' + nmL(e[1]) + ': about $' + Math.round(e[2]) + 'B a year'); });
    if (LM === 'all') NP.fin.forEach(e => { g += edge(e[0], e[1], true, 'Finance: ' + e[3]); });
    if (LE) { /* redraw loop edges on top */
      NP.pay.forEach(e => { if (LE.has(ek(e[0], e[1]))) g += edge(e[0], e[1], false, nmL(e[0]) + ' pays ' + nmL(e[1]) + ': about $' + Math.round(e[2]) + 'B a year'); });
      NP.fin.forEach(e => { if (LE.has(ek(e[0], e[1]))) g += edge(e[0], e[1], true, 'Finance: ' + e[3]); });
    }
    Object.keys(pos).forEach(t => {
      const p = pos[t], inL = LN && LN.has(t), dim = LN && !inL;
      const n = NP.inloops[t] || 0;
      const tip = nmL(t) + '<br>' + (n ? 'in ' + n + ' of the ' + NP.nloops + ' short loops' : 'in none of the short loops');
      g += `<g data-tip="${esc(tip)}" style="opacity:${dim ? 0.35 : 1};cursor:default"><rect x="${(p.x - nw / 2).toFixed(1)}" y="${(p.y - nh / 2).toFixed(1)}" width="${nw}" height="${nh}" rx="${nh / 2}" style="fill:var(--surf);stroke:${inL ? 'var(--ink)' : 'var(--ring)'}" stroke-width="${inL ? 2.2 : 1.2}"/><text x="${p.x.toFixed(1)}" y="${(p.y + fs * 0.36).toFixed(1)}" text-anchor="middle" style="font:${inL ? 700 : 500} ${fs}px var(--head);fill:var(--ink)">${esc(vert ? nmS(t) : nmL(t))}</text></g>`;
    });
    const nf = LM === 'all' ? NP.fin.length : 0, nl = LM === 'all' ? NP.nloops : 0;
    const msg = LM === 'pay'
      ? `<b>No loops.</b> Every arrow runs from a customer to a supplier, left to right. Follow any path and it never returns to where it began. The same holds for every payment among the 48 firms in the map, not only the 15 shown.`
      : (L ? '' : `<b>${NP.nloops} loops.</b> The dashed ties run right to left, from suppliers back to their customers. Each one turns a one-way chain into a circle. Pick a loop above to trace it.`);
    const steps = L ? `<div class="lp-steps"><b>${esc(L.n)}</b><ol>${L.s.map(x => '<li>' + esc(x) + '</li>').join('')}</ol><p>The money that left ${esc(nmL(L.p[0]))} comes back to it.</p></div>` : '';
    h.innerHTML = `<div class="netguide"><b>How to use this chart</b><ol><li>It opens with payments only. Check that every arrow runs one way.</li><li>Press <i>Add finance ties</i> and watch the counter of loops jump from 0 to ${NP.nloops}.</li><li>Pick a loop to trace it step by step. Hover over or tap any arrow or firm for details.</li></ol></div>`
      + `<div class="btns" id="lp-mode"><button type="button" data-m="pay" aria-pressed="${LM === 'pay'}">1. Payments only</button><button type="button" data-m="all" aria-pressed="${LM === 'all'}">2. Add finance ties</button></div>`
      + `<div class="tiles lp-tiles"><div class="stat"><b>${NP.pay.length}</b><span>payments shown</span></div><div class="stat"><b>${nf}</b><span>finance ties shown</span></div><div class="stat${nl ? ' crit' : ''}"><b>${nl}</b><span>short loops in the map</span></div></div>`
      + (LM === 'all' ? `<p class="netstep"><b>3. Trace a loop:</b></p><div class="btns" id="lp-pick">${NP.loops.map((x, i) => `<button type="button" data-i="${i}" aria-pressed="${i === LS}">${esc(x.n)}</button>`).join('')}${LS >= 0 ? '<button type="button" data-i="-1">Clear</button>' : ''}</div>` : '')
      + (msg ? `<div class="lp-msg">${msg}</div>` : '') + steps
      + `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Network of 15 firms: payments ${LM === 'all' ? 'and finance ties' : 'only'}">${g}</svg>`
      + `<div class="legend"><span><i style="background:var(--axis);height:2px"></i>Payment: customer pays supplier</span>${LM === 'all' ? '<span><i style="background:repeating-linear-gradient(90deg,var(--s2) 0 6px,transparent 6px 10px);height:2px"></i>Finance: stake, loan or guarantee</span>' : ''}${L ? '<span><i style="background:var(--ink);height:3px"></i>The loop traced</span>' : ''}</div>`;
    h.querySelectorAll('#lp-mode button').forEach(b => b.onclick = () => { LM = b.dataset.m; if (LM === 'pay') LS = -1; draw(h); });
    h.querySelectorAll('#lp-pick button').forEach(b => b.onclick = () => { const i = +b.dataset.i; LS = i === LS ? -1 : i; draw(h); });
  };
  chart('n-loops', draw);

  /* hubs */
  chart('n-hubs', h => {
    const mxB = 20, mxD = 140;
    const rows = NP.hubs.map((r, i) => `<div class="nh-row"><span class="nh-n"><em>#${i + 1}</em> ${esc(r[0])}</span><span class="nh-c"><i style="--w:${(r[2] / mxB * 100).toFixed(1)};background:var(--s1)"></i><b>${r[2].toFixed(r[2] < 10 ? 1 : 0)}%</b></span><span class="nh-c"><i style="--w:${(r[3] / mxD * 100).toFixed(1)};background:var(--s2)"></i><b>$${r[3] < 10 ? r[3].toFixed(1) : Math.round(r[3])}B</b><small>spends $${Math.round(r[4])}B</small></span></div>`).join('');
    h.innerHTML = `<div class="nh-head"><span></span><span><b>&#9312; Share of money routes through the firm</b>betweenness, ranked</span><span><b>&#9313; Damage if it cuts AI spending by 30%</b>yearly revenue lost by others</span></div>${rows}<p class="fm-note">Read across: Nvidia and TSMC are the busiest junctions, yet OpenAI, Amazon and Microsoft, which spend the most, do far more damage when they cut.</p>`;
  });

  /* predictors */
  chart('n-predict', h => {
    const panel = (title, sub, rows, mode) => `<div class="np-p"><div class="np-t">${title}</div><div class="np-s">${sub}</div>${rows.map(r => {
      const v = r[1], pos = v >= 0, wv = Math.abs(v) * 50;
      const c = mode === 'c' ? 'var(--s1)' : pos ? 'var(--crit)' : 'var(--good)';
      return `<div class="np-r"><span class="np-l">${esc(r[0])}</span><span class="np-b"><span class="np-ax"></span><i style="left:${pos ? 50 : 50 - wv}%;width:${wv}%;background:${c}"></i><b style="${pos ? (wv > 40 ? 'right:' + (50 - wv + 1) + '%;color:#fff' : 'left:' + (50 + wv + 1) + '%') : 'right:' + (50 + wv + 1) + '%'}">${v > 0 ? '+' : v < 0 ? '&minus;' : ''}${Math.abs(v).toFixed(2)}</b></span></div>`;
    }).join('')}<div class="np-r np-scale"><span></span><span class="np-b"><em style="left:0">&minus;1</em><em style="left:50%;transform:translateX(-50%)">0</em><em style="right:0">+1</em></span></div></div>`;
    h.innerHTML = panel('A. The damage a firm causes when it cuts', '31 firms. +1 means the measure ranks firms in exactly the order of the damage they cause.', NP.pred.caused, 'c')
      + panel('B. The share of revenue a firm loses in its worst case', '44 firms. Red: firms high on the measure lose more. Green: they lose less.', NP.pred.victim, 'v');
  });

  /* fragile */
  chart('n-fragile', h => {
    const col = (title, sub, rows, meta) => `<div class="nf-col"><div class="nf-h"><b>${title}</b>${sub}</div>${rows.map(r => `<div class="nf-row"><span class="nf-n">${esc(r[0])}<small>${meta(r)}</small></span><span class="nf-c"><i style="--w:${(r[2] * 100).toFixed(1)};background:${r[3] ? 'var(--crit)' : 'var(--s1)'}"></i><b>${Math.round(r[2] * 100)}%</b></span><span class="nf-k${r[3] ? ' on' : ''}">${r[3] ? 'breaks in ' + r[3] + (r[3] === 1 ? ' test' : ' tests') : 'never breaks'}</span></div>`).join('')}</div>`;
    const nb = a => a.filter(r => r[3]).length;
    h.innerHTML = `<div class="nf-wrap">${col('Most central', 'top 8 by PageRank', NP.cent, r => 'PageRank #' + r[1])}${col('Most dependent on one buyer', 'top 8 by buyer concentration', NP.conc, r => 'buyer conc. ' + r[1].toFixed(2))}</div><div class="nf-sum"><span><b>${nb(NP.cent)} of ${NP.cent.length}</b> central firms ever break</span><span><b>${nb(NP.conc)} of ${NP.conc.length}</b> dependent firms break</span></div><p class="fm-note">Bars: largest share of AI revenue lost in any test, on a scale of 0% to 100%. Red bars mark firms that break in at least one test.</p>`;
  });
  /* financing feedback */
  chart('n-feedback', h => {
    const mx = Math.max(...NP.fbbars.map(r => Math.max(r[1], r[2])));
    const F = x => '$' + (x >= 100 ? x.toFixed(0) : x.toFixed(1)) + 'B';
    const brk = n => n ? ' · ' + n + ' break' + (n > 1 ? 's' : '') : '';
    h.innerHTML = `<div class="legend" style="margin:0 0 10px"><span><i style="background:var(--axis)"></i>Payments only</span><span><i style="background:var(--s2)"></i>With financing feedback</span></div>` + NP.fbbars.map(r => {
      const pct = r[1] > 0.05 ? ' (+' + (100 * (r[2] / r[1] - 1)).toFixed(0) + '%)' : '';
      return `<div class="fb-row"><span class="fb-n">${esc(r[0])}</span><span class="fb-c"><span class="fb-b"><span class="fb-t"><i style="width:${(r[1] / mx * 100).toFixed(2)}%;background:var(--axis)"></i></span><b>${r[1] > 0.05 ? F(r[1]) : '$0'}${brk(r[3])}</b></span><span class="fb-b"><span class="fb-t"><i style="width:${(r[2] / mx * 100).toFixed(2)}%;background:var(--s2)"></i></span><b>${F(r[2])}${brk(r[4])}${pct}</b></span></span></div>`;
    }).join('') + `<p class="small" style="margin:6px 0 0">Bars share one scale. Percentages compare the two unrounded totals.</p>`;
  });
})();

/*/NETPART*/
