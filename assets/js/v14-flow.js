// Version 14: the glow in each seam drifts sideways as you scroll past it,
// and each section's heading block rises in once.
(function () {
  var seams = [].slice.call(document.querySelectorAll('[data-seam]'));
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce) {
    var raf = 0;
    function upd() {
      raf = 0;
      seams.forEach(function (s, i) {
        var r = s.getBoundingClientRect(), p = (r.top + r.height / 2) / innerHeight; // 1 at bottom, 0 at top
        if (p < -.5 || p > 1.5) return;
        var dir = i % 2 ? -1 : 1;
        s.style.setProperty('--x', (50 + dir * (p - .5) * 50).toFixed(1) + '%');
      });
    }
    addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(upd); }, { passive: true });
    addEventListener('resize', upd); upd();
  }
  if (reduce || !('IntersectionObserver' in window)) return;
  var heads = document.querySelectorAll('.pr > :first-child, .jr > :first-child, .pg > :first-child');
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -10% 0px' });
  heads.forEach(function (h) { h.classList.add('flow-in'); io.observe(h); });
})();
// Playground row: drag to scroll with a mouse; vertical wheel scrolls it sideways only while you hold Shift.
(function () {
  var w = document.querySelector('.pg-wall'); if (!w || !matchMedia('(pointer: fine)').matches) return;
  var down = false, x0 = 0, s0 = 0, moved = false;
  w.addEventListener('pointerdown', function (e) { down = true; moved = false; x0 = e.clientX; s0 = w.scrollLeft; });
  addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - x0; if (Math.abs(dx) > 5) { moved = true; w.classList.add('drag'); } if (moved) w.scrollLeft = s0 - dx; });
  addEventListener('pointerup', function () { down = false; w.classList.remove('drag'); });
  w.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
})();
