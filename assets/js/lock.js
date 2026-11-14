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

  // Highlight the current section in an on-page menu.
  function wireToc() {
    var toc = document.querySelector('[data-toc]');
    if (!toc || !('IntersectionObserver' in window)) return;
    var links = toc.querySelectorAll('a[href^="#"]');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    links.forEach(function (a) { var s = document.querySelector(a.getAttribute('href')); if (s) io.observe(s); });
  }


  // Annotated screens: tabs switch screens; arrows run from each pin on the screen to its note.
  function wireAnn() {
    document.querySelectorAll('[data-ann]').forEach(function (ann) {
      var tabs = Array.prototype.slice.call(ann.querySelectorAll('.ann__tab'));
      var panels = Array.prototype.slice.call(ann.querySelectorAll('.ann__panel'));
      function draw(panel) {
        var svg = panel.querySelector('.ann__lines');
        if (!svg) return;
        svg.innerHTML = '';
        if (window.innerWidth < 900 || panel.hidden) return;
        var box = panel.getBoundingClientRect();
        svg.setAttribute('viewBox', '0 0 ' + box.width + ' ' + box.height);
        panel.querySelectorAll('.ann__pin').forEach(function (pin) {
          var note = panel.querySelector('.ann__note[data-n="' + pin.dataset.n + '"] .ann__num');
          if (!note) return;
          var a = pin.getBoundingClientRect(), b = note.getBoundingClientRect();
          var x1 = a.left + a.width / 2 - box.left, y1 = a.top + a.height / 2 - box.top;
          var x2 = b.left - box.left - 6, y2 = b.top + b.height / 2 - box.top;
          var mx = x2 - 28;
          var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          path.setAttribute('d', 'M' + x1 + ' ' + y1 + ' L' + mx + ' ' + y2 + ' L' + x2 + ' ' + y2);
          path.setAttribute('data-n', pin.dataset.n);
          svg.appendChild(path);
          var dot = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          dot.setAttribute('d', 'M' + (x2 - 7) + ' ' + (y2 - 4) + ' L' + x2 + ' ' + y2 + ' L' + (x2 - 7) + ' ' + (y2 + 4));
          dot.setAttribute('class', 'ann__head'); dot.setAttribute('data-n', pin.dataset.n);
          svg.appendChild(dot);
        });
      }
      function select(i) {
        tabs.forEach(function (t, j) { t.setAttribute('aria-selected', i === j); t.tabIndex = i === j ? 0 : -1; });
        panels.forEach(function (p, j) { p.hidden = i !== j; });
        var img = panels[i].querySelector('img');
        if (img && !img.complete) img.addEventListener('load', function () { draw(panels[i]); }, { once: true });
        draw(panels[i]);
      }
      tabs.forEach(function (t, i) {
        t.addEventListener('click', function () { select(i); });
        t.addEventListener('keydown', function (e) {
          var k = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
          if (k) { e.preventDefault(); var n = (i + k + tabs.length) % tabs.length; select(n); tabs[n].focus(); }
        });
      });
      panels.forEach(function (panel) {
        function hl(n, on) { panel.querySelectorAll('[data-n="' + n + '"]').forEach(function (el) { el.classList.toggle('is-hl', on); }); }
        panel.querySelectorAll('.ann__pin, .ann__note').forEach(function (el) {
          el.addEventListener('mouseenter', function () { hl(el.dataset.n, true); });
          el.addEventListener('mouseleave', function () { hl(el.dataset.n, false); });
          el.addEventListener('focus', function () { hl(el.dataset.n, true); });
          el.addEventListener('blur', function () { hl(el.dataset.n, false); });
        });
        panel.querySelectorAll('img').forEach(function (img) { img.addEventListener('load', function () { draw(panel); }); });
      });
      window.addEventListener('resize', function () { panels.forEach(draw); });
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { panels.forEach(draw); });
      select(0);
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
    wireToc();
    wireAnn();
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
