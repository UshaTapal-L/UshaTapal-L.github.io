// About me options: journal page turning, and drag-to-scroll for the polaroids.
(function () {
  var jn = document.querySelector('[data-jn]');
  if (jn) {
    var pages = [].slice.call(jn.querySelectorAll('[data-pg]')), n = jn.querySelector('[data-jn-n]'), i = 0;
    function show(k) { i = (k + pages.length) % pages.length; pages.forEach(function (p, j) { p.hidden = j !== i; }); n.textContent = (i + 1) + ' / ' + pages.length; }
    jn.querySelector('[data-jn-prev]').addEventListener('click', function () { show(i - 1); });
    jn.querySelector('[data-jn-next]').addEventListener('click', function () { show(i + 1); });
    var sx = null;
    jn.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    jn.addEventListener('touchend', function (e) { if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) show(i + (dx < 0 ? 1 : -1)); sx = null; });
  }
  var pl = document.querySelector('[data-pl]');
  if (pl && matchMedia('(pointer: fine)').matches) {
    var down = false, x0 = 0, s0 = 0;
    pl.addEventListener('pointerdown', function (e) { down = true; x0 = e.clientX; s0 = pl.scrollLeft; pl.classList.add('drag'); });
    addEventListener('pointermove', function (e) { if (down) pl.scrollLeft = s0 - (e.clientX - x0); });
    addEventListener('pointerup', function () { down = false; pl.classList.remove('drag'); });
  }
})();
