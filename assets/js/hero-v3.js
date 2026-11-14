// Version 3 hero: hover, focus or tap a desk object to read its note; the laptop and phone open their case studies.
(function () {
  var fig = document.querySelector('.dk-art'), note = fig && fig.querySelector('.dk-note');
  if (!fig || !note) return;
  var objs = Array.prototype.slice.call(fig.querySelectorAll('.dk-obj')), cur = null;
  function show(o) {
    if (cur && cur !== o) cur.classList.remove('is-on');
    cur = o; o.classList.add('is-on');
    var f = fig.getBoundingClientRect(), r = o.getBoundingClientRect();
    var x = Math.min(Math.max(r.left + r.width / 2 - f.left, 120), f.width - 120);
    note.style.left = x + 'px'; note.style.top = Math.max(r.top - f.top, 40) + 'px';
    note.textContent = o.dataset.note; note.classList.add('is-on');
  }
  function hide() { if (cur) cur.classList.remove('is-on'); cur = null; note.classList.remove('is-on'); }
  objs.forEach(function (o) {
    o.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') show(o); });
    o.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') hide(); });
    o.addEventListener('focus', function () { show(o); });
    o.addEventListener('blur', hide);
    o.addEventListener('click', function (e) {
      if (o.dataset.href && (e.pointerType === 'mouse' || cur === o)) { location.href = o.dataset.href; return; }
      show(o);
    });
    o.addEventListener('keydown', function (e) { if (e.key === 'Enter' && o.dataset.href) location.href = o.dataset.href; });
  });
  document.addEventListener('pointerdown', function (e) { if (!e.target.closest || !e.target.closest('.dk-obj')) hide(); });
})();
