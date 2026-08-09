(function (window) {
  "use strict";

  const listeners = new Map();

  function isValidEventName(eventName) {
    return (
      typeof eventName === "string" &&
      eventName.trim().length > 0 &&
      eventName.length <= 100
    );
  }

  function on(eventName, handler) {
    if (!isValidEventName(eventName)) {
      throw new TypeError("Некорректное имя события.");
    }

    if (typeof handler !== "function") {
      throw new TypeError("Обработчик события должен быть функцией.");
    }

    const handlers = listeners.get(eventName) || new Set();
    handlers.add(handler);
    listeners.set(eventName, handlers);

    return function unsubscribe() {
      off(eventName, handler);
    };
  }

  function once(eventName, handler) {
    if (typeof handler !== "function") {
      throw new TypeError("Обработчик события должен быть функцией.");
    }

    const unsubscribe = on(eventName, function onceHandler(payload) {
      unsubscribe();
      handler(payload);
    });

    return unsubscribe;
  }

  function off(eventName, handler) {
    const handlers = listeners.get(eventName);

    if (!handlers) {
      return false;
    }

    const removed = handlers.delete(handler);

    if (handlers.size === 0) {
      listeners.delete(eventName);
    }

    return removed;
  }

  function emit(eventName, payload) {
    if (!isValidEventName(eventName)) {
      return false;
    }

    const handlers = listeners.get(eventName);

    if (!handlers || handlers.size === 0) {
      return false;
    }

    [...handlers].forEach(function executeHandler(handler) {
      try {
        handler(payload);
      } catch (error) {
        console.error(
          "[KREDITOR EventBus] Ошибка обработчика:",
          eventName,
          error
        );
      }
    });

    return true;
  }

  function clear(eventName) {
    if (typeof eventName === "undefined") {
      listeners.clear();
      return true;
    }

    if (!isValidEventName(eventName)) {
      return false;
    }

    return listeners.delete(eventName);
  }

  window.KreditorEvents = Object.freeze({
    on,
    once,
    off,
    emit,
    clear
  });
})(window);