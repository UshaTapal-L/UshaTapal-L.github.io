// Version 13: each floor of the exploded drawing (or a chip) jumps straight
// to its section, with no scroll animation.
(function () {
  var look = document.querySelector('[data-look]'); if (!look) return;
  look.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]'); if (!a) return;
    var t = document.querySelector(a.getAttribute('href')); if (!t) return;
    e.preventDefault();
    t.scrollIntoView({ behavior: 'instant', block: 'start' });
    history.pushState(null, '', a.getAttribute('href'));
    var f = t.querySelector('h2, h1'); if (f) { f.setAttribute('tabindex', '-1'); f.focus({ preventScroll: true }); }
  });
})();
