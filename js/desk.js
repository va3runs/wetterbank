/* Wetterbank® complaint form. Runs entirely in the browser: nothing is sent or stored.
   The page language (<html lang>) picks the text below. */
(function () {
  "use strict";
  var TEXT = {
    en: {
      empty: "Please describe the incident first. Even “wet” counts.",
      filing: "Filing…",
      file: "File complaint",
      caseNo: "Case", category: "Category", waiting: "Waiting for", status: "Status",
      forwarded: "Forwarded to the weather",
      clears: "Clears in 30 seconds",
      clearNow: "Clear now",
      replies: [
        "Your complaint has been forwarded to the weather. Processing time: undetermined.",
        "We have registered your concern. The weather is currently unavailable.",
        "You are not alone: 17 people have already complained today. What is your name?",
        "The weather has read your complaint and declines to comment.",
        "Your complaint has been forwarded to the responsible cloud. The cloud is on holiday.",
        "Thank you for your feedback. Unfortunately we can guarantee neither rain nor sun.",
        "Your concern has been classified as “feels colder than measured”. A reply is not planned.",
        "Your complaint is the third on this topic today. The person next to you filed the same one.",
        "We understand. The weather does not care. Would you like to talk about it?",
        "Thank you. Your complaint has been filed, folder: “Monday again”.",
        "Please wait. You are number 212 in the queue. Perhaps you know number 211?",
        "Complaint rejected: today the weather is, unfortunately, exactly as it is. What is your name?",
        "Your complaint has been accepted. The person next to you is complaining too. Ask for their name.",
        "Grumbling is better together. So what is your name?",
        "We cannot change the weather, but we can change your day. Start with your name.",
        "Complaint processed. Unfortunately we are still missing your name. What is your name?",
        "The weather asks us to pass on: talk to someone who answers. What is your name?",
        "While you wait for an answer, you can introduce yourself to the next person on the bench. It is faster.",
        "You sound like you have more on your mind than the weather. What is your name?",
        "Your complaint is important to us. So is your name. What is your name?",
        "Complaint received. Tip: people who freeze together can also introduce themselves."
      ]
    },
    de: {
      empty: "Bitte schildern Sie zuerst den Vorfall. Auch „nass“ zählt.",
      filing: "Wird eingereicht…",
      file: "Beschwerde einreichen",
      caseNo: "Vorgang", category: "Kategorie", waiting: "Warten auf", status: "Status",
      forwarded: "An das Wetter weitergeleitet",
      clears: "Leert sich in 30 Sekunden",
      clearNow: "Jetzt leeren",
      replies: [
        "Ihre Beschwerde wurde an das Wetter weitergeleitet. Bearbeitungszeit: unbestimmt.",
        "Wir haben Ihr Anliegen registriert. Das Wetter ist derzeit nicht erreichbar.",
        "Sie sind nicht allein: Heute haben sich bereits 17 Personen beschwert. Wie heißen Sie?",
        "Das Wetter hat Ihre Beschwerde gelesen und möchte sich dazu nicht äußern.",
        "Ihre Beschwerde wurde an die zuständige Wolke weitergeleitet. Die Wolke ist im Urlaub.",
        "Vielen Dank für Ihre Rückmeldung. Leider können wir weder Regen noch Sonne garantieren.",
        "Ihr Anliegen wurde als „gefühlt kälter als gemessen“ eingestuft. Eine Antwort ist nicht vorgesehen.",
        "Ihre Beschwerde ist heute die dritte zu diesem Thema. Die Person neben Ihnen hat dieselbe eingereicht.",
        "Wir verstehen Sie. Dem Wetter ist es egal. Möchten Sie darüber reden?",
        "Danke. Ihre Beschwerde wurde abgelegt, Ordner: „Schon wieder Montag“.",
        "Bitte warten. Sie sind Nummer 212 in der Warteschlange. Kennen Sie vielleicht Nummer 211?",
        "Beschwerde abgelehnt: Das Wetter ist heute leider genau so, wie es ist. Wie heißen Sie?",
        "Ihre Beschwerde wurde angenommen. Die Person neben Ihnen beschwert sich auch. Fragen Sie nach ihrem Namen.",
        "Gemeinsam meckert es sich besser. Wie heißen Sie eigentlich?",
        "Das Wetter können wir nicht ändern, Ihren Tag schon. Fangen Sie mit Ihrem Namen an.",
        "Beschwerde bearbeitet. Leider fehlt uns noch Ihr Name. Wie heißen Sie?",
        "Das Wetter lässt ausrichten: Reden Sie mit jemandem, der antwortet. Wie heißen Sie?",
        "Während Sie auf eine Antwort warten, können Sie sich der nächsten Person auf der Bank vorstellen. Das geht schneller.",
        "Sie klingen, als hätten Sie mehr auf dem Herzen als das Wetter. Wie heißen Sie?",
        "Ihre Beschwerde ist uns wichtig. Ihr Name auch. Wie heißen Sie?",
        "Beschwerde erhalten. Tipp: Wer gemeinsam friert, kann sich auch vorstellen."
      ]
    }
  };
  var t = TEXT[(document.documentElement.lang || "en").slice(0, 2)] || TEXT.en;
  var replies = t.replies;

  var form = document.getElementById("desk"), out = document.getElementById("receipt");
  if (!form || !out) return;

  /* Badge and hero button: bring the complaint box into view and put the cursor in it. */
  var smooth = !matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll("[data-to-desk]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      form.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "center" });
      setTimeout(function () { document.getElementById("what").focus({ preventScroll: true }); }, smooth ? 450 : 0);
      form.classList.add("called");
      setTimeout(function () { form.classList.remove("called"); }, 1400);
    });
  });

  var what = document.getElementById("what"), send = document.getElementById("send");
  var hint = document.getElementById("hint"), count = document.getElementById("count");
  var cat = document.getElementById("cat"), line = document.getElementById("line");
  var i = Math.floor(Math.random() * replies.length);
  var touch = matchMedia("(pointer: coarse)").matches;
  var CLEAR_AFTER = 30000, timer = null, hovering = false, filing = false;

  /* The writing field glows only while nobody is using the form. */
  function updateIdle() {
    var idle = out.hidden && !what.value && document.activeElement !== what && !filing;
    form.classList.toggle("idle", idle);
  }

  function row(dl, k, v) {
    var dt = document.createElement("dt"), dd = document.createElement("dd");
    dt.textContent = k; dd.textContent = v; dl.appendChild(dt); dl.appendChild(dd);
  }

  /* After a receipt, the form clears itself after 30 seconds without any activity. */
  function startTimer() {
    clearTimeout(timer);
    if (out.hidden || hovering || document.hidden) return;
    timer = setTimeout(reset, CLEAR_AFTER);
    var bar = out.querySelector(".bar span");
    if (bar && smooth) {
      bar.style.transition = "none"; bar.style.transform = "scaleX(1)";
      void bar.offsetWidth;
      bar.style.transition = "transform " + CLEAR_AFTER + "ms linear"; bar.style.transform = "scaleX(0)";
    }
  }
  function pauseTimer() {
    clearTimeout(timer);
    var bar = out.querySelector(".bar span");
    if (bar) { bar.style.transition = "none"; bar.style.transform = "scaleX(1)"; }
  }
  function reset() {
    clearTimeout(timer);
    out.hidden = true; out.textContent = "";
    hint.textContent = "";
    /* Keep a half-written complaint: only reset what nobody is working on. */
    if (!what.value.trim()) { what.value = ""; cat.selectedIndex = 0; line.selectedIndex = 0; }
    updateCount(); updateIdle();
  }
  function updateCount() {
    var n = what.value.length;
    count.textContent = n > 150 ? n + " / 200" : "";
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (filing) return;
    if (!what.value.trim()) {
      hint.textContent = t.empty;
      what.value = ""; what.focus(); return;
    }
    hint.textContent = "";
    filing = true; send.disabled = true; send.textContent = t.filing; pauseTimer();
    setTimeout(function () {
      var dl = document.createElement("dl");
      row(dl, t.caseNo, "WB-" + (1000 + Math.floor(Math.random() * 9000)));
      row(dl, t.category, cat.value);
      if (line.selectedIndex > 0) row(dl, t.waiting, line.value);
      row(dl, t.status, t.forwarded);
      var p = document.createElement("p"); p.textContent = replies[i % replies.length]; i++;
      var clr = document.createElement("div"); clr.className = "clear";
      var note = document.createElement("span"); note.textContent = t.clears;
      var bar = document.createElement("span"); bar.className = "bar"; bar.setAttribute("aria-hidden", "true"); bar.appendChild(document.createElement("span"));
      var now = document.createElement("button"); now.type = "button"; now.textContent = t.clearNow;
      now.addEventListener("click", function () { reset(); what.focus(); });
      clr.appendChild(note); clr.appendChild(bar); clr.appendChild(now);
      out.textContent = ""; out.appendChild(dl); out.appendChild(p); out.appendChild(clr); out.hidden = false;
      what.value = ""; updateCount();
      filing = false; send.disabled = false; send.textContent = t.file;
      /* On phones, close the keyboard so the reply is visible. */
      if (touch) { what.blur(); out.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "nearest" }); }
      updateIdle(); startTimer();
    }, smooth ? 600 : 0);
  });

  /* Any activity in the form restarts the 30 seconds. Reading the receipt with the mouse over it pauses them. */
  ["input", "keydown", "change", "pointerdown", "focusin"].forEach(function (ev) {
    form.addEventListener(ev, function () { if (!out.hidden) startTimer(); });
  });
  out.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") { hovering = true; pauseTimer(); } });
  out.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") { hovering = false; startTimer(); } });
  /* Don't clear while the visitor is in another tab. */
  document.addEventListener("visibilitychange", function () { if (document.hidden) pauseTimer(); else startTimer(); });

  what.addEventListener("input", function () { if (what.value.trim()) hint.textContent = ""; updateCount(); updateIdle(); });
  what.addEventListener("keydown", function (e) { if (e.key === "Escape") { what.value = ""; hint.textContent = ""; updateCount(); } });
  what.addEventListener("focus", updateIdle);
  what.addEventListener("blur", updateIdle);
  updateIdle();
})();
