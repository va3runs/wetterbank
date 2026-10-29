/* Wetterbank research site: the "Take a seat" controller. */
(function () {
  "use strict";
  var WB = window.Wetterbank, E = window.WBEncounter, D = window.WBCollect, P = E.P;
  var $ = function (id) { return document.getElementById(id); };
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  var S = {
    bench: P("Bench", "Bank"), you: P("You", "Sie"),
    moment: P("Moment {n} of 5", "Moment {n} von 5"),
    next: P("Continue", "Weiter"), whatdo: P("What do you do?", "Was tun Sie?"),
    over: P("The encounter is over.", "Die Begegnung ist vorbei."),
    yours: P("Your bench: {b}", "Ihre Bank: {b}"),
    preview: P("Live results appear here once data collection is switched on.", "Live-Ergebnisse erscheinen hier, sobald die Datenerhebung eingeschaltet ist."),
    few: P("Results appear once {n} people have taken part. So far: {k}.", "Ergebnisse erscheinen, sobald {n} Personen teilgenommen haben. Bisher: {k}."),
    offline: P("Results could not be loaded right now.", "Die Ergebnisse konnten gerade nicht geladen werden."),
    thBench: P("Bench", "Bank"), thN: P("People", "Personen"), thTalk: P("Talked to the stranger", "Mit der Person geredet"),
    thNames: P("Names", "Namen"), thEasy: P("“Made it easier” (1–5)", "„Hat es leichter gemacht“ (1–5)"), thIntr: P("“Intrusive” (1–5)", "„Aufdringlich“ (1–5)"),
    shareText: P("I sat on a bench that talks. Can a public object start a conversation between strangers?", "Ich saß auf einer Bank, die redet. Kann ein Objekt im öffentlichen Raum ein Gespräch zwischen Fremden beginnen?"),
    copied: P("Link copied.", "Link kopiert."),
    agree: P("Agree", "Stimme zu"), disagree: P("Disagree", "Stimme nicht zu")
  };
  var LIKERT = [
    { name: "easier", t: P("The bench made it easier to talk to the stranger.", "Die Bank hat es leichter gemacht, mit der fremden Person zu reden.") },
    { name: "intrusive", t: P("The bench was intrusive.", "Die Bank war aufdringlich.") },
    { name: "want", t: P("I would like a bench like this at my stop.", "Ich hätte gern so eine Bank an meiner Haltestelle.") },
    { name: "felt_real", t: P("I reacted the way I would in real life.", "Ich habe so reagiert, wie ich es im echten Leben tun würde.") }
  ];

  var L = function () { return WB.lang(); };
  function tx(pair, vars) {
    var s = pair[L()] || pair.en;
    if (vars) Object.keys(vars).forEach(function (k) { s = s.replace("{" + k + "}", vars[k]); });
    return s;
  }

  var run = null; /* the current session */
  var weatherLine = null;

  if (!D.configured) document.body.classList.add("is-preview");

  /* Keep the scene pinned exactly under the header, whatever its height. */
  function measureTop() {
    var h = document.querySelector(".top");
    if (h) document.documentElement.style.setProperty("--top-h", h.offsetHeight + "px");
  }
  measureTop();
  window.addEventListener("resize", measureTop);

  /* Today's weather for the weather bench's first line (falls back after 3 s). */
  (function () {
    var c = WB.cities.duesseldorf, done = false;
    var timer = setTimeout(function () { done = true; }, 3000);
    WB.fetchWeather(c.lat, c.lon).then(function (w) {
      if (done) return; clearTimeout(timer);
      var o = WB.opener(w, { en: "Düsseldorf", de: "Düsseldorf" });
      weatherLine = P("“Good evening. " + o.en + "”", "„Guten Abend. " + o.de + "“");
    }).catch(function () {});
  })();

  /* ---- Screens ---- */
  function show(id) {
    document.querySelectorAll(".screen").forEach(function (s) { s.classList.toggle("on", s.id === id); });
    window.scrollTo(0, 0);
    if (id !== "s-play") $("moment").textContent = "";
  }

  /* ---- Consent ---- */
  var adult = $("adult");
  adult.addEventListener("change", function () { $("sit-share").disabled = !adult.checked; });
  $("sit-share").addEventListener("click", function () { begin(true); });
  $("sit-private").addEventListener("click", function () { begin(false); });

  function seen() { try { return JSON.parse(localStorage.getItem("wb-seen") || "[]"); } catch (e) { return []; } }
  function remember(b) { try { var s = seen(); if (s.indexOf(b) < 0) s.push(b); localStorage.setItem("wb-seen", JSON.stringify(s)); } catch (e) {} }
  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }

  function begin(consent) {
    var q = new URLSearchParams(location.search), s = seen();
    var bench = q.get("bench"), stranger = q.get("stranger");
    if (E.benchKeys.indexOf(bench) < 0) {
      var fresh = E.benchKeys.filter(function (b) { return s.indexOf(b) < 0; });
      bench = pick(fresh.length ? fresh : E.benchKeys);
    }
    if (E.strangerKeys.indexOf(stranger) < 0) stranger = pick(E.strangerKeys);
    run = {
      id: D.uuid(), consent: consent && D.configured, bench: bench, stranger: stranger,
      repeat: s.length > 0, lang: L(), started: Date.now(), shown: Date.now(),
      enc: new E.Encounter(bench, stranger, weatherLine), log: [], events: [], sent: false
    };
    if (run.consent) D.start(run);
    var stage = $("stage");
    stage.className = "stage p-" + stranger;
    $("log").textContent = "";
    show("s-play");
    play(run.enc.open());
  }

  /* ---- The encounter ---- */
  function speakerLabel(m) {
    if (m.who === "bench") return tx(S.bench);
    if (m.who === "you") return tx(S.you);
    if (m.who === "stranger") return E.fmt(run.enc.st.S, run.enc.st, L());
    return "";
  }
  function renderMsg(m) {
    var el = document.createElement("div");
    el.className = "msg m-" + m.who;
    var text = E.fmt(m.t, run.enc.st, L(), run.enc.ref);
    if (m.who === "narr") { el.textContent = text; }
    else if (m.who === "display") { var sp = document.createElement("span"); sp.textContent = text; el.appendChild(sp); }
    else {
      var w = document.createElement("span"); w.className = "who"; w.textContent = speakerLabel(m);
      var b = document.createElement("div"); b.className = "b"; b.textContent = text;
      el.appendChild(w); el.appendChild(b);
    }
    return el;
  }
  function updateStage() {
    var sc = run.enc.scene, st = $("stage");
    st.classList.toggle("speaking", sc.speaking);
    st.classList.toggle("raining", sc.rain);
    st.classList.toggle("pigeon", sc.pigeon);
    st.classList.toggle("you-phone", sc.phone);
    st.classList.toggle("st-phone", sc.strangerPhone);
    st.classList.toggle("closer", sc.closer);
    var d = run.enc.display();
    $("led").textContent = d === "0" ? "▶▶" : d + "'";
    $("moment").textContent = run.enc.done ? "" : tx(S.moment, { n: run.enc.beat + 1 });
  }
  function scrollDown() {
    var c = $("choices");
    window.scrollTo({ top: document.body.scrollHeight, behavior: reduce ? "auto" : "smooth" });
    return c;
  }

  function play(msgs) {
    var log = $("log"), box = $("choices"), i = 0;
    box.setAttribute("aria-busy", "true");
    updateStage();
    (function next() {
      if (i >= msgs.length) { box.removeAttribute("aria-busy"); renderChoices(); scrollDown(); run.shown = Date.now(); return; }
      run.log.push(msgs[i]);
      log.appendChild(renderMsg(msgs[i]));
      i++; scrollDown();
      setTimeout(next, reduce ? 0 : 650);
    })();
  }

  function renderChoices() {
    var opts = $("opts"); opts.textContent = "";
    var q = $("q");
    if (run.enc.done) {
      q.textContent = tx(S.over);
      var b = document.createElement("button");
      b.type = "button"; b.className = "btn btn-primary"; b.textContent = tx(S.next);
      b.addEventListener("click", toSurvey);
      opts.appendChild(b);
      return;
    }
    q.textContent = tx(S.whatdo);
    run.enc.choices().forEach(function (c, idx) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "btn " + (idx === 0 ? "btn-quiet" : "btn-quiet");
      b.textContent = E.fmt(c.t, run.enc.st, L());
      b.addEventListener("click", function () {
        run.events.push({ m: run.enc.beat + 1, c: c.id, t: Date.now() - run.shown });
        play(run.enc.choose(c.id));
      });
      opts.appendChild(b);
    });
  }

  function rerenderLog() {
    if (!run) return;
    var log = $("log"); log.textContent = "";
    run.log.forEach(function (m) { log.appendChild(renderMsg(m)); });
    if (!$("choices").hasAttribute("aria-busy")) renderChoices();
    updateStage();
  }

  /* ---- Survey ---- */
  (function buildLikerts() {
    var box = $("likerts");
    LIKERT.forEach(function (it) {
      var fs = document.createElement("fieldset"); fs.className = "field";
      var lg = document.createElement("legend"); lg.dataset.en = it.t.en; lg.dataset.de = it.t.de; lg.textContent = it.t.en;
      fs.appendChild(lg);
      var row = document.createElement("div"); row.className = "opts likert";
      for (var v = 1; v <= 5; v++) {
        var lb = document.createElement("label");
        var inp = document.createElement("input"); inp.type = "radio"; inp.name = it.name; inp.value = v;
        inp.setAttribute("aria-label", String(v));
        var sp = document.createElement("span"); sp.textContent = v;
        lb.appendChild(inp); lb.appendChild(sp); row.appendChild(lb);
      }
      fs.appendChild(row);
      var ends = document.createElement("div"); ends.className = "likert-ends";
      var a = document.createElement("span"); a.dataset.en = S.disagree.en; a.dataset.de = S.disagree.de; a.textContent = S.disagree.en;
      var z = document.createElement("span"); z.dataset.en = S.agree.en; z.dataset.de = S.agree.de; z.textContent = S.agree.en;
      ends.appendChild(a); ends.appendChild(z); fs.appendChild(ends);
      box.appendChild(fs);
    });
  })();

  function toSurvey() {
    $("survey").reset();
    show("s-survey");
  }

  $("survey").addEventListener("submit", function (e) {
    e.preventDefault();
    var f = e.target, sv = {};
    ["who", "credit", "real", "age", "germany", "german"].concat(LIKERT.map(function (x) { return x.name; })).forEach(function (n) {
      var el = f.querySelector('input[name="' + n + '"]:checked');
      if (el) sv[n] = /^\d$/.test(el.value) ? Number(el.value) : el.value;
    });
    sv.lang_end = L();
    var open = $("open").value.trim().slice(0, 500);
    finish(sv, open);
  });

  function finish(survey, openText) {
    var out = run.enc.outcome();
    remember(run.bench);
    if (run.consent && !run.sent) {
      run.sent = true;
      D.finish({ id: run.id, outcome: out, events: run.events, survey: survey, openText: openText || null, durationMs: Math.min(Date.now() - run.started, 7200000) })
        .then(function () { loadStats(); });
    } else loadStats();
    run.outcomeData = out;
    renderResult();
    show("s-result");
  }

  /* ---- Result ---- */
  function renderResult() {
    if (!run || !run.outcomeData) return;
    var o = run.outcomeData, st = run.enc.st;
    $("h-result").textContent = tx(E.RESULT_TEXT[o.result]);
    var via = "";
    if (o.first_contact && o.result !== "left") {
      via = tx(E.VIA_TEXT[o.first_contact.via]).replace("{thing}", tx(E.THING[run.stranger]));
    }
    if (o.names_via === "bench") via += " " + tx(P("The names came through the bench.", "Die Namen kamen über die Bank."));
    if (o.names_via === "dog") via += " " + tx(P("The dog did the introductions.", "Der Hund hat Sie einander vorgestellt."));
    if (o.bench_refused) via += " " + tx(P("When the bench asked for a name, the stranger said no.", "Als die Bank nach dem Namen fragte, sagte die Person Nein."));
    $("via").textContent = via.trim();
    var B = E.BENCHES[run.bench];
    $("yourbench").textContent = tx(S.yours, { b: tx(B.name) });
    $("yourbench-about").textContent = tx(B.about);
    var ul = $("benches"); ul.textContent = "";
    E.benchKeys.forEach(function (k) {
      var li = document.createElement("li"); if (k === run.bench) li.className = "yours";
      var b = document.createElement("b"); b.textContent = tx(E.BENCHES[k].name);
      var sp = document.createElement("span"); sp.textContent = tx(E.BENCHES[k].about);
      li.appendChild(b); li.appendChild(sp); ul.appendChild(li);
    });
    $("code-card").hidden = !run.consent;
    if (run.consent) $("code").textContent = run.id.slice(0, 8);
    renderStats();
  }

  var stats = null, statsState = "loading";
  function loadStats() {
    if (!D.configured) { statsState = "preview"; renderStats(); return; }
    D.stats().then(function (s) { stats = s; statsState = s ? "ok" : "error"; renderStats(); });
  }
  function renderStats() {
    var box = $("stats"); if (!box) return;
    box.textContent = "";
    var p = document.createElement("p"); p.className = "small";
    if (statsState === "preview") { p.textContent = tx(S.preview); box.appendChild(p); return; }
    if (statsState === "error") { p.textContent = tx(S.offline); box.appendChild(p); return; }
    if (statsState !== "ok") return;
    if (!stats || (stats.total || 0) < D.minResults) {
      p.textContent = tx(S.few, { n: D.minResults, k: stats ? stats.total || 0 : 0 }); box.appendChild(p); return;
    }
    var t = document.createElement("table"); t.className = "stats";
    var hd = "<thead><tr><th>" + tx(S.thBench) + "</th><th>" + tx(S.thN) + "</th><th>" + tx(S.thTalk) + "</th><th>" + tx(S.thNames) + "</th><th>" + tx(S.thEasy) + "</th><th>" + tx(S.thIntr) + "</th></tr></thead>";
    t.innerHTML = hd;
    var tb = document.createElement("tbody");
    E.benchKeys.forEach(function (k) {
      var r = (stats.benches || []).filter(function (x) { return x.bench === k; })[0];
      var tr = document.createElement("tr"); if (k === run.bench) tr.className = "yours";
      var cells = [tx(E.BENCHES[k].name), r ? r.n : 0, r && r.n ? Math.round(r.talked_pct) + "%" : "–", r && r.n ? Math.round(r.names_pct) + "%" : "–",
        r && r.easier_avg != null ? Number(r.easier_avg).toFixed(1) : "–", r && r.intrusive_avg != null ? Number(r.intrusive_avg).toFixed(1) : "–"];
      cells.forEach(function (c) { var td = document.createElement("td"); td.textContent = c; tr.appendChild(td); });
      tb.appendChild(tr);
    });
    t.appendChild(tb); box.appendChild(t);
    var note = document.createElement("p"); note.className = "small"; note.style.marginTop = ".6rem";
    note.textContent = tx(P("Based on {k} completed encounters. Small numbers: read as a hint, not a finding.", "Basierend auf {k} abgeschlossenen Begegnungen. Kleine Zahlen: eher ein Hinweis als ein Ergebnis."), { k: stats.total });
    box.appendChild(note);
  }

  $("again").addEventListener("click", function () {
    begin(run ? run.consent : false);
  });
  $("share").addEventListener("click", function () {
    var url = location.origin + location.pathname + "?src=share";
    var data = { title: "Wetterbank", text: tx(S.shareText), url: url };
    if (navigator.share) { navigator.share(data).catch(function () {}); return; }
    (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(function () {
      $("shared-msg").textContent = tx(S.copied);
    }).catch(function () { $("shared-msg").textContent = url; });
  });

  /* ---- Language ---- */
  WB.initLang();
  WB.onLang(function () {
    if (run) { rerenderLog(); renderResult(); }
  });

  if ("serviceWorker" in navigator) navigator.serviceWorker.register("../sw.js", { scope: "../" }).catch(function () {});
})();
