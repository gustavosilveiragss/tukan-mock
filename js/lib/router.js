(function () {
  const ROUTES = [
    "landing", "auth", "onboarding",
    "dashboard", "plan", "register", "progress", "profile",
    "feedback", "streak", "hydration"
  ];

  const NO_CHROME = new Set(["landing", "auth", "onboarding"]);

  const handlers = {};

  function parseHash() {
    const raw = (location.hash || "").replace(/^#\/?/, "");
    const [name] = raw.split("?");
    if (!name) return "landing";
    if (!ROUTES.includes(name)) return "landing";
    return name;
  }

  function parseQuery() {
    const raw = (location.hash || "");
    const idx = raw.indexOf("?");
    if (idx < 0) return {};
    const out = {};
    raw.slice(idx + 1).split("&").forEach(pair => {
      if (!pair) return;
      const eq = pair.indexOf("=");
      const k = eq < 0 ? pair : pair.slice(0, eq);
      const v = eq < 0 ? "" : pair.slice(eq + 1);
      if (k) out[decodeURIComponent(k)] = decodeURIComponent(v);
    });
    return out;
  }

  function go(route, options) {
    options = options || {};
    const target = "#/" + route;
    if (options.replace) {
      history.replaceState(null, "", target);
    } else {
      location.hash = target;
    }
    if (location.hash === target) {
      render();
    }
  }

  function render() {
    const route = parseHash();
    const query = parseQuery();
    const app = document.querySelector(".app");
    if (app) {
      app.dataset.chrome = NO_CHROME.has(route) ? "off" : "on";
    }

    document.querySelectorAll("[data-screen]").forEach(s => {
      const isActive = s.dataset.screen === route;
      s.hidden = !isActive;
      if (isActive) {
        s.classList.remove("screen");
        void s.offsetWidth;
        s.classList.add("screen");
      }
    });

    document.querySelectorAll(".tab[data-route]").forEach(t => {
      t.setAttribute("aria-selected", t.dataset.route === route ? "true" : "false");
    });

    const main = document.querySelector(".app-main");
    if (main) main.scrollTop = 0;

    const h = handlers[route];
    if (typeof h === "function") {
      try { h(query); } catch (e) { console.error(e); }
    }
  }

  function on(route, fn) {
    handlers[route] = fn;
  }

  window.addEventListener("hashchange", render);
  window.addEventListener("DOMContentLoaded", render);

  window.Tukan = window.Tukan || {};
  window.Tukan.router = { go, on, parseHash, render };
})();
