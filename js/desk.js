/* Wetterbank® complaint form. Runs entirely in the browser: nothing is sent or stored.
   The page language (<html lang>) picks the text below.

   How a reply is put together:
   1. An opener about what was actually filed: a keyword in the text if one matches, otherwise the category.
   2. On the first complaint, a remark about the tram line or the time of day.
   3. From the second complaint on, a nudge towards the person next to you. Not "what is your name?",
      but something you could actually say to them. Every few complaints the nudge gets a little bolder.
   A "|" splits a reply into separate messages. The bench types them one after another, like a chat. */
(function () {
  "use strict";
  var TEXT = {
    en: {
      empty: "Please describe the incident first. Even “wet” counts.",
      filing: "Filing…",
      file: "File complaint",
      caseNo: "Case", category: "Category", waiting: "Waiting for", status: "Status",
      forwarded: "Forwarded to the weather",
      forwardedNext: "Forwarded to the person next to you",
      typing: "The bench is typing",
      clears: "Clears in 30 seconds",
      clearNow: "Clear now",
      byCategory: [
        [ /* Rain */
          "Your rain complaint has been filed under “Wet, again”.|Processing begins once it stops. It will not stop.",
          "Rain has been informed.|Rain says it was only drizzle.|Rain says that every time.",
          "Your complaint has been forwarded to the responsible cloud.|The cloud is on holiday. In Mallorca. Where it is sunny.",
          "We have checked. It is indeed raining.|Thank you for this report.",
          "Complaint accepted.|Your umbrella has been reminded that it has one job."
        ],
        [ /* Wind */
          "Your complaint has been forwarded to the wind.|It did not stay to read it.",
          "Wind complaints are processed from west to east.|Please hold on to your hat. And your form.",
          "The wind has been asked to reconsider.|It has already left for Duisburg.",
          "Your hair has filed a separate complaint.|It will be processed together with yours.",
          "Gusts of up to 60 km/h have been confirmed.|Your umbrella has been reclassified as modern art."
        ],
        [ /* Cold */
          "Cold noted.|Our heating budget for outdoor benches is 0 euros. It has been spent.",
          "Your complaint has been registered at 4 °C.|Please keep your hands in your pockets while you wait. Your own pockets.",
          "The cold has been informed.|It says it is only passing through.|It said that in October.",
          "We recommend thinking warm thoughts.|This recommendation is not legally binding.",
          "Cold complaint received.|Please note: the bench is also cold. It is made of metal and did not choose this."
        ],
        [ /* Feels colder than measured */
          "Measured: 6 °C.|Felt: considerably worse.|Both values have been entered. The measured one is being ignored.",
          "The thermometer disagrees with you.|The bench agrees with you.|The thermometer has been outvoted, 2 to 1.",
          "Your perception has been recorded as the official temperature.|Valid for this bench only.",
          "Wind chill has been added to your file.|So has the draught from the tram doors."
        ],
        [ /* Too hot */
          "Your complaint has been sent to the sun.|Expect a reply in about 8 minutes, at the speed of light.",
          "The bench is also too hot.|We are sitting this one out together. Literally.",
          "Heat complaint received.|Shade has been requested.|Shade is booked until September.",
          "Please do not complain about the heat in front of people who complained about the cold in March.|They remember."
        ],
        [ /* Grey */
          "Grey has been recorded as a colour, a mood and a forecast.",
          "Your complaint about grey has been filed in the grey folder.|We do not have another one.",
          "The sky has been asked to commit to a weather.|It is still thinking.|It has been thinking since November.",
          "Grey is the official colour of Düsseldorf from October to April.|Your complaint has been forwarded to the colour department."
        ],
        [ /* Other */
          "Your complaint does not fit any category.|The weather is impressed.",
          "Filed under “Other”.|So is most of the weather in this country.",
          "The weather has read your complaint|and declines to comment.",
          "We have no form for this.|We have forwarded it anyway, on form 38b. Form 38b is for everything."
        ]
      ],
      keywords: {
        wet: "“Wet” has been accepted as a full description.|We appreciate your brevity.",
        hello: "Hello.|This is a complaint form.|But: hello.",
        why: "You asked why.|Nobody here knows why. That is what makes it weather.",
        koeln: "You mentioned Cologne.|The weather in Cologne is worse. We checked. We always check.",
        umbrella: "Umbrella complaints are a special case.|Please check whether the umbrella is the problem or the solution.",
        socks: "Wet socks are classified as a personal emergency.|Our condolences. To the socks.",
        hair: "Your hair has been listed as a victim of the weather.|It is receiving support.",
        snow: "Snow in Düsseldorf is a rumour.|Your complaint has been forwarded to the rumours department.",
        coffee: "Your coffee has been registered as emergency heating.|Please do not spill the heating.",
        monday: "Monday has been named as a contributing factor.|Monday declines to comment.",
        tram: "Your complaint mentions the tram.|The weather says that is not its department.|For once, it is right.",
        again: "“Again” has been noted.|Recurring weather is managed as a subscription. It cannot be cancelled.",
        sun: "You mentioned the sun in a complaint.|Bold. Noted."
      },
      line: [
        "Line {line} has been copied in.|Line {line} has not replied.|Line {line} has not arrived either.",
        "Everyone waiting for the {line} is now in the same situation as you.|Some of them are on this bench.",
        "The {line} is on its way.|According to a display that has been saying so for a while."
      ],
      neverCame: "Trams that never came are handled by a different department.|That department has not arrived either.",
      time: {
        night: "It is late.|The weather is off duty. The bench is not.",
        morning: "Complaints before 10 am are processed before the first coffee.|Please adjust your expectations.",
        weekend: "Weekend weather falls outside office hours.|We filed it anyway. We are like that."
      },
      nudges: [
        "Names are optional here.|Opinions on the weather are not. Ask the person next to you for theirs.",
        "The person next to you is waiting for the same tram.|That is already more in common than most first dates.",
        "Statistically, one person at this stop has an umbrella.|It is not you.",
        "Ask the person next to you where they are going.|It is quicker than asking the weather.",
        "The person next to you looks like they have a complaint too.|Complaints filed in pairs are processed faster. We just decided that.",
        "Two complaints about the same weather|count as a conversation.",
        "Ask the person next to you what the weather was like where they grew up.|Afterwards you will know more than a name.",
        "The bench can only forward complaints.|The person next to you can reply.",
        "If you both sigh at the next delay,|it counts as small talk.",
        "Tip: “Is this one yours?”|works for trams, umbrellas and conversations.",
        "The bench recommends one question to the person next to you.|Any question. Except the weather. The weather is taken.",
        "You have now complained more than the person next to you.|They may want to catch up.",
        "Introductions are processed faster in person.",
        "Someone at this stop has been waiting longer than you.|They know things.",
        "You are number 212 in the queue.|Number 211 is sitting next to you.",
        "Nobody at this stop has said a word for 11 minutes.|The bench is not counting.|The bench is counting.",
        "The bench has noticed you are both looking at your phones.|The phones are not talking to each other either."
      ],
      escalate: {
        3: "This is your third complaint.|The bench suggests a second opinion.|It is sitting next to you.",
        5: "Five complaints.|The person next to you has heard every one.|Ask what they would add. They have had time to think.",
        8: "You are now the bench’s most loyal customer.|It would like you to meet its second most loyal one.|They are sitting next to you.",
        12: "Twelve complaints. The bench has run out of folders.|Please continue this conversation with a human."
      },
      signoffs: [
        "Have a nice weather.",
        "This message was sent from a bench.",
        "Wetterbank®. We forward, you wait.",
        "Please do not reply to this bench."
      ]
    },
    de: {
      empty: "Bitte schildern Sie zuerst den Vorfall. Auch „nass“ zählt.",
      filing: "Wird eingereicht…",
      file: "Beschwerde einreichen",
      caseNo: "Vorgang", category: "Kategorie", waiting: "Warten auf", status: "Status",
      forwarded: "An das Wetter weitergeleitet",
      forwardedNext: "An die Person neben Ihnen weitergeleitet",
      typing: "Die Bank schreibt",
      clears: "Leert sich in 30 Sekunden",
      clearNow: "Jetzt leeren",
      byCategory: [
        [ /* Regen */
          "Ihre Regenbeschwerde wurde unter „Schon wieder nass“ abgelegt.|Die Bearbeitung beginnt, sobald es aufhört. Es hört nicht auf.",
          "Der Regen wurde informiert.|Der Regen sagt, es war nur Niesel.|Das sagt er jedes Mal.",
          "Ihre Beschwerde wurde an die zuständige Wolke weitergeleitet.|Die Wolke ist im Urlaub. Auf Mallorca. Dort ist es sonnig.",
          "Wir haben nachgesehen. Es regnet tatsächlich.|Vielen Dank für diese Meldung.",
          "Beschwerde angenommen.|Ihr Schirm wurde daran erinnert, dass er nur eine Aufgabe hat."
        ],
        [ /* Wind */
          "Ihre Beschwerde wurde an den Wind weitergeleitet.|Er ist nicht geblieben, um sie zu lesen.",
          "Windbeschwerden werden von West nach Ost bearbeitet.|Bitte halten Sie Ihren Hut fest. Und Ihr Formular.",
          "Der Wind wurde gebeten, es sich noch einmal zu überlegen.|Er ist schon auf dem Weg nach Duisburg.",
          "Ihre Frisur hat eine eigene Beschwerde eingereicht.|Sie wird gemeinsam mit Ihrer bearbeitet.",
          "Böen bis 60 km/h wurden bestätigt.|Ihr Schirm wurde als moderne Kunst neu eingestuft."
        ],
        [ /* Kälte */
          "Kälte vermerkt.|Unser Heizbudget für Bänke im Freien beträgt 0 Euro. Es ist aufgebraucht.",
          "Ihre Beschwerde wurde bei 4 °C registriert.|Bitte lassen Sie die Hände in den Taschen, während Sie warten. In Ihren eigenen.",
          "Die Kälte wurde informiert.|Sie sagt, sie sei nur auf der Durchreise.|Das hat sie im Oktober auch gesagt.",
          "Wir empfehlen warme Gedanken.|Diese Empfehlung ist rechtlich nicht bindend.",
          "Kältebeschwerde erhalten.|Bitte beachten Sie: Der Bank ist auch kalt. Sie ist aus Metall und hat sich das nicht ausgesucht."
        ],
        [ /* Gefühlt kälter */
          "Gemessen: 6 °C.|Gefühlt: deutlich schlimmer.|Beide Werte wurden eingetragen. Der gemessene wird ignoriert.",
          "Das Thermometer ist anderer Meinung.|Die Bank ist Ihrer Meinung.|Das Thermometer wurde 2 zu 1 überstimmt.",
          "Ihr Empfinden wurde als offizielle Temperatur erfasst.|Gilt nur für diese Bank.",
          "Der Windchill wurde Ihrer Akte hinzugefügt.|Der Zug aus den Bahntüren auch."
        ],
        [ /* Zu heiß */
          "Ihre Beschwerde wurde an die Sonne geschickt.|Antwort in etwa 8 Minuten, mit Lichtgeschwindigkeit.",
          "Der Bank ist auch zu heiß.|Wir sitzen das gemeinsam aus. Wörtlich.",
          "Hitzebeschwerde erhalten.|Schatten wurde beantragt.|Schatten ist bis September ausgebucht.",
          "Bitte beschweren Sie sich nicht über Hitze vor Menschen, die sich im März über Kälte beschwert haben.|Die erinnern sich."
        ],
        [ /* Grau */
          "Grau wurde als Farbe, Stimmung und Wettervorhersage erfasst.",
          "Ihre Beschwerde über Grau wurde im grauen Ordner abgelegt.|Einen anderen haben wir nicht.",
          "Der Himmel wurde gebeten, sich für ein Wetter zu entscheiden.|Er denkt noch nach.|Er denkt seit November nach.",
          "Grau ist von Oktober bis April die offizielle Farbe Düsseldorfs.|Ihre Beschwerde ging an das Farbamt."
        ],
        [ /* Sonstiges */
          "Ihre Beschwerde passt in keine Kategorie.|Das Wetter ist beeindruckt.",
          "Abgelegt unter „Sonstiges“.|Wie das meiste Wetter hierzulande.",
          "Das Wetter hat Ihre Beschwerde gelesen|und möchte sich dazu nicht äußern.",
          "Für so etwas haben wir kein Formular.|Wir haben es trotzdem weitergeleitet, auf Formular 38b. Formular 38b ist für alles."
        ]
      ],
      keywords: {
        wet: "„Nass“ wurde als vollständige Beschreibung akzeptiert.|Wir schätzen Ihre Kürze.",
        hello: "Hallo.|Das hier ist ein Beschwerdeformular.|Aber: hallo.",
        why: "Sie haben nach dem Warum gefragt.|Das weiß hier niemand. Deshalb heißt es Wetter.",
        koeln: "Sie haben Köln erwähnt.|In Köln ist das Wetter schlechter. Wir haben nachgesehen. Wir sehen immer nach.",
        umbrella: "Schirmbeschwerden sind ein Sonderfall.|Bitte prüfen Sie, ob der Schirm das Problem ist oder die Lösung.",
        socks: "Nasse Socken gelten als persönlicher Notfall.|Unser Beileid. An die Socken.",
        hair: "Ihre Frisur wurde als Opfer des Wetters erfasst.|Sie wird betreut.",
        snow: "Schnee in Düsseldorf ist ein Gerücht.|Ihre Beschwerde ging an die Gerüchteabteilung.",
        coffee: "Ihr Kaffee wurde als Notheizung eingetragen.|Bitte verschütten Sie die Heizung nicht.",
        monday: "Der Montag wurde als Mitverursacher eingetragen.|Der Montag möchte sich nicht äußern.",
        tram: "Ihre Beschwerde erwähnt die Bahn.|Das Wetter sagt, dafür sei es nicht zuständig.|Ausnahmsweise hat es recht.",
        again: "„Schon wieder“ wurde vermerkt.|Wiederkehrendes Wetter wird als Abo geführt. Eine Kündigung ist nicht möglich.",
        sun: "Sie haben in einer Beschwerde die Sonne erwähnt.|Mutig. Vermerkt."
      },
      line: [
        "Linie {line} wurde in Kopie gesetzt.|Linie {line} hat nicht geantwortet.|Linie {line} ist auch noch nicht da.",
        "Alle, die auf die {line} warten, sind jetzt in derselben Lage wie Sie.|Einige davon sitzen auf dieser Bank.",
        "Die {line} ist unterwegs.|Sagt eine Anzeige, die das schon eine Weile sagt."
      ],
      neverCame: "Für Bahnen, die nie kamen, ist eine andere Abteilung zuständig.|Die ist auch noch nicht da.",
      time: {
        night: "Es ist spät.|Das Wetter hat Feierabend. Die Bank nicht.",
        morning: "Beschwerden vor 10 Uhr werden vor dem ersten Kaffee bearbeitet.|Bitte passen Sie Ihre Erwartungen an.",
        weekend: "Wetter am Wochenende liegt außerhalb der Dienstzeiten.|Wir haben es trotzdem abgelegt. So sind wir."
      },
      nudges: [
        "Namen sind hier freiwillig.|Eine Meinung zum Wetter nicht. Fragen Sie die Person neben Ihnen nach ihrer.",
        "Die Person neben Ihnen wartet auf dieselbe Bahn.|Das ist schon mehr Gemeinsamkeit als bei den meisten ersten Dates.",
        "Statistisch hat eine Person an dieser Haltestelle einen Schirm.|Sie sind es nicht.",
        "Fragen Sie die Person neben Ihnen, wohin sie fährt.|Das geht schneller, als das Wetter zu fragen.",
        "Die Person neben Ihnen sieht aus, als hätte sie auch eine Beschwerde.|Beschwerden zu zweit werden schneller bearbeitet. Das haben wir gerade beschlossen.",
        "Zwei Beschwerden über dasselbe Wetter|gelten als Gespräch.",
        "Fragen Sie die Person neben Ihnen, wie das Wetter dort war, wo sie aufgewachsen ist.|Danach wissen Sie mehr als einen Namen.",
        "Die Bank kann Beschwerden nur weiterleiten.|Die Person neben Ihnen kann antworten.",
        "Wenn Sie beide bei der nächsten Verspätung seufzen,|zählt das als Small Talk.",
        "Tipp: „Ist das Ihre?“|funktioniert bei Bahnen, Schirmen und Gesprächen.",
        "Die Bank empfiehlt eine Frage an die Person neben Ihnen.|Irgendeine. Nur nicht übers Wetter. Das Wetter ist schon vergeben.",
        "Sie haben sich jetzt öfter beschwert als die Person neben Ihnen.|Vielleicht möchte sie aufholen.",
        "Vorstellungen werden persönlich schneller bearbeitet.",
        "Jemand an dieser Haltestelle wartet schon länger als Sie.|Diese Person weiß Dinge.",
        "Sie sind Nummer 212 in der Warteschlange.|Nummer 211 sitzt neben Ihnen.",
        "An dieser Haltestelle hat seit 11 Minuten niemand ein Wort gesagt.|Die Bank zählt nicht mit.|Die Bank zählt mit.",
        "Die Bank hat bemerkt, dass Sie beide aufs Handy schauen.|Die Handys reden auch nicht miteinander."
      ],
      escalate: {
        3: "Das ist Ihre dritte Beschwerde.|Die Bank empfiehlt eine zweite Meinung.|Sie sitzt neben Ihnen.",
        5: "Fünf Beschwerden.|Die Person neben Ihnen hat jede gehört.|Fragen Sie, was sie ergänzen würde. Sie hatte Zeit zum Nachdenken.",
        8: "Sie sind jetzt die treueste Kundschaft der Bank.|Die Bank möchte Ihnen die zweittreueste vorstellen.|Sie sitzt neben Ihnen.",
        12: "Zwölf Beschwerden. Der Bank sind die Ordner ausgegangen.|Bitte führen Sie dieses Gespräch mit einem Menschen fort."
      },
      signoffs: [
        "Schönes Wetter noch.",
        "Diese Nachricht wurde von einer Bank gesendet.",
        "Wetterbank®. Wir leiten weiter, Sie warten.",
        "Bitte antworten Sie nicht auf diese Bank."
      ]
    }
  };
  var t = TEXT[(document.documentElement.lang || "en").slice(0, 2)] || TEXT.en;

  /* Keywords are matched in both languages, whichever page you are on. First match wins. */
  var KEYS = [
    ["wet", /^\s*(wet|nass)\W*$/i],
    ["hello", /^\s*(hi|hello|hey|hallo|moin|servus)\b/i],
    ["why", /\bwhy\b|\bwarum\b|\bwieso\b|\bweshalb\b/i],
    ["koeln", /k(ö|oe)ln|cologne/i],
    ["umbrella", /umbrella|brolly|schirm/i],
    ["socks", /sock|shoe|feet|soggy|socke|\bschuhe?\b|füße|fuesse/i],
    ["hair", /\bhair|haare|frisur/i],
    ["snow", /snow|schnee/i],
    ["coffee", /coffee|kaffee/i],
    ["monday", /monday|montag/i],
    ["tram", /\btram|delay|\blate\b|bahn|verspät|zu spät|rheinbahn/i],
    ["again", /\bagain\b|\balways\b|every (day|time)|schon wieder|\bimmer\b|jeden tag|jedes mal/i],
    ["sun", /\bsun(ny|shine)?\b|\bsonne\b|sonnig/i]
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
  var nudgeDeck = new Deck(t.nudges), lineDeck = new Deck(t.line), signDeck = new Deck(t.signoffs);
  var usedKeys = {}, filed = 0;

  function timeRemark() {
    var d = new Date(), h = d.getHours(), wd = d.getDay();
    if (h >= 22 || h < 5) return t.time.night;
    if (wd === 0 || wd === 6) return t.time.weekend;
    if (h < 10) return t.time.morning;
    return "";
  }

  /* Returns the reply as a list of short messages. */
  function compose(text, catIndex, lineIndex, lineName, lastLine) {
    filed++;
    var opener = "";
    for (var k = 0; k < KEYS.length; k++) {
      if (!usedKeys[KEYS[k][0]] && KEYS[k][1].test(text)) { opener = t.keywords[KEYS[k][0]]; usedKeys[KEYS[k][0]] = true; break; }
    }
    if (!opener) opener = (catDecks[catIndex] || catDecks[catDecks.length - 1]).draw();
    var extra = "";
    if (t.escalate[filed]) extra = t.escalate[filed];
    else if (filed > 12 && filed % 4 === 0) extra = t.escalate[12];
    else if (filed >= 2) extra = nudgeDeck.draw();
    /* First complaint: stay with the situation (line, time of day), and only sometimes look sideways. */
    else if (lineIndex === lastLine) extra = t.neverCame;
    else if (lineIndex > 0 && Math.random() < 0.7) extra = lineDeck.draw().split("{line}").join(lineName);
    else extra = timeRemark() || (Math.random() < 0.5 ? t.nudges[1 + Math.floor(Math.random() * 2)] : "");
    var parts = opener.split("|");
    if (extra) parts = parts.concat(extra.split("|"));
    if (parts.length <= 2 && Math.random() < 0.4) parts.push(signDeck.draw());
    return parts;
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
  var CLEAR_AFTER = 30000, timer = null, hovering = false, filing = false, seq = 0, typing = false;

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
    if (out.hidden || typing || hovering || document.hidden) return;
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
    clearTimeout(timer); seq++; typing = false;
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

  function clearRow() {
    var clr = document.createElement("div"); clr.className = "clear";
    var note = document.createElement("span"); note.textContent = t.clears;
    var bar = document.createElement("span"); bar.className = "bar"; bar.setAttribute("aria-hidden", "true"); bar.appendChild(document.createElement("span"));
    var now = document.createElement("button"); now.type = "button"; now.textContent = t.clearNow;
    now.addEventListener("click", function () { reset(); what.focus(); });
    clr.appendChild(note); clr.appendChild(bar); clr.appendChild(now);
    return clr;
  }

  /* The bench "types" each message, then sends it. With reduced motion, everything appears at once. */
  function speak(chat, parts, done) {
    var my = seq;
    if (!smooth) {
      parts.forEach(function (m) { var p = document.createElement("p"); p.className = "say"; p.textContent = m; chat.appendChild(p); });
      done(); return;
    }
    var n = 0;
    (function next() {
      if (my !== seq) return;
      if (n >= parts.length) { done(); return; }
      var dots = document.createElement("p"); dots.className = "say dots"; dots.setAttribute("aria-hidden", "true");
      dots.title = t.typing;
      dots.innerHTML = "<i></i><i></i><i></i>";
      chat.appendChild(dots);
      var wait = Math.min(1300, 450 + parts[n].length * 14);
      setTimeout(function () {
        if (my !== seq) return;
        var p = document.createElement("p"); p.className = "say"; p.textContent = parts[n++];
        chat.replaceChild(p, dots);
        setTimeout(next, 280);
      }, wait);
    })();
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (filing) return;
    if (!what.value.trim()) {
      hint.textContent = t.empty;
      what.value = ""; what.focus(); return;
    }
    hint.textContent = "";
    filing = true; seq++; send.disabled = true; send.textContent = t.filing; pauseTimer();
    var text = what.value;
    setTimeout(function () {
      var parts = compose(text, cat.selectedIndex, line.selectedIndex, line.value, line.options.length - 1);
      var dl = document.createElement("dl");
      row(dl, t.caseNo, "WB-" + (1000 + Math.floor(Math.random() * 9000)));
      row(dl, t.category, cat.value);
      if (line.selectedIndex > 0) row(dl, t.waiting, line.value);
      row(dl, t.status, filed >= 3 && filed % 3 === 0 ? t.forwardedNext : t.forwarded);
      var chat = document.createElement("div"); chat.className = "chat";
      out.textContent = ""; out.appendChild(dl); out.appendChild(chat); out.hidden = false;
      what.value = ""; updateCount();
      filing = false; send.disabled = false; send.textContent = t.file;
      /* On phones, close the keyboard so the reply is visible. */
      if (touch) { what.blur(); out.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "nearest" }); }
      updateIdle();
      typing = true;
      speak(chat, parts, function () {
        typing = false;
        out.appendChild(clearRow());
        if (touch) out.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "nearest" });
        startTimer();
      });
    }, smooth ? 500 : 0);
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
