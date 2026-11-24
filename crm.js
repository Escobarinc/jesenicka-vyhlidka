/* Jesenická Vyhlídka — napojení na CLARIX CRM (měření návštěv a poptávky z formuláře).
 * Klíč webu je z CRM: Nastavení → Weby a měření. Měřicí kód se načte jen se souhlasem s analytickými cookies
 * (window.loadCrmTracking volá lišta souhlasu). Poptávky z formuláře se posílají i bez souhlasu, přímo a bez měření. */
(() => {
  'use strict';
  const CRM = { origin: 'https://clarix-crm.onrender.com', key: 'zhlifEuiAXuxpPbX' };
  window.loadCrmTracking = () => {
    if (document.getElementById('crm-t')) return;
    const t = document.createElement('script');
    t.id = 'crm-t';
    t.async = true;
    t.src = `${CRM.origin}/api/t.js?k=${encodeURIComponent(CRM.key)}`;
    document.head.appendChild(t);
  };
  // Odeslání poptávky: přes měřicí kód (spáruje návštěvu s leadem), a když se nenačetl, přímo.
  async function sendLead(data) {
    if (window.clarixTrack?.lead) {
      const r = await window.clarixTrack.lead(data);
      if (r && r.error) throw new Error(r.error);
      return r;
    }
    const q = new URLSearchParams(location.search);
    const u = {};
    ['source', 'medium', 'campaign', 'content', 'term'].forEach((k) => { u[k] = q.get('utm_' + k) || ''; });
    const body = {
      ...data, k: CRM.key, u, p: location.pathname, h: location.host, lp: location.pathname,
      rf: document.referrer || '', gc: q.get('gclid') || '', fc: q.get('fbclid') || '',
      dv: innerWidth < 768 ? 'm' : innerWidth < 1100 ? 't' : 'd',
    };
    const r = await fetch(CRM.origin + '/api/t/lead', {
      method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(body),
    }).then((x) => x.json());
    if (r && r.error) throw new Error(r.error);
    return r;
  }
  window.JV_CRM = { sendLead };
})();
