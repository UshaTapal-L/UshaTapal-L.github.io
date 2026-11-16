// Tapal Draft 2.0: playful pieces drawn from Usha's architecture sheets.
// Each piece switches on from a data attribute, so any page can opt in.
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var cssVar = function (n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); };

  /* ---------- pencil cursor: a fading graphite line with dimension ticks ---------- */
  if (document.body.hasAttribute('data-fx-trail') && fine && !reduce) {
    var cv = document.createElement('canvas'); cv.className = 'fx-trail'; cv.setAttribute('aria-hidden', 'true'); document.body.appendChild(cv);
    var cx = cv.getContext('2d'), pts = [], dpr = 1, col = '#6d6670', LIFE = 700;
    var size = function () { dpr = window.devicePixelRatio || 1; cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; col = cssVar('--fx-pencil') || col; };
    size(); addEventListener('resize', size);
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', size);
    addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse') pts.push({ x: e.clientX, y: e.clientY, t: performance.now() }); }, { passive: true });
    var tick = function (p, q, a) {
      var dx = q.x - p.x, dy = q.y - p.y, d = Math.hypot(dx, dy) || 1, nx = -dy / d * 5, ny = dx / d * 5;
      cx.globalAlpha = a; cx.beginPath(); cx.moveTo(p.x - nx, p.y - ny); cx.lineTo(p.x + nx, p.y + ny); cx.stroke();
    };
    (function loop() {
      var now = performance.now();
      while (pts.length && now - pts[0].t > LIFE) pts.shift();
      cx.setTransform(dpr, 0, 0, dpr, 0, 0); cx.clearRect(0, 0, innerWidth, innerHeight);
      cx.strokeStyle = col; cx.lineWidth = 1.2; cx.lineCap = 'round';
      for (var i = 1; i < pts.length; i++) {
        cx.globalAlpha = (1 - (now - pts[i].t) / LIFE) * .6;
        cx.beginPath(); cx.moveTo(pts[i - 1].x, pts[i - 1].y); cx.lineTo(pts[i].x, pts[i].y); cx.stroke();
      }
      if (pts.length > 3) { tick(pts[0], pts[1], .35); tick(pts[pts.length - 1], pts[pts.length - 2], .5); }
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- measuring line with walking scale people ---------- */
  var SAYS = ['Hi!', 'Scale 1:100', 'Nice grid', 'Mind the step', 'Structure first', 'Just measuring', 'Woof!', 'Coffee break?', 'Love this flow'];
  function personSVG(kind) {
    if (kind === 'dog') return '<svg viewBox="0 0 30 20"><ellipse class="f" cx="15" cy="9" rx="9" ry="4"/><circle class="f" cx="25" cy="5" r="3.2"/><path class="s" d="M25 3 l2 -3"/>' +
      '<path class="s fx-tail" d="M6 8 l-5 -5"/><g class="fx-leg"><path class="s" d="M10 12 v7 M20 12 v7"/></g><g class="fx-leg"><path class="s" d="M12 12 v7 M18 12 v7"/></g></svg>';
    var extra = kind === 'tsquare' ? '<path class="s" d="M18 22 V6 M14 6 h8"/>' : kind === 'laptop' ? '<rect class="f" x="14" y="18" width="9" height="6" rx="1"/>' : kind === 'balloon' ? '<path class="s" d="M17 21 C18 14 15 8 17 2" style="stroke-width:1"/><circle cx="17" cy="0" r="4.5" style="fill:var(--fx-coral)"/>' : '';
    return '<svg viewBox="0 0 22 44"><circle class="f" cx="11" cy="5" r="4"/><path class="s" d="M11 10 V26"/>' +
      '<g class="fx-arm"><path class="s" d="M11 13 L5 22"/></g><g class="fx-arm" style="animation-direction:alternate"><path class="s" d="M11 13 L17 22"/></g>' + extra +
      '<g class="fx-leg"><path class="s" d="M11 26 L7 43"/></g><g class="fx-leg"><path class="s" d="M11 26 L15 43"/></g></svg>';
  }
  function bubble(host, text) {
    var b = host.querySelector('.fx-bubble'); if (!b) { b = document.createElement('span'); b.className = 'fx-bubble'; host.appendChild(b); }
    b.textContent = text; b.classList.add('is-on'); clearTimeout(b._t); b._t = setTimeout(function () { b.classList.remove('is-on'); }, 1600);
  }
  $$('[data-fx-measure]').forEach(function (m) {
    var target = m.dataset.fxMeasure ? document.querySelector(m.dataset.fxMeasure) : null;
    m.classList.add('fx-measure');
    m.innerHTML = '<span class="fx-measure__label"></span><span class="fx-measure__line" aria-hidden="true"><svg preserveAspectRatio="none"><line class="fx-measure__rule" x1="0" y1="9" x2="100%" y2="9"/>' +
      '<path d="M0 2 v14"/><path d="M-4 13 l8 -8"/></svg><svg preserveAspectRatio="none" style="position:absolute;inset:0"><path d="M0 0" class="end"/></svg></span><span class="fx-walkway"></span>';
    var label = m.querySelector('.fx-measure__label'), end = m.querySelector('.end'), walk = m.querySelector('.fx-walkway');
    var fit = function () {
      var w = target ? target.getBoundingClientRect().width : m.getBoundingClientRect().width;
      if (target) m.style.width = Math.min(w, m.parentElement.clientWidth) + 'px';
      var W = m.getBoundingClientRect().width;
      end.setAttribute('d', 'M' + W + ' 2 v14 M' + (W - 4) + ' 13 l8 -8');
      label.textContent = m.dataset.fxLabel || '';
      m.style.setProperty('--fx-w', (W + 10) + 'px');
    };
    fit(); addEventListener('resize', fit); if (document.fonts) document.fonts.ready.then(fit);
    var kinds = (m.dataset.fxPeople || 'walker,tsquare,dog').split(',');
    kinds.forEach(function (k, i) {
      var p = document.createElement('button'); p.type = 'button';
      p.className = 'fx-person fx-person--' + k.trim() + (i % 2 ? ' is-back' : '') + (k.trim() === 'balloon' ? ' fx-person--coral' : '');
      p.setAttribute('aria-label', 'Scale figure. Say hi');
      p.innerHTML = personSVG(k.trim());
      p.style.setProperty('--dur', (16 + i * 5 + Math.random() * 6).toFixed(1) + 's');
      p.style.setProperty('--delay', (-Math.random() * 20).toFixed(1) + 's');
      p.addEventListener('click', function () {
        p.classList.remove('is-hop'); void p.offsetWidth; p.classList.add('is-hop');
        bubble(p, k.trim() === 'dog' ? 'Woof!' : SAYS[Math.floor(Math.random() * (SAYS.length - 1))]);
      });
      walk.appendChild(p);
    });
  });

  /* ---------- doors: page transition through a pair of doors ---------- */
  if (document.body.hasAttribute('data-fx-doorway') && !reduce) {
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[data-fx-door], .bento a.tile');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0 || a.target === '_blank') return;
      var href = a.getAttribute('href'); if (!href || href.charAt(0) === '#') return;
      e.preventDefault();
      var name = (a.querySelector('h3') || a).textContent.trim().split('\n')[0];
      var d = document.createElement('div'); d.className = 'fx-doors'; d.setAttribute('aria-hidden', 'true');
      d.innerHTML = '<span class="fx-doors__leaf"></span><span class="fx-doors__leaf"></span><span class="fx-doors__note">Opening ' + name.replace(/[<>&]/g, '') + ' →</span>';
      document.body.appendChild(d);
      requestAnimationFrame(function () { requestAnimationFrame(function () { d.classList.add('is-shut'); }); });
      setTimeout(function () { location.href = a.href; }, 620);
    });
    addEventListener('pageshow', function (e) { if (e.persisted) $$('.fx-doors').forEach(function (d) { d.remove(); }); });
  }

  /* ---------- Hampi sun: move the sun, watch the pergola's shadows ---------- */
  $$('[data-fx-pergola]').forEach(function (host) {
    var NS = 'http://www.w3.org/2000/svg', W = 600, G = 168, BEAM = 74, TOP = 62;
    host.classList.add('fx-pergola');
    var slats = []; for (var x = 116; x <= 484; x += 46) slats.push(x);
    var s = '<svg viewBox="0 0 ' + W + ' 210" role="img" aria-label="A pergola in the Hampi sun. Move the pointer to move the sun and its shadows.">' +
      '<rect class="sky" x="0" y="0" width="' + W + '" height="' + G + '" rx="0"/>' +
      '<g class="rays"></g><circle class="sun" r="16"/>' +
      '<rect class="ground" x="0" y="' + G + '" width="' + W + '" height="42"/><g class="shades"></g>' +
      '<rect class="post" x="112" y="' + BEAM + '" width="8" height="' + (G - BEAM) + '"/><rect class="post" x="480" y="' + BEAM + '" width="8" height="' + (G - BEAM) + '"/>' +
      '<rect class="wood" x="96" y="' + BEAM + '" width="408" height="7" rx="2"/>' +
      slats.map(function (x) { return '<rect class="wood" x="' + (x - 7) + '" y="' + TOP + '" width="14" height="12" rx="2"/>'; }).join('') +
      '<g class="person" transform="translate(300 ' + (G - 44) + ')"><circle class="f" cx="11" cy="5" r="4"/><path class="s" d="M11 10 V26 M11 13 L5 22 M11 13 L17 22 M11 26 L7 43 M11 26 L15 43"/></g>' +
      '<text class="time" x="18" y="28"></text><text class="hint" x="' + (W - 18) + '" y="200" text-anchor="end">MOVE THE SUN</text></svg>';
    host.innerHTML = s;
    var svg = host.querySelector('svg'), sun = svg.querySelector('.sun'), shades = svg.querySelector('.shades'), rays = svg.querySelector('.rays'), time = svg.querySelector('.time'), sky = svg.querySelector('.sky');
    var proj = function (x, y, sx, sy) { var t = (G - sy) / (y - sy); return sx + (x - sx) * t; };
    var set = function (sx) {
      sx = Math.max(24, Math.min(W - 24, sx));
      var k = (sx - W / 2) / (W / 2), sy = 26 + k * k * 30;
      sun.setAttribute('cx', sx); sun.setAttribute('cy', sy);
      var r = ''; for (var a = 0; a < 360; a += 45) { var c = Math.cos(a * Math.PI / 180), si = Math.sin(a * Math.PI / 180); r += '<line class="ray" x1="' + (sx + c * 22) + '" y1="' + (sy + si * 22) + '" x2="' + (sx + c * 30) + '" y2="' + (sy + si * 30) + '"/>'; }
      rays.innerHTML = r;
      var h = '';
      slats.forEach(function (x) { var a = proj(x - 7, TOP, sx, sy), b = proj(x + 7, TOP, sx, sy); h += '<polygon class="shade" points="' + a + ',' + G + ' ' + b + ',' + G + ' ' + (b + (b - sx) * .25) + ',' + (G + 40) + ' ' + (a + (a - sx) * .25) + ',' + (G + 40) + '"/>'; });
      var b0 = proj(96, BEAM, sx, sy), b1 = proj(504, BEAM, sx, sy);
      h += '<polygon class="shade" style="opacity:.12" points="' + b0 + ',' + G + ' ' + b1 + ',' + G + ' ' + (b1 + (b1 - sx) * .25) + ',' + (G + 40) + ' ' + (b0 + (b0 - sx) * .25) + ',' + (G + 40) + '"/>';
      var px = proj(311, G - 44, sx, sy); h += '<line class="shade" x1="311" y1="' + G + '" x2="' + px + '" y2="' + G + '" style="stroke:var(--fx-ink);stroke-width:5;opacity:.25;stroke-linecap:round"/>';
      shades.innerHTML = h;
      var mins = Math.round(6 * 60 + 30 + (sx - 24) / (W - 48) * 12 * 60), hh = Math.floor(mins / 60), mm = ('0' + mins % 60).slice(-2);
      time.textContent = 'HAMPI · ' + ((hh + 11) % 12 + 1) + ':' + mm + (hh < 12 ? ' AM' : ' PM');
      sky.style.fill = 'color-mix(in srgb, var(--fx-sky) ' + Math.round(70 + 30 * (1 - Math.abs(k))) + '%, var(--fx-coral))';
    };
    var touched = false, t0 = performance.now();
    host.addEventListener('pointermove', function (e) { touched = true; var r = svg.getBoundingClientRect(); set((e.clientX - r.left) / r.width * W); });
    host.addEventListener('pointerdown', function (e) { touched = true; var r = svg.getBoundingClientRect(); set((e.clientX - r.left) / r.width * W); });
    host.addEventListener('pointerleave', function () { touched = false; t0 = performance.now() - 4000; });
    set(170);
    if (!reduce) (function day() { if (!touched) { var p = ((performance.now() - t0) / 9000) % 2; set(24 + (p < 1 ? p : 2 - p) * (W - 48)); } requestAnimationFrame(day); })();
  });

  /* ---------- rain chain: scroll pours drops into the pool ---------- */
  function chain(host, inline) {
    host.classList.add('fx-chain'); if (inline) host.classList.add('fx-chain--inline');
    host.innerHTML = '<span class="fx-chain__links"></span><button type="button" class="fx-pool" aria-label="' + (inline ? 'Pour water' : 'Back to top') + '"><span class="fx-pool__water"></span></button><span class="fx-pool__tip">' + (inline ? 'TAP TO POUR' : 'BACK TO TOP') + '</span>';
    var links = host.querySelector('.fx-chain__links'), pool = host.querySelector('.fx-pool'), water = host.querySelector('.fx-pool__water');
    var drop = function () {
      if (reduce) return;
      var d = document.createElement('span'); d.className = 'fx-drop';
      var h = links.getBoundingClientRect().height + 8; d.style.setProperty('--fx-h', h + 'px'); d.style.setProperty('--fall', (.6 + h / 900).toFixed(2) + 's');
      host.appendChild(d);
      d.addEventListener('animationend', function () {
        d.remove(); var r = document.createElement('span'); r.className = 'fx-ripple'; r.style.bottom = water.style.height || '8%';
        pool.appendChild(r); setTimeout(function () { r.remove(); }, 700);
      });
    };
    var level = function (p) { water.style.height = Math.round(8 + p * 84) + '%'; };
    if (inline) {
      var lv = .2; level(lv);
      pool.addEventListener('click', function () { for (var i = 0; i < 6; i++) setTimeout(drop, i * 120); lv = Math.min(1, lv + .15); level(lv); });
      setInterval(function () { drop(); lv = lv > .95 ? .15 : lv + .03; level(lv); }, 900);
      return;
    }
    pool.addEventListener('click', function () { scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
    var last = 0, lastY = scrollY;
    var onScroll = function () {
      var max = document.documentElement.scrollHeight - innerHeight; level(max > 0 ? scrollY / max : 0);
      var now = performance.now(); if (Math.abs(scrollY - lastY) > 40 && now - last > 130) { last = now; lastY = scrollY; drop(); }
    };
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }
  if (document.body.hasAttribute('data-fx-chain')) { var c = document.createElement('div'); c.setAttribute('aria-hidden', 'false'); document.body.appendChild(c); chain(c, false); }
  $$('[data-fx-chain-inline]').forEach(function (h) { chain(h, true); });

  /* ---------- pop-up roofs ---------- */
  var ROOF = '<svg viewBox="0 0 40 40" aria-hidden="true"><path class="t t1" d="M2 2 L20 20 L38 2 Z"/><path class="t t2" d="M38 2 L20 20 L38 38 Z"/><path class="t t3" d="M38 38 L20 20 L2 38 Z"/><path class="t t4" d="M2 38 L20 20 L2 2 Z"/></svg>';
  $$('[data-fx-roofs]').forEach(function (list) {
    var items = $$(':scope > li', list);
    items.forEach(function (li) { var r = document.createElement('span'); r.className = 'fx-roof'; r.innerHTML = ROOF; li.insertBefore(r, li.firstChild); });
    var check = function () {
      items.forEach(function (li, i) { var r = li.firstChild; if (!r.classList.contains('is-up') && li.getBoundingClientRect().top < innerHeight - 60) setTimeout(function () { r.classList.add('is-up'); }, reduce ? 0 : i * 180); });
    };
    addEventListener('scroll', check, { passive: true }); check();
  });
  $$('[data-fx-roof-game]').forEach(function (g) {
    g.classList.add('fx-roofs-grid');
    for (var i = 0; i < 12; i++) {
      var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', 'Raise roof ' + (i + 1)); b.setAttribute('aria-pressed', 'false');
      b.innerHTML = '<span class="fx-roof">' + ROOF + '</span>';
      b.addEventListener('click', function () { var r = this.firstChild, up = r.classList.toggle('is-up'); this.setAttribute('aria-pressed', up); });
      g.appendChild(b);
    }
  });

  /* ---------- rubber stamp ---------- */
  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('[data-fx-stamp]'); if (!el) return;
    var s = document.createElement('span'); s.className = 'fx-stamp'; s.textContent = el.dataset.fxStamp;
    var r = el.getBoundingClientRect(), x = e.clientX || r.left + r.width / 2, y = e.clientY || r.top + r.height / 2;
    s.style.left = x + 'px'; s.style.top = (y - 34) + 'px'; s.style.setProperty('--r', (Math.random() * 18 - 12).toFixed(1) + 'deg');
    document.body.appendChild(s); setTimeout(function () { s.remove(); }, 1700);
  });

  /* ---------- compass: the needle follows you; click to go home ---------- */
  $$('[data-fx-compass]').forEach(function (b) {
    b.classList.add('fx-compass');
    b.insertAdjacentHTML('afterbegin', '<svg viewBox="0 0 44 44" aria-hidden="true"><circle class="ring" cx="22" cy="22" r="20"/><g class="needle"><path class="n1" d="M22 4 L27 22 L17 22 Z"/><path class="n2" d="M22 40 L27 22 L17 22 Z"/></g></svg>');
    var n = b.querySelector('.needle');
    if (fine && !reduce) addEventListener('pointermove', function (e) {
      var r = b.querySelector('svg').getBoundingClientRect(), a = Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180 / Math.PI + 90;
      n.style.transform = 'rotate(' + a + 'deg)';
    }, { passive: true });
    b.addEventListener('click', function () { var to = b.dataset.fxCompass; if (to) { var t = document.querySelector(to); if (t) t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); } else scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
  });
})();
