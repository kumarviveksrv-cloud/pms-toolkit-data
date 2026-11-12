/* Command palette (Cmd/Ctrl+K), ported from Softr global footer.
   Injects its own trigger button and modal markup. Styles: /assets/css/cmdk.css.
   Paths remapped to /pages/*.html. Calculator entries jump to scenarios-details. */
(function () {
  function mountMarkup() {
    if (document.getElementById('cmdk-trigger')) return;
    var wrap = document.createElement('div');
    wrap.innerHTML =
      '<button id="cmdk-trigger" title="Search (Cmd+K)">' +
      '<span style="font-size:13px;">&#128269;</span><span>Search</span>' +
      '<span class="cmdk-trigger-kbd" id="cmdk-trigger-kbd">&#8984;K</span></button>' +
      '<div id="cmdk-backdrop"><div id="cmdk-modal"><div id="cmdk-input-wrap">' +
      '<span style="color:rgba(165,180,252,.4);font-size:14px;">&#8981;</span>' +
      '<input id="cmdk-input" type="text" placeholder="Jump to any calculator or page..." autocomplete="off">' +
      '<span id="cmdk-hint">ESC</span></div><div id="cmdk-list"></div></div></div>';
    var slot = document.querySelector('.pms-topbar-actions');
    while (wrap.firstChild) {
      var node = wrap.firstChild;
      if (slot && node.id === 'cmdk-trigger') slot.appendChild(node);
      else document.body.appendChild(node);
    }
  }
  function boot() {
    mountMarkup();
(function(){
  var CMDK_DESTINATIONS = [
    {label:'Home', cat:'Page', path:'/pages/home.html'},
    {label:'The Case Room', cat:'Page', path:'/pages/case-room.html'},
    {label:'Forge Simulation', cat:'Page', path:'/pages/forge.html'},
    {label:'Forge Your Org', cat:'Page', path:'/pages/forge-your-org.html'},
    {label:'The Foundry', cat:'Page', path:'/pages/the-foundry.html'},
    {label:'About', cat:'Page', path:'/pages/about.html'},
    {label:'Platform Tour', cat:'Page', path:'/pages/tour.html'},
    {label:'Learning Hub', cat:'Page', path:'/pages/learning-hub.html'},
    {label:'Case Studies', cat:'Page', path:'/pages/case-studies.html'},
    {label:'Scenarios', cat:'Page', path:'/pages/scenarios.html'},
    {label:'Analyse Your Org', cat:'Page', path:'/pages/analyse-your-org.html'},
    {label:'Humacity: Value Ledger', cat:'Page', path:'/pages/humacity-ledger.html'},
    {label:'Humacity: Talent Premium', cat:'Page', path:'/pages/humacity-talent-premium.html'},
    {label:'Humacity: Org Vitals', cat:'Page', path:'/pages/humacity-org-vitals.html'},
    {label:'Humacity: Human P&L', cat:'Page', path:'/pages/humacity-human-pl.html'},
    {label:'Humacity: Balance Sheet', cat:'Page', path:'/pages/humacity-balance-sheet.html'},
    {label:'Review Cycle', cat:'Page', path:'/pages/review-cycle.html'},
    {label:'Manager Report Card', cat:'Page', path:'/pages/manager-report-card.html'},
    {label:'Bias Audit', cat:'Page', path:'/pages/bias-audit.html'},
    {label:'Goal Lab', cat:'Page', path:'/pages/goal-lab.html'},
    {label:'Simulate', cat:'Page', path:'/pages/simulate.html'},
    {label:'Manager Game', cat:'Page', path:'/pages/game.html'},
    {label:'Build Your 9-Box', cat:'Page', path:'/pages/build-9box.html'},
    {label:'Org Health Report', cat:'Page', path:'/pages/org-health.html'},
    {label:'Spatial 3D', cat:'Page', path:'/pages/spatial-3d.html'},
    {label:'Spatial 9-Box', cat:'Page', path:'/pages/spatial-9box.html'},
    {label:'Templates', cat:'Page', path:'/pages/templates.html'},
    {label:'Downloads', cat:'Page', path:'/pages/downloads.html'},
    {label:'Certifications', cat:'Page', path:'/pages/certifications.html'},
    {label:'My Progress', cat:'Page', path:'/pages/progress.html'},
    {label:'Pricing', cat:'Page', path:'/pages/pricing.html'},
    {label:'User Pulse', cat:'Page', path:'/pages/pulse.html'},
    {label:'OKR Tracker', cat:'Calculator', target:'okr-wrap'},
    {label:'OKR Simulator', cat:'Calculator', target:'okrsim-wrap'},
    {label:'OKR Calculator', cat:'Calculator', target:'okrcalc-wrap'},
    {label:'9-Box Grid', cat:'Calculator', target:'nb-container'},
    {label:'Bell Curve', cat:'Calculator', target:'bellcurve-container'},
    {label:'Balanced Scorecard', cat:'Calculator', target:'bsc-root'},
    {label:'360 Feedback', cat:'Calculator', target:'f360-container'},
    {label:'Increment Engine', cat:'Calculator', target:'increment-container'},
    {label:'Comp Equity Analyser', cat:'Calculator', target:'ceq-container'},
    {label:'Manager Dashboard', cat:'Calculator', target:'mgr-container'},
    {label:'DEI Analytics', cat:'Calculator', target:'dei-container'},
    {label:'Succession Planner', cat:'Calculator', target:'suc-container'},
    {label:'PIP Tracker', cat:'Calculator', target:'pip-container'},
    {label:'Calibration Engine', cat:'Calculator', target:'cal-container'},
    {label:'PMS Health Index', cat:'Calculator', target:'phi-root'},
    {label:'What-If Planner', cat:'Calculator', target:'wi-root'}
  ];

  var backdrop = document.getElementById('cmdk-backdrop');
  var input = document.getElementById('cmdk-input');
  var list = document.getElementById('cmdk-list');
  var trigger = document.getElementById('cmdk-trigger');
  var triggerKbd = document.getElementById('cmdk-trigger-kbd');
  if(!backdrop || !input || !list) return;

  if(document.getElementById('bg-canvas')){
    if(trigger) trigger.style.display = 'none';
    return;
  }

  var isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  if(triggerKbd) triggerKbd.textContent = isMac ? '\u2318K' : 'Ctrl K';
  var hintEl = document.getElementById('cmdk-hint');
  if(hintEl) hintEl.textContent = 'ESC';

  var activeIndex = 0;
  var filtered = CMDK_DESTINATIONS.slice();

  function isPmsPage(){ return window.location.href.indexOf('scenarios-details')!==-1; }

  function render(){
    list.innerHTML = '';
    if(filtered.length===0){
      list.innerHTML = '<div id="cmdk-empty">No matches</div>';
      return;
    }
    filtered.forEach(function(item, i){
      var el = document.createElement('div');
      el.className = 'cmdk-item' + (i===activeIndex ? ' active' : '');
      el.innerHTML = '<span>'+item.label+'</span><span class="cmdk-item-cat">'+item.cat+'</span>';
      el.addEventListener('mouseenter', function(){ activeIndex = i; render(); });
      el.addEventListener('mousedown', function(e){ e.preventDefault(); select(item); });
      list.appendChild(el);
    });
  }

  function select(item){
    close();
    if(item.target){
      if(isPmsPage()){
        var t = document.getElementById(item.target);
        if(t) setTimeout(function(){ t.scrollIntoView({behavior:'smooth',block:'start'}); }, 60);
      } else {
        try{ sessionStorage.setItem('vg_pending_scroll', item.target); }catch(e){}
        window.location.href = '/pages/scenarios-details.html';
      }
    } else if(item.path){
      window.location.href = item.path;
    }
  }

  // Arrived from another page via a calculator entry: scroll to it once the calculator has rendered
  (function(){
    var id=null;
    try{ id=sessionStorage.getItem('vg_pending_scroll'); }catch(e){}
    if(!id || !isPmsPage()) return;
    try{ sessionStorage.removeItem('vg_pending_scroll'); }catch(e){}
    var tries=0, iv=setInterval(function(){
      var t=document.getElementById(id);
      if(t && t.offsetHeight>0){ clearInterval(iv); t.scrollIntoView({behavior:'smooth',block:'start'}); }
      else if(++tries>40){ clearInterval(iv); }
    },250);
  })();

  function openPalette(){
    backdrop.classList.add('active');
    input.value = '';
    filtered = CMDK_DESTINATIONS.slice();
    activeIndex = 0;
    render();
    setTimeout(function(){ input.focus(); }, 10);
  }

  function closePalette(){
    backdrop.classList.remove('active');
  }
  function close(){ closePalette(); }

  document.addEventListener('keydown', function(e){
    var isK = (e.key==='k' || e.key==='K');
    if((e.metaKey||e.ctrlKey) && isK){
      e.preventDefault();
      if(backdrop.classList.contains('active')) closePalette(); else openPalette();
      return;
    }
    if(!backdrop.classList.contains('active')) return;
    if(e.key==='Escape'){ closePalette(); return; }
    if(e.key==='ArrowDown'){ e.preventDefault(); activeIndex = Math.min(activeIndex+1, filtered.length-1); render(); return; }
    if(e.key==='ArrowUp'){ e.preventDefault(); activeIndex = Math.max(activeIndex-1, 0); render(); return; }
    if(e.key==='Enter'){ e.preventDefault(); if(filtered[activeIndex]) select(filtered[activeIndex]); return; }
  });

  input.addEventListener('input', function(){
    var q = input.value.toLowerCase().trim();
    filtered = q === '' ? CMDK_DESTINATIONS.slice() : CMDK_DESTINATIONS.filter(function(item){
      return item.label.toLowerCase().indexOf(q) !== -1;
    });
    activeIndex = 0;
    render();
  });

  backdrop.addEventListener('mousedown', function(e){ if(e.target===backdrop) closePalette(); });

  if(trigger){
    trigger.addEventListener('click', openPalette);
    try{
      if(localStorage.getItem('virorah_cmdk_hint_seen_v1') !== '1'){
        setTimeout(function(){
          trigger.classList.add('cmdk-pulse');
          localStorage.setItem('virorah_cmdk_hint_seen_v1', '1');
        }, 2000);
      }
    }catch(e){}
  }
})();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
