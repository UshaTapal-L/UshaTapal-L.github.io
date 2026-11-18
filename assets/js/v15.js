// Version 15: home hero explorations. A tilts the ring toward the cursor,
// B pulls the two rings apart, C lets colour follow the cursor under glass.
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  var a = document.querySelector('[data-tilt]');
  if (a) {
    var ring = a.querySelector('.ring');
    a.addEventListener('pointermove', function (e) {
      var r = a.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      ring.style.setProperty('--ry', (x * 30).toFixed(1) + 'deg'); ring.style.setProperty('--rx', (-y * 34).toFixed(1) + 'deg');
    });
    a.addEventListener('pointerleave', function () { ring.style.setProperty('--ry', '0deg'); ring.style.setProperty('--rx', '0deg'); });
  }

  var b = document.querySelector('[data-pull]');
  if (b) {
    b.addEventListener('pointermove', function (e) {
      var r = b.getBoundingClientRect(), x = Math.abs((e.clientX - r.left) / r.width - .5);
      b.querySelectorAll('.ring').forEach(function (g) { g.style.setProperty('--px', (x * 18).toFixed(1) + 'vw'); });
    });
    b.addEventListener('pointerleave', function () { b.querySelectorAll('.ring').forEach(function (g) { g.style.setProperty('--px', '0px'); }); });
  }

  var c = document.querySelector('[data-glow]');
  if (c) {
    var d1 = c.querySelector('.d1'), d2 = c.querySelector('.d2');
    var t = { x: .35, y: .5 }, p1 = { x: .35, y: .5 }, p2 = { x: .65, y: .55 }, on = false, t0 = performance.now();
    c.addEventListener('pointermove', function (e) { var r = c.getBoundingClientRect(); t.x = (e.clientX - r.left) / r.width; t.y = (e.clientY - r.top) / r.height; on = true; });
    c.addEventListener('pointerleave', function () { on = false; });
    var vis = true;
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; }).observe(c);
    (function loop(now) {
      if (vis) {
        var w = c.clientWidth, h = c.clientHeight, s = (now - t0) / 1000;
        if (!on) { t.x = .5 + Math.cos(s * .5) * .25; t.y = .5 + Math.sin(s * .7) * .2; }
        p1.x += (t.x - p1.x) * .08; p1.y += (t.y - p1.y) * .08;
        p2.x += ((1 - t.x * .6) - p2.x) * .04; p2.y += ((t.y * .5 + .35) - p2.y) * .04;
        d1.style.transform = 'translate(' + (p1.x * w).toFixed(0) + 'px,' + (p1.y * h).toFixed(0) + 'px)';
        d2.style.transform = 'translate(' + (p2.x * w).toFixed(0) + 'px,' + (p2.y * h).toFixed(0) + 'px)';
      }
      requestAnimationFrame(loop);
    })(t0);
  }
})();
