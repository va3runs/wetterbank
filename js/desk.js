/* Wetterbank® complaint form. Runs entirely in the browser: nothing is sent or stored.
   The page language (<html lang>) picks the text below. */
(function () {
  "use strict";
  /* How a reply is put together:
     1. An opener about what was actually filed: a keyword in the text if one matches, otherwise the category.
     2. On the first complaint, sometimes a remark about the tram line or the time of day.
     3. From the second complaint on, a nudge towards the person next to you. Not "what is your name?",
        but something you could actually say to them. Every few complaints the nudge gets a little bolder. */
  var TEXT = {
    en: {
      empty: "Please describe the incident first. Even “wet” counts.",
      filing: "Filing…",
      file: "File complaint",
      caseNo: "Case", category: "Category", waiting: "Waiting for", status: "Status",
      forwarded: "Forwarded to the weather",
      forwardedNext: "Forwarded to the person next to you",
      clears: "Clears in 30 seconds",
      clearNow: "Clear now",
      byCategory: [
        [ /* Rain */
          "Your rain complaint has been filed under “Wet, again”. Processing will begin once it stops.",
          "Rain has been informed. Rain says it was only drizzle.",
          "Your complaint has been forwarded to the responsible cloud. The cloud is on holiday."
        ],
        [ /* Wind */
          "Your complaint has been forwarded to the wind. It did not stay to read it.",
          "Wind complaints are processed from east to west. Please hold on to your hat.",
          "The wind has been asked to reconsider. It has already moved on."
        ],
        [ /* Cold */
          "Cold noted. Our heating budget for outdoor benches is 0 euros.",
          "Your complaint has been registered at 4 °C. Please keep your hands in your pockets while you wait.",
          "The cold has been informed. It says it is only passing through."
        ],
        [ /* Feels colder than measured */
          "Measured: 6 °C. Felt: considerably worse. Both values have been entered.",
          "The thermometer disagrees with you. The bench agrees with you. The thermometer has been outvoted.",
          "Your perception has been recorded as the official temperature. Valid for this bench only."
        ],
        [ /* Too hot */
          "Your complaint has been sent to the sun. Expect a reply in about 8 minutes, at the speed of light.",
          "The bench is also too hot. We are sitting this one out together.",
          "Heat complaint received. Shade has been requested. Shade is in short supply."
        ],
        [ /* Grey */
          "Grey has been recorded as a colour, a mood and a forecast.",
          "Your complaint about grey has been filed in the grey folder. We do not have another one.",
          "The sky has been asked to commit to a weather. It is still thinking."
        ],
        [ /* Other */
          "Your complaint does not fit any category. The weather is impressed.",
          "Filed under “Other”. So is most of the weather in this country.",
          "The weather has read your complaint and declines to comment."
        ]
      ],
      keywords: {
        umbrella: "Umbrella complaints are a special case. Please check whether the umbrella is the problem or the solution.",
        monday: "Monday has been named as a contributing factor.",
        socks: "Wet socks are classified as a personal emergency. Our condolences.",
        hair: "Your hair has been listed as a victim of the weather.",
        snow: "Snow in Düsseldorf is a rumour. Your complaint has been forwarded to the rumours department.",
        again: "“Again” has been noted. Recurring weather is managed as a subscription.",
        tram: "Your complaint mentions the tram. The weather says that is not its department, and for once it is right.",
        sun: "Mentioning the sun in a complaint is brave. It has been noted.",
        coffee: "Your coffee has been registered as emergency heating.",
        hello: "Hello. This is a complaint form, but: hello."
      },
      line: [
        "Line {line} has been copied in. Line {line} has not replied.",
        "Everyone waiting for the {line} is now in the same situation as you. Some of them are on this bench."
      ],
      neverCame: "Trams that never came are handled by a different department. It has not arrived either.",
      time: {
        night: "It is late. The weather is off duty. The bench is not.",
        morning: "Morning complaints are processed before the first coffee. Please be patient.",
        weekend: "Weekend weather falls outside office hours. We filed it anyway."
      },
      nudges: [
        "Names are optional here. Opinions on the weather are not. Ask the person next to you for theirs.",
        "The person next to you is waiting for the same tram. That is already something in common.",
        "Statistically, one person at this stop has an umbrella. It may not be you.",
        "Ask the person next to you where they are going. It is quicker than asking the weather.",
        "Your complaint has been noted. The person next to you looks like they have one too.",
        "Two complaints about the same weather count as a conversation.",
        "Ask the person next to you what the weather was like where they grew up. Afterwards you will know more than a name.",
        "The bench can only forward complaints. The person next to you can reply.",
        "If you both sigh at the next delay, it counts as small talk.",
        "Tip: “Is this one yours?” works for trams, umbrellas and conversations.",
        "The bench recommends one question to the person next to you. Any question. Except the weather.",
        "You have now complained more than the person next to you. They may want to catch up.",
        "Introductions are processed faster in person.",
        "Someone at this stop has been waiting longer than you. They know things about this stop.",
        "You are number 212 in the queue. Number 211 is sitting next to you."
      ],
      escalate: {
        3: "This is your third complaint. The bench suggests a second opinion. It is sitting next to you.",
        5: "Five complaints. The person next to you has heard every one. Ask what they would add.",
        8: "You are now the bench’s most loyal customer. It would like you to meet its second most loyal one, sitting next to you."
      }
    },
    de: {
      empty: "Bitte schildern Sie zuerst den Vorfall. Auch „nass“ zählt.",
      filing: "Wird eingereicht…",
      file: "Beschwerde einreichen",
      caseNo: "Vorgang", category: "Kategorie", waiting: "Warten auf", status: "Status",
      forwarded: "An das Wetter weitergeleitet",
      forwardedNext: "An die Person neben Ihnen weitergeleitet",
      clears: "Leert sich in 30 Sekunden",
      clearNow: "Jetzt leeren",
      byCategory: [
        [ /* Regen */
          "Ihre Regenbeschwerde wurde unter „Schon wieder nass“ abgelegt. Die Bearbeitung beginnt, sobald es aufhört.",
          "Der Regen wurde informiert. Der Regen sagt, es war nur Niesel.",
          "Ihre Beschwerde wurde an die zuständige Wolke weitergeleitet. Die Wolke ist im Urlaub."
        ],
        [ /* Wind */
          "Ihre Beschwerde wurde an den Wind weitergeleitet. Er ist nicht geblieben, um sie zu lesen.",
          "Windbeschwerden werden von Ost nach West bearbeitet. Bitte halten Sie Ihren Hut fest.",
          "Der Wind wurde gebeten, es sich noch einmal zu überlegen. Er ist schon weitergezogen."
        ],
        [ /* Kälte */
          "Kälte vermerkt. Unser Heizbudget für Bänke im Freien beträgt 0 Euro.",
          "Ihre Beschwerde wurde bei 4 °C registriert. Bitte lassen Sie die Hände in den Taschen, während Sie warten.",
          "Die Kälte wurde informiert. Sie sagt, sie sei nur auf der Durchreise."
        ],
        [ /* Gefühlt kälter */
          "Gemessen: 6 °C. Gefühlt: deutlich schlimmer. Beide Werte wurden eingetragen.",
          "Das Thermometer ist anderer Meinung. Die Bank ist Ihrer Meinung. Das Thermometer wurde überstimmt.",
          "Ihr Empfinden wurde als offizielle Temperatur erfasst. Gilt nur für diese Bank."
        ],
        [ /* Zu heiß */
          "Ihre Beschwerde wurde an die Sonne geschickt. Antwort in etwa 8 Minuten, mit Lichtgeschwindigkeit.",
          "Der Bank ist auch zu heiß. Wir sitzen das gemeinsam aus.",
          "Hitzebeschwerde erhalten. Schatten wurde beantragt. Schatten ist knapp."
        ],
        [ /* Grau */
          "Grau wurde als Farbe, Stimmung und Wettervorhersage erfasst.",
          "Ihre Beschwerde über Grau wurde im grauen Ordner abgelegt. Einen anderen haben wir nicht.",
          "Der Himmel wurde gebeten, sich für ein Wetter zu entscheiden. Er denkt noch nach."
        ],
        [ /* Sonstiges */
          "Ihre Beschwerde passt in keine Kategorie. Das Wetter ist beeindruckt.",
          "Abgelegt unter „Sonstiges“. Wie das meiste Wetter hierzulande.",
          "Das Wetter hat Ihre Beschwerde gelesen und möchte sich dazu nicht äußern."
        ]
      ],
      keywords: {
        umbrella: "Schirmbeschwerden sind ein Sonderfall. Bitte prüfen Sie, ob der Schirm das Problem ist oder die Lösung.",
        monday: "Der Montag wurde als Mitverursacher eingetragen.",
        socks: "Nasse Socken gelten als persönlicher Notfall. Unser Beileid.",
        hair: "Ihre Frisur wurde als Opfer des Wetters erfasst.",
        snow: "Schnee in Düsseldorf ist ein Gerücht. Ihre Beschwerde ging an die Gerüchteabteilung.",
        again: "„Schon wieder“ wurde vermerkt. Wiederkehrendes Wetter wird als Abo geführt.",
        tram: "Ihre Beschwerde erwähnt die Bahn. Das Wetter sagt, dafür sei es nicht zuständig, und ausnahmsweise hat es recht.",
        sun: "Die Sonne in einer Beschwerde zu erwähnen, ist mutig. Wurde vermerkt.",
        coffee: "Ihr Kaffee wurde als Notheizung eingetragen.",
        hello: "Hallo. Das hier ist ein Beschwerdeformular, aber: hallo."
      },
      line: [
        "Linie {line} wurde in Kopie gesetzt. Linie {line} hat nicht geantwortet.",
        "Alle, die auf die {line} warten, sind jetzt in derselben Lage wie Sie. Einige davon sitzen auf dieser Bank."
      ],
      neverCame: "Für Bahnen, die nie kamen, ist eine andere Abteilung zuständig. Sie ist auch noch nicht da.",
      time: {
        night: "Es ist spät. Das Wetter hat Feierabend. Die Bank nicht.",
        morning: "Beschwerden am Morgen werden vor dem ersten Kaffee bearbeitet. Bitte haben Sie Geduld.",
        weekend: "Wetter am Wochenende liegt außerhalb der Dienstzeiten. Wir haben es trotzdem abgelegt."
      },
      nudges: [
        "Namen sind hier freiwillig. Eine Meinung zum Wetter nicht. Fragen Sie die Person neben Ihnen nach ihrer.",
        "Die Person neben Ihnen wartet auf dieselbe Bahn. Das ist schon eine Gemeinsamkeit.",
        "Statistisch hat eine Person an dieser Haltestelle einen Schirm. Vielleicht nicht Sie.",
        "Fragen Sie die Person neben Ihnen, wohin sie fährt. Das geht schneller, als das Wetter zu fragen.",
        "Ihre Beschwerde wurde vermerkt. Die Person neben Ihnen sieht aus, als hätte sie auch eine.",
        "Zwei Beschwerden über dasselbe Wetter gelten als Gespräch.",
        "Fragen Sie die Person neben Ihnen, wie das Wetter dort war, wo sie aufgewachsen ist. Danach wissen Sie mehr als einen Namen.",
        "Die Bank kann Beschwerden nur weiterleiten. Die Person neben Ihnen kann antworten.",
        "Wenn Sie beide bei der nächsten Verspätung seufzen, zählt das als Small Talk.",
        "Tipp: „Ist das Ihre?“ funktioniert bei Bahnen, Schirmen und Gesprächen.",
        "Die Bank empfiehlt eine Frage an die Person neben Ihnen. Irgendeine. Nur nicht übers Wetter.",
        "Sie haben sich jetzt öfter beschwert als die Person neben Ihnen. Vielleicht möchte sie aufholen.",
        "Vorstellungen werden persönlich schneller bearbeitet.",
        "Jemand an dieser Haltestelle wartet schon länger als Sie. Diese Person weiß Dinge über diese Haltestelle.",
        "Sie sind Nummer 212 in der Warteschlange. Nummer 211 sitzt neben Ihnen."
      ],
      escalate: {
        3: "Das ist Ihre dritte Beschwerde. Die Bank empfiehlt eine zweite Meinung. Sie sitzt neben Ihnen.",
        5: "Fünf Beschwerden. Die Person neben Ihnen hat jede gehört. Fragen Sie doch, was sie ergänzen würde.",
        8: "Sie sind jetzt die treueste Kundschaft der Bank. Die Bank möchte Ihnen die zweittreueste vorstellen. Sie sitzt neben Ihnen."
      }
    }
  };
  var t = TEXT[(document.documentElement.lang || "en").slice(0, 2)] || TEXT.en;

  /* Keywords are matched in both languages, whichever page you are on. */
  var KEYS = [
    ["umbrella", /umbrella|brolly|schirm/i],
    ["socks", /sock|shoe|feet|soggy|socke|\bschuhe?\b|füße|fuesse/i],
    ["hair", /\bhair|haare|frisur/i],
    ["snow", /snow|schnee/i],
    ["coffee", /coffee|kaffee/i],
    ["monday", /monday|montag/i],
    ["tram", /\btram|delay|\blate\b|bahn|verspät|zu spät|rheinbahn/i],
    ["again", /\bagain\b|\balways\b|every (day|time)|schon wieder|\bimmer\b|jeden tag|jedes mal/i],
    ["sun", /\bsun(ny|shine)?\b|\bsonne\b|sonnig/i],
    ["hello", /^\s*(hi|hello|hey|hallo|moin|servus)\b/i]
  ];

  /* Draw from a pool without repeating until it is used up. */
  function Deck(items) { this.items = items; this.left = []; }
  Deck.prototype.draw = function () {
    if (!this.left.length) {
      this.left = this.items.slice();
      for (var k = this.left.length - 1; k > 0; k--) { var j = Math.floor(Math.random() * (k + 1)), x = this.left[k]; this.left[k] = this.left[j]; this.left[j] = x; }
    }
    return this.left.pop();
  };
  var catDecks = t.byCategory.map(function (p) { return new Deck(p); });
  var nudgeDeck = new Deck(t.nudges), lineDeck = new Deck(t.line);
  var usedKeys = {}, filed = 0;

  function timeRemark() {
    var d = new Date(), h = d.getHours(), wd = d.getDay();
    if (h >= 22 || h < 5) return t.time.night;
    if (wd === 0 || wd === 6) return t.time.weekend;
    if (h < 10) return t.time.morning;
    return "";
  }

  function compose(text, catIndex, lineIndex, lineName, lastLine) {
    filed++;
    var opener = "";
    for (var k = 0; k < KEYS.length; k++) {
      if (!usedKeys[KEYS[k][0]] && KEYS[k][1].test(text)) { opener = t.keywords[KEYS[k][0]]; usedKeys[KEYS[k][0]] = true; break; }
    }
    if (!opener) opener = catDecks[catIndex] ? catDecks[catIndex].draw() : catDecks[6].draw();
    var extra = "";
    if (t.escalate[filed]) extra = t.escalate[filed];
    else if (filed > 8 && filed % 4 === 0) extra = t.escalate[8];
    else if (filed >= 2) extra = nudgeDeck.draw();
    /* First complaint: stay with the situation (line, time of day), and only sometimes look sideways. */
    else if (lineIndex === lastLine) extra = t.neverCame;
    else if (lineIndex > 0 && Math.random() < 0.7) extra = lineDeck.draw().split("{line}").join(lineName);
    else extra = timeRemark() || (Math.random() < 0.5 ? t.nudges[1 + Math.floor(Math.random() * 2)] : "");
    return extra ? opener + " " + extra : opener;
  }

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
      var reply = compose(what.value, cat.selectedIndex, line.selectedIndex, line.value, line.options.length - 1);
      row(dl, t.status, filed >= 3 && filed % 3 === 0 ? t.forwardedNext : t.forwarded);
      var p = document.createElement("p"); p.textContent = reply;
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
