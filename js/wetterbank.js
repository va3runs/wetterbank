/* Wetterbank: shared lines and weather logic.
   Nothing here sends or stores what people type. The only network call is
   the weather request to Open-Meteo (no key, no account). */
(function (global) {
  "use strict";

  var CITIES = {
    duesseldorf: { name: "Düsseldorf", lat: 51.2277, lon: 6.7735 },
    koeln: { name: "Köln", lat: 50.9375, lon: 6.9603 },
    essen: { name: "Essen", lat: 51.4556, lon: 7.0116 },
    hannover: { name: "Hannover", lat: 52.3759, lon: 9.732 },
    berlin: { name: "Berlin", lat: 52.52, lon: 13.405 },
    hamburg: { name: "Hamburg", lat: 53.5511, lon: 9.9937 },
    muenchen: { name: "München", lat: 48.1351, lon: 11.582 },
    frankfurt: { name: "Frankfurt", lat: 50.1109, lon: 8.6821 }
  };

  /* The 21 complaint replies from the original demo. */
  var REPLIES = [
    ["Ihre Beschwerde wurde an das Wetter weitergeleitet. Bearbeitungszeit: unbestimmt.", "Your complaint has been forwarded to the weather. Processing time: undetermined."],
    ["Wir haben Ihr Anliegen aufgenommen. Das Wetter ist derzeit nicht erreichbar.", "We have registered your concern. The weather is currently unavailable."],
    ["Sie sind nicht allein: Heute haben sich schon 17 Personen beschwert. Wie heißen Sie?", "You are not alone: 17 people have already complained today. What is your name?"],
    ["Das Wetter hat Ihre Beschwerde gelesen und nimmt keine Stellung.", "The weather has read your complaint and declines to comment."],
    ["Ihre Beschwerde wurde an die zuständige Wolke weitergeleitet. Die Wolke ist im Urlaub.", "Your complaint has been forwarded to the responsible cloud. The cloud is on holiday."],
    ["Danke für Ihr Feedback. Leider können wir weder Regen noch Sonne garantieren.", "Thank you for your feedback. Unfortunately we can guarantee neither rain nor sun."],
    ["Ihr Anliegen wurde als „gefühlt kälter als gemessen“ eingestuft. Eine Antwort ist nicht vorgesehen.", "Your concern has been classified as “feels colder than measured”. A reply is not planned."],
    ["Ihre Beschwerde ist die dritte zu diesem Thema heute. Die Person neben Ihnen hat dieselbe eingereicht.", "Your complaint is the third on this topic today. The person next to you filed the same one."],
    ["Wir verstehen Sie. Dem Wetter ist das egal. Möchten Sie darüber sprechen?", "We understand. The weather does not care. Would you like to talk about it?"],
    ["Vielen Dank. Ihre Beschwerde wurde in Ordnung abgelegt, Ordner: „Schon wieder Montag“.", "Thank you. Your complaint has been filed, folder: “Monday again”."],
    ["Bitte warten Sie. Sie sind Nummer 212 in der Warteschlange. Vielleicht kennen Sie die Nummer 211?", "Please wait. You are number 212 in the queue. Perhaps you know number 211?"],
    ["Beschwerde abgelehnt: Das Wetter ist heute leider genau so, wie es ist. Wie heißen Sie?", "Complaint rejected: today the weather is, unfortunately, exactly as it is. What is your name?"],
    ["Ihre Beschwerde wurde angenommen. Die Person neben Ihnen beschwert sich auch. Fragen Sie nach dem Namen.", "Your complaint has been accepted. The person next to you is complaining too. Ask for their name."],
    ["Gemeinsam meckert es sich besser. Wie heißen Sie denn?", "Grumbling is better together. So what is your name?"],
    ["Das Wetter können wir nicht ändern, aber Ihren Tag. Fangen Sie mit Ihrem Namen an.", "We cannot change the weather, but we can change your day. Start with your name."],
    ["Beschwerde bearbeitet. Leider fehlt uns noch Ihr Name. Wie heißen Sie?", "Complaint processed. Unfortunately we are still missing your name. What is your name?"],
    ["Das Wetter lässt ausrichten: Reden Sie lieber mit jemandem, der antwortet. Wie heißen Sie?", "The weather asks us to pass on: talk to someone who answers. What is your name?"],
    ["Bis zur Antwort können Sie sich der nächsten Person auf der Bank vorstellen. Das geht schneller.", "While you wait for an answer, you can introduce yourself to the next person on the bench. It is faster."],
    ["Sie klingen, als hätten Sie mehr auf dem Herzen als das Wetter. Wie heißen Sie?", "You sound like you have more on your mind than the weather. What is your name?"],
    ["Ihre Beschwerde ist uns wichtig. Ihr Name auch. Wie heißen Sie?", "Your complaint is important to us. So is your name. What is your name?"],
    ["Beschwerde eingegangen. Tipp: Wer zusammen friert, kann sich auch vorstellen.", "Complaint received. Tip: people who freeze together can also introduce themselves."]
  ];

  /* Replies that use today's weather. {t} temperature, {f} feels like, {c} condition, {city} place. */
  var WEATHER_REPLIES = [
    ["Bei {t} Grad und {c} ist Ihre Beschwerde formal korrekt. Wie heißen Sie?", "At {t} degrees and {c_en}, your complaint is formally correct. What is your name?"],
    ["Wir haben in {city} nachgemessen: {t} Grad, gefühlt {f}. Sie haben recht. Die Person neben Ihnen auch.", "We measured in {city}: {t} degrees, feels like {f}. You are right. So is the person next to you."],
    ["Ihre Beschwerde über {c} wurde gebündelt mit 43 weiteren aus {city}. Eine davon sitzt neben Ihnen.", "Your complaint about {c_en} has been bundled with 43 others from {city}. One of them is sitting next to you."]
  ];

  /* Openers per condition. Mode 1: the safest sentence there is. */
  var OPENERS = {
    clear: [
      ["Sonne, {t} Grad. Man weiß gar nicht, worüber man sich beschweren soll.", "Sun, {t} degrees. One hardly knows what to complain about."],
      ["Schönes Wetter heute. Wir sagen es nur einmal, sonst wird es seltsam.", "Nice weather today. We say it only once, otherwise it gets strange."],
      ["Sonnig in {city}. Die Person neben Ihnen hat es auch bemerkt. Sagen Sie es ihr.", "Sunny in {city}. The person next to you has noticed too. Tell them."]
    ],
    night: [
      ["Klarer Himmel, {t} Grad. Zu dunkel für Sonnenbrillen, hell genug für ein Hallo.", "Clear sky, {t} degrees. Too dark for sunglasses, bright enough for a hello."],
      ["Sternenklar über {city}. Romantisch, sagen manche. Kalt, sagen andere. Was sagen Sie?", "Starry sky over {city}. Romantic, some say. Cold, say others. What do you say?"]
    ],
    partly: [
      ["Heiter bis wolkig. Also: Man weiß es nicht. Wie immer.", "Fair to cloudy. In other words: nobody knows. As usual."],
      ["Mal Sonne, mal Wolke. Wie ein Gespräch, das noch nicht angefangen hat.", "Some sun, some cloud. Like a conversation that has not started yet."]
    ],
    overcast: [
      ["Bedeckt, {t} Grad. „Typisch“, würde man sagen. Sagen Sie es ruhig.", "Overcast, {t} degrees. “Typical”, one might say. Go ahead and say it."],
      ["Grau in Grau. Wir hätten da noch einen Platz frei.", "Grey on grey. We happen to have a seat free."]
    ],
    fog: [
      ["Nebel. Man sieht die Person neben sich kaum. Ein guter Moment, Hallo zu sagen.", "Fog. You can barely see the person next to you. A good moment to say hello."]
    ],
    drizzle: [
      ["Nieselregen. Nicht genug für einen Schirm, genug für eine Beschwerde.", "Drizzle. Not enough for an umbrella, enough for a complaint."],
      ["Es nieselt. Man nennt das hier auch „Schmuddelwetter“. Kennen Sie ein besseres Wort?", "It is drizzling. Around here they call it “Schmuddelwetter”. Do you know a better word?"]
    ],
    rain: [
      ["Regen, {t} Grad. Die Straßenbahn kommt bestimmt gleich. Bestimmt.", "Rain, {t} degrees. The tram is surely coming soon. Surely."],
      ["Es regnet. Das wussten Sie schon. Die Person neben Ihnen auch. Das ist ein Anfang.", "It is raining. You knew that. So does the person next to you. That is a start."]
    ],
    snow: [
      ["Schnee in {city}! Wir verzichten auf jeden Kommentar. Fast.", "Snow in {city}! We refrain from any comment. Almost."],
      ["Es schneit. Erwachsene Menschen dürfen sich darüber freuen. Auch laut.", "It is snowing. Grown-ups are allowed to be happy about it. Even out loud."]
    ],
    thunder: [
      ["Gewitter. Bitte nicht auf der Bank sitzen bleiben. Setzen Sie das Gespräch drinnen fort.", "Thunderstorm. Please do not stay on the bench. Continue the conversation indoors."]
    ],
    unknown: [
      ["Das Wetter ist derzeit nicht erreichbar. Fragen Sie doch die Person neben Ihnen, wie es draußen ist.", "The weather is currently unavailable. Why not ask the person next to you what it is like outside?"],
      ["Wir wissen gerade nicht, wie das Wetter ist. Sie schon. Erzählen Sie es jemandem.", "We do not know what the weather is like right now. You do. Tell someone."]
    ]
  };

  /* A second sentence, added when it fits. First match wins. */
  var EXTRAS = [
    { when: function (w) { return w.wind >= 35; }, line: ["Wind mit {w} km/h. Halten Sie Ihren Hut fest, nicht Ihre Meinung.", "Wind at {w} km/h. Hold on to your hat, not your opinion."] },
    { when: function (w) { return w.t - w.f >= 4; }, line: ["Gemessen {t} Grad, gefühlt {f}. Wir glauben Ihnen.", "Measured {t} degrees, feels like {f}. We believe you."] },
    { when: function (w) { return w.f <= 2; }, line: ["Die Bank ist übrigens auch kalt.", "The bench is cold too, by the way."] },
    { when: function (w) { return w.t >= 26; }, line: ["Bitte nicht alle gleichzeitig auf den Schattenplatz.", "Please do not all rush for the shady seat at once."] }
  ];

  var CONDITIONS = {
    clear: ["Klar", "clear"], night: ["Klar", "clear"], partly: ["Heiter bis wolkig", "fair to cloudy"],
    overcast: ["Bedeckt", "overcast"], fog: ["Nebel", "fog"], drizzle: ["Nieselregen", "drizzle"],
    rain: ["Regen", "rain"], snow: ["Schnee", "snow"], thunder: ["Gewitter", "thunderstorm"], unknown: ["Unbekannt", "unknown"]
  };
  /* Lower-case forms used inside sentences. */
  var CONDITIONS_INLINE = {
    clear: "klarem Himmel", night: "klarem Himmel", partly: "wechselnder Bewölkung", overcast: "Dauergrau",
    fog: "Nebel", drizzle: "Nieselregen", rain: "Regen", snow: "Schnee", thunder: "Gewitter", unknown: "unbekanntem Wetter"
  };

  function conditionKey(code, isDay) {
    if (code == null) return "unknown";
    if (code === 0 || code === 1) return isDay ? "clear" : "night";
    if (code === 2) return "partly";
    if (code === 3) return "overcast";
    if (code === 45 || code === 48) return "fog";
    if (code >= 51 && code <= 57) return "drizzle";
    if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
    if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snow";
    if (code >= 95) return "thunder";
    return "unknown";
  }

  function fill(s, w, city) {
    var key = w ? w.key : "unknown";
    return s
      .replace(/\{t\}/g, w ? w.t : "?")
      .replace(/\{f\}/g, w ? w.f : "?")
      .replace(/\{w\}/g, w ? w.wind : "?")
      .replace(/\{c_en\}/g, CONDITIONS[key][1])
      .replace(/\{c\}/g, CONDITIONS_INLINE[key])
      .replace(/\{city\}/g, city || "der Stadt");
  }

  function pick(list, avoid) {
    if (list.length === 1) return list[0];
    var i, tries = 0;
    do { i = Math.floor(Math.random() * list.length); tries++; } while (list[i] === avoid && tries < 8);
    return list[i];
  }

  function fetchWeather(lat, lon, signal) {
    var url = "https://api.open-meteo.com/v1/forecast?latitude=" + lat.toFixed(3) + "&longitude=" + lon.toFixed(3) +
      "&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,is_day&timezone=Europe%2FBerlin";
    return fetch(url, { signal: signal, cache: "no-store" }).then(function (r) {
      if (!r.ok) throw new Error("weather " + r.status);
      return r.json();
    }).then(function (d) {
      var c = d.current;
      var w = {
        t: Math.round(c.temperature_2m),
        f: Math.round(c.apparent_temperature),
        wind: Math.round(c.wind_speed_10m),
        code: c.weather_code,
        isDay: c.is_day === 1,
        time: c.time
      };
      w.key = conditionKey(w.code, w.isDay);
      w.label = CONDITIONS[w.key];
      return w;
    });
  }

  var lastOpener = null, lastReply = null, replyIndex = Math.floor(Math.random() * REPLIES.length);

  function opener(w, city) {
    var key = w ? w.key : "unknown";
    var base = pick(OPENERS[key], lastOpener);
    lastOpener = base;
    var de = fill(base[0], w, city), en = fill(base[1], w, city);
    if (w && Math.random() < 0.6) {
      for (var i = 0; i < EXTRAS.length; i++) {
        if (EXTRAS[i].when(w)) { de += " " + fill(EXTRAS[i].line[0], w, city); en += " " + fill(EXTRAS[i].line[1], w, city); break; }
      }
    }
    return { de: de, en: en };
  }

  function complaintReply(w, city) {
    var r;
    if (w && w.key !== "unknown" && Math.random() < 0.3) r = pick(WEATHER_REPLIES, lastReply);
    else { r = REPLIES[replyIndex % REPLIES.length]; replyIndex++; }
    lastReply = r;
    return { de: fill(r[0], w, city), en: fill(r[1], w, city), ref: "WB-" + (1000 + Math.floor(Math.random() * 9000)) };
  }

  /* The bench speaks, using an on-device German voice only. */
  function localGermanVoice() {
    if (!("speechSynthesis" in global)) return null;
    var vs = global.speechSynthesis.getVoices().filter(function (v) { return /^de(-|_|$)/i.test(v.lang) && v.localService; });
    return vs[0] || null;
  }
  function speak(text) {
    var v = localGermanVoice();
    if (!v) return false;
    global.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.voice = v; u.lang = v.lang; u.rate = 0.98;
    global.speechSynthesis.speak(u);
    return true;
  }

  global.Wetterbank = {
    cities: CITIES,
    fetchWeather: fetchWeather,
    opener: opener,
    complaintReply: complaintReply,
    conditions: CONDITIONS,
    localGermanVoice: localGermanVoice,
    speak: speak,
    replyCount: REPLIES.length
  };
})(window);
