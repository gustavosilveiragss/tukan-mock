(function () {
  const { state, router, storage } = window.Tukan;

  function updateHeader() {
    const user = state.user();
    if (!user) return;
    const initialEl = document.getElementById("header-avatar-initial");
    if (initialEl) initialEl.textContent = user.profile.initial;

    const flameEl = document.getElementById("header-flame");
    const flameNum = document.getElementById("header-flame-number");
    if (flameEl && flameNum) {
      flameNum.textContent = user.streak.current;
      flameEl.classList.toggle("danger", !!user.streak.dangerZone);
    }
  }

  function bindNav() {
    document.querySelectorAll("[data-go]").forEach(el => {
      if (el.__bound) return;
      el.__bound = true;
      el.addEventListener("click", (e) => {
        const t = e.currentTarget.dataset.go;
        if (t) router.go(t);
      });
    });
    document.querySelectorAll(".tab[data-route]").forEach(t => {
      if (t.__bound) return;
      t.__bound = true;
      t.addEventListener("click", () => router.go(t.dataset.route));
    });
  }

  function boot() {
    if (!storage.get("activePersona")) {
      storage.set("activePersona", "gustavo");
    }
    bindNav();
    updateHeader();

    state.subscribe("all", () => {
      updateHeader();
    });
    state.subscribe("user", updateHeader);
    state.subscribe("persona", updateHeader);

    const initial = router.parseHash();
    if (initial === "landing" && state.flag("seenApp")) {
      router.go("dashboard", { replace: true });
    } else {
      router.render();
    }
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
