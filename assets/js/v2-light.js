// Version 2, light: word-by-word reveal on the about paragraph,
// plan/screen swap in the hero pill, copy email, current year.
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // About: words light up as the paragraph scrolls through the view
  document.querySelectorAll('[data-reveal]').forEach(function (p) {
    var words = p.textContent.trim().split(/\s+/);
    p.setAttribute('aria-label', p.textContent.trim());
    p.innerHTML = words.map(function (w) { return '<span class="w" aria-hidden="true">' + w.replace(/[<>&]/g, '') + '</span>'; }).join(' ');
    var spans = p.querySelectorAll('.w');
    if (reduce) { spans.forEach(function (s) { s.classList.add('on'); }); return; }
    function tick() {
      var r = p.getBoundingClientRect(), vh = innerHeight;
      var prog = (vh * 0.85 - r.top) / (r.height + vh * 0.35);
      var n = Math.round(Math.max(0, Math.min(1, prog)) * spans.length);
      for (var i = 0; i < spans.length; i++) spans[i].classList.toggle('on', i < n);
    }
    addEventListener('scroll', tick, { passive: true }); addEventListener('resize', tick); tick();
  });

  // Hero pill: my floor plan, then a product screen
  var sw = document.querySelector('.lt-swap');
  if (sw && !reduce) setInterval(function () { sw.classList.toggle('is-b'); }, 2600);

  // Copy email
  document.querySelectorAll('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var t = b.dataset.copy, done = function () { b.textContent = 'Copied'; setTimeout(function () { b.textContent = 'Copy'; }, 1600); };
      try { navigator.clipboard.writeText(t).then(done, function () {}); } catch (e) {}
    });
  });

  var y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
})();
