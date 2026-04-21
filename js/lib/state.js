(function () {
  const { storage } = window.Tukan;

  const subs = {};
  function emit(topic) {
    (subs[topic] || []).forEach(fn => {
      try { fn(); } catch (e) { console.error(e); }
    });
    (subs["*"] || []).forEach(fn => {
      try { fn(topic); } catch (e) { console.error(e); }
    });
  }

  const state = {
    activePersonaId() {
      return storage.get("activePersona", "gustavo");
    },
    setActivePersonaId(id) {
      storage.set("activePersona", id);
      emit("persona");
      emit("all");
    },
    user(id) {
      const pid = id || state.activePersonaId();
      const base = window.Tukan.data.personas[pid];
      if (!base) return null;
      const saved = storage.get(`user.${pid}.state`);
      if (saved) return deepMerge(base, saved);
      return clone(base);
    },
    saveUser(patch, id) {
      const pid = id || state.activePersonaId();
      const base = window.Tukan.data.personas[pid];
      const existing = storage.get(`user.${pid}.state`, clone(base));
      const merged = deepMerge(existing, patch);
      storage.set(`user.${pid}.state`, merged);
      emit("user");
      emit("all");
    },
    resetUser(id) {
      const pid = id || state.activePersonaId();
      storage.remove(`user.${pid}.state`);
      emit("user");
      emit("all");
    },
    resetAll() {
      storage.reset();
      emit("all");
    },
    flag(key, value) {
      if (value === undefined) return storage.get(`ui.${key}`, false);
      storage.set(`ui.${key}`, value);
      emit("flag:" + key);
    },
    subscribe(topic, fn) {
      if (!subs[topic]) subs[topic] = [];
      subs[topic].push(fn);
      return () => {
        subs[topic] = (subs[topic] || []).filter(f => f !== fn);
      };
    },
    emit
  };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function deepMerge(a, b) {
    if (Array.isArray(b)) return clone(b);
    if (b && typeof b === "object") {
      const out = clone(a || {});
      for (const k of Object.keys(b)) {
        out[k] = deepMerge(a ? a[k] : undefined, b[k]);
      }
      return out;
    }
    return b === undefined ? a : b;
  }

  window.Tukan.state = state;
})();
