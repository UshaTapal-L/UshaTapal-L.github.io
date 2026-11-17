// Version 12: the architect's line. Built from the page's own layout, so it fits any width.
// Motifs: a floor plan (beside Work), a user flow (beside Approach), a rising chart (beside Decisions).
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NS = 'http://www.w3.org/2000/svg', svg, path, tip, halo, labels = [], samples = [], L = 0;
  function el(n, a) { var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); return e; }
  function top(sel) { var e = document.querySelector(sel); return e ? e.getBoundingClientRect().top + scrollY : 0; }
  function build() {
    if (svg) svg.remove();
    var W = document.documentElement.clientWidth, H = document.body.scrollHeight;
    var max = 1120, side = Math.max(0, (W - max) / 2), x0 = Math.max(18, side - 70), wideM = side > 150; // gutter line
    var xr = W - x0;
    svg = el('svg', { class: 'line-svg', width: W, height: H, viewBox: '0 0 ' + W + ' ' + H, 'aria-hidden': 'true' });
    svg.style.height = H + 'px';
    var hero = top('.hero h1'), work = top('#work'), ap = top('#approach'), dc = top('.decisions'), ld = top('.lead'), ab = top('#about'), ct = top('#contact');
    var d = 'M ' + (W / 2) + ' ' + (hero - 40) + ' C ' + (W / 2) + ' ' + (hero - 80) + ' ' + x0 + ' ' + (hero - 80) + ' ' + x0 + ' ' + (hero + 20);
    labels = [];
    function lab(x, y, t) { var tx = el('text', { class: 'lbl', x: x, y: y }); tx.textContent = t; labels.push([y, tx]); return tx; }
    // down to work, then a small floor plan (room + door swing) if there is space
    var py = top('.impact') + 30;
    d += ' L ' + x0 + ' ' + py;
    if (wideM) {
      var w = Math.min(80, side - 70), h = 64;
      d += ' L ' + (x0 + w) + ' ' + py + ' L ' + (x0 + w) + ' ' + (py + h) + ' L ' + (x0 + 30) + ' ' + (py + h) + ' A 22 22 0 0 1 ' + (x0 + 8) + ' ' + (py + h - 22) + ' L ' + x0 + ' ' + (py + h - 22) + ' L ' + x0 + ' ' + (py + h + 10);
    }
    // across to the right through the work section gap, back left before approach
    var yA = ap - 60;
    d += ' L ' + x0 + ' ' + (yA - 30) + ' Q ' + x0 + ' ' + yA + ' ' + (x0 + 30) + ' ' + yA + ' L ' + (xr - 30) + ' ' + yA + ' Q ' + xr + ' ' + yA + ' ' + xr + ' ' + (yA + 30);
    // user flow on the right: three nodes linked
    var fy = ap + 140;
    d += ' L ' + xr + ' ' + fy;
    if (wideM) {
      [0, 1, 2].forEach(function (i) {
        var cy = fy + i * 70;
        d += ' L ' + xr + ' ' + (cy - 12) + ' L ' + (xr + 12) + ' ' + cy + ' L ' + xr + ' ' + (cy + 12) + ' L ' + (xr - 12) + ' ' + cy + ' L ' + xr + ' ' + (cy - 12) + ' M ' + xr + ' ' + (cy + 12) + ' L ' + xr + ' ' + (cy + 58);
      });
    }
    // back to the left before decisions, then a rising chart
    var yD = dc - 30;
    d += ' L ' + xr + ' ' + (yD - 30) + ' Q ' + xr + ' ' + yD + ' ' + (xr - 30) + ' ' + yD + ' L ' + (x0 + 30) + ' ' + yD + ' Q ' + x0 + ' ' + yD + ' ' + x0 + ' ' + (yD + 30);
    var cy0 = dc + 260;
    d += ' L ' + x0 + ' ' + cy0;
    if (wideM) d += ' L ' + (x0 + 24) + ' ' + (cy0 - 18) + ' L ' + (x0 + 48) + ' ' + (cy0 - 8) + ' L ' + (x0 + 62) + ' ' + (cy0 - 46) + ' L ' + (x0 + Math.min(84, side - 76)) + ' ' + (cy0 - 70) + ' M ' + x0 + ' ' + cy0;
    // down to the contact section and sign off under the headline
    var yC = ct + 40;
    d += ' L ' + x0 + ' ' + (yC - 30) + ' Q ' + x0 + ' ' + yC + ' ' + (x0 + 30) + ' ' + yC + ' L ' + (W / 2 - 40) + ' ' + yC + ' Q ' + (W / 2) + ' ' + yC + ' ' + (W / 2) + ' ' + (yC + 40);
    path = el('path', { class: 'ln', d: d });
    halo = el('circle', { class: 'tip-halo', r: 9 }); tip = el('circle', { class: 'tip', r: 4 });
    svg.appendChild(path); svg.appendChild(halo); svg.appendChild(tip);
    if (wideM) { svg.appendChild(lab(x0, py - 12, 'plan')); svg.appendChild(lab(xr - 30, fy - 16, 'flow')); svg.appendChild(lab(x0, cy0 - 84, 'impact')); }
    document.body.appendChild(svg);
    L = path.getTotalLength(); samples = [];
    for (var i = 0; i <= 400; i++) { var p = path.getPointAtLength(L * i / 400); samples.push([L * i / 400, p.y]); }
    path.style.strokeDasharray = L; draw();
  }
  function lenAtY(y) { var best = 0; for (var i = 0; i < samples.length; i++) { if (samples[i][1] <= y) best = samples[i][0]; } return best; }
  function draw() {
    if (!path) return;
    var target = reduce ? L : lenAtY(scrollY + innerHeight * 0.62);
    if (scrollY + innerHeight >= document.body.scrollHeight - 4) target = L;
    path.style.strokeDashoffset = (L - target).toFixed(1);
    var pt = path.getPointAtLength(Math.max(0, target));
    tip.setAttribute('cx', pt.x); tip.setAttribute('cy', pt.y); halo.setAttribute('cx', pt.x); halo.setAttribute('cy', pt.y);
    labels.forEach(function (l) { l[1].classList.toggle('on', pt.y > l[0] + 20); });
  }
  var raf = 0, rt = 0;
  addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(function () { raf = 0; draw(); }); }, { passive: true });
  addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(build, 200); });
  addEventListener('load', build);
  if (document.readyState === 'complete') build();
  setTimeout(build, 1500); // after fonts and images settle
})();
