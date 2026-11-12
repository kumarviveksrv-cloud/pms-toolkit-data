/* Google Analytics 4 (ported from Softr global head). Measurement ID: G-LX4C03K8LK */
(function () {
  var ID = 'G-LX4C03K8LK';
  if (window.__pmsGaLoaded) return;
  window.__pmsGaLoaded = true;
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', ID, { anonymize_ip: true });
})();
