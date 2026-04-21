(function () {
  const { router, state, data, modal, toast } = window.Tukan;

  function renderList() {
    const user = state.user();
    const plan = data.plans[user.id];
    const root = document.getElementById("plan-list");
    root.innerHTML = data.mealOrder.map(m => {
      const block = plan[m.id];
      if (!block) return "";
      const main = chosenOption(user, m.id, plan);
      return `
        <div class="plan-meal-card" data-meal="${m.id}">
          <div class="plan-meal-header">
            <div class="meal-ico"><svg width="14" height="14"><use href="#i-restaurant"></use></svg></div>
            <div>
              <div class="plan-meal-title">${m.name}</div>
              <div class="plan-meal-macros">${main.prot ?? block.main.prot}g prot &middot; ${main.carb ?? block.main.carb}g carb &middot; ${main.gord ?? block.main.gord}g gord</div>
            </div>
            <div class="meal-kcal">${main.kcal} kcal</div>
          </div>
          <div class="plan-meal-desc">${main.description || ""}</div>
          <div class="plan-meal-actions">
            <span class="plan-meal-tag">${block.main.tag || "Personalizado"}</span>
            <button class="btn btn-ghost btn-sm" type="button" data-act="swap" data-meal="${m.id}"><svg width="14" height="14"><use href="#i-swap"></use></svg> Trocar</button>
          </div>
        </div>
      `;
    }).join("");

    root.querySelectorAll('[data-act="swap"]').forEach(b => {
      b.addEventListener("click", () => openSwap(b.dataset.meal));
    });
  }

  function chosenOption(user, mealId, plan) {
    const slot = user.todayMeals[mealId];
    const block = plan[mealId];
    if (slot && slot.optionId) {
      const match = [block.main, ...block.alternatives].find(o => o.id === slot.optionId);
      if (match) return match;
    }
    return block.main;
  }

  function openSwap(mealId) {
    const user = state.user();
    const plan = data.plans[user.id];
    const block = plan[mealId];
    const allOptions = [block.main, ...block.alternatives];
    const favs = user.favorites || [];

    const sorted = [...allOptions].sort((a, b) => {
      const af = favs.includes(a.id) ? 1 : 0;
      const bf = favs.includes(b.id) ? 1 : 0;
      return bf - af;
    });

    const html = `
      <h3>Trocar refeição</h3>
      <p class="muted small mt-2">Escolha uma alternativa do seu plano.</p>
      <div class="mt-3" id="swap-list">
        ${sorted.map(opt => {
          const isFav = favs.includes(opt.id);
          return `
            <div class="alt-row ${isFav ? "favorite" : ""}" data-id="${opt.id}">
              <div>
                <div class="alt-name">${opt.title}</div>
                <div class="alt-macros">${opt.kcal} kcal &middot; ${opt.prot}g prot &middot; ${opt.carb}g carb &middot; ${opt.gord}g gord</div>
              </div>
              <button type="button" class="fav-btn ${isFav ? "active" : ""}" data-act="fav" data-id="${opt.id}" aria-label="Favoritar">
                <svg width="16" height="16"><use href="#${isFav ? "i-heart-fill" : "i-heart"}"></use></svg>
              </button>
              <button type="button" class="btn btn-brand btn-sm" data-act="pick" data-id="${opt.id}">Escolher</button>
            </div>
          `;
        }).join("")}
      </div>
    `;

    modal.open(html, {
      onMount(root) {
        root.querySelectorAll('[data-act="pick"]').forEach(b => {
          b.addEventListener("click", () => {
            const id = b.dataset.id;
            const current = state.user();
            const next = { ...(current.todayMeals[mealId] || {}), optionId: id };
            state.saveUser({ todayMeals: { [mealId]: next } });
            toast.show("Opção salva no seu plano", "success");
            modal.close();
            renderList();
          });
        });
        root.querySelectorAll('[data-act="fav"]').forEach(b => {
          b.addEventListener("click", () => {
            const id = b.dataset.id;
            const user = state.user();
            const favs = user.favorites || [];
            const idx = favs.indexOf(id);
            if (idx >= 0) favs.splice(idx, 1);
            else favs.push(id);
            state.saveUser({ favorites: favs });
            openSwap(mealId);
          });
        });
      }
    });
  }

  function renderObservations() {
    const user = state.user();
    const p = user.profile;
    const root = document.getElementById("plan-obs");
    const restriction = (p.restrictions && p.restrictions[0]) || "sem restrições relevantes";
    const preference = (p.preferences && p.preferences[0]) || "onívoro";
    const notes = p.notes && p.notes.trim();
    const quickMeals = notes ? /cozinhar|corrida|rápid|pouco tempo|faculdade|trabalho/i.test(notes) : false;
    const items = [
      "Objetivo: " + p.objective.toLowerCase() + " com manutenção de energia diária.",
      "Condição observada: " + restriction + ".",
      "Preferência: " + preference + ", refeições " + (quickMeals ? "rápidas e acessíveis" : "balanceadas") + "."
    ];
    if (notes) items.push("Rotina: " + notes + ".");
    root.innerHTML = items.map(i => `<li>${i}</li>`).join("");
  }

  router.on("plan", () => {
    renderList();
    renderObservations();
  });
})();
