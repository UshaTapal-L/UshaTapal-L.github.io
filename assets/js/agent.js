// RIU Copilot demo: a scripted agent that shows the design of AI states
// (streaming, tool calls, confidence + sources, human approval, overrides,
// multi-turn memory, error recovery) and lights up an architecture map.
(function () {
  var log = document.getElementById('copilot-log');
  if (!log) return;
  var chipsEl = document.getElementById('copilot-chips');
  var form = document.getElementById('copilot-form');
  var input = document.getElementById('copilot-text');
  var sendBtn = document.getElementById('copilot-send');
  var stopBtn = document.getElementById('copilot-stop');
  var memText = document.getElementById('mem-text');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var ctx = { metric: null };
  var busy = false, stopped = false;
  var seen = {};

  // ---------- helpers ----------
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function scroll() { log.scrollTop = log.scrollHeight; }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, reduce ? 0 : ms); }); }

  function node(id, state) {
    var n = document.querySelector('.anode[data-node="' + id + '"]');
    if (!n) return;
    n.classList.remove('is-active', 'is-done', 'is-error');
    if (state) n.classList.add('is-' + state);
  }
  function resetNodes() { document.querySelectorAll('.anode').forEach(function (n) { n.classList.remove('is-active', 'is-done', 'is-error'); }); }

  function pattern(key) {
    if (seen[key]) return;
    seen[key] = true;
    var li = document.querySelector('.patterns li[data-pat="' + key + '"]');
    if (li) li.classList.add('is-done');
    document.getElementById('pat-count').textContent = Object.keys(seen).length;
  }

  function setMemory(text) { memText.textContent = text; node('memory', 'done'); }

  function userMsg(text) { log.appendChild(el('div', 'msg msg--user', '<p></p>')).querySelector('p').textContent = text; scroll(); }

  function botMsg() { var m = el('div', 'msg msg--bot'); log.appendChild(m); scroll(); return m; }

  async function step(msg, label, nodeId, ms) {
    var row = el('div', 'tool', '<span class="tool__spin" aria-hidden="true"></span><span></span>');
    row.lastChild.textContent = label;
    msg.appendChild(row); scroll();
    node(nodeId, 'active'); pattern('tools');
    await wait(ms || 700);
    if (stopped) { row.classList.add('is-stopped'); node(nodeId, null); return false; }
    row.classList.add('is-done'); node(nodeId, 'done');
    return true;
  }

  async function stream(msg, text) {
    var p = el('p', 'stream'); msg.appendChild(p);
    var words = text.split(' ');
    pattern('stream');
    for (var i = 0; i < words.length; i++) {
      if (stopped) { p.appendChild(el('span', 'stream__cut', ' … stopped. I kept what I had so far.')); pattern('override'); return false; }
      p.appendChild(document.createTextNode((i ? ' ' : '') + words[i]));
      if (i % 3 === 0) scroll();
      await wait(45);
    }
    scroll();
    return true;
  }

  function actions(msg, list) {
    var row = el('div', 'acts');
    list.forEach(function (a) {
      var b = el('button', 'act' + (a.primary ? ' act--primary' : ''), a.label);
      b.type = 'button';
      b.addEventListener('click', function () {
        if (busy) return;
        row.querySelectorAll('button').forEach(function (x) { x.disabled = true; });
        b.classList.add('is-picked');
        a.run(msg);
      });
      row.appendChild(b);
    });
    msg.appendChild(row); scroll();
  }

  function meta(msg, confidence, sources) {
    var low = confidence < 80;
    var m = el('div', 'meta' + (low ? ' meta--low' : ''));
    m.appendChild(el('span', 'conf', (low ? '⚠ ' : '') + 'Confidence ' + confidence + '%'));
    sources.forEach(function (s) { m.appendChild(el('span', 'src', '📎 ' + s)); });
    msg.appendChild(m);
    pattern('confidence');
    scroll();
  }

  function chips(list) {
    chipsEl.innerHTML = '';
    list.forEach(function (c) {
      var b = el('button', 'chip-btn', c.label); b.type = 'button';
      b.addEventListener('click', function () { if (!busy) run(c.key, c.label); });
      chipsEl.appendChild(b);
    });
  }

  function startTurn() { busy = true; stopped = false; resetNodes(); stopBtn.hidden = false; sendBtn.disabled = true; chipsEl.classList.add('is-busy'); }
  function endTurn(next) { busy = false; stopBtn.hidden = true; sendBtn.disabled = false; chipsEl.classList.remove('is-busy'); chips(next || defaultChips()); }

  function defaultChips() {
    var c = [{ key: 'energy', label: 'Draft the P6 energy answer' }, { key: 'scope2', label: 'Draft Scope 2 emissions' }, { key: 'late', label: "What's late this month?" }];
    if (ctx.metric) c.splice(1, 0, { key: 'compare', label: 'Compare with last year' });
    return c;
  }

  // ---------- scenarios ----------
  var scenarios = {
    energy: async function () {
      var m = botMsg();
      node('user', 'done'); node('planner', 'active'); await wait(400); node('planner', 'done');
      if (!await step(m, 'Reading 6 electricity bills and 2 fuel invoices', 'evidence', 900)) return endTurn();
      if (!await step(m, 'Calculating energy intensity per ₹ of turnover', 'calc', 700)) return endTurn();
      if (!await step(m, 'Checking sources and confidence', 'guard', 500)) return endTurn();
      var draft = 'Total energy consumed in H1 was 2.84 lakh GJ, of which 26% came from renewable sources. Energy intensity per rupee of turnover fell 3.1% year on year.';
      var ok = await stream(m, draft);
      ctx.metric = 'energy'; setMemory('P6 · Energy · H1');
      if (!ok) return endTurn();
      meta(m, 92, ['6 electricity bills', '2 fuel invoices']);
      node('human', 'active');
      actions(m, [
        { label: 'Approve', primary: true, run: approveDraft },
        { label: 'Edit', run: editDraft },
        { label: 'Reject', run: rejectDraft }
      ]);
      endTurn();
    },

    compare: async function () {
      var m = botMsg();
      node('user', 'done');
      if (!ctx.metric) {
        node('planner', 'active'); await wait(300); node('planner', 'done');
        await stream(m, "Compare which metric? We haven't looked at one yet. Pick one and I'll remember it for follow-ups.");
        return endTurn([{ key: 'energy', label: 'Draft the P6 energy answer' }, { key: 'scope2', label: 'Draft Scope 2 emissions' }]);
      }
      node('memory', 'active'); pattern('memory');
      var note = el('div', 'memnote', '🧠 Using context: <b>' + memText.textContent + '</b> from earlier');
      m.appendChild(note); scroll();
      await wait(600); node('memory', 'done');
      node('planner', 'done');
      if (!await step(m, 'Fetching FY 2024–25 energy data', 'evidence', 700)) return endTurn();
      if (!await step(m, 'Comparing year on year', 'calc', 600)) return endTurn();
      var ok = await stream(m, 'Compared with FY 2024–25, renewable share rose from 21% to 26%, and energy intensity per rupee of turnover fell 3.1% because turnover grew faster than consumption.');
      if (ok) meta(m, 88, ['FY 2024–25 BRSR', 'H1 bills']);
      endTurn();
    },

    scope2: async function () {
      var m = botMsg();
      node('user', 'done'); node('planner', 'active'); await wait(400); node('planner', 'done');
      if (!await step(m, 'Reading electricity bills for 5 sites', 'evidence', 800)) return endTurn();
      if (!await step(m, 'Looking up supplier emission factors', 'calc', 800)) return endTurn();
      node('guard', 'error');
      ctx.metric = 'scope2'; setMemory('P6 · Scope 2');
      var err = el('div', 'errcard',
        '<b>I stopped before drafting.</b>' +
        '<p>The supplier emission factor is missing for 2 of 5 sites, so a market-based Scope 2 figure would be a guess.</p>');
      m.appendChild(err);
      meta(m, 41, ['3 of 5 supplier factors']);
      pattern('error');
      actions(m, [
        { label: 'Request factor from supplier', primary: true, run: requestSupplier },
        { label: 'Use location-based and flag it', run: useLocation }
      ]);
      endTurn();
    },

    late: async function () {
      var m = botMsg();
      node('user', 'done'); node('planner', 'active'); await wait(400); node('planner', 'done');
      if (!await step(m, 'Checking owners and due dates', 'tasks', 800)) return endTurn();
      var ok = await stream(m, '3 items need attention this month:');
      if (!ok) return endTurn();
      var ul = el('ul', 'late',
        '<li><b>Ananya Rao</b> · differently-abled headcount <em class="bad">overdue 3 days</em></li>' +
        '<li><b>Vikram Shah</b> · Manesar near-miss <em class="warn">due today</em></li>' +
        '<li><b>Rahul Mehta</b> · Noida diesel log <em>due in 2 days</em></li>');
      m.appendChild(ul); scroll();
      ctx.metric = ctx.metric || null;
      actions(m, [
        { label: 'Draft reminders', primary: true, run: draftReminders },
        { label: 'Not now', run: function () { reply('OK. I will not message anyone.'); } }
      ]);
      endTurn();
    },

    fallback: async function () {
      var m = botMsg();
      node('user', 'done'); node('planner', 'active'); await wait(300); node('planner', 'done');
      await stream(m, "That's outside what I can do in this demo. I won't guess. Here's what I can help with:");
      endTurn();
    }
  };

  // ---------- follow-up actions ----------
  async function reply(text, nodes) {
    busy = true;
    var m = botMsg();
    (nodes || []).forEach(function (n) { node(n, 'done'); });
    await stream(m, text);
    busy = false;
    return m;
  }

  async function approveDraft() {
    node('human', 'done'); pattern('approval');
    await reply('Approved by you. Queued for CFO sign-off. Nothing is filed until Arvind signs.', ['guard']);
    chips(defaultChips());
  }

  function editDraft(msg) {
    pattern('override');
    var p = msg.querySelector('.stream');
    var box = el('div', 'editbox');
    var ta = el('textarea'); ta.value = p.textContent; ta.rows = 4; ta.setAttribute('aria-label', 'Edit the draft');
    var save = el('button', 'act act--primary', 'Save edit'); save.type = 'button';
    box.appendChild(ta); box.appendChild(save);
    p.replaceWith(box); ta.focus();
    save.addEventListener('click', async function () {
      var np = el('p', 'stream'); np.textContent = ta.value; box.replaceWith(np);
      node('human', 'done');
      await reply('Got it. I will use your version and log it in the audit trail as "edited by Marci".', ['guard']);
      chips(defaultChips());
    });
  }

  async function rejectDraft() {
    pattern('override'); node('human', 'done');
    await reply('Discarded. Want me to redraft using only metered data?');
    chips([{ key: 'energy', label: 'Redraft the energy answer' }].concat(defaultChips().slice(1)));
  }

  async function requestSupplier() {
    node('tasks', 'active');
    var m = await reply('I drafted a request to the power supplier for the missing factors. Send it?', []);
    node('tasks', 'done'); node('human', 'active');
    actions(m, [
      { label: 'Send request', primary: true, run: async function () { node('human', 'done'); pattern('approval'); await reply('Sent. I will draft Scope 2 as soon as the factors arrive.'); chips(defaultChips()); } },
      { label: 'Cancel', run: async function () { await reply('Cancelled. Nothing was sent.'); chips(defaultChips()); } }
    ]);
  }

  async function useLocation() {
    node('calc', 'done');
    await reply('Drafted with the location-based figure (5,660 tCO₂e) and flagged it as "market-based pending" for the assurer.');
    chips(defaultChips());
  }

  async function draftReminders() {
    var m = await reply('Reminders drafted for Ananya, Vikram and Rahul. Send all 3?', ['tasks']);
    node('human', 'active');
    actions(m, [
      { label: 'Send 3 reminders', primary: true, run: async function () { node('human', 'done'); pattern('approval'); await reply('Sent. I will check back on Friday.'); chips(defaultChips()); } },
      { label: 'Not now', run: async function () { await reply('OK. Saved as drafts.'); chips(defaultChips()); } }
    ]);
  }

  // ---------- routing ----------
  function route(text) {
    var t = text.toLowerCase();
    if (/(compare|last year|previous|vs\.?|versus)/.test(t)) return 'compare';
    if (/(scope ?2|emission|carbon|co2)/.test(t)) return 'scope2';
    if (/(late|overdue|remind|pending|due)/.test(t)) return 'late';
    if (/(energy|p6|electric|power|renewable)/.test(t)) return 'energy';
    return 'fallback';
  }

  function run(key, label) {
    if (busy) return;
    userMsg(label);
    startTurn();
    scenarios[key]().catch(function () { endTurn(); });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = input.value.trim();
    if (!v || busy) return;
    input.value = '';
    run(route(v), v);
  });
  stopBtn.addEventListener('click', function () { stopped = true; });

  chips(defaultChips());
})();
