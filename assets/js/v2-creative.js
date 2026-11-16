// Version 2 creative layer: doodles draw in, headings rise, sketch-to-screen compare,
// playground filter + video autoplay, bento tilt and an "Open" cursor bubble.
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // split [data-rise] headings into words (keeps inner markup per top-level node)
  document.querySelectorAll('[data-rise]').forEach(function (h) {
    var i = 0;
    Array.prototype.slice.call(h.childNodes).forEach(function (n) {
      if (n.nodeType === 3) {
        var frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(function (w) {
          if (!w) return;
          if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(w)); return; }
          var sp = document.createElement('span'); sp.className = 'rw'; sp.style.setProperty('--i', i++); sp.textContent = w; frag.appendChild(sp);
        });
        h.replaceChild(frag, n);
      } else if (n.nodeType === 1 && !n.classList.contains('dd')) {
        n.classList.add('rw'); n.style.setProperty('--i', i++);
      }
    });
  });

  // draw doodles / rise headings when they come into view
  var drawables = document.querySelectorAll('[data-rise], .dd--work, .lt-work__h, .dd-ring, .dd-sq, .pg-head');
  if (reduce || !('IntersectionObserver' in window)) drawables.forEach(function (d) { d.classList.add('is-drawn'); });
  else {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-drawn'); io.unobserve(e.target); } }); }, { threshold: 0.4 });
    drawables.forEach(function (d) { io.observe(d); });
  }

  // sketch-to-screen compare
  var cp = document.querySelector('[data-cp]');
  if (cp) {
    var box = cp.querySelector('.cp-box'), range = cp.querySelector('.cp-range'), sk = cp.querySelector('.cp-sk'), fin = cp.querySelector('.cp-fin');
    range.addEventListener('input', function () { box.style.setProperty('--split', range.value + '%'); });
    cp.querySelectorAll('[role="tab"]').forEach(function (t) {
      t.addEventListener('click', function () {
        cp.querySelectorAll('[role="tab"]').forEach(function (x) { x.setAttribute('aria-selected', x === t); });
        sk.style.opacity = fin.style.opacity = 0;
        setTimeout(function () {
          sk.src = t.dataset.sk; fin.src = t.dataset.fin; box.style.setProperty('--ar', t.dataset.ar);
          sk.alt = 'Pencil sketch of the ' + t.textContent + ' screen'; fin.alt = 'Final ' + t.textContent + ' screen';
          sk.style.opacity = fin.style.opacity = 1;
        }, 220);
      });
    });
  }

  // playground: filter + play videos only while visible
  var wall = document.querySelector('.pg-wall');
  if (wall) {
    var items = wall.querySelectorAll('.pg-i');
    document.querySelectorAll('.pg-filter button').forEach(function (b) {
      b.addEventListener('click', function () {
        document.querySelectorAll('.pg-filter button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
        items.forEach(function (it) { it.classList.toggle('is-out', b.dataset.f !== 'all' && it.dataset.cat !== b.dataset.f); });
      });
    });
    var vids = wall.querySelectorAll('video');
    if (!reduce && 'IntersectionObserver' in window) {
      var vio = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          var v = e.target, f = v.closest('.pg-i');
          if (e.isIntersecting) { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); f.classList.add('is-playing'); }
          else { v.pause(); f.classList.remove('is-playing'); }
        });
      }, { threshold: 0.5 });
      vids.forEach(function (v) { vio.observe(v); });
    }
    vids.forEach(function (v) {
      v.closest('.pg-i').addEventListener('click', function () {
        if (v.paused) { v.play(); v.closest('.pg-i').classList.add('is-playing'); } else { v.pause(); v.closest('.pg-i').classList.remove('is-playing'); }
      });
    });
  }

  // bento tilt + cursor bubble (desktop only)
  if (fine && !reduce) {
    var cur = document.createElement('div'); cur.className = 'cur'; cur.setAttribute('aria-hidden', 'true'); cur.textContent = 'Open ↗'; document.body.appendChild(cur);
    document.querySelectorAll('a.bx-t').forEach(function (t) {
      t.addEventListener('pointermove', function (e) {
        var r = t.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        t.style.setProperty('--ty', (x * 6).toFixed(2) + 'deg'); t.style.setProperty('--tx', (-y * 6).toFixed(2) + 'deg');
        cur.style.setProperty('--cx', e.clientX + 'px'); cur.style.setProperty('--cy', e.clientY + 'px'); cur.classList.add('is-on');
      });
      t.addEventListener('pointerleave', function () { t.style.setProperty('--tx', '0deg'); t.style.setProperty('--ty', '0deg'); cur.classList.remove('is-on'); });
    });
  }
})();

// Journal: open, page through, close
(function () {
  var stage = document.querySelector('[data-jr]'); if (!stage) return;
  var sec = stage.closest('.jr'), cover = stage.querySelector('[data-jr-open]'), book = stage.querySelector('.jr-book');
  var sps = book.querySelectorAll('.jr-sp'), cnt = book.querySelector('[data-jr-count]');
  var prev = book.querySelector('[data-jr-prev]'), next = book.querySelector('[data-jr-next]'), i = 0;
  function show(n, dir) {
    i = Math.max(0, Math.min(sps.length - 1, n));
    sps.forEach(function (sp, k) { sp.classList.toggle('is-on', k === i); sp.style.setProperty('--dir', (dir || 1) * 24 + 'px'); });
    cnt.textContent = (i + 1) + ' / ' + sps.length; prev.disabled = i === 0; next.disabled = i === sps.length - 1;
  }
  function open() {
    sec.classList.add('is-open'); book.removeAttribute('inert'); book.setAttribute('aria-hidden', 'false'); cover.setAttribute('aria-expanded', 'true');
    show(0); setTimeout(function () { next.focus({ preventScroll: true }); }, 700);
  }
  function close() {
    sec.classList.remove('is-open'); book.setAttribute('inert', ''); book.setAttribute('aria-hidden', 'true'); cover.setAttribute('aria-expanded', 'false');
    setTimeout(function () { cover.focus({ preventScroll: true }); }, 300);
    if (sec.getBoundingClientRect().top < 0) sec.scrollIntoView({ behavior: 'smooth' });
  }
  cover.addEventListener('click', open);
  book.querySelector('[data-jr-close]').addEventListener('click', close);
  prev.addEventListener('click', function () { show(i - 1, -1); });
  next.addEventListener('click', function () { show(i + 1, 1); });
  book.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') show(i + 1, 1); else if (e.key === 'ArrowLeft') show(i - 1, -1); else if (e.key === 'Escape') close();
  });
  show(0);
})();
