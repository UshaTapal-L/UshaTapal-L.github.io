// Home page interactions: rolling ball, tilt + glare cards, doodle side quests,
// journey progress, copy email, magnetic buttons and a soft cursor.
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var toastEl = document.querySelector('.m-toast'), toastT;
  function toast(t) { if (!toastEl) return; toastEl.textContent = t; toastEl.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('is-on'); }, 2200); }

  // 1. Click the ball: it hops down the stairs, rolls off, and comes back.
  var ball = document.querySelector('.iso-ball');
  function wrapEl() { return document.querySelector('.iso-ballwrap'); }
  var rolling = false;
  function roll() {
    if (!ball || rolling || (wrapEl() && wrapEl().classList.contains('is-scrolled'))) return;
    rolling = true; ball.classList.add('is-rolling');
    var hop = { x: 22, y: 31.4 }, frames = [{ transform: 'translate(0,0)' }];
    for (var i = 1; i <= 5; i++) {
      frames.push({ transform: 'translate(' + (hop.x * (i - .5)) + 'px,' + (hop.y * (i - 1) - 14) + 'px)', offset: (i - .5) / 7 });
      frames.push({ transform: 'translate(' + (hop.x * i) + 'px,' + (hop.y * i) + 'px)', offset: i / 7 });
    }
    frames.push({ transform: 'translate(' + (hop.x * 5 + 70) + 'px,' + (hop.y * 5 + 70) + 'px)', opacity: 1, offset: 6.2 / 7 });
    frames.push({ transform: 'translate(' + (hop.x * 5 + 90) + 'px,' + (hop.y * 5 + 80) + 'px)', opacity: 0, offset: 6.6 / 7 });
    frames.push({ transform: 'translate(0,-40px)', opacity: 0, offset: 6.61 / 7 });
    frames.push({ transform: 'translate(0,0)', opacity: 1 });
    var a = ball.animate(frames, { duration: reduce ? 1 : 2600, easing: 'ease-in-out' });
    a.onfinish = function () { rolling = false; ball.classList.remove('is-rolling'); };
    if (!reduce) toast('Structure first, then flow ↘');
  }
  if (ball) {
    ball.addEventListener('click', roll);
    ball.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); roll(); } });
  }

  // 2. Hero illustration tilts toward the pointer.
  var art = document.querySelector('.m-hero__art');
  if (art && fine && !reduce) {
    var iso = art.querySelector('.m-iso'), dots = art.querySelector('.m-dots');
    art.addEventListener('pointermove', function (e) {
      var r = art.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      iso.style.transform = 'perspective(900px) rotateY(' + x * 10 + 'deg) rotateX(' + (-y * 8) + 'deg) translate(' + x * 10 + 'px,' + y * 6 + 'px)';
      dots.style.transform = 'translate(' + (-x * 14) + 'px,' + (-y * 10) + 'px)';
    });
    art.addEventListener('pointerleave', function () { iso.style.transform = ''; dots.style.transform = ''; });
  }

  // 3. Project cards tilt with a soft glare that follows the pointer.
  if (fine && !reduce) {
    document.querySelectorAll('a.m-card, .m-card--yellow, .m-card--peach, .m-card--lilac, .m-card--sand').forEach(function (c) {
      c.classList.add('has-glare');
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        c.style.setProperty('--gx', x * 100 + '%'); c.style.setProperty('--gy', y * 100 + '%');
        c.style.transform = 'perspective(1000px) rotateY(' + (x - .5) * 6 + 'deg) rotateX(' + (.5 - y) * 6 + 'deg) translateY(-4px)';
      });
      c.addEventListener('pointerleave', function () { c.style.transform = ''; });
    });
  }

  // 4. Side quests open a hand-drawn doodle.
  var doodle = document.getElementById('m-doodle');
  document.querySelectorAll('[data-quest]').forEach(function (b) {
    b.addEventListener('click', function () {
      var open = b.getAttribute('aria-expanded') === 'true';
      document.querySelectorAll('[data-quest]').forEach(function (o) { o.setAttribute('aria-expanded', 'false'); });
      if (open) { doodle.hidden = true; return; }
      b.setAttribute('aria-expanded', 'true');
      doodle.hidden = false;
      doodle.className = 'm-doodle is-' + b.dataset.quest;
      doodle.querySelectorAll('svg').forEach(function (s) {
        var on = s.dataset.d === b.dataset.quest; s.style.display = on ? 'block' : 'none';
        if (on && !reduce) s.querySelectorAll('path,rect,circle').forEach(function (p) { p.style.animation = 'none'; void p.getBBox; p.offsetWidth; p.style.animation = ''; });
      });
    });
  });

  // 5. Journey: a line fills as you scroll and each step lights up.
  var journey = document.querySelector('.m-journey');
  if (journey) {
    var bar = journey.querySelector('.m-journey__bar i'), steps = journey.querySelectorAll('li');
    function onScroll() {
      var r = journey.getBoundingClientRect(), vh = window.innerHeight;
      var p = Math.min(1, Math.max(0, (vh - r.top) / (vh * .55)));
      bar.style.transform = 'scaleX(' + p + ')';
      steps.forEach(function (s, i) { s.classList.toggle('is-lit', p > (i + .5) / steps.length); });
    }
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }

  // 6. Copy email.
  document.querySelectorAll('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var t = b.dataset.copy;
      function done() { b.textContent = 'Copied ✓'; toast('Email copied'); setTimeout(function () { b.textContent = 'Copy'; }, 1800); }
      if (navigator.clipboard) navigator.clipboard.writeText(t).then(done, function () { window.prompt ? toast(t) : null; });
      else toast(t);
    });
  });

  // 7. Magnetic buttons + soft cursor (desktop only).
  if (fine && !reduce) {
    document.querySelectorAll('.m-btn, .m-hello, .m-copy').forEach(function (el) {
      el.addEventListener('pointermove', function (e) { var r = el.getBoundingClientRect(); el.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * .25 + 'px,' + (e.clientY - r.top - r.height / 2) * .35 + 'px)'; });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  }
  // 8. Copilot card opens the live demo in place.
  var tryBtn = document.querySelector('.m-try');
  if (tryBtn) tryBtn.addEventListener('click', function () {
    var card = tryBtn.closest('.m-card'), body = document.getElementById('agent-body');
    var open = tryBtn.getAttribute('aria-expanded') === 'true';
    tryBtn.setAttribute('aria-expanded', String(!open));
    body.hidden = open; card.classList.toggle('is-open', !open);
    tryBtn.textContent = open ? 'Try it live →' : 'Close demo ×';
    if (!open) { card.style.transform = ''; card.classList.remove('has-glare'); card.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); var first = body.querySelector('.chip-btn'); if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 500); }
  });

  // 9. Motion: reveal tiles and headlines as they enter, staggered left to right.
  //    (Position checks instead of IntersectionObserver: the closed clip-path
  //    hides tiles from the observer.)
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.bento .tile, [data-words]'));
  function reveal() {
    var vh = window.innerHeight, batch = [];
    revealEls.forEach(function (el) {
      if (el.classList.contains('is-in') || el.offsetParent === null) return;
      var r = el.getBoundingClientRect();
      if (r.top < vh * 0.88 && r.bottom > 0) batch.push(el);
    });
    batch.sort(function (x, y) { var a = x.getBoundingClientRect(), b = y.getBoundingClientRect(); return (a.top - b.top) || (a.left - b.left); });
    batch.forEach(function (el, i) { el.style.setProperty('--d', (i * 0.12) + 's'); el.classList.add('is-in'); });
  }
  if (reduce) revealEls.forEach(function (e) { e.classList.add('is-in'); });
  else {
    reveal();
    window.addEventListener('scroll', function () { requestAnimationFrame(reveal); }, { passive: true });
    window.addEventListener('resize', reveal);
    document.querySelectorAll('.b-filter button').forEach(function (bt) { bt.addEventListener('click', function () { setTimeout(reveal, 30); }); });
    window.addEventListener('beforeprint', function () { revealEls.forEach(function (e) { e.classList.add('is-in'); }); });
  }

  // 10. Scroll rolls the ball down the stairs; card screens drift slightly.
  var wrap = document.querySelector('.iso-ballwrap'), hero = document.querySelector('.m-hero');
  var media = Array.prototype.slice.call(document.querySelectorAll('.m-media--web img'));
  var ticking = false;
  function frame() {
    ticking = false;
    if (wrap && hero && !reduce) {
      var p = Math.min(1, Math.max(0, window.scrollY / (hero.offsetHeight * .75)));
      var k = p * 5, i = Math.floor(Math.min(k, 4.999)), f = k - i;
      var x = 22 * (i + f), y = 31.4 * (i + f) - Math.sin(Math.PI * f) * 16;
      wrap.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ')');
      wrap.classList.toggle('is-scrolled', p > .02);
    }
    if (!reduce) media.forEach(function (img) {
      var r = img.closest('.m-card').getBoundingClientRect();
      var c = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
      img.style.setProperty('--py', (c * -24).toFixed(1) + 'px');
    });
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  frame();
})();
