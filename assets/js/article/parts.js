/* Loads each part (and the model) from parts/ into its section, then shows one part at a time.
   Switching parts does not change the address bar; the current part survives a reload via sessionStorage.
   Browsers block these loads when the page is opened straight from disk (file://), so it needs a web server. */
(function () {
  const PARTS = Array.from(document.querySelectorAll('section.part')).map(s => s.id.replace('sec-', ''));
  const KEY = 'aiml-part';
  let modelUpdate = null;  // set once the model tab has been opened
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
    try { sessionStorage.setItem(KEY, id); } catch (e) { /* storage blocked: reload starts at Part 1 */ }
    renderAll();
    if (id === 'model') modelUpdate = modelUpdate ? (modelUpdate(), modelUpdate) : window.startModel();
    if (scroll) requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' }));
  }

  /* An incoming link may name a part (#part-3) or an anchor inside one (#s-p3-hubs); the hash is then dropped. */
  function initial() {
    const h = decodeURIComponent((location.hash || '').slice(1));
    if (h) history.replaceState(null, '', location.pathname + location.search);
    if (PARTS.includes(h)) return showPart(h, false);
    const el = h && document.getElementById(h), sec = el && el.closest('section.part');
    if (sec) { showPart(sec.id.replace('sec-', ''), false); requestAnimationFrame(() => el.scrollIntoView()); return; }
    let saved = null; try { saved = sessionStorage.getItem(KEY); } catch (e) { /* ignore */ }
    showPart(saved, false);
  }

  /* Tabs and pager links point at #part-N or #model so they still work when opened in a new tab; a plain click switches in place. */
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || !PARTS.includes(a.getAttribute('href').slice(1))) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    showPart(a.getAttribute('href').slice(1), true);
  });

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
        + 'and open <code>http://localhost:8000/</code>. On GitHub Pages it works as is.</p>';
      return;
    }
    if (window.MathJax && MathJax.typesetPromise) MathJax.typesetPromise();
    initial();
  }
  start();
})();
