// Version 14 work: drag, swipe, arrows or keys turn the drum; the front card
// opens a detail view, a side card turns to the front. Grid shows all at once.
(function () {
  var wk = document.querySelector('[data-wk]'); if (!wk) return;
  var dr = wk.querySelector('[data-dr]'), ring = wk.querySelector('[data-ring]'), cards = [].slice.call(ring.children);
  var wd = wk.querySelector('[data-wd]'), items = [].slice.call(wd.querySelectorAll('.wd-item'));
  var bar = wk.querySelector('.wk-bar'), n = cards.length, step = 360 / n, rot = 0;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function front() { return ((Math.round(-rot / step) % n) + n) % n; }
  function paint() {
    ring.style.setProperty('--rot', rot + 'deg');
    cards.forEach(function (c, i) {
      var a = ((i * step + rot) % 360 + 540) % 360 - 180, d = Math.min(1, Math.abs(a) / 120);
      c.style.setProperty('--b', (1 - d * .35).toFixed(3)); c.style.setProperty('--s', (1 - d * .4).toFixed(3));
      c.tabIndex = (i === front() || wk.classList.contains('grid')) ? 0 : -1;
    });
  }
  function go(to, ease) { dr.classList.toggle('ease', !!ease && !reduce); rot = to; paint(); }
  function snap() { go(Math.round(rot / step) * step, true); }
  function turn(k) { go((Math.round(rot / step) - k) * step, true); }
  function toCard(i) { var cur = Math.round(rot / step), want = -i, diff = ((want - cur) % n + n + Math.floor(n / 2)) % n - Math.floor(n / 2); go((cur + diff) * step, true); }

  // drag / swipe
  var sx = 0, sr = 0, moved = false, down = false;
  dr.addEventListener('pointerdown', function (e) { if (wk.classList.contains('grid')) return; down = true; moved = false; sx = e.clientX; sr = rot; dr.classList.remove('ease'); });
  addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 6) { moved = true; dr.classList.add('drag'); } if (moved) { rot = sr + dx * .28; paint(); } });
  addEventListener('pointerup', function () { if (!down) return; down = false; dr.classList.remove('drag'); if (moved) snap(); });
  dr.addEventListener('wheel', function (e) { if (wk.classList.contains('grid') || Math.abs(e.deltaX) < Math.abs(e.deltaY)) return; e.preventDefault(); dr.classList.remove('ease'); rot -= e.deltaX * .2; paint(); clearTimeout(dr._t); dr._t = setTimeout(snap, 140); }, { passive: false });

  wk.querySelector('[data-prev]').addEventListener('click', function () { turn(-1); });
  wk.querySelector('[data-next]').addEventListener('click', function () { turn(1); });
  dr.addEventListener('keydown', function (e) { if (wk.classList.contains('grid')) return; if (e.key === 'ArrowRight') { turn(1); e.preventDefault(); cards[front()].focus({ preventScroll: true }); } if (e.key === 'ArrowLeft') { turn(-1); e.preventDefault(); cards[front()].focus({ preventScroll: true }); } });

  // open / close details
  var last = null;
  function open(i) {
    last = cards[i];
    items.forEach(function (it, j) { it.hidden = j !== i; });
    dr.hidden = true; bar.hidden = true; wd.hidden = false;
    var top = wk.getBoundingClientRect().top; if (top < 0 || top > innerHeight * .5) wk.scrollIntoView({ behavior: 'instant', block: 'start' });
    wd.querySelector('[data-back]').focus({ preventScroll: true });
  }
  function close() { wd.hidden = true; dr.hidden = false; bar.hidden = false; paint(); if (last) last.focus({ preventScroll: true }); }
  cards.forEach(function (c, i) {
    c.addEventListener('click', function () {
      if (moved) return;
      if (wk.classList.contains('grid') || i === front()) open(i); else toCard(i);
    });
  });
  wd.querySelector('[data-back]').addEventListener('click', close);
  addEventListener('keydown', function (e) { if (e.key === 'Escape' && !wd.hidden) { e.stopPropagation(); close(); } }, true);

  // layout switch
  wk.querySelectorAll('[data-mode]').forEach(function (b) {
    b.addEventListener('click', function () {
      var grid = b.dataset.mode === 'grid';
      wk.classList.toggle('grid', grid);
      wk.querySelectorAll('[data-mode]').forEach(function (x) { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); });
      paint();
    });
  });
  paint();
})();
