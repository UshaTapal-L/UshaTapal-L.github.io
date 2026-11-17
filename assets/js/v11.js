// Version 11: the hero demo. Suggest -> review -> approve, then the numbers move.
(function () {
  var d = document.querySelector('[data-demo]'); if (!d) return;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var steps = d.querySelectorAll('[data-step]'), gaps = d.querySelector('[data-d-gaps]'), ans = d.querySelector('[data-d-ans]'), pct = d.querySelector('[data-d-pct]'), bar = d.querySelector('[data-d-bar]');
  function show(n) { steps.forEach(function (s) { s.hidden = +s.dataset.step !== n; }); var b = steps[n].querySelector('button'); if (b) b.focus({ preventScroll: true }); }
  function tween(el, from, to, suf, ms) {
    if (reduce) { el.textContent = to + suf; return; }
    var t0 = null; (function f(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(from + (to - from) * e) + suf; if (p < 1) requestAnimationFrame(f); })(performance.now());
  }
  d.querySelector('[data-d-why]').addEventListener('click', function () { var w = d.querySelector('[data-d-whytext]'); w.hidden = !w.hidden; });
  d.querySelector('[data-d-go]').addEventListener('click', function () { show(1); });
  d.querySelector('[data-d-back]').addEventListener('click', function () { show(0); });
  d.querySelector('[data-d-send]').addEventListener('click', function () {
    show(2);
    tween(gaps, 16, 4, '', 1200); tween(ans, 261, 390, '', 1200); tween(pct, 52, 78, '%', 1200);
    bar.style.width = '78%'; gaps.parentNode.classList.remove('warn'); gaps.parentNode.classList.add('good');
  });
  d.querySelector('[data-d-reset]').addEventListener('click', function () {
    gaps.textContent = '16'; ans.textContent = '261'; pct.textContent = '52%'; bar.style.width = '52%';
    gaps.parentNode.classList.add('warn'); gaps.parentNode.classList.remove('good'); d.querySelector('[data-d-whytext]').hidden = true; show(0);
  });
})();
