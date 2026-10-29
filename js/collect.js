/* Wetterbank research site: data client.
   Sends nothing unless (a) Supabase is configured in js/config.js and
   (b) the participant has given consent in this session.
   No cookies. No IP addresses are stored by this code. */
(function (global) {
  "use strict";
  var C = global.WB_CONFIG || {};
  var configured = !!(C.supabaseUrl && C.supabaseAnonKey);

  function headers() {
    return {
      "Content-Type": "application/json",
      "apikey": C.supabaseAnonKey,
      "Authorization": "Bearer " + C.supabaseAnonKey,
      "Prefer": "return=minimal"
    };
  }

  function post(path, body) {
    if (!configured) return Promise.resolve({ ok: false, preview: true });
    return fetch(C.supabaseUrl.replace(/\/$/, "") + "/rest/v1/" + path, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(body),
      keepalive: true
    }).then(function (r) { return { ok: r.ok, status: r.status }; })
      .catch(function () { return { ok: false }; });
  }

  function uuid() {
    if (global.crypto && crypto.randomUUID) return crypto.randomUUID();
    var b = new Uint8Array(16);
    (global.crypto || global.msCrypto).getRandomValues(b);
    b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128;
    var h = Array.prototype.map.call(b, function (x) { return (x + 256).toString(16).slice(1); }).join("");
    return h.slice(0, 8) + "-" + h.slice(8, 12) + "-" + h.slice(12, 16) + "-" + h.slice(16, 20) + "-" + h.slice(20);
  }

  /* Only the referring site's host name, e.g. "linkedin.com". Never the full URL. */
  function referrerHost() {
    try {
      if (!document.referrer) return null;
      var h = new URL(document.referrer).hostname.replace(/^www\./, "");
      return h === location.hostname ? null : h.slice(0, 80);
    } catch (e) { return null; }
  }

  function device() {
    return matchMedia("(pointer: coarse)").matches ? "touch" : "pointer";
  }

  function params() {
    var p = new URLSearchParams(location.search);
    return { test: p.has("test"), source: (p.get("src") || "").slice(0, 40) || null };
  }

  global.WBCollect = {
    configured: configured,
    uuid: uuid,
    /* Called when someone sits down (with consent). */
    start: function (s) {
      var p = params();
      return post("wb_sessions", {
        id: s.id,
        study_version: C.studyVersion || null,
        lang: s.lang,
        bench: s.bench,
        stranger: s.stranger,
        repeat_visit: !!s.repeat,
        device: device(),
        referrer: referrerHost(),
        source: p.source,
        is_test: p.test
      });
    },
    /* Called once at the end, with the encounter log and the answers. */
    finish: function (s) {
      return post("wb_results", {
        session_id: s.id,
        outcome: s.outcome,
        events: s.events,
        survey: s.survey,
        open_text: s.openText || null,
        duration_ms: s.durationMs
      });
    },
    /* Aggregate numbers only. Returns null in preview mode or on error. */
    stats: function () {
      if (!configured) return Promise.resolve(null);
      return fetch(C.supabaseUrl.replace(/\/$/, "") + "/rest/v1/rpc/wb_stats", {
        method: "POST", headers: headers(), body: "{}"
      }).then(function (r) { return r.ok ? r.json() : null; })
        .catch(function () { return null; });
    },
    minResults: C.minResultsToShow || 20
  };
})(window);
