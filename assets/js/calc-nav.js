/**
 * Virorah PMS - Calculator navigator for the Scenario Calculators page.
 * Ported from the Softr footer ("CALCULATOR LEFT NAV"). Same grouping, order, colours and badges.
 * Differences: it sits next to the main sidebar instead of covering it, pushes the page over,
 * and highlights the calculator you are currently reading as you scroll.
 */
(function () {
  'use strict';
  if (window.__pmsCalcNav) return;
  window.__pmsCalcNav = true;

  var GROUPS = [
    { label: 'OKR Suite', color: 'blue', items: [
      ['OKR Tracker', 'okr-wrap', 'PRO'], ['OKR Simulator', 'okrsim-wrap', 'PRO'], ['OKR Calculator', 'okrcalc-wrap', 'PRO'] ] },
    { label: 'Performance', color: 'green', items: [
      ['9-Box Grid', 'nb-container', 'FREE'], ['Bell Curve', 'bellcurve-container', 'FREE'],
      ['Balanced Scorecard', 'bsc-root', 'PRO'], ['360 Feedback', 'f360-container', 'PRO'] ] },
    { label: 'Compensation', color: 'orange', items: [
      ['Increment Engine', 'increment-container', 'PRO'], ['Comp Equity Analyser', 'ceq-container', 'PRO'] ] },
    { label: 'Talent Management', color: 'pink', items: [
      ['Manager Dashboard', 'mgr-container', 'PRO'], ['DEI Analytics', 'dei-container', 'PRO'], ['Succession Planner', 'suc-container', 'PRO'] ] },
    { label: 'Operations', color: 'violet', items: [
      ['PIP Tracker', 'pip-container', 'PRO'], ['Calibration Engine', 'cal-container', 'PRO'] ] },
    { label: 'Meta', color: 'teal', items: [
      ['PMS Health Index', 'phi-root', 'PRO'], ['What-If Planner', 'wi-root', 'PRO'] ] }
  ];

  var CSS = [
    '#pms-leftnav{position:fixed;top:0;left:0;width:220px;height:100vh;background:#0d0f1e;border-right:.5px solid rgba(255,255,255,.07);overflow-y:auto;z-index:130;display:flex;flex-direction:column;padding:20px 12px 32px;box-sizing:border-box;transition:transform .2s ease;}',
        'body.pms-calcnav-closed #pms-leftnav{transform:translateX(-100%);} body.pms-calcnav-closed:not(.pms-collapsed) #pms-leftnav{transform:translateX(-462px);}',
    '#pms-leftnav::-webkit-scrollbar{width:5px;} #pms-leftnav::-webkit-scrollbar-thumb{background:rgba(124,108,220,.45);border-radius:4px;}',
    '#pms-leftnav-back{display:flex;align-items:center;gap:6px;margin:0 0 14px;padding:8px 10px;border-radius:8px;background:rgba(102,126,234,.1);border:.5px solid rgba(102,126,234,.25);color:#c7d2fe;font-size:12.5px;font-weight:600;text-decoration:none;font-family:Commissioner,Inter,sans-serif;}',
    '#pms-leftnav-back:hover{background:rgba(102,126,234,.2);color:#fff;}',
    '#pms-leftnav-header{margin-bottom:20px;padding-bottom:14px;border-bottom:.5px solid rgba(255,255,255,.07);}',
    '#pms-leftnav-title{font-size:11px;font-weight:500;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:.1em;font-family:sans-serif;}',
    '#pms-leftnav-toggle{position:fixed;top:50%;left:220px;transform:translateY(-50%);width:20px;height:56px;background:#1a1d2e;border:none;border-radius:0 8px 8px 0;color:#fff;font-size:18px;cursor:pointer;z-index:131;display:flex;align-items:center;justify-content:center;font-family:sans-serif;transition:background .15s,left .2s ease;}',
    '#pms-leftnav-toggle:hover{background:#252840;}',
        'body.pms-calcnav-closed #pms-leftnav-toggle{left:var(--nav-width,242px);} body.pms-calcnav-closed.pms-collapsed #pms-leftnav-toggle{left:0;}',
    'body.pms-has-calcnav:not(.pms-calcnav-closed) .pms-sidebar{visibility:hidden;}',
    /* live PMS parity: Softr wraps every calculator in a 1140px centred column with 64px side padding */
    'body.pms-has-calcnav .pms-content{max-width:none;padding-top:80px;padding-left:64px;padding-right:64px;color:#e2d9f3;display:flex;flex-direction:column;line-height:1.5;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;}',
    'body.pms-has-calcnav #sch3,body.pms-has-calcnav #viorah-pro-banner,body.pms-has-calcnav #okr-wrap,body.pms-has-calcnav #okrsim-wrap,body.pms-has-calcnav #okrcalc-wrap,body.pms-has-calcnav #nb-container,body.pms-has-calcnav #bellcurve-container,body.pms-has-calcnav #bsc-root,body.pms-has-calcnav #f360-container,body.pms-has-calcnav #increment-container,body.pms-has-calcnav #ceq-container,body.pms-has-calcnav #mgr-container,body.pms-has-calcnav #dei-container,body.pms-has-calcnav #suc-container,body.pms-has-calcnav #pip-container,body.pms-has-calcnav #cal-container,body.pms-has-calcnav #phi-root,body.pms-has-calcnav #wi-root{width:100%;max-width:1140px;margin-left:auto;margin-right:auto;box-sizing:border-box;}',
    ':where(body.pms-has-calcnav .pms-content) :where(h1,h2,h3,h4,h5,h6){line-height:1.2;}',
    'body.pms-has-calcnav .pms-main{margin-left:calc(var(--nav-width,242px) + 0px);transition:margin-left .2s ease;}',
    'body.pms-has-calcnav.pms-collapsed .pms-main{margin-left:220px;}',
    'body.pms-has-calcnav.pms-calcnav-closed .pms-main{margin-left:var(--nav-width,242px);} body.pms-has-calcnav.pms-calcnav-closed.pms-collapsed .pms-main{margin-left:0;}',
    '.pms-cn-section{margin-bottom:16px;}',
    '.pms-cn-label{font-size:9px;text-transform:uppercase;letter-spacing:.1em;font-family:sans-serif;font-weight:600;margin-bottom:4px;padding-left:8px;}',
    '.pms-cn-item{width:100%;text-align:left;padding:6px 10px;border-radius:6px;cursor:pointer;font-size:12px;font-family:sans-serif;display:flex;align-items:center;justify-content:space-between;margin-bottom:2px;border:none;background:transparent;color:rgba(255,255,255,.65);transition:background .1s,color .1s;white-space:nowrap;overflow:hidden;}',
    '.pms-cn-item:hover{background:rgba(255,255,255,.08);color:#fff;}',
    '.pms-cn-badge{font-size:7px;font-weight:800;letter-spacing:.5px;text-transform:uppercase;padding:2px 5px;border-radius:3px;margin-left:5px;flex-shrink:0;}',
    '.pms-cn-free{background:rgba(52,211,153,.15);border:1px solid rgba(52,211,153,.3);color:#34d399;}',
    '.pms-cn-pro{background:rgba(102,126,234,.12);border:1px solid rgba(102,126,234,.25);color:rgba(165,180,252,.7);}',
    '.pms-cn-item.on{color:#fff;font-weight:500;}',
    '.pms-cn-item.on.c-purple{background:rgba(167,139,250,.15);color:#d4bbff;} .pms-cn-item.on.c-blue{background:rgba(96,165,250,.12);color:#bfdbfe;}',
    '.pms-cn-item.on.c-green{background:rgba(52,211,153,.12);color:#a7f3d0;} .pms-cn-item.on.c-orange{background:rgba(251,146,60,.12);color:#fed7aa;}',
    '.pms-cn-item.on.c-pink{background:rgba(244,114,182,.12);color:#fbcfe8;} .pms-cn-item.on.c-violet{background:rgba(232,121,249,.12);color:#f5d0fe;}',
    '.pms-cn-item.on.c-teal{background:rgba(20,184,166,.14);color:#99f6e4;}',
    '.l-purple{color:#a78bfa;} .l-blue{color:#60a5fa;} .l-green{color:#34d399;} .l-orange{color:#fb923c;} .l-pink{color:#f472b6;} .l-violet{color:#e879f9;} .l-teal{color:#5eead4;}',
    /* small screens: overlay, closed by default */
    '@media (max-width:900px){#pms-leftnav{left:0;z-index:120;} body.pms-has-calcnav .pms-main{margin-left:0 !important;} #pms-leftnav-toggle{left:220px;} body.pms-calcnav-closed #pms-leftnav{transform:translateX(-100%) !important;} body.pms-calcnav-closed #pms-leftnav-toggle{left:0 !important;} html body.pms-has-calcnav #vg-btn, html body.pms-has-calcnav #vg-card{left:20px !important;}}'
  ].join('\n');

  function build() {
    if (!document.querySelector('.pms-main')) return;
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    var nav = document.createElement('nav'); nav.id = 'pms-leftnav'; nav.setAttribute('aria-label', 'Calculator navigation');
    var html = '<a id="pms-leftnav-back" href="/pages/scenarios.html">&#8592; All scenarios</a><div id="pms-leftnav-header"><span id="pms-leftnav-title">Calculators</span></div>';
    GROUPS.forEach(function (g) {
      html += '<div class="pms-cn-section"><div class="pms-cn-label l-' + g.color + '">' + g.label + '</div>';
      g.items.forEach(function (it) {
        html += '<button type="button" class="pms-cn-item c-' + g.color + '" data-target="' + it[1] + '">' + it[0] +
          '<span class="pms-cn-badge ' + (it[2] === 'FREE' ? 'pms-cn-free' : 'pms-cn-pro') + '">' + it[2] + '</span></button>';
      });
      html += '</div>';
    });
    nav.innerHTML = html;
    var tog = document.createElement('button'); tog.id = 'pms-leftnav-toggle'; tog.type = 'button';
    tog.setAttribute('aria-label', 'Toggle calculator nav');
    document.body.appendChild(nav); document.body.appendChild(tog);
    document.body.classList.add('pms-has-calcnav');

    var closed = window.innerWidth <= 900;
    try { var s = localStorage.getItem('pms_calcnav_closed'); if (s !== null && window.innerWidth > 900) closed = s === '1'; } catch (e) {}
    function setClosed(c) {
      closed = c; document.body.classList.toggle('pms-calcnav-closed', c);
      tog.innerHTML = c ? '&#8250;' : '&#8249;';
      try { localStorage.setItem('pms_calcnav_closed', c ? '1' : '0'); } catch (e) {}
    }
    setClosed(closed);
    tog.addEventListener('click', function () { setClosed(!closed); });

    var items = [].slice.call(nav.querySelectorAll('.pms-cn-item'));
    function mark(btn) { items.forEach(function (b) { b.classList.toggle('on', b === btn); }); }
    items.forEach(function (btn) {
      btn.addEventListener('click', function () {
        mark(btn);
        var t = document.getElementById(btn.getAttribute('data-target'));
        if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (window.innerWidth <= 900) setClosed(true);
      });
    });

    /* highlight the calculator currently being read */
    var ticking = false;
    function spy() {
      ticking = false;
      var cur = null;
      items.forEach(function (b) {
        var el = document.getElementById(b.getAttribute('data-target'));
        if (el && el.getBoundingClientRect().top <= 140) cur = b;
      });
      if (cur) mark(cur);
      var on = nav.querySelector('.pms-cn-item.on');
      if (on && !closed) {
        var r = on.getBoundingClientRect();
        if (r.top < 60 || r.bottom > window.innerHeight - 20) nav.scrollTop += r.top - window.innerHeight / 2;
      }
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(spy); } }, { passive: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();

  /* live PMS parity: every Softr custom-code block carries 24px of section spacing above and below */
  (function () {
    var BLOCKS = ['sch3','viorah-pro-banner','okr-wrap','okrsim-wrap','okrcalc-wrap','nb-container','bellcurve-container','bsc-root','f360-container','increment-container','ceq-container','mgr-container','dei-container','suc-container','pip-container','cal-container','phi-root','wi-root','okrgalaxy-wrap','sbc-root','ceq-3d-root','dei-3d-root','suc-3d-root','cal-3d-root','cg-root'];
    /* measured leftovers vs live: empty Softr blocks / 3D block chrome that sit above these sections */
    var EXTRA = { 'sch3': 8, 'ceq-container': 48, 'dei-container': 48, 'phi-root': 43, 'bsc-root': 48, 'mgr-container': 22, 'pip-container': 22 };
    function spaceBlocks() {
      BLOCKS.forEach(function (id) {
        var el = document.getElementById(id);
        if (!el || el.getAttribute('data-pms-sp')) return;
        var cs = getComputedStyle(el);
        var mt = parseFloat(cs.marginTop) || 0, mb = parseFloat(cs.marginBottom) || 0;
        el.style.marginTop = (mt + 24 + (EXTRA[id] || 0)) + 'px';
        el.style.marginBottom = (mb + 24) + 'px';
        el.setAttribute('data-pms-sp', '1');
      });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', spaceBlocks); else spaceBlocks();
  })();
})();
