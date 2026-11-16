// Version 5 hero: four scenes that rotate; pause on hover/focus/interaction, dots to jump.
(function () {
  var box = document.querySelector('[data-hx4]'); if (!box) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var slides = box.querySelectorAll('.hx4-s'), dots = box.querySelectorAll('.hx4-dot'), pb = box.querySelector('.hx4-pause');
  var i = 0, DUR = 6000, t = null, paused = reduce, user = reduce;
  box.style.setProperty('--dur', DUR + 'ms');
  function show(n) {
    i = (n + slides.length) % slides.length;
    slides.forEach(function (s, k) { s.classList.toggle('is-on', k === i); s.toggleAttribute('inert', k !== i); });
    dots.forEach(function (d, k) { d.classList.remove('is-on'); void d.offsetWidth; d.classList.toggle('is-on', k === i); d.setAttribute('aria-current', k === i); });
    schedule();
  }
  function schedule() { clearTimeout(t); if (!paused) t = setTimeout(function () { show(i + 1); }, DUR); }
  function setPaused(p) { paused = p; box.classList.toggle('is-paused', p); pb.textContent = p ? '▶' : '❚❚'; pb.setAttribute('aria-label', p ? 'Play' : 'Pause'); schedule(); }
  dots.forEach(function (d, k) { d.addEventListener('click', function () { show(k); }); });
  pb.addEventListener('click', function () { user = !paused; setPaused(!paused); });
  box.addEventListener('mouseenter', function () { if (!user) setPaused(true); });
  box.addEventListener('mouseleave', function () { if (!user) setPaused(false); });
  box.addEventListener('focusin', function () { if (!user) setPaused(true); });
  // compare slider in scene 2
  var c = box.querySelector('[data-cmp]');
  if (c) { var r = c.querySelector('input'); r.addEventListener('input', function () { c.style.setProperty('--s', r.value + '%'); user = true; setPaused(true); }); }
  // swipe on touch
  var x0 = null;
  box.addEventListener('touchstart', function (e) { if (e.target.closest('[data-cmp]')) return; x0 = e.touches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', function (e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(dx) > 40) show(i + (dx < 0 ? 1 : -1)); });
  setPaused(paused); show(0);
})();
