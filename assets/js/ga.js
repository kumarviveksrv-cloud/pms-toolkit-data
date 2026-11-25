/* Analytics loader for pms.virorah.com: Google Analytics 4 and Microsoft Clarity, with consent.
 *
 *  - Visitors whose browser timezone is in Europe (EU, EEA, UK, Switzerland and other
 *    Europe/* zones), in an EU outermost region, or unknown: nothing loads until they press
 *    Accept on the banner. The choice is kept for 12 months and can be changed any time from
 *    the "Cookie choices" link in the footer or the button in the privacy policy (any element
 *    with data-consent-open reopens the banner).
 *  - Everyone else: loads as before, no banner.
 *  - Region is judged from the browser timezone. That is a heuristic, not a geolocation.
 *
 * Google Analytics 4. Measurement ID: G-LX4C03K8LK (ported from Softr global head).
 * Microsoft Clarity (session recordings and heatmaps). Project: Virorah PMS.
 * CLARITY: PUBLIC MARKETING PAGES ONLY. Never add tool, auth, account or billing pages:
 * recordings of tool pages would capture uploaded employee data shown on screen.
 * Clarity is also skipped for Pro or admin visitors (viorah_plan set) and for anyone who
 * opened a page with ?noclarity=1 (remembered on that browser), in every region. */
(function () {
  var GA_ID = 'G-LX4C03K8LK';
  var CLARITY_ID = 'ziiqln6hhm';
  var KEY = 'pms_consent';
  var MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;

  function needsConsent() {
    var tz = '';
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
    if (!tz) return true;
    return /^(Europe|Atlantic)\//.test(tz) ||
      tz === 'Africa/Ceuta' ||
      /^Indian\/(Reunion|Mayotte)$/.test(tz) ||
      /^America\/(Martinique|Guadeloupe|Cayenne|Marigot|St_Barthelemy)$/.test(tz);
  }

  function readChoice() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      var v = JSON.parse(raw);
      if (!v || (v.c !== 'granted' && v.c !== 'denied')) return null;
      if (!v.t || Date.now() - new Date(v.t).getTime() > MAX_AGE_MS) return null;
      return v.c;
    } catch (e) { return null; }
  }

  function saveChoice(c) {
    try { localStorage.setItem(KEY, JSON.stringify({ c: c, t: new Date().toISOString() })); } catch (e) {}
  }

  function clarityAllowedHere() {
    try {
      var path = location.pathname.replace(/\/+$/, '') || '/';
      var EXACT = {
        '/': 1, '/index.html': 1,
        '/pages/landing.html': 1, '/pages/home.html': 1, '/pages/about.html': 1,
        '/pages/pricing.html': 1, '/pages/tour.html': 1, '/pages/learning-hub.html': 1,
        '/pages/legal.html': 1, '/pages/terms.html': 1
      };
      var ok = EXACT[path] || /^\/pages\/(for-[a-z0-9-]+|guide-[a-z0-9-]+)\.html$/.test(path);
      if (!ok) return false;
      if (/[?&]noclarity=1\b/.test(location.search)) localStorage.setItem('pms_no_clarity', '1');
      if (localStorage.getItem('pms_no_clarity')) return false;
      if (localStorage.getItem('viorah_plan')) return false;
      return true;
    } catch (e) { return false; }
  }

  function loadGA() {
    if (window.__pmsGaLoaded) return;
    window.__pmsGaLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_ID, { anonymize_ip: true });
  }

  function loadClarity() {
    if (window.__pmsClarityLoaded || !clarityAllowedHere()) return;
    window.__pmsClarityLoaded = true;
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', CLARITY_ID);
  }

  function loadAnalytics() { loadGA(); loadClarity(); }

  function clearCookies() {
    var names = document.cookie.split(';').map(function (s) { return s.split('=')[0].trim(); });
    var host = location.hostname;
    var domains = ['', ';domain=' + host, ';domain=.' + host.replace(/^www\./, '')];
    names.forEach(function (n) {
      if (!/^(_ga|_gid|_gat|_clck|_clsk|CLID|ANONCHK|MR|MUID|SM|SRM_B)/.test(n)) return;
      domains.forEach(function (d) {
        document.cookie = n + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/' + d;
      });
    });
  }

  var bannerEl = null;

  function closeBanner() {
    if (bannerEl && bannerEl.parentNode) bannerEl.parentNode.removeChild(bannerEl);
    bannerEl = null;
  }

  function decide(choice) {
    var before = readChoice();
    saveChoice(choice);
    closeBanner();
    if (choice === 'granted') {
      loadAnalytics();
    } else if (window.__pmsGaLoaded || window.__pmsClarityLoaded || before === 'granted') {
      clearCookies();
      location.reload();
    }
  }

  function showBanner() {
    if (bannerEl) return;
    var css = document.createElement('style');
    css.textContent =
      '#pms-consent{position:fixed;left:16px;right:16px;bottom:16px;z-index:2147483000;max-width:680px;margin:0 auto;' +
      'background:#13111f;color:#fff;border:1px solid rgba(102,126,234,.4);border-radius:12px;padding:18px 20px;' +
      'box-shadow:0 12px 40px rgba(0,0,0,.6);font:14px/1.55 "DM Sans",-apple-system,system-ui,sans-serif}' +
      '#pms-consent p{margin:0 0 14px;color:rgba(255,255,255,.82)}' +
      '#pms-consent a{color:#a5b4fc}' +
      '#pms-consent .pms-row{display:flex;gap:10px;flex-wrap:wrap}' +
      '#pms-consent button{flex:1 1 140px;font:600 13px/1 "Space Grotesk","DM Sans",system-ui,sans-serif;padding:12px 16px;' +
      'border-radius:8px;cursor:pointer;color:#fff;background:rgba(102,126,234,.18);border:1px solid rgba(165,180,252,.5)}' +
      '#pms-consent button:hover,#pms-consent button:focus-visible{background:rgba(102,126,234,.38);outline:2px solid #a5b4fc;outline-offset:2px}';
    var box = document.createElement('div');
    box.id = 'pms-consent';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', 'Analytics and cookies');
    box.innerHTML =
      '<p>We use Google Analytics, and on some public pages Microsoft Clarity, to see how this site is used. ' +
      'They set cookies and collect usage data such as pages viewed, clicks and scrolling. Nothing loads unless you accept. ' +
      '<a href="/pages/legal.html#cookies">Privacy Policy</a></p>' +
      '<div class="pms-row"><button type="button" data-pms="denied">Decline</button>' +
      '<button type="button" data-pms="granted">Accept</button></div>';
    box.appendChild(css);
    box.addEventListener('click', function (e) {
      var v = e.target && e.target.getAttribute && e.target.getAttribute('data-pms');
      if (v) decide(v);
    });
    (document.body || document.documentElement).appendChild(box);
    bannerEl = box;
  }

  function init() {
    window.pmsConsent = { open: showBanner };
    document.addEventListener('click', function (e) {
      var t = e.target && e.target.closest ? e.target.closest('[data-consent-open]') : null;
      if (t) { e.preventDefault(); showBanner(); }
    });
    var choice = readChoice();
    if (!needsConsent()) {
      if (choice !== 'denied') loadAnalytics();
      return;
    }
    if (choice === 'granted') loadAnalytics();
    else if (choice === null) showBanner();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
