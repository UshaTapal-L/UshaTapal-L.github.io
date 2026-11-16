// Version 2, light: word-by-word reveal on the about paragraph,
// plan/screen swap in the hero pill, copy email, current year.
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // About: words light up as the paragraph scrolls through the view
  document.querySelectorAll('[data-reveal]').forEach(function (p) {
    var words = p.textContent.trim().split(/\s+/);
    p.setAttribute('aria-label', p.textContent.trim());
    p.innerHTML = words.map(function (w) { return '<span class="w" aria-hidden="true">' + w.replace(/[<>&]/g, '') + '</span>'; }).join(' ');
    var spans = p.querySelectorAll('.w');
    if (reduce) { spans.forEach(function (s) { s.classList.add('on'); }); return; }
    function tick() {
      var r = p.getBoundingClientRect(), vh = innerHeight;
      var prog = (vh * 0.85 - r.top) / (r.height + vh * 0.35);
      var n = Math.round(Math.max(0, Math.min(1, prog)) * spans.length);
      for (var i = 0; i < spans.length; i++) spans[i].classList.toggle('on', i < n);
    }
    addEventListener('scroll', tick, { passive: true }); addEventListener('resize', tick); tick();
  });

  // Hero pill: my floor plan, then a product screen
  var sw = document.querySelector('.lt-swap');
  if (sw && !reduce) setInterval(function () { sw.classList.toggle('is-b'); }, 2600);

  // Copy email
  document.querySelectorAll('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var t = b.dataset.copy, done = function () { b.textContent = 'Copied'; setTimeout(function () { b.textContent = 'Copy'; }, 1600); };
      try { navigator.clipboard.writeText(t).then(done, function () {}); } catch (e) {}
    });
  });


  // Work: sketch-to-screen and redline notes play once each project is in view
  var items = document.querySelectorAll('.lt-item, .bx-t, .st-ch');
  if (reduce || !('IntersectionObserver' in window)) items.forEach(function (i) { i.classList.add('in'); });
  else {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: 0.35 });
    items.forEach(function (i) { io.observe(i); });
  }

  // Work plan: hover a room to preview the project
  var pv = document.querySelector('.lt-plan__pv');
  if (pv) {
    var img = pv.querySelector('[data-pv-img]'), t = pv.querySelector('[data-pv-t]'), m = pv.querySelector('[data-pv-m]'), cur = 'riu';
    var rooms = document.querySelectorAll('.lt-plan__svg a');
    function show(k, a) {
      rooms.forEach(function (r) { r.classList.toggle('is-on', r === a); });
      if (k === cur) return; cur = k;
      var item = document.getElementById('p-' + k); if (!item) return;
      var fin = item.querySelector('.fin');
      img.classList.add('is-fade');
      setTimeout(function () { img.src = fin.getAttribute('src'); t.textContent = item.querySelector('h3').textContent; m.textContent = item.querySelector('.lt-fig > p').firstChild.textContent.trim(); img.classList.remove('is-fade'); }, 180);
    }
    rooms.forEach(function (a) {
      a.addEventListener('mouseenter', function () { show(a.dataset.pv, a); });
      a.addEventListener('focus', function () { show(a.dataset.pv, a); });
    });
    if (rooms[0]) rooms[0].classList.add('is-on');
  }


  // Hero desk: messy on load, tidies itself as you scroll (chaos to calm).
  // Drag anything; a click (no drag) triggers that object's surprise.
  var desk = document.querySelector('[data-desk]');
  if (desk) {
    var obs = Array.prototype.slice.call(desk.querySelectorAll('.ob'));
    var hero = desk.closest('.lt-desk'), hint = document.querySelector('[data-hint]');
    var mode = null; // null = follow scroll, 1 = forced tidy, 0 = forced mess
    obs.forEach(function (o) {
      o._x = parseFloat(o.style.getPropertyValue('--x')); o._y = parseFloat(o.style.getPropertyValue('--y'));
      o._r = parseFloat(o.style.getPropertyValue('--r')); o._cx = +o.dataset.cx; o._cy = +o.dataset.cy;
    });
    function place(p) {
      var e = p * p * (3 - 2 * p);
      obs.forEach(function (o) {
        o.style.setProperty('--x', (o._x + (o._cx - o._x) * e) + '%');
        o.style.setProperty('--y', (o._y + (o._cy - o._y) * e) + '%');
        o.style.setProperty('--r', (o._r * (1 - e)) + 'deg');
      });
      if (hint) hint.textContent = e > .98 ? 'All tidy · click things' : (e < .02 ? 'Scroll to tidy up · click things' : 'Tidying up…');
    }
    var lastP = -1;
    function onScroll() {
      if (mode !== null) return;
      var p = reduce ? 1 : Math.max(0, Math.min(1, scrollY / (hero.offsetHeight * 0.45)));
      if (Math.abs(p - lastP) < .002) return; lastP = p; place(p);
    }
    desk.classList.add('is-live');
    addEventListener('scroll', onScroll, { passive: true }); onScroll();

    // surprises
    function say(o, i) { var c = o.querySelector('[data-say]'); if (!c) return; var l = c.dataset.say.split('|'); c.textContent = l[i % l.length]; }
    var acts = {
      plan: function (o) { o._n = (o._n || 0) + 1; o.classList.toggle('is-alt', o._n % 2 === 1); say(o, o._n); },
      swap: function (o) { o._n = (o._n || 0) + 1; o.classList.toggle('is-alt', o._n % 2 === 1); say(o, o._n); },
      flip: function (o) { o.classList.toggle('is-flipped'); },
      cup: function (o) { o.classList.remove('is-steam'); void o.offsetWidth; o.classList.add('is-steam'); say(o, 1); clearTimeout(o._t); o._t = setTimeout(function () { say(o, 0); }, 3200); },
      cookie: function (o) { o._n = ((o._n || 0) + 1) % 4; o.dataset.bites = o._n; say(o, o._n); },
      plant: function (o) { o._n = ((o._n || 0) + 1) % 4; o.dataset.leaves = o._n; say(o, o._n); }
    };
    obs.forEach(function (o) {
      var sx, sy, ox, oy, id = null, moved = false;
      o.setAttribute('tabindex', '0'); o.setAttribute('role', 'button');
      o.addEventListener('pointerdown', function (e) {
        id = e.pointerId; o.setPointerCapture(id); moved = false;
        sx = e.clientX; sy = e.clientY; ox = parseFloat(o.style.getPropertyValue('--dx')) || 0; oy = parseFloat(o.style.getPropertyValue('--dy')) || 0;
      });
      o.addEventListener('pointermove', function (e) {
        if (id !== e.pointerId) return;
        var dx = e.clientX - sx, dy = e.clientY - sy;
        if (!moved && Math.abs(dx) + Math.abs(dy) > 5) { moved = true; o.classList.add('is-drag'); }
        if (moved) { o.style.setProperty('--dx', (ox + dx) + 'px'); o.style.setProperty('--dy', (oy + dy) + 'px'); }
      });
      function end(e) {
        if (id !== e.pointerId) return; id = null; o.classList.remove('is-drag');
        if (!moved && e.type === 'pointerup' && acts[o.dataset.o]) acts[o.dataset.o](o);
      }
      o.addEventListener('pointerup', end); o.addEventListener('pointercancel', end);
      o.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && acts[o.dataset.o]) { e.preventDefault(); acts[o.dataset.o](o); } });
    });
    var sc = document.querySelector('[data-scatter]'), td = document.querySelector('[data-tidy]');
    if (sc) sc.addEventListener('click', function () {
      mode = 0;
      obs.forEach(function (o) { o.style.setProperty('--dx', Math.round(Math.random() * 120 - 60) + 'px'); o.style.setProperty('--dy', Math.round(Math.random() * 80 - 40) + 'px'); });
      place(0); if (hint) hint.textContent = 'A little chaos is good';
      sc.classList.add('is-on'); td.classList.remove('is-on');
    });
    if (td) td.addEventListener('click', function () {
      mode = 1;
      obs.forEach(function (o) { o.style.setProperty('--dx', '0px'); o.style.setProperty('--dy', '0px'); });
      place(1); td.classList.add('is-on'); sc.classList.remove('is-on');
    });
  }

  var y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
})();
