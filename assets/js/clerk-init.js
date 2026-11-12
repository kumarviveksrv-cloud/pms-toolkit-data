/**
 * Virorah PMS - Clerk Auth Init
 * Loads the Clerk JS SDK, guards protected pages, and exposes
 * the current user + plan to every page.
 *
 * Usage: include this script in every page BEFORE page-specific JS.
 * Set window.PMS_CONFIG before this script runs (optional):
 *   window.PMS_CONFIG = { requireAuth: true, requirePro: false }
 */
(function () {
  'use strict';

  /* ---- Config injected by each page ---- */
  const cfg = window.PMS_CONFIG || {};
  const REQUIRE_AUTH = cfg.requireAuth !== false; // default: true
  const REQUIRE_PRO  = cfg.requirePro  === true;  // default: false

  /* ---- Clerk publishable key (replace with real key before deploy) ---- */
  /* Staging site (staging.virorah.com) uses the Clerk development instance, because the
   * production instance only accepts pms.virorah.com. Remove this branch after cutover. */
  const STAGING_PK = 'pk_test_aGFuZHktZmluY2gtNDA2Ny5jbGVyay5hY2NvdW50cy5kZXYk';
  const CLERK_PK = (location.hostname === 'staging.virorah.com') ? STAGING_PK : (window.PMS_CLERK_PK ||
    'pk_live_Y2xlcmsudmlyb3JhaC5jb20k'); // placeholder - set in _config.js

  /* ---- Pages ---- */
  const LOGIN_PATH  = '/login.html';
  const PRICING_PATH = '/pages/pricing.html';

  /* ---- Worker (plan lookup) ---- */
  const WORKER_URL = (window.PMS_WORKER_URL || 'https://pms-toolkit-ai.kumarvivek-srv.workers.dev').replace(/\/+$/, '');
  /* Placeholder stored where pages expect an access key. The Worker swaps it for the
   * signed-in person's real key, so key-based page code keeps working unchanged. */
  const KEY_PLACEHOLDER = 'CLERK-SESSION';
  const PLAN_CACHE_MS = 5 * 60 * 1000;

  /* Was this browser already marked Pro when the page began loading? (used to decide on a one-time refresh) */
  let planAtPageStart = '';
  try { planAtPageStart = localStorage.getItem('viorah_plan') || ''; } catch (e) { /* storage unavailable */ }

  /* ---- Show loading spinner immediately ---- */
  const bodyEl = document.body;
  if (REQUIRE_AUTH) {
    bodyEl.style.visibility = 'hidden';
  }

  /* ---- Load Clerk JS SDK asynchronously ---- */
  const script = document.createElement('script');
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.src = 'https://unpkg.com/@clerk/clerk-js@5/dist/clerk.browser.js';

  script.onload = async function () {
    try {
      const Clerk = new window.Clerk(CLERK_PK);
      await Clerk.load();

      /* Expose globally so page scripts can use it */
      window._clerk = Clerk;
      window._pmsUser = null;
      window._pmsPlan = 'free';
      /* Let pms-fetch.js start attaching the session token to Worker calls. */
      if (typeof window.__pmsAuthDone === 'function') window.__pmsAuthDone();

      const user = Clerk.user;

      if (REQUIRE_AUTH && !user) {
        /* Not signed in - redirect to login */
        const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.replace(LOGIN_PATH + '?redirect_url=' + returnUrl);
        return;
      }

      if (user) {
        window._pmsUser = user;
        /* The Worker is the source of truth (Pro Keys by verified email). Clerk
         * metadata is only a fallback for when the Worker cannot be reached. */
        window._pmsPlan = (user.publicMetadata && user.publicMetadata.plan) || 'free';
        let me = await _fetchPlan(Clerk, false);
        /* Someone who typed their emailed access key before (or on another page) while signed
         * in: bind that key to this account once, so it keeps working however they sign in. */
        if (me && me.plan === 'free') {
          const claimed = await _claimStoredKey();
          if (claimed) me = await _fetchPlan(Clerk, true);
        }
        if (me && me.plan) window._pmsPlan = me.plan;
      }

      if (REQUIRE_PRO && !_isPaid(window._pmsPlan)) {
        /* Not a Pro user - redirect to pricing */
        window.location.replace(PRICING_PATH + '?upgrade=1');
        return;
      }

      /* ---- Softr compatibility shim -----------------------------------
       * Pages migrated from Softr may call window.viorahIsPro() or
       * window.viorahSaveKey(). This bridges the old key-based API to
       * Clerk so pasted page code works without any modification.
       * TODO: remove after a clean post-migration pass through all pages.
       * ------------------------------------------------------------------ */
      window.viorahIsPro   = function () { return _isPaid(window._pmsPlan); };
      window.viorahIsAdmin = function () { return window._pmsPlan === 'admin'; };
      window.viorahSaveKey = function () { /* no-op - Clerk handles auth now */ };

      /* localStorage bridge: migrated pages (certifications, downloads, ...)
       * read localStorage.viorah_plan / viorah_key directly. Mirror the plan into
       * them on every page load. */
      _bridgePlan(window._pmsPlan);

      /* First visit in this browser: pages already ran their Pro checks against an
       * empty localStorage, so refresh once so they see the real plan. */
      if (_isPaid(window._pmsPlan) && planAtPageStart !== 'pro') {
        try {
          if (!sessionStorage.getItem('pms_plan_reloaded')) {
            sessionStorage.setItem('pms_plan_reloaded', '1');
            window.location.reload();
            return;
          }
        } catch (e) { /* sessionStorage unavailable: skip the refresh */ }
      }

      /* Call after the plan may have changed (claimed a key, finished payment). */
      window.pmsRefreshPlan = async function () {
        const fresh = await _fetchPlan(Clerk, true);
        if (fresh && fresh.plan) {
          window._pmsPlan = fresh.plan;
          _bridgePlan(fresh.plan);
          document.dispatchEvent(new CustomEvent('pms:plan-changed', { detail: { plan: fresh.plan } }));
        }
        return window._pmsPlan;
      };

      /* Auth OK - reveal page */
      bodyEl.style.visibility = '';

      /* Fire custom event so page scripts know auth is ready. nav.js rebuilds the
       * sidebar in response, so the user chip and sign-out button are wired AFTER it. */
      document.dispatchEvent(new CustomEvent('pms:auth-ready', {
        detail: { user, plan: window._pmsPlan }
      }));
      _hydrateNavUserChip(user);
      _markActiveNavItem();
      _bindSignOut(Clerk);

    } catch (err) {
      console.error('[PMS Clerk] Failed to initialise:', err);
      if (typeof window.__pmsAuthDone === 'function') window.__pmsAuthDone();
      bodyEl.style.visibility = '';
      document.dispatchEvent(new CustomEvent('pms:auth-error', { detail: err }));
    }
  };

  script.onerror = function () {
    console.error('[PMS Clerk] SDK failed to load');
    if (typeof window.__pmsAuthDone === 'function') window.__pmsAuthDone();
    bodyEl.style.visibility = '';
  };

  document.head.appendChild(script);

  /* ---- Helpers ---- */

  function _isPaid (plan) { return plan === 'pro' || plan === 'admin'; }

  async function _fetchPlan (Clerk, force) {
    const uid = Clerk.user && Clerk.user.id;
    if (!force) {
      try {
        const cached = JSON.parse(sessionStorage.getItem('pms_me') || 'null');
        if (cached && cached.sub === uid && Date.now() - cached.at < PLAN_CACHE_MS) return cached.me;
      } catch (e) { /* ignore a bad cache */ }
    }
    const ctl = new AbortController();
    const timer = setTimeout(function () { ctl.abort(); }, 5000);
    try {
      const res = await fetch(WORKER_URL + '/me', { signal: ctl.signal });
      if (!res.ok) return null;
      const me = await res.json();
      try { sessionStorage.setItem('pms_me', JSON.stringify({ at: Date.now(), sub: uid, me: me })); } catch (e) { /* ignore */ }
      return me;
    } catch (e) {
      return null; /* Worker unreachable: caller falls back to Clerk metadata */
    } finally {
      clearTimeout(timer);
    }
  }

  async function _claimStoredKey () {
    let key = '';
    try { key = (localStorage.getItem('viorah_key') || '').trim(); } catch (e) { return false; }
    if (!key || key === KEY_PLACEHOLDER) return false;
    try {
      /* One attempt per key per browser session, so a bad key is not retried on every page. */
      const tried = sessionStorage.getItem('pms_claim_tried');
      if (tried === key) return false;
      sessionStorage.setItem('pms_claim_tried', key);
    } catch (e) { /* ignore */ }
    try {
      const res = await fetch(WORKER_URL + '/claim-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: key })
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  }

  function _bridgePlan (plan) {
    try {
      if (_isPaid(plan)) {
        localStorage.setItem('viorah_plan', 'pro');
        /* Pages only check that a key exists. Never overwrite a real key someone typed. */
        if (!localStorage.getItem('viorah_key')) localStorage.setItem('viorah_key', KEY_PLACEHOLDER);
      } else {
        const k = localStorage.getItem('viorah_key');
        if (k && k !== KEY_PLACEHOLDER) {
          /* Someone who typed a legacy access key: leave their plan to the page's own key check. */
        } else {
          localStorage.removeItem('viorah_plan');
          if (k === KEY_PLACEHOLDER) localStorage.removeItem('viorah_key');
        }
      }
      localStorage.removeItem('viorah_plan_exp');
    } catch (e) { /* storage unavailable: pages fall back to free */ }
  }

  function _hydrateNavUserChip (user) {
    const nameEl = document.querySelector('.pms-user-name');
    const planEl = document.querySelector('.pms-user-plan');
    const avatarEl = document.querySelector('.pms-avatar');

    if (!user) {
      if (nameEl)   nameEl.textContent  = 'Guest';
      if (planEl)   planEl.textContent  = 'Free';
      if (avatarEl) avatarEl.textContent = 'G';
      return;
    }

    const name = user.firstName
      ? (user.firstName + (user.lastName ? ' ' + user.lastName : ''))
      : (user.primaryEmailAddress ? user.primaryEmailAddress.emailAddress : 'User');

    const plan  = window._pmsPlan;
    const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    if (nameEl)   nameEl.textContent  = name;
    if (planEl) {
      planEl.textContent = _isPaid(plan) ? 'Virorah Pro' : 'Free';
      if (_isPaid(plan)) planEl.classList.add('pro');
    }
    if (avatarEl) {
      /* Use Clerk avatar image if available, else initials */
      const imgUrl = user.imageUrl;
      if (imgUrl) {
        avatarEl.innerHTML = '<img src="' + imgUrl + '" alt="' + initials + '" style="width:30px;height:30px;border-radius:50%;object-fit:cover;">';
      } else {
        avatarEl.textContent = initials;
      }
    }
  }

  function _markActiveNavItem () {
    const path = window.location.pathname;
    document.querySelectorAll('.pms-nav-item[href]').forEach(el => {
      const href = el.getAttribute('href');
      /* Match exact path or /pages/foo.html ↔ /pages/foo */
      const normalize = p => p.replace(/\.html$/, '').replace(/\/index$/, '/');
      if (normalize(href) === normalize(path)) {
        el.classList.add('active');
      }
    });
  }

  function _bindSignOut (Clerk) {
    document.querySelectorAll('[data-action="sign-out"]').forEach(el => {
      el.addEventListener('click', async function (e) {
        e.preventDefault();
        try {
          localStorage.removeItem('viorah_plan');
          if (localStorage.getItem('viorah_key') === KEY_PLACEHOLDER) localStorage.removeItem('viorah_key');
          sessionStorage.removeItem('pms_me');
          sessionStorage.removeItem('pms_plan_reloaded');
        } catch (err) { /* ignore */ }
        await Clerk.signOut();
        window.location.replace(LOGIN_PATH);
      });
    });
  }
})();
