(function () {
  function show(msg, kind, ms) {
    const root = document.getElementById("toast-root");
    if (!root) return;
    const el = document.createElement("div");
    el.className = "toast" + (kind ? " " + kind : "");
    el.textContent = msg;
    root.appendChild(el);
    setTimeout(() => {
      el.style.transition = "opacity .2s";
      el.style.opacity = "0";
      setTimeout(() => el.remove(), 200);
    }, ms || 2200);
  }

  window.Tukan = window.Tukan || {};
  window.Tukan.toast = { show };
})();
