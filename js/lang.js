/* Language: English by default, German on request. Remembered on this device only. */
(function (global) {
  "use strict";
  var listeners = [];
  function getLang() { return document.documentElement.getAttribute("data-lang") === "de" ? "de" : "en"; }
  function apply(l) {
    var root = document.documentElement;
    root.setAttribute("data-lang", l);
    root.setAttribute("lang", l);
    var t = root.getAttribute("data-title-" + l);
    if (t) document.title = t;
    document.querySelectorAll("[data-en]").forEach(function (el) {
      var v = el.getAttribute("data-" + l), attr = el.getAttribute("data-i18n-attr");
      if (attr) el.setAttribute(attr, v); else el.textContent = v;
    });
    document.querySelectorAll(".lang-switch button").forEach(function (b) {
      b.setAttribute("aria-pressed", b.value === l ? "true" : "false");
    });
  }
  function setLang(l) {
    l = l === "de" ? "de" : "en";
    try { localStorage.setItem("wb-lang", l); } catch (e) {}
    apply(l);
    listeners.forEach(function (fn) { fn(l); });
  }
  function init() {
    apply(getLang());
    document.querySelectorAll(".lang-switch button").forEach(function (b) {
      b.addEventListener("click", function () { setLang(b.value); });
    });
  }
  global.Lang = { get: getLang, set: setLang, init: init, on: function (fn) { listeners.push(fn); }, t: function (pair) { return pair[getLang()] || pair.en; } };
})(window);
