// Version 7: the sky, the sun/moon and the header clock follow your scroll through the day.
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement.style, body = document.body;
  var clock = document.querySelector('[data-clock]'), label = document.querySelector('[data-clock-label]');
  var hours = Array.prototype.slice.call(document.querySelectorAll('[data-time]'));
  // sky keyframes at 07:30, 10:00, 13:00, 16:00, 19:30, 23:00
  var K = [
    ['#fbe1c8', '#f6efe3', '#f6c46b', 'rgba(246,196,107,.5)', 0],
    ['#dcebf2', '#f4f2ea', '#fbe08a', 'rgba(251,224,138,.5)', 0],
    ['#cfe4ee', '#f5f3ec', '#fff0b3', 'rgba(255,240,179,.55)', 0],
    ['#f6dcc0', '#f5ede2', '#f2a65a', 'rgba(242,166,90,.5)', 0],
    ['#c06f80', '#3f3b52', '#e4889c', 'rgba(228,136,156,.45)', .3],
    ['#151c2e', '#1f2a24', '#f1ecd8', 'rgba(241,236,216,.25)', 1]
  ];
  function hex(h) { return [1, 3, 5].map(function (i) { return parseInt(h.substr(i, 2), 16); }); }
  function mix(a, b, t) { var x = hex(a), y = hex(b); return 'rgb(' + x.map(function (v, i) { return Math.round(v + (y[i] - v) * t); }).join(',') + ')'; }
  function mixRgba(a, b, t) {
    var x = a.match(/[\d.]+/g).map(Number), y = b.match(/[\d.]+/g).map(Number);
    return 'rgba(' + x.map(function (v, i) { return (v + (y[i] - v) * t).toFixed(i < 3 ? 0 : 2); }).join(',') + ')';
  }
  var mins = hours.map(function (h) { var p = h.dataset.time.split(':'); return +p[0] * 60 + +p[1]; });
  function fmt(m) { var h = Math.floor(m / 60), mm = Math.floor(m % 60 / 5) * 5; return (h < 10 ? '0' : '') + h + ':' + (mm < 10 ? '0' : '') + mm; }
  function tick() {
    var mid = innerHeight * 0.45, idx = 0, t = 0;
    for (var i = 0; i < hours.length; i++) {
      var r = hours[i].getBoundingClientRect();
      if (r.top <= mid) { idx = i; t = Math.min(1, Math.max(0, (mid - r.top) / Math.max(1, r.height))); }
    }
    var j = Math.min(hours.length - 1, idx + 1), k = idx === j ? 0 : t;
    var A = K[idx], B = K[j];
    root.setProperty('--sky1', mix(A[0], B[0], k)); root.setProperty('--sky2', mix(A[1], B[1], k));
    root.setProperty('--orb', mix(A[2], B[2], k)); root.setProperty('--glow', mixRgba(A[3], B[3], k));
    root.setProperty('--stars', (A[4] + (B[4] - A[4]) * k).toFixed(2));
    var dayP = (idx + k) / (hours.length - 1); // 0..1 across the day
    root.setProperty('--ox', (74 + dayP * 18) + '%'); root.setProperty('--oy', (78 - Math.sin(Math.min(1, dayP * 1.25) * Math.PI) * 50) + '%');
    body.classList.toggle('is-night', idx + k > 3.7);
    var m = mins[idx] + (mins[j] - mins[idx]) * k;
    clock.textContent = fmt(m); label.textContent = (k > .5 ? hours[j] : hours[idx]).dataset.label;
  }
  var raf = 0;
  addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(function () { raf = 0; tick(); }); }, { passive: true });
  addEventListener('resize', tick); tick();

  // bake cookies onto the tray around my photo
  var tray = document.querySelector('[data-tray]'), btn = document.querySelector('[data-bake]'), n = 0;
  var COOKIE = '<svg viewBox="0 0 100 92" aria-hidden="true"><path d="M50 88C10 60 2 38 12 20 22 4 42 6 50 22 58 6 78 4 88 20c10 18 2 40-38 68z" fill="#d9a066"/><path d="M50 62C34 50 32 40 38 34c4-4 9-2 12 4 3-6 8-8 12-4 6 6 4 16-12 28z" fill="#b8323f"/></svg>';
  if (btn) btn.addEventListener('click', function () {
    if (n >= 8) { tray.querySelectorAll('.ck').forEach(function (c) { c.remove(); }); n = 0; btn.textContent = 'Bake a cookie'; return; }
    var a = (n / 8) * Math.PI * 2 - Math.PI / 2, c = document.createElement('span');
    c.className = 'ck'; c.innerHTML = COOKIE; c.style.left = (50 + Math.cos(a) * 33) + '%'; c.style.top = (50 + Math.sin(a) * 33) + '%'; c.style.setProperty('--r', (Math.random() * 40 - 20) + 'deg');
    tray.appendChild(c); n++;
    btn.textContent = n >= 8 ? 'Tray full! Clear it' : 'Bake another (' + n + '/8)';
  });

  // copy email
  document.querySelectorAll('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () { try { navigator.clipboard.writeText(b.dataset.copy).then(function () { b.textContent = 'Copied'; setTimeout(function () { b.textContent = 'Copy'; }, 1600); }, function () {}); } catch (e) {} });
  });
})();
