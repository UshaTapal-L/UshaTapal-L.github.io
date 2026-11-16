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
  var items = document.querySelectorAll('.lt-item, .bx-t');
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


  // Hero desk: drag objects; scatter or tidy them
  var desk = document.querySelector('[data-desk]');
  if (desk) {
    var obs = desk.querySelectorAll('.ob');
    obs.forEach(function (o) {
      var sx, sy, ox, oy, id = null;
      o.addEventListener('pointerdown', function (e) {
        id = e.pointerId; o.setPointerCapture(id); o.classList.add('is-drag');
        sx = e.clientX; sy = e.clientY; ox = parseFloat(o.style.getPropertyValue('--dx')) || 0; oy = parseFloat(o.style.getPropertyValue('--dy')) || 0;
      });
      o.addEventListener('pointermove', function (e) {
        if (id !== e.pointerId) return;
        o.style.setProperty('--dx', (ox + e.clientX - sx) + 'px'); o.style.setProperty('--dy', (oy + e.clientY - sy) + 'px');
      });
      function end(e) { if (id !== e.pointerId) return; id = null; o.classList.remove('is-drag'); }
      o.addEventListener('pointerup', end); o.addEventListener('pointercancel', end);
    });
    var sc = document.querySelector('[data-scatter]'), td = document.querySelector('[data-tidy]');
    if (sc) sc.addEventListener('click', function () {
      obs.forEach(function (o) {
        o.style.setProperty('--dx', Math.round(Math.random() * 120 - 60) + 'px'); o.style.setProperty('--dy', Math.round(Math.random() * 90 - 45) + 'px');
        o.style.setProperty('--r', Math.round(Math.random() * 30 - 15) + 'deg');
      });
      sc.classList.add('is-on'); td.classList.remove('is-on');
    });
    if (td) td.addEventListener('click', function () {
      obs.forEach(function (o) { o.style.setProperty('--dx', '0px'); o.style.setProperty('--dy', '0px'); o.style.setProperty('--r', '0deg'); });
      td.classList.add('is-on'); sc.classList.remove('is-on');
    });
  }

  var y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
})();
