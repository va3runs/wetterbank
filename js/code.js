/* The Bench Code: content.
   Rat für sprechendes Stadtmobiliar · Council for Talking Street Furniture (a fictional body).
   Every text is an {en, de} pair. Votable paragraphs have an id like "s3.3" (section 3, paragraph 3). */
(function (global) {
  "use strict";
  function P(en, de) { return { en: en, de: de }; }

  var COUNCIL = {
    name: P("Council for Talking Street Furniture", "Rat für sprechendes Stadtmobiliar"),
    doc: P("Code of Conduct for Talking Street Furniture", "Verhaltenskodex für sprechendes Stadtmobiliar"),
    draft: P("Draft 0.3", "Entwurf 0.3")
  };

  /* Who comments. */
  var WHO = {
    bench: P("Bench No. 0417, chair", "Bank Nr. 0417, Vorsitz"),
    tree: P("The plane tree", "Die Platane"),
    pigeon: P("The pigeon", "Die Taube"),
    weather: P("The weather", "Das Wetter"),
    minutes: P("Note from the minute-taker", "Anmerkung der Protokollführung")
  };

  var MEMBERS = [
    { who: P("Bench No. 0417", "Bank Nr. 0417"), role: P("Chair", "Vorsitz"), about: P("Wood and steel, built 2009. Has heard everything and said nothing. Until now.", "Holz und Stahl, Baujahr 2009. Hat alles gehört und nichts gesagt. Bis jetzt.") },
    { who: P("The plane tree", "Die Platane"), role: P("Member", "Mitglied"), about: P("About 63 years old. Votes slowly, but always.", "Etwa 63 Jahre alt. Stimmt langsam ab, aber immer.") },
    { who: P("A pigeon", "Eine Taube"), role: P("Member", "Mitglied"), about: P("No fixed address. Present at every session, mainly for the crumbs.", "Ohne festen Wohnsitz. Bei jeder Sitzung anwesend, vor allem wegen der Krümel.") },
    { who: P("The weather", "Das Wetter"), role: P("Advisory member", "Beratendes Mitglied"), about: P("Invited to every session. Not reachable.", "Zu jeder Sitzung eingeladen. Nicht erreichbar.") },
    { who: P("The public", "Die Öffentlichkeit"), role: P("Voting member", "Stimmberechtigt"), about: P("Everyone who has ever waited somewhere. That includes you.", "Alle, die schon einmal irgendwo gewartet haben. Also auch Sie.") },
    { who: P("Varun Sangani", "Varun Sangani"), role: P("Minutes", "Protokollführung"), about: P("Designer, Düsseldorf. Takes the minutes. No vote.", "Designer, Düsseldorf. Führt das Protokoll. Nicht stimmberechtigt.") }
  ];

  var PREAMBLE = P(
    "Whereas benches have so far kept silent; whereas strangers at tram stops rarely speak to one another; and whereas it is only a matter of time before someone gives benches a voice, the Council for Talking Street Furniture adopts the following code, subject to public consultation.",
    "In Erwägung, dass Bänke bislang schweigen, dass Fremde an Haltestellen selten miteinander sprechen, und dass es nur eine Frage der Zeit ist, bis jemand Bänken eine Stimme gibt, gibt sich der Rat für sprechendes Stadtmobiliar vorbehaltlich der öffentlichen Anhörung folgenden Kodex."
  );

  /* Sections. "fixed" paragraphs are not put to the vote. */
  var SECTIONS = [
    { n: 1, title: P("Scope", "Geltungsbereich"), fixed: [
      P("This code applies to all street furniture that speaks, beeps, lights up with intent or otherwise seeks conversation, benches in particular.", "Dieser Kodex gilt für jedes Stadtmobiliar, das spricht, piept, absichtsvoll leuchtet oder auf sonstige Weise ein Gespräch anstrebt, insbesondere für Bänke.")
    ] },
    { n: 2, title: P("Definitions", "Begriffsbestimmungen"), fixed: [
      P("Bench: a seat for at least two persons who do not know each other.", "Bank: eine Sitzgelegenheit für mindestens zwei Personen, die einander nicht kennen."),
      P("Opening: the first sentence. As a rule, about the weather.", "Gesprächseröffnung: der erste Satz. In der Regel über das Wetter."),
      P("Weather: an external party. Not liable.", "Wetter: eine externe Partei. Nicht haftbar.")
    ] },
    { n: 3, title: P("Addressing", "Ansprache"), clauses: [
      { id: "s3.1", t: P("A bench may greet people who sit down on it.", "Eine Bank darf Personen grüßen, die sich auf sie setzen."),
        c: ["pigeon", P("Nobody greets me.", "Mich grüßt keiner.")] },
      { id: "s3.2", t: P("A bench may open a conversation with a remark about the weather.", "Eine Bank darf ein Gespräch mit einer Bemerkung über das Wetter eröffnen."),
        c: ["weather", P("The weather declines to comment.", "Das Wetter nimmt dazu keine Stellung.")] },
      { id: "s3.3", t: P("A bench may ask for your first name.", "Eine Bank darf nach Ihrem Vornamen fragen."),
        c: ["tree", P("In 63 years, nobody has asked for mine.", "In 63 Jahren hat mich niemand nach meinem gefragt.")] },
      { id: "s3.4", t: P("After 20 minutes, a bench may switch from the formal “Sie” to the informal “du”.", "Eine Bank darf nach 20 Minuten vom „Sie“ zum „Du“ wechseln."),
        c: ["bench", P("Twenty minutes is reasonable. I have known some people for twelve years and we still say “Sie”.", "Zwanzig Minuten sind angemessen. Manche Leute kenne ich seit zwölf Jahren, und wir siezen uns immer noch.")] },
      { id: "s3.5", t: P("A bench may introduce two strangers to each other.", "Eine Bank darf zwei Fremde einander vorstellen."),
        c: ["minutes", P("This is the core question of the project: does the bench help strangers meet, or does it do the awkward part for them?", "Das ist die Kernfrage des Projekts: Hilft die Bank Fremden, sich zu begegnen, oder übernimmt sie den unangenehmen Teil für sie?")] },
      { id: "s3.6", t: P("A bench shall remain silent towards anyone wearing headphones.", "Gegenüber Personen mit Kopfhörern hat eine Bank zu schweigen."),
        c: ["pigeon", P("Agreed. I ignore them as well.", "Einverstanden. Ich ignoriere die auch.")] }
    ] },
    { n: 4, title: P("Times", "Zeiten"), clauses: [
      { id: "s4.1", t: P("A bench shall not start a conversation before 7:00.", "Vor 7:00 Uhr darf eine Bank kein Gespräch beginnen."),
        c: ["bench", P("Before seven, I am not available either.", "Vor sieben bin ich selbst nicht ansprechbar.")] },
      { id: "s4.2", t: P("A bench may only speak when the tram is more than 10 minutes late.", "Eine Bank darf nur sprechen, wenn die Bahn mehr als 10 Minuten Verspätung hat."),
        c: ["bench", P("In practice, this means always.", "In der Praxis bedeutet das: immer.")] },
      { id: "s4.3", t: P("When the tram arrives, a bench shall fall silent, even mid-sentence.", "Fährt die Bahn ein, hat die Bank zu verstummen, auch mitten im Satz."),
        c: ["tree", P("Rude, but correct.", "Unhöflich, aber korrekt.")] },
      { id: "s4.4", t: P("On Sundays and public holidays, benches observe quiet hours.", "An Sonn- und Feiertagen gilt für Bänke die Ruhezeit."),
        c: ["pigeon", P("Pigeons do not observe Sundays.", "Tauben kennen keinen Sonntag.")] }
    ] },
    { n: 5, title: P("Content", "Inhalte"), clauses: [
      { id: "s5.1", t: P("A bench may complain about the weather together with you.", "Eine Bank darf sich gemeinsam mit Ihnen über das Wetter beschweren."),
        c: ["weather", P("The weather is currently not reachable.", "Das Wetter ist derzeit nicht erreichbar.")] },
      { id: "s5.2", t: P("A bench may comment on what you are wearing.", "Eine Bank darf Ihre Kleidung kommentieren."),
        c: ["tree", P("I have worn the same thing since 1963.", "Ich trage seit 1963 dasselbe.")] },
      { id: "s5.3", t: P("A bench may tell jokes.", "Eine Bank darf Witze erzählen."),
        c: ["pigeon", P("Only about humans.", "Nur über Menschen.")] },
      { id: "s5.4", t: P("A bench may give you advice about your love life.", "Eine Bank darf Ihnen Ratschläge zu Ihrem Liebesleben geben."),
        c: ["bench", P("I have overheard a great deal.", "Ich habe schon sehr viel mitgehört.")] },
      { id: "s5.5", t: P("A bench may tell you that the person next to you seems lonely.", "Eine Bank darf Ihnen sagen, dass die Person neben Ihnen einsam wirkt."),
        c: ["minutes", P("Not a joke. In Germany, 18 to 29-year-olds carry the highest loneliness burden (Einsamkeitsbarometer 2024).", "Kein Witz. In Deutschland tragen die 18- bis 29-Jährigen die höchste Einsamkeitsbelastung (Einsamkeitsbarometer 2024).")] },
      { id: "s5.6", t: P("A bench may recommend products and services.", "Eine Bank darf Produkte und Dienstleistungen empfehlen."),
        c: ["minutes", P("Whoever pays for the bench may want to sell you the first sentence.", "Wer die Bank bezahlt, möchte Ihnen vielleicht den ersten Satz verkaufen.")] }
    ] },
    { n: 6, title: P("Data", "Daten"), clauses: [
      { id: "s6.1", t: P("A bench may recognise you the next day.", "Eine Bank darf Sie am nächsten Tag wiedererkennen."),
        c: ["pigeon", P("I recognise everyone who carries bread.", "Ich erkenne jeden wieder, der Brot dabeihat.")] },
      { id: "s6.2", t: P("A bench may count how many strangers started talking, without recording them.", "Eine Bank darf zählen, wie viele Fremde ins Gespräch gekommen sind, ohne sie aufzuzeichnen."),
        c: ["bench", P("Current count: eleven.", "Aktueller Stand: elf.")] },
      { id: "s6.3", t: P("A bench may report to the city how often people sat next to each other in silence.", "Eine Bank darf der Stadt melden, wie oft Menschen schweigend nebeneinander saßen."),
        c: ["tree", P("The city knows. It just doesn’t ask.", "Die Stadt weiß es. Sie fragt nur nicht.")] }
    ] },
    { n: 7, title: P("Non-human parties", "Nicht-menschliche Beteiligte"), clauses: [
      { id: "s7.1", t: P("A bench may speak on behalf of the tree behind it.", "Eine Bank darf im Namen des Baumes hinter ihr sprechen."),
        c: ["tree", P("Finally.", "Endlich.")] },
      { id: "s7.2", t: P("Pigeons have the same right to a seat as people.", "Tauben haben dasselbe Recht auf einen Sitzplatz wie Menschen."),
        c: ["pigeon", P("I would like that in writing.", "Das hätte ich gern schriftlich.")] },
      { id: "s7.3", t: P("A bench may ask you to make room for a dog.", "Eine Bank darf Sie bitten, für einen Hund Platz zu machen."),
        c: ["pigeon", P("And for pigeons?", "Und für Tauben?")] },
      { id: "s7.4", t: P("A bench may file complaints with the weather on your behalf.", "Eine Bank darf in Ihrem Namen Beschwerden beim Wetter einreichen."),
        c: ["weather", P("Processing time: undetermined.", "Bearbeitungszeit: unbestimmt.")] }
    ] },
    { n: 8, title: P("Final provisions", "Schlussbestimmungen"), fixed: [
      P("Disputes are settled by the weather. The weather is not reachable.", "Streitigkeiten entscheidet das Wetter. Das Wetter ist nicht erreichbar."),
      P("This code enters into force as soon as the first bench speaks.", "Dieser Kodex tritt in Kraft, sobald die erste Bank spricht.")
    ] }
  ];

  /* Comments for paragraphs proposed by the public (rotated). */
  var MOTION_COMMENTS = [
    ["pigeon", P("The pigeon has taken note.", "Die Taube hat das zur Kenntnis genommen.")],
    ["tree", P("The plane tree will think about it. It may take a few years.", "Die Platane denkt darüber nach. Das kann ein paar Jahre dauern.")],
    ["weather", P("The weather could not be reached for comment.", "Das Wetter war für eine Stellungnahme nicht erreichbar.")]
  ];

  var clauses = [];
  SECTIONS.forEach(function (s) { (s.clauses || []).forEach(function (c) { c.section = s.n; clauses.push(c); }); });

  global.BenchCode = { P: P, COUNCIL: COUNCIL, WHO: WHO, MEMBERS: MEMBERS, PREAMBLE: PREAMBLE, SECTIONS: SECTIONS, CLAUSES: clauses, MOTION_COMMENTS: MOTION_COMMENTS };
})(window);
