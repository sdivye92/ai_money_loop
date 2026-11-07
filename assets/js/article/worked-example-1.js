(function () {
  const NODES = {
    L: { x: 20, y: 128, w: 102, h: 54, n: 'Lab', c: 'var(--s2)' },
    C: { x: 200, y: 50, w: 122, h: 54, n: 'Big cloud', c: 'var(--s1)' },
    N: { x: 200, y: 204, w: 122, h: 54, n: 'Neocloud', c: 'var(--s1)' },
    M: { x: 400, y: 22, w: 122, h: 46, n: 'Memory maker', c: 'var(--s3)' },
    K: { x: 392, y: 128, w: 150, h: 54, n: 'Chip maker', c: 'var(--s3)' },
    F: { x: 618, y: 130, w: 92, h: 50, n: 'Foundry', c: 'var(--s3)' },
    D: { x: 205, y: 292, w: 112, h: 28, n: 'Lenders', c: 'var(--axis)' }
  };
  const EDGES = [
    { id: 'LC', d: 'M122 140 L198 88', lx: 96, ly: 100, base: 'pays $60B' },
    { id: 'LN', d: 'M122 170 L198 222', lx: 70, ly: 214, base: 'pays $40B' },
    { id: 'CM', d: 'M322 72 L398 50', lx: 300, ly: 40, base: 'pays $50B' },
    { id: 'CK', d: 'M322 92 L390 138', lx: 262, ly: 122, base: 'pays $100B', mid: 1 },
    { id: 'NK', d: 'M322 222 L390 174', lx: 332, ly: 246, base: 'pays $30B' },
    { id: 'KF', d: 'M542 156 L616 156', lx: 548, ly: 200, base: 'pays $80B' },
    { id: 'ND', d: 'M262 258 L262 290', lx: 330, ly: 310, base: 'owes $20B', dash: 1 }
  ];
  // states[breakOn][round]
  const S = {
    true: [
      { lab: ['Before', 'the shock'], total: 0, lend: 0, edges: {}, nodes: { L: 'spends $100B', C: 'earns $200B', N: 'earns $50B', K: 'earns $400B', M: '', F: '' },
        text: 'Before the shock, money flows from left to right. The lab pays the cloud and the neocloud. They pay the chip and memory makers. The chip maker pays the foundry. The neocloud also owes its lenders $20B.' },
      { lab: ['Round 1', 'of 3'], total: 30, lend: 0, edges: { LC: '−$18B', LN: '−$12B' }, nodes: { L: 'cuts 30%', C: 'loses $18B (9%)', N: 'loses $12B (24%)', K: 'earns $400B' }, hot: ['L', 'C', 'N'], broken: ['N'],
        text: '<b>Round 1.</b> The lab cuts its spending by 30%. The cloud loses $18B, which is 9% of its $200B. The neocloud loses $12B, which is 24% of its $50B. That is past its 20% break line, so the neocloud breaks.' },
      { lab: ['Round 2', 'of 3'], total: 73.5, lend: 12, edges: { LC: '−$18B', LN: '−$12B', CM: '−$4.5B', CK: '−$9B', NK: '−$30B (all)', ND: '−$12B' }, nodes: { L: 'cuts 30%', C: 'cuts 9%', N: 'stops buying', K: 'loses $39B', M: 'loses $4.5B' }, hot: ['C', 'N', 'K', 'M', 'D'], broken: ['N'],
        text: '<b>Round 2.</b> The cloud cuts its own spending by 9%. The chip maker loses $9B and the memory maker $4.5B. The broken neocloud stops buying altogether, so the chip maker also loses all $30B of its orders. The neocloud defaults and its lenders lose 60% of its $20B debt.' },
      { lab: ['Round 3', 'of 3'], total: 81.3, lend: 12, edges: { LC: '−$18B', LN: '−$12B', CM: '−$4.5B', CK: '−$9B', NK: '−$30B (all)', ND: '−$12B', KF: '−$7.8B' }, nodes: { L: 'cuts 30%', C: 'cuts 9%', N: 'stops buying', K: 'cuts 9.75%', M: 'loses $4.5B', F: 'loses $7.8B' }, hot: ['K', 'F'], broken: ['N'],
        text: '<b>Round 3.</b> The chip maker has lost $39B, which is 9.75% of its $400B. It cuts its own spending by 9.75%, so the foundry loses $7.8B. Nothing else changes, so the rounds stop. A $30B first hit has grown to $81.3B a year, plus $12B lost by lenders.' }
    ],
    false: [
      null,
      { lab: ['Round 1', 'of 3'], total: 30, lend: 0, edges: { LC: '−$18B', LN: '−$12B' }, nodes: { L: 'cuts 30%', C: 'loses $18B (9%)', N: 'loses $12B (24%)', K: 'earns $400B' }, hot: ['L', 'C', 'N'],
        text: '<b>Round 1.</b> The lab cuts its spending by 30%. The cloud loses $18B, 9% of its revenue. The neocloud loses $12B, 24% of its revenue. With the break line switched off, the neocloud does not break.' },
      { lab: ['Round 2', 'of 3'], total: 50.7, lend: 0, edges: { LC: '−$18B', LN: '−$12B', CM: '−$4.5B', CK: '−$9B', NK: '−$7.2B' }, nodes: { L: 'cuts 30%', C: 'cuts 9%', N: 'cuts 24%', K: 'loses $16.2B', M: 'loses $4.5B' }, hot: ['C', 'N', 'K', 'M'],
        text: '<b>Round 2.</b> The cloud cuts its spending by 9%. The neocloud cuts by 24% instead of stopping. The chip maker loses $9B from the cloud and only $7.2B from the neocloud. The memory maker loses $4.5B. Lenders lose nothing.' },
      { lab: ['Round 3', 'of 3'], total: 53.9, lend: 0, edges: { LC: '−$18B', LN: '−$12B', CM: '−$4.5B', CK: '−$9B', NK: '−$7.2B', KF: '−$3.2B' }, nodes: { L: 'cuts 30%', C: 'cuts 9%', N: 'cuts 24%', K: 'cuts 4.05%', M: 'loses $4.5B', F: 'loses $3.2B' }, hot: ['K', 'F'],
        text: '<b>Round 3.</b> The chip maker has lost $16.2B, which is 4.05% of its revenue. It cuts its spending by 4.05%, so the foundry loses $3.2B. The total settles near $54B. Switch the break line back on to see it reach $81.3B: one break line adds about $27B.' }
    ]
  };
  let r = 0, brk = true;
  const svg = document.getElementById('wx-svg');
  const fmt = v => '$' + (v % 1 ? v.toFixed(1) : v) + 'B';
  function draw() {
    const st = (S[brk][r] || S.true[0]);
    const broken = new Set(st.broken || []), hot = new Set(st.hot || []);
    let g = '<defs><marker id="wx-a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--axis)"/></marker><marker id="wx-a2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--crit)"/></marker></defs>';
    EDGES.forEach(e => {
      const on = st.edges[e.id];
      if (e.id === 'ND' && !on && r > 0) return;
      g += `<path d="${e.d}" fill="none" stroke="${on ? 'var(--crit)' : 'var(--axis)'}" stroke-width="${on ? 2.6 : 1.6}" ${e.dash ? 'stroke-dasharray="4 3"' : ''} marker-end="url(#${on ? 'wx-a2' : 'wx-a1'})"/>`;
      g += `<text x="${e.lx}" y="${e.ly}" font-size="11.5" ${e.mid ? 'text-anchor="middle"' : ''} fill="${on ? 'var(--crit)' : 'var(--mut)'}" font-weight="${on ? 700 : 400}">${on || e.base}</text>`;
    });
    Object.entries(NODES).forEach(([k, n]) => {
      const b = broken.has(k), h = hot.has(k), sub = (st.nodes || {})[k] || '';
      const stroke = b ? 'var(--crit)' : n.c, sw = b ? 3 : h ? 2.4 : 1.4;
      g += `<rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="7" fill="var(--surf)" stroke="${stroke}" stroke-width="${sw}" ${k === 'D' ? 'stroke-dasharray="4 3"' : ''} style="${h ? '' : 'opacity:.92'}"/>`;
      const cx = n.x + n.w / 2;
      g += `<text x="${cx}" y="${n.y + (sub ? (k === 'D' ? 19 : 23) : n.h / 2 + 4)}" text-anchor="middle" font-size="12.5" font-weight="700" fill="${b ? 'var(--crit)' : 'var(--ink)'}">${n.n}${b ? ' (breaks)' : ''}</text>`;
      if (sub && k !== 'D') g += `<text x="${cx}" y="${n.y + 40}" text-anchor="middle" font-size="11" fill="${h ? 'var(--crit)' : 'var(--ink2)'}" font-weight="${h ? 700 : 400}">${sub}</text>`;
    });
    svg.innerHTML = g;
    document.getElementById('wx-round').textContent = st.lab[0];
    document.getElementById('wx-roundlab').textContent = st.lab[1];
    document.getElementById('wx-total').textContent = fmt(st.total);
    document.getElementById('wx-lend').textContent = fmt(st.lend);
    document.getElementById('wx-text').innerHTML = st.text;
    document.getElementById('wx-back').disabled = r === 0;
    const nx = document.getElementById('wx-next'); nx.disabled = r === 3; nx.textContent = r === 0 ? 'Start the shock →' : r === 3 ? 'Done' : 'Next round →';
  }
  document.getElementById('wx-next').onclick = () => { if (r < 3) { r++; draw(); } };
  document.getElementById('wx-back').onclick = () => { if (r > 0) { r--; draw(); } };
  document.getElementById('wx-reset').onclick = () => { r = 0; draw(); };
  document.getElementById('wx-brk').onchange = e => { brk = e.target.checked; draw(); };
  draw();
})();
