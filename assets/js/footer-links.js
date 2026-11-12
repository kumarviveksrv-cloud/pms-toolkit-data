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
    bar.style.cssText = "position:fixed;bottom:10px;left:50%;transform:translateX(-50%);z-index:88000;font-family:'DM Sans',-apple-system,sans-serif;display:flex;align-items:center;gap:16px;";
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
