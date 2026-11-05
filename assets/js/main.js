// Portfolio motion and the interactive studio.
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Nav: background on scroll + active link.
  var nav = document.querySelector('.nav');
  var links = document.querySelectorAll('.nav__pill a');
  var sections = ['top', 'agent', 'work', 'e2e', 'about'].map(function (id) { return document.getElementById(id); });
  function onScroll() {
    if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 10);
    var current = 'top';
    sections.forEach(function (s) { if (s && s.getBoundingClientRect().top < 140) current = s.id; });
    links.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + current); });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Fanned cards: after the intro animation, hand control to hover styles.
  var fan = document.querySelector('.fan');
  if (fan) setTimeout(function () { fan.classList.add('is-ready'); }, reduce ? 0 : 2000);

  // Scroll reveal.
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  // Count-up numbers.
  var counters = document.querySelectorAll('[data-count]');
  function countUp(el) {
    var end = +el.dataset.count, start = null;
    if (reduce) { el.textContent = end; return; }
    function step(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / 1400, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { countUp(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { c.textContent = '0'; co.observe(c); });
  }

  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // 3D tilt on project art.
  if (finePointer && !reduce) {
    document.querySelectorAll('.tilt').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = 'perspective(900px) rotateY(' + x * 10 + 'deg) rotateX(' + -y * 10 + 'deg) scale(1.02)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });

    // Magnetic buttons.
    document.querySelectorAll('.magnetic').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        el.style.transform = 'translate(' + x * 0.2 + 'px,' + y * 0.3 + 'px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }

  // Project films: play silently while on screen, with a play/pause button.
  document.querySelectorAll('.film').forEach(function (wrap) {
    var v = wrap.querySelector('video'), btn = wrap.querySelector('.film__btn');
    var userPaused = reduce; // with reduced motion, wait for the viewer to press play
    function sync() {
      var playing = !v.paused;
      btn.dataset.state = playing ? 'playing' : 'paused';
      btn.setAttribute('aria-label', playing ? 'Pause video' : 'Play video');
    }
    function play() { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
    v.addEventListener('play', sync); v.addEventListener('pause', sync);
    btn.addEventListener('click', function () {
      if (v.paused) { userPaused = false; play(); } else { userPaused = true; v.pause(); }
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting && !userPaused) play();
          else if (!e.isIntersecting) v.pause();
        });
      }, { threshold: 0.35 }).observe(wrap);
    }
    sync();
  });

  // Floating avatar waves once after a few seconds.
  var buddy = document.querySelector('.buddy');
  if (buddy && !reduce) {
    setTimeout(function () { buddy.classList.add('wave'); }, 4000);
    setTimeout(function () { buddy.classList.remove('wave'); }, 7000);
  }

  // ---------- Hero sketch: a fading pencil line follows the mouse ----------
  var panel = document.querySelector('.hero__panel');
  var canvas = panel && panel.querySelector('.sketch');
  if (canvas && finePointer && !reduce) {
    var ctx = canvas.getContext('2d'), pts = [], dpr = Math.min(window.devicePixelRatio || 1, 2), drawing = false;
    function size() { var r = panel.getBoundingClientRect(); canvas.width = r.width * dpr; canvas.height = r.height * dpr; }
    size(); window.addEventListener('resize', size);
    panel.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      var r = panel.getBoundingClientRect();
      pts.push({ x: (e.clientX - r.left) * dpr, y: (e.clientY - r.top) * dpr, t: performance.now() });
      if (!drawing) { drawing = true; requestAnimationFrame(paint); }
    });
    function paint(now) {
      pts = pts.filter(function (p) { return now - p.t < 1400; });
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for (var i = 1; i < pts.length; i++) {
        var a = pts[i - 1], b = pts[i];
        if (b.t - a.t > 120) continue;
        ctx.strokeStyle = 'rgba(31,79,134,' + (1 - (now - b.t) / 1400) * 0.55 + ')';
        ctx.lineWidth = 2.4 * dpr;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
      if (pts.length) requestAnimationFrame(paint); else drawing = false;
    }
  }

  // ---------- Sticker board: drag, flip, shuffle, tidy ----------
  var board = document.getElementById('board');
  if (board) {
    var stickers = Array.prototype.slice.call(board.querySelectorAll('.stk'));
    var STORE = 'board-pos';
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem(STORE) || '{}'); } catch (e) {}
    function place(el, x, y) {
      var bw = board.clientWidth, bh = board.clientHeight;
      var maxX = 100 - (el.offsetWidth / bw) * 100, maxY = 100 - (el.offsetHeight / bh) * 100;
      x = Math.max(2, Math.min(maxX - 3, x)); y = Math.max(2, Math.min(maxY - 2, y));
      el.style.setProperty('--x', x + '%'); el.style.setProperty('--y', y + '%');
      return [x, y];
    }
    function save() {
      var out = {};
      stickers.forEach(function (s) { out[s.dataset.id] = [parseFloat(s.style.getPropertyValue('--x')), parseFloat(s.style.getPropertyValue('--y'))]; });
      try { localStorage.setItem(STORE, JSON.stringify(out)); } catch (e) {}
    }
    var z = 10;
    stickers.forEach(function (s) {
      if (saved[s.dataset.id]) place(s, saved[s.dataset.id][0], saved[s.dataset.id][1]);
      else if (board.clientWidth < 600) { var i = stickers.indexOf(s); place(s, 4 + (i % 3) * 32 + (Math.floor(i / 3) % 2) * 6, 3 + Math.floor(i / 3) * 24); }
      else place(s, parseFloat(s.style.getPropertyValue('--x')), parseFloat(s.style.getPropertyValue('--y')));
      var start = null;
      s.addEventListener('pointerdown', function (e) {
        board.classList.remove('is-tidy');
        var r = s.getBoundingClientRect();
        start = { px: e.clientX, py: e.clientY, ox: e.clientX - r.left, oy: e.clientY - r.top, moved: false };
        s.setPointerCapture(e.pointerId);
        s.style.zIndex = ++z;
      });
      s.addEventListener('pointermove', function (e) {
        if (!start) return;
        if (!start.moved && Math.hypot(e.clientX - start.px, e.clientY - start.py) < 5) return;
        start.moved = true; s.classList.add('is-dragging');
        var b = board.getBoundingClientRect();
        place(s, (e.clientX - b.left - start.ox) / b.width * 100, (e.clientY - b.top - start.oy) / b.height * 100);
      });
      function end() {
        if (!start) return;
        if (start.moved) { s.classList.remove('is-dragging'); s.style.setProperty('--r', (Math.random() * 14 - 7).toFixed(1) + 'deg'); save(); }
        else s.classList.toggle('is-flipped');
        start = null;
      }
      s.addEventListener('pointerup', end);
      s.addEventListener('pointercancel', end);
      s.addEventListener('click', function (e) { if (e.detail === 0) s.classList.toggle('is-flipped'); }); // keyboard Enter/Space
      s.addEventListener('keydown', function (e) {
        var d = { ArrowLeft: [-2, 0], ArrowRight: [2, 0], ArrowUp: [0, -3], ArrowDown: [0, 3] }[e.key];
        if (!d) return;
        e.preventDefault();
        place(s, parseFloat(s.style.getPropertyValue('--x')) + d[0], parseFloat(s.style.getPropertyValue('--y')) + d[1]);
        save();
      });
    });
    document.querySelectorAll('[data-board]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        board.classList.add('is-tidy');
        var mobile = board.clientWidth < 600, cols = mobile ? 3 : 6;
        stickers.forEach(function (s, i) {
          s.classList.remove('is-flipped');
          if (btn.dataset.board === 'tidy') {
            var c = i % cols, r = Math.floor(i / cols);
            place(s, 3 + c * (94 / cols), (mobile ? 5 : 10) + r * (mobile ? 24 : 42));
            s.style.setProperty('--r', '0deg');
          } else {
            place(s, Math.random() * 85, Math.random() * 80);
            s.style.setProperty('--r', (Math.random() * 16 - 8).toFixed(1) + 'deg');
          }
        });
        save();
      });
    });
  }

  // ---------- Studio ----------
  var room = document.querySelector('.room');
  if (!room) return;
  var sheet = document.getElementById('sheet');
  var body = document.getElementById('sheet-body');
  var foundEl = document.getElementById('found');
  var toast = document.getElementById('room-toast');
  var objs = room.querySelectorAll('.obj');
  var total = objs.length;
  document.getElementById('total').textContent = total;

  var found = [];
  try { found = JSON.parse(localStorage.getItem('studio-found') || '[]'); } catch (e) {}

  function paintFound() {
    foundEl.textContent = found.length;
    objs.forEach(function (o) { o.classList.toggle('is-found', found.indexOf(o.dataset.obj) > -1); });
    document.querySelectorAll('.room__list button').forEach(function (b) {
      b.classList.toggle('is-found', found.indexOf(b.dataset.open) > -1);
    });
  }
  paintFound();

  var toastTimer;
  function showToast(text) {
    toast.textContent = text;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2600);
  }

  function open(key) {
    var tpl = document.getElementById('t-' + key);
    if (!tpl) return;
    body.innerHTML = '';
    body.appendChild(tpl.content.cloneNode(true));
    if (found.indexOf(key) === -1) {
      found.push(key);
      try { localStorage.setItem('studio-found', JSON.stringify(found)); } catch (e) {}
      paintFound();
      showToast(found.length === total ? '🎉 You found everything!' : '✨ ' + found.length + ' of ' + total + ' discovered');
    }
    if (typeof sheet.showModal === 'function') sheet.showModal(); else sheet.setAttribute('open', '');
  }
  function close() { if (sheet.open) sheet.close(); }

  objs.forEach(function (o) {
    o.addEventListener('click', function () { open(o.dataset.obj); });
    o.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(o.dataset.obj); }
    });
  });
  document.querySelectorAll('[data-open]').forEach(function (b) {
    b.addEventListener('click', function () { open(b.dataset.open); });
  });
  sheet.querySelector('.sheet__close').addEventListener('click', close);
  sheet.addEventListener('click', function (e) {
    if (e.target === sheet) close();                 // click on backdrop
    if (e.target.closest('[data-close]')) close();   // in-sheet links that scroll the page
  });

  var hintsBtn = document.getElementById('hints-btn');
  hintsBtn.addEventListener('click', function () {
    var on = room.classList.toggle('hints-on');
    hintsBtn.setAttribute('aria-pressed', on);
  });
})();
