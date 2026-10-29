/* Wetterbank research site: the encounter.
   A tram stop, a stranger, and a bench with one of five behaviours.
   Text is stored as {en, de} pairs with tokens, so the language can switch mid-encounter.
   Tokens: {S}/{s} the stranger (capitalised / not), {Pr}/{pr} pronoun, {poss} possessive,
   {name} the stranger's first name, {dog} the dog's name, {ref} a case number. */
(function (global) {
  "use strict";

  /* The five bench behaviours (the experimental conditions). */
  var BENCHES = {
    silent: {
      talks: false,
      name: { en: "The ordinary bench", de: "Die gewöhnliche Bank" },
      about: { en: "Says nothing. The control: how people meet with no help at all.", de: "Sagt nichts. Die Kontrollbedingung: Wie Menschen sich ganz ohne Hilfe begegnen." }
    },
    weather: {
      talks: true,
      name: { en: "The weather bench", de: "Die Wetterbank" },
      about: { en: "Opens with the safest topic there is, then hands over to you.", de: "Beginnt mit dem sichersten Thema überhaupt und übergibt dann an Sie." }
    },
    complaints: {
      talks: true,
      name: { en: "The complaints desk", de: "Die Beschwerdestelle" },
      about: { en: "Collects your grumbles and files them together, so grumbling becomes a bond.", de: "Sammelt Ihr Meckern und legt es gemeinsam ab, damit Meckern verbindet." }
    },
    names: {
      talks: true,
      name: { en: "The matchmaker", de: "Die Kupplerin" },
      about: { en: "Skips the weather and asks for names. Friendly or nosy?", de: "Überspringt das Wetter und fragt nach Namen. Freundlich oder aufdringlich?" }
    },
    morethanhuman: {
      talks: true,
      name: { en: "The spokesbench", de: "Die Sprecherbank" },
      about: { en: "Speaks for its non-human neighbours: the plane tree, a pigeon, the rain.", de: "Spricht für ihre nicht-menschlichen Nachbarn: die Platane, eine Taube, den Regen." }
    }
  };

  /* The three strangers. warmth = how open they are at the start. */
  var STRANGERS = {
    shopper: {
      warmth: 2, name: "Ingrid",
      S: { en: "The woman", de: "Die Frau" }, s: { en: "the woman", de: "die Frau" },
      Pr: { en: "She", de: "Sie" }, pr: { en: "she", de: "sie" }, poss: { en: "her", de: "ihren" },
      who: { en: "a woman in her sixties with a shopping bag", de: "eine Frau um die sechzig mit Einkaufstasche" },
      arrive: { en: "A woman in her sixties sits down at the other end of the bench and puts her shopping bag between you.", de: "Eine Frau um die sechzig setzt sich ans andere Ende der Bank und stellt ihre Einkaufstasche zwischen Sie beide." },
      event: { en: "Her bag tips over. An apple rolls towards your foot.", de: "Ihre Tasche kippt um. Ein Apfel rollt zu Ihrem Fuß." },
      help: { en: "Pick up the apple and hand it back.", de: "Den Apfel aufheben und zurückgeben." },
      helpSay: { en: "You pick up the apple and hand it back.", de: "Sie heben den Apfel auf und geben ihn zurück." },
      helpReact: {
        cold: { en: "“Thank you,” she says, and holds the bag a little tighter.", de: "„Danke“, sagt sie und hält die Tasche etwas fester." },
        warm: { en: "“Oh, thank you! They always escape.”", de: "„Oh, danke! Die hauen immer ab.“" },
        open: { en: "“Thank you! Do you want one? I bought far too many.” She hands you an apple.", de: "„Danke! Wollen Sie einen? Ich hab viel zu viele gekauft.“ Sie reicht Ihnen einen Apfel." }
      },
      openGivesName: false
    },
    student: {
      warmth: 0, name: "Jonas",
      S: { en: "The student", de: "Der Student" }, s: { en: "the student", de: "der Student" },
      Pr: { en: "He", de: "Er" }, pr: { en: "he", de: "er" }, poss: { en: "his", de: "seinen" },
      who: { en: "a student with headphones around his neck", de: "ein Student mit Kopfhörern um den Hals" },
      arrive: { en: "A student sits down at the other end, headphones around his neck, phone in hand.", de: "Ein Student setzt sich ans andere Ende, Kopfhörer um den Hals, Handy in der Hand." },
      event: { en: "The student stares at his phone: 2% battery.", de: "Der Student starrt auf sein Handy: 2 % Akku." },
      help: { en: "Offer him your charging cable.", de: "Ihm Ihr Ladekabel anbieten." },
      helpSay: { en: "“Need a cable? I have one.”", de: "„Brauchst du ein Kabel? Ich hab eins.“" },
      helpReact: {
        cold: { en: "“It’s fine,” he says. The phone dies anyway.", de: "„Passt schon“, sagt er. Das Handy geht trotzdem aus." },
        warm: { en: "“Seriously? You’re saving my evening.”", de: "„Echt jetzt? Du rettest meinen Abend.“" },
        open: { en: "“You’re a hero. I’m {name}, by the way.”", de: "„Du bist ein Held. Ich bin übrigens {name}.“" }
      },
      openGivesName: "stranger"
    },
    dog: {
      warmth: 1, name: "Murat", dogName: "Frida",
      S: { en: "The man", de: "Der Mann" }, s: { en: "the man", de: "der Mann" },
      Pr: { en: "He", de: "Er" }, pr: { en: "he", de: "er" }, poss: { en: "his", de: "seinen" },
      who: { en: "a man with a small dog", de: "ein Mann mit einem kleinen Hund" },
      arrive: { en: "A man with a small dog sits down at the other end. The dog looks at you. The man does not.", de: "Ein Mann mit einem kleinen Hund setzt sich ans andere Ende. Der Hund sieht Sie an. Der Mann nicht." },
      event: { en: "The dog puts its front paws on your knee and looks at you very seriously.", de: "Der Hund legt Ihnen die Vorderpfoten aufs Knie und sieht Sie sehr ernst an." },
      help: { en: "Pet the dog and ask its name.", de: "Den Hund streicheln und nach seinem Namen fragen." },
      helpSay: { en: "“Hello, you. What’s your name?”", de: "„Na du. Wie heißt du denn?“" },
      helpReact: {
        cold: { en: "“She doesn’t like strangers,” he says, and pulls the lead. The dog disagrees.", de: "„Sie mag keine Fremden“, sagt er und zieht an der Leine. Der Hund sieht das anders." },
        warm: { en: "“That’s {dog}. She likes you more than she likes me.”", de: "„Das ist {dog}. Sie mag Sie lieber als mich.“" },
        open: { en: "“That’s {dog}. And I’m {name}. She always does the introductions.”", de: "„Das ist {dog}. Und ich bin {name}. Bei uns übernimmt sie immer das Vorstellen.“" }
      },
      openGivesName: "dog"
    }
  };

  function P(en, de) { return { en: en, de: de }; }

  /* What each bench says at each moment (index 0–4). */
  var BENCH_LINES = {
    weather: [
      null, /* filled with today's weather */
      P("“It’s getting colder. People who freeze together are allowed to say so.”", "„Es wird kälter. Wer zusammen friert, darf das auch sagen.“"),
      P("“And now: rain. Statistically, this is the moment people start talking.”", "„Und jetzt: Regen. Statistisch gesehen ist das der Moment, in dem Menschen anfangen zu reden.“"),
      P("“Okay, enough weather. You two must have something else to talk about.”", "„Okay, genug Wetter. Sie beide haben doch sicher noch ein anderes Thema.“"),
      P("“Have a good evening. Tomorrow: 60% chance of conversation.”", "„Schönen Abend. Morgen: 60 % Gesprächswahrscheinlichkeit.“")
    ],
    complaints: [
      P("“Good evening. The U79 is late. Again. Complaints can be made here, out loud. We forward them.”", "„Guten Abend. Die U79 ist zu spät. Mal wieder. Beschwerden nehmen wir hier mündlich entgegen. Wir leiten sie weiter.“"),
      P("“Complaint detected: ‘twenty-five minutes’. Would anyone like to file it officially?”", "„Beschwerde erkannt: ‚fünfundzwanzig Minuten‘. Möchte jemand sie offiziell einreichen?“"),
      P("“Rain. I’m opening a second complaint. You can file it together, it’s faster.”", "„Regen. Ich eröffne eine zweite Beschwerde. Gemeinsam eingereicht geht es schneller.“"),
      P("“Your complaints are identical. You may be the same person. Please clarify this with each other.”", "„Ihre Beschwerden sind identisch. Möglicherweise sind Sie dieselbe Person. Bitte klären Sie das untereinander.“"),
      P("“All complaints have been forwarded. The weather will not reply.”", "„Alle Beschwerden wurden weitergeleitet. Das Wetter wird nicht antworten.“")
    ],
    names: [
      P("“Good evening, you two. Lovely, a full bench. I like full benches.”", "„Guten Abend, Sie beide. Schön, eine volle Bank. Ich mag volle Bänke.“"),
      P("“You are both waiting for the U79. That is already something in common.”", "„Sie warten beide auf die U79. Das ist doch schon mal eine Gemeinsamkeit.“"),
      P("“Since nobody is starting: I’m the bench. And you are?”", "„Da ja keiner anfängt: Ich bin die Bank. Und Sie?“"),
      P("“Come on. First names only. I’ll go first: Bank.”", "„Na los. Nur Vornamen. Ich fange an: Bank.“"),
      P("“Goodbye, strangers. I’ll try again tomorrow.”", "„Auf Wiedersehen, Fremde. Morgen versuche ich es wieder.“")
    ],
    morethanhuman: [
      P("“Good evening. I’m speaking for the plane tree behind you. It has stood here for 63 years and has never seen the U79 on time.”", "„Guten Abend. Ich spreche für die Platane hinter Ihnen. Sie steht hier seit 63 Jahren und hat die U79 noch nie pünktlich gesehen.“"),
      P("“A pigeon has joined you. It would like to point out that crumbs are also a form of conversation.”", "„Eine Taube hat sich zu Ihnen gesellt. Sie weist darauf hin, dass Krümel auch eine Form von Gespräch sind.“"),
      P("“The rain asks me to say: it’s not personal. The tree, for its part, is delighted.”", "„Der Regen lässt ausrichten: Es ist nichts Persönliches. Die Platane freut sich jedenfalls.“"),
      P("“The tree would like to know whether you two know each other. It has seen you both here before.”", "„Die Platane möchte wissen, ob Sie beide sich kennen. Sie hat Sie beide hier schon gesehen.“"),
      P("“The tree says goodbye. It will still be here tomorrow. So will the pigeon, probably.”", "„Die Platane verabschiedet sich. Sie ist morgen noch da. Die Taube vermutlich auch.“")
    ]
  };

  /* The bench's answer when you reply to it, per moment (0–3). */
  var BENCH_ANSWERS = {
    weather: [
      P("“See? Talking is easy. Now try it with a person.”", "„Sehen Sie? Reden ist einfach. Jetzt probieren Sie es mal mit einem Menschen.“"),
      P("“Noted. The person next to you looks cold too. Just saying.”", "„Notiert. Die Person neben Ihnen sieht auch verfroren aus. Nur so.“"),
      null,
      P("“Fine. Then I’ll keep talking about the weather. Again.”", "„Gut. Dann rede ich eben weiter übers Wetter. Mal wieder.“")
    ],
    complaints: [
      P("“Thank you. Your greeting has been registered. Processing time: undetermined.”", "„Danke. Ihr Gruß wurde registriert. Bearbeitungszeit: unbestimmt.“"),
      P("“Complaint WB-{ref} filed and forwarded to the weather. The person next to you nodded. I’ll add them as co-signer.”", "„Beschwerde WB-{ref} eingereicht und an das Wetter weitergeleitet. Die Person neben Ihnen hat genickt. Ich trage sie als Mitunterzeichnende ein.“"),
      null,
      P("“Then I’ll file you both under ‘strangers’. Folder: Monday again.”", "„Dann lege ich Sie beide unter ‚Fremde‘ ab. Ordner: Schon wieder Montag.“")
    ],
    names: [
      P("“How polite. The person next to you is polite too, I think. Let’s find out.”", "„Wie höflich. Die Person neben Ihnen ist bestimmt auch höflich. Finden wir es heraus.“"),
      P("“Not yet, you mean.”", "„Noch nicht, meinen Sie.“"),
      null, null
    ],
    morethanhuman: [
      P("“The tree says good evening too. It is just very slow.”", "„Die Platane sagt auch guten Abend. Sie ist nur sehr langsam.“"),
      P("“Sixty-three. It has watched about 40,000 people wait here. Roughly eleven of them talked to each other.”", "„Dreiundsechzig. Sie hat hier etwa 40.000 Menschen warten sehen. Ungefähr elf davon haben miteinander geredet.“"),
      null,
      P("“The pigeon has left. It says you had your chance.”", "„Die Taube ist gegangen. Sie sagt, Sie hatten Ihre Chance.“")
    ]
  };

  var DISPLAY = ["12", "25", "25", "40", "0"];

  function tier(w) { return w <= 2 ? "cold" : w <= 4 ? "warm" : "open"; }

  /* ---- The engine ---- */
  function Encounter(benchKey, strangerKey, weatherLine) {
    this.benchKey = benchKey;
    this.bench = BENCHES[benchKey];
    this.strangerKey = strangerKey;
    this.st = STRANGERS[strangerKey];
    this.weatherLine = weatherLine || P("“Good evening. Bit chilly today, isn’t it?”", "„Guten Abend. Bisschen frisch heute, oder?“");
    this.beat = 0;
    this.w = this.st.warmth;
    this.c = { stranger: 0, bench: 0, phone: 0, ignore: 0 };
    this.names = false; this.namesVia = null;
    this.strangerName = false; /* the stranger has said their name */
    this.firstContact = null; this.benchRefused = false;
    this.left = false; this.done = false;
    this.ref = String(1000 + Math.floor(Math.random() * 9000));
    this.scene = { phone: false, rain: false, pigeon: false, speaking: false, strangerPhone: false, closer: false };
  }

  Encounter.prototype.display = function () { return DISPLAY[Math.min(this.beat, 4)]; };

  Encounter.prototype.benchLine = function (i) {
    if (!this.bench.talks) return null;
    if (this.benchKey === "weather" && i === 0) return this.weatherLine;
    if (this.benchKey === "names" && i === 3 && this.names) return P("“Wonderful. My work here is done.”", "„Wunderbar. Meine Arbeit hier ist getan.“");
    if (this.benchKey === "names" && i === 4 && this.names) return P("“Goodbye, {name}. Goodbye, you. Same time tomorrow?”", "„Auf Wiedersehen, {name}. Auf Wiedersehen, Sie. Morgen gleiche Zeit?“");
    return BENCH_LINES[this.benchKey][i];
  };

  Encounter.prototype.ambient = function (i) {
    var t = tier(this.w);
    var A = {
      1: { cold: P("{S} sighs, quietly.", "{S} seufzt leise."),
           warm: P("{S} sighs. “Twenty-five. Of course.”", "{S} seufzt. „Fünfundzwanzig. Natürlich.“"),
           open: P("{S} laughs out loud. “Twenty-five! I could have walked.”", "{S} lacht laut. „Fünfundzwanzig! Da hätte ich laufen können.“") },
      3: { cold: P("{S} stares at the display.", "{S} starrt auf die Anzeige."),
           warm: P("{S} shakes {poss} head at the display and looks at you. “Forty.”", "{S} schüttelt den Kopf über die Anzeige und sieht Sie an. „Vierzig.“"),
           open: P("“Forty minutes,” {pr} says. “At this point we should introduce ourselves.”", "„Vierzig Minuten“, sagt {pr}. „Langsam sollten wir uns vorstellen.“") }
    };
    if (i === 3 && this.names) return P("{S} looks at the display and shrugs at you. “Forty. Well.”", "{S} sieht auf die Anzeige und zuckt Ihnen gegenüber mit den Schultern. „Vierzig. Na ja.“");
    return A[i] ? A[i][t] : null;
  };

  /* Messages that open a moment. */
  Encounter.prototype.open = function () {
    var i = this.beat, m = [], b = this.benchLine(i);
    this.scene.speaking = !!b;
    if (i === 0) {
      m.push({ who: "narr", t: P("Düsseldorf, a tram stop, 21:12. You sit down on the bench. The U79 is 12 minutes late.", "Düsseldorf, eine Straßenbahnhaltestelle, 21:12 Uhr. Sie setzen sich auf die Bank. Die U79 hat 12 Minuten Verspätung.") });
      m.push({ who: "narr", t: this.st.arrive });
      if (!b) m.push({ who: "narr", t: P("The bench says nothing. It is an ordinary bench.", "Die Bank sagt nichts. Es ist eine ganz normale Bank.") });
    } else if (i === 1) {
      m.push({ who: "display", t: P("U79 · 25 min", "U79 · 25 Min.") });
      var a1 = this.ambient(1); if (a1) m.push({ who: "stranger", t: a1 });
      if (this.benchKey === "morethanhuman") this.scene.pigeon = true;
    } else if (i === 2) {
      this.scene.rain = true;
      m.push({ who: "narr", t: P("It starts to rain.", "Es fängt an zu regnen.") });
      m.push({ who: "narr", t: this.st.event });
    } else if (i === 3) {
      m.push({ who: "display", t: P("U79 · 40 min", "U79 · 40 Min.") });
      var a3 = this.ambient(3); if (a3) m.push({ who: "stranger", t: a3 });
    } else if (i === 4) {
      this.scene.rain = false;
      m.push({ who: "display", t: P("U79 · arriving", "U79 · fährt ein") });
      m.push({ who: "narr", t: P("Finally, the U79 arrives.", "Endlich kommt die U79.") });
    }
    if (b) m.push({ who: "bench", t: b });
    return m;
  };

  /* The choices for the current moment. */
  Encounter.prototype.choices = function () {
    var i = this.beat, B = this.bench, k = this.benchKey, c = [];
    if (i === 0) {
      c.push({ id: "hello", type: "stranger", t: P("Nod and say “Evening.”", "Nicken und „’n Abend“ sagen.") });
      if (B.talks) c.push({ id: "answer", type: "bench", t: P("Answer the bench: “Evening.”", "Der Bank antworten: „Guten Abend.“") });
      else c.push({ id: "look", type: "ignore", t: P("Look at the bench. Maybe it does something.", "Die Bank ansehen. Vielleicht tut sie ja was.") });
      c.push({ id: "phone", type: "phone", t: P("Take out your phone.", "Das Handy herausholen.") });
    } else if (i === 1) {
      c.push({ id: "remark", type: "stranger", t: P("Say: “Twenty-five minutes. Great.”", "Sagen: „Fünfundzwanzig Minuten. Super.“") });
      var b1 = {
        weather: P("Tell the bench: “Yes, it’s freezing.”", "Der Bank sagen: „Ja, es ist eiskalt.“"),
        complaints: P("Complain: “The U79 is always late.”", "Sich beschweren: „Die U79 ist immer zu spät.“"),
        names: P("Tell the bench: “We don’t know each other.”", "Der Bank sagen: „Wir kennen uns nicht.“"),
        morethanhuman: P("Ask the bench: “Is the tree really 63?”", "Die Bank fragen: „Ist der Baum wirklich 63?“")
      };
      if (B.talks) c.push({ id: "reply", type: "bench", t: b1[k] });
      else c.push({ id: "plaque", type: "ignore", t: P("Read the small plaque on the bench.", "Das kleine Schild an der Bank lesen.") });
      c.push({ id: "phone", type: "phone", t: P("Check when the tram is really coming.", "Nachsehen, wann die Bahn wirklich kommt.") });
      c.push({ id: "leave", type: "leave", t: P("Get up and walk to the next stop.", "Aufstehen und zur nächsten Haltestelle laufen.") });
    } else if (i === 2) {
      c.push({ id: "help", type: "stranger", t: this.st.help });
      if (k === "names") c.push({ id: "benchName", type: "bench", t: P("Tell the bench your first name.", "Der Bank Ihren Vornamen sagen.") });
      else if (B.talks) c.push({ id: "laugh", type: "bench", t: P("Laugh at the bench and glance across.", "Über die Bank lachen und kurz rüberschauen.") });
      else c.push({ id: "hood", type: "ignore", t: P("Pull your hood up and wait.", "Die Kapuze aufsetzen und warten.") });
      c.push({ id: "phone", type: "phone", t: P("Look at your phone until it’s over.", "Aufs Handy schauen, bis es vorbei ist.") });
    } else if (i === 3) {
      if (!this.names) c.push({ id: "intro", type: "stranger", t: P("Introduce yourself: “I’m …, by the way.”", "Sich vorstellen: „Ich bin übrigens …“") });
      c.push({ id: "ask", type: "stranger", t: P("Ask: “Do you take this tram every day?”", "Fragen: „Fahren Sie jeden Tag mit der Bahn?“") });
      if (k === "names" && !this.names) c.push({ id: "benchName", type: "bench", t: P("Tell the bench your first name.", "Der Bank Ihren Vornamen sagen.") });
      else if (B.talks) c.push({ id: "letbench", type: "bench", t: P("Leave it to the bench.", "Das der Bank überlassen.") });
      else c.push({ id: "quiet", type: "ignore", t: P("Stay silent. Forty minutes is a long time.", "Schweigen. Vierzig Minuten sind lang.") });
      c.push({ id: "phone", type: "phone", t: P("Look at your phone.", "Aufs Handy schauen.") });
    } else if (i === 4) {
      c.push({ id: "bye", type: "stranger", t: P("Say: “Have a nice evening.”", "Sagen: „Schönen Abend noch.“") });
      c.push({ id: "nobye", type: "ignore", t: P("Get on without a word.", "Wortlos einsteigen.") });
    }
    return c;
  };

  Encounter.prototype._contact = function (via) {
    if (!this.firstContact) this.firstContact = { beat: this.beat + 1, via: via };
  };
  Encounter.prototype._setNames = function (via) {
    if (!this.names) { this.names = true; this.namesVia = via; }
  };

  /* Apply a choice. Returns the messages that follow it. */
  Encounter.prototype.choose = function (id) {
    var i = this.beat, k = this.benchKey, st = this.st, m = [], ch = null;
    this.choices().forEach(function (x) { if (x.id === id) ch = x; });
    if (!ch) return [];
    this.scene.speaking = false;
    if (ch.type === "stranger") this.c.stranger++;
    else if (ch.type === "bench") this.c.bench++;
    else if (ch.type === "phone") this.c.phone++;
    else if (ch.type === "ignore") this.c.ignore++;
    this.scene.phone = ch.type === "phone";

    var say = function (en, de) { m.push({ who: "you", t: P(en, de) }); };
    var self = this;
    function benchAnswer() {
      var a = BENCH_ANSWERS[k] && BENCH_ANSWERS[k][i];
      if (a) { m.push({ who: "bench", t: a }); self.scene.speaking = true; }
    }
    function mediated() {
      self.w += self.w >= 1 ? 1 : 0;
      if (self.w >= 3) m.push({ who: "stranger", t: P("{S} looks over, amused, and catches your eye.", "{S} schaut amüsiert herüber und fängt Ihren Blick auf.") });
      else m.push({ who: "stranger", t: P("{S} glances at you, then at the bench, and says nothing.", "{S} schaut kurz zu Ihnen, dann zur Bank, und sagt nichts.") });
    }

    if (id === "phone") {
      this.w -= 1;
      var ph = [
        P("You scroll. {S} takes out a phone too.", "Sie scrollen. {S} holt auch das Handy heraus."),
        P("The app says 31 minutes. The display says 25. Nobody knows.", "Die App sagt 31 Minuten. Die Anzeige sagt 25. Niemand weiß es."),
        P("When you look up, {s} is watching the rain.", "Als Sie aufsehen, schaut {s} in den Regen."),
        P("Your battery drops to 41%. The tram is still 40 minutes away.", "Ihr Akku fällt auf 41 %. Die Bahn ist immer noch 40 Minuten entfernt.")
      ];
      m.push({ who: "narr", t: ph[i] });
      if (i === 0) this.scene.strangerPhone = true;
    } else if (id === "leave") {
      this.left = true; this.done = true;
      m.push({ who: "narr", t: P("You get up and walk. At the next stop, nobody is sitting. The bench there is silent too.", "Sie stehen auf und gehen. An der nächsten Haltestelle sitzt niemand. Auch die Bank dort schweigt.") });
      return m;
    } else if (id === "hello") {
      say("Evening.", "’n Abend.");
      this.w += 2; this._contact("direct");
      this.scene.strangerPhone = false;
      m.push({ who: "stranger", t: {
        cold: P("{S} nods without looking up.", "{S} nickt, ohne aufzusehen."),
        warm: P("“Evening,” {pr} says, with half a smile.", "„’n Abend“, sagt {pr} mit einem halben Lächeln."),
        open: P("“Evening! Late again, of course.”", "„’n Abend! Wieder mal zu spät, natürlich.“")
      }[tier(this.w)] });
    } else if (id === "answer") {
      say("Good evening.", "Guten Abend.");
      benchAnswer(); mediated();
    } else if (id === "look") {
      m.push({ who: "narr", t: P("It is a bench. It does nothing. It never has.", "Es ist eine Bank. Sie tut nichts. Hat sie noch nie.") });
    } else if (id === "remark") {
      say("Twenty-five minutes. Great.", "Fünfundzwanzig Minuten. Super.");
      this.w += 2; this._contact("direct"); this.scene.strangerPhone = false;
      m.push({ who: "stranger", t: {
        cold: P("“Mm,” says {s}.", "„Hm“, macht {s}."),
        warm: P("“Great is one word for it,” {pr} says.", "„Super ist ein Wort dafür“, sagt {pr}."),
        open: P("“Great? It’s a disaster!” {Pr} is clearly enjoying this.", "„Super? Eine Katastrophe ist das!“ {Pr} hat sichtlich Spaß daran.")
      }[tier(this.w)] });
    } else if (id === "reply") {
      var r1 = {
        weather: P("Yes, it’s freezing.", "Ja, es ist eiskalt."),
        complaints: P("The U79 is always late.", "Die U79 ist immer zu spät."),
        names: P("We don’t know each other.", "Wir kennen uns nicht."),
        morethanhuman: P("Is the tree really 63?", "Ist der Baum wirklich 63?")
      }[k];
      m.push({ who: "you", t: r1 });
      benchAnswer(); mediated();
    } else if (id === "plaque") {
      m.push({ who: "narr", t: P("The plaque says: “Donated by the city, 2009.” That is all it has to say.", "Auf dem Schild steht: „Gestiftet von der Stadt, 2009.“ Mehr hat sie nicht zu sagen.") });
    } else if (id === "help") {
      m.push({ who: "you", t: st.helpSay });
      this.w += 2; this._contact("event"); this.scene.strangerPhone = false; this.scene.closer = true;
      var t = tier(this.w);
      m.push({ who: "stranger", t: st.helpReact[t] });
      if (t === "open" && st.openGivesName) { this.strangerName = true; }
    } else if (id === "laugh") {
      m.push({ who: "narr", t: P("You laugh and glance across.", "Sie lachen und schauen kurz rüber.") });
      this.w += 1;
      if (this.w >= 3) { this._contact("bench"); m.push({ who: "stranger", t: P("{S} laughs too. For a moment you are both on the same side: against the rain.", "{S} lacht auch. Für einen Moment sind Sie beide auf derselben Seite: gegen den Regen.") }); }
      else m.push({ who: "stranger", t: P("{S} smiles politely, then looks at the rain.", "{S} lächelt höflich und schaut dann in den Regen.") });
    } else if (id === "benchName") {
      m.push({ who: "narr", t: P("You tell the bench your first name.", "Sie sagen der Bank Ihren Vornamen.") });
      m.push({ who: "bench", t: P("“Lovely. And you, on the right?”", "„Schön. Und Sie, rechts?“") });
      this.scene.speaking = true;
      this.w += 1;
      if (this.w >= 3) {
        this._contact("bench"); this._setNames("bench"); this.strangerName = true;
        m.push({ who: "stranger", t: P("{S} hesitates, then laughs. “{name}. Fine. {name}.”", "{S} zögert, dann lacht {pr}. „{name}. Na gut. {name}.“") });
      } else {
        this.benchRefused = true; this.w -= 2;
        m.push({ who: "stranger", t: P("“I’d rather not,” {pr} says. The bench goes quiet. It’s a little awkward.", "„Lieber nicht“, sagt {pr}. Die Bank verstummt. Es ist ein bisschen peinlich.") });
      }
    } else if (id === "hood") {
      m.push({ who: "narr", t: P("The rain falls on everyone equally. Nobody says anything.", "Der Regen fällt auf alle gleich. Niemand sagt etwas.") });
    } else if (id === "intro") {
      say("I’m …, by the way.", "Ich bin übrigens …");
      this.w += 2; this._contact("direct");
      var ti = tier(this.w);
      if (ti === "open" || (this.strangerName && ti === "warm")) {
        this._setNames(this.strangerName ? (this.st.openGivesName || "self") : "self");
        m.push({ who: "stranger", t: this.strangerName
          ? P("“Nice to meet you properly.” {Pr} shakes your hand. It’s wet. It’s raining, after all.", "„Schön, Sie richtig kennenzulernen.“ {Pr} gibt Ihnen die Hand. Sie ist nass. Es regnet ja.")
          : P("“{name}. Nice to meet you.” {Pr} shakes your hand. It’s wet. It’s raining, after all.", "„{name}. Freut mich.“ {Pr} gibt Ihnen die Hand. Sie ist nass. Es regnet ja.") });
        this.strangerName = true;
      } else if (ti === "warm") {
        m.push({ who: "stranger", t: P("“Nice to meet you,” {pr} says, and smiles. {Pr} doesn’t say a name. Maybe next time.", "„Freut mich“, sagt {pr} und lächelt. Einen Namen sagt {pr} nicht. Vielleicht nächstes Mal.") });
      } else {
        m.push({ who: "stranger", t: P("{S} nods politely and looks back at the display.", "{S} nickt höflich und schaut wieder auf die Anzeige.") });
      }
    } else if (id === "ask") {
      say("Do you take this tram every day?", "Fahren Sie jeden Tag mit der Bahn?");
      this.w += 2; this._contact("direct");
      m.push({ who: "stranger", t: {
        cold: P("“Sometimes,” says {s}.", "„Manchmal“, sagt {s}."),
        warm: P("“Most days,” {pr} says. “You?”", "„Meistens“, sagt {pr}. „Und Sie?“"),
        open: P("“Every day. And every day it’s late.” {Pr} tells you about the time it was 70 minutes.", "„Jeden Tag. Und jeden Tag zu spät.“ {Pr} erzählt Ihnen von dem Mal, als es 70 Minuten waren.")
      }[tier(this.w)] });
    } else if (id === "letbench") {
      benchAnswer(); mediated();
      if (this.w >= 3) this._contact("bench");
    } else if (id === "quiet") {
      m.push({ who: "narr", t: P("Forty minutes is a long time. Nobody says anything. Nobody has to.", "Vierzig Minuten sind lang. Niemand sagt etwas. Muss ja auch keiner.") });
    } else if (id === "bye") {
      say("Have a nice evening.", "Schönen Abend noch.");
      this.w += 1;
      m.push({ who: "stranger", t: this.w >= 3
        ? P("“You too!” {Pr} sits somewhere else on the tram. That’s normal.", "„Ihnen auch!“ {Pr} setzt sich in der Bahn woanders hin. Das ist normal.")
        : P("“Mm. You too.”", "„Hm. Ihnen auch.“") });
    } else if (id === "nobye") {
      m.push({ who: "narr", t: P("You both get on. Different doors.", "Sie steigen beide ein. Durch verschiedene Türen.") });
    }

    if (i === 4) { this.done = true; return m; }
    this.beat++;
    return m.concat(this.open());
  };

  /* A summary of what happened, for the results and for the data. */
  Encounter.prototype.outcome = function () {
    var r;
    if (this.left) r = "left";
    else if (this.names) r = "names";
    else if (this.c.stranger >= 2 || (this.c.stranger >= 1 && this.w >= 3) || this.strangerName) r = "talked";
    else if (this.c.bench >= 2 && this.c.stranger === 0) r = "bench";
    else r = "silence";
    return {
      result: r,
      names_via: this.names ? this.namesVia : null,
      stranger_said_name: this.strangerName,
      first_contact: this.firstContact,
      bench_refused: this.benchRefused,
      to_stranger: this.c.stranger, to_bench: this.c.bench, phone: this.c.phone, ignored: this.c.ignore,
      warmth_end: this.w,
      moments: Math.min(this.beat + 1, 5)
    };
  };

  /* Turn a text pair into a string for one language. */
  function fmt(pair, st, lang, ref) {
    if (!pair) return "";
    var s = pair[lang] || pair.en;
    return s.replace(/\{S\}/g, st.S[lang]).replace(/\{s\}/g, st.s[lang])
      .replace(/\{Pr\}/g, st.Pr[lang]).replace(/\{pr\}/g, st.pr[lang])
      .replace(/\{poss\}/g, st.poss[lang]).replace(/\{name\}/g, st.name)
      .replace(/\{dog\}/g, st.dogName || "").replace(/\{ref\}/g, ref || "");
  }

  var RESULT_TEXT = {
    names: P("You know each other’s names.", "Sie kennen jetzt die Vornamen voneinander."),
    talked: P("You talked, but you didn’t exchange names.", "Sie haben geredet, aber keine Namen ausgetauscht."),
    bench: P("You talked to the bench, not to the person.", "Sie haben mit der Bank geredet, nicht mit dem Menschen."),
    silence: P("Forty minutes, and not a word between you.", "Vierzig Minuten, und kein Wort zwischen Ihnen."),
    left: P("You walked away before anything happened.", "Sie sind gegangen, bevor etwas passiert ist.")
  };
  var VIA_TEXT = {
    direct: P("The first move was yours.", "Der erste Schritt kam von Ihnen."),
    event: P("It started with something between you: {thing}.", "Angefangen hat es mit etwas zwischen Ihnen: {thing}."),
    bench: P("It started with the bench.", "Angefangen hat es mit der Bank.")
  };
  var THING = { shopper: P("an apple", "einem Apfel"), student: P("a dying phone", "einem leeren Handy"), dog: P("a dog called Frida", "einer Hündin namens Frida") };

  global.WBEncounter = {
    BENCHES: BENCHES, STRANGERS: STRANGERS, Encounter: Encounter, fmt: fmt,
    RESULT_TEXT: RESULT_TEXT, VIA_TEXT: VIA_TEXT, THING: THING, P: P,
    benchKeys: Object.keys(BENCHES), strangerKeys: Object.keys(STRANGERS)
  };
})(window);
