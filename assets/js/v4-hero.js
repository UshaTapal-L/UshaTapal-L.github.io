// Version 4 hero: rose and matcha light follow the cursor behind ribbed glass.
// Drifts on its own on touch screens; still with reduced motion.
(function () {
  var c = document.querySelector('[data-glow]'); if (!c) return;
  var d1 = c.querySelector('.rg-d1'), d2 = c.querySelector('.rg-d2');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var t = { x: .62, y: .62 }, p1 = { x: .62, y: .62 }, p2 = { x: .82, y: .45 }, on = false, vis = true, t0 = performance.now();
  function place() {
    var w = c.clientWidth, h = c.clientHeight;
    d1.style.transform = 'translate(' + (p1.x * w).toFixed(0) + 'px,' + (p1.y * h).toFixed(0) + 'px)';
    d2.style.transform = 'translate(' + (p2.x * w).toFixed(0) + 'px,' + (p2.y * h).toFixed(0) + 'px)';
  }
  if (reduce) { place(); addEventListener('resize', place); return; }
  c.addEventListener('pointermove', function (e) { var r = c.getBoundingClientRect(); t.x = (e.clientX - r.left) / r.width; t.y = (e.clientY - r.top) / r.height; on = true; });
  c.addEventListener('pointerleave', function () { on = false; });
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; }).observe(c);
  (function loop(now) {
    if (vis) {
      var s = (now - t0) / 1000;
      if (!on) { t.x = .6 + Math.cos(s * .5) * .22; t.y = .6 + Math.sin(s * .7) * .2; }
      p1.x += (t.x - p1.x) * .08; p1.y += (t.y - p1.y) * .08;
      p2.x += ((1 - t.x * .6) - p2.x) * .04; p2.y += ((t.y * .5 + .3) - p2.y) * .04;
      place();
    }
    requestAnimationFrame(loop);
  })(t0);
})();
