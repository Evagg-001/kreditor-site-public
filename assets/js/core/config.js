(function (window) {
  "use strict";

  const config = Object.freeze({
    appName: "KREDITOR Platform",
    version: "26.2.0",
    environment: "production",

    api: Object.freeze({
      baseUrl: "",
      leadEndpoint: "/api/v1/leads",
      timeoutMs: 10000
    }),

    analytics: Object.freeze({
      provider: "yandex",
      counterId: 110621481,
      consentKey: "kreditor_analytics_consent",
      webvisor: true
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