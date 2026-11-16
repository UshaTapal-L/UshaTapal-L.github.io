// Version 2: walk through my house. Click a room, the little me walks there
// through the doors, the plan zooms in and a card invites you inside.
(function () {
  var sec = document.querySelector('.hs'); if (!sec) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var plan = sec.querySelector('.hs-plan'), me = sec.querySelector('.hs-me'), card = sec.querySelector('.hs-card');
  var rooms = sec.querySelectorAll('.hs-room');
  var ENTRY = [630, 660];
  var PATHS = {
    garden: [[630, 600], [700, 520], [720, 470]],
    kitchen: [[630, 600], [520, 490], [440, 490], [330, 470], [220, 520]],
    library: [[630, 600], [700, 420], [730, 330], [730, 300], [760, 220]],
    studio: [[630, 600], [520, 490], [440, 490], [300, 430], [190, 410], [190, 360], [190, 320], [300, 240]]
  };
  var NUM = { studio: 'Room 01', library: 'Room 02', kitchen: 'Room 03', garden: 'Room 04' };
  var pos = ENTRY.slice(), busy = false, current = null;
  function setMe(x, y) { pos = [x, y]; me.setAttribute('transform', 'translate(' + x + ' ' + y + ')'); }
  function walk(points, done) {
    if (reduce) { var l = points[points.length - 1]; setMe(l[0], l[1]); done(); return; }
    var segs = [], from = pos.slice();
    points.forEach(function (p) { segs.push([from, p]); from = p; });
    var k = 0;
    (function next() {
      if (k >= segs.length) { done(); return; }
      var a = segs[k][0], b = segs[k][1], d = Math.hypot(b[0] - a[0], b[1] - a[1]), dur = Math.max(120, d * 2.6), t0 = null;
      function step(t) {
        if (!t0) t0 = t; var p = Math.min(1, (t - t0) / dur);
        setMe(a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p);
        if (p < 1) requestAnimationFrame(step); else { k++; next(); }
      }
      requestAnimationFrame(step);
    })();
  }
  function zoomTo(room) {
    var c = room.dataset.c.split(',').map(Number);
    plan.style.transformOrigin = (c[0] / 10) + '% ' + (c[1] / 6.8) + '%';
    sec.style.setProperty('--z', window.innerWidth < 700 ? 1.8 : 2.1);
    sec.classList.add('is-zoom');
  }
  function openCard(room) {
    card.querySelector('.hs-card__n').textContent = NUM[room.dataset.room];
    card.querySelector('.hs-card__t').textContent = room.dataset.name;
    card.querySelector('.hs-card__s').textContent = room.dataset.sub;
    var go = card.querySelector('.hs-go'); go.textContent = room.dataset.go + ' →'; go.setAttribute('href', room.getAttribute('href'));
    card.hidden = false;
  }
  function back() {
    sec.classList.remove('is-zoom'); card.hidden = true; current = null;
    rooms.forEach(function (r) { r.classList.remove('is-on'); });
    setTimeout(function () { setMe(ENTRY[0], ENTRY[1]); }, reduce ? 0 : 500);
  }
  rooms.forEach(function (room) {
    room.addEventListener('click', function (e) {
      e.preventDefault(); if (busy) return;
      var key = room.dataset.room;
      if (current === key) { location.hash = ''; document.querySelector(room.getAttribute('href')).scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); return; }
      busy = true; card.hidden = true; sec.classList.remove('is-zoom');
      rooms.forEach(function (r) { r.classList.toggle('is-on', r === room); });
      var startFromEntry = function () {
        setMe(ENTRY[0], ENTRY[1]);
        walk(PATHS[key], function () { zoomTo(room); setTimeout(function () { openCard(room); busy = false; current = key; }, reduce ? 0 : 700); });
      };
      if (current && !reduce) setTimeout(startFromEntry, 450); else startFromEntry();
    });
  });
  card.querySelector('.hs-back').addEventListener('click', back);
  card.querySelector('.hs-go').addEventListener('click', function (e) {
    var t = document.querySelector(this.getAttribute('href')); if (!t) return;
    e.preventDefault(); t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    setTimeout(back, 900);
  });
})();
