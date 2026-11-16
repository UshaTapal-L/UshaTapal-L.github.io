// Version 5: blueprint to building. Each [data-sheet] section gets a blueprint layer that
// shrinks upward as you scroll through it; once built it stays built.
(function () {
  var body = document.body, reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var secs = Array.prototype.slice.call(document.querySelectorAll('[data-sheet]'));
  secs.forEach(function (s, i) {
    var l = document.createElement('div'); l.className = 'bp-layer'; l.setAttribute('aria-hidden', 'true');
    l.innerHTML = '<span class="bp-tag"><b>SHEET ' + s.dataset.sheet + '</b>' + s.dataset.sheetName.toUpperCase() + '</span><span class="bp-pct"></span><span class="bp-edge"></span>';
    if (i === 0) l.innerHTML += '<span class="bp-dim">USHA TAPAL · 1 : 1</span><span class="bp-hint">SCROLL TO BUILD ↓</span>' +
      '<span class="bp-title"><span>PROJECT</span><span>PORTFOLIO</span><span>DRAWN BY</span><span>USHA TAPAL</span><span>SCALE</span><span>1 : 1</span><span>DATE</span><span>2026</span></span>';
    s.appendChild(l); s._l = l; s._p = 0; s._pct = l.querySelector('.bp-pct');
  });
  var forced = false;
  function tick() {
    if (forced) return;
    var vh = innerHeight, all = true;
    secs.forEach(function (s, i) {
      var r = s.getBoundingClientRect(), p;
      if (reduce) p = 1;
      else if (i === 0) p = Math.min(1, scrollY / (vh * 0.7));
      else p = (vh * 0.95 - r.top) / (Math.min(r.height, vh * 1.4) * 0.75);
      p = Math.max(s._p, Math.max(0, Math.min(1, p)));
      if (p !== s._p || !s._init) {
        s._p = p; s._init = true;
        s._l.style.setProperty('--left', (1 - p).toFixed(4));
        s._l.classList.toggle('is-gone', p >= 1);
        s._pct.textContent = p < 1 ? 'UNDER CONSTRUCTION · ' + Math.round(p * 100) + '%' : '';
      }
      if (p < 1) all = false;
    });
    body.classList.toggle('is-built', all);
  }
  var raf = 0;
  addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(function () { raf = 0; tick(); }); }, { passive: true });
  addEventListener('resize', tick); tick();
  // jump links build instantly so visitors never land on an empty sheet
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]'); if (!a) return;
    var t = document.querySelector(a.getAttribute('href')); if (!t) return;
    secs.forEach(function (s) { if (s.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_FOLLOWING || s === t || s.contains(t)) { s._p = 1; } });
    secs.forEach(function (s) { if (s._p >= 1) { s._l.style.setProperty('--left', 0); s._l.classList.add('is-gone'); } });
  });
  var sw = document.querySelector('[data-bp-switch]'), lab = sw && sw.querySelector('[data-bp-label]');
  if (sw) sw.addEventListener('click', function () {
    forced = !forced; body.classList.toggle('is-blueprint', forced); sw.setAttribute('aria-pressed', forced);
    lab.textContent = forced ? 'Built view' : 'Blueprint view';
    if (!forced) tick();
  });
})();
