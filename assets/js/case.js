// Public case-study pages: annotated screen explorer (tabs, pins and arrows to notes).
(function () {
  // "All work" links return to whichever home version opened the case study (main, v2 or v3).
  var HOME_KEY = 'portfolio-home';
  try {
    var ref = document.referrer ? new URL(document.referrer) : null;
    if (ref && ref.origin === location.origin) {
      var m = ref.pathname.match(/\/(index|v2|v3)\.html$/) || (/\/$/.test(ref.pathname) ? ['', 'index'] : null);
      if (m) sessionStorage.setItem(HOME_KEY, m[1] + '.html');
    }
  } catch (e) {}
  function fixHomeLinks(root) {
    var home = null;
    try { home = sessionStorage.getItem(HOME_KEY); } catch (e) {}
    if (!home || home === 'index.html') return;
    root.querySelectorAll('a[href^="../index.html"]').forEach(function (a) {
      a.setAttribute('href', a.getAttribute('href').replace('../index.html', '../' + home));
    });
  }
  fixHomeLinks(document);
  // Annotated screens: tabs switch screens; arrows run from each pin on the screen to its note.
  function wireAnn() {
    document.querySelectorAll('[data-ann]').forEach(function (ann) {
      var tabs = Array.prototype.slice.call(ann.querySelectorAll('.ann__tab'));
      var panels = Array.prototype.slice.call(ann.querySelectorAll('.ann__panel'));
      function draw(panel) {
        var svg = panel.querySelector('.ann__lines');
        if (!svg) return;
        svg.innerHTML = '';
        if (window.innerWidth < 900 || panel.hidden) return;
        var box = panel.getBoundingClientRect();
        svg.setAttribute('viewBox', '0 0 ' + box.width + ' ' + box.height);
        panel.querySelectorAll('.ann__pin').forEach(function (pin) {
          var note = panel.querySelector('.ann__note[data-n="' + pin.dataset.n + '"] .ann__num');
          if (!note) return;
          var a = pin.getBoundingClientRect(), b = note.getBoundingClientRect();
          var x1 = a.left + a.width / 2 - box.left, y1 = a.top + a.height / 2 - box.top;
          var x2 = b.left - box.left - 6, y2 = b.top + b.height / 2 - box.top;
          var mx = x2 - 28;
          var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          path.setAttribute('d', 'M' + x1 + ' ' + y1 + ' L' + mx + ' ' + y2 + ' L' + x2 + ' ' + y2);
          path.setAttribute('data-n', pin.dataset.n);
          svg.appendChild(path);
          var dot = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          dot.setAttribute('d', 'M' + (x2 - 7) + ' ' + (y2 - 4) + ' L' + x2 + ' ' + y2 + ' L' + (x2 - 7) + ' ' + (y2 + 4));
          dot.setAttribute('class', 'ann__head'); dot.setAttribute('data-n', pin.dataset.n);
          svg.appendChild(dot);
        });
      }
      function select(i) {
        tabs.forEach(function (t, j) { t.setAttribute('aria-selected', i === j); t.tabIndex = i === j ? 0 : -1; });
        panels.forEach(function (p, j) { p.hidden = i !== j; });
        var img = panels[i].querySelector('img');
        if (img && !img.complete) img.addEventListener('load', function () { draw(panels[i]); }, { once: true });
        draw(panels[i]);
      }
      tabs.forEach(function (t, i) {
        t.addEventListener('click', function () { select(i); });
        t.addEventListener('keydown', function (e) {
          var k = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
          if (k) { e.preventDefault(); var n = (i + k + tabs.length) % tabs.length; select(n); tabs[n].focus(); }
        });
      });
      panels.forEach(function (panel) {
        function hl(n, on) { panel.querySelectorAll('[data-n="' + n + '"]').forEach(function (el) { el.classList.toggle('is-hl', on); }); }
        panel.querySelectorAll('.ann__pin, .ann__note').forEach(function (el) {
          el.addEventListener('mouseenter', function () { hl(el.dataset.n, true); });
          el.addEventListener('mouseleave', function () { hl(el.dataset.n, false); });
          el.addEventListener('focus', function () { hl(el.dataset.n, true); });
          el.addEventListener('blur', function () { hl(el.dataset.n, false); });
        });
        panel.querySelectorAll('img').forEach(function (img) { img.addEventListener('load', function () { draw(panel); }); });
      });
      window.addEventListener('resize', function () { panels.forEach(draw); });
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { panels.forEach(draw); });
      select(0);
    });
  }
  wireAnn();
})();
