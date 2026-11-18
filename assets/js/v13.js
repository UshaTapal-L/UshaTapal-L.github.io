// Version 13: the exploded drawing opens as you scroll to it; clicking a floor
// (or a chip) jumps straight to that section with no scroll animation.
(function () {
  var look = document.querySelector('[data-look]'); if (!look) return;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches, svg = look.querySelector('.ax');

  function jump(e) {
    var a = e.target.closest('a[href^="#"]'); if (!a) return;
    var t = document.querySelector(a.getAttribute('href')); if (!t) return;
    e.preventDefault();
    t.scrollIntoView({ behavior: 'instant', block: 'start' });
    history.pushState(null, '', a.getAttribute('href'));
    var f = t.querySelector('h2, h1'); if (f) { f.setAttribute('tabindex', '-1'); f.focus({ preventScroll: true }); }
  }
  look.addEventListener('click', jump);

  svg.addEventListener('pointerover', function (e) { look.classList.toggle('dim', !!e.target.closest('.fl')); });
  svg.addEventListener('pointerleave', function () { look.classList.remove('dim'); });

  if (reduce) return;
  var raf = 0;
  function upd() {
    raf = 0;
    var r = svg.getBoundingClientRect(), p = (innerHeight - r.top) / (innerHeight * .9);
    svg.style.setProperty('--e', Math.min(1, Math.max(0, p)).toFixed(3));
  }
  addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(upd); }, { passive: true });
  addEventListener('resize', upd); upd();
})();
