(function (window) {
  "use strict";

  const PREFIX = "kreditor_";

  function getStorage(type) {
    if (type === "session") {
      return window.sessionStorage;
    }

    return window.localStorage;
  }

  function buildKey(key) {
    if (typeof key !== "string" || !key.trim()) {
      throw new TypeError("Ключ хранилища должен быть непустой строкой.");
    }

    return PREFIX + key.trim();
  }

  function set(key, value, options = {}) {
    const storage = getStorage(options.type);

    try {
      const payload = {
        value,
        expiresAt:
          Number.isFinite(options.ttlMs) && options.ttlMs > 0
            ? Date.now() + options.ttlMs
            : null
      };

      storage.setItem(buildKey(key), JSON.stringify(payload));
      return true;
    } catch (error) {
      console.error("[KREDITOR Storage] Ошибка записи:", error);
      return false;
    }
  }

  function get(key, options = {}) {
    const storage = getStorage(options.type);

    try {
      const raw = storage.getItem(buildKey(key));

      if (!raw) {
        return null;
      }

      const payload = JSON.parse(raw);

      if (
        payload.expiresAt &&
        Number.isFinite(payload.expiresAt) &&
        Date.now() > payload.expiresAt
      ) {
        remove(key, options);
        return null;
      }

      return payload.value;
    } catch (error) {
      console.error("[KREDITOR Storage] Ошибка чтения:", error);
      return null;
    }
  }

  function remove(key, options = {}) {
    const storage = getStorage(options.type);

    try {
      storage.removeItem(buildKey(key));
      return true;
    } catch (error) {
      console.error("[KREDITOR Storage] Ошибка удаления:", error);
      return false;
    }
  }

  function has(key, options = {}) {
    return get(key, options) !== null;
  }

  function clearNamespace(options = {}) {
    const storage = getStorage(options.type);

    try {
      const keys = [];

      for (let index = 0; index < storage.length; index += 1) {
        const key = storage.key(index);

        if (key && key.startsWith(PREFIX)) {
          keys.push(key);
        }
      }

      keys.forEach(function removeStoredKey(key) {
        storage.removeItem(key);
      });

      return true;
    } catch (error) {
      console.error("[KREDITOR Storage] Ошибка очистки:", error);
      return false;
    }
  }

  window.KreditorStorage = Object.freeze({
    set,
    get,
    remove,
    has,
    clearNamespace
  });
})(window);