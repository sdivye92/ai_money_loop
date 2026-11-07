/* Loads each part from article/parts/ into its section, then shows the part named in the URL hash.
   Browsers block these loads when the page is opened straight from disk (file://), so it needs a web server. */
(function () {
  const PARTS = Array.from(document.querySelectorAll('section.part')).map(s => s.id.replace('sec-', ''));
  const loadScript = src => new Promise((ok, fail) => {
    const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => fail(new Error('could not load ' + src));
    document.body.appendChild(s);
  });

  function showPart(id, scroll) {
    if (!PARTS.includes(id)) id = PARTS[0];
    PARTS.forEach(p => { document.getElementById('sec-' + p).hidden = p !== id; });
    document.querySelectorAll('.tabs a[data-part]').forEach(a => {
      if (a.dataset.part === id) {
        a.setAttribute('aria-current', 'page');
        const tb = a.parentElement; tb.scrollTop = Math.max(0, a.offsetTop - (tb.clientHeight - a.offsetHeight) / 2);
      } else a.removeAttribute('aria-current');
    });
    renderAll();
    if (scroll) requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' }));
  }

  /* The hash is either a part (#part-3) or an anchor inside one (#s-p3-hubs). */
  function route(scroll) {
    const h = decodeURIComponent((location.hash || '').slice(1));
    if (PARTS.includes(h) || !h) { showPart(h, scroll); return; }
    const el = document.getElementById(h), sec = el && el.closest('section.part');
    if (!sec) { showPart(PARTS[0], scroll); return; }
    showPart(sec.id.replace('sec-', ''), false);
    requestAnimationFrame(() => el.scrollIntoView());
  }

  async function start() {
    const sections = Array.from(document.querySelectorAll('section.part[data-src]'));
    try {
      await Promise.all(sections.map(async s => {
        const r = await fetch(s.dataset.src);
        if (!r.ok) throw new Error(s.dataset.src + ': ' + r.status);
        s.innerHTML = await r.text();
      }));
      for (const src of (document.body.dataset.partScripts || '').split(' ').filter(Boolean)) await loadScript(src);
    } catch (e) {
      console.error(e);
      sections[0].hidden = false;
      sections[0].innerHTML = '<p class="lead">The parts of this article could not be loaded. If you opened this file directly from disk, '
        + 'your browser blocks it from reading the other files. Serve the folder instead, for example with <code>python3 -m http.server</code>, '
        + 'and open <code>http://localhost:8000/article/</code>. On GitHub Pages it works as is.</p>';
      return;
    }
    if (window.MathJax && MathJax.typesetPromise) MathJax.typesetPromise();
    window.addEventListener('hashchange', () => route(true));
    route(false);
  }
  start();
})();
