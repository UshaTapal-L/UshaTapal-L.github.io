// Version 6: chaos to calm. The slider (and a first auto-play) moves every product piece
// from a messy pile into a tidy dashboard; the sticky-note mess fades away.
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var stage = document.querySelector('[data-stage]'), dial = document.querySelector('[data-calm]'), hint = document.querySelector('[data-hint]');
  if (stage && dial) {
    var frs = stage.querySelectorAll('.fr'), notes = stage.querySelectorAll('.note'), W = 0, H = 0, p = 0;
    function measure() { W = stage.clientWidth; H = stage.clientHeight; }
    frs.forEach(function (f) {
      var b = f.dataset.calmBox.split(',').map(Number), c = f.dataset.chaos.split(',').map(Number);
      f._b = b; f._c = c; // calm box: x,y,w,h in %; chaos: x,y in %, rotation, scale
      f.style.width = b[2] + '%'; f.style.height = b[3] + '%';
    });
    notes.forEach(function (n) { n._m = n.dataset.mess.split(',').map(Number); });
    function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
    function render() {
      var e = ease(p / 100);
      frs.forEach(function (f, i) {
        var b = f._b, c = f._c;
        var x = (c[0] + (b[0] - c[0]) * e) / 100 * W, y = (c[1] + (b[1] - c[1]) * e) / 100 * H;
        var r = c[2] * (1 - e), s = c[3] + (1 - c[3]) * e;
        f.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) rotate(' + r.toFixed(2) + 'deg) scale(' + s.toFixed(3) + ')';
        f.style.zIndex = e > .5 ? 1 : (i % 4) + 1;
      });
      notes.forEach(function (n, i) {
        var m = n._m, k = Math.min(1, e * 1.6), dir = i % 2 ? 1 : -1;
        n.style.transform = 'translate(' + ((m[0] / 100 * W) + dir * k * W * .25).toFixed(1) + 'px,' + ((m[1] / 100 * H) - k * H * .2).toFixed(1) + 'px) rotate(' + (m[2] + dir * k * 30) + 'deg)';
        n.style.opacity = (1 - k).toFixed(3); n.style.zIndex = 6;
      });
      stage.classList.toggle('is-calm', p >= 99);
      if (hint) hint.textContent = p >= 99 ? 'ahh, calm. (drag back for chaos)' : p <= 1 ? '← drag me, or just watch' : 'tidying…';
    }
    measure(); render();
    addEventListener('resize', function () { measure(); render(); });
    var touched = false;
    dial.addEventListener('input', function () { touched = true; p = +dial.value; render(); });
    function autoplay() {
      if (touched) return;
      var t0 = null, dur = 2600;
      (function step(t) {
        if (touched) return;
        if (!t0) t0 = t; var k = Math.min(1, (t - t0) / dur);
        p = k * 100; dial.value = p; render();
        if (k < 1) requestAnimationFrame(step);
      })(performance.now());
    }
    if (reduce) { p = 100; dial.value = 100; render(); }
    else if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); setTimeout(autoplay, 1400); } }, { threshold: .5 });
      io.observe(stage);
    } else setTimeout(autoplay, 1400);
  }

  // recipe: tick every ingredient to bake
  var boxes = document.querySelectorAll('.ing input'), served = document.querySelector('[data-served]');
  boxes.forEach(function (b) {
    b.addEventListener('change', function () {
      var all = Array.prototype.every.call(boxes, function (x) { return x.checked; });
      served.classList.toggle('is-done', all);
      served.textContent = all ? 'served warm: a calm product, +40% satisfaction ✓' : 'tick all four to bake ✓';
      if (all) { var r = served.getBoundingClientRect(); burst(r.left + r.width / 2, r.top, 40); }
    });
  });

  // confetti
  var COLORS = ['#b8506b', '#e4889c', '#b9d3a1', '#2e3b2f', '#f6e7b4'];
  function burst(x, y, n) {
    if (reduce) return;
    for (var i = 0; i < n; i++) (function () {
      var c = document.createElement('span'); c.className = 'cf'; c.setAttribute('aria-hidden', 'true'); c.style.background = COLORS[i % COLORS.length]; document.body.appendChild(c);
      var a = Math.random() * Math.PI * 2, v = 4 + Math.random() * 7, vx = Math.cos(a) * v, vy = Math.sin(a) * v - 6, px = x, py = y, r = 0, life = 0;
      (function f() { life++; vy += .35; px += vx; py += vy; r += 12; c.style.transform = 'translate(' + px + 'px,' + py + 'px) rotate(' + r + 'deg)'; c.style.opacity = 1 - life / 70; if (life < 70) requestAnimationFrame(f); else c.remove(); })();
    })();
  }

  // copy email
  document.querySelectorAll('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var r = b.getBoundingClientRect(); burst(r.left + r.width / 2, r.top, 46);
      try { navigator.clipboard.writeText(b.dataset.copy).then(function () { b.textContent = 'Copied'; setTimeout(function () { b.textContent = 'Copy'; }, 1600); }, function () {}); } catch (e) {}
    });
  });
})();
