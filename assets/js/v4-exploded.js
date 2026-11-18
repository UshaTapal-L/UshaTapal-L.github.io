// Version 4: click a floor of the exploded drawing (or a chip) and you are
// there straight away, with no walk, zoom or scroll animation.
(function () {
  var sec = document.querySelector('.hs'); if (!sec) return;
  sec.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]'); if (!a) return;
    var t = document.querySelector(a.getAttribute('href')); if (!t) return;
    e.preventDefault();
    t.scrollIntoView({ behavior: 'instant', block: 'start' });
    history.pushState(null, '', a.getAttribute('href'));
  });
})();
