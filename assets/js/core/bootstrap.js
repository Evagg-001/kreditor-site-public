(function (window, document) {
  "use strict";

  let started = false;

  function assertDependency(name, dependency) {
    if (!dependency) {
      throw new Error(
        `[KREDITOR Bootstrap] Не загружена зависимость: ${name}`
      );
    }
  }

  function initializeSecurity() {
    assertDependency("KreditorSecurity", window.KreditorSecurity);
    window.KreditorSecurity.initialize();
  }

  function initializeAnalytics() {
    const config = window.KreditorConfig;

    if (
      config &&
      config.features &&
      config.features.analytics === true &&
      window.KreditorAnalytics
    ) {
      window.KreditorAnalytics.init();
    }
  }

  function emitReadyEvent() {
    if (window.KreditorEvents) {
      window.KreditorEvents.emit("app:ready", {
        version:
          window.KreditorConfig?.version || "unknown",
        timestamp: new Date().toISOString()
      });
    }

    document.dispatchEvent(
      new CustomEvent("kreditor:ready", {
        detail: {
          version:
            window.KreditorConfig?.version || "unknown"
        }
      })
    );
  }

  function start() {
    if (started) {
      return false;
    }

    started = true;

    try {
      assertDependency("KreditorConfig", window.KreditorConfig);
      if (window.KreditorNavigation) {
  window.KreditorNavigation.initialize();
}

if (window.KreditorLeadModal) {
  window.KreditorLeadModal.initialize();
}

if (window.KreditorReveal) {
  window.KreditorReveal.initialize();
}

if (window.KreditorUTM) {
  window.KreditorUTM.initialize();
}
      if (window.KreditorCookieBanner) {
      window.KreditorCookieBanner.initialize();
    }

    if (window.KreditorContactTracking) {
      window.KreditorContactTracking.initialize();
    }

    if (window.KreditorLeadFlow) {
        window.KreditorLeadFlow.initialize();
    }

    initializeSecurity();
      initializeAnalytics();
      emitReadyEvent();

      return true;
    } catch (error) {
      started = false;

      console.error(
        "[KREDITOR Bootstrap] Ошибка запуска приложения:",
        error
      );

      document.dispatchEvent(
        new CustomEvent("kreditor:error", {
          detail: {
            type: "bootstrap",
            message: "Не удалось запустить клиентское приложение."
          }
        })
      );

      return false;
    }
  }

  function initializeWhenReady() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", start, {
        once: true
      });

      return;
    }

    start();
  }

  window.KreditorBootstrap = Object.freeze({
    start
  });

  initializeWhenReady();
})(window, document);