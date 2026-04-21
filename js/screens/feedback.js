(function () {
  const { router, state, data } = window.Tukan;

  function renderAll() {
    const user = state.user();
    const fb = data.aiFeedback[user.id];
    document.getElementById("fb-title").textContent = fb.patternTitle;
    document.getElementById("fb-body").textContent = fb.patternBody;
    document.getElementById("fb-chips").innerHTML = fb.chips.map(c => `<span class="chip ghost-dark">${c}</span>`).join("");
    document.getElementById("fb-adjustments").innerHTML = fb.adjustments.map(a => `
      <div class="feedback-bullet">
        <span class="bullet-ico"><svg width="12" height="12"><use href="#i-check"></use></svg></span>
        <span>${a}</span>
      </div>
    `).join("");
  }

  router.on("feedback", () => {
    renderAll();
  });

  state.subscribe("user", () => {
    if (router.parseHash() === "feedback") renderAll();
  });
  state.subscribe("persona", () => {
    if (router.parseHash() === "feedback") renderAll();
  });
})();
