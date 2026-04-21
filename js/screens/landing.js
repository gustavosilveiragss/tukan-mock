(function () {
  const { router, state } = window.Tukan;

  function init() {
    const root = document.querySelector('[data-screen="landing"]');
    if (!root || root.__bound) return;
    root.__bound = true;

    root.querySelector('[data-act="begin"]').addEventListener("click", () => {
      router.go("auth");
    });
    root.querySelector('[data-act="demo"]').addEventListener("click", () => {
      state.flag("seenApp", true);
      state.flag("onboardingSeen", true);
      router.go("dashboard");
    });
  }

  router.on("landing", init);
})();
