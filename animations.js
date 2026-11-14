'use strict';
/* Jesenická Vyhlídka – animace: dopočítání čísel, růst grafů, ukazatel výstavby.
   Vše proběhne jen jednou, když se prvek objeví na obrazovce.
   Při systémovém omezení pohybu se nic neanimuje. */
(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  document.documentElement.classList.add('jv-anim');

  const nf = new Intl.NumberFormat('cs-CZ');
  const easeOut = t => 1 - Math.pow(1 - t, 3);

  // Dopočítání čísel v textovém uzlu (zachová jednotky ve <span>)
  function countUp(el, dur = 1400) {
    const node = [...el.childNodes].find(n => n.nodeType === 3 && /\d/.test(n.textContent));
    if (!node) return;
    const original = node.textContent;
    const parts = original.split(/(\d[\d\s ]*)/);
    const targets = parts.map(p => /^\d/.test(p) ? Number(p.replace(/[\s ]/g, '')) : null);
    const start = performance.now();
    const frame = now => {
      const t = Math.min(1, (now - start) / dur), e = easeOut(t);
      node.textContent = parts.map((p, i) => targets[i] === null ? p :
        nf.format(Math.round(targets[i] * e)) + (/[\s ]$/.test(p) ? ' ' : '')).join('');
      if (t < 1) requestAnimationFrame(frame); else node.textContent = original;
    };
    requestAnimationFrame(frame);
  }

  const once = (els, fn, threshold = 0.35) => {
    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      io.unobserve(entry.target);
      fn(entry.target);
    }), { threshold });
    els.forEach(el => io.observe(el));
  };

  // 1) dlaždice s parametry
  const stats = [...document.querySelectorAll('.stat strong')];
  stats.forEach(el => el.dataset.final = el.innerHTML);
  once(stats, el => countUp(el, 1300), 0.6);

  // 2) grafy: sloupce vyrostou zdola (graf úroků vzniká skriptem, proto až po načtení)
  const charts = () => [...document.querySelectorAll('.bar-chart, .vertical-bars')];
  once(charts(), el => el.classList.add('is-visible'), 0.3);

  // 3) ukazatel postupu výstavby
  once([...document.querySelectorAll('.build-progress')], el => {
    el.classList.add('is-visible');
    const b = el.querySelector('[data-count]');
    if (b) { b.textContent = '0 %'; const n = document.createTextNode('0'); b.textContent = ''; b.append(n, ' %');
      const s = performance.now(), to = Number(b.dataset.count);
      const f = now => { const t = Math.min(1, (now - s) / 1400); n.textContent = Math.round(to * easeOut(t)); if (t < 1) requestAnimationFrame(f); };
      requestAnimationFrame(f); }
  }, 0.8);
})();
