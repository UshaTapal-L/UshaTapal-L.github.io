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

  var pageKey = null;

  async function decrypt(pw) {
    var data = bytes(document.getElementById('payload').textContent);
    var salt = data.slice(0, 16), iv = data.slice(16, 28), ct = data.slice(28);
    var base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveKey']);
    var key = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: salt, iterations: ITER, hash: 'SHA-256' },
      base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
    var gz = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, ct);
    pageKey = key;
    var stream = new Blob([gz]).stream().pipeThrough(new DecompressionStream('gzip'));
    return JSON.parse(await new Response(stream).text());
  }

  // Encrypted media files (video, images) sit next to the page as base64 text of iv|ciphertext.
  async function loadAsset(asset) {
    var res = await fetch(asset.file);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    var buf = bytes(await res.text());
    var plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: buf.slice(0, 12) }, pageKey, buf.slice(12));
    return URL.createObjectURL(new Blob([plain], { type: asset.type }));
  }

  // Scale device frames (iPhone, MacBook) to fit the space they have.
  function fitDevices() {
    document.querySelectorAll('.iphone-fit, .device-fit').forEach(function (fit) {
      var dev = fit.firstElementChild;
      var w = dev.offsetWidth, h = dev.offsetHeight;
      var isPhone = fit.classList.contains('iphone-fit');
      var scale = Math.min(1, fit.parentElement.clientWidth / w, (window.innerHeight - 110) / h, isPhone ? 1 : 1000 / w);
      scale = Math.max(scale, isPhone ? 0.55 : 0.2);
      dev.style.transform = 'scale(' + scale + ')';
      fit.style.width = w * scale + 'px';
      fit.style.height = h * scale + 'px';
    });
  }

  function wireVideoToggles() {
    document.querySelectorAll('[data-video-toggle]').forEach(function (b) {
      var v = document.querySelector('[data-enc-src="film"]');
      if (!v) return;
      function sync() {
        var playing = !v.paused;
        b.dataset.state = playing ? 'playing' : 'paused';
        b.setAttribute('aria-label', playing ? 'Pause video' : 'Play video');
      }
      v.addEventListener('play', sync); v.addEventListener('pause', sync);
      b.addEventListener('click', function () { if (v.paused) v.play(); else v.pause(); });
      sync();
    });
  }

  function show(data) {
    var content = document.getElementById('content');
    content.innerHTML = data.body;
    document.getElementById('lock').hidden = true;
    content.hidden = false;
    var frame = document.getElementById('app-frame');
    if (frame && data.app) frame.srcdoc = data.app;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    content.querySelectorAll('[data-enc-src]').forEach(function (el) {
      var asset = data.assets && data.assets[el.getAttribute('data-enc-src')];
      if (!asset) return;
      if (el.tagName === 'VIDEO' && reduce) el.removeAttribute('autoplay');
      loadAsset(asset).then(function (url) {
        el.src = url;
        if (el.tagName === 'VIDEO' && !reduce) { var p = el.play(); if (p && p.catch) p.catch(function () {}); }
      }).catch(function () {});
    });
    wireVideoToggles();
    fitDevices();
    window.addEventListener('resize', fitDevices);
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
        form.classList.remove('shake'); void form.offsetWidth; form.classList.add('shake');
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
