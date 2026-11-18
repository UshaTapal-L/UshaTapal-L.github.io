// How I work: point at, focus or tap a step to show what it produces.
(function () {
  var root = document.querySelector('[data-ps-root]'); if (!root) return;
  var btns = [].slice.call(root.querySelectorAll('[data-ps]')), panels = [].slice.call(root.querySelectorAll('[data-pp]'));
  var fine = matchMedia('(hover: hover)').matches, cur = 0;
  function show(i) {
    if (i === cur) return; cur = i;
    btns.forEach(function (b, j) { b.classList.toggle('on', j === i); b.setAttribute('aria-selected', j === i); });
    panels.forEach(function (p, j) { p.hidden = j !== i; });
  }
  btns.forEach(function (b, i) {
    b.addEventListener('click', function () { show(i); });
    b.addEventListener('focus', function () { show(i); });
    if (fine) b.addEventListener('pointerenter', function () { show(i); });
    b.addEventListener('keydown', function (e) {
      var k = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0; if (!k) return;
      e.preventDefault(); btns[(i + k + btns.length) % btns.length].focus();
    });
  });
})();
