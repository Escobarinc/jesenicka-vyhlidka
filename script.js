'use strict';
(() => {
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => [...root.querySelectorAll(sel)];
  const fmt = n => Math.round(n).toLocaleString('cs-CZ') + ' Kč';
  const config = window.SITE_CONFIG || {};

  // Rozbalovací mobilní navigace.
  const toggle = qs('.menu-toggle');
  const nav = qs('#main-nav');
  const closeMenu = () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Otevřít menu');
  };
  toggle.addEventListener('click', () => {
    const expanded = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.setAttribute('aria-label', expanded ? 'Zavřít menu' : 'Otevřít menu');
  });
  qsa('.main-nav a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  document.addEventListener('click', e => {
    if (!nav.contains(e.target) && !toggle.contains(e.target)) closeMenu();
  });

  // Dluhopisový program: 3 emise (8 % od 50 000, 9 % od 250 000, 10 % od 1 000 000 Kč), čtvrtletní výplata, splatnost 1. 8. 2031.
  const amountInput = qs('#investment-amount');
  const amountRange = qs('#investment-range');
  if (amountInput && amountRange) {
    const min = 50000, max = 3000000, step = 10000;
    const MATURITY = new Date(2031, 7, 1);
    const rateFor = a => a >= 1000000 ? 10 : a >= 250000 ? 9 : 8;
    const bounded = n => Math.max(min, Math.min(max, Number.isFinite(n) ? n : min));
    const parseAmount = v => Number(String(v).replace(/[^0-9]/g, ''));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dateFmt = new Intl.DateTimeFormat('cs-CZ', { day: 'numeric', month: 'numeric', year: 'numeric' });
    // modelové termíny: každé 3 měsíce zpět od splatnosti, jen budoucí
    const payDates = (() => {
      const out = [], today = new Date();
      for (let d = new Date(MATURITY); d > today; d = new Date(d.getFullYear(), d.getMonth() - 3, 1)) out.unshift(d);
      return out;
    })();
    const tweenMoney = (el, to) => {
      const from = Number(el.dataset.v || to);
      el.dataset.v = to;
      if (reduceMotion || from === to) { el.textContent = fmt(to); return; }
      const start = performance.now(), dur = 420;
      cancelAnimationFrame(el._raf);
      const stepF = now => {
        const t = Math.min(1, (now - start) / dur), e = 1 - Math.pow(1 - t, 3);
        el.textContent = fmt(from + (to - from) * e);
        if (t < 1) el._raf = requestAnimationFrame(stepF);
      };
      el._raf = requestAnimationFrame(stepF);
    };
    const flash = el => { el.classList.remove('jv-flash'); void el.offsetWidth; el.classList.add('jv-flash'); };
    let lastRate = null;
    function updateCalculation(value, source) {
      const amount = bounded(value);
      if (source !== 'input') amountInput.value = Math.round(amount).toLocaleString('cs-CZ');
      amountRange.value = Math.max(min, Math.min(max, Math.round(amount / step) * step));
      amountRange.style.setProperty('--progress', ((amountRange.value - min) / (max - min) * 100) + '%');
      const rate = rateFor(amount), annual = amount * rate / 100, quarter = annual / 4;
      qs('#res-emise').textContent = `Emise ${rate} %`;
      qs('#res-rate').textContent = `${rate} % p.a.`;
      if (lastRate !== null && lastRate !== rate) { flash(qs('#res-emise')); flash(qs('#res-rate')); }
      lastRate = rate;
      qsa('.prog-tier').forEach(t => t.classList.toggle('is-active', Number(t.dataset.rate) === rate));
      const dRate = qs('#tier-d-rate'), dMin = qs('#tier-d-min');
      if (dRate) dRate.textContent = `${rate} % p.a.`;
      if (dMin) dMin.textContent = rate === 10 ? '1 000 000 Kč' : rate === 9 ? '250 000 Kč' : '50 000 Kč';
      tweenMoney(qs('#res-quarter'), quarter);
      tweenMoney(qs('#res-annual'), annual);
      tweenMoney(qs('#res-total'), quarter * payDates.length);
      qs('#res-total-note').textContent = `${payDates.length} čtvrtletních výplat do 1. 8. 2031`;
      const body = qs('#res-schedule');
      if (body) body.innerHTML = payDates.map(d => `<tr><td>${dateFmt.format(d)}</td><td>${fmt(quarter)}</td></tr>`).join('');
      const sel = qs('#lead-budget');
      if (sel) sel.value = rate === 10 ? 'od 1 000 000 Kč (10 % p.a.)' : rate === 9 ? '250 000 – 999 999 Kč (9 % p.a.)' : '50 000 – 249 999 Kč (8 % p.a.)';
      return amount;
    }
    amountRange.addEventListener('input', () => updateCalculation(Number(amountRange.value), 'range'));
    amountInput.addEventListener('input', () => {
      const raw = parseAmount(amountInput.value);
      if (raw > 0) updateCalculation(raw, 'input');
    });
    amountInput.addEventListener('blur', () => {
      const amount = parseAmount(amountInput.value);
      updateCalculation(Math.round(bounded(amount) / step) * step, 'range');
    });
    qsa('.prog-tier').forEach(t => t.addEventListener('click', () => updateCalculation(Number(t.dataset.amount), 'range')));
    updateCalculation(250000, 'range');
  }

  // Graf: kumulovaný hrubý úrok z 500 000 Kč při 9 % p.a. za 8 čtvrtletí.
  const chart = qs('#growth-chart');
  if (chart) {
  const qGross = 500000 * .09 / 4;
  for (let quarter = 1; quarter <= 8; quarter++) {
    const col = document.createElement('div');
    col.className = 'bar-col';
    col.innerHTML = `<span class="bar-value">${(qGross * quarter / 1000).toFixed(1).replace('.', ',')}</span><div class="bar-fill" style="--height:${Math.round(quarter / 8 * 79)}%"></div><span class="bar-label">Q${quarter}</span>`;
    chart.appendChild(col);
  }
  }

  // Vždy maximálně jedna otevřená otázka.
  qsa('#faq-list details').forEach(item => {
    item.addEventListener('toggle', () => {
      if (item.open) qsa('#faq-list details').forEach(other => {
        if (other !== item) other.open = false;
      });
    });
  });

  // Fotogalerie: zvětšení, šipky, Esc, klik mimo obraz.
  const galleryButtons = qsa('[data-lightbox]');
  const lightbox = qs('#lightbox');
  const lightboxImage = qs('#lightbox-img');
  const caption = qs('#lightbox-caption');
  let photoIndex = 0;
  const showPhoto = idx => {
    photoIndex = (idx + galleryButtons.length) % galleryButtons.length;
    const sourceImage = qs('img', galleryButtons[photoIndex]);
    lightboxImage.src = sourceImage.currentSrc || sourceImage.src;
    lightboxImage.alt = sourceImage.alt;
    caption.textContent = sourceImage.alt;
  };
  galleryButtons.forEach((button, index) => button.addEventListener('click', () => {
    showPhoto(index);
    lightbox.showModal();
  }));
  qs('.lightbox-close').addEventListener('click', () => lightbox.close());
  qs('.lightbox-prev').addEventListener('click', () => showPhoto(photoIndex - 1));
  qs('.lightbox-next').addEventListener('click', () => showPhoto(photoIndex + 1));
  lightbox.addEventListener('click', event => { if (event.target === lightbox) lightbox.close(); });
  document.addEventListener('keydown', e => {
    if (!lightbox.open) return;
    if (e.key === 'ArrowRight') showPhoto(photoIndex + 1);
    if (e.key === 'ArrowLeft') showPhoto(photoIndex - 1);
  });

  // Soukromí a cookies. Žádná analytika není aktivní.
  const policy = qs('#policy-dialog');
  qsa('[data-open-policy]').forEach(button => button.addEventListener('click', event => {
    event.preventDefault();
    policy.showModal();
  }));
  qs('#cookie-settings').addEventListener('click', () => policy.showModal());
  qs('.dialog-close').addEventListener('click', () => policy.close());
  qs('.dialog-confirm').addEventListener('click', () => policy.close());
  policy.addEventListener('click', e => { if (e.target === policy) policy.close(); });

  // Ověření všech polí. Odeslání jen na skutečně nastavenou adresu.
  const form = qs('#lead-form');
  const feedback = qs('#form-feedback');
  const submit = qs('.submit-btn');
  const fields = [qs('#lead-name'), qs('#lead-phone'), qs('#lead-email'), qs('#lead-budget')];
  const nameOk = value => value.trim().length >= 3;
  const phoneOk = value => value.replace(/\D/g, '').length >= 9;
  const emailOk = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  const validators = [nameOk, phoneOk, emailOk, value => !!value];
  fields.forEach(field => field.addEventListener('input', () => {
    field.classList.remove('invalid');
    feedback.textContent = '';
    feedback.className = 'form-feedback';
  }));
  const showFeedback = (message, error = false) => {
    feedback.textContent = message;
    feedback.className = error ? 'form-feedback error' : 'form-feedback';
  };
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const badIndex = fields.findIndex((field, idx) => !validators[idx](field.value));
    if (badIndex !== -1) {
      fields[badIndex].classList.add('invalid');
      fields[badIndex].focus();
      showFeedback('Zkontrolujte prosím povinná pole: jméno, telefon, e-mail a částku.', true);
      return;
    }
    const consent = qs('#lead-consent');
    if (!consent.checked) {
      consent.focus();
      showFeedback('Pro vyřízení poptávky je potřeba souhlas se zpracováním údajů.', true);
      return;
    }
    const payload = {
      name: fields[0].value.trim(),
      phone: fields[1].value.trim(),
      email: fields[2].value.trim(),
      budget: fields[3].value,
      source: 'Jesenická Vyhlídka – web',
      consent: true
    };
    if (typeof config.leadEndpoint === 'string' && /^https:\/\//i.test(config.leadEndpoint)) {
      submit.disabled = true;
      try {
        const response = await fetch(config.leadEndpoint, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error('Server neodpověděl úspěšně.');
        showFeedback('Vaše nezávazná poptávka byla úspěšně předána.');
        form.reset();
      } catch (err) {
        showFeedback('Poptávku se nepodařilo odeslat. Zkuste to prosím později.', true);
      } finally { submit.disabled = false; }
      return;
    }
    if (typeof config.contactEmail === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.contactEmail)) {
      const subject = encodeURIComponent('Poptávka dluhopisů – Jesenická Vyhlídka');
      const body = encodeURIComponent(`Jméno: ${payload.name}\nTelefon: ${payload.phone}\nE-mail: ${payload.email}\nZvažovaná částka: ${payload.budget}`);
      window.location.href = `mailto:${config.contactEmail}?subject=${subject}&body=${body}`;
      showFeedback('Otevřeli jsme vaši e-mailovou aplikaci s připravenou zprávou. Zprávu je potřeba v aplikaci ručně odeslat.');
      return;
    }
    showFeedback('Údaje jsou správně vyplněné. Stránka je v demonstračním režimu: poptávka nebyla nikam odeslána. Pro reálný provoz doplňte kontaktní e-mail nebo CRM endpoint do config.js.');
  });
})();

/* Zvýraznění sekce, ve které se právě nachází, v hlavním menu */
(() => {
  const links = [...document.querySelectorAll('#main-nav a[href^="#"]')];
  const items = links.map(a => ({ a, sec: document.querySelector(a.getAttribute('href')) })).filter(x => x.sec);
  if (!items.length) return;
  const header = document.querySelector('.site-header');
  let current = null;
  const update = () => {
    const line = (header ? header.offsetHeight : 0) + window.innerHeight * 0.3;
    let active = null;
    for (const it of items) if (it.sec.getBoundingClientRect().top <= line) active = it;
    if (active && active.sec.getBoundingClientRect().bottom < line) active = null;
    if (active === current) return;
    current = active;
    items.forEach(it => {
      const on = it === active;
      it.a.classList.toggle('is-active', on);
      if (on) it.a.setAttribute('aria-current', 'true'); else it.a.removeAttribute('aria-current');
    });
  };
  let ticking = false;
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; update(); }); } }, { passive: true });
  window.addEventListener('resize', update);
  update();
})();


/* Náhled variant sekce Dluhopisový program: ?program=a1|a2|a3 (výchozí a1) */
(() => {
  const v = new URLSearchParams(location.search).get('program');
  document.body.classList.add('prog-' + (v && /^a[123]$/.test(v) ? v : 'a1'));
})();

/* Náhled designu seznamu emisí: ?emise=t0|t1|t2|t3 (t0 = původní řádky, výchozí t1) */
(() => {
  const v = new URLSearchParams(location.search).get('emise');
  document.body.classList.add('emise-' + (v && /^t[0-4]$/.test(v) ? v : 't4'));
})();
