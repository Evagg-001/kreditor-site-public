(function (window, document) {
  "use strict";

  let initialized = false;

  function initialize() {
    if (initialized) {
      return false;
    }

    const menuButton = document.querySelector(".menu-toggle");
    const navigation = document.querySelector("#main-nav");

    if (!menuButton || !navigation) {
      return false;
    }

    function setMenuState(isOpen) {
      navigation.classList.toggle("open", isOpen);
      menuButton.setAttribute("aria-expanded", String(isOpen));
    }

    function closeMenu() {
      setMenuState(false);
    }

    function toggleMenu() {
      const isOpen = !navigation.classList.contains("open");
      setMenuState(isOpen);
    }

    menuButton.addEventListener("click", toggleMenu);

    navigation.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeMenu();
      }
    });

    initialized = true;
    return true;
  }

  window.KreditorNavigation = Object.freeze({
    initialize
  });
})(window, document);