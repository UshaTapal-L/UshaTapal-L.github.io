// Version 5 fun layer: cursor with labels, draggable stickers, blobs, letter bounce,
// counting numbers, confetti on copy, sprinkles, and a name easter egg.
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var COLORS = ['#b8506b', '#e4889c', '#b9d3a1', '#2e3b2f', '#f2c94c', '#9fbf91'];

  // blobs behind sections
  [['.lt-work', 'a', '6%', '18%'], ['.pr', 'b', '70%', '10%'], ['.jr', 'c', '8%', '30%'], ['.pg', 'a', '72%', '20%']].forEach(function (b) {
    var s = document.querySelector(b[0]); if (!s) return;
    var d = document.createElement('span'); d.className = 'blob blob--' + b[1]; d.style.left = b[2]; d.style.top = b[3]; d.setAttribute('aria-hidden', 'true'); s.appendChild(d);
  });

  // letters bounce on hover in section headings (keeps <em> and doodles intact)
  document.querySelectorAll('.lt-work__h, #pr-h, #jr-h, #pg-h').forEach(function (h) {
    h.querySelectorAll('.rw, em').forEach(function (n) {
      if (n.querySelector('svg') || n.children.length) return;
      var t = n.textContent; n.textContent = '';
      t.split('').forEach(function (ch) { var sp = document.createElement('span'); sp.className = 'bl'; sp.textContent = ch; n.appendChild(sp); });
    });
    {
      Array.prototype.slice.call(h.childNodes).forEach(function (n) {
        if (n.nodeType !== 3) return;
        var f = document.createDocumentFragment();
        n.textContent.split('').forEach(function (ch) { if (ch === ' ') { f.appendChild(document.createTextNode(' ')); return; } var sp = document.createElement('span'); sp.className = 'bl'; sp.textContent = ch; f.appendChild(sp); });
        h.replaceChild(f, n);
      });
    }
  });

  // numbers count up when seen
  var nums = document.querySelectorAll('.hx4-row b, .hx4-k span');
  function countUp(el) {
    var m = el.textContent.match(/([+−-]?)(\d+)(.*)/); if (!m || reduce) return;
    var pre = m[1], n = +m[2], post = m[3], t0 = null;
    el.classList.add('ct');
    (function step(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / 900); el.textContent = pre + Math.round(n * (1 - Math.pow(1 - p, 3))) + post; if (p < 1) requestAnimationFrame(step); })(performance.now());
  }
  if ('IntersectionObserver' in window) {
    var nio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting && !e.target._c) { e.target._c = 1; countUp(e.target); } }); }, { threshold: .6 });
    nums.forEach(function (n) { nio.observe(n); });
  }

  // little speech bubble
  function say(x, y, text) {
    var b = document.createElement('span'); b.className = 'stk-say'; b.textContent = text;
    b.style.left = x + 'px'; b.style.top = y + 'px'; b.style.position = 'fixed'; document.body.appendChild(b);
    setTimeout(function () { b.remove(); }, 1700);
  }
  // confetti burst
  function burst(x, y, n, shape) {
    if (reduce) return;
    for (var i = 0; i < n; i++) (function () {
      var c = document.createElement('span'); c.className = 'cf'; c.setAttribute('aria-hidden', 'true');
      c.style.background = COLORS[Math.floor(Math.random() * COLORS.length)];
      if (shape === 'sprinkle') { c.style.width = '4px'; c.style.height = '12px'; c.style.borderRadius = '4px'; }
      document.body.appendChild(c);
      var a = Math.random() * Math.PI * 2, v = 4 + Math.random() * 7, vx = Math.cos(a) * v, vy = Math.sin(a) * v - 6, px = x, py = y, r = Math.random() * 360, life = 0;
      (function f() {
        life++; vy += .35; vx *= .98; px += vx; py += vy; r += 12;
        c.style.transform = 'translate(' + px + 'px,' + py + 'px) rotate(' + r + 'deg)'; c.style.opacity = Math.max(0, 1 - life / 70);
        if (life < 70) requestAnimationFrame(f); else c.remove();
      })();
    })();
  }

  // stickers: drag them, click for a surprise
  document.querySelectorAll('.stk').forEach(function (s) {
    var sx, sy, ox, oy, id = null, moved = false;
    s.addEventListener('pointerdown', function (e) { id = e.pointerId; s.setPointerCapture(id); moved = false; sx = e.clientX; sy = e.clientY; ox = parseFloat(s.style.getPropertyValue('--dx')) || 0; oy = parseFloat(s.style.getPropertyValue('--dy')) || 0; });
    s.addEventListener('pointermove', function (e) {
      if (id !== e.pointerId) return; var dx = e.clientX - sx, dy = e.clientY - sy;
      if (!moved && Math.abs(dx) + Math.abs(dy) > 5) { moved = true; s.classList.add('is-drag'); }
      if (moved) { s.style.setProperty('--dx', (ox + dx) + 'px'); s.style.setProperty('--dy', (oy + dy) + 'px'); }
    });
    function end(e) { if (id !== e.pointerId) return; id = null; s.classList.remove('is-drag'); if (!moved && e.type === 'pointerup') pop(s); }
    s.addEventListener('pointerup', end); s.addEventListener('pointercancel', end);
    s.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pop(s); } });
  });
  function pop(s) {
    var r = s.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    say(x, r.top, s.dataset.say);
    burst(x, y, s.classList.contains('stk--cookie') ? 40 : 18, s.classList.contains('stk--cookie') ? 'sprinkle' : '');
  }

  // confetti when the email is copied
  document.querySelectorAll('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () { var r = b.getBoundingClientRect(); burst(r.left + r.width / 2, r.top, 46); });
  });

  // easter egg: click my name five times
  var clicks = 0, last = 0;
  document.querySelectorAll('[data-egg]').forEach(function (n) {
    n.addEventListener('click', function (e) {
      var now = Date.now(); clicks = now - last < 900 ? clicks + 1 : 1; last = now;
      if (clicks >= 5) {
        clicks = 0; burst(e.clientX, e.clientY, 60);
        var t = document.createElement('div'); t.className = 'toast5'; t.setAttribute('role', 'status');
        t.textContent = 'Secret unlocked: I’ll bake you cookies if we work together.';
        document.body.appendChild(t); setTimeout(function () { t.remove(); }, 3300);
      }
    });
  });

  // fun cursor (desktop)
  if (fine) {
    var fc = document.createElement('div'); fc.className = 'fc'; fc.setAttribute('aria-hidden', 'true'); fc.innerHTML = '<i></i><b></b>'; document.body.appendChild(fc);
    var lab = fc.querySelector('b');
    function labelFor(el) {
      if (!el || !el.closest) return '';
      if (el.closest('.stk')) return 'drag me';
      if (el.closest('a.bx-t')) return 'open ↗';
      if (el.closest('[data-cmp]')) return '⟷ drag';
      if (el.closest('.jr-cover')) return 'open me';
      if (el.closest('.pg-i')) return el.closest('.pg-i').querySelector('video') ? '▶ play' : 'look';
      if (el.closest('[data-copy]')) return 'copy!';
      if (el.closest('[data-egg]')) return 'hi!';
      return '';
    }
    addEventListener('pointermove', function (e) {
      fc.style.setProperty('--cx', e.clientX + 'px'); fc.style.setProperty('--cy', e.clientY + 'px');
      var l = labelFor(e.target); fc.classList.toggle('has-label', !!l); if (l) lab.textContent = l;
    }, { passive: true });
    addEventListener('pointerdown', function () { fc.classList.add('is-down'); });
    addEventListener('pointerup', function () { fc.classList.remove('is-down'); });
  }
})();
