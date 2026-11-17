// Version 10: theme, reveals, hero growth, pinned horizontal reel, count-up numbers,
// pointer tilt, magnetic buttons, copy. All motion respects reduced-motion.
(function () {
  var root = document.documentElement, reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  var mode = document.querySelector('[data-mode]');
  function dark() { return root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches; }
  function label() { mode.setAttribute('aria-label', dark() ? 'Switch to light mode' : 'Switch to dark mode'); }
  mode.addEventListener('click', function () { root.dataset.theme = dark() ? 'light' : 'dark'; try { localStorage.setItem('ut-theme', root.dataset.theme); } catch (e) {} label(); });
  label();

  // reveals + count-up
  function count(el) {
    var n = +el.dataset.count, pre = el.dataset.pre || '', post = el.dataset.post || '', t0 = null;
    if (reduce) return;
    (function f(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / 1200), e = 1 - Math.pow(1 - p, 4); el.textContent = pre + Math.round(n * e) + post; if (p < 1) requestAnimationFrame(f); })(performance.now());
  }
  var els = document.querySelectorAll('.rv');
  if (reduce || !('IntersectionObserver' in window)) els.forEach(function (e) { e.classList.add('in'); });
  else {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) {
      if (!e.isIntersecting) return; e.target.classList.add('in'); io.unobserve(e.target);
      var c = e.target.querySelector('[data-count]'); if (c) count(c);
    }); }, { threshold: .15, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (e) { io.observe(e); });
  }

  // hero device settles as you scroll
  var shot = document.querySelector('[data-grow]');
  // reel
  var reel = document.querySelector('[data-reel]'), track = reel && reel.querySelector('[data-track]'), bar = reel && reel.querySelector('[data-bar]'), idx = reel && reel.querySelector('[data-reel-i]');
  var slides = track ? track.children.length : 0; if (reel) reel.style.setProperty('--n', slides);
  function wide() { return innerWidth > 900 && !reduce; }
  function onScroll() {
    if (shot) shot.style.setProperty('--g', reduce ? 1 : (.9 + Math.min(1, scrollY / (innerHeight * .6)) * .1).toFixed(4));
    if (!reel) return;
    var r = reel.getBoundingClientRect(), total = reel.offsetHeight - innerHeight, p = Math.min(1, Math.max(0, (52 - r.top) / Math.max(1, total)));
    if (wide()) {
      var first = track.children[0], last = track.children[slides - 1], max = Math.max(0, last.offsetLeft + last.offsetWidth - (innerWidth - first.offsetLeft)); track.style.setProperty('--tx', (-p * max).toFixed(1) + 'px');
      bar.style.setProperty('--p', (.25 + p * .75).toFixed(3));
      idx.textContent = '0' + Math.min(slides, 1 + Math.round(p * (slides - 1)));
    } else {
      track.style.removeProperty('--tx');
    }
  }
  if (track && !wide()) track.addEventListener('scroll', function () {
    var p = track.scrollLeft / Math.max(1, track.scrollWidth - track.clientWidth);
    bar.style.setProperty('--p', (.25 + p * .75).toFixed(3)); idx.textContent = '0' + Math.min(slides, 1 + Math.round(p * (slides - 1)));
  }, { passive: true });
  var raf = 0;
  addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(function () { raf = 0; onScroll(); }); }, { passive: true });
  addEventListener('resize', onScroll); onScroll();

  // touch: tap a word or decision to open it
  document.querySelectorAll('.words li, .dlist li').forEach(function (li) {
    li.addEventListener('click', function () { li.classList.toggle('on'); });
  });

  if (fine && !reduce) {
    // pointer tilt
    document.querySelectorAll('.tilt').forEach(function (t) {
      var host = t.closest('.slide') || t;
      host.addEventListener('pointermove', function (e) {
        var r = host.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        t.style.setProperty('--ry', (x * 10).toFixed(2) + 'deg'); t.style.setProperty('--rx', (-y * 8).toFixed(2) + 'deg');
      });
      host.addEventListener('pointerleave', function () { t.style.setProperty('--ry', '0deg'); t.style.setProperty('--rx', '0deg'); });
    });
    // magnetic
    document.querySelectorAll('.mag').forEach(function (m) {
      m.addEventListener('pointermove', function (e) {
        var r = m.getBoundingClientRect(); m.style.setProperty('--mx', ((e.clientX - r.left - r.width / 2) * .25).toFixed(1) + 'px'); m.style.setProperty('--my', ((e.clientY - r.top - r.height / 2) * .35).toFixed(1) + 'px');
      });
      m.addEventListener('pointerleave', function () { m.style.setProperty('--mx', '0px'); m.style.setProperty('--my', '0px'); });
    });
  }

  document.querySelectorAll('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () { try { navigator.clipboard.writeText(b.dataset.copy).then(function () { b.textContent = 'Copied'; setTimeout(function () { b.textContent = 'Copy'; }, 1600); }, function () {}); } catch (e) {} });
  });
})();
