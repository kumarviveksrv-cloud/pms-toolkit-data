/* Google Analytics 4 (ported from Softr global head). Measurement ID: G-LX4C03K8LK */
(function () {
  var ID = 'G-LX4C03K8LK';
  if (window.__pmsGaLoaded) return;
  window.__pmsGaLoaded = true;
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', ID, { anonymize_ip: true });
})();

/* Microsoft Clarity (session recordings and heatmaps). Project: Virorah PMS.
 * PUBLIC MARKETING PAGES ONLY. Never add tool, auth, account or billing pages:
 * recordings of tool pages would capture uploaded employee data shown on screen.
 * Also skipped for: Pro or admin visitors (viorah_plan set), anyone who opened a page
 * with ?noclarity=1 (remembered), and visitors whose timezone is in Europe/*, so no
 * Clarity cookie is ever set for EEA, UK or Swiss visitors without a consent banner. */
(function () {
  var CLARITY_ID = 'ziiqln6hhm';
  if (window.__pmsClarityLoaded) return;
  try {
    var path = location.pathname.replace(/\/+$/, '') || '/';
    var EXACT = {
      '/': 1, '/index.html': 1,
      '/pages/landing.html': 1, '/pages/home.html': 1, '/pages/about.html': 1,
      '/pages/pricing.html': 1, '/pages/tour.html': 1, '/pages/learning-hub.html': 1,
      '/pages/legal.html': 1, '/pages/terms.html': 1
    };
    var ok = EXACT[path] || /^\/pages\/(for-[a-z0-9-]+|guide-[a-z0-9-]+)\.html$/.test(path);
    if (!ok) return;
    if (/[?&]noclarity=1\b/.test(location.search)) localStorage.setItem('pms_no_clarity', '1');
    if (localStorage.getItem('pms_no_clarity')) return;
    if (localStorage.getItem('viorah_plan')) return;
    var tz = '';
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
    if (/^Europe\//.test(tz)) return;
  } catch (e) { return; }
  window.__pmsClarityLoaded = true;
  (function (c, l, a, r, i, t, y) {
    c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
    t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
    y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
  })(window, document, 'clarity', 'script', CLARITY_ID);
})();
