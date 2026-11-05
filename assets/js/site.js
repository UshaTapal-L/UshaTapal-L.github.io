// Home page: year, active nav link, gentle reveal on scroll.
(function () {
  var root = document.querySelector('.sw');
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  var links = document.querySelectorAll('.g-nav a');
  var ids = ['work', 'agent', 'about'];
  function onScroll() {
    var current = '';
    ids.forEach(function (id) { var s = document.getElementById(id); if (s && s.getBoundingClientRect().top < 140) current = id; });
    links.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + current); });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Content is visible without JS; with JS, sections settle in once as they enter.
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var items = document.querySelectorAll('.sw .reveal');
  if (root && !reduce && 'IntersectionObserver' in window) {
    items.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in'); });
    root.classList.add('js-reveal');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -10% 0px' });
    items.forEach(function (el) { if (!el.classList.contains('is-in')) io.observe(el); });
  }
})();
