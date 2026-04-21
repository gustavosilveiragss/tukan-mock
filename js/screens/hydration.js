(function () {
  const { router, state, modal, toast } = window.Tukan;

  const MIN_ML = 1;
  const MAX_ML = 2000;

  function getLog() {
    return state.user().waterLog || [];
  }

  function totalMl(log) {
    return (log || getLog()).reduce((s, e) => s + e.ml, 0);
  }

  function targetMl() {
    return Math.round(state.user().profile.waterTargetL * 1000);
  }

  function nowTime() {
    const d = new Date();
    return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
  }

  function formatL(ml) {
    return (ml / 1000).toFixed(1).replace(".", ",") + " L";
  }

  function addMinutes(hhmm, mins) {
    const [h, m] = hhmm.split(":").map(Number);
    const d = new Date();
    d.setHours(h, m + mins, 0, 0);
    return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
  }

  function addWater(ml) {
    if (!ml || ml < MIN_ML || ml > MAX_ML) return;
    const before = totalMl();
    const entry = { id: "w-" + Date.now(), time: nowTime(), ml };
    const newLog = [...getLog(), entry];
    const newTotal = totalMl(newLog);
    const newL = Math.round(newTotal / 100) / 10;
    state.saveUser({ waterLog: newLog, profile: { waterConsumedL: newL } });

    const goal = targetMl();
    if (before < goal && newTotal >= goal) {
      celebrate(newTotal);
    } else {
      toast.show(ml + " ml adicionados", "success");
    }
    renderAll();
  }

  function removeEntry(id) {
    const newLog = getLog().filter(e => e.id !== id);
    const newL = Math.round(totalMl(newLog) / 100) / 10;
    state.saveUser({ waterLog: newLog, profile: { waterConsumedL: newL } });
    toast.show("Registro removido");
    renderAll();
  }

  function celebrate(currentMl) {
    modal.open(
      '<div class="celebration">' +
        '<div class="check-mark"><svg viewBox="0 0 64 64" aria-hidden="true"><polyline points="14,34 28,48 50,20"></polyline></svg></div>' +
        '<h2>Meta de hidratação batida!</h2>' +
        '<p>Você consumiu ' + formatL(currentMl) + ' hoje. Seguir hidratado mantém seu plano no ritmo.</p>' +
        '<div class="btn-row">' +
          '<button class="btn btn-ghost" data-act="close">Continuar</button>' +
          '<button class="btn btn-primary" data-act="dashboard">Ver dashboard</button>' +
        '</div>' +
      '</div>',
      {
        centered: true,
        onMount(root) {
          root.querySelector('[data-act="close"]').addEventListener("click", () => modal.close());
          root.querySelector('[data-act="dashboard"]').addEventListener("click", () => {
            modal.close();
            router.go("dashboard");
          });
        }
      }
    );
  }

  function renderHero() {
    const log = getLog();
    const consumed = totalMl(log);
    const goal = targetMl();
    const pct = Math.min(1, consumed / goal);

    const ring = document.getElementById("hydra-ring");
    const dash = 2 * Math.PI * 60;
    ring.setAttribute("stroke-dasharray", dash);
    ring.setAttribute("stroke-dashoffset", dash * (1 - pct));

    document.getElementById("hydra-ring-value").textContent = formatL(consumed);
    document.getElementById("hydra-ring-sub").textContent = "de " + formatL(goal);
    document.getElementById("hydra-percent").textContent = Math.round(pct * 100) + "% da meta";

    const msg = document.getElementById("hydra-hero-msg");
    if (consumed >= goal) {
      msg.textContent = "Meta do dia batida. Mantenha o ritmo sem exageros.";
    } else if (pct >= 0.7) {
      msg.textContent = "Quase lá. Falta pouco para fechar a meta.";
    } else if (pct >= 0.4) {
      msg.textContent = "Bom ritmo. Continue bebendo ao longo do dia.";
    } else {
      msg.textContent = "Comece forte. Uma dose agora ajuda o resto do dia.";
    }
  }

  function renderNext() {
    const card = document.getElementById("hydra-next-card");
    const log = getLog();
    const consumed = totalMl(log);
    const goal = targetMl();

    if (consumed >= goal) {
      card.hidden = true;
      return;
    }
    card.hidden = false;

    let suggestion;
    if (log.length === 0) {
      suggestion = addMinutes(nowTime(), 30);
    } else {
      const last = log[log.length - 1].time;
      suggestion = addMinutes(last, 90);
    }
    document.getElementById("hydra-next-time").textContent = suggestion;

    const remainingMl = goal - consumed;
    const doses = Math.max(1, Math.ceil(remainingMl / 300));
    document.getElementById("hydra-next-body").textContent =
      "Faltam " + remainingMl + " ml para a meta. Mais ~" + doses + " dose" + (doses > 1 ? "s" : "") + " de 300 ml espalhadas no dia.";
  }

  function renderHistory() {
    const log = [...getLog()].sort((a, b) => a.time.localeCompare(b.time));
    const root = document.getElementById("hydra-history");
    document.getElementById("hydra-history-title").textContent =
      log.length + " registro" + (log.length === 1 ? "" : "s");
    document.getElementById("hydra-history-total").textContent = totalMl(log) + " ml";

    if (log.length === 0) {
      root.innerHTML = '<div class="empty">Nenhum registro hoje. Comece pelos presets acima.</div>';
      return;
    }

    root.innerHTML = log.map(e => `
      <div class="hydra-row">
        <div class="time">${e.time}</div>
        <div class="hydra-row-ml">${e.ml} ml</div>
        <button type="button" class="hydra-row-del" data-id="${e.id}" aria-label="Remover registro">
          <svg width="14" height="14"><use href="#i-trash"></use></svg>
        </button>
      </div>
    `).join("");

    root.querySelectorAll("button[data-id]").forEach(b => {
      b.addEventListener("click", () => removeEntry(b.dataset.id));
    });
  }

  function renderAll() {
    renderHero();
    renderNext();
    renderHistory();
  }

  function bindOnce() {
    const root = document.querySelector('[data-screen="hydration"]');
    if (!root || root.__bound) return;
    root.__bound = true;

    root.querySelectorAll(".hydra-preset").forEach(btn => {
      btn.addEventListener("click", () => addWater(Number(btn.dataset.ml)));
    });

    const input = root.querySelector("#hydra-custom-input");
    root.querySelectorAll(".hydra-step").forEach(btn => {
      btn.addEventListener("click", () => {
        const step = Number(btn.dataset.step);
        const cur = Number(input.value) || 0;
        const next = Math.max(0, Math.min(MAX_ML, cur + step));
        input.value = next || "";
      });
    });

    root.querySelector("#hydra-custom-add").addEventListener("click", () => {
      const val = Math.round(Number(input.value));
      if (!val || val < MIN_ML || val > MAX_ML) {
        toast.show("Informe entre 1 e " + MAX_ML + " ml", "warn");
        return;
      }
      addWater(val);
      input.value = "";
    });
  }

  router.on("hydration", () => {
    bindOnce();
    renderAll();
  });
})();
