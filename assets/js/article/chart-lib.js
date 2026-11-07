/* ===== article chart library ===== */
const $ = (s, r) => (r || document).querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fB = (x, d) => (x < 0 ? '-' : '') + '$' + Math.abs(x).toFixed(d === undefined ? 1 : d) + 'B';
const pc = (x, d) => (x * 100).toFixed(d === undefined ? 1 : d) + '%';
const f2 = (x, d) => x.toFixed(d === undefined ? 2 : d);
const REG = [];
function chart(id, fn) { REG.push([id, fn]); }
function widthOf(h) { return Math.max(300, Math.floor(h.clientWidth || 640)); }
function renderAll(all) {
  REG.forEach(([id, fn]) => { const h = document.getElementById(id); if (h && (all || !h.closest('[hidden]'))) { try { fn(h); } catch (e) { h.textContent = 'chart failed: ' + e.message; console.error(id, e); } } });
}
let _rt; window.addEventListener('resize', () => { clearTimeout(_rt); _rt = setTimeout(renderAll, 160); });
/* tooltip */
(function () {
  const t = document.createElement('div'); t.className = 'tip'; t.id = 'tip'; document.body.appendChild(t);
  const show = e => {
    const el = e.target.closest && e.target.closest('[data-tip]');
    if (!el) { t.style.display = 'none'; return; }
    t.innerHTML = el.getAttribute('data-tip'); t.style.display = 'block';
    const w = t.offsetWidth; t.style.left = Math.max(8, Math.min(innerWidth - w - 8, e.clientX + 14)) + 'px'; t.style.top = Math.min(innerHeight - t.offsetHeight - 8, e.clientY + 14) + 'px';
  };
  document.addEventListener('pointermove', show); document.addEventListener('pointerdown', show);
  document.addEventListener('pointerleave', () => { t.style.display = 'none'; });
})();
const T = (x, y, s, o) => { o = o || {}; return `<text x="${(+x).toFixed(1)}" y="${(+y).toFixed(1)}" text-anchor="${o.a || 'start'}" font-size="${o.s || 12}" ${o.w ? `font-weight="${o.w}"` : ''} ${o.m ? 'font-family="IBM Plex Mono,monospace"' : ''} style="fill:${o.f || 'var(--ink2)'}${o.halo ? ';stroke:var(--surf);stroke-width:3px;paint-order:stroke' : ''}">${s}</text>`; };
const svgWrap = (w, h, inner, aria) => `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(aria || 'chart')}">${inner}</svg>`;
function legend(items) { return `<div class="legend">${items.map(i => `<span><i style="background:${i.c}"></i>${i.n}</span>`).join('')}</div>`; }
function niceTicks(lo, hi, n) {
  n = n || 5; const span = hi - lo || 1, s0 = span / n, mag = Math.pow(10, Math.floor(Math.log10(s0))), r = s0 / mag;
  const step = (r < 1.5 ? 1 : r < 3 ? 2 : r < 7 ? 5 : 10) * mag, a = Math.ceil(lo / step - 1e-9) * step, t = [];
  for (let v = a; v <= hi + 1e-9; v += step) t.push(+v.toFixed(10));
  return t;
}
const SC = ['var(--s1)', 'var(--s2)', 'var(--s3)'];

/* Horizontal bars. rows: [{label, bars:[{v,c,tip,lab}], note}] */
function hbars(host, rows, o) {
  o = o || {}; const w = widthOf(host), rh = o.rh || 40, pad = { l: 4, r: 70 }, bh = o.bh || 11;
  const max = o.max || Math.max(...rows.flatMap(r => r.bars.map(b => b.v))) * 1.0;
  const bw = w - pad.l - pad.r; let g = '', y = 0;
  rows.forEach(r => {
    g += T(pad.l, y + 13, esc(r.label), { s: 12.5, f: 'var(--ink)' });
    if (r.note) g += T(w - 2, y + 13, esc(r.note), { a: 'end', s: 11, f: 'var(--mut)', m: 1 });
    r.bars.forEach((b, k) => {
      const len = Math.max(1.5, b.v / max * bw), by = y + 19 + k * (bh + 3);
      g += `<rect x="${pad.l}" y="${by}" width="${len.toFixed(1)}" height="${bh}" rx="2" data-tip="${esc(b.tip || r.label + ': ' + (o.fmt ? o.fmt(b.v) : b.v))}" style="fill:${b.c || 'var(--s1)'}"/>`;
      g += T(pad.l + len + 5, by + bh - 1, esc(b.lab || (o.fmt ? o.fmt(b.v) : b.v)), { s: 11, m: 1, f: 'var(--ink)' });
    });
    y += rh + (r.bars.length - 1) * (bh + 3);
  });
  host.innerHTML = svgWrap(w, y + 4, g, o.aria) + (o.legend ? legend(o.legend) : '');
}
/* Grouped columns. cats:[..] series:[{name,c,vals,fmt}] */
function gcols(host, o) {
  const w = widthOf(host), h = o.h || 260, m = { l: 40, r: 10, t: 22, b: 46 }, n = o.cats.length, ns = o.series.length;
  const max = o.max || Math.max(...o.series.flatMap(s => s.vals)) * 1.12, Y = v => h - m.b - v / max * (h - m.t - m.b);
  const gw = (w - m.l - m.r) / n, bw = Math.min(34, gw * 0.8 / ns); let g = '';
  niceTicks(0, max, 4).forEach(v => { g += `<line x1="${m.l}" x2="${w - m.r}" y1="${Y(v)}" y2="${Y(v)}" style="stroke:var(--grid)"/>` + T(m.l - 5, Y(v) + 4, (o.yfmt || (x => x))(v), { a: 'end', s: 11, f: 'var(--mut)' }); });
  o.cats.forEach((c, i) => {
    const cx = m.l + gw * (i + 0.5), x0 = cx - bw * ns / 2;
    o.series.forEach((s, k) => {
      const v = s.vals[i]; if (v === null || v === undefined) return;
      g += `<rect x="${(x0 + k * bw + 1).toFixed(1)}" y="${Y(v).toFixed(1)}" width="${(bw - 2).toFixed(1)}" height="${(h - m.b - Y(v)).toFixed(1)}" rx="2" data-tip="${esc(c + ' / ' + s.name + ': ' + (s.fmt || (x => x))(v))}" style="fill:${s.c}"/>`;
      g += T(x0 + k * bw + bw / 2, Y(v) - 4, (s.fmt || (x => x))(v), { a: 'middle', s: 10.5, m: 1, f: 'var(--ink)' });
    });
    const parts = String(c).split('|'); parts.forEach((p, j) => { g += T(cx, h - m.b + 15 + j * 13, esc(p), { a: 'middle', s: 11.5, f: 'var(--ink2)' }); });
  });
  g += `<line x1="${m.l}" x2="${w - m.r}" y1="${h - m.b}" y2="${h - m.b}" style="stroke:var(--axis)"/>`;
  host.innerHTML = svgWrap(w, h, g, o.aria) + (ns > 1 ? legend(o.series.map(s => ({ c: s.c, n: s.name }))) : '');
}
/* Line chart. o:{series:[{name,c,pts,dash}],xrefs:[{x,label,c}],refs:[{y,label,c}],mark:{x,y,label},xfmt,yfmt,xlab,ylab,x0,x1,y0,y1,h} */
function lines(host, o) {
  const w = widthOf(host), h = o.h || 280, m = { l: 48, r: o.rpad === undefined ? Math.min(110, w * 0.2) : o.rpad, t: 18, b: 40 };
  const xs = [], ys = []; o.series.forEach(s => s.pts.forEach(p => { xs.push(p[0]); ys.push(p[1]); })); (o.refs || []).forEach(r => ys.push(r.y));
  const x0 = o.x0 !== undefined ? o.x0 : Math.min(...xs), x1 = o.x1 !== undefined ? o.x1 : Math.max(...xs), y0 = o.y0 !== undefined ? o.y0 : Math.min(0, ...ys), y1 = o.y1 !== undefined ? o.y1 : Math.max(...ys) * 1.08;
  const X = v => m.l + (v - x0) / (x1 - x0 || 1) * (w - m.l - m.r), Y = v => h - m.b - (v - y0) / (y1 - y0 || 1) * (h - m.t - m.b);
  const yf = o.yfmt || (v => v), xf = o.xfmt || (v => v); let g = '';
  niceTicks(y0, y1, 5).forEach(v => { g += `<line x1="${m.l}" x2="${w - m.r}" y1="${Y(v)}" y2="${Y(v)}" style="stroke:var(--grid)"/>` + T(m.l - 6, Y(v) + 4, yf(v), { a: 'end', s: 11, f: 'var(--mut)' }); });
  niceTicks(x0, x1, w < 520 ? 4 : 7).forEach(v => { g += T(X(v), h - m.b + 16, xf(v), { a: 'middle', s: 11, f: 'var(--mut)' }); });
  g += `<line x1="${m.l}" x2="${w - m.r}" y1="${Y(Math.max(y0, 0))}" y2="${Y(Math.max(y0, 0))}" style="stroke:var(--axis)"/>`;
  if (o.xlab) g += T((m.l + w - m.r) / 2, h - 4, o.xlab, { a: 'middle', s: 11.5 });
  const labs = [];
  (o.refs || []).forEach(r => { g += `<line x1="${m.l}" x2="${w - m.r}" y1="${Y(r.y)}" y2="${Y(r.y)}" stroke-dasharray="5 4" style="stroke:${r.c || 'var(--crit)'}"/>`; labs.push({ y: Y(r.y), t: r.label, c: r.c }); });
  (o.xrefs || []).forEach(r => { g += `<line x1="${X(r.x)}" x2="${X(r.x)}" y1="${m.t}" y2="${h - m.b}" stroke-dasharray="5 4" style="stroke:${r.c || 'var(--crit)'}"/>` + T(X(r.x) + 4, m.t + 10, esc(r.label), { s: 11, f: 'var(--ink2)', halo: 1 }); });
  o.series.forEach((s, i) => {
    const c = s.c || SC[i % 3];
    g += `<path d="${s.pts.map((p, j) => (j ? 'L' : 'M') + X(p[0]).toFixed(1) + ' ' + Y(p[1]).toFixed(1)).join('')}" fill="none" stroke-width="2.2" stroke-linejoin="round" ${s.dash ? 'stroke-dasharray="6 4"' : ''} style="stroke:${c}"/>`;
    if (o.dots !== false && s.pts.length <= 60) s.pts.forEach(p => { g += `<circle cx="${X(p[0]).toFixed(1)}" cy="${Y(p[1]).toFixed(1)}" r="7" fill="transparent" data-tip="${esc(s.name + '<br>' + (o.xname || 'x') + ' ' + xf(p[0]) + '<br>' + yf(p[1]))}"/>`; });
    if (o.endlab !== false) { const l = s.pts[s.pts.length - 1]; labs.push({ y: Y(l[1]), t: s.name, c: c }); }
  });
  labs.sort((p, q) => p.y - q.y); labs.forEach((l, i) => { if (i && l.y - labs[i - 1].y < 13) l.y = labs[i - 1].y + 13; g += T(w - m.r + 6, l.y + 4, esc(l.t), { s: 11, f: 'var(--ink2)' }); });
  if (o.mark) g += `<circle cx="${X(o.mark.x)}" cy="${Y(o.mark.y)}" r="5" fill="none" stroke-width="2" style="stroke:var(--ink)"/>` + T(X(o.mark.x), Y(o.mark.y) - 10, esc(o.mark.label), { a: 'middle', s: 11, f: 'var(--ink)', halo: 1 });
  host.innerHTML = svgWrap(w, h, g, o.aria) + (o.series.length > 1 ? legend(o.series.map((s, i) => ({ c: s.c || SC[i % 3], n: s.name }))) : '');
}
/* html helpers */
function stat(label, value, cls) { return `<div class="stat ${cls || ''}"><b>${value}</b><span>${label}</span></div>`; }
function table(head, rows, o) {
  o = o || {};
  return `<div class="scroll"><table><thead><tr>${head.map((h, i) => `<th class="${o.num && o.num.includes(i) ? 'n' : ''}">${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map((c, i) => `<td class="${o.num && o.num.includes(i) ? 'n' : ''}">${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
/* loop diagram */
function loopSvg(o) {
  const W = 300, H = 236, cx = 150, cy = 114, R = 80, n = o.nodes.length;
  const pt = i => { if (n === 2) return [cx + (i ? 1 : -1) * R * 1.12, cy]; const a = -Math.PI / 2 + i * 2 * Math.PI / n; return [cx + R * 1.12 * Math.cos(a), cy + R * Math.sin(a)]; };
  let s = `<defs><marker id="m-${o.id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" style="fill:var(--ink2)"/></marker></defs>`;
  for (let i = 0; i < n; i++) {
    const [x1, y1] = pt(i), [x2, y2] = pt((i + 1) % n), mx = (x1 + x2) / 2, my = (y1 + y2) / 2, vx = n === 2 ? 0 : mx - cx, vy = n === 2 ? (i ? 1 : -1) : my - cy, l = Math.hypot(vx, vy) || 1;
    const qx = mx + vx / l * (n === 2 ? 44 : 26), qy = my + vy / l * (n === 2 ? 44 : 26), sx = x1 + (qx - x1) * 0.32, sy = y1 + (qy - y1) * 0.32, ex = x2 + (qx - x2) * 0.34, ey = y2 + (qy - y2) * 0.34;
    s += `<path d="M${sx.toFixed(1)} ${sy.toFixed(1)}Q${qx.toFixed(1)} ${qy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}" fill="none" stroke-width="2" marker-end="url(#m-${o.id})" style="stroke:var(--ink2)"/>`;
    const lx = 0.25 * sx + 0.5 * qx + 0.25 * ex + vx / l * 8, ly = 0.25 * sy + 0.5 * qy + 0.25 * ey + vy / l * 8, pos = o.signs[i] === '+';
    s += `<circle cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" r="9" style="fill:var(--surf);stroke:${pos ? 'var(--s1)' : 'var(--crit)'}"/>` + T(lx, ly + 4, pos ? '+' : '-', { a: 'middle', s: 12, w: 700, f: pos ? 'var(--s1)' : 'var(--crit)' });
  }
  o.nodes.forEach((t, i) => { const [x, y] = pt(i), ls = t.split('|'); ls.forEach((ln, k) => { s += T(x, y + (k - (ls.length - 1) / 2) * 12 + 4, ln, { a: 'middle', s: 11, f: 'var(--ink)', halo: 1 }); }); });
  s += T(cx, cy - 2, o.kind, { a: 'middle', s: 22, w: 700, f: o.kind === 'R' ? 'var(--crit)' : 'var(--s1)' }) + T(cx, cy + 15, o.center, { a: 'middle', s: 11, m: 1 });
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="${esc(o.title)}">${s}</svg>`;
}

