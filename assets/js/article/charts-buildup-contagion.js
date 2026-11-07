/* ===== v3 additions: build-up, network, contagion, psychology, policy ===== */
(function () {
  const D = D3, N = D.nodes, E = (typeof E3 !== 'undefined') ? E3 : {};
  const { nm, col, grp, GCOL, GNAME, B, P, wrapLines, legendG } = window.V3H;
  const LK = (u, t) => `<a href="${u}" target="_blank" rel="noopener">${esc(t)}</a>`;
  const pill = k => ({ ok: '<span class="pill v-ok">Supported</span>', part: '<span class="pill v-part">Partly supported</span>', no: '<span class="pill v-no">Not supported</span>' })[k];
  const nmx = t => t === 'LEND' ? 'Lenders' : nm(t);
  const T1 = (v) => v >= 1000 ? '$' + (v / 1000).toFixed(v >= 10000 ? 1 : 2) + 'T' : B(v);

  /* ---------- Part 1: build-up ---------- */
  chart('n-buildup', h => {
    const b = E.build; if (!b) return;
    h.innerHTML = `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:18px"><div style="min-width:0"><h4>Deal amounts by year ($B)</h4><div id="bu-a"></div></div><div style="min-width:0"><h4>Capex of the four largest, per quarter ($B)</h4><div id="bu-b"></div></div><div style="min-width:0"><h4>CoreWeave debt ($B)</h4><div id="bu-c"></div></div></div>`;
    const yrs = ['2023', '2024', '2025', '2026'];
    gcols(document.getElementById('bu-a'), { cats: yrs.map(y => y + '|' + b.deals[y].n + (b.deals[y].n === 1 ? ' leg' : ' legs')), h: 250, aria: 'deal amounts by year',
      series: [{ name: 'binding', c: 'var(--s1)', vals: yrs.map(y => Math.round(b.deals[y].binding)), fmt: v => v >= 1000 ? (v / 1000).toFixed(1) + 'T' : v },
               { name: 'non-binding', c: 'var(--s2)', vals: yrs.map(y => Math.round(b.deals[y].nonbinding)), fmt: v => v >= 1000 ? (v / 1000).toFixed(1) + 'T' : (v || '') }] });
    gcols(document.getElementById('bu-b'), { cats: b.capex_q.map(x => x[0]), h: 250, aria: 'quarterly capex',
      series: [{ name: 'capex', c: 'var(--s1)', vals: b.capex_q.map(x => Math.round(x[1])) }] });
    gcols(document.getElementById('bu-c'), { cats: b.crwv_debt.map(x => x[0].replace(' incl. leases', '|incl. leases')), h: 250, aria: 'CoreWeave debt',
      series: [{ name: 'debt', c: 'var(--s4)', vals: b.crwv_debt.map(x => x[1]) }] });
  });

  /* ---------- Part 2: firm network ---------- */
  const LORD = ['Other', 'Lab', 'Hyperscaler', 'Neocloud', 'Landlord', 'Chips', 'Memory', 'Foundry & tools', 'Systems', 'Power', 'Software', 'Devices', 'Finance', 'Lenders'];
  const KSTY = { pay: { c: 'var(--s1)', d: '', n: 'payments ($1B a year or more)' }, equity: { c: 'var(--s2)', d: '6 4', n: 'equity stakes' }, support: { c: 'var(--s3)', d: '2 3', n: 'guarantees and backstops' }, loan: { c: 'var(--s4)', d: '1 3', n: 'loans' } };
  let NETK = { pay: true, equity: true, support: true, loan: true }, NETO = '';
  chart('n-network', h => {
    const edges = (E.edges || []).filter(e => e.a !== 'ROW' && e.b !== 'ROW');
    const ids = Object.keys(N).filter(t => t !== 'ROW');
    const layer = t => t === 'LEND' ? 'Lenders' : t === 'USERS' ? 'Other' : N[t].layer;
    ids.sort((a, b) => LORD.indexOf(layer(a)) - LORD.indexOf(layer(b)) || (N[b].A || 0) - (N[a].A || 0));
    const deg = {}; edges.forEach(e => { deg[e.a] = (deg[e.a] || 0) + 1; deg[e.b] = (deg[e.b] || 0) + 1; });
    const ngroups = new Set(ids.map(layer)).size, gapU = 1.6, tot = ids.length + ngroups * gapU;
    const W = 820, H = 820, cx = W / 2, cy = H / 2, R = 285;
    const pos = {}; let u = 0, last = null;
    ids.forEach(t => { if (layer(t) !== last) { u += gapU; last = layer(t); } const a = -Math.PI / 2 + (u / tot) * 2 * Math.PI; pos[t] = { x: cx + R * Math.cos(a), y: cy + R * Math.sin(a), a }; u += 1; });
    const sh = NETO && E.shock[NETO] ? (NETFB && FBNET[NETO] ? FBNET[NETO] : E.shock[NETO]) : null, brk = new Set(sh ? sh.broken : []);
    const impactColor = v => {
      if (v == null || v < 0.001) return '#D8D2C7';
      if (v < 0.05) return '#6E9AA8';
      if (v < 0.15) return '#D2A34A';
      if (v < 0.30) return '#D4773C';
      return '#A83B32';
    };
    const fill = t => {
      if (!sh) return t === 'LEND' ? 'var(--s4)' : col(t);
      if (t === NETO) return '#1A1814';
      return impactColor(sh.share[t]);
    };
    const fop = t => (!sh || t === NETO) ? 1 : 0.96;
    let g = '';
    edges.filter(e => NETK[e.k] && pos[e.a] && pos[e.b]).sort((p, q) => (p.k === 'pay') - (q.k === 'pay')).forEach(e => {
      const A = pos[e.a], Bp = pos[e.b], mx = cx + (A.x + Bp.x - 2 * cx) * 0.18, my = cy + (A.y + Bp.y - 2 * cy) * 0.18;
      const st = KSTY[e.k], wdt = e.k === 'pay' ? Math.max(0.8, Math.min(6, Math.sqrt(e.v) * 0.6)) : 1.6;
      g += `<path class="ne" data-a="${e.a}" data-b="${e.b}" d="M${A.x.toFixed(1)} ${A.y.toFixed(1)}Q${mx.toFixed(1)} ${my.toFixed(1)} ${Bp.x.toFixed(1)} ${Bp.y.toFixed(1)}" fill="none" stroke-width="${wdt.toFixed(1)}" ${st.d ? `stroke-dasharray="${st.d}"` : ''} style="stroke:${st.c};opacity:${e.k === 'pay' ? 0.35 : 0.75}" data-tip="${esc(nmx(e.a) + ' to ' + nmx(e.b) + ': ' + (e.k === 'pay' ? B(e.v) + ' a year' : e.k + (e.v ? ', ' + B(e.v) : '')) + (e.note ? '<br>' + e.note : ''))}"/>`;
    });
    ids.forEach(t => {
      const p = pos[t], r = 4 + Math.sqrt(deg[t] || 0) * 1.6, s = sh && sh.share[t];
      const tip = nmx(t) + '<br>' + (deg[t] || 0) + ' ties' + (N[t].A ? '<br>AI revenue at stake ' + B(N[t].A) : '') + (sh ? '<br>' + (t === NETO ? 'shock origin (cuts 30%)' : 'loses ' + (s ? P(s, 1) : '0%') + ' of AI revenue' + (brk.has(t) ? ', breaks' : '')) : '');
      g += `<circle class="nn" data-t="${t}" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${r.toFixed(1)}" style="fill:${fill(t)};fill-opacity:${fop(t)};stroke:${brk.has(t) ? 'var(--crit)' : 'var(--surf)'};stroke-width:${brk.has(t) ? 4.5 : 1.2}" data-tip="${esc(tip)}"/>`;
      const deg2 = p.a * 180 / Math.PI, left = Math.cos(p.a) < 0, lx = cx + (R + r + 6) * Math.cos(p.a), ly = cy + (R + r + 6) * Math.sin(p.a);
      g += `<text class="nl" data-t="${t}" x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" font-size="11.5" text-anchor="${left ? 'end' : 'start'}" dominant-baseline="middle" transform="rotate(${(left ? deg2 + 180 : deg2).toFixed(1)} ${lx.toFixed(1)} ${ly.toFixed(1)})" style="fill:${sh && brk.has(t) ? 'var(--crit)' : 'var(--ink)'};font-weight:${sh && (brk.has(t) || t === NETO) ? 700 : 400};cursor:default">${esc(nmx(t))}</text>`;
    });
    // layer labels inside the ring
    let lastL = null; ids.forEach((t, i) => { const L = layer(t); if (L === lastL) return; lastL = L; const grpIds = ids.filter(x => layer(x) === L), mid = pos[grpIds[Math.floor(grpIds.length / 2)]];
      const lab = { Other: 'Users', Lab: 'Labs', Hyperscaler: 'Big clouds', Neocloud: 'Neoclouds', Landlord: 'Landlords', 'Foundry & tools': 'Foundry, tools', Lenders: '' }[L]; const txt = lab === undefined ? L : lab; if (!txt) return;
      g += T(cx + (R - 34) * Math.cos(mid.a), cy + (R - 34) * Math.sin(mid.a) + 4, esc(txt), { a: 'middle', s: 11, w: 600, f: 'var(--mut)', halo: 1 }); });
    const kb = Object.entries(KSTY).map(([k, s]) => `<button type="button" aria-pressed="${NETK[k]}" data-k="${k}">${s.n}</button>`).join('');
    const opts = [['', 'Clear'], ['USERS', 'End users'], ['OAI', 'OpenAI'], ['ANTH', 'Anthropic'], ['MSFT', 'Microsoft'], ['AMZN', 'Amazon'], ['GOOGL', 'Alphabet'], ['META', 'Meta'], ['ORCL', 'Oracle'], ['CRWV', 'CoreWeave'], ['NVDA', 'Nvidia']].filter(o => !o[0] || E.shock[o[0]]);
    const ob = opts.map(([k, l]) => `<button type="button" aria-pressed="${NETO === k}" data-o="${k}">${l}</button>`).join('');
    const top = sh ? Object.entries(sh.share).map(([t, s]) => [t, s, s * ((N[t] && N[t].A) || 0)]).sort((a, b) => b[2] - a[2]).slice(0, 5) : [];
    const sum = sh ? `<div class="netres"><div class="netres-h">Result: ${esc(nmx(NETO))} cuts its AI spending by 30%${NETFB ? ', with funding ties' : ', payments only'}</div><div class="tiles"><div class="stat crit"><b>${B(sh.caused)}</b><span>a year of revenue lost by other firms</span></div><div class="stat${sh.broken.length ? ' crit' : ''}"><b>${sh.broken.length}</b><span>${sh.broken.length ? (sh.broken.length === 1 ? 'firm breaks: ' : 'firms break: ') + sh.broken.map(nmx).join(', ') : 'firms break'}</span></div><div class="stat"><b>${B(sh.lender || 0)}</b><span>lost by lenders</span></div></div><p class="small" style="margin:0 0 8px">Biggest losers: ${top.map(x => esc(nmx(x[0])) + ' ' + B(x[2]) + ' (' + P(x[1], 0) + ' of its AI revenue)').join('; ')}.</p><div class="impact-legend"><b>Share of AI revenue lost</b><span><i style="background:#D8D2C7"></i>None</span><span><i style="background:#6E9AA8"></i>Under 5%</span><span><i style="background:#D2A34A"></i>5–15%</span><span><i style="background:#D4773C"></i>15–30%</span><span><i style="background:#A83B32"></i>30%+</span><span><i class="break-ring"></i>Thick outline: firm breaks</span></div></div>` : `<div class="netres netres-empty">No firm picked yet. Pick one above and watch the damage spread through the ring.</div>`;
    h.innerHTML = `<div class="netguide"><b>How to use this chart</b><ol><li>Pick a firm under Step 1. The chart then shows what happens if that firm cuts its AI spending by 30%. Choose <i>Payments only</i> or <i>With funding ties</i> to see the shock with or without funders holding back money.</li><li>Hover over or tap any firm in the ring to see only its ties and its numbers. Tap an empty spot to clear.</li><li>Switch each kind of tie on or off under Step 3. Turn off payments to see the finance that closes the loops.</li></ol></div><p class="netstep"><b>Step 1.</b> Pick a firm to cut its AI spending by 30%:</p><div class="btns" id="neto">${ob}</div><div class="btns" id="netfb" style="margin-top:-2px"><button type="button" data-v="0" aria-pressed="${!NETFB}">Payments only</button><button type="button" data-v="1" aria-pressed="${NETFB}">With funding ties</button></div>${sum}<p class="netstep"><b>Step 2.</b> Hover over or tap a firm in the ring.</p><p class="netstep"><b>Step 3.</b> Show or hide each kind of tie:</p><div class="btns" id="netk">${kb}</div>${widthOf(h) < 620 ? '<p class="small" style="margin:0 0 4px">Scroll sideways to see the whole ring.</p>' : ''}<div class="netscroll" style="overflow-x:auto"><div style="min-width:620px;max-width:820px;margin:0 auto">${svgWrap(W, H, g, 'network of firms').replace('<svg ', '<svg id="netsvg" style="width:100%;height:auto" ')}</div></div>` + '<div class="legend">' + Object.values(KSTY).map(s => `<span><svg width="26" height="10" style="vertical-align:middle;margin-right:5px"><line x1="1" y1="5" x2="25" y2="5" stroke-width="2.4" ${s.d ? `stroke-dasharray="${s.d}"` : ''} style="stroke:${s.c}"/></svg>${s.n}</span>`).join('') + '</div>' + (sh ? '' : legendG(['Labs', 'Clouds', 'Suppliers', 'Outside', 'Finance']));
    { const sc = h.querySelector('.netscroll'); if (sc) sc.scrollLeft = Math.max(0, (sc.scrollWidth - sc.clientWidth) / 2); }
    h.querySelectorAll('#netk button').forEach(x => x.onclick = () => { NETK[x.dataset.k] = !NETK[x.dataset.k]; renderAll(); });
    h.querySelectorAll('#neto button').forEach(x => x.onclick = () => { NETO = x.dataset.o; renderAll(); });
    h.querySelectorAll('#netfb button').forEach(x => x.onclick = () => { NETFB = x.dataset.v === '1'; renderAll(); });
    const svg = h.querySelector('#netsvg'), es = [...svg.querySelectorAll('.ne')], ns = [...svg.querySelectorAll('.nn')], ls = [...svg.querySelectorAll('.nl')];
    const focus = t => { const nb = new Set([t]); es.forEach(e => { const on = e.dataset.a === t || e.dataset.b === t; e.style.visibility = on ? 'visible' : 'hidden'; if (on) { nb.add(e.dataset.a); nb.add(e.dataset.b); } });
      ns.forEach(n => n.style.opacity = nb.has(n.dataset.t) ? 1 : 0.15); ls.forEach(l => { l.style.opacity = nb.has(l.dataset.t) ? 1 : 0.2; l.style.fontWeight = l.dataset.t === t ? 700 : 400; }); };
    const clear = () => { es.forEach(e => e.style.visibility = 'visible'); ns.forEach(n => n.style.opacity = 1); ls.forEach(l => { l.style.opacity = 1; l.style.fontWeight = 400; }); };
    ns.concat(ls).forEach(n => { n.addEventListener('mouseenter', () => focus(n.dataset.t)); n.addEventListener('mouseleave', clear); n.addEventListener('click', ev => { ev.stopPropagation(); focus(n.dataset.t); }); });
    svg.addEventListener('click', clear);
  });

  /* ---------- Part 5: lender recovery and devices ---------- */
  chart('n-recov', h => {
    const r = E.recov; if (!r) return;
    lines(h, { aria: 'lender recovery by GPU age', xlab: 'age of the GPUs when the borrower fails (years)', xname: 'age', xfmt: v => v + 'y', yfmt: v => Math.round(v * 100) + '%', y0: 0, y1: 1.05, rpad: 120,
      series: [{ name: 'amortising loan', c: 'var(--s1)', pts: r.map(x => [x.age, x.amort]) }, { name: 'bullet loan', c: 'var(--crit)', pts: r.map(x => [x.age, x.bullet]) }],
      refs: [{ y: 0.4, label: 'model: 40% recovery', c: 'var(--mut)' }] });
  });
  chart('n-devices', h => {
    const rows = [
      ['Inputs', 'DRAM contract prices', '+90% to 95% in Q1 2026 (TrendForce); Gartner expects +130% for the year', 'Memory is now about 35% of the cost of a PC, up from 15% to 18%', LK('https://www.softwareseni.com/dram-prices-in-2026-have-doubled-and-the-numbers-are-getting-worse/', 'SoftwareSeni')],
      ['Inputs', 'Battery cells (LFP)', 'Chinese quotes near RMB 0.4 per Wh, about 50% above the 2025 low; makers cite AI data-centre storage demand', 'The same pull that raised memory prices now reaches batteries', LK('https://www.energy-storage.news/price-jump-chinese-firms-battery-cell-quotes-approach-0-4-rmb-wh-system-prices-follow-suit/', 'Energy-Storage.News')],
      ['Device maker', 'HP, Q3 FY2026', 'PC units -16%, consumer units -19%; results beat estimates; shares -9.3% after hours', 'Units fall even when revenue holds', LK('https://parameter.io/hp-inc-hpq-stock-plunges-9-despite-beating-earnings-memory-shortages-take-toll/', 'Parameter')],
      ['Device maker', 'Apple, Q4 FY2026', 'Revenue $114.5B, iPhone +17%; gross margin 47.9% guided to 45% to 46%; prices raised; memory pricing called "unprecedented"', 'The strongest device maker absorbs it in margin', LK('https://thenextweb.com/news/apple-earnings-q4-2026-memory-costs-margins', 'The Next Web')],
      ['Chip vendor', 'Qualcomm', 'Android handset chip revenue expected to fall about 20% in FY2026 as memory costs hit phones; shares -5.9% on the warning', 'Consumer orders to the vendor fall', LK('https://www.benzinga.com/trading-ideas/movers/26/07/60791225/rising-memory-costs-are-hurting-smartphones-qualcomm-warns', 'Benzinga')],
      ['Chip vendor', 'AMD, Q3 2026', 'Gaming -40%, client +7%, data centre growing fastest', 'The consumer side shrinks as the AI side grows', LK('https://ir.amd.com/news-events/press-releases/detail/1303/amd-reports-third-quarter-2026-financial-results', 'AMD')],
      ['Chip vendor', 'Intel, Q3 2026', 'Client computing -5%; total revenue +21%', 'Total growth comes from the data centre', LK('https://www.intc.com/news-events/press-releases/detail/1786/intel-reports-third-quarter-2026-financial-results', 'Intel')]
    ];
    h.innerHTML = table(['Step', 'Firm or input', 'Latest', 'What it shows', 'Source'], rows);
  });

  /* ---------- Part 6: policy ---------- */
  chart('n-policytab', h => {
    const rows = [
      ['Pause on data-centre permits and grid connections, Texas', 'Gov. Abbott (R) paused them during an audit; Gov.-elect Hinojosa (D) pledges a halt until new protections pass', 'In force now; Hinojosa takes office 19 January', 'Executive action', 'Builders buy less for new sites (test below); Texas holds 25% to 30% of 2030 capacity; miners\' own sites delayed'],
      ['Construction pause (Georgia), moratorium and end of sales-tax exemption (Wisconsin), project standards (Ohio)', 'Govs.-elect Bottoms, Crowley and Acton (D)', 'Pledged', 'Executive order or state law', 'Same channel; higher cost per site'],
      ['Local restrictions on data centres', 'Voters in about a dozen states', 'Passed in 44 of 45 completed votes', 'Local', 'Site-by-site delays'],
      ['Builders pay the full cost of their power', 'White House pledge signed by Amazon, Oracle, Google, Meta, Microsoft, OpenAI and xAI; Rep. Pallone (D): bills should not rise "by a single cent"', 'Pledge in place; laws proposed', 'Voluntary now; binding needs states or Congress', 'Higher running cost per site, lower margin'],
      ['National moratorium on new data centres', 'Sen. Sanders (I), Rep. Ocasio-Cortez (D), 22 backers; supported by Rep. Pallone (D)', 'Introduced March 2026', '60 Senate votes and a signature; Sen. Fetterman (D) opposes', 'Unlikely before 2029'],
      ['Federal testing of frontier models before release', 'Sen. Cantwell (D) framework; Cantwell and Sen. Rounds (R) on national-lab testing', 'Proposed', 'A bill: 60 votes and a signature', 'Slower releases and compliance cost for the labs'],
      ['Hearings with AI chief executives under oath', 'Rep. Casar (D) and 18 members; Rep. Lieu (D) commission', 'Likely from early 2027', 'House majority only', 'Disclosure of commitments, debt and circular deals; belief channel (Part 7)'],
      ['No bailout for insolvent AI firms or banks exposed to them', 'H.Res. 1642, Reps. Casar and Waters (D), 13 cosponsors; the White House ruled out a backstop in November 2025', 'Introduced 29 October; not binding', 'Binding limits on emergency Fed lending would need a law', 'Lenders bear the full loss (Part 5); no floor under a run (Part 7)'],
      ['Federal override of state AI laws', 'FRONTIER Act, Reps. Obernolte (R) and Trahan (D); many Democrats opposed', 'Contested', 'Law', 'If it fails, state rules stay in force']
    ];
    h.innerHTML = table(['Measure', 'Who', 'Status', 'What it needs', 'How it reaches the map'], rows) + '<p class="small">Sources: CBS News, AP via WSLS, TechTimes (two reports), Broadband Breakfast, WTOP, The American Prospect, Migrant Insider, LawCommentary, Implicator (links in the Method tab). CNBC\'s 5 November report on Democratic data-centre plans and Politico\'s 4 November report could not be read and are not used.</p>';
  });
  chart('n-policy', h => {
    const p = E.policy || [], f = E.policy_fund, r = E.reflex; if (!p.length) return;
    const lab = x => B(x.damage) + (x.broken.length ? ', ' + x.broken.length + ' firms break' : ', no firm breaks') + (x.lender > 0.05 ? ', lenders ' + B(x.lender) : '');
    const rows = p.map(x => { const fp = FBC.policy.find(q => Math.abs(q[0] - x.delay) < 1e-9); return { label: 'Building slows ' + P(x.delay) + ' for a year', bars: [{ v: x.damage, c: 'var(--s3)', lab: lab(x), tip: 'Largest losers: ' + x.top.slice(0, 5).map(q => nm(q[0]) + ' ' + B(q[1])).join(', ') }].concat(fp ? [{ v: fp[1], c: 'var(--s2)', lab: B(fp[1]) + ' with funding ties' + (fp[2].length ? ', ' + fp[2].length + ' break' : ', no firm breaks') }] : []) }; })
      .concat([{ label: 'Funding squeeze alone (Part 7)', bars: [{ v: r.damage, c: 'var(--s4)', lab: lab(r), tip: 'Breaks: ' + r.broken.map(nm).join(', ') }] },
               { label: 'Building slows 20% plus funding squeeze', bars: [{ v: f.damage, c: 'var(--crit)', lab: lab(f), tip: 'Breaks: ' + f.broken.map(nm).join(', ') }] }]);
    hbars(h, rows, { rh: 40, max: 300, aria: 'policy shock damage' });
  });

  /* ---------- Part 7: psychology ---------- */
  chart('n-events', h => {
    const rows = [
      ['27 Jan 2025', 'DeepSeek says it trained a strong model cheaply', 'No firm\'s revenue changed', 'Nvidia lost about $589B of value in one day'],
      ['Early Feb 2026', 'Anthropic launches Claude Cowork for multi-step business work', 'No software firm\'s revenue changed that week', 'About $285B of software value gone in 48 hours'],
      ['26 Aug 2026', 'HP beats estimates; PC units -16% on memory costs', 'Results above expectations', 'HP -9.3% after hours'],
      ['8 Oct 2026', 'OpenAI\'s run rate about $50B, not the $68B widely reported', 'One firm\'s revenue 26.5% below belief', 'CoreWeave -7.8%, Oracle -5.5%, Broadcom -4.3%, Nvidia -2.9% (about $150B)'],
      ['22 Oct 2026', 'Meta: costs +68%, first cash outflow in over a decade; raises low end of capex range', 'More orders for suppliers', 'Meta -7.0%; chip index -6.7%; Intel, AMD, Sandisk and Marvell -8% or more'],
      ['26 Oct 2026', 'Musk post questions the neocloud model', 'Nothing', 'CoreWeave -4.5%, Nebius -3.4% before the open; their bonds at record lows'],
      ['28 to 29 Oct 2026', 'Alphabet: search flat on the quarter, free cash flow negative, AI Mode earns less', 'Search still +12% on the year', 'Alphabet -11% or more'],
      ['Oct to early Nov 2026', 'OpenAI cuts its round from $30B to $20B; Nscale bids about half its target', 'Funding harder to get', 'Neoclouds -26% to -40% in a month'],
      ['5 Nov 2026', 'Democrats win Congress and governorships including Texas; permit pauses expected', 'No contract changed', 'Nasdaq -5.5%, chip index -12.3%, about $2.3T of Nasdaq-100 value gone; Micron -17.5%, AMD -17.3%, Nvidia -9.3%']
    ];
    h.innerHTML = '<div class="event-timeline">' + rows.map((r, i) =>
      `<article class="event-row"><div class="event-date"><span>${r[0]}</span><i>${String(i + 1).padStart(2, '0')}</i></div><div class="event-main"><b>${r[1]}</b><div class="event-columns"><div><small>What changed in the numbers</small><span>${r[2]}</span></div><div class="event-reaction"><small>What the market did</small><span>${r[3]}</span></div></div></div></article>`
    ).join('') + '</div>';
  });
  const moveScatter = (h, data, o) => {
    const pts = data.filter(d => d.profit_share != null).map(d => ({ t: d.t, x: d.profit_share * 100, y: d.move }));
    const w = widthOf(h), H = 330, m = { l: 46, r: 18, t: 18, b: 44 }, xm = o.xmax, ym = o.ymax;
    const X = v => m.l + v / xm * (w - m.l - m.r), Y = v => H - m.b - v / ym * (H - m.t - m.b); let g = '';
    niceTicks(0, ym, 4).forEach(v => { g += `<line x1="${m.l}" x2="${w - m.r}" y1="${Y(v)}" y2="${Y(v)}" style="stroke:var(--grid)"/>` + T(m.l - 6, Y(v) + 4, v + '%', { a: 'end', s: 11, f: 'var(--mut)' }); });
    niceTicks(0, xm, w < 520 ? 4 : 7).forEach(v => { g += T(X(v), H - m.b + 16, v + '%', { a: 'middle', s: 11, f: 'var(--mut)' }); });
    const dm = Math.min(xm, ym); g += `<line x1="${X(0)}" y1="${Y(0)}" x2="${X(dm)}" y2="${Y(dm)}" stroke-dasharray="5 4" style="stroke:var(--mut)"/>` + T(X(dm) - 4, Y(dm) - 6, 'fell by its full stake', { a: 'end', s: 11, f: 'var(--mut)', halo: 1 });
    g += T((m.l + w - m.r) / 2, H - 6, o.xlab, { a: 'middle', s: 11.5 }); g += T(m.l, 11, 'share-price fall that day', { s: 11, f: 'var(--ink2)' });
    const labs = [];
    pts.forEach(p => { g += `<circle cx="${X(p.x).toFixed(1)}" cy="${Y(p.y).toFixed(1)}" r="6" style="fill:${col(p.t)};stroke:var(--surf);stroke-width:1.5" data-tip="${esc(nm(p.t) + '<br>fell ' + p.y.toFixed(1) + '%<br>profit at stake ' + p.x.toFixed(1) + '% of EBITDA')}"/>`; labs.push({ x: X(p.x) + 9, y: Y(p.y) + 4, t: nm(p.t) }); });
    labs.sort((a, b) => a.y - b.y); labs.forEach((l, i) => { labs.slice(0, i).forEach(q => { if (Math.abs(q.x - l.x) < 80 && Math.abs(q.y - l.y) < 12) l.y = q.y + 12; }); g += T(Math.min(l.x, w - 70), l.y, esc(l.t), { s: 11, f: 'var(--ink)', halo: 1 }); });
    h.innerHTML = svgWrap(w, H, g, o.aria) + legendG(['Clouds', 'Suppliers']) + (o.extra || '');
  };
  chart('n-oct8', h => moveScatter(h, E.oct8 || [], { xmax: 35, ymax: 10, xlab: 'profit at stake if OpenAI cut its spending 26.5% for good (share of EBITDA)', aria: '8 October moves against exposure' }));
  chart('n-nov5', h => {
    const d = E.nov5 || [], mu = d.find(x => x.t === 'MU');
    moveScatter(h, d, { xmax: 35, ymax: 20, xlab: 'profit at stake if data-centre building slowed 30% for a year (share of EBITDA)', aria: '5 November moves against exposure',
      extra: '<p class="small" style="margin:6px 0 0">Not plotted: Micron fell ' + (mu ? mu.move.toFixed(1) : '17.5') + '% with about ' + (mu ? P(mu.rev_share) : '14%') + ' of its revenue at stake (no EBITDA in the panel). Firms at 0% have no US building exposure in the map.</p>' });
  });
  chart('n-gordon', h => {
    const r = 0.09, pts = []; for (let k = 0; k <= 80; k++) { const gg = k / 1000; pts.push([gg * 100, Math.min(100, 1 / (r - gg))]); }
    lines(h, { aria: 'multiple against growth', xlab: 'expected long-run growth a year', xname: 'growth', xfmt: v => v.toFixed(0) + '%', yfmt: v => Math.round(v) + 'x', y0: 0, y1: 105, rpad: 20, endlab: false,
      series: [{ name: 'earnings multiple', c: 'var(--s1)', pts }] });
    const svg = h.querySelector('svg'), w = widthOf(h), m = { l: 48, r: 20, t: 18, b: 40 }, H = 280;
    const X = v => m.l + v / 8 * (w - m.l - m.r), Y = v => H - m.b - v / 105 * (H - m.t - m.b);
    let g = ''; [[7, 50, '7%: 50x'], [6, 33.3, '6%: 33x (-33%)'], [5, 25, '5%: 25x (-50%)']].forEach(([x, y, l]) => { g += `<circle cx="${X(x)}" cy="${Y(y)}" r="5" style="fill:var(--crit)"/>` + T(X(x) - 8, Y(y) - 8, l, { a: 'end', s: 11.5, f: 'var(--ink)', halo: 1 }); });
    svg.insertAdjacentHTML('beforeend', g);
  });
  chart('n-contagion', h => {
    const c = E.contagion || []; if (!c.length) return;
    h.innerHTML = '<div id="ct-a"></div><div id="ct-b"></div>';
    gcols(document.getElementById('ct-a'), { cats: c.map(x => nm(x.origin)), h: 260, aria: 'contagion damage', yfmt: v => '$' + v + 'B',
      series: [{ name: 'alone', c: 'var(--mut)', vals: c.map(x => x.alone.damage), fmt: v => '$' + v + 'B' }, { name: 'lenders cut 30%', c: 'var(--warn)', vals: c.map(x => x['phi0.3'].damage), fmt: v => '$' + v + 'B' }, { name: 'lenders cut 60%', c: 'var(--crit)', vals: c.map(x => x['phi0.6'].damage), fmt: v => '$' + v + 'B' }] });
    const br = (x, o) => x.broken.filter(t => t !== o).map(nm).join(', ') || 'none';
    document.getElementById('ct-b').innerHTML = table(['First failure', 'Lenders cut 30%: other firms that break', 'Lenders cut 60%: other firms that break', 'Lender losses: alone / 30% / 60%'],
      c.map(x => [nm(x.origin), br(x['phi0.3'], x.origin), br(x['phi0.6'], x.origin), B(x.alone.lender) + ' / ' + B(x['phi0.3'].lender) + ' / ' + B(x['phi0.6'].lender)]));
  });
  chart('n-runway', h => {
    const r = E.runway || {}; const rows = Object.entries(r).filter(([t, v]) => v.months != null && isFinite(v.months) && v.months < 48).sort((a, b) => a[1].months - b[1].months);
    hbars(h, rows.map(([t, v]) => ({ label: nm(t), bars: [{ v: v.months, c: v.months < 6 ? 'var(--crit)' : v.months < 12 ? 'var(--warn)' : col(t), lab: v.months.toFixed(1) + ' months', tip: nm(t) + ': cash ' + B(v.cash) + ', burn ' + B(v.burn) + ' a year, debt ' + B(v.debt) }] })), { rh: 30, bh: 9, max: 36, aria: 'cash runway' });
  });
  chart('n-mv', h => {
    const m = E.mv; if (!m) return;
    const rows = m.groups.slice().sort((a, b) => b.mcap - a.mcap).map(x => ({ label: x.group + ' (' + x.n + ')', bars: [{ v: x.mcap, c: 'var(--s1)', lab: T1(x.mcap), tip: x.group + ': market value ' + T1(x.mcap) }].concat(x.at_risk ? [{ v: x.at_risk, c: 'var(--crit)', lab: T1(x.at_risk) + ' at a ' + P(x.haircut, 1) + ' fall', tip: x.basis }] : []) }));
    hbars(h, rows, { rh: 30, bh: 10, max: 15000, aria: 'market value at risk', legend: [{ c: 'var(--s1)', n: 'market value' }, { c: 'var(--crit)', n: 'removed by a repeat of the autumn falls' }] });
    h.insertAdjacentHTML('beforeend', `<p class="small" style="margin:6px 0 0">Total ${T1(m.total)}; removed by a repeat ${T1(m.at_risk)}. Seven US mega-caps ${T1(m.us7)}, ${P(m.us7_share)} of the S&amp;P 500.</p>`);
  });

  /* ---------- Part 8: claims ---------- */
  chart('n-claims', h => {
    const rows = [
      ['Risk accumulates in the network', 'part', 'Payments alone have no loops and amplify little; the loops are closed by equity, guarantees and loans; the risk sits in borrowed money in the middle layer (Parts 2 and 4).', 'This series'],
      ['Small order-dependent firms could fail and hit everything', 'part', 'Failure is more likely, not happened: runway of 2 to 8 months at WhiteFiber, Hut 8, CoreWeave and Applied Digital. Alone a small failure does little damage; with lenders pulling back it does $11B to $22B and breaks one to four more (Part 7).', 'This series; ' + LK('https://pluang.com/en/news-feed/coreweave-dan-nebius-turun-9-persen-sentimen-mendekati-ketakutan-ekstrem', 'Pluang')],
      ['Oracle lost a $7B Tencent lease under US pressure', 'ok', 'Confirmed by several outlets. That Oracle then held idle chips is not confirmed.', LK('https://finance.yahoo.com/technology/ai/articles/oracle-cancels-7-billion-tencent-113659321.html', 'Yahoo Finance')],
      ['Microsoft had GPUs sitting idle because it could not plug them in', 'part', 'Nadella’s statement describes purchased chips awaiting power and completed data-centre capacity. It does not prove deliberate hoarding or permanent stranding.', LK('https://www.techzine.eu/news/infrastructure/135966/satya-nadella-power-shortage-not-gpu-inventory-is-the-problem', 'Techzine')],
      ['Banks lend against fast-depreciating GPUs', 'ok', 'GPU-backed debt exists; a bullet lender recovers 59% if the borrower fails after two years (Part 5).', LK('https://www.techtimes.com/articles/328723/20261007/spacex-bond-deal-30-year-maturities-nvidia-chip-collateral-worth-fraction-mid-decade.htm', 'Tech Times')],
      ['Chip, RAM and battery prices raise device prices and cut device demand and vendor orders', 'part', 'Holds for consumer lines: HP units -16%, Qualcomm Android about -20%, AMD gaming -40%, Intel client -5%; LFP cells about +50%. Vendors\' total revenue still rises on AI (Part 5).', LK('https://parameter.io/hp-inc-hpq-stock-plunges-9-despite-beating-earnings-memory-shortages-take-toll/', 'Parameter') + ' ' + LK('https://www.energy-storage.news/price-jump-chinese-firms-battery-cell-quotes-approach-0-4-rmb-wh-system-prices-follow-suit/', 'Energy-Storage.News')],
      ['Intel revenue down 5% a year', 'part', 'Client computing fell 5%. Total revenue rose 21%.', LK('https://www.intc.com/news-events/press-releases/detail/1786/intel-reports-third-quarter-2026-financial-results', 'Intel')],
      ['Sandisk hurt despite good numbers', 'part', 'Record quarter confirmed; Sandisk fell 8% or more on 22 October with the chip sell-off and short funds gained in November.', LK('https://www.thedailyupside.com/technology/semiconductors/sandisk-completes-its-best-quarter-in-history/', 'The Daily Upside') + ' ' + LK('https://www.benzinga.com/etfs/specialty-etfs/26/11/62937412/sandisk-bears-hit-jackpot-short-etf-rockets-35-bullish-funds-bite-the-dust', 'Benzinga')],
      ['Meta, Google and Amazon free cash flow down, OpEx above revenue', 'part', 'Meta\'s cash flow turned negative for the first time in over a decade and its operating margin halved to 20%. Alphabet\'s Q3 free cash flow was negative. All three remain profitable, so costs are not above revenue.', LK('https://www.heygotrade.com/en/news/meta-meta-stock-news-october-23-2026/', 'Gotrade') + ' ' + LK('https://www.tekedia.com/alphabet-shares-slide-10-as-ai-spending-drains-cash-and-google-search-misses-estimates/', 'Tekedia')],
      ['Inflation up and the Fed raising rates', 'ok', 'Corrected from earlier versions. The Fed raised rates on 16 September; CPI was 3.7% in September; two members voted for another rise in October.', LK('https://www.scotsmanguide.com/news/federal-reserve-hikes-interest-rates-finally-putting-its-foot-down-on-inflation/', 'Scotsman Guide') + ' ' + LK('https://admiralmarkets.com/analytics/traders-blog/fed-rate-decision-october-2026', 'Admiral Markets')],
      ['Google and Reddit hurt by chatbots', 'part', 'Google search +12% on the year but flat on the quarter; its finance chief said AI Mode earns less. Reddit fell 12.6% after Q3, but its chief executive says chatbots are not a traffic driver.', LK('https://www.relevantaudience.com/google-ads-en/alphabet-q3-2026-search-revenue-ai-mode-monetization/', 'Relevant Audience') + ' ' + LK('https://stockstory.org/us/stocks/nyse/rddt/news/earnings/reddit-nyserddt-surprises-with-q3-2026-sales-but-stock-drops-126percent', 'StockStory')],
      ['OpenAI and Anthropic at near-trillion valuations; usage may slow', 'part', 'Valuations confirmed ($852B, about $965B). No usage data is public. PwC: 56% of CEOs report no significant financial return from AI so far.', LK('https://www.webpronews.com/pwc-survey-56-of-firms-report-no-roi-from-ai-investments/', 'WebProNews') + ' ' + LK('https://www.cnbc.com/2026/03/31/openai-funding-round-ipo.html', 'CNBC')],
      ["Microsoft's 60,000 voluntary buyout offer", 'part', 'A voluntary buyout offer, not layoffs or a share buyback; about 5% of a quarter\'s capex at plausible take-up (below).', LK('https://www.hawaiinewsnow.com/2026/10/26/microsoft-offers-60000-employees-voluntary-buyouts-ai-spending-accelerates/', 'Hawaii News Now')],
      ['Small expectation misses cause outsized sell-offs', 'ok', 'On 8 October exposed firms priced a fifth to a third of their stake, but lightly exposed ones more than all of it; on 22 October suppliers fell on news that raised their orders (Part 7).', 'This series'],
      ['The 5 November crash came from expected AI policy changes after the Democratic win', 'part', 'Reports tie the fall to fears of slower data-centre building; profit-taking, retail selling and weak chip results also played a part, so the policy share cannot be isolated.', LK('https://finance.yahoo.com/markets/live/stock-market-today-thursday-november-5-dow-sp-500-nasdaq-plunge-chip-stocks-melt-down-193726491.html', 'Yahoo Finance') + ' ' + LK('https://www.stocktitan.net/articles/stock-market-today-live-november-5-2026', 'StockTitan')],
      ['Democrats are pushing against AI and will regulate it', 'part', 'They are pushing on data centres, power costs, model testing and oversight, not against AI as such. They are also split (Fetterman). Federal law needs 60 Senate votes and a signature; state pauses and hearings need neither (Part 6).', LK('https://www.techtimes.com/articles/330158/20261106/democrats-win-senate-lack-60-votes-ai-regulation-cantwell-pushes-federal-model-testing.htm', 'TechTimes') + ' ' + LK('https://www.cbsnews.com/news/midterm-election-results-data-center-buildout-artificial-intelligence-texas/', 'CBS News')],
      ['No bailout if AI firms default', 'ok', 'Stated position: H.Res. 1642 (not binding) and the White House in 2025. Binding limits on Fed emergency lending are now a live question.', LK('https://prospect.org/2026/10/28/house-progressives-ai-bailout-anthropic-google/', 'American Prospect') + ' ' + LK('https://www.implicator.ai/openai-walks-back-federal-backstop-talk-after-white-house-rebuke.md', 'Implicator')],
      ['Labs\' own warnings about AI risk make regulation more likely', 'part', 'Anthropic backed California\'s SB 53 and lawmakers cite test-environment escapes; whether that becomes federal law depends on votes that are not there yet.', LK('https://www.anthropic.com/news/anthropic-is-endorsing-sb-53', 'Anthropic') + ' ' + LK('https://www.techtimes.com/articles/330158/20261106/democrats-win-senate-lack-60-votes-ai-regulation-cantwell-pushes-federal-model-testing.htm', 'TechTimes')]
    ];
    h.innerHTML = table(['Claim', 'Verdict', 'What the evidence says', 'Sources'], rows.map(r => [esc(r[0]), pill(r[1]), esc(r[2]), r[3]]));
  });
})();

