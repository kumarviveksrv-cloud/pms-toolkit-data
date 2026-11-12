/* Lead capture modal (ported from Softr global footer).
   Changes from Softr: injects its own CSS and markup, counts real page loads
   (multi-page site, no SPA history hacks), no MutationObserver, no em dashes. */
(function () {
  'use strict';
  var STORAGE_KEY = 'vr_lead_captured';
  var VIEWS_KEY = 'vr_pageviews';
  var TRIGGER_DELAY = 15000;
  var VIEW_THRESHOLD = 2;
  var WORKER = 'https://pms-toolkit-ai.kumarvivek-srv.workers.dev/lead-capture';

  try { if (localStorage.getItem(STORAGE_KEY)) return; } catch (e) { return; }

  var css = "#vr-modal-backdrop {\n  display: none;\n  position: fixed;\n  inset: 0;\n  z-index: 99999;\n  background: rgba(5, 4, 16, 0.82);\n  backdrop-filter: blur(12px);\n  align-items: center;\n  justify-content: center;\n  padding: 20px;\n  animation: vrBackdropIn .3s ease;\n}\n#vr-modal-backdrop.vr-open {\n  display: flex;\n}\n@keyframes vrBackdropIn {\n  from { opacity: 0; }\n  to   { opacity: 1; }\n}\n#vr-modal-box {\n  background: #0d0b1e;\n  border: 1px solid rgba(99,102,241,.25);\n  border-radius: 20px;\n  padding: 40px 36px;\n  max-width: 440px;\n  width: 100%;\n  position: relative;\n  box-shadow: 0 40px 80px rgba(0,0,0,.6);\n  animation: vrBoxIn .35s cubic-bezier(.34,1.56,.64,1);\n}\n@keyframes vrBoxIn {\n  from { opacity: 0; transform: scale(.93) translateY(12px); }\n  to   { opacity: 1; transform: scale(1)   translateY(0); }\n}\n#vr-modal-box::before {\n  content: '';\n  position: absolute;\n  top: 0; left: 0; right: 0;\n  height: 2px;\n  border-radius: 20px 20px 0 0;\n  background: linear-gradient(90deg, transparent, #6366f1, #7c3aed, transparent);\n}\n#vr-modal-close {\n  position: absolute;\n  top: 14px; right: 16px;\n  width: 28px; height: 28px;\n  border-radius: 7px;\n  background: rgba(255,255,255,.06);\n  border: 1px solid rgba(255,255,255,.1);\n  color: rgba(255,255,255,.4);\n  font-size: 14px;\n  cursor: pointer;\n  display: flex; align-items: center; justify-content: center;\n  transition: all .2s;\n  line-height: 1;\n}\n#vr-modal-close:hover { background: rgba(255,255,255,.12); color: #fff; }\n#vr-modal-icon { font-size: 36px; margin-bottom: 14px; }\n#vr-modal-title {\n  font-family: 'Space Grotesk', sans-serif;\n  font-size: 20px; font-weight: 700;\n  color: #f4f3ff;\n  margin-bottom: 8px;\n  line-height: 1.25;\n}\n#vr-modal-sub {\n  font-family: 'DM Sans', sans-serif;\n  font-size: 13px;\n  color: rgba(165,180,252,.65);\n  line-height: 1.7;\n  margin-bottom: 6px;\n}\n#vr-modal-docs {\n  font-family: 'DM Sans', sans-serif;\n  font-size: 11px;\n  color: rgba(165,180,252,.45);\n  margin-bottom: 22px;\n  line-height: 1.6;\n}\n#vr-modal-docs span {\n  display: inline-block;\n  background: rgba(99,102,241,.1);\n  border: 1px solid rgba(99,102,241,.2);\n  border-radius: 4px;\n  padding: 1px 7px;\n  margin: 2px 2px;\n  font-size: 10px;\n  color: rgba(165,180,252,.7);\n}\n#vr-modal-email {\n  width: 100%;\n  padding: 13px 15px;\n  border-radius: 10px;\n  background: rgba(255,255,255,.06);\n  border: 1px solid rgba(99,102,241,.2);\n  color: #f4f3ff;\n  font-size: 14px;\n  font-family: 'DM Sans', sans-serif;\n  outline: none;\n  transition: border-color .2s;\n  box-sizing: border-box;\n  margin-bottom: 10px;\n}\n#vr-modal-email:focus { border-color: #6366f1; }\n#vr-modal-email::placeholder { color: rgba(165,180,252,.3); }\n#vr-modal-submit {\n  width: 100%;\n  padding: 13px;\n  border-radius: 10px;\n  border: none;\n  cursor: pointer;\n  background: linear-gradient(135deg, #6366f1, #7c3aed);\n  color: #fff;\n  font-size: 14px;\n  font-weight: 700;\n  font-family: 'Space Grotesk', sans-serif;\n  letter-spacing: .3px;\n  transition: opacity .2s, transform .15s;\n  box-shadow: 0 4px 20px rgba(99,102,241,.4);\n}\n#vr-modal-submit:hover:not(:disabled) { opacity: .9; transform: translateY(-1px); }\n#vr-modal-submit:disabled { opacity: .5; cursor: not-allowed; }\n#vr-modal-err {\n  font-size: 11px;\n  color: #f43f5e;\n  margin-top: 7px;\n  min-height: 16px;\n  font-family: 'DM Sans', sans-serif;\n}\n#vr-modal-privacy {\n  font-size: 10px;\n  color: rgba(165,180,252,.3);\n  margin-top: 12px;\n  text-align: center;\n  font-family: 'DM Sans', sans-serif;\n}\n#vr-modal-success {\n  display: none;\n  text-align: center;\n  padding: 10px 0;\n}\n#vr-modal-success-icon { font-size: 44px; margin-bottom: 12px; }\n#vr-modal-success-title {\n  font-family: 'Space Grotesk', sans-serif;\n  font-size: 18px; font-weight: 700;\n  color: #f4f3ff; margin-bottom: 8px;\n}\n#vr-modal-success-sub {\n  font-family: 'DM Sans', sans-serif;\n  font-size: 13px;\n  color: rgba(165,180,252,.6);\n  line-height: 1.7;\n  margin-bottom: 20px;\n}\n@media(max-width:480px){\n  #vr-modal-box { padding: 32px 24px;";
  var html = "<div id=\"vr-modal-backdrop\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Free Toolkit Offer\">\n  <div id=\"vr-modal-box\">\n    <button id=\"vr-modal-close\" aria-label=\"Close\">&#x2715;</button>\n    <div id=\"vr-modal-form-state\">\n      <div id=\"vr-modal-icon\">&#x1F4CB;</div>\n      <div id=\"vr-modal-title\">Get the Free Appraisal Season Toolkit</div>\n      <div id=\"vr-modal-sub\">3 documents every HRBP needs before calibration season. Free, instantly downloadable.</div>\n      <div id=\"vr-modal-docs\"><span>HR Compliance Checklist</span><span>Calibration Session Agenda</span><span>Difficult Conversation Scripts</span></div>\n      <input type=\"email\" id=\"vr-modal-email\" placeholder=\"Enter your email address\" autocomplete=\"email\" spellcheck=\"false\" />\n      <button id=\"vr-modal-submit\">Send me the Toolkit &#x2192;</button>\n      <div id=\"vr-modal-err\"></div>\n      <div id=\"vr-modal-privacy\">No spam. Unsubscribe anytime.</div>\n    </div>\n    <div id=\"vr-modal-success\">\n      <div id=\"vr-modal-success-icon\">&#x2705;</div>\n      <div id=\"vr-modal-success-title\">Your toolkit is ready.</div>\n      <div id=\"vr-modal-success-sub\">The toolkit is heading to your inbox right now. Check your email. It comes from info@virorah.com and takes about a minute.</div>\n    </div>\n  </div>\n</div>";

  function mount() {
    var st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);
    var wrap = document.createElement('div');
    wrap.innerHTML = html;
    document.body.appendChild(wrap.firstElementChild);

    var backdrop = document.getElementById('vr-modal-backdrop');
    var triggered = false;
    var timer = null;

    function showModal() {
      if (triggered) return;
      triggered = true;
      if (timer) clearTimeout(timer);
      backdrop.classList.add('vr-open');
      document.body.style.overflow = 'hidden';
    }
    function closeModal() {
      backdrop.classList.remove('vr-open');
      document.body.style.overflow = '';
      try { localStorage.setItem(STORAGE_KEY, '1'); } catch (e) {}
    }
    window.vrCloseModal = closeModal;

    backdrop.addEventListener('click', function (e) { if (e.target === backdrop) closeModal(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && triggered) closeModal(); });
    document.getElementById('vr-modal-close').addEventListener('click', closeModal);

    // Trigger 2: second page view in this browser session
    var views = 0;
    try {
      views = (parseInt(sessionStorage.getItem(VIEWS_KEY), 10) || 0) + 1;
      sessionStorage.setItem(VIEWS_KEY, String(views));
    } catch (e) {}
    if (views >= VIEW_THRESHOLD) { setTimeout(showModal, 1500); }
    // Trigger 1: 15 seconds on the page
    timer = setTimeout(showModal, TRIGGER_DELAY);

    var emailEl = document.getElementById('vr-modal-email');
    var errEl = document.getElementById('vr-modal-err');
    var btn = document.getElementById('vr-modal-submit');

    function submit() {
      var email = emailEl.value.trim();
      errEl.textContent = '';
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errEl.textContent = 'Please enter a valid email address.';
        return;
      }
      btn.disabled = true;
      btn.textContent = 'Sending…';
      fetch(WORKER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, source: window.location.pathname || '/' })
      })
        .then(function (r) { if (!r.ok) throw new Error('API error ' + r.status); return r.json(); })
        .then(function () {
          try { localStorage.setItem(STORAGE_KEY, '1'); } catch (e) {}
          document.getElementById('vr-modal-form-state').style.display = 'none';
          document.getElementById('vr-modal-success').style.display = 'block';
        })
        .catch(function () {
          errEl.textContent = 'Something went wrong. Please try again.';
          btn.disabled = false;
          btn.textContent = 'Send me the Toolkit →';
        });
    }
    btn.addEventListener('click', submit);
    emailEl.addEventListener('keydown', function (e) { if (e.key === 'Enter') submit(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
