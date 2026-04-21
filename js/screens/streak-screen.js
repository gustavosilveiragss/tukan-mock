(function () {
  const { router, state, share, date, data } = window.Tukan;

  function pendingMealsLabel(user) {
    const order = data.mealOrder;
    const pending = order.filter(m => {
      const slot = user.todayMeals[m.id];
      return slot && !slot.logged;
    }).map(m => m.name.toLowerCase());
    if (pending.length === 0) return "todas as refeições de hoje";
    if (pending.length === 1) return pending[0];
    if (pending.length === 2) return pending.join(" e ");
    return pending.slice(0, -1).join(", ") + " e " + pending[pending.length - 1];
  }

  function renderWeek(user) {
    const root = document.getElementById("streak-week");
    const today = date.todayISO();
    const letters = ["S", "T", "Q", "Q", "S", "S", "D"];
    root.innerHTML = (user.streak.weekHistory || []).map((w, i) => {
      const isToday = w.date === today;
      const done = w.completed;
      const danger = isToday && user.streak.dangerZone && !done;
      return `
        <div class="streak-day ${done ? "done" : ""} ${isToday ? "today" : ""} ${danger ? "danger" : ""}">
          <span class="sd-letter">${letters[i]}</span>
          <span class="sd-check">${done ? '<svg width="12" height="12"><use href="#i-check"></use></svg>' : ""}</span>
        </div>
      `;
    }).join("");
  }

  function renderMiniBars(user) {
    const root = document.getElementById("streak-mini-bars");
    if (!root) return;
    const heights = (user.streak.weekHistory || []).map(w => w.completed ? 100 : 20);
    root.innerHTML = heights.map(h => `<div style="height:${Math.max(6, Math.round(h * 0.55))}px"></div>`).join("");
  }

  function renderAll() {
    const user = state.user();
    document.getElementById("streak-number").textContent = user.streak.current;
    const label = document.getElementById("streak-label");
    label.textContent = user.streak.dangerZone
      ? "Sua ofensiva está em perigo"
      : "dias de foco na dieta!";

    renderWeek(user);
    renderMiniBars(user);

    const cont = document.getElementById("streak-continue");
    const contBody = document.getElementById("streak-continue-body");
    const praise = document.getElementById("streak-praise-body");
    const completedToday = user.streak.weekHistory.some(w => w.date === date.todayISO() && w.completed);

    if (user.streak.dangerZone) {
      cont.style.background = "var(--danger-soft)";
      cont.style.borderColor = "var(--danger-soft)";
      cont.querySelector("h4").textContent = "Sua ofensiva está em perigo!";
      cont.querySelector("h4").style.color = "var(--danger)";
      contBody.textContent = "Registre sua próxima refeição para manter seus " + user.streak.current + " dias.";
      praise.textContent = "Não deixe a disciplina dos últimos " + user.streak.current + " dias escapar. Um registro agora salva tudo.";
    } else if (completedToday) {
      cont.style.background = "var(--brand-soft-2)";
      cont.style.borderColor = "var(--brand-soft)";
      cont.querySelector("h4").textContent = "Continue assim!";
      cont.querySelector("h4").style.color = "var(--brand-strong)";
      contBody.textContent = "Amanhã começa a ofensiva de " + (user.streak.current + 1) + " dias!";
      praise.textContent = "Você mantém o ritmo de forma consistente. A cada dia registrado, o plano fica mais preciso e fácil de seguir.";
    } else {
      cont.style.background = "var(--brand-soft-2)";
      cont.style.borderColor = "var(--brand-soft)";
      cont.querySelector("h4").textContent = "Falta pouco para fechar o dia.";
      cont.querySelector("h4").style.color = "var(--brand-strong)";
      contBody.textContent = "Registre " + pendingMealsLabel(user) + " para aumentar sua ofensiva.";
      praise.textContent = "Você vem mantendo o ritmo há " + user.streak.current + " dias. Continue assim.";
    }
  }

  function bindOnce() {
    const root = document.querySelector('[data-screen="streak"]');
    if (!root || root.__bound) return;
    root.__bound = true;
    root.querySelector('[data-act="share"]').addEventListener("click", () => share.open());
  }

  router.on("streak", () => {
    bindOnce();
    renderAll();
  });
})();
