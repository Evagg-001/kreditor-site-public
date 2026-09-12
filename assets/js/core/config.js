(function (window) {
  "use strict";

  const config = Object.freeze({
    appName: "KREDITOR Platform",
    version: "18.0.0",
    environment: "production",

    api: Object.freeze({
      baseUrl: "",
      leadEndpoint: "",
      timeoutMs: 10000
    }),

    analytics: Object.freeze({
      provider: "yandex",
      counterId: 111984123,
      consentKey: "kreditor_analytics_consent",
      webvisor: false
    }),

    security: Object.freeze({
      allowExternalRedirects: false,
      storeSensitiveDataInBrowser: false
    }),

    features: Object.freeze({
      analytics: true,
      leadGateway: false,
      clientPortal: false,
      aiAssistant: false
    })
  });

  window.KreditorConfig = config;
})(window);