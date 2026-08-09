/* analytics-config.js */
window.KREDITOR_ANALYTICS = {
  yandexMetrikaId: 110621481,
  consentKey: "kreditor_analytics_consent"
};

/* consent-aware yandex-metrika.js */
(function (window, document) {
  "use strict";

  var config = window.KREDITOR_ANALYTICS || {};
  var counterId = Number(config.yandexMetrikaId);
  var consentKey = config.consentKey || "kreditor_analytics_consent";
  var initialized = false;

  function hasConsent() {
    try { return window.localStorage.getItem(consentKey) === "accepted"; }
    catch { return false; }
  }

  function init() {
    if (initialized || !Number.isInteger(counterId) || counterId <= 0 || !hasConsent()) return;
    initialized = true;

    (function (m, e, t, r, i, k, a) {
      m[i] = m[i] || function () {
        (m[i].a = m[i].a || []).push(arguments);
      };
      m[i].l = 1 * new Date();
      k = e.createElement(t);
      a = e.getElementsByTagName(t)[0];
      k.async = true;
      k.src = r;
      k.referrerPolicy = "strict-origin-when-cross-origin";
      a.parentNode.insertBefore(k, a);
    })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

    window.ym(counterId, "init", {
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
      webvisor: window.location.hostname !== 'localhost'
    });
  }

  window.KreditorAnalytics = { init: init, hasConsent: hasConsent };
  init();
})(window, document);
