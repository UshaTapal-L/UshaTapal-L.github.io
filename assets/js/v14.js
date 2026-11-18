// Version 14: each room of the section (or its chip) is a door. Click it and the
// drawing flies into that room until it fills the screen, the room's name lands,
// then the page opens on that section. Under a second; instant with reduced motion.
(function () {
  var sec = document.querySelector('.hs'); if (!sec) return;
  var fig = sec.querySelector('.sx'), img = fig.querySelector('img'), svg = fig.querySelector('svg');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches, busy = false;
  var VB = svg.viewBox.baseVal;

  function land(t, href) {
    t.scrollIntoView({ behavior: 'instant', block: 'start' });
    history.pushState(null, '', href);
  }

  function enter(a) {
    var href = a.getAttribute('href'), t = document.querySelector(href); if (!t) return;
    var room = svg.querySelector('.sx-room[data-k="' + a.dataset.k + '"]');
    var fr = img.getBoundingClientRect();
    if (reduce || !room || busy || !img.animate || fr.bottom < 0 || fr.top > innerHeight) { land(t, href); return; }
    busy = true;
    var bb = room.querySelector('.sx-hl').getBBox(), k = fr.width / VB.width;
    var r = { x: fr.left + bb.x * k, y: fr.top + bb.y * k, w: bb.width * k, h: bb.height * k };
    var s = Math.max(innerWidth / r.w, innerHeight / r.h) * 1.08;
    var dx = innerWidth / 2 - (r.x + r.w / 2), dy = innerHeight / 2 - (r.y + r.h / 2);
    var label = room.getAttribute('aria-label').split(' '), num = label.shift();

    var fly = document.createElement('div'); fly.className = 'sx-fly'; fly.setAttribute('aria-hidden', 'true');
    var pic = img.cloneNode(); pic.removeAttribute('loading');
    pic.style.cssText = 'left:' + fr.left + 'px;top:' + fr.top + 'px;width:' + fr.width + 'px;height:' + fr.height + 'px;transform-origin:' + (r.x + r.w / 2 - fr.left) + 'px ' + (r.y + r.h / 2 - fr.top) + 'px';
    var veil = document.createElement('i'); veil.className = 'sx-veil';
    var name = document.createElement('p'); name.className = 'sx-name'; name.innerHTML = '<b>' + num + '</b>' + label.join(' ');
    fly.append(pic, veil, name); document.body.appendChild(fly);

    var ease = 'cubic-bezier(.75,0,.25,1)';
    pic.animate([{ transform: 'none', filter: 'none' }, { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + s + ')', filter: 'blur(2px)' }], { duration: 560, easing: ease, fill: 'forwards' });
    veil.animate([{ opacity: 0 }, { opacity: 0, offset: .45 }, { opacity: 1 }], { duration: 560, easing: 'ease-in', fill: 'forwards' });
    name.animate([{ opacity: 0, transform: 'translateY(30px) scale(.9)' }, { opacity: 0, offset: .5 }, { opacity: 1, transform: 'none' }], { duration: 620, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' })
      .finished.then(function () {
        land(t, href);
        t.classList.remove('sx-in'); void t.offsetWidth; t.classList.add('sx-in');
        var out = fly.animate([{ clipPath: 'circle(150% at 50% 50%)' }, { clipPath: 'circle(0% at 50% 50%)' }], { duration: 480, easing: 'cubic-bezier(.6,0,.2,1)', fill: 'forwards' });
        out.finished.then(function () { fly.remove(); busy = false; });
      });
  }

  sec.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"][data-k]'); if (!a) return;
    e.preventDefault(); enter(a);
  });

  function mark(k) { sec.querySelectorAll('[data-k]').forEach(function (el) { el.classList.toggle('on', el.dataset.k === k); }); }
  sec.querySelectorAll('[data-k]').forEach(function (el) {
    el.addEventListener('pointerenter', function () { mark(el.dataset.k); });
    el.addEventListener('pointerleave', function () { mark(null); });
    el.addEventListener('focus', function () { mark(el.dataset.k); });
    el.addEventListener('blur', function () { mark(null); });
  });
})();
