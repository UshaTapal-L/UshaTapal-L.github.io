// Unlocks an encrypted case study page.
// The page holds the content encrypted with AES-GCM (key from the password via PBKDF2),
// so nothing is readable in the page source without the password.
(function () {
  var ITER = 600000;
  var KEY = 'unlock:' + location.pathname;
  var form = document.getElementById('lock-form');
  var input = document.getElementById('pw');
  var btn = document.getElementById('lock-btn');
  var msg = document.getElementById('lock-msg');

  function bytes(b64) {
    var s = atob(b64.trim()), a = new Uint8Array(s.length);
    for (var i = 0; i < s.length; i++) a[i] = s.charCodeAt(i);
    return a;
  }

  async function decrypt(pw) {
    var data = bytes(document.getElementById('payload').textContent);
    var salt = data.slice(0, 16), iv = data.slice(16, 28), ct = data.slice(28);
    var base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveKey']);
    var key = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: salt, iterations: ITER, hash: 'SHA-256' },
      base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
    var gz = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, ct);
    var stream = new Blob([gz]).stream().pipeThrough(new DecompressionStream('gzip'));
    return JSON.parse(await new Response(stream).text());
  }

  function fitPhone() {
    var fit = document.querySelector('.iphone-fit');
    if (!fit) return;
    var phone = fit.firstElementChild;
    var w = phone.offsetWidth, h = phone.offsetHeight;
    var scale = Math.min(1, fit.parentElement.clientWidth / w, (window.innerHeight - 110) / h);
    scale = Math.max(scale, 0.55);
    phone.style.transform = 'scale(' + scale + ')';
    fit.style.width = w * scale + 'px';
    fit.style.height = h * scale + 'px';
  }

  function show(data) {
    var content = document.getElementById('content');
    content.innerHTML = data.body;
    document.getElementById('lock').hidden = true;
    content.hidden = false;
    document.getElementById('app-frame').srcdoc = data.app;
    fitPhone();
    window.addEventListener('resize', fitPhone);
    window.scrollTo(0, 0);
  }

  async function tryUnlock(pw, quiet) {
    btn.disabled = true;
    if (!quiet) msg.textContent = 'Unlocking…';
    try {
      show(await decrypt(pw));
      try { sessionStorage.setItem(KEY, pw); } catch (e) {}
    } catch (e) {
      if (!quiet) {
        msg.textContent = (typeof DecompressionStream === 'undefined')
          ? 'Your browser is too old to open this page. Please try a recent Chrome, Safari or Edge.'
          : 'That password didn\'t work. Please try again.';
        input.select();
      }
    } finally {
      btn.disabled = false;
    }
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    tryUnlock(input.value, false);
  });

  // Stay unlocked for the rest of this browser session.
  try {
    var saved = sessionStorage.getItem(KEY);
    if (saved) tryUnlock(saved, true);
  } catch (e) {}
})();
