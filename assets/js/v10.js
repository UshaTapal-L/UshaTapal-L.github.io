// Version 10: theme toggle, gentle reveals, hero image that settles as you scroll, copy email.
(function () {
  var root = document.documentElement, reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var mode = document.querySelector('[data-mode]');
  function dark() { return root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches; }
  function label() { mode.setAttribute('aria-label', dark() ? 'Switch to light mode' : 'Switch to dark mode'); }
  mode.addEventListener('click', function () {
    root.dataset.theme = dark() ? 'light' : 'dark';
    try { localStorage.setItem('ut-theme', root.dataset.theme); } catch (e) {}
    label();
  });
  label();

  var els = document.querySelectorAll('.rv');
  if (reduce || !('IntersectionObserver' in window)) els.forEach(function (e) { e.classList.add('in'); });
  else {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (e) { io.observe(e); });
  }

  var shot = document.querySelector('[data-grow]');
  if (shot && !reduce) {
    var f = function () { var p = Math.min(1, Math.max(0, scrollY / (innerHeight * .6))); shot.style.setProperty('--g', (.9 + p * .1).toFixed(4)); };
    addEventListener('scroll', f, { passive: true }); f();
  } else if (shot) shot.style.setProperty('--g', 1);

  document.querySelectorAll('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      try { navigator.clipboard.writeText(b.dataset.copy).then(function () { b.textContent = 'Copied'; setTimeout(function () { b.textContent = 'Copy'; }, 1600); }, function () {}); } catch (e) {}
    });
  });
})();
