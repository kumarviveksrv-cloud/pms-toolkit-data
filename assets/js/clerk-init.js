/**
 * Virorah PMS — Clerk Auth Init
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
  const CLERK_PK = window.PMS_CLERK_PK ||
    'pk_live_Y2xlcmsudmlyb3JhaC5jb20k'; // placeholder — set in _config.js

  /* ---- Pages ---- */
  const LOGIN_PATH  = '/login.html';
  const PRICING_PATH = '/pages/pricing.html';

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

      const user = Clerk.user;

      if (REQUIRE_AUTH && !user) {
        /* Not signed in — redirect to login */
        const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.replace(LOGIN_PATH + '?redirect_url=' + returnUrl);
        return;
      }

      if (user) {
        window._pmsUser = user;
        window._pmsPlan = (user.publicMetadata && user.publicMetadata.plan) || 'free';
      }

      if (REQUIRE_PRO && window._pmsPlan !== 'pro') {
        /* Not a Pro user — redirect to pricing */
        window.location.replace(PRICING_PATH + '?upgrade=1');
        return;
      }

      /* ---- Softr compatibility shim -----------------------------------
       * Pages migrated from Softr may call window.viorahIsPro() or
       * window.viorahSaveKey(). This bridges the old key-based API to
       * Clerk so pasted page code works without any modification.
       * TODO: remove after a clean post-migration pass through all pages.
       * ------------------------------------------------------------------ */
      window.viorahIsPro   = function () { return window._pmsPlan === 'pro'; };
      window.viorahIsAdmin = function () { return window._pmsPlan === 'admin'; };
      window.viorahSaveKey = function () { /* no-op — Clerk handles auth now */ };

      /* localStorage bridge: migrated pages (certifications, downloads, ...)
       * read localStorage.viorah_plan directly instead of calling
       * viorahIsPro(). Mirror the Clerk plan into it on every page load.
       * Admin is intentionally NOT bridged (it would need viorah_key).
       * TODO: remove together with the shim above. */
      try {
        if (window._pmsPlan === 'pro' || window._pmsPlan === 'admin') {
          localStorage.setItem('viorah_plan', 'pro');
        } else {
          localStorage.removeItem('viorah_plan');
        }
        localStorage.removeItem('viorah_plan_exp');
      } catch (e) { /* storage unavailable: pages fall back to free */ }

      /* Auth OK — reveal page and hydrate nav/user chip */
      bodyEl.style.visibility = '';
      _hydrateNavUserChip(user);
      _markActiveNavItem();
      _bindSignOut(Clerk);

      /* Fire custom event so page scripts know auth is ready */
      document.dispatchEvent(new CustomEvent('pms:auth-ready', {
        detail: { user, plan: window._pmsPlan }
      }));

    } catch (err) {
      console.error('[PMS Clerk] Failed to initialise:', err);
      bodyEl.style.visibility = '';
      document.dispatchEvent(new CustomEvent('pms:auth-error', { detail: err }));
    }
  };

  script.onerror = function () {
    console.error('[PMS Clerk] SDK failed to load');
    bodyEl.style.visibility = '';
  };

  document.head.appendChild(script);

  /* ---- Helpers ---- */

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
      planEl.textContent = plan === 'pro' ? 'Virorah Pro' : 'Free';
      if (plan === 'pro') planEl.classList.add('pro');
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
        await Clerk.signOut();
        window.location.replace(LOGIN_PATH);
      });
    });
  }
})();
