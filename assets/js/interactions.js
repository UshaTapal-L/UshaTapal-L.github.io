// Home page interactions: rolling ball, tilt + glare cards, doodle side quests,
// journey progress, copy email, magnetic buttons and a soft cursor.
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var toastEl = document.querySelector('.m-toast'), toastT;
  function toast(t) { if (!toastEl) return; toastEl.textContent = t; toastEl.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('is-on'); }, 2200); }

  // 1. Click the ball: it hops down the stairs, rolls off, and comes back.
  var ball = document.querySelector('.iso-ball');
  var rolling = false;
  function roll() {
    if (!ball || rolling) return;
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
    var cur = document.querySelector('.m-cursor');
    if (cur) {
      var tx = 0, ty = 0, cx = 0, cy = 0;
      document.addEventListener('pointermove', function (e) { tx = e.clientX; ty = e.clientY; cur.classList.add('is-on'); var t = e.target.closest && e.target.closest('a,button,[role=button],input'); cur.classList.toggle('is-link', !!t); });
      document.addEventListener('pointerleave', function () { cur.classList.remove('is-on'); });
      (function loop() { cx += (tx - cx) * .2; cy += (ty - cy) * .2; cur.style.transform = 'translate(' + cx + 'px,' + cy + 'px)'; requestAnimationFrame(loop); })();
    }
  }
})();
