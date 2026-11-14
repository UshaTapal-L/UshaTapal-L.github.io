// RIU Copilot workspace: the Copilot works inside a real RIU screen instead of a chat.
// It plans, reads evidence, fills the answer field by field, shows confidence and
// sources, and always waits for a person. Seven AI states are shown along the way:
// streaming, tool steps, confidence, approval, edit & stop, memory and recovery.
(function () {
  var ws = document.querySelector('[data-ws]');
  if (!ws) return;
  var canvas = ws.querySelector('.ws__canvas');
  var form = ws.querySelector('.ws__cmd'), input = ws.querySelector('#ws-input');
  var stopBtn = ws.querySelector('.ws__stop');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var busy = false, stopped = false, runId = 0;
  var memory = null, pct = 58, seen = {};

  // ---------- helpers ----------
  function $(sel, root) { return (root || ws).querySelector(sel); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, reduce ? 0 : ms); }); }
  function alive(id) { return id === runId && !stopped; }
  function pattern(k) {
    if (seen[k]) return; seen[k] = true;
    var li = $('.ws__states li[data-pat="' + k + '"]'); if (li) li.classList.add('is-on');
    $('[data-ws-count]').textContent = Object.keys(seen).length;
  }
  function node(id, state) {
    var n = $('.ws__pipe [data-node="' + id + '"]'); if (!n) return;
    n.classList.remove('is-active', 'is-done', 'is-warn');
    if (state) n.classList.add('is-' + state);
  }
  function resetPipe() { ws.querySelectorAll('.ws__pipe li').forEach(function (n) { n.classList.remove('is-active', 'is-done', 'is-warn'); }); }
  function task(key, status, state) {
    var t = $('.ws-task[data-task="' + key + '"]'); if (!t) return;
    t.querySelector('[data-status]').textContent = status;
    t.dataset.state = state || '';
  }
  function setPct(v) {
    pct = Math.min(100, v);
    $('[data-ws-pct]').textContent = pct + '%';
    $('.ws__ring').style.strokeDasharray = pct + ' 100';
  }
  function toast(text) {
    var t = el('div', 'ws-toast', text); ws.appendChild(t);
    requestAnimationFrame(function () { t.classList.add('is-on'); });
    setTimeout(function () { t.classList.remove('is-on'); setTimeout(function () { t.remove(); }, 400); }, 2400);
  }
  async function typeInto(target, text, id, speed) {
    target.textContent = ''; target.classList.add('is-typing');
    for (var i = 0; i < text.length; i++) {
      if (!alive(id)) { target.classList.remove('is-typing'); return false; }
      target.textContent += text[i];
      if (i % 2 === 0) await wait(speed || 22);
    }
    target.classList.remove('is-typing');
    return true;
  }
  async function streamWords(target, text, id) {
    target.textContent = ''; target.classList.add('is-typing'); pattern('stream');
    var w = text.split(' ');
    for (var i = 0; i < w.length; i++) {
      if (!alive(id)) { target.classList.remove('is-typing'); return false; }
      target.textContent += (i ? ' ' : '') + w[i];
      await wait(55);
    }
    target.classList.remove('is-typing');
    return true;
  }
  async function planStep(card, idx, nodeId, ms, id) {
    var li = card.querySelectorAll('.ws-plan li')[idx];
    li.classList.add('is-run'); node(nodeId, 'active'); pattern('tools');
    await wait(ms);
    if (!alive(id)) { li.classList.remove('is-run'); li.classList.add('is-stop'); node(nodeId, null); return false; }
    li.classList.remove('is-run'); li.classList.add('is-done'); node(nodeId, 'done');
    return true;
  }
  function meter(card, value) {
    var m = card.querySelector('.ws-conf'); m.hidden = false;
    var low = value < 80; m.classList.toggle('is-low', low);
    requestAnimationFrame(function () { m.querySelector('i').style.width = value + '%'; });
    var n = m.querySelector('b'), v = 0;
    var t = setInterval(function () { v = Math.min(value, v + 4); n.textContent = v + '%'; if (v >= value) clearInterval(t); }, reduce ? 0 : 18);
    pattern('conf');
  }
  function actions(card, list) {
    var row = card.querySelector('.ws-acts'); row.innerHTML = ''; row.hidden = false;
    list.forEach(function (a) {
      var b = el('button', 'ws-btn' + (a.primary ? ' ws-btn--primary' : ''), a.label); b.type = 'button';
      b.addEventListener('click', function () { if (busy) return; row.querySelectorAll('button').forEach(function (x) { x.disabled = true; }); a.run(); });
      row.appendChild(b);
    });
  }
  function begin(key, label) {
    runId++; busy = true; stopped = false; resetPipe();
    stopBtn.hidden = false; ws.classList.add('is-busy');
    ws.querySelectorAll('.ws-task').forEach(function (t) { t.classList.toggle('is-current', t.dataset.task === key); });
    task(key, 'Copilot is working…', 'run');
    node('intent', 'done');
    canvas.innerHTML = '';
    return runId;
  }
  function end() { busy = false; stopBtn.hidden = true; ws.classList.remove('is-busy'); }
  function stopped_(card, key, resume) {
    pattern('override'); end(); task(key, 'Stopped by you', 'warn');
    var s = el('div', 'ws-note ws-note--stop', '<b>Stopped.</b> I kept what I had drafted. Nothing was filed.');
    card.appendChild(s);
    actions(card, [{ label: 'Resume', primary: true, run: resume }]);
  }

  function qCard(code, title, fields) {
    var f = fields.map(function (x) { return '<div class="ws-field"><span>' + x[0] + '</span><output data-f="' + x[1] + '"></output></div>'; }).join('');
    return el('article', 'ws-q',
      '<header><span class="ws-q__code">' + code + '</span><span class="ws-q__core">BRSR Core</span><span class="ws-q__ai" hidden>✦ AI draft</span></header>' +
      '<h4>' + title + '</h4>' +
      '<ol class="ws-plan"></ol>' +
      '<div class="ws-ev"></div>' +
      '<div class="ws-fields">' + f + '</div>' +
      '<p class="ws-narr" hidden></p>' +
      '<div class="ws-conf" hidden><span>Confidence</span><span class="ws-conf__bar"><i></i></span><b>0%</b></div>' +
      '<div class="ws-srcs"></div>' +
      '<div class="ws-acts" hidden></div>');
  }
  function plan(card, steps) { card.querySelector('.ws-plan').innerHTML = steps.map(function (s) { return '<li><i aria-hidden="true"></i>' + s + '</li>'; }).join(''); }
  function evidence(card, docs) {
    var box = card.querySelector('.ws-ev');
    docs.forEach(function (d, i) { var e = el('span', 'ws-doc', '<i aria-hidden="true">' + d[0] + '</i>' + d[1]); e.style.animationDelay = (i * 0.12) + 's'; box.appendChild(e); });
  }
  function sources(card, list) { card.querySelector('.ws-srcs').innerHTML = list.map(function (s) { return '<span>↗ ' + s + '</span>'; }).join(''); }
  function approve(card, key, by) {
    pattern('human'); node('human', 'done');
    var st = el('div', 'ws-stamp', '<b>Approved</b>' + (by || 'Marci · ESG lead · just now'));
    card.appendChild(st); card.classList.add('is-approved');
    setPct(pct + 3); task(key, 'Approved ✓', 'done');
  }

  // ---------- tasks ----------
  var tasks = {
    energy: async function resumeEnergy() {
      var id = begin('energy');
      var c = qCard('P6-E.1', 'Total energy consumption and intensity per rupee of turnover', [['Total energy', 'total'], ['Intensity', 'int'], ['Renewable share', 'ren']]);
      canvas.appendChild(c);
      plan(c, ['Read 6 electricity bills and 2 fuel invoices', 'Calculate intensity per ₹ of turnover', 'Check sources and confidence']);
      node('plan', 'done');
      evidence(c, [['⚡', 'Electricity bills ×6'], ['⛽', 'Fuel invoices ×2'], ['₹', 'FY25 ledger']]);
      if (!await planStep(c, 0, 'evidence', 1000, id)) return stopped_(c, 'energy', resumeEnergy);
      c.querySelector('.ws-q__ai').hidden = false;
      if (!await typeInto(c.querySelector('[data-f="total"]'), '2,84,120 GJ', id)) return stopped_(c, 'energy', resumeEnergy);
      if (!await planStep(c, 1, 'calc', 800, id)) return stopped_(c, 'energy', resumeEnergy);
      if (!await typeInto(c.querySelector('[data-f="int"]'), '0.0021 GJ / ₹', id)) return stopped_(c, 'energy', resumeEnergy);
      if (!await typeInto(c.querySelector('[data-f="ren"]'), '26%', id)) return stopped_(c, 'energy', resumeEnergy);
      var narr = c.querySelector('.ws-narr'); narr.hidden = false;
      if (!await streamWords(narr, 'Total energy in H1 was 2.84 lakh GJ, 26% from renewables. Intensity per rupee of turnover fell 3.1% year on year.', id)) return stopped_(c, 'energy', resumeEnergy);
      if (!await planStep(c, 2, 'guard', 600, id)) return stopped_(c, 'energy', resumeEnergy);
      meter(c, 92); sources(c, ['6 electricity bills', '2 fuel invoices', 'FY25 ledger']);
      node('human', 'active'); task('energy', 'Needs your review', 'review');
      memory = 'P6 · Energy · H1';
      var cmp = $('.ws-task[data-task="compare"]'); cmp.disabled = false; task('compare', 'Ready', '');
      end();
      actions(c, [
        { label: 'Approve', primary: true, run: function () { approve(c, 'energy'); } },
        { label: 'Edit', run: function () { editNarr(c); } },
        { label: 'Reject', run: function () { reject(c); } }
      ]);
    },

    scope2: async function () {
      var id = begin('scope2');
      var c = qCard('P6-E.7', 'Scope 2 emissions (location-based)', [['Scope 2', 'sc2'], ['Grid factor', 'gf'], ['Sites covered', 'sites']]);
      canvas.appendChild(c);
      plan(c, ['Pull meter readings from Evidence Hub', 'Apply CEA grid emission factor', 'Check coverage before filing']);
      node('plan', 'done');
      // Recovery: the first call fails and retries on its own.
      var li = c.querySelectorAll('.ws-plan li')[0]; li.classList.add('is-run'); node('evidence', 'active'); pattern('tools');
      await wait(900); if (!alive(id)) return stopped_(c, 'scope2', tasks.scope2);
      li.classList.remove('is-run'); li.classList.add('is-err'); node('evidence', 'warn'); pattern('error');
      var note = el('div', 'ws-note ws-note--err', '<b>Evidence Hub didn’t respond.</b> Retrying in <span>3</span>s…'); c.querySelector('.ws-plan').after(note);
      for (var s = 3; s > 0; s--) { note.querySelector('span').textContent = s; await wait(600); }
      note.innerHTML = '<b>Reconnected.</b> Nothing was lost.'; note.className = 'ws-note ws-note--ok';
      li.classList.remove('is-err'); li.classList.add('is-done'); node('evidence', 'done');
      evidence(c, [['⚡', 'Meter readings · 4 sites'], ['📄', 'CEA factor v19']]);
      c.querySelector('.ws-q__ai').hidden = false;
      if (!await typeInto(c.querySelector('[data-f="sc2"]'), '18,420 tCO₂e', id)) return stopped_(c, 'scope2', tasks.scope2);
      if (!await planStep(c, 1, 'calc', 700, id)) return stopped_(c, 'scope2', tasks.scope2);
      await typeInto(c.querySelector('[data-f="gf"]'), '0.716 kg / kWh', id);
      await typeInto(c.querySelector('[data-f="sites"]'), '3 of 4', id);
      var li3 = c.querySelectorAll('.ws-plan li')[2]; li3.classList.add('is-run'); node('guard', 'active');
      await wait(700); li3.classList.remove('is-run'); li3.classList.add('is-warn'); node('guard', 'warn');
      meter(c, 64); sources(c, ['Meter readings · 3 sites', 'CEA factor v19']);
      c.querySelector('[data-f="sites"]').closest('.ws-field').classList.add('is-gap');
      var g = el('div', 'ws-note ws-note--warn', '<b>Below 80% confidence, so I won’t file this.</b> Noida meter M-07 is missing Aug–Sep.');
      c.querySelector('.ws-conf').after(g);
      node('human', 'active'); task('scope2', 'Blocked: data gap', 'warn');
      end();
      actions(c, [
        { label: 'Ask Rahul for readings', primary: true, run: function () { toast('Request sent to Rahul · Noida plant'); task('scope2', 'Waiting on Rahul', 'warn'); pattern('human'); node('human', 'done'); g.innerHTML = '<b>Request sent.</b> I’ll redraft when Rahul uploads the readings.'; } },
        { label: 'Use estimate, flagged', run: function () { c.querySelector('[data-f="sites"]').textContent = '4 of 4 · 1 estimated'; c.querySelector('[data-f="sites"]').closest('.ws-field').classList.replace('is-gap', 'is-est'); g.remove(); approve(c, 'scope2', 'Marci · with 1 flagged estimate'); } }
      ]);
    },

    compare: async function () {
      var id = begin('compare');
      var c = el('article', 'ws-q ws-cmp',
        '<header><span class="ws-q__code">Compare</span><span class="ws-mem">✦ Remembered: ' + (memory || 'P6 · Energy') + '</span></header>' +
        '<h4>FY 2024–25 vs FY 2025–26 · H1</h4>' +
        '<div class="ws-bars">' +
        [['Total energy', 2.95, 2.84, 'lakh GJ', 3.2], ['Intensity', 2.17, 2.10, '×10⁻³ GJ/₹', 2.4], ['Renewable share', 19, 26, '%', 30]].map(function (r) {
          return '<div class="ws-bar"><span>' + r[0] + '</span><div><i class="was" style="--w:' + (r[1] / r[4] * 100) + '%"></i><i class="now" style="--w:' + (r[2] / r[4] * 100) + '%"></i></div><b>' + r[1] + ' → ' + r[2] + ' <small>' + r[3] + '</small></b></div>';
        }).join('') + '</div>' +
        '<p class="ws-legend"><i class="was"></i>Last year <i class="now"></i>This year</p>' +
        '<p class="ws-narr"></p><div class="ws-acts" hidden></div>');
      canvas.appendChild(c); pattern('memory'); node('plan', 'done');
      node('evidence', 'active'); await wait(500); node('evidence', 'done'); node('calc', 'active');
      requestAnimationFrame(function () { c.classList.add('is-drawn'); });
      await wait(900); node('calc', 'done'); node('guard', 'done');
      if (!await streamWords(c.querySelector('.ws-narr'), 'Intensity fell 3.1% while renewables rose 7 points, mostly from the new rooftop solar at the Pune plant.', id)) return stopped_(c, 'compare', tasks.compare);
      node('human', 'active'); task('compare', 'Ready to add', 'review'); end();
      actions(c, [{ label: 'Add to the P6 answer', primary: true, run: function () { approve(c, 'compare', 'Added to P6-E.1 · just now'); toast('Comparison added to the P6 answer'); } }]);
    },

    late: async function () {
      var id = begin('late');
      var rows = [['RM', 'Rahul Mehta', 'Noida meter M-07', 12], ['PS', 'Priya Shah', 'Waste manifests · 2 sites', 8], ['LMS', 'HR · LMS', 'Training export', 5]];
      var c = el('article', 'ws-q ws-late',
        '<header><span class="ws-q__code">September close</span><span class="ws-q__core">3 overdue</span></header>' +
        '<h4>Late data, with reminders drafted</h4><ul class="ws-people">' +
        rows.map(function (r) { return '<li><span class="ws-av">' + r[0] + '</span><div><b>' + r[1] + '</b><small>' + r[2] + '</small><p class="ws-draft"></p></div><em>' + r[3] + ' days late</em></li>'; }).join('') +
        '</ul><div class="ws-acts" hidden></div>');
      canvas.appendChild(c); node('plan', 'done'); node('evidence', 'active'); pattern('tools');
      var lis = c.querySelectorAll('.ws-people li');
      for (var i = 0; i < lis.length; i++) { lis[i].classList.add('is-in'); await wait(250); }
      node('evidence', 'done'); node('calc', 'done'); node('guard', 'done');
      var msgs = ['Hi Rahul, could you log the Aug–Sep readings for meter M-07? It’s the last gap in Scope 2.', 'Hi Priya, the waste manifests for Pune and Noida are still missing for September.', 'Hi team, please share the September LMS training export for P5.'];
      for (var j = 0; j < lis.length; j++) { if (!await streamWords(lis[j].querySelector('.ws-draft'), msgs[j], id)) return stopped_(c, 'late', tasks.late); }
      node('human', 'active'); task('late', '3 reminders drafted', 'review'); end();
      actions(c, [{ label: 'Send all 3', primary: true, run: function () {
        lis.forEach(function (l, k) { setTimeout(function () { l.classList.add('is-sent'); l.querySelector('em').textContent = 'Sent ✓'; }, k * 220); });
        pattern('human'); node('human', 'done'); task('late', 'Reminders sent ✓', 'done'); toast('3 reminders sent');
      } }]);
    }
  };

  function editNarr(c) {
    pattern('override');
    var narr = c.querySelector('.ws-narr'), old = narr.textContent;
    var ta = el('textarea', 'ws-edit'); ta.value = old; ta.rows = 3; narr.replaceWith(ta); ta.focus();
    actions(c, [{ label: 'Save & approve', primary: true, run: function () {
      var p = el('p', 'ws-narr'); p.textContent = ta.value; ta.replaceWith(p);
      if (ta.value.trim() !== old.trim()) { var d = el('p', 'ws-was'); d.innerHTML = '<span>Edited by you</span> AI draft kept in history'; p.after(d); }
      approve(c, 'energy');
    } }]);
  }
  function reject(c) {
    pattern('override');
    var r = el('div', 'ws-note', '<b>What should change?</b>'); c.querySelector('.ws-acts').before(r);
    actions(c, [
      { label: 'Use calendar year', run: function () { r.remove(); tasks.energy(); } },
      { label: 'Exclude diesel back-up', run: function () { r.remove(); tasks.energy(); } }
    ]);
  }

  // ---------- wiring ----------
  ws.querySelectorAll('.ws-task').forEach(function (t) {
    t.addEventListener('click', function () { if (!busy && !t.disabled) tasks[t.dataset.task](); });
  });
  stopBtn.addEventListener('click', function () { stopped = true; });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var q = input.value.toLowerCase().trim(); if (!q || busy) return;
    input.value = '';
    var key = /late|overdue|remind|chase/.test(q) ? 'late' : /scope|emission|co2|carbon/.test(q) ? 'scope2' : /compare|last year|yoy|trend/.test(q) ? 'compare' : /energy|p6|draft|power|electric/.test(q) ? 'energy' : null;
    if (key === 'compare' && !memory) key = 'energy';
    if (key) { node('intent', 'done'); tasks[key](); }
    else toast('I can draft answers, compare years or chase late data.');
  });
  setPct(58);
})();
