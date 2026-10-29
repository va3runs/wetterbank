/* The Bench Code: page controller. Hearing, live draft, motions, council. */
(function () {
  "use strict";
  var BC = window.BenchCode, T = window.Tally, Lang = window.Lang, P = BC.P;
  var $ = function (id) { return document.getElementById(id); };
  var t = function (pair, vars) {
    var s = Lang.t(pair);
    if (vars) Object.keys(vars).forEach(function (k) { s = s.split("{" + k + "}").join(vars[k]); });
    return s;
  };
  var fmtN = function (n) { return Number(n).toLocaleString(Lang.get() === "de" ? "de-DE" : "en-GB"); };

  var S = {
    for: P("For", "Dafür"), against: P("Against", "Dagegen"), abstain: P("Abstain", "Enthaltung"),
    of: P("{i} of {n}", "{i} von {n}"),
    next: P("Next paragraph", "Nächster Paragraph"),
    finish: P("Close the session", "Sitzung schließen"),
    yourVote: P("Your vote: {v}", "Ihre Stimme: {v}"),
    first: P("You are among the first to vote on this paragraph.", "Sie gehören zu den Ersten, die über diesen Paragraphen abstimmen."),
    preview: P("Preview: votes are not recorded yet.", "Vorschau: Stimmen werden noch nicht erfasst."),
    votesN: P("{n} votes", "{n} Stimmen"),
    fine: P("Anonymous. No cookies.", "Anonym. Keine Cookies."),
    howUsed: P("How votes are used", "Wie Stimmen verwendet werden"),
    doneTitle: P("Your votes have been entered into the minutes.", "Ihre Stimmen wurden zu Protokoll genommen."),
    doneSum: P("You voted for {f}, against {a}, and abstained {x} times.", "Sie haben {f}-mal dafür, {a}-mal dagegen gestimmt und sich {x}-mal enthalten."),
    more: P("Vote on the remaining {n}", "Über die restlichen {n} abstimmen"),
    readDraft: P("Read the draft", "Entwurf lesen"),
    file: P("File a motion", "Antrag stellen"),
    share: P("Share the consultation", "Anhörung teilen"),
    copied: P("Link copied.", "Link kopiert."),
    allDone: P("You have voted on every paragraph. The council thanks you.", "Sie haben über jeden Paragraphen abgestimmt. Der Rat dankt Ihnen."),
    allDoneSub: P("New motions from the public are added from time to time. Come back, or file one yourself.", "Von Zeit zu Zeit kommen neue Anträge aus der Öffentlichkeit hinzu. Schauen Sie wieder vorbei, oder stellen Sie selbst einen."),
    adopted: P("Adopted", "Angenommen"), rejected: P("Rejected", "Abgelehnt"), open: P("Under deliberation", "In Beratung"),
    motion: P("Motion from the public", "Antrag aus der Öffentlichkeit"),
    pctFor: P("{p}% in favour · {n} votes", "{p} % dafür · {n} Stimmen"),
    pctFor1: P("{p}% in favour · 1 vote", "{p} % dafür · 1 Stimme"),
    noVotes: P("No votes yet", "Noch keine Stimmen"),
    mine: P("You: {v}", "Sie: {v}"),
    rule: P("A paragraph is adopted with {a}% in favour and at least {m} votes, and rejected at {r}% or less. Abstentions are not counted. Everything else remains under deliberation.", "Ein Paragraph ist angenommen bei {a} % Zustimmung und mindestens {m} Stimmen, abgelehnt bei {r} % oder weniger. Enthaltungen zählen nicht. Alles andere bleibt in Beratung."),
    docMeta: P("Draft {d} · Status of {date} · {n} votes from {v} people", "Entwurf {d} · Stand {date} · {n} Stimmen von {v} Personen"),
    docMetaPreview: P("Draft {d} · Status of {date}", "Entwurf {d} · Stand {date}"),
    sign: P("For the council: Bench No. 0417, chair", "Für den Rat: Bank Nr. 0417, Vorsitz"),
    statusLive: P("Consultation open. {n} votes from {v} people so far.", "Anhörung läuft. Bisher {n} Stimmen von {v} Personen."),
    statusIdle: P("Consultation open. {c} paragraphs, about three minutes, anonymous.", "Anhörung läuft. {c} Paragraphen, etwa drei Minuten, anonym."),
    received: P("Your motion has been received and will be examined. Processing time: undetermined.", "Ihr Antrag ist eingegangen und wird geprüft. Bearbeitungszeit: unbestimmt."),
    receivedPreview: P("Preview: motions are not recorded yet. In the live version, yours would now be on its way to the minute-taker.", "Vorschau: Anträge werden noch nicht erfasst. In der Live-Version wäre Ihrer jetzt auf dem Weg zur Protokollführung."),
    another: P("File another motion", "Weiteren Antrag stellen"),
    tooShort: P("Please write at least a short sentence.", "Bitte schreiben Sie mindestens einen kurzen Satz."),
    shareText: P("Before benches start talking, someone has to set the rules. The public consultation on the Bench Code is open.", "Bevor Bänke anfangen zu reden, muss jemand die Regeln festlegen. Die öffentliche Anhörung zum Bank-Kodex läuft.")
  };
  var VOTE_LABEL = { for: S.for, against: S.against, abstain: S.abstain };
  var SESSION_SIZE = 10;

  var tally = null;               /* totals from the server */
  var local = {};                 /* votes cast in this page view, added on top of the totals */

  /* ---- Paragraph catalogue: seeded paragraphs plus approved motions ---- */
  function catalogue() {
    var list = BC.CLAUSES.slice();
    (tally && tally.motions || []).forEach(function (m, i) {
      var text = { en: m.body_en || m.body, de: m.body_de || m.body };
      list.push({ id: m.id, section: Number(m.section), t: text, c: BC.MOTION_COMMENTS[i % BC.MOTION_COMMENTS.length], motion: true });
    });
    return list;
  }
  function sectionOf(n) { return BC.SECTIONS.filter(function (s) { return s.n === n; })[0]; }
  function refOf(c) {
    var s = sectionOf(c.section), list = catalogue().filter(function (x) { return x.section === c.section; });
    var abs = list.indexOf(c) + 1 || list.map(function (x) { return x.id; }).indexOf(c.id) + 1;
    return "§ " + c.section + " (" + abs + ") · " + t(s.title);
  }
  function counts(id) {
    var n = (tally && tally.clauses && tally.clauses[id]) || { for: 0, against: 0, abstain: 0 };
    var r = { for: n.for || 0, against: n.against || 0, abstain: n.abstain || 0 };
    if (local[id]) r[local[id]]++;
    return r;
  }

  /* ---- The hearing ---- */
  var queue = [], qi = 0, answered = null, sessionVotes = [];

  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
  function buildQueue() {
    var mine = T.myVotes();
    var open = catalogue().filter(function (c) { return !mine[c.id]; });
    var bySec = {};
    shuffle(open).forEach(function (c) { (bySec[c.section] = bySec[c.section] || []).push(c); });
    var picked = [], motions = open.filter(function (c) { return c.motion; }).slice(0, 2);
    picked = picked.concat(motions);
    var secs = Object.keys(bySec);
    /* Two per section first, then fill up. */
    for (var round = 0; round < 3 && picked.length < SESSION_SIZE; round++) {
      secs.forEach(function (s) {
        var c = bySec[s].filter(function (x) { return picked.indexOf(x) < 0; })[0];
        if (c && picked.length < SESSION_SIZE) picked.push(c);
      });
    }
    /* Keep the order readable: by section, then shuffled within. */
    var order = catalogue().map(function (x) { return x.id; });
    picked.sort(function (a, b) { return a.section - b.section || order.indexOf(a.id) - order.indexOf(b.id); });
    return picked;
  }
  function remaining() {
    var mine = T.myVotes();
    return catalogue().filter(function (c) { return !mine[c.id]; }).length;
  }

  function startSession() { queue = buildQueue(); qi = 0; answered = null; sessionVotes = []; renderBill(); }

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  function renderBill() {
    var box = $("bill"); box.textContent = "";
    var card = el("div", "bill");
    if (!queue.length || qi >= queue.length) { renderDone(card); box.appendChild(card); return; }
    var c = queue[qi];
    var top = el("div", "bill-top");
    top.appendChild(el("span", "ref", refOf(c) + (c.motion ? " · " + t(S.motion) : "")));
    top.appendChild(el("span", null, t(S.of, { i: qi + 1, n: queue.length })));
    card.appendChild(top);
    card.appendChild(el("p", "clause", t(c.t)));
    var votes = el("div", "votes");
    ["for", "against", "abstain"].forEach(function (v) {
      var b = el("button", "btn", t(VOTE_LABEL[v]));
      b.type = "button";
      b.setAttribute("aria-pressed", answered === v ? "true" : "false");
      if (answered) b.disabled = true;
      b.addEventListener("click", function () { cast(c, v); });
      votes.appendChild(b);
    });
    card.appendChild(votes);
    if (answered) card.appendChild(renderAfter(c));
    else {
      var f = el("p", "fine"); f.appendChild(document.createTextNode(t(S.fine) + " "));
      var a = el("a", null, t(S.howUsed)); a.href = "privacy.html#participants"; f.appendChild(a);
      card.appendChild(f);
    }
    box.appendChild(card);
  }

  function renderAfter(c) {
    var wrap = el("div", "after");
    var n = counts(c.id), total = n.for + n.against + n.abstain;
    if (!T.configured) wrap.appendChild(el("p", "split-note", t(S.preview)));
    else if (total < (T.config.showShareAfter || 5)) wrap.appendChild(el("p", "split-note", t(S.first)));
    else {
      var split = el("div", "split");
      [["for", ""], ["against", "a"], ["abstain", "x"]].forEach(function (p) {
        var pct = Math.round(100 * n[p[0]] / total);
        var row = el("div", "row");
        row.appendChild(el("span", null, t(VOTE_LABEL[p[0]])));
        var tr = el("div", "track"), fl = el("div", "fill " + p[1]); fl.style.width = pct + "%"; tr.appendChild(fl);
        row.appendChild(tr); row.appendChild(el("span", "v", pct + "%"));
        split.appendChild(row);
      });
      wrap.appendChild(split);
      wrap.appendChild(el("p", "split-note", t(S.votesN, { n: fmtN(total) })));
    }
    if (c.c) {
      var rm = el("div", "remark");
      rm.appendChild(el("span", "by", t(BC.WHO[c.c[0]])));
      rm.appendChild(el("p", null, (c.c[0] === "minutes" ? "" : "“") + t(c.c[1]) + (c.c[0] === "minutes" ? "" : "”")));
      wrap.appendChild(rm);
    }
    var foot = el("div", "bill-foot");
    foot.appendChild(el("span", "split-note", t(S.yourVote, { v: t(VOTE_LABEL[answered]) })));
    var next = el("button", "btn btn-primary", t(qi + 1 < queue.length ? S.next : S.finish));
    next.type = "button";
    next.addEventListener("click", function () { qi++; answered = null; renderBill(); focusBill(); });
    foot.appendChild(next);
    wrap.appendChild(foot);
    return wrap;
  }

  function focusBill() {
    var b = $("bill").querySelector(".votes .btn, .done .btn");
    if (b) b.focus({ preventScroll: true });
    var top = $("hearing").getBoundingClientRect().top;
    if (top < 0) $("bill").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  }

  function cast(c, v) {
    if (answered) return;
    answered = v; local[c.id] = v; sessionVotes.push(v);
    T.vote(c.id, v, Lang.get());
    renderBill(); renderDoc();
    var nb = $("bill").querySelector(".bill-foot .btn"); if (nb) nb.focus({ preventScroll: true });
  }

  function renderDone(card) {
    var d = el("div", "done");
    var left = remaining();
    if (!sessionVotes.length) {
      d.appendChild(el("h3", null, t(S.allDone)));
      d.appendChild(el("p", null, t(S.allDoneSub)));
    } else {
      var f = 0, a = 0, x = 0; sessionVotes.forEach(function (v) { if (v === "for") f++; else if (v === "against") a++; else x++; });
      d.appendChild(el("h3", null, t(S.doneTitle)));
      d.appendChild(el("p", null, t(S.doneSum, { f: f, a: a, x: x })));
    }
    var cta = el("div", "cta");
    if (left > 0) {
      var more = el("button", "btn btn-primary", t(S.more, { n: left })); more.type = "button";
      more.addEventListener("click", function () { startSession(); focusBill(); });
      cta.appendChild(more);
    }
    var rd = el("a", "btn btn-quiet", t(S.readDraft)); rd.href = "#draft"; cta.appendChild(rd);
    var mo = el("a", "btn btn-quiet", t(S.file)); mo.href = "#motion"; cta.appendChild(mo);
    var sh = el("button", "btn-text", t(S.share)); sh.type = "button"; sh.addEventListener("click", share); cta.appendChild(sh);
    d.appendChild(cta);
    var msg = el("p", "fine"); msg.id = "share-msg"; msg.setAttribute("role", "status"); d.appendChild(msg);
    card.appendChild(d);
  }

  function share() {
    var url = location.origin + location.pathname + "?src=share";
    var data = { title: t(BC.COUNCIL.doc), text: t(S.shareText), url: url };
    if (navigator.share) { navigator.share(data).catch(function () {}); return; }
    var m = $("share-msg");
    (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(function () { if (m) m.textContent = t(S.copied); })
      .catch(function () { if (m) m.textContent = url; });
  }

  /* ---- The draft ---- */
  function today() {
    return new Date().toLocaleDateString(Lang.get() === "de" ? "de-DE" : "en-GB", { day: "numeric", month: "long", year: "numeric" });
  }
  function renderDoc() {
    var C = T.config;
    $("rule-note").textContent = t(S.rule, { a: C.adoptAt || 60, m: C.decideMinVotes || 15, r: C.rejectAt || 40 });
    $("doc-council").textContent = t(BC.COUNCIL.name);
    $("doc-title").textContent = t(BC.COUNCIL.doc);
    $("doc-meta").textContent = tally
      ? t(S.docMeta, { d: C.draft || "0.3", date: today(), n: fmtN(tally.votes || 0), v: fmtN(tally.voters || 0) })
      : t(S.docMetaPreview, { d: C.draft || "0.3", date: today() });
    $("doc-preamble").textContent = t(BC.PREAMBLE);
    $("doc-sign").textContent = t(S.sign);
    var body = $("doc-body"); body.textContent = "";
    var mine = T.myVotes(), all = catalogue();
    BC.SECTIONS.forEach(function (s) {
      var sec = el("div", "para");
      var h = el("h4"); h.appendChild(el("span", "n", "§ " + s.n)); h.appendChild(document.createTextNode(t(s.title)));
      sec.appendChild(h);
      var ol = el("ol"), k = 0;
      (s.fixed || []).forEach(function (f) {
        k++; var li = el("li");
        li.appendChild(el("span", "abs", "(" + k + ")")); li.appendChild(el("p", "txt", t(f)));
        ol.appendChild(li);
      });
      all.filter(function (c) { return c.section === s.n; }).forEach(function (c) {
        k++; var n = counts(c.id), st = T.status(n);
        var li = el("li", st.status);
        li.appendChild(el("span", "abs", "(" + k + ")")); li.appendChild(el("p", "txt", t(c.t)));
        var meta = el("div", "st");
        meta.appendChild(el("span", "tag " + st.status, t(S[st.status])));
        if (c.motion) meta.appendChild(el("span", "tag motion", t(S.motion)));
        meta.appendChild(el("span", null, st.pct == null ? t(S.noVotes) : t(st.total === 1 ? S.pctFor1 : S.pctFor, { p: st.pct, n: fmtN(st.total) })));
        var my = local[c.id] || mine[c.id];
        if (my) meta.appendChild(el("span", null, t(S.mine, { v: t(VOTE_LABEL[my]).toLowerCase() })));
        li.appendChild(meta);
        ol.appendChild(li);
      });
      sec.appendChild(ol);
      body.appendChild(sec);
    });
  }

  /* ---- Status line ---- */
  function renderStatus() {
    var s = $("status");
    var dot = '<span class="dot" aria-hidden="true"></span>';
    var txt = tally && tally.votes ? t(S.statusLive, { n: fmtN(tally.votes), v: fmtN(tally.voters) }) : t(S.statusIdle, { c: catalogue().length });
    s.innerHTML = dot; s.appendChild(document.createTextNode(txt));
  }

  /* ---- Motions ---- */
  function renderMotionForm() {
    var sel = $("m-section"), cur = sel.value;
    sel.textContent = "";
    BC.SECTIONS.filter(function (s) { return s.clauses; }).forEach(function (s) {
      var o = el("option", null, "§ " + s.n + " · " + t(s.title)); o.value = String(s.n); sel.appendChild(o);
    });
    if (cur) sel.value = cur;
  }
  $("m-body").addEventListener("input", function () { $("m-count").textContent = this.value.length + " / 240"; });
  $("motion-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var body = $("m-body").value.trim();
    var msg = this.querySelector(".err");
    if (body.length < 8) {
      if (!msg) { msg = el("p", "fine err"); this.insertBefore(msg, this.lastElementChild); }
      msg.textContent = t(S.tooShort); $("m-body").focus(); return;
    }
    T.propose($("m-section").value, body.slice(0, 240), Lang.get());
    var box = $("motion-box"), form = this;
    form.hidden = true;
    var r = el("div", "received");
    r.appendChild(el("p", null, t(T.configured ? S.received : S.receivedPreview)));
    var again = el("button", "btn btn-quiet", t(S.another)); again.type = "button";
    again.addEventListener("click", function () { r.remove(); form.reset(); $("m-count").textContent = "0 / 240"; form.hidden = false; $("m-body").focus(); });
    r.appendChild(again);
    box.appendChild(r);
  });

  /* ---- Council ---- */
  function renderMembers() {
    var box = $("members"); box.textContent = "";
    BC.MEMBERS.forEach(function (m) {
      var d = el("div", "member");
      d.appendChild(el("span", "role", t(m.role)));
      d.appendChild(el("h3", null, t(m.who)));
      d.appendChild(el("p", null, t(m.about)));
      box.appendChild(d);
    });
  }

  $("print").addEventListener("click", function () { window.print(); });

  function renderAll() { renderBill(); renderDoc(); renderStatus(); renderMotionForm(); renderMembers(); }

  Lang.init();
  Lang.on(renderAll);
  startSession();
  renderAll();
  T.load().then(function (data) {
    if (!data) return;
    tally = data;
    if (!answered && qi === 0) queue = buildQueue();
    renderAll();
  });

  if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(function () {});
})();
