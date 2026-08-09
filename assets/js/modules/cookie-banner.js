(function (window, document) {
  "use strict";

  let initialized = false;

  function readConsent(key) {
    try {
      return window.localStorage.getItem(key) || "";
    } catch (error) {
      console.warn("Cookie consent storage is unavailable.", error);
      return "";
    }
  }

  function writeConsent(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      console.warn("Cookie consent could not be saved.", error);
    }
  }

  function initialize() {
    if (initialized) {
      return false;
    }

    initialized = true;

    const cookie = document.querySelector("#cookie-banner");
    const consentKey =
      window.KREDITOR_ANALYTICS?.consentKey ||
      "kreditor_analytics_consent";
    const consentValue = readConsent(consentKey);

    function setPending(isPending) {
      document.body.classList.toggle(
        "cookie-consent-pending",
        Boolean(isPending)
      );
    }

    function finishChoice() {
      cookie?.classList.remove("show");
      setPending(false);
    }

    if (cookie && !consentValue) {
      setPending(true);
      window.setTimeout(() => cookie.classList.add("show"), 300);
    }

    document
      .querySelector("#cookie-accept")
      ?.addEventListener("click", () => {
        writeConsent(consentKey, "accepted");
        finishChoice();
        window.KreditorAnalytics?.init?.();
        window.KreditorAnalytics?.track?.("cookie_accept");
      });

    document
      .querySelector("#cookie-reject")
      ?.addEventListener("click", () => {
        writeConsent(consentKey, "rejected");
        finishChoice();
        window.KreditorAnalytics?.track?.("cookie_reject");
      });

    document.querySelectorAll("[data-year]").forEach((element) => {
      element.textContent = String(new Date().getFullYear());
    });

    return true;
  }

  window.KreditorCookieBanner = Object.freeze({
    initialize
  });
})(window, document);
