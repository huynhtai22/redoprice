/* RedoPrice calculator widget: auto-resizes RedoPrice iframes on the host page. Optional. */
(function () {
  window.addEventListener("message", function (e) {
    if (!e.data || e.data.type !== "redoprice:height" || !/redoprice\.com$|vercel\.app$|localhost/.test(new URL(e.origin).hostname)) return;
    var frames = document.querySelectorAll("iframe[data-redoprice]");
    for (var i = 0; i < frames.length; i++) if (frames[i].contentWindow === e.source) frames[i].style.height = Math.ceil(e.data.h) + "px";
  });
})();
