(function (window, document) {
  "use strict";

  const ALLOWED_PROTOCOLS = Object.freeze([
    "https:",
    "http:",
    "mailto:",
    "tel:"
  ]);

function normalizeText(value, maxLength = 1000) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .split("\0")
    .join("")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
  }

  function isSafeUrl(value, options = {}) {
    if (typeof value !== "string" || !value.trim()) {
      return false;
    }

    try {
      const url = new URL(value, window.location.origin);

      if (!ALLOWED_PROTOCOLS.includes(url.protocol)) {
        return false;
      }

      if (
        options.sameOrigin === true &&
        url.origin !== window.location.origin
      ) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  function safeOpen(value, options = {}) {
    if (!isSafeUrl(value, options)) {
      return false;
    }

    const target = options.target === "_self" ? "_self" : "_blank";

    if (target === "_self") {
      window.location.assign(value);
      return true;
    }

    const openedWindow = window.open(
      value,
      "_blank",
      "noopener,noreferrer"
    );

    if (openedWindow) {
      openedWindow.opener = null;
    }

    return Boolean(openedWindow);
  }

  function setText(element, value, maxLength = 1000) {
    if (!(element instanceof Element)) {
      return false;
    }

    element.textContent = normalizeText(value, maxLength);
    return true;
  }

  function protectExternalLinks(root = document) {
    const links = root.querySelectorAll('a[target="_blank"]');

    links.forEach(function protectLink(link) {
      const relValues = new Set(
        (link.getAttribute("rel") || "")
          .split(/\s+/)
          .filter(Boolean)
      );

      relValues.add("noopener");
      relValues.add("noreferrer");

      link.setAttribute("rel", [...relValues].join(" "));
    });

    return links.length;
  }

  function initialize() {
    protectExternalLinks();
    return true;
  }

  window.KreditorSecurity = Object.freeze({
    normalizeText,
    isSafeUrl,
    safeOpen,
    setText,
    protectExternalLinks,
    initialize
  });
})(window, document);