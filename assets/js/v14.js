// Version 14: each room of the section (or its chip) jumps straight to its
// part of the page. Hovering a room lights its chip, and the other way round.
(function () {
  var sec = document.querySelector('.hs'); if (!sec) return;
  sec.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]'); if (!a) return;
    var t = document.querySelector(a.getAttribute('href')); if (!t) return;
    e.preventDefault();
    t.scrollIntoView({ behavior: 'instant', block: 'start' });
    history.pushState(null, '', a.getAttribute('href'));
  });
  function mark(k) { sec.querySelectorAll('[data-k]').forEach(function (el) { el.classList.toggle('on', el.dataset.k === k); }); }
  sec.querySelectorAll('[data-k]').forEach(function (el) {
    el.addEventListener('pointerenter', function () { mark(el.dataset.k); });
    el.addEventListener('pointerleave', function () { mark(null); });
    el.addEventListener('focus', function () { mark(el.dataset.k); });
    el.addEventListener('blur', function () { mark(null); });
  });
})();
