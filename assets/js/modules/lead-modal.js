(function (window, document) {
  "use strict";

  const OPEN_SELECTOR = [
    "[data-open-modal]",
    "[data-open-lead]",
    ".js-open-lead",
    ".header-cta",
    ".desktop-sticky-main"
  ].join(",");

  const CLOSE_SELECTOR = [
    "[data-close-modal]",
    ".modal-close"
  ].join(",");

  let initialized = false;

  function getModal() {
    return document.querySelector("#lead-modal");
  }

  function open() {
    const modal = getModal();

    if (!modal) {
      console.error("[KREDITOR LeadModal] #lead-modal не найден");
      return false;
    }

    if (modal.open) {
      return true;
    }

    if (typeof modal.showModal === "function") {
      modal.showModal();
    } else {
      modal.setAttribute("open", "");
    }

    return true;
  }

  function close() {
    const modal = getModal();

    if (!modal) {
      return false;
    }

    if (typeof modal.close === "function" && modal.open) {
      modal.close();
    } else {
      modal.removeAttribute("open");
    }

    return true;
  }

  function handleClick(event) {
    if (!(event.target instanceof Element)) {
      return;
    }

    const closeButton = event.target.closest(CLOSE_SELECTOR);

    if (closeButton) {
      event.preventDefault();
      event.stopImmediatePropagation();
      close();
      return;
    }

    const openButton = event.target.closest(OPEN_SELECTOR);

    if (openButton) {
      event.preventDefault();
      event.stopImmediatePropagation();
      open();
    }
  }

  function handleCancel(event) {
    event.preventDefault();
    close();
  }

  function initialize() {
    if (initialized) {
      return;
    }

    initialized = true;

    document.addEventListener("click", handleClick, true);

    const modal = getModal();

    if (modal) {
      modal.addEventListener("cancel", handleCancel);
    }
  }

  window.KreditorLeadModal = Object.freeze({
    initialize,
    open,
    close
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})(window, document);
