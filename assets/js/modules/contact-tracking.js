(function (window, document) {
  "use strict";

  function initialize() {

    if (typeof window.track !== "function") {
      return;
    }

    document.querySelectorAll('a[href^="tel:"]').forEach(function (a) {
      a.addEventListener("click", function () {
        window.track("click_phone", {
          page: location.pathname
        });
      });
    });

    document.querySelectorAll('a[href*="wa.me"]').forEach(function (a) {
      a.addEventListener("click", function () {
        window.track("click_whatsapp", {
          page: location.pathname
        });
      });
    });

    document.querySelectorAll('a[href*="t.me"]').forEach(function (a) {
      a.addEventListener("click", function () {
        window.track("click_telegram", {
          page: location.pathname
        });
      });
    });

    document.querySelectorAll('a[href^="mailto:"]').forEach(function (a) {
      a.addEventListener("click", function () {
        window.track("click_email", {
          page: location.pathname
        });
      });
    });

    document.querySelectorAll("[data-contact-channel]").forEach(function (link) {
      link.addEventListener("click", function () {
        window.track("modal_contact_click", {
          page: location.pathname,
          channel: link.dataset.contactChannel || "unknown"
        });
      });
    });

    document.querySelectorAll(".mobile-contact-bar [data-contact-channel]").forEach(function (link) {
      link.addEventListener("click", function () {
        window.track("mobile_contact_click", {
          page: location.pathname,
          channel: link.dataset.contactChannel || "unknown"
        });
      });
    });

  }

  window.KreditorContactTracking = {
    initialize: initialize
  };

})(window, document);
