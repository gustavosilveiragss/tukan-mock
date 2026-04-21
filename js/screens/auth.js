(function () {
  const { router, state, toast } = window.Tukan;

  function init() {
    const root = document.querySelector('[data-screen="auth"]');
    if (!root || root.__bound) return;
    root.__bound = true;

    const tabs = root.querySelectorAll('[data-tab]');
    const ctaLabel = root.querySelector("#auth-cta-label");
    let mode = "login";

    tabs.forEach(t => {
      t.addEventListener("click", () => {
        mode = t.dataset.tab;
        tabs.forEach(x => x.setAttribute("aria-selected", x === t ? "true" : "false"));
        ctaLabel.textContent = mode === "login" ? "Acessar conta" : "Criar minha conta";
      });
    });

    root.querySelector('[data-act="forgot"]').addEventListener("click", () => {
      toast.show("Em uma versão real, enviaríamos um e-mail de redefinição (RF003).", "", 3400);
    });

    root.querySelector('[data-act="skip"]').addEventListener("click", () => {
      state.flag("seenApp", true);
      state.flag("onboardingSeen", true);
      router.go("dashboard");
    });

    root.querySelector("#auth-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const email = root.querySelector("#auth-email").value.trim();
      const pass = root.querySelector("#auth-password").value;
      if (!email || !pass) {
        toast.show("Preencha email e senha.", "warn");
        return;
      }
      state.flag("seenApp", true);
      if (!state.flag("onboardingSeen")) {
        router.go("onboarding");
      } else {
        router.go("dashboard");
      }
    });
  }

  router.on("auth", init);
})();
