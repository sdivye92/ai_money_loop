/* Collapsible series navigation. The reader's choice is remembered between visits. */
(function () {
  const KEY = 'aiml-tabs-hidden';
  // No saved choice: open on wide screens, closed on phones where the panel would cover the text.
  let hidden = window.matchMedia('(max-width:900px)').matches;
  try { const saved = localStorage.getItem(KEY); if (saved !== null) hidden = saved === '1'; } catch (e) { /* storage blocked: use the default */ }
  const apply = () => {
    document.body.classList.toggle('tabs-hidden', hidden);
    const t = document.getElementById('tabs-toggle');
    if (t) {
      t.textContent = hidden ? 'Show contents' : 'Hide contents';
      t.setAttribute('aria-expanded', hidden ? 'false' : 'true');
    }
  };
  apply();
  document.addEventListener('DOMContentLoaded', () => {
    apply();
    const t = document.getElementById('tabs-toggle');
    if (t) {
      t.addEventListener('click', () => {
        hidden = !hidden;
        apply();
        try { localStorage.setItem(KEY, hidden ? '1' : '0'); } catch (e) { /* ignore */ }
      });
    }
  });
})();
