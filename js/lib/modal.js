(function () {
  let current = null;

  function open(html, opts) {
    opts = opts || {};
    close();
    const root = document.getElementById("modal-root");
    root.style.pointerEvents = "auto";

    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop";

    const card = document.createElement("div");
    card.className = "modal-card" + (opts.centered ? " centered" : "");
    card.setAttribute("role", "dialog");
    card.setAttribute("aria-modal", "true");
    if (!opts.centered) {
      const grip = document.createElement("div");
      grip.className = "modal-grip";
      card.appendChild(grip);
    }
    const contentWrap = document.createElement("div");
    contentWrap.innerHTML = html;
    card.appendChild(contentWrap);

    root.appendChild(backdrop);
    root.appendChild(card);

    current = { backdrop, card, contentWrap, opts };

    backdrop.addEventListener("click", () => {
      if (opts.dismissible !== false) close();
    });

    if (opts.onMount) {
      try { opts.onMount(contentWrap); } catch (e) { console.error(e); }
    }

    return current;
  }

  function close() {
    const root = document.getElementById("modal-root");
    if (!root) return;
    if (current) {
      current.backdrop.remove();
      current.card.remove();
      current = null;
    }
    root.style.pointerEvents = "none";
  }

  window.Tukan = window.Tukan || {};
  window.Tukan.modal = { open, close, current: () => current };
})();
