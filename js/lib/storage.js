(function () {
  const PREFIX = "tukan.";

  const storage = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(PREFIX + key);
        if (raw == null) return fallback;
        return JSON.parse(raw);
      } catch (e) {
        return fallback;
      }
    },
    set(key, value) {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    },
    remove(key) {
      localStorage.removeItem(PREFIX + key);
    },
    reset() {
      const toRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(PREFIX)) toRemove.push(k);
      }
      toRemove.forEach(k => localStorage.removeItem(k));
    }
  };

  window.Tukan = window.Tukan || {};
  window.Tukan.storage = storage;
})();
