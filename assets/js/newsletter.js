/* Substack newsletter subscribe (ported verbatim from Softr global footer).
   Pages opt in by including inputs with ids vw-<variant>-email / -submit / -msg. */
(function(){
  if (window.vwSubscribe) return;
  function isValidEmail(e){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
  window.vwSubscribe = function(variant){
    var prefix = 'vw-' + variant;
    var input = document.getElementById(prefix + '-email');
    var btn = document.getElementById(prefix + '-submit');
    var msg = document.getElementById(prefix + '-msg');
    if(!input || !btn || !msg) return;
    var email = input.value.trim();
    msg.className = variant === 'footer' ? 'vw-footer-msg' : 'vw-hub-msg';
    if(!email) { msg.textContent = 'Please enter your email.'; msg.className += ' error'; input.focus(); return; }
    if(!isValidEmail(email)) { msg.textContent = 'That does not look like a valid email.'; msg.className += ' error'; input.focus(); return; }
    btn.disabled = true;
    btn.textContent = 'Subscribing...';
    msg.textContent = '';
    var subUrl = 'https://virorahweekly.substack.com/api/v1/free';
    var body = new URLSearchParams({ email: email, first_url: window.location.href, first_referrer: document.referrer || '', current_url: window.location.href, current_referrer: document.referrer || '' });
    fetch(subUrl, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() }).then(function(){
      btn.textContent = 'Subscribed';
      msg.textContent = 'Check your inbox to confirm your subscription.';
      msg.className += ' success';
      input.value = '';
      input.disabled = true;
      setTimeout(function(){ btn.disabled = false; input.disabled = false; btn.textContent = 'Subscribe'; }, 6000);
    }).catch(function(){
      msg.textContent = 'Opening secure subscribe form...';
      msg.className += ' success';
      setTimeout(function(){ window.open('https://virorahweekly.substack.com/subscribe?email=' + encodeURIComponent(email), '_blank'); btn.disabled = false; btn.textContent = 'Subscribe'; }, 800);
    });
  };
  document.addEventListener('keydown', function(e){
    if(e.key === 'Enter' && e.target && e.target.id === 'vw-footer-email') { window.vwSubscribe('footer'); }
  });
})();
