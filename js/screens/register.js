(function () {
  const { router, state, data, toast, mealLog, modal } = window.Tukan;

  let slotFilter = null;

  function currentOptionId(user, slot) {
    const existing = user.todayMeals[slot];
    if (existing && existing.optionId) return existing.optionId;
    const block = data.plans[user.id][slot];
    return block ? block.main.id : null;
  }

  function lookupOption(slot, optionId) {
    const user = state.user();
    const plan = data.plans[user.id];
    const block = plan[slot];
    if (block) {
      const match = [block.main, ...block.alternatives].find(o => o.id === optionId);
      if (match) return { title: match.title, kcal: match.kcal, description: match.description || "", tag: match.tag || "Do seu plano" };
    }
    const catalog = data.mealsCatalog.find(c => c.id === optionId);
    if (catalog) return { title: catalog.name, kcal: catalog.kcal, description: catalog.note || "", tag: "Catálogo" };
    return block ? { title: block.main.title, kcal: block.main.kcal, description: block.main.description || "", tag: block.main.tag || "Do seu plano" } : { title: "Refeição", kcal: 0, description: "", tag: "" };
  }

  function slotOptions(user, slot) {
    const plan = data.plans[user.id];
    const block = plan[slot];
    const planOpts = block ? [block.main, ...block.alternatives].map(o => ({
      id: o.id, title: o.title, kcal: o.kcal, sub: "Do seu plano"
    })) : [];
    const catOpts = data.mealsCatalog.filter(c => c.mealSlot === slot).map(c => ({
      id: c.id, title: c.name, kcal: c.kcal, sub: "Sugestão do catálogo"
    }));
    return [...planOpts, ...catOpts];
  }

  function renderSuggestions(query) {
    const user = state.user();
    const slotIds = Object.keys(user.todayMeals);
    let pendingSlots = slotIds.filter(s => !user.todayMeals[s].logged);
    if (slotFilter && pendingSlots.includes(slotFilter)) {
      pendingSlots = [slotFilter];
    }

    const q = (query || "").trim().toLowerCase();

    const orderedSlots = data.mealOrder
      .map(m => m.id)
      .filter(id => pendingSlots.includes(id));

    const cards = orderedSlots.map(slot => {
      const mealMeta = data.mealOrder.find(m => m.id === slot);
      const optId = currentOptionId(user, slot);
      const opt = lookupOption(slot, optId);
      return { slot, mealName: mealMeta.name, optionId: optId, option: opt };
    }).filter(c => {
      if (!q) return true;
      if (c.mealName.toLowerCase().includes(q)) return true;
      if (c.option.title.toLowerCase().includes(q)) return true;
      return slotOptions(user, c.slot).some(o => o.title.toLowerCase().includes(q));
    });

    const root = document.getElementById("reg-suggestions");
    if (cards.length === 0) {
      root.innerHTML = '<div class="empty">Nenhuma sugestão encontrada. Todas as refeições do dia já foram registradas.</div>';
      return;
    }

    root.innerHTML = cards.map(c => `
      <div class="reg-slot-card">
        <div class="reg-slot-head">
          <span class="reg-slot-meal">${c.mealName}</span>
          <span class="meal-kcal">${c.option.kcal} kcal</span>
        </div>
        <div class="reg-slot-title">${c.option.title}</div>
        ${c.option.description ? `<div class="reg-slot-desc">${c.option.description}</div>` : ""}
        <div class="reg-slot-actions">
          <button type="button" class="btn btn-ghost btn-sm" data-act="swap" data-slot="${c.slot}">
            <svg width="14" height="14"><use href="#i-swap"></use></svg> Trocar opção
          </button>
          <button type="button" class="btn btn-primary btn-sm" data-act="register" data-slot="${c.slot}" data-option="${c.optionId}">
            Registrar
          </button>
        </div>
      </div>
    `).join("");

    root.querySelectorAll('[data-act="register"]').forEach(b => {
      b.addEventListener("click", () => {
        mealLog.log(b.dataset.slot, b.dataset.option);
        renderAll();
      });
    });
    root.querySelectorAll('[data-act="swap"]').forEach(b => {
      b.addEventListener("click", () => openSwap(b.dataset.slot));
    });
  }

  function openSwap(slot) {
    const user = state.user();
    const mealMeta = data.mealOrder.find(m => m.id === slot);
    const options = slotOptions(user, slot);
    const currentId = currentOptionId(user, slot);

    const html = `
      <h3>Escolher opção</h3>
      <p class="muted small mt-2">${mealMeta.name} &mdash; selecione o que vai registrar.</p>
      <div class="mt-3">
        ${options.map(opt => {
          const isCurrent = opt.id === currentId;
          return `
            <div class="alt-row${isCurrent ? " selected" : ""}" data-id="${opt.id}">
              <div>
                <div class="alt-name">${opt.title}</div>
                <div class="alt-macros">${opt.kcal} kcal &middot; ${opt.sub}</div>
              </div>
              <button type="button" class="btn ${isCurrent ? "btn-primary" : "btn-brand"} btn-sm" data-act="pick" data-id="${opt.id}">
                ${isCurrent ? "Selecionada" : "Escolher"}
              </button>
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
            const slotState = current.todayMeals[slot] || {};
            state.saveUser({ todayMeals: { [slot]: { ...slotState, optionId: id, logged: false } } });
            modal.close();
            renderAll();
          });
        });
      }
    });
  }

  function renderHistory() {
    const user = state.user();
    const root = document.getElementById("reg-history");
    const logged = Object.entries(user.todayMeals).filter(([, m]) => m.logged);
    if (logged.length === 0) {
      root.innerHTML = '<div class="empty">Ainda não há refeições registradas hoje.</div>';
      return;
    }
    const defaultTimes = { cafe: "08:10", almoco: "12:45", lanche: "16:20", jantar: "19:40", ceia: "22:00" };
    root.innerHTML = logged.map(([slot, m]) => {
      const option = lookupOption(slot, m.optionId);
      const meta = data.mealOrder.find(x => x.id === slot);
      const time = m.time || defaultTimes[slot] || "--:--";
      return `
        <div class="reg-history-row">
          <div class="time">${time}</div>
          <div>
            <div class="meal-name">${meta.name}</div>
            <div class="meal-sub">${option.title}</div>
          </div>
          <div class="meal-kcal">${option.kcal} kcal</div>
        </div>
      `;
    }).join("");
  }

  function renderBalance() {
    const user = state.user();
    let consumed = 0;
    Object.entries(user.todayMeals).forEach(([slot, m]) => {
      if (m.logged) {
        consumed += lookupOption(slot, m.optionId).kcal || 0;
      }
    });
    const balance = Math.max(0, user.profile.caloriesTarget - consumed);
    document.getElementById("reg-balance").textContent = balance.toLocaleString("pt-BR") + " kcal";
    const sub = document.getElementById("reg-balance-sub");
    if (balance === 0) {
      sub.textContent = "Meta diária atingida. Qualquer adição extra sai do plano.";
    } else if (balance < 300) {
      sub.textContent = "Próximo do limite diário. Escolha opções leves para a ceia.";
    } else {
      sub.textContent = "Ainda disponíveis dentro da meta para manter seu plano alinhado com o objetivo de hoje.";
    }
  }

  function renderAll() {
    const q = document.getElementById("reg-search").value;
    renderSuggestions(q);
    renderHistory();
    renderBalance();
  }

  function bindOnce() {
    const root = document.querySelector('[data-screen="register"]');
    if (!root || root.__bound) return;
    root.__bound = true;
    document.getElementById("reg-search").addEventListener("input", (e) => {
      renderSuggestions(e.target.value);
    });
    const clearBtn = document.querySelector('#reg-slot-chip [data-act="clear-slot"]');
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        slotFilter = null;
        renderSlotChip();
        renderAll();
      });
    }
  }

  function renderSlotChip() {
    const chip = document.getElementById("reg-slot-chip");
    if (!chip) return;
    if (!slotFilter) {
      chip.hidden = true;
      return;
    }
    const meta = data.mealOrder.find(m => m.id === slotFilter);
    chip.hidden = false;
    chip.querySelector("[data-role='label']").textContent = meta ? meta.name : slotFilter;
  }

  router.on("register", (params) => {
    bindOnce();
    const user = state.user();
    const requested = params && params.slot;
    if (requested && user.todayMeals[requested] && !user.todayMeals[requested].logged) {
      slotFilter = requested;
    } else {
      slotFilter = null;
    }
    renderSlotChip();
    renderAll();
  });
})();
