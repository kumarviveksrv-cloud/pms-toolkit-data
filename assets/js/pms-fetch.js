/**
 * Virorah PMS - Worker auth bridge.
 * Loaded synchronously in <head> so it is in place before any page script runs.
 *
 * When a visitor is signed in with Clerk, calls to the Virorah Worker that
 * carry an access key are sent with "Authorization: Bearer <Clerk session token>".
 * The Worker turns that into the person's real key server-side, so pages keep
 * working unchanged. Signed-out visitors, and legacy key holders, are untouched.
 *
 * clerk-init.js calls window.__pmsAuthDone() once Clerk has loaded.
 */
(function () {
  'use strict';
  if (window.__pmsFetchPatched) return;
  window.__pmsFetchPatched = true;

  var WORKER = (window.PMS_WORKER_URL || 'https://pms-toolkit-ai.kumarvivek-srv.workers.dev').replace(/\/+$/, '');

  /* Must mirror CLERK_AUTH_PATHS / CLERK_AUTH_ACTIONS in the Worker. */
  var PATHS = {
    '/transcribe': 1, '/download-file': 1, '/template-content': 1, '/scenario-content': 1,
    '/cert-questions': 1, '/cert-submit': 1, '/cert-verify': 1,
    '/forge-playbook': 1, '/case-room': 1, '/design-track': 1,
    '/me': 1, '/claim-key': 1
  };
  var ACTIONS = { '': 1, 'claude': 1, 'validate-key': 1, 'get-subscription-status': 1, 'cancel-subscription': 1 };

  /* Resolves when Clerk has finished loading (or failed, or took too long). */
  var done;
  var ready = new Promise(function (resolve) { done = resolve; });
  window.__pmsAuthDone = function () { done(); };
  setTimeout(done, 8000);

  function headerOf(input, init, name) {
    var h = init && init.headers;
    if (!h && input && typeof input === 'object' && input.headers) h = input.headers;
    if (!h) return '';
    if (typeof h.get === 'function') return h.get(name) || '';
    var lower = name.toLowerCase();
    for (var k in h) { if (k.toLowerCase() === lower) return h[k] || ''; }
    return '';
  }

  function wants(input, init) {
    var raw = typeof input === 'string' ? input : (input && input.url) || '';
    if (raw.indexOf(WORKER) !== 0) return false;
    var method = ((init && init.method) || (input && input.method) || 'GET').toUpperCase();
    var u;
    try { u = new URL(raw); } catch (e) { return false; }
    if (u.pathname === '/me') return true;
    if (method !== 'POST') return false;
    if (headerOf(input, init, 'Authorization')) return false;
    if (PATHS[u.pathname]) return true;
    if (u.pathname !== '/') return false;
    var action = headerOf(input, init, 'X-Action') || u.searchParams.get('action') || '';
    return !!ACTIONS[action];
  }

  var origFetch = window.fetch.bind(window);
  window.fetch = function (input, init) {
    if (!wants(input, init)) return origFetch(input, init);
    return ready.then(function () {
      var clerk = window._clerk;
      if (!clerk || !clerk.session || typeof clerk.session.getToken !== 'function') return null;
      return clerk.session.getToken().catch(function () { return null; });
    }).then(function (token) {
      if (!token) return origFetch(input, init);
      var headers = new Headers((init && init.headers) || (input && typeof input === 'object' ? input.headers : undefined) || {});
      headers.set('Authorization', 'Bearer ' + token);
      var next = Object.assign({}, init || {}, { headers: headers });
      return origFetch(input, next);
    });
  };
})();
