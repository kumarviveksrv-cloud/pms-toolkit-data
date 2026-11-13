/* Legal link bar (ported from Softr global footer). Paths updated to /pages/*.html. */
(function () {
  function mount() {
    if (document.getElementById('viorah-legal-link')) return;
    var links = [
      ['About', '/pages/about.html'],
      ['info@virorah.com', 'mailto:info@virorah.com'],
      ['Privacy Policy', '/pages/legal.html'],
      ['Terms of Service', '/pages/terms.html']
    ];
    var bar = document.createElement('div');
    bar.id = 'viorah-legal-link';
    bar.style.cssText = "position:fixed;bottom:10px;left:50%;transform:translateX(-50%);z-index:88000;font-family:'DM Sans',-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:6px 16px;max-width:calc(100vw - 24px);padding:6px 16px;border-radius:999px;background:rgba(8,6,18,.88);border:1px solid rgba(102,126,234,.14);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);";
    /* centre on the content area, not the whole window (sidebar is 256px on desktop) */
    var place = function () { bar.style.left = (window.innerWidth > 900 && !document.body.classList.contains('pms-collapsed')) ? 'calc(50% + 121px)' : '50%'; };
    new MutationObserver(place).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    place(); window.addEventListener('resize', place);
    links.forEach(function (l, i) {
      if (i) {
        var dot = document.createElement('span');
        dot.style.cssText = 'font-size:11px;color:rgba(165,180,252,.2);';
        dot.innerHTML = '&middot;';
        bar.appendChild(dot);
      }
      var a = document.createElement('a');
      a.href = l[1];
      a.textContent = l[0];
      a.style.cssText = 'font-size:11px;color:rgba(165,180,252,.35);text-decoration:none;transition:color .2s;white-space:nowrap;';
      a.onmouseover = function () { a.style.color = 'rgba(165,180,252,.7)'; };
      a.onmouseout = function () { a.style.color = 'rgba(165,180,252,.35)'; };
      bar.appendChild(a);
    });
    document.body.appendChild(bar);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
