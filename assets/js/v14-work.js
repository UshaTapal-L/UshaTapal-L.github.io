// Version 14 work: drag, swipe, arrows or keys turn the drum; the front card
// opens a detail view, a side card turns to the front. Grid shows all at once.
(function () {
  var wk = document.querySelector('[data-wk]'); if (!wk) return;
  var dr = wk.querySelector('[data-dr]'), ring = wk.querySelector('[data-ring]'), cards = [].slice.call(ring.children);
  var wd = wk.querySelector('[data-wd]'), items = [].slice.call(wd.querySelectorAll('.wd-item'));
  var bar = wk.querySelector('.wk-bar'), n = cards.length, wrap = n >= 6, step = wrap ? 360 / n : 30, rot = 0;
  ring.style.setProperty('--step', step + 'deg');
  if (!wrap) { wk.classList.add('fan'); }
  // four or more cards: start in the middle so cards show on both sides
  if (!wrap && n >= 4) rot = -Math.floor((n - 1) / 2) * step;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function front() { var k = Math.round(-rot / step); return wrap ? ((k % n) + n) % n : Math.max(0, Math.min(n - 1, k)); }
  function clampRot(r) { return wrap ? r : Math.max(-(n - 1) * step, Math.min(0, r)); }
  function paint() {
    ring.style.setProperty('--rot', rot + 'deg');
    cards.forEach(function (c, i) {
      var a = ((i * step + rot) % 360 + 540) % 360 - 180, d = Math.min(1, Math.abs(a) / 120);
      c.style.setProperty('--b', (1 - d * .35).toFixed(3)); c.style.setProperty('--s', (1 - d * .4).toFixed(3));
      c.tabIndex = (i === front() || wk.classList.contains('grid')) ? 0 : -1;
    });
  }
  function go(to, ease) { dr.classList.toggle('ease', !!ease && !reduce); rot = ease ? clampRot(to) : to; paint(); }
  function snap() { go(Math.round(rot / step) * step, true); }
  function turn(k) { go((Math.round(rot / step) - k) * step, true); }
  function toCard(i) { if (!wrap) { go(-i * step, true); return; } var cur = Math.round(rot / step), want = -i, diff = ((want - cur) % n + n + Math.floor(n / 2)) % n - Math.floor(n / 2); go((cur + diff) * step, true); }

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
    var k = cards[i].dataset.k; items.forEach(function (it) { it.hidden = it.dataset.k !== k; });
    dr.hidden = true; bar.hidden = true; wd.hidden = false;
    var top = wk.getBoundingClientRect().top; if (top < 0 || top > innerHeight * .5) wk.scrollIntoView({ behavior: 'instant', block: 'start' });
    wd.querySelector('[data-back]').focus({ preventScroll: true });
  }
  function close() { wd.hidden = true; dr.hidden = false; bar.hidden = false; paint(); if (last) last.focus({ preventScroll: true }); }
  cards.forEach(function (c, i) {
    c.addEventListener('click', function (e) {
      var atFront = wk.classList.contains('grid') || i === front();
      if (c.hasAttribute('href')) { if (moved || !atFront) { e.preventDefault(); if (!moved) toCard(i); } return; }
      if (moved) return;
      if (atFront) open(i); else toCard(i);
    });
  });
  wd.querySelector('[data-back]').addEventListener('click', close);
  addEventListener('keydown', function (e) { if (e.key === 'Escape' && !wd.hidden) { e.stopPropagation(); close(); } }, true);

  // layout switch, kept soft: to Grid every card glides from its spot on the drum
  // to its bento tile; back to Drum the bento fades and the drum turns into view.
  var switching = false, EASE = 'cubic-bezier(.22,1,.36,1)';
  function setMode(b) {
    var grid = b.dataset.mode === 'grid';
    if (switching || grid === wk.classList.contains('grid')) return;
    wk.querySelectorAll('[data-mode]').forEach(function (x) { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); });
    function apply() { wk.classList.toggle('grid', grid); paint(); }
    if (reduce || !dr.animate) { apply(); return; }
    switching = true;
    var top0 = wk.getBoundingClientRect().top, h0 = dr.offsetHeight;
    function settle() { var dy = wk.getBoundingClientRect().top - top0; if (Math.abs(dy) > 1) scrollBy(0, dy); }
    function grow(dur) { var h1 = dr.offsetHeight; return dr.animate([{ height: h0 + 'px' }, { height: h1 + 'px' }], { duration: dur, easing: EASE }); }
    if (grid) {
      var first = cards.map(function (c, i) {
        var a = ((i * step + rot) % 360 + 540) % 360 - 180;
        return { r: c.getBoundingClientRect(), o: Math.abs(a) < 80 ? 1 : 0 };
      });
      apply(); settle();
      var hA = grow(800);
      cards.forEach(function (c, i) {
        var f = first[i].r, l = c.getBoundingClientRect();
        var dx = f.left - l.left, dy = f.top - l.top, sx = f.width / l.width, sy = f.height / l.height;
        c.animate([
          { transformOrigin: '0 0', transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + sx + ',' + sy + ')', opacity: first[i].o },
          { transformOrigin: '0 0', transform: 'none', opacity: 1 }
        ], { duration: 800, delay: i * 35, easing: EASE, fill: 'backwards' });
      });
      hA.finished.then(function () { switching = false; });
    } else {
      dr.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(12px)' }], { duration: 320, easing: 'ease' }).finished.then(function () {
        dr.classList.remove('ease'); rot -= 50; apply(); settle();
        var hA = grow(700);
        dr.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 600, easing: 'ease' });
        requestAnimationFrame(function () { requestAnimationFrame(function () { go(rot + 50, true); }); });
        hA.finished.then(function () { switching = false; });
      });
    }
  }
  wk.querySelectorAll('[data-mode]').forEach(function (b) { b.addEventListener('click', function () { setMode(b); }); });
  paint();
})();
