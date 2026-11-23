/**
 * Virorah PMS - Page Guide + Virorah AI chat widget.
 * Ported from the Softr global footer (v16). Content is unchanged; differences:
 *  - page keys are Softr-style paths ('/case-room'); this file maps them to /pages/<name>.html
 *  - chat access uses the Clerk session (via pms-fetch.js) instead of typing a key
 *  - the Guide sits in the content area instead of floating over the sidebar
 */
(function () {
  'use strict';
  if (window.__pmsGuideAI) return;
  window.__pmsGuideAI = true;

  var WORKER_URL = (window.PMS_WORKER_URL || 'https://pms-toolkit-ai.kumarvivek-srv.workers.dev').replace(/\/+$/, '');

  /* ---- path mapping: Softr path <-> static file ---- */
  var FILE_FOR = { '/certify': '/pages/certifications.html', '/my-progress': '/pages/progress.html' };
  function hrefFor(p) { return FILE_FOR[p] || ('/pages' + p + '.html'); }
  function currentPath() {
    var m = location.pathname.match(/^\/pages\/([^\/]+?)(?:\.html)?\/?$/);
    if (!m) return location.pathname.replace(/\/$/, '') || '/';
    var n = m[1];
    if (n === 'certifications') n = 'certify';
    if (n === 'progress') n = 'my-progress';
    return '/' + n;
  }

  /* ---- styles + markup ---- */
  var CSS = "/* RESET */\n#vai-root * { box-sizing: border-box; margin: 0; padding: 0; }\n#vai-root {\n  font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;\n  position: fixed;\n  bottom: 28px;\n  right: 28px;\n  z-index: 99999;\n}\n.vai-trigger {\n  width: 52px; height: 52px;\n  border-radius: 50%;\n  background: linear-gradient(135deg, #667eea, #764ba2);\n  border: none; cursor: pointer;\n  display: flex; align-items: center; justify-content: center;\n  box-shadow: 0 4px 20px rgba(102,126,234,.45);\n  transition: all .25s;\n  position: relative;\n}\n.vai-trigger:hover { transform: scale(1.08); box-shadow: 0 6px 28px rgba(102,126,234,.55); }\n.vai-trigger svg { width: 22px; height: 22px; fill: white; }\n.vai-trigger .vai-badge {\n  position: absolute; top: -3px; right: -3px;\n  width: 18px; height: 18px; border-radius: 50%;\n  background: #10b981; border: 2px solid white;\n  font-size: 9px; font-weight: 800; color: white;\n  display: flex; align-items: center; justify-content: center;\n}\n.vai-trigger.vai-secondary-pulse::before {\n  content: ''; position: absolute; inset: -4px; border-radius: 50%;\n  border: 2px solid rgba(167,139,250,.5);\n  opacity: 0; animation: vaiSecondaryPulse 2.4s ease-out infinite;\n  pointer-events: none;\n}\n@keyframes vaiSecondaryPulse { 0%{opacity:.6;transform:scale(1);} 80%{opacity:0;transform:scale(1.5);} 100%{opacity:0;transform:scale(1.5);} }\n.vai-panel {\n  position: fixed; bottom: 90px; right: 28px;\n  width: 340px; height: 520px;\n  background: #13131f;\n  border: 1px solid rgba(102,126,234,.18);\n  border-radius: 16px;\n  box-shadow: 0 24px 64px rgba(0,0,0,.7), 0 0 0 1px rgba(102,126,234,.08);\n  display: flex; flex-direction: column; overflow: hidden;\n  animation: vaiSlide .2s ease; transform-origin: bottom right;\n}\n@keyframes vaiSlide { from{opacity:0;transform:scale(.94) translateY(10px);} to{opacity:1;transform:scale(1) translateY(0);} }\n.vai-panel.hidden { display: none; }\n.vai-head {\n  padding: 14px 16px 12px;\n  background: linear-gradient(135deg, #5b5fc7 0%, #7c3aed 100%);\n  display: flex; align-items: center; gap: 10px; flex-shrink: 0;\n}\n.vai-head-icon { width: 32px; height: 32px; border-radius: 8px; background: rgba(255,255,255,.2); display: flex; align-items: center; justify-content: center; font-size: 15px; flex-shrink: 0; }\n.vai-head-info { flex: 1; }\n.vai-head-name { font-size: 14px; font-weight: 700; color: white; line-height: 1.2; }\n.vai-head-sub { font-size: 11px; color: rgba(255,255,255,.65); margin-top: 1px; }\n.vai-close { background: rgba(255,255,255,.15); border: none; cursor: pointer; width: 26px; height: 26px; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: white; font-size: 14px; line-height: 1; transition: background .2s; flex-shrink: 0; }\n.vai-close:hover { background: rgba(255,255,255,.25); }\n.vai-messages { flex: 1; overflow-y: auto; padding: 16px 16px 16px 20px; display: flex; flex-direction: column; gap: 16px; scroll-behavior: smooth; }\n.vai-messages::-webkit-scrollbar { width: 4px; }\n.vai-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,.12); border-radius: 2px; }\n.vai-msg { display: flex; flex-direction: column; gap: 0; animation: vaiFade .2s ease; }\n@keyframes vaiFade { from{opacity:0;transform:translateY(5px);} to{opacity:1;transform:translateY(0);} }\n.vai-msg.user { align-items: flex-end; padding: 0 4px 0 32px; }\n.vai-msg.ai { align-items: flex-start; padding: 0 12px 0 12px; }\n.vai-bubble { padding: 12px 14px; font-size: 13px; line-height: 1.7; max-width: 88%; }\n.vai-msg.ai .vai-bubble { background: rgba(255,255,255,.08); color: rgba(255,255,255,.92); border-radius: 4px 14px 14px 14px; border: 1px solid rgba(255,255,255,.1); max-width: calc(100% - 20px); margin-left: 8px; font-size: 14px; line-height: 1.8; padding: 14px 16px; }\n.vai-msg.user .vai-bubble { background: linear-gradient(135deg, #667eea, #7c3aed); color: white; border-radius: 14px 4px 14px 14px; font-size: 13px; margin-left: 48px; }\n.vai-bubble strong { color: #c4b5fd; font-weight: 600; }\n.vai-bubble em { color: #10b981; font-style: normal; }\n.vai-bubble p { margin: 0 0 8px; }\n.vai-bubble p:last-child { margin-bottom: 0; }\n.vai-bubble ul { margin: 6px 0 8px 16px; display: flex; flex-direction: column; gap: 4px; list-style: disc; }\n.vai-bubble li { line-height: 1.6; padding-left: 2px; }\n.vai-typing { display: flex; gap: 4px; align-items: center; padding: 12px 14px; background: rgba(255,255,255,.07); border-radius: 4px 12px 12px 12px; border: 1px solid rgba(255,255,255,.08); width: fit-content; }\n.vai-typing span { width: 6px; height: 6px; border-radius: 50%; background: #a78bfa; opacity: .5; animation: vaiDot 1.2s infinite; }\n.vai-typing span:nth-child(2) { animation-delay: .2s; }\n.vai-typing span:nth-child(3) { animation-delay: .4s; }\n@keyframes vaiDot { 0%,80%,100%{opacity:.2;transform:scale(.8);} 40%{opacity:1;transform:scale(1);} }\n.vai-suggestions { padding: 0 14px 10px; display: flex; flex-direction: column; gap: 5px; flex-shrink: 0; }\n.vai-suggestion { background: rgba(255,255,255,.04); border: 1px solid rgba(102,126,234,.18); border-radius: 8px; padding: 8px 12px; font-size: 12px; color: rgba(255,255,255,.6); cursor: pointer; text-align: left; font-family: inherit; transition: all .2s; line-height: 1.4; }\n.vai-suggestion:hover { background: rgba(102,126,234,.14); border-color: rgba(102,126,234,.4); color: white; }\n.vai-input-wrap { padding: 10px 12px 12px; border-top: 1px solid rgba(255,255,255,.06); display: flex; gap: 8px; align-items: center; flex-shrink: 0; }\n.vai-input { flex: 1; background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.12); border-radius: 24px; padding: 10px 16px 10px 18px; font-size: 13px; color: white; font-family: inherit; resize: none; outline: none; max-height: 80px; min-height: 40px; line-height: 1.4; transition: border-color .2s; }\n.vai-input::placeholder { color: rgba(255,255,255,.28); }\n.vai-input:focus { border-color: rgba(102,126,234,.55); }\n.vai-send { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #7c3aed); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all .2s; box-shadow: 0 2px 10px rgba(102,126,234,.35); }\n.vai-send:hover { transform: scale(1.08); box-shadow: 0 4px 16px rgba(102,126,234,.5); }\n.vai-send:disabled { opacity: .35; cursor: not-allowed; transform: none; }\n.vai-send svg { width: 15px; height: 15px; fill: white; }\n.vai-footer { text-align: center; font-size: 10px; color: rgba(255,255,255,.1); padding: 0 14px 7px; flex-shrink: 0; letter-spacing: .3px; }\n@media(max-width:480px){ .vai-panel { width: calc(100vw - 24px); right: 12px; bottom: 80px; } #vai-root { right: 16px; bottom: 16px; } }\n/* AI CONSENT MODAL */\n.vaic-backdrop { position: fixed; inset: 0; z-index: 99998; background: rgba(8,8,18,.88); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); display: none; align-items: center; justify-content: center; padding: 20px; animation: vaicFadeIn .3s ease; font-family: 'DM Sans', -apple-system, sans-serif; }\n.vaic-backdrop.is-active { display: flex; }\n@keyframes vaicFadeIn { from{opacity:0;} to{opacity:1;} }\n.vaic-modal { background: #0f0f1a; border: 1px solid rgba(139,92,246,.3); border-radius: 18px; width: 100%; max-width: 520px; max-height: 85vh; display: flex; flex-direction: column; box-shadow: 0 24px 80px rgba(0,0,0,.7), 0 0 0 1px rgba(139,92,246,.1); animation: vaicSlideUp .4s cubic-bezier(.2,.8,.2,1); }\n@keyframes vaicSlideUp { from{opacity:0;transform:translateY(20px) scale(.96);} to{opacity:1;transform:translateY(0) scale(1);} }\n.vaic-header { padding: 22px 26px 18px; border-bottom: 1px solid rgba(255,255,255,.06); flex-shrink: 0; }\n.vaic-eyebrow { font-size: 10px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #a78bfa; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }\n.vaic-eyebrow-dot { width: 6px; height: 6px; border-radius: 50%; background: #8b5cf6; box-shadow: 0 0 8px #8b5cf6; }\n.vaic-title { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; color: #f0eeff; line-height: 1.25; margin: 0; }\n.vaic-body { padding: 18px 26px; overflow-y: auto; flex: 1; color: rgba(240,238,255,.85); font-size: 13.5px; line-height: 1.65; }\n.vaic-body p { margin: 0 0 14px; }\n.vaic-body strong { color: #f0eeff; font-weight: 600; }\n.vaic-body a { color: #a78bfa; text-decoration: underline; text-decoration-color: rgba(167,139,250,.4); }\n.vaic-section { margin-bottom: 18px; padding-bottom: 16px; border-bottom: 1px dashed rgba(167,139,250,.15); }\n.vaic-section:last-of-type { border-bottom: none; padding-bottom: 0; }\n.vaic-section-head { font-size: 13px; font-weight: 700; color: #c7bfff; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }\n.vaic-section-warn .vaic-section-head { color: #fcd34d; }\n.vaic-checks { list-style: none; padding: 0; margin: 0; }\n.vaic-checks li { padding: 6px 0 6px 24px; position: relative; font-size: 13px; line-height: 1.55; }\n.vaic-checks li::before { content: '\\2713'; position: absolute; left: 0; top: 6px; color: #10b981; font-weight: 700; font-size: 14px; }\n.vaic-callout { background: rgba(139,92,246,.08); border: 1px solid rgba(139,92,246,.2); border-radius: 10px; padding: 12px 14px; margin: 14px 0; font-size: 12.5px; color: #d4ccff; line-height: 1.55; }\n.vaic-footer { padding: 16px 26px 20px; border-top: 1px solid rgba(255,255,255,.06); display: flex; gap: 10px; justify-content: flex-end; flex-shrink: 0; flex-wrap: wrap; }\n.vaic-btn { padding: 11px 20px; border-radius: 10px; font-family: inherit; font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: all .2s ease; line-height: 1; }\n.vaic-btn-ghost { background: rgba(255,255,255,.05); color: rgba(255,255,255,.7); border: 1px solid rgba(255,255,255,.1); }\n.vaic-btn-ghost:hover { background: rgba(255,255,255,.1); color: white; }\n.vaic-btn-primary { background: linear-gradient(135deg, #8b5cf6, #6366f1); color: white; box-shadow: 0 4px 14px rgba(139,92,246,.4); }\n.vaic-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(139,92,246,.55); }\n.vaic-fineprint { width: 100%; font-size: 11px; color: rgba(255,255,255,.35); text-align: center; margin-top: 6px; line-height: 1.5; }\n@media(max-width:600px){ .vaic-modal { max-height: 92vh; border-radius: 14px; } .vaic-footer { flex-direction: column-reverse; } .vaic-btn { width: 100%; padding: 13px; } }\n/* GLOBAL TOUR SYSTEM */\n#vg-btn {\n  position: fixed; bottom: 28px; left: 28px; z-index: 88000;\n  display: none; align-items: center; gap: 7px; padding: 10px 18px;\n  border-radius: 100px; background: linear-gradient(135deg, #667eea, #764ba2);\n  color: white; font-size: 12px; font-weight: 700; cursor: pointer; border: none;\n  font-family: 'DM Sans', 'Space Grotesk', sans-serif;\n  box-shadow: 0 4px 20px rgba(102,126,234,.45);\n  transition: transform .2s, box-shadow .2s, left .25s ease; letter-spacing: .3px;\n}\n#vg-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(102,126,234,.6); }\n#vg-btn .vg-icon { width: 16px; height: 16px; border-radius: 50%; background: rgba(255,255,255,.25); display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800; flex-shrink: 0; }\n#vg-btn.vg-pulse { animation: vgPulseBtn 2s ease-in-out 3; }\n@keyframes vgPulseBtn { 0%,100%{box-shadow:0 4px 20px rgba(102,126,234,.45);} 50%{box-shadow:0 4px 32px rgba(102,126,234,.9), 0 0 0 8px rgba(102,126,234,.15);} }\n#vg-card {\n  position: fixed; bottom: 80px; left: 28px; z-index: 88001; width: 300px;\n  max-height: calc(100vh - 110px);\n  display: flex; flex-direction: column;\n  background: #0d0b1e; border: 1px solid rgba(102,126,234,.3); border-radius: 16px;\n  box-shadow: 0 16px 48px rgba(0,0,0,.6), 0 0 0 1px rgba(102,126,234,.08);\n  font-family: 'DM Sans', 'Space Grotesk', sans-serif; overflow: hidden;\n  transform: translateY(16px); opacity: 0; pointer-events: none;\n  transition: transform .3s cubic-bezier(.4,0,.2,1), opacity .3s ease;\n}\n#vg-inner { display: flex; flex-direction: column; min-height: 0; max-height: 100%; }\n#vg-card .vg-card-top { flex-shrink: 0; }\n#vg-card .vg-progress-wrap { flex-shrink: 0; }\n#vg-card .vg-card-footer { flex-shrink: 0; }\n#vg-card .vg-card-body { overflow-y: auto; min-height: 0; flex: 1; }\n#vg-card .vg-card-body::-webkit-scrollbar { width: 4px; }\n#vg-card .vg-card-body::-webkit-scrollbar-track { background: transparent; }\n#vg-card .vg-card-body::-webkit-scrollbar-thumb { background: rgba(102,126,234,.3); border-radius: 2px; }\n#vg-card.vg-open { transform: translateY(0); opacity: 1; pointer-events: all; }\n.vg-card-top { padding: 14px 16px 10px; border-bottom: 1px solid rgba(102,126,234,.12); display: flex; align-items: center; justify-content: space-between; }\n.vg-card-top-left { display: flex; align-items: center; gap: 10px; }\n.vg-card-icon { width: 32px; height: 32px; border-radius: 8px; background: rgba(102,126,234,.15); display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }\n.vg-card-module { font-size: 14px; font-weight: 700; color: #f4f3ff; letter-spacing: -.2px; }\n.vg-card-step { font-size: 10px; font-weight: 600; color: rgba(165,180,252,.5); letter-spacing: .5px; }\n.vg-card-close { width: 24px; height: 24px; border-radius: 50%; background: rgba(255,255,255,.06); border: none; cursor: pointer; color: rgba(165,180,252,.5); font-size: 12px; display: flex; align-items: center; justify-content: center; transition: background .2s; flex-shrink: 0; }\n.vg-card-close:hover { background: rgba(255,255,255,.12); color: #f4f3ff; }\n.vg-progress-wrap { height: 2px; background: rgba(102,126,234,.12); }\n.vg-progress-fill { height: 100%; background: linear-gradient(90deg, #667eea, #e879f9); transition: width .4s ease; }\n.vg-card-body { padding: 14px 16px; }\n.vg-what { font-size: 12px; color: rgba(165,180,252,.75); line-height: 1.65; margin-bottom: 10px; }\n.vg-bullets { display: flex; flex-direction: column; gap: 5px; margin-bottom: 10px; }\n.vg-bullet { font-size: 11px; color: rgba(255,255,255,.75); display: flex; align-items: flex-start; gap: 6px; line-height: 1.5; }\n.vg-bullet-arrow { color: #667eea; flex-shrink: 0; font-size: 11px; margin-top: 1px; }\n.vg-concept { background: rgba(102,126,234,.1); border: 1px solid rgba(102,126,234,.2); border-radius: 8px; padding: 7px 10px; font-size: 10px; color: #a5b4fc; line-height: 1.5; margin-bottom: 12px; }\n.vg-concept-label { font-weight: 700; text-transform: uppercase; letter-spacing: 1px; font-size: 9px; color: rgba(102,126,234,.6); margin-bottom: 2px; }\n.vg-card-footer { padding: 0 16px 14px; display: flex; gap: 8px; }\n.vg-btn-skip { flex: 0 0 auto; padding: 8px 12px; border-radius: 8px; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.08); color: rgba(165,180,252,.4); font-size: 11px; font-weight: 600; cursor: pointer; font-family: inherit; transition: all .2s; }\n.vg-btn-skip:hover { background: rgba(255,255,255,.09); color: rgba(165,180,252,.7); }\n.vg-btn-next { flex: 1; padding: 9px 12px; border-radius: 8px; background: linear-gradient(135deg, #667eea, #764ba2); border: none; color: white; font-size: 12px; font-weight: 700; cursor: pointer; font-family: inherit; box-shadow: 0 2px 12px rgba(102,126,234,.35); transition: all .2s; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }\n.vg-btn-next:hover { box-shadow: 0 4px 20px rgba(102,126,234,.55); transform: translateY(-1px); }\n.vg-btn-help { flex: 1; padding: 9px 12px; border-radius: 8px; background: rgba(102,126,234,.12); border: 1px solid rgba(102,126,234,.25); color: #a5b4fc; font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit; transition: all .2s; }\n.vg-btn-help:hover { background: rgba(102,126,234,.2); }\n.vg-roadmap-item { display:flex; align-items:center; gap:10px; padding:9px 12px; border-radius:8px; text-decoration:none; background:rgba(102,126,234,.04); border:1px solid rgba(102,126,234,.1); transition:all .2s; margin-bottom:6px; }\n.vg-roadmap-item:hover { background:rgba(102,126,234,.12); border-color:rgba(102,126,234,.3); }\n.vg-roadmap-item.vg-flagship { border-color: rgba(251,191,36,.35); background: rgba(251,191,36,.04); }\n.vg-roadmap-item.vg-flagship:hover { border-color: rgba(251,191,36,.55); }\n.vg-spotlight-ring {\n  position: fixed;\n  z-index: 87999;\n  border-radius: 12px;\n  border: 2px solid #a78bfa;\n  box-shadow: 0 0 0 4px rgba(167,139,250,.25), 0 0 24px rgba(167,139,250,.5);\n  pointer-events: none;\n  transition: top .3s ease, left .3s ease, width .3s ease, height .3s ease, opacity .3s ease;\n  opacity: 0;\n}\n.vg-spotlight-ring.vg-spot-active {\n  opacity: 1;\n  animation: vgSpotPulse 1.8s ease-in-out infinite;\n}\n@keyframes vgSpotPulse {\n  0%,100% { box-shadow: 0 0 0 4px rgba(167,139,250,.25), 0 0 24px rgba(167,139,250,.5); }\n  50% { box-shadow: 0 0 0 8px rgba(167,139,250,.12), 0 0 36px rgba(167,139,250,.7); }\n}\n\n@media(max-width:600px){ #vg-card { width: calc(100vw - 40px); left: 20px; } #vg-btn { bottom: 20px; left: 20px; } }\n\n/* ported-site placement: Guide sits in the content area, clear of the sidebar */\n#vg-btn { left: calc(var(--nav-width, 242px) + 20px) !important; bottom: 56px !important; }\n#vg-card { left: calc(var(--nav-width, 242px) + 20px) !important; bottom: 108px !important; }\nbody.pms-collapsed #vg-btn, body.pms-collapsed #vg-card { left: 20px !important; }\n@media (max-width: 900px) { #vg-btn, #vg-card { left: 20px !important; } #vg-btn { bottom: 20px !important; } #vg-card { bottom: 72px !important; } }\/* Guide pill sits beside the AI orb (bottom-right), not on top of page content */\nhtml body #vg-btn#vg-btn { left: auto !important; right: 92px !important; bottom: 36px !important; }\nhtml body #vg-card#vg-card { left: auto !important; right: 28px !important; bottom: 92px !important; }\n@media (max-width: 900px) { html body #vg-btn#vg-btn { right: 78px !important; bottom: 24px !important; } html body #vg-card#vg-card { right: 16px !important; bottom: 80px !important; } }\n";
  var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);

  var MARKUP = "<div id=\"vai-root\">\n  <button class=\"vai-trigger\" id=\"vai-trigger\" title=\"Ask Virorah AI\">\n    <svg viewBox=\"0 0 24 24\"><path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z\"/></svg>\n    <div class=\"vai-badge\">AI</div>\n  </button>\n  <div class=\"vai-panel hidden\" id=\"vai-panel\">\n    <div class=\"vai-head\">\n      <div class=\"vai-head-icon\">&#x2736;</div>\n      <div class=\"vai-head-info\">\n        <div class=\"vai-head-name\">Virorah AI</div>\n        <div class=\"vai-head-sub\">AI-powered answers</div>\n      </div>\n      <button class=\"vai-close\" id=\"vai-close\">&#x2715;</button>\n    </div>\n    <div class=\"vai-messages\" id=\"vai-messages\"></div>\n    <div class=\"vai-suggestions\" id=\"vai-suggestions\"></div>\n    <div class=\"vai-input-wrap\">\n      <textarea class=\"vai-input\" id=\"vai-input\" placeholder=\"Ask a question...\" rows=\"1\"></textarea>\n      <button class=\"vai-send\" id=\"vai-send\">\n        <svg viewBox=\"0 0 24 24\"><path d=\"M2.01 21L23 12 2.01 3 2 10l15 2-15 2z\"/></svg>\n      </button>\n    </div>\n    <div class=\"vai-footer\">Powered by Claude &middot; Virorah AI</div>\n  </div>\n</div>\n<div class=\"vaic-backdrop\" id=\"vaicBackdrop\">\n  <div class=\"vaic-modal\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"vaicTitle\">\n    <div class=\"vaic-header\">\n      <div class=\"vaic-eyebrow\"><span class=\"vaic-eyebrow-dot\"></span>One-time consent</div>\n      <h2 class=\"vaic-title\" id=\"vaicTitle\">Before we start chatting</h2>\n    </div>\n    <div class=\"vaic-body\">\n      <p>Hey &#x1F44B; Virorah AI is powered by <strong>Claude</strong>, an AI model from Anthropic. Before your first chat, here is what you should know.</p>\n      <div class=\"vaic-section\">\n        <div class=\"vaic-section-head\">&#x1F4CD; Where your messages go</div>\n        <p>When you ask Virorah AI a question, your message plus a small bit of page context is sent to <strong>Anthropic API</strong> to generate a response. We do not store your chat on Virorah servers.</p>\n        <ul class=\"vaic-checks\">\n          <li><strong>Anthropic deletes your messages within 30 days</strong></li>\n          <li><strong>Your messages are NOT used to train Anthropic AI models</strong></li>\n          <li><strong>Anthropic does not sell or share your data</strong></li>\n        </ul>\n        <div class=\"vaic-callout\">You can read Anthropic full policy at <a href=\"https://www.anthropic.com/legal/privacy\" target=\"_blank\">anthropic.com/legal/privacy</a>.</div>\n      </div>\n      <div class=\"vaic-section vaic-section-warn\">\n        <div class=\"vaic-section-head\">&#x1F6D1; Please do not paste sensitive information</div>\n        <p>Even though Anthropic data handling is solid, please <strong>do not paste into the chat:</strong></p>\n        <ul class=\"vaic-checks\">\n          <li>Real employee names, emails, or ID numbers</li>\n          <li>Real salary figures or compensation data</li>\n          <li>Confidential company information</li>\n          <li>Anything covered by an NDA or employment contract</li>\n        </ul>\n        <p style=\"margin-top:12px;\">If you need to discuss a real situation, <strong>describe it generically</strong> instead of identifying anyone.</p>\n      </div>\n      <div class=\"vaic-section\">\n        <div class=\"vaic-section-head\">&#x2696;&#xFE0F; What you are agreeing to</div>\n        <ul class=\"vaic-checks\">\n          <li>You understand your messages will be sent to Anthropic for processing</li>\n          <li>You will not paste confidential or personal data of others into the chat</li>\n          <li>You take responsibility for what you choose to share</li>\n          <li>Virorah AI is a learning aid, not a substitute for legal, HR, or professional advice</li>\n        </ul>\n      </div>\n      <p style=\"font-size:12px;color:rgba(255,255,255,.5);margin-top:18px;\">For full details, read our <a href=\"/legal\" target=\"_blank\">Privacy Policy &amp; Terms</a>.</p>\n    </div>\n    <div class=\"vaic-footer\">\n      <button class=\"vaic-btn vaic-btn-ghost\" id=\"vaicCancelBtn\">Maybe later</button>\n      <button class=\"vaic-btn vaic-btn-primary\" id=\"vaicAgreeBtn\">&#x2713; OK, let us chat</button>\n      <div class=\"vaic-fineprint\">By clicking \"OK, let us chat\", you accept these terms.</div>\n    </div>\n  </div>\n</div>\n<button id=\"vg-btn\" data-action=\"vg-toggle\">\n  <span class=\"vg-icon\">?</span>\n  <span id=\"vg-btn-label\">Guide</span>\n</button>\n<div id=\"vg-card\">\n  <div id=\"vg-inner\"></div>\n</div>";
  var holder = document.createElement('div'); holder.innerHTML = MARKUP;
  while (holder.firstChild) document.body.appendChild(holder.firstChild);

  /* ================= AI CHAT ================= */
var PAGE_CONTEXTS = {
  '/home':{label:'Homepage',context:'User is on the Virorah PMS homepage, a Performance Intelligence platform. The flagship features are The Case Room (bring a real situation, get a full action plan), and the FORGE family (Forge Simulation, Forge Your Org, The Foundry) for building high performing teams. Also has 16 calculators, 15 scenarios, AI conversation simulator, and certifications.',suggestions:['Where should I start?','What is The Case Room?','How do I build a high performing team?']},
  '/case-room':{label:'The Case Room',context:'User is on The Case Room, where they bring one real performance situation happening right now and get a complete action plan through the Virorah Performance Compass: PROBE (root cause), PROTOCOL (the right process, with Humacity financial exposure), LEDGER (documentation), RESOLVE (the conversation).',suggestions:['What is PROBE, PROTOCOL, LEDGER, RESOLVE?','How is the financial exposure calculated?','Can I download the case summary?']},
  '/forge':{label:'Forge Simulation',context:'User is on Forge Simulation, a hands-on team-building simulation with 8 characters, 6 stages, and real AI consequences to every decision. Part of the FORGE family alongside Forge Your Org (diagnose an existing team) and The Foundry (build a team from scratch).',suggestions:['How does Forge Simulation work?','What are the character archetypes?','How is the HPT score calculated?']},
  '/forge-your-org':{label:'Forge Your Org',context:'User is on Forge Your Org, an AI diagnostic that scores their real organisation against 5 conditions (Direction Clarity, Leadership Density, Performance Differentiation, Feedback Velocity, Human Capital Return) and generates a 90-day playbook with Humacity financial exposure figures.',suggestions:['What are the 5 conditions?','How is financial exposure calculated?','Can I download the playbook?']},
  '/the-foundry':{label:'The Foundry',context:'User is on The Foundry, a guided build journey for architecting a genuinely extraordinary team, from scratch or by redesigning an existing one, across 6 research-backed conditions: Stakes, Ownership Fusion, Candor Architecture, Risk Segregation, Signature, Radical Scope Discipline. Ends in a downloadable Operating Kit.',suggestions:['What are the 6 conditions?','What is the Operating Kit?','Can I build from scratch or only redesign an existing team?']},
  '/scenarios':{label:'Scenario Library',context:'User is on the Scenarios page. 15 pre-built companies, 750 employees each. Run any of 16 calculators on any scenario.',suggestions:['Which scenario for a beginner?','What makes each scenario different?','Can I use my own data?']},
  '/analyse-your-org':{label:'Analyse Your Org',context:'User can upload their own employee CSV and run all 16 calculators on real data.',suggestions:['What columns do I need?','Which calculators can I run?','Is my data stored anywhere?']},
  '/review-cycle':{label:'Review Cycle',context:'Full 7-stage simulation of a performance review cycle.',suggestions:['What is a review cycle?','What happens at calibration?','How long to complete?']},
  '/learning-hub':{label:'Learning Hub',context:'14 in-depth guides for HR practitioners covering PMS frameworks, calibration, DEI, OKRs, and more.',suggestions:['Which guide first?','What is Performance Theatre?','Bell curve vs forced ranking?']},
  '/case-studies':{label:'Case Studies',context:'15 real-world performance management stories. Based on real company patterns.',suggestions:['What is grade inflation?','Best case for startup HR?','What does a DEI audit look like?']},
  '/templates':{label:'Templates',context:'25 ready-to-use HR documents across 5 categories.',suggestions:['Template for mid-year review?','How to write a PIP email?','What to prep for calibration?']},
  '/simulate':{label:'Conversation Simulator',context:'AI conversation simulator, 10 scenarios, 10 employee personalities. User plays the manager. Scored on empathy, clarity, legal safety, outcome.',suggestions:['How is scoring done?','Which scenario is hardest?','What makes a good score?']},
  '/certify':{label:'Certifications',context:'Virorah PMS certifications: Fundamentals and Advanced. Unique credential IDs. LinkedIn-ready.',suggestions:['Am I ready for Fundamentals?','What topics for Advanced?','How do I add to LinkedIn?']},
  '/game':{label:'Manager Challenge',context:'4-round management challenge: rate 12 employees, allocate budget, defend calibration, handle 2 difficult conversations. Scored out of 100.',suggestions:['How is scoring done?','What are the 4 rounds?','What score is considered good?']},
  '/goal-lab':{label:'Goal Lab',context:'AI diagnoses goals before you cascade them. Flags weak, vague, unmeasurable goals.',suggestions:['How does goal diagnosis work?','What makes a strong goal?','SMART vs OKR?']},
  '/bias-audit':{label:'Bias Audit',context:'AI-powered bias detection in rating distributions.',suggestions:['What bias does it detect?','How many employees needed?','What is recency bias?']},
  '/my-progress':{label:'My Progress',context:'Personal learning dashboard showing completion, certifications earned, recommended next steps.',suggestions:['What should I focus on next?','How to earn all certifications?','Why is progress showing zero?']},
  '/manager-report-card':{label:'Manager Report Card',context:'Generate a one-page performance report card for any manager.',suggestions:['How do I generate a card?','What does it measure?','What is flight risk?']},
  '/downloads':{label:'Downloads',context:'Professional Excel templates including the OKR Flagship Planner.',suggestions:['What is the OKR Flagship?','Which download first?','Are these free?']},
  '/pricing':{label:'Pricing',context:'Free core tools. Pro unlocks all 16 calculators, real org data, certifications, AI simulations, The Case Room, Forge Your Org, and The Foundry.',suggestions:['What is free vs pro?','How does the key work?','Multiple devices?']},
  '/pulse':{label:'User Pulse',context:'Feedback page where users share their experience with the founder.',suggestions:['Who sees my feedback?','How long does it take?','Is it anonymous?']},
  '/humacity-ledger':{label:'Humacity Suite: Value Ledger',context:'User is on the Humacity Value Ledger (L1). Financial ledger of the organisation human capital value using uploaded CSV data. Four entries with Show Workings toggle: star retention (1.8x salary), development talent (2.8x DRI), engagement premium (8%), risk mitigation (60% flight risk exposure). HCI confidence panel included.',suggestions:['What does the Value Ledger show?','What is the HCI panel?','How do I read the ledger entries?']},
  '/humacity-talent-premium':{label:'Humacity Suite: Talent Premium',context:'User is on the Humacity Talent Premium (L2). Computes Talent Quality Premium score across 5 verdict areas using uploaded CSV data. Includes HCI panel and forward projection levers.',suggestions:['What is the Talent Quality Premium?','What are the 5 verdict areas?','How do the projection levers work?']},
  '/humacity-org-vitals':{label:'Humacity Suite: Org Vitals',context:'User is on the Humacity Org Vitals (L3). Runs 20 binary signals to classify the organisation into one of 8 DNA types with 20 prescriptions by timeframe and owner.',suggestions:['What are the 8 DNA types?','What do the 20 signals measure?','How are prescriptions assigned?']},
  '/humacity-human-pl':{label:'Humacity Suite: Human P&L',context:'User is on the Humacity Human P&L (L4). Full income statement view of workforce investment with click-to-edit lines and HCI panel.',suggestions:['How do I read the Human P&L?','What can I edit?','What is the HCI panel?']},
  '/humacity-balance-sheet':{label:'Humacity Suite: Balance Sheet',context:'User is on the Humacity Balance Sheet (L5). Human capital assets vs liabilities in two-column layout. Shows Net Human Capital, Asset Density, and Humacity Score from 0 to 100.',suggestions:['What is the Humacity Score?','How is Net Human Capital calculated?','What counts as a liability?']}
};
var DEFAULT_CONTEXT = { label:'Virorah PMS', context:'User is on the Virorah PMS platform.', suggestions:['Where should I start?','What can I do here?','What makes this different?'] };
  function getPageContext() {
    var path = currentPath();
    for (var key in PAGE_CONTEXTS) {
      if (path === key || path.indexOf(key + '/') === 0) return PAGE_CONTEXTS[key];
    }
    if (path.indexOf('scenarios-details') !== -1 || path.indexOf('scenario') !== -1) return PAGE_CONTEXTS['/scenarios'];
    return DEFAULT_CONTEXT;
  }
  var state = { open: false, loading: false, history: [], pageCtx: null, welcomed: false };
  var pendingMessageAfterConsent = null;
  var CONCIERGE_KEY = 'virorah_concierge_seen_v2';
  var CONCIERGE_ROLES = [
    { label: "A real performance situation is on my desk right now",
      reply: "That is exactly what <strong>The Case Room</strong> is built for. Describe what has actually happened and you will get a full action plan: root cause, the right process, ready-to-use documentation, and how to have the conversation.",
      links: [{ label: 'The Case Room', path: '/case-room' }] },
    { label: "I need to build or fix a high performing team",
      reply: "Head to <strong>FORGE</strong>. If you are starting from scratch, or intentionally redesigning an existing team, use <strong>The Foundry</strong>. If you want to diagnose what is broken in your current team first, use <strong>Forge Your Org</strong>. Either way, <strong>Forge Simulation</strong> is the free, hands-on way to learn how the underlying conditions actually work.",
      links: [{ label: 'The Foundry', path: '/the-foundry' }, { label: 'Forge Your Org', path: '/forge-your-org' }, { label: 'Forge Simulation', path: '/forge' }] },
    { label: "Just exploring, no fixed goal yet",
      reply: "The <strong>Platform Tour</strong> page is built exactly for this, a full walkthrough plus a lookup table if a specific problem crosses your mind while you browse.",
      links: [{ label: 'Platform Tour', path: '/tour' }] }
  ];
  function hasSeenConcierge() { try { return localStorage.getItem(CONCIERGE_KEY) === '1'; } catch (e) { return true; } }
  function markConciergeSeen() { try { localStorage.setItem(CONCIERGE_KEY, '1'); } catch (e) {} }

  var panel = document.getElementById('vai-panel'), trigger = document.getElementById('vai-trigger'),
      closeBtn = document.getElementById('vai-close'), messages = document.getElementById('vai-messages'),
      suggEl = document.getElementById('vai-suggestions'), input = document.getElementById('vai-input'),
      sendBtn = document.getElementById('vai-send');

  function renderSuggestions() {
    suggEl.innerHTML = '';
    if (state.history.length > 0) return;
    var ctx = state.pageCtx || DEFAULT_CONTEXT;
    ctx.suggestions.forEach(function (q) {
      var btn = document.createElement('button'); btn.className = 'vai-suggestion'; btn.textContent = q;
      btn.onclick = function () { sendMessage(q); }; suggEl.appendChild(btn);
    });
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function formatVaiMessage(text) {
    text = esc(text).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>');
    var lines = text.split('\n'), out = [], inList = false;
    lines.forEach(function (line) {
      var trim = line.trim();
      var isBullet = /^[-•*]\s/.test(trim), isNum = /^\d+\.\s/.test(trim);
      if (isBullet || isNum) { if (!inList) { out.push('<ul>'); inList = true; } out.push('<li>' + trim.replace(/^[-•*\d\.]+\s/, '') + '</li>'); }
      else { if (inList) { out.push('</ul>'); inList = false; } if (trim) out.push('<p>' + trim + '</p>'); }
    });
    if (inList) out.push('</ul>');
    return out.join('');
  }
  function addMessage(role, content, raw) {
    var msg = document.createElement('div'); msg.className = 'vai-msg ' + role;
    var bubble = document.createElement('div'); bubble.className = 'vai-bubble';
    bubble.innerHTML = (role === 'ai' && !raw) ? formatVaiMessage(content) : (role === 'ai' ? content : esc(content));
    if (role === 'ai') bubble.style.cssText = 'margin-left:12px !important;margin-right:8px !important;max-width:calc(100% - 20px) !important;font-size:14px !important;line-height:1.8 !important;padding:14px 16px !important;';
    else bubble.style.cssText = 'margin-left:48px !important;margin-right:4px !important;font-size:13px !important;max-width:calc(100% - 52px) !important;width:fit-content !important;align-self:flex-end !important;';
    msg.appendChild(bubble); messages.appendChild(msg); messages.scrollTop = messages.scrollHeight;
  }
  function addTyping() { var w = document.createElement('div'); w.className = 'vai-msg ai'; w.id = 'vai-typing-wrap'; var t = document.createElement('div'); t.className = 'vai-typing'; t.innerHTML = '<span></span><span></span><span></span>'; w.appendChild(t); messages.appendChild(w); messages.scrollTop = messages.scrollHeight; }
  function removeTyping() { var el = document.getElementById('vai-typing-wrap'); if (el) el.remove(); }
  function showWelcome() { if (state.welcomed) return; state.welcomed = true; var ctx = state.pageCtx || DEFAULT_CONTEXT; addMessage('ai', 'Hi! I can answer questions about **' + ctx.label + '**. What would you like to know?'); }
  function showConciergeGreeting() {
    if (state.welcomed) return; state.welcomed = true; markConciergeSeen();
    addMessage('ai', "Hey, first time here? I'm Virorah AI. Answer one quick thing and I'll point you at exactly the right starting page.");
    var wrap = document.createElement('div'); wrap.className = 'vai-msg ai';
    var h = document.createElement('div'); h.style.cssText = 'display:flex;flex-direction:column;gap:6px;margin-left:12px;margin-top:4px;max-width:calc(100% - 20px);';
    CONCIERGE_ROLES.forEach(function (role) {
      var b = document.createElement('button'); b.className = 'vai-suggestion'; b.style.textAlign = 'left'; b.textContent = role.label;
      b.addEventListener('click', function () {
        addMessage('user', role.label);
        var linksHtml = role.links.map(function (l) { return '<a href="' + hrefFor(l.path) + '" style="color:#c4b5fd;">' + l.label + '</a>'; }).join(' &middot; ');
        addMessage('ai', role.reply + '<br><br>' + linksHtml, true);
        setTimeout(function () {
          var isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
          addMessage('ai', 'One more thing: press <strong>' + (isMac ? 'Cmd+K' : 'Ctrl+K') + '</strong> anytime to search every page and calculator by name.', true);
        }, 500);
        markConciergeSeen(); h.remove();
      });
      h.appendChild(b);
    });
    wrap.appendChild(h); messages.appendChild(wrap); messages.scrollTop = messages.scrollHeight;
  }
  /* The concierge waits for the Guide card to be closed so the two never cover the page together. */
  var conciergePending = false;
  function openConcierge() {
    if (hasSeenConcierge()) return;
    state.open = true; panel.classList.remove('hidden'); showConciergeGreeting();
  }
  function maybeTriggerConcierge() {
    if (hasSeenConcierge()) return;
    setTimeout(function () {
      if (hasSeenConcierge()) return;
      if (cardOpen) { conciergePending = true; return; }
      openConcierge();
    }, 2500);
  }
  function buildSystemPrompt() {
    var ctx = state.pageCtx || DEFAULT_CONTEXT;
    return 'You are Virorah AI, assistant for Virorah PMS.\n\nCURRENT PAGE ONLY: ' + ctx.context + '\n\nRULES:\n- Max 50 words. Be concise.\n- Only reference what is in the CURRENT PAGE context. Never invent features.\n- Bold 1-2 key terms max.\n- No bullet lists unless user requests.\n- Tone: warm, direct.\n- If unsure, say: ask me something specific about this page.';
  }
  function showProGate() {
    var wrap = document.createElement('div'); wrap.className = 'vai-msg ai';
    var bubble = document.createElement('div'); bubble.className = 'vai-bubble';
    bubble.style.cssText = 'margin-left:12px !important;margin-right:8px !important;max-width:calc(100% - 20px) !important;font-size:14px !important;line-height:1.8 !important;padding:14px 16px !important;';
    var signedIn = !!window._pmsUser;
    bubble.innerHTML = 'Chatting with Virorah AI is a <strong>Pro</strong> feature. ' +
      (signedIn ? '' : 'Already Pro? <a href="/login.html" style="color:#c4b5fd;">Sign in</a>. ') +
      'New here? <a href="/pages/pricing.html" style="color:#c4b5fd;">See pricing</a>.';
    wrap.appendChild(bubble); messages.appendChild(wrap); messages.scrollTop = messages.scrollHeight;
  }
  async function sendMessage(text) {
    var msg = text || input.value.trim();
    if (!msg || state.loading) return;
    var proKey = ''; try { proKey = (localStorage.getItem('viorah_key') || '').trim(); } catch (e) {}
    if (!proKey) { input.value = ''; suggEl.innerHTML = ''; addMessage('user', msg); showProGate(); return; }
    var hasConsent = false; try { hasConsent = localStorage.getItem('virorah_ai_consent_v1') === '1'; } catch (e) {}
    if (!hasConsent) {
      pendingMessageAfterConsent = msg; input.value = '';
      var bd = document.getElementById('vaicBackdrop');
      if (bd) { bd.classList.add('is-active'); document.body.style.overflow = 'hidden'; }
      return;
    }
    input.value = ''; input.style.height = 'auto'; suggEl.innerHTML = '';
    addMessage('user', msg); state.history.push({ role: 'user', content: msg });
    state.loading = true; sendBtn.disabled = true; addTyping();
    try {
      var res = await fetch(WORKER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestType: 'chat-widget', key: proKey, model: 'claude-haiku-4-5-20251001', max_tokens: 180, system: buildSystemPrompt(), messages: state.history.slice(-10) }) });
      if (!res.ok) {
        var errBody = await res.json().catch(function () { return {}; });
        removeTyping(); addMessage('ai', errBody.error || 'Something went wrong. Please try again.');
        state.loading = false; sendBtn.disabled = false; return;
      }
      var data = await res.json(); removeTyping();
      var reply = (data.content && data.content[0]) ? data.content[0].text : 'Sorry, I ran into an issue. Try again in a moment.';
      state.history.push({ role: 'assistant', content: reply }); addMessage('ai', reply);
    } catch (err) { removeTyping(); addMessage('ai', 'Connection issue, please try again in a moment.'); }
    state.loading = false; sendBtn.disabled = false;
  }
  trigger.addEventListener('click', function () {
    try { localStorage.setItem('virorah_ai_orb_engaged_v2', '1'); } catch (e) {}
    state.open = !state.open;
    if (state.open) { panel.classList.remove('hidden'); if (!state.welcomed) showWelcome(); setTimeout(function () { input.focus(); }, 100); }
    else panel.classList.add('hidden');
  });
  closeBtn.addEventListener('click', function () { state.open = false; panel.classList.add('hidden'); });
  var vaicBackdrop = document.getElementById('vaicBackdrop'), vaicAgreeBtn = document.getElementById('vaicAgreeBtn'), vaicCancelBtn = document.getElementById('vaicCancelBtn');
  function vaicHide() { if (vaicBackdrop) { vaicBackdrop.classList.remove('is-active'); document.body.style.overflow = ''; } }
  if (vaicAgreeBtn) vaicAgreeBtn.addEventListener('click', function () {
    try { localStorage.setItem('virorah_ai_consent_v1', '1'); localStorage.setItem('virorah_ai_consent_v1_at', new Date().toISOString()); } catch (e) {}
    vaicHide(); state.open = true; panel.classList.remove('hidden'); if (!state.welcomed) showWelcome();
    setTimeout(function () { if (input) input.focus(); if (pendingMessageAfterConsent) { var m = pendingMessageAfterConsent; pendingMessageAfterConsent = null; sendMessage(m); } }, 200);
  });
  if (vaicCancelBtn) vaicCancelBtn.addEventListener('click', vaicHide);
  if (vaicBackdrop) vaicBackdrop.addEventListener('click', function (e) { if (e.target === vaicBackdrop) vaicHide(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && vaicBackdrop && vaicBackdrop.classList.contains('is-active')) vaicHide(); });
  sendBtn.addEventListener('click', function () { sendMessage(); });
  input.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } });
  input.addEventListener('input', function () { this.style.height = 'auto'; this.style.height = Math.min(this.scrollHeight, 80) + 'px'; });
  state.pageCtx = getPageContext(); renderSuggestions(); maybeTriggerConcierge();

  /* ================= PAGE GUIDE ================= */
  var GICON = {
    map: 128506, house: 127968, info: 8505, book: 128218, clipboard: 128203,
    building: 127970, chart: 128202, cycle: 128260, report: 128195,
    search: 128269, gamepad: 127918, doc: 128196, masks: 127917,
    target: 127919, bolt: 9889, chartUp: 128200, inbox: 128229,
    trophy: 127942, speechBubble: 128172, arrowRight: 8594, check: 10003,
    cross: 10005, compass: 129517, memo: 128221, wrench: 128295, hammer: 128296
  };
  function gic(name) { return String.fromCodePoint(GICON[name]); }
  var TOUR_KEY = 'virorah_tour_v1', VISITED_KEY = 'virorah_visited_v1', PULSE_KEY = 'virorah_guide_pulsed_v1';

  var PAGES = {
  '/tour':{icon:gic('map'),module:'Platform Tour',what:'This page is your map, not another module to learn. Use it whenever you are not sure what to click next, first visit or fiftieth.',bullets:['Use the two buttons up top: full walkthrough, or jump straight to a tool','Scroll to the situation lookup if you already know your problem, just not the tool','The FAQ at the bottom covers what people actually get stuck on'],concept:'You are not supposed to memorise this platform. Come back here anytime you forget where something lives.'},
  '/home':{icon:gic('house'),module:'Home',what:'This is your starting point. Every calculator, scenario and tool on this page is live and clickable right now, nothing here is a placeholder.',bullets:['Bring a real situation to The Case Room, or build a team in FORGE, both are live','Or jump straight into a calculator, try 9-Box Grid or Bell Curve first','The stat pills above each link directly into that section'],concept:'This platform is built to be clicked into, not read through. If unsure where to start, The Case Room is the fastest way to see what makes this different.'},
  '/about':{icon:gic('info'),module:'About',what:'The story behind Virorah PMS and why it exists.',bullets:['This page is for context, not action','When ready to start, head back to Home','The Case Room is the fastest hands-on starting point'],concept:'Understanding why a tool exists makes it easier to trust what it tells you.'},
  '/case-room':{icon:gic('memo'),module:'The Case Room',what:'AI-powered coaching for a real performance situation on your desk right now. Runs your situation through PROBE, PROTOCOL, LEDGER, RESOLVE and gives you a complete action plan.',bullets:['Describe what has actually happened, the more specific the sharper the diagnosis','Read PROBE first, it tells you what kind of problem this really is','LEDGER gives you draft documentation language you can use today'],concept:'The right process only gets chosen after the right diagnosis. Most managers skip straight to action.'},
  '/forge':{icon:gic('bolt'),module:'Forge Simulation',what:'Learn how high performance actually works before you try to build it. 8 characters, 6 stages, real AI consequences to every decision.',bullets:['Read every character profile before deciding anything','The Brilliant Jerk is not always the problem you think','Stages 1 and 2 are free, start immediately'],concept:'Team performance is an output of psychological safety, clarity and accountability.'},
  '/forge-your-org':{icon:gic('wrench'),module:'Forge Your Org',what:'Score your actual team against 5 diagnostic conditions and get a 90-day playbook to fix what is broken, with real Humacity financial exposure figures.',bullets:['Answer honestly, the diagnosis is only as good as your input','Your primary constraint gets flagged first, start there','Download the playbook, it works outside this platform too'],concept:'Most teams are held back by one constraint at a time, not five problems at once.'},
  '/the-foundry':{icon:gic('hammer'),module:'The Foundry',what:'Build a genuinely extraordinary team from scratch, or intentionally redesign an existing one, across 6 research-backed conditions.',bullets:['Answer the fork question honestly, from scratch or reimagining changes the framing','Each stage gives you a downloadable artifact immediately, no need to finish all six','The combined Operating Kit at the end is yours to take into your real org'],concept:'Extraordinary teams are not accidents. Skunk Works, Pixar, SpaceX and ISRO all built the same handful of rare conditions on purpose.'},
  '/learning-hub':{icon:gic('book'),module:'Learning Hub',what:'Expert guides covering every major PMS framework. Theory first, execution second.',bullets:['Read "What is a PMS" first if you are new','Then "Bell Curve vs Forced Ranking"','Use guides to prep before running calculators'],concept:'The best practitioners combine framework knowledge with hands-on execution.'},
  '/case-studies':{icon:gic('clipboard'),module:'Case Studies',what:'Real stories of companies that got PMS right and catastrophically wrong. Free education from expensive mistakes.',bullets:['Read "The Year Everyone Was Exceptional" first','Note what systemic failure caused each outcome','Apply the lesson to your own org context'],concept:'PMS failures are almost always systemic, not individual.'},
  '/scenarios':{icon:gic('building'),module:'Scenarios',what:'15 pre-built companies, 750 employees each. Practice on someone else data with zero consequences.',bullets:['Pick TechCorp Solutions for your first run','Run the 9-Box Grid first, then Bell Curve','Try different scenarios to see how industry changes decisions'],concept:'Every org has a performance distribution. The shape of that curve tells you everything.'},
  '/scenarios-details':{icon:gic('chart'),module:'Scenario Calculators',what:'You are inside a live scenario. Every calculator on the platform runs on this page, organised by category in the left sidebar.',bullets:['Click any name in the sidebar to jump straight to that calculator','Collapse the sidebar with the arrow toggle for more working room','The Meta section holds PMS Health Index and What-If Planner, your cross-cutting tools'],concept:'Every calculator on this page reads the same scenario data, so insights from one tool should stay consistent with what you see in another.'},
  '/analyse-your-org':{icon:gic('chart'),module:'Analyse Your Org',what:'Upload your real employee CSV and run every calculator on your actual workforce. Your uploaded data never leaves your browser, no backend storage, no server uploads, no third-party sharing.',bullets:['Download the 14-column template first','Fill at least 10 rows to get meaningful results','Check the column mapping on the preview step'],concept:'Data-driven HR starts with clean, structured employee data.'},
  '/humacity-ledger':{icon:gic('bolt'),module:'Humacity: Value Ledger',what:'The financial ledger of your team human capital value. Four entries built on cited research (SHRM, McKinsey, Gallup): star retention cost, development investment, engagement premium, and flight risk exposure. Each entry has a Show Workings toggle.',bullets:['Open Show Workings on each entry to understand the formula behind the figure','Check the HCI panel to see how data confidence affects your numbers','Run all five Humacity tools in sequence for the complete picture'],concept:'Every people decision carries a financial consequence. Most organisations never quantify it.'},
  '/humacity-talent-premium':{icon:gic('bolt'),module:'Humacity: Talent Premium',what:'Computes the Talent Quality Premium score across 5 verdict areas using your uploaded employee data. Includes an HCI confidence panel and forward projection levers.',bullets:['Read the verdict areas in order, each one builds on the last','Use the projection levers to model what improving one area does to the overall TQP score','Compare your score to the benchmark before drawing conclusions'],concept:'Premium talent does not just perform better. It compounds over time.'},
  '/humacity-org-vitals':{icon:gic('bolt'),module:'Humacity: Org Vitals',what:'Twenty binary signals classify your organisation into one of 8 human capital DNA types, with 20 prescriptions assigned by timeframe and owner.',bullets:['Read your DNA type first before reviewing individual signals','Every prescription has an assigned owner and timeframe. Assign them immediately.','Run this after the Value Ledger to connect financial exposure to organisational signals'],concept:'Organisations fail slowly then suddenly. The warning signals are visible long before the outcome.'},
  '/humacity-human-pl':{icon:gic('bolt'),module:'Humacity: Human P&L',what:'A full income statement view of your workforce investment. Click-to-edit lines let you adjust assumptions and totals recalculate live.',bullets:['Read revenue lines first, then cost lines','Edit any assumption line to model a scenario in real time','Compare your People ROI figure to the benchmark shown'],concept:'If you cannot read a P&L, you cannot defend a headcount decision in a board meeting.'},
  '/humacity-balance-sheet':{icon:gic('bolt'),module:'Humacity: Balance Sheet',what:'Human capital assets versus liabilities in a two-column layout. Shows Net Human Capital, Asset Density, and a Humacity Score from 0 to 100.',bullets:['Net Human Capital is the headline number. Start there.','Asset Density tells you how efficiently capital is deployed per employee','The Humacity Score is your single composite benchmark across the full suite'],concept:'A balance sheet makes the invisible visible. Human capital is no different.'},
  '/review-cycle':{icon:gic('cycle'),module:'Review Cycle',what:'A full simulation of a 7-stage performance review cycle from planning to closure.',bullets:['Start at Stage 1 and do not skip ahead','Each stage builds on decisions from the last','Note where calibration changes your initial ratings'],concept:'A review cycle is a process, not an event.'},
  '/manager-report-card':{icon:gic('report'),module:'Manager Report Card',what:'Generate a one-page performance report card for any manager. Walk into leadership conversations with data, not opinions.',bullets:['Select any manager from your loaded scenario','Generate their card first','Read the flight risk and team health sections first'],concept:'Manager effectiveness is measurable. The best HRBPs bring evidence.'},
  '/bias-audit':{icon:gic('search'),module:'Bias Audit',what:'AI-powered analysis that detects hidden bias patterns in your rating distributions. Most biased systems look normal on the surface.',bullets:['Load a scenario with at least 50 employees','Run the full audit before checking individual sections','Start with gender gap analysis, then recency bias'],concept:'Unconscious bias in ratings distorts pay, promotion, succession and team composition, not just diversity outcomes.'},
  '/game':{icon:gic('gamepad'),module:'Manager Game',what:'Rate 12 employees, allocate budget, defend calibration, handle 2 difficult conversations. Scored out of 100.',bullets:['Do not overthink Round 1, rate instinctively','The debrief shows where your instincts are wrong','Play twice to see how much your score improves'],concept:'Calibration is where good intentions meet budget reality.'},
  '/templates':{icon:gic('doc'),module:'Templates',what:'25 ready-to-use HR documents, PIPs, review forms, calibration guides, feedback templates.',bullets:['Download the PIP template first, most legally sensitive','Read each template before customising it','Use templates as a baseline, not a final document'],concept:'Good process documentation is the difference between a defensible decision and a legal liability.'},
  '/simulate':{icon:gic('masks'),module:'Simulate',what:'An AI plays your employee. You play the manager. Every session scored on empathy, clarity, legal safety and outcome.',bullets:['Start with Marcus the Aggressor, Promotion Denial','Do the hard scenario first while you are fresh','Read the full debrief, the scores show exactly where you failed'],concept:'How a manager delivers a message matters as much as the message itself.'},
  '/goal-lab':{icon:gic('target'),module:'Goal Lab',what:'AI diagnoses your goals before you cascade them. Catches weak, vague and unmeasurable goals before year-end.',bullets:['Type 3 real goals you have written recently','Run the diagnosis before writing any new goals','Fix flagged goals before moving to cascade'],concept:'A goal that cannot be measured cannot be managed.'},
  '/my-progress':{icon:gic('chartUp'),module:'My Progress',what:'Your personal learning dashboard, certifications earned, modules completed, recommended next steps.',bullets:['Check your completion percentage first','Any module under 50% means there is more to discover','Use recommended next steps as your learning queue'],concept:'Professional development in HR is self-directed.'},
  '/downloads':{icon:gic('inbox'),module:'Downloads',what:'Professional-grade Excel templates and toolkits, OKR Flagship Planner, PMS templates, calibration guides.',bullets:['Download the OKR Flagship Planner first','Open it and read the Scoring Guide tab first','Use these templates in your real org, they are production-grade'],concept:'Enterprise PMS tools exist. Most HR professionals just do not have access. Now you do.'},
  '/certify':{icon:gic('trophy'),module:'Certifications',what:'4 industry certifications, Fundamentals, Advanced, Practitioner, Portfolio. Unique credential IDs, LinkedIn-ready.',bullets:['Take Fundamentals first even if you feel ready for Advanced','The gap will surprise you','Add your credential to LinkedIn the same day'],concept:'Certification without practice is just a badge. Now you have both.'},
  '/pricing':{icon:gic('chartUp'),module:'Pricing',what:'Free access to core tools. Pro unlocks all 16 calculators, real org data, certifications, AI simulations, The Case Room, Forge Your Org and The Foundry.',bullets:['Free tier: OKR, 9-Box, Bell Curve calculators, plus Stages 1-2 of Forge Simulation','Pro: everything, permanently unlocked on your browser','One key works on any device'],concept:'The best investment in your HR career gives you tools to practice what you know in theory.'},
  '/pulse':{icon:gic('speechBubble'),module:'User Pulse',what:'Share your experience directly with the founder. Every response is read personally and shapes what gets built next.',bullets:['Be brutally honest, critical feedback is most valuable','Takes 3 minutes to complete','Your role and experience help us understand your context'],concept:'Products built on real user feedback survive. Your voice matters here.'}

  };
  var TOUR_SEQUENCE = ['/case-room','/forge','/forge-your-org','/the-foundry','/scenarios','/analyse-your-org','/bias-audit','/goal-lab','/simulate'];
  var NEXT_MAP = {
  '/tour':                    '/case-room',
  '/home':                    '/case-room',
  '/about':                   '/case-room',
  '/case-room':               '/forge',
  '/forge':                   '/forge-your-org',
  '/forge-your-org':          '/the-foundry',
  '/the-foundry':             '/scenarios',
  '/learning-hub':            '/case-studies',
  '/case-studies':            '/case-room',
  '/scenarios':               '/analyse-your-org',
  '/analyse-your-org':        '/humacity-ledger',
  '/humacity-ledger':         '/humacity-talent-premium',
  '/humacity-talent-premium': '/humacity-org-vitals',
  '/humacity-org-vitals':     '/humacity-human-pl',
  '/humacity-human-pl':       '/humacity-balance-sheet',
  '/humacity-balance-sheet':  '/review-cycle',
  '/review-cycle':            '/manager-report-card',
  '/manager-report-card':     '/bias-audit',
  '/bias-audit':              '/goal-lab',
  '/goal-lab':                '/simulate',
  '/simulate':                '/game',
  '/game':                    '/templates',
  '/templates':                '/downloads',
  '/downloads':                '/certify',
  '/certify':                  '/my-progress',
  '/my-progress':              '/certify',
  '/pricing':                  '/case-room',
  '/pulse':                    '/case-room'
  };

  var cardOpen = false;
  var SPOTLIGHTS = { '/home': '.hph-btn-p' };
  function ensureSpotlightEl() { var el = document.getElementById('vg-spotlight'); if (!el) { el = document.createElement('div'); el.id = 'vg-spotlight'; el.className = 'vg-spotlight-ring'; document.body.appendChild(el); } return el; }
  function positionSpotlight(sel) {
    var target = document.querySelector(sel), el = ensureSpotlightEl();
    if (!target) { el.classList.remove('vg-spot-active'); return; }
    var r = target.getBoundingClientRect(), pad = 6;
    el.style.top = (r.top - pad) + 'px'; el.style.left = (r.left - pad) + 'px';
    el.style.width = (r.width + pad * 2) + 'px'; el.style.height = (r.height + pad * 2) + 'px';
    el.classList.add('vg-spot-active');
  }
  function removeSpotlight() { var el = document.getElementById('vg-spotlight'); if (el) el.classList.remove('vg-spot-active'); }
  function getTourState() { try { return localStorage.getItem(TOUR_KEY) === '1'; } catch (e) { return false; } }
  function getVisited() { try { return JSON.parse(localStorage.getItem(VISITED_KEY) || '[]'); } catch (e) { return []; } }
  function markVisited(path) { try { var v = getVisited(); if (v.indexOf(path) === -1) { v.push(path); localStorage.setItem(VISITED_KEY, JSON.stringify(v)); } } catch (e) {} }
  function isFirstVisit(path) { return getVisited().indexOf(path) === -1; }
  function getTourStep(path) { var i = TOUR_SEQUENCE.indexOf(path); return i === -1 ? -1 : i + 1; }
  function getNextTourPath(path) { var i = TOUR_SEQUENCE.indexOf(path); if (i === -1 || i >= TOUR_SEQUENCE.length - 1) return null; return TOUR_SEQUENCE[i + 1]; }
  function getPageName(path) { var p = PAGES[path]; return p ? p.module : path.replace('/', '').replace(/-/g, ' '); }

  function buildPageHTML(path) {
    var page = PAGES[path]; if (!page) return null;
    var tourActive = getTourState(), step = getTourStep(path), isInTour = tourActive && step > -1;
    var nextPath = isInTour ? getNextTourPath(path) : null, totalSteps = TOUR_SEQUENCE.length;
    var pct = isInTour ? (step / totalSteps) * 100 : 0;
    var bullets = page.bullets.map(function (b) { return '<div class="vg-bullet"><span class="vg-bullet-arrow">' + gic('arrowRight') + '</span><span>' + b + '</span></div>'; }).join('');
    var stepLabel = isInTour ? ('GUIDED TOUR - STEP ' + step + ' OF ' + totalSteps) : 'PAGE GUIDE';
    var logicalNext = NEXT_MAP[path] || null, footer = '';
    if (isInTour && nextPath) footer = '<button class="vg-btn-skip" data-action="vg-skip-tour">Skip</button><button class="vg-btn-next" data-action="vg-next" data-next="' + nextPath + '">Next: ' + getPageName(nextPath) + ' ' + gic('arrowRight') + '</button>';
    else if (isInTour && !nextPath) footer = '<button class="vg-btn-next" data-action="vg-done">Tour Complete ' + gic('check') + '</button>';
    else if (logicalNext) footer = '<button class="vg-btn-skip" data-action="vg-close">Got it</button><button class="vg-btn-next" data-action="vg-next" data-next="' + logicalNext + '">Next: ' + getPageName(logicalNext) + ' ' + gic('arrowRight') + '</button>';
    else footer = '<button class="vg-btn-help" data-action="vg-close">Got it</button>';
    return '<div class="vg-card-top"><div class="vg-card-top-left"><div class="vg-card-icon">' + page.icon + '</div><div><div class="vg-card-module">' + page.module + '</div><div class="vg-card-step">' + stepLabel + '</div></div></div><button class="vg-card-close" data-action="vg-close">' + gic('cross') + '</button></div>' +
      '<div class="vg-progress-wrap"><div class="vg-progress-fill" style="width:' + pct + '%;"></div></div>' +
      '<div class="vg-card-body"><div class="vg-what">' + page.what + '</div><div class="vg-bullets">' + bullets + '</div><div class="vg-concept"><div class="vg-concept-label">PMS Concept</div><div>' + page.concept + '</div></div></div>' +
      '<div class="vg-card-footer">' + footer + '</div>';
  }
  function openCard() {
    var path = currentPath(), inner = document.getElementById('vg-inner'), card = document.getElementById('vg-card');
    if (!inner || !card) return;
    var html = buildPageHTML(path); if (!html) return;
    inner.innerHTML = html; cardOpen = true; card.classList.add('vg-open');
    if (SPOTLIGHTS[path] && isFirstVisit(path)) setTimeout(function () { positionSpotlight(SPOTLIGHTS[path]); }, 100);
  }
  function closeCard() {
    cardOpen = false; var card = document.getElementById('vg-card'); if (card) card.classList.remove('vg-open'); removeSpotlight();
    if (conciergePending) { conciergePending = false; setTimeout(openConcierge, 900); }
  }
  function toggleCard() { if (cardOpen) closeCard(); else openCard(); }
  window.addEventListener('resize', function () { if (cardOpen) { var p = currentPath(); if (SPOTLIGHTS[p]) positionSpotlight(SPOTLIGHTS[p]); } });

  document.addEventListener('click', function (e) {
    var el = e.target;
    while (el && el !== document) {
      var action = el.getAttribute && el.getAttribute('data-action');
      if (action && action.indexOf('vg-') === 0) {
        if (action === 'vg-toggle') { e.preventDefault(); toggleCard(); return; }
        if (action === 'vg-close') { e.preventDefault(); closeCard(); markVisited(currentPath()); return; }
        if (action === 'vg-skip-tour') { e.preventDefault(); closeCard(); try { localStorage.setItem(TOUR_KEY, '1'); } catch (ex) {} return; }
        if (action === 'vg-next') { e.preventDefault(); var next = el.getAttribute('data-next'); closeCard(); markVisited(currentPath()); if (next) window.location.href = hrefFor(next); return; }
        if (action === 'vg-done') { e.preventDefault(); closeCard(); try { localStorage.setItem(TOUR_KEY, '1'); } catch (ex) {} markVisited(currentPath()); return; }
      }
      el = el.parentElement;
    }
  }, true);

  function vgInit() {
    var path = currentPath(), btn = document.getElementById('vg-btn');
    if (!PAGES[path]) { if (btn) btn.style.display = 'none'; return; }   /* no guide written for this page */
    if (btn) btn.style.display = 'flex';
    try {
      if (!localStorage.getItem(PULSE_KEY) && btn) {
        btn.classList.add('vg-pulse'); setTimeout(function () { btn.classList.remove('vg-pulse'); }, 7000);
        localStorage.setItem(PULSE_KEY, '1');
      }
    } catch (ex) {}
    if (isFirstVisit(path)) setTimeout(openCard, 1200);
  }
  setTimeout(vgInit, 500);
})();
