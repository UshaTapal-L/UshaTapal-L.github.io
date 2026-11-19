// Project pages: Home returns to the page that opened this one, boards fade in,
// and screen strips scroll by drag, arrows or keys. Runs again after a locked page unlocks.
(function () {
  document.documentElement.classList.add('js');
  try {
    var r = document.referrer && new URL(document.referrer);
    if (r && r.origin === location.origin && !/\/work\//.test(r.pathname))
      document.querySelectorAll('[data-home]').forEach(function (a) { a.href = r.pathname + r.search; });
  } catch (e) {}

  function init(root) {
    var els = root.querySelectorAll('.rv:not(.in)');
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
      }, { rootMargin: '0px 0px -8% 0px' });
      els.forEach(function (el) { io.observe(el); });
    } else els.forEach(function (el) { el.classList.add('in'); });

    root.querySelectorAll('[data-strip]').forEach(function (wrap) {
      if (wrap._on) return; wrap._on = true;
      var s = wrap.querySelector('.cs-strip'), prev = wrap.querySelector('[data-prev]'), next = wrap.querySelector('[data-next]');
      function by(dir) { var f = s.querySelector('figure'); s.scrollBy({ left: dir * (f ? f.offsetWidth + 18 : 400), behavior: 'smooth' }); }
      function sync() { if (!prev) return; prev.disabled = s.scrollLeft < 4; next.disabled = s.scrollLeft + s.clientWidth > s.scrollWidth - 4; }
      if (prev) { prev.addEventListener('click', function () { by(-1); }); next.addEventListener('click', function () { by(1); }); }
      s.addEventListener('scroll', sync, { passive: true }); addEventListener('resize', sync); setTimeout(sync, 300);
      s.tabIndex = 0;
      s.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') { by(1); e.preventDefault(); } if (e.key === 'ArrowLeft') { by(-1); e.preventDefault(); } });
      var down = false, x0 = 0, l0 = 0;
      s.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; x0 = e.clientX; l0 = s.scrollLeft; });
      addEventListener('pointermove', function (e) { if (!down) return; if (Math.abs(e.clientX - x0) > 4) s.classList.add('drag'); s.scrollLeft = l0 - (e.clientX - x0); });
      addEventListener('pointerup', function () { if (!down) return; down = false; s.classList.remove('drag'); });
    });
  }
  init(document);
  document.addEventListener('unlocked', function () { init(document.getElementById('content') || document); });
})();
