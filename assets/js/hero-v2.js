// Version 2 hero: drag (or arrow-key) between the blueprint and the screen.
// On load, once the walls have drawn, the screen slides in to the halfway mark.
(function () {
  var box = document.querySelector('.bp'), range = box && box.querySelector('.bp-range');
  if (!box || !range) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function set(v) { box.style.setProperty('--split', v + '%'); range.value = v; }
  range.addEventListener('input', function () { touched = true; set(+range.value); });
  var touched = false;
  if (reduce) { set(50); return; }
  set(100);
  setTimeout(function () {
    if (touched) return;
    var start = null, from = 100, to = 50, dur = 1100;
    function step(t) {
      if (touched) return;
      if (!start) start = t;
      var p = Math.min(1, (t - start) / dur), e = 1 - Math.pow(1 - p, 3);
      set(Math.round((from + (to - from) * e) * 10) / 10);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, 2100);
})();
