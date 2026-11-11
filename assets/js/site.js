// Home page: year, active nav link, gentle reveal on scroll.
(function () {
  var root = document.querySelector('.sw');
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  var links = [];
  var ids = [];
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

  // Bento filter: pills show one category; nav and hero links can preselect one.
  var tiles = Array.prototype.slice.call(document.querySelectorAll('.bento .tile'));
  var buttons = Array.prototype.slice.call(document.querySelectorAll('.b-filter button'));
  function applyFilter(cat) {
    buttons.forEach(function (b) { var on = b.dataset.filter === cat; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on); });
    tiles.forEach(function (t) {
      var show = cat === 'all' || (' ' + t.dataset.cat + ' ').indexOf(' ' + cat + ' ') > -1;
      var was = !t.classList.contains('is-hidden');
      t.classList.toggle('is-hidden', !show);
      if (show && !was && !reduce) { t.classList.remove('is-pop'); void t.offsetWidth; t.classList.add('is-pop'); }
    });
  }
  buttons.forEach(function (b) { b.addEventListener('click', function () { applyFilter(b.dataset.filter); }); });
  document.querySelectorAll('[data-go]').forEach(function (a) {
    a.addEventListener('click', function () { applyFilter(a.dataset.go); });
  });
})();
