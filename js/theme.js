/* Theme picker. The choice is remembered on this device only. */
(function () {
  "use strict";
  var root = document.documentElement, KEY = "wb-theme";
  var BG = { spring: "#f7f9f2", summer: "#fffaf0", autumn: "#f6efe7", winter: "#0f151d" };
  function apply(t) {
    if (t && t !== "system" && BG[t]) root.setAttribute("data-theme", t); else root.removeAttribute("data-theme");
    var metas = document.querySelectorAll('meta[name="theme-color"]');
    for (var i = 0; i < metas.length; i++) {
      if (!metas[i].dataset.c) metas[i].dataset.c = metas[i].content;
      metas[i].content = BG[t] || metas[i].dataset.c;
    }
  }
  var ICON = {
    system: '<circle cx="8" cy="8" r="6"/><path d="M8 2v12" /><path d="M8 2a6 6 0 0 1 0 12z" fill="currentColor" stroke="none"/>',
    spring: '<path d="M8 15V8"/><path d="M8 9C8 6 6 4 3 4c0 3 2 5 5 5zM8 8c0-3 2-5 5-5 0 3-2 5-5 5z"/>',
    summer: '<circle cx="8" cy="8" r="3"/><path d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1 1M11.6 11.6l1 1M3.4 12.6l1-1M11.6 4.4l1-1"/>',
    autumn: '<path d="M3 13C3 7 7 3 13 3c0 6-4 10-10 10z"/><path d="M3 13l6-6"/>',
    winter: '<path d="M8 1.5v13M2.4 4.75l11.2 6.5M2.4 11.25l11.2-6.5M6.5 2.5 8 4l1.5-1.5M6.5 13.5 8 12l1.5 1.5"/>'
  };
  function icon(t) {
    document.querySelectorAll(".theme svg").forEach(function (svg) { svg.style.color = "var(--fg)"; svg.innerHTML = ICON[t] || ICON.system; });
  }
  var saved = "system";
  try { saved = localStorage.getItem(KEY) || "system"; } catch (e) {}
  apply(saved); icon(BG[saved] ? saved : "system");
  document.querySelectorAll("[data-theme-picker]").forEach(function (sel) {
    sel.value = BG[saved] ? saved : "system";
    sel.addEventListener("change", function () {
      apply(sel.value); icon(sel.value);
      try { localStorage.setItem(KEY, sel.value); } catch (e) {}
    });
  });
})();
