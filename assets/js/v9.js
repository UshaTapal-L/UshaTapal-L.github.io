// Version 9: Usha OS. Window manager (open, focus, drag, close), project preview,
// tidy-up desktop, day/night theme, clock, copy, trash easter egg.
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var phone = function () { return window.innerWidth <= 760; };
  var root = document.documentElement, desk = document.querySelector('[data-desk]');
  var z = 10, opened = 0;

  // ---------- theme ----------
  var tbtn = document.querySelector('[data-theme-toggle]');
  function isDark() { return root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches; }
  function syncTheme() { tbtn.setAttribute('aria-label', isDark() ? 'Switch to light mode' : 'Switch to dark mode'); }
  tbtn.addEventListener('click', function () {
    root.dataset.theme = isDark() ? 'light' : 'dark';
    try { localStorage.setItem('ushaos-theme', root.dataset.theme); } catch (e) {}
    syncTheme(); toast(isDark() ? 'Night mode. Time to sketch.' : 'Good morning. Coffee first.');
  });
  syncTheme();

  // ---------- clock ----------
  var clk = document.querySelector('[data-clock]');
  function tick() { var d = new Date(); clk.textContent = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
  tick(); setInterval(tick, 20000);

  // ---------- toast ----------
  var tEl = document.querySelector('[data-toast]'), tT;
  function toast(msg) { tEl.textContent = msg; tEl.hidden = false; clearTimeout(tT); tT = setTimeout(function () { tEl.hidden = true; }, 2400); }

  // ---------- windows ----------
  var lastFocus = null;
  function win(id) { return document.querySelector('[data-win="' + id + '"]'); }
  function front(w) { w.style.zIndex = ++z; }
  function open(id, from) {
    var w = win(id); if (!w) return;
    lastFocus = from || document.activeElement;
    if (w.hidden) {
      if (!phone() && !w._placed) {
        var W = desk.clientWidth, H = desk.clientHeight, ww = Math.min(w.classList.contains('wide') ? 760 : 520, W - 32);
        var x = Math.max(16, Math.min(W - ww - 16, (W - ww) / 2 + (opened % 4) * 34 - 50)), y = Math.max(16, 30 + (opened % 4) * 30);
        w.style.setProperty('--wx', x + 'px'); w.style.setProperty('--wy', y + 'px'); w._placed = true; opened++;
      }
      w.hidden = false;
    }
    front(w);
    var f = w.querySelector('.x'); if (f) f.focus({ preventScroll: true });
  }
  function close(w) {
    if (w.classList.contains('is-closing')) return;
    if (reduce) { w.hidden = true; } else { w.classList.add('is-closing'); setTimeout(function () { w.hidden = true; w.classList.remove('is-closing'); }, 200); }
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  document.addEventListener('click', function (e) {
    var o = e.target.closest('[data-open]'); if (o) { e.preventDefault(); open(o.dataset.open, o); return; }
    var x = e.target.closest('.x'); if (x) close(x.closest('.win'));
  });
  document.querySelectorAll('.win').forEach(function (w) {
    w.addEventListener('pointerdown', function () { front(w); });
    // drag by the title bar (desktop only)
    var tb = w.querySelector('.tb'), sx, sy, ox, oy, id = null;
    tb.addEventListener('pointerdown', function (e) {
      if (phone() || e.target.closest('.x')) return;
      id = e.pointerId; tb.setPointerCapture(id); tb.style.cursor = 'grabbing';
      sx = e.clientX; sy = e.clientY; ox = w.offsetLeft; oy = w.offsetTop;
    });
    tb.addEventListener('pointermove', function (e) {
      if (id !== e.pointerId) return;
      var nx = Math.max(-w.offsetWidth + 120, Math.min(desk.clientWidth - 120, ox + e.clientX - sx)), ny = Math.max(0, Math.min(desk.clientHeight - 40, oy + e.clientY - sy));
      w.style.setProperty('--wx', nx + 'px'); w.style.setProperty('--wy', ny + 'px');
    });
    function end(e) { if (id !== e.pointerId) return; id = null; tb.style.cursor = ''; }
    tb.addEventListener('pointerup', end); tb.addEventListener('pointercancel', end);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var top = null, tz = -1;
    document.querySelectorAll('.win:not([hidden]):not(.is-closing)').forEach(function (w) { var zz = +w.style.zIndex || 0; if (zz > tz) { tz = zz; top = w; } });
    if (top) close(top);
  });

  // ---------- project preview ----------
  var P = {
    riu: ['RIU, ESG Copilot', 'images/work/clean/riu.jpg', 'Lead designer, 0 to 1. Research, strategy, UI and the field app.', 'ESG teams lost in dense compliance data spread across spreadsheets.', 'Progressive disclosure, and navigation rebuilt from real usage data.', '+40% satisfaction', 'work/riu.html'],
    smart: ['Smart Dealer', 'images/work/clean/smart.jpg', 'Product designer at 6D Technologies. Mobile app for telecom retailers.', 'Shop owners digging through menus to do their daily tasks.', 'Lead with today at a glance, and let dealers simply ask.', 'Android & iOS', 'work/smart-dealer.html'],
    zee: ['zeeproc', 'images/work/zeeproc-wide.jpg', 'Design consultant. Customer success platform and AI agent workflows.', 'New customers dropping off during a long, form-heavy onboarding.', 'A short conversational onboarding, and agents for follow-ups that people review.', '+25% onboarding', 'work/zeeproc.html'],
    nutra: ['NutraScan', 'images/work/nutrascan/home.jpg', 'My own concept, end to end.', 'Healthy eating that feels like homework.', 'Start from how you feel, and cook from what is already in the fridge.', 'Concept', 'work/nutrascan.html']
  };

  var pv = win('preview');
  document.querySelectorAll('[data-project]').forEach(function (b) {
    b.addEventListener('click', function () {
      var d = P[b.dataset.project];
      pv.querySelector('[data-pv-name]').textContent = d[0] + '.case';
      pv.querySelector('[data-pv-title]').textContent = d[0];
      var im = pv.querySelector('[data-pv-img]'); im.src = d[1]; im.alt = d[0] + ' screens';
      pv.querySelector('[data-pv-role]').textContent = d[2];
      pv.querySelector('[data-pv-mess]').textContent = d[3];
      pv.querySelector('[data-pv-calm]').textContent = d[4];
      pv.querySelector('[data-pv-res]').textContent = d[5];
      pv.querySelector('[data-pv-link]').href = d[6];
      if (!phone() && pv.hidden) { var w = win('work'); pv.style.setProperty('--wx', (w.offsetLeft + 40) + 'px'); pv.style.setProperty('--wy', (w.offsetTop + 50) + 'px'); pv._placed = true; }
      open('preview', b);
    });
  });

  // ---------- tidy up: chaos to calm ----------
  var icons = Array.prototype.slice.call(document.querySelectorAll('.ic')), tidy = document.querySelector('[data-tidy]'), tidyOn = false;
  icons.forEach(function (i) { i._x = i.style.getPropertyValue('--x'); i._y = i.style.getPropertyValue('--y'); });
  function setTidy(on) {
    tidyOn = on; desk.classList.toggle('is-tidy', on);
    icons.forEach(function (ic, k) {
      ic.style.setProperty('--x', on ? (k < 5 ? 'calc(100% - 124px)' : 'calc(100% - 240px)') : ic._x);
      ic.style.setProperty('--y', on ? (2 + (k % 5) * 17) + '%' : ic._y);
    });
    tidy.textContent = on ? 'Mess it up' : 'Tidy up';
  }
  tidy.addEventListener('click', function () {
    setTidy(!tidyOn);
    if (tidyOn) { toast('Ahh, calm.'); var r = tidy.getBoundingClientRect(); burst(r.left + r.width / 2, r.top, 30); }
    else toast('A little chaos is good too.');
  });

  // ---------- trash easter egg ----------
  var empty = document.querySelector('[data-empty]');
  empty.addEventListener('click', function () {
    document.body.classList.add('is-empty'); empty.textContent = 'Chaos emptied ✓'; empty.disabled = true;
    var r = empty.getBoundingClientRect(); burst(r.left + r.width / 2, r.top, 50);
    if (!tidyOn) setTimeout(function () { setTidy(true); }, 500);
  });

  // ---------- copy ----------
  document.querySelectorAll('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var r = b.getBoundingClientRect(); burst(r.left + r.width / 2, r.top, 36);
      try { navigator.clipboard.writeText(b.dataset.copy).then(function () { b.textContent = 'Copied ✓'; setTimeout(function () { b.textContent = 'Copy address'; }, 1600); }, function () {}); } catch (e) {}
    });
  });

  // ---------- confetti ----------
  var C = ['#b8506b', '#e4889c', '#b9d3a1', '#2e3b2f', '#f6e7b4'];
  function burst(x, y, n) {
    if (reduce) return;
    for (var i = 0; i < n; i++) (function (i) {
      var c = document.createElement('span'); c.className = 'cf'; c.setAttribute('aria-hidden', 'true'); c.style.background = C[i % C.length]; document.body.appendChild(c);
      var a = Math.random() * Math.PI * 2, v = 4 + Math.random() * 6, vx = Math.cos(a) * v, vy = Math.sin(a) * v - 6, px = x, py = y, r = 0, l = 0;
      (function f() { l++; vy += .35; px += vx; py += vy; r += 12; c.style.transform = 'translate(' + px + 'px,' + py + 'px) rotate(' + r + 'deg)'; c.style.opacity = 1 - l / 70; if (l < 70) requestAnimationFrame(f); else c.remove(); })();
    })(i);
  }

  // open the welcome note on arrival
  setTimeout(function () { open('about'); }, reduce ? 0 : 500);
})();
