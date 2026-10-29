/* The consultation's data client.
   Votes and motions are anonymous. A random session ID (kept only for this browser tab)
   groups one person's votes; it is not linked to anything else. No cookies.
   Nothing is sent when Supabase is not configured (preview mode). */
(function (global) {
  "use strict";
  var C = global.WB_CONFIG || {};
  var configured = !!(C.supabaseUrl && C.supabaseAnonKey);
  var base = configured ? C.supabaseUrl.replace(/\/$/, "") + "/rest/v1/" : "";

  function uuid() {
    if (global.crypto && crypto.randomUUID) return crypto.randomUUID();
    var b = new Uint8Array(16); crypto.getRandomValues(b);
    b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128;
    var h = Array.prototype.map.call(b, function (x) { return (x + 256).toString(16).slice(1); }).join("");
    return h.slice(0, 8) + "-" + h.slice(8, 12) + "-" + h.slice(12, 16) + "-" + h.slice(16, 20) + "-" + h.slice(20);
  }
  var session = (function () {
    try { var s = sessionStorage.getItem("bc-session"); if (s) return s; s = uuid(); sessionStorage.setItem("bc-session", s); return s; }
    catch (e) { return uuid(); }
  })();

  var params = new URLSearchParams(location.search);
  var isTest = params.has("test");

  function headers() {
    return { "Content-Type": "application/json", "apikey": C.supabaseAnonKey, "Authorization": "Bearer " + C.supabaseAnonKey, "Prefer": "return=minimal" };
  }
  function post(table, body) {
    if (!configured) return Promise.resolve({ ok: false, preview: true });
    return fetch(base + table, { method: "POST", headers: headers(), body: JSON.stringify(body), keepalive: true })
      .then(function (r) { return { ok: r.ok, status: r.status }; })
      .catch(function () { return { ok: false }; });
  }

  function referrerHost() {
    try {
      if (!document.referrer) return null;
      var h = new URL(document.referrer).hostname.replace(/^www\./, "");
      return h === location.hostname ? null : h.slice(0, 80);
    } catch (e) { return null; }
  }

  var visitSent = false;
  function visit(lang) {
    if (visitSent) return Promise.resolve();
    visitSent = true;
    return post("bc_visits", {
      session: session, draft: C.draft || null, lang: lang,
      device: matchMedia("(pointer: coarse)").matches ? "touch" : "pointer",
      referrer: referrerHost(), source: (params.get("src") || "").slice(0, 40) || null, is_test: isTest
    });
  }

  /* Remember locally which paragraphs this device has voted on, so they are not asked again. */
  function readLocal() { try { return JSON.parse(localStorage.getItem("bc-votes") || "{}"); } catch (e) { return {}; } }
  function writeLocal(v) { try { localStorage.setItem("bc-votes", JSON.stringify(v)); } catch (e) {} }

  global.Tally = {
    configured: configured,
    config: C,
    myVotes: readLocal,
    vote: function (clause, choice, lang) {
      var mine = readLocal(); mine[clause] = choice; writeLocal(mine);
      return visit(lang).then(function () {
        return post("bc_votes", { session: session, clause: clause, vote: choice, draft: C.draft || null, lang: lang, is_test: isTest });
      });
    },
    propose: function (section, body, lang) {
      return visit(lang).then(function () {
        return post("bc_motions", { session: session, section: String(section), body: body, lang: lang, is_test: isTest });
      });
    },
    /* Totals per paragraph and approved motions. Null in preview mode or on error. */
    load: function () {
      if (!configured) return Promise.resolve(null);
      return fetch(base + "rpc/bc_tally", { method: "POST", headers: headers(), body: "{}" })
        .then(function (r) { return r.ok ? r.json() : null; })
        .catch(function () { return null; });
    },
    /* Status of a paragraph from its counts. */
    status: function (n) {
      var f = (n && n.for) || 0, a = (n && n.against) || 0, decided = f + a;
      var pct = decided ? Math.round(100 * f / decided) : null;
      var st = "open";
      if (decided >= (C.decideMinVotes || 15)) st = pct >= (C.adoptAt || 60) ? "adopted" : pct <= (C.rejectAt || 40) ? "rejected" : "open";
      return { status: st, pct: pct, total: f + a + ((n && n.abstain) || 0), decided: decided };
    }
  };
})(window);
