(function () {
  const { router, state, toast } = window.Tukan;

  const DIET_CHIPS = new Set(["Vegetariano", "Vegano", "Onívoro"]);

  const STEPS = [
    {
      title: "Dados básicos",
      render: (s) => `
        <div class="field"><label class="field-label" for="onb-age">Idade</label>
          <input class="field-input" id="onb-age" type="number" placeholder="Ex: 25" value="${s.age || ""}"></div>
        <div class="grid-2">
          <div class="field"><label class="field-label" for="onb-height">Altura (cm)</label>
            <input class="field-input" id="onb-height" type="number" placeholder="Ex: 172" value="${s.height || ""}"></div>
          <div class="field"><label class="field-label" for="onb-weight">Peso (kg)</label>
            <input class="field-input" id="onb-weight" type="number" step="0.1" placeholder="Ex: 70" value="${s.weight || ""}"></div>
        </div>
        <div class="field"><label class="field-label" for="onb-sex">Sexo</label>
          <select class="field-select" id="onb-sex">
            <option value="">Selecionar</option>
            <option ${s.sex === "Masculino" ? "selected" : ""}>Masculino</option>
            <option ${s.sex === "Feminino" ? "selected" : ""}>Feminino</option>
            <option ${s.sex === "Outro" ? "selected" : ""}>Outro</option>
          </select></div>
      `,
      valid: (s) => s.age && s.height && s.weight && s.sex,
      collect: (root, s) => {
        s.age = root.querySelector("#onb-age").value;
        s.height = root.querySelector("#onb-height").value;
        s.weight = root.querySelector("#onb-weight").value;
        s.sex = root.querySelector("#onb-sex").value;
      }
    },
    {
      title: "Objetivo",
      render: (s) => `
        <div class="field"><label class="field-label">Qual seu objetivo?</label>
          <div class="onb-chips" id="onb-goal">
            ${["Emagrecimento", "Hipertrofia", "Manutenção"].map(g =>
              `<button type="button" class="chip ${s.goal === g ? "" : "outline"}" data-value="${g}">${g}</button>`
            ).join("")}
          </div>
        </div>
        <div class="grid-2">
          <div class="field"><label class="field-label" for="onb-target">Peso alvo (kg)</label>
            <input class="field-input" id="onb-target" type="number" step="0.1" placeholder="Ex: 68" value="${s.target || ""}"></div>
          <div class="field"><label class="field-label" for="onb-months">Tempo (meses)</label>
            <input class="field-input" id="onb-months" type="number" placeholder="Ex: 6" value="${s.months || ""}"></div>
        </div>
      `,
      valid: (s) => s.goal && s.target && s.months,
      collect: (root, s) => {
        s.target = root.querySelector("#onb-target").value;
        s.months = root.querySelector("#onb-months").value;
      }
    },
    {
      title: "Rotina",
      render: (s) => `
        <div class="field"><label class="field-label">Quantidade de refeições por dia</label>
          <div class="onb-chips" id="onb-meals">
            ${["3", "4", "5"].map(n =>
              `<button type="button" class="chip ${s.mealsPerDay === n ? "" : "outline"}" data-value="${n}">${n} por dia</button>`
            ).join("")}
          </div>
        </div>
        <div class="field"><label class="field-label">Pratica jejum intermitente?</label>
          <div class="onb-chips" id="onb-fast">
            ${["Não", "Sim, 16:8", "Sim, outro"].map(n =>
              `<button type="button" class="chip ${s.fasting === n ? "" : "outline"}" data-value="${n}">${n}</button>`
            ).join("")}
          </div>
        </div>
        <div class="field"><label class="field-label" for="onb-budget">Orçamento semanal (R$)</label>
          <input class="field-input" id="onb-budget" type="number" placeholder="Ex: 350" value="${s.budget || ""}"></div>
      `,
      valid: (s) => s.mealsPerDay && s.fasting && s.budget,
      collect: (root, s) => {
        s.budget = root.querySelector("#onb-budget").value;
      }
    },
    {
      title: "Saúde e restrições",
      render: (s) => `
        <div class="field"><label class="field-label">Condições e preferências</label>
          <div class="onb-chips" id="onb-conditions">
            ${["Diabetes", "Hipertensão", "Lactose", "Glúten", "Vegetariano", "Vegano", "Onívoro"].map(n =>
              `<button type="button" class="chip ${(s.conditions || []).includes(n) ? "" : "outline"}" data-value="${n}">${n}</button>`
            ).join("")}
          </div>
        </div>
        <div class="field"><label class="field-label" for="onb-notes">Observações de rotina</label>
          <input class="field-input" id="onb-notes" type="text" placeholder="Ex: Baixo tempo para cozinhar" value="${s.notes || ""}"></div>
      `,
      valid: (s) => (s.conditions && s.conditions.length > 0) || s.notes,
      collect: (root, s) => {
        s.notes = root.querySelector("#onb-notes").value;
      }
    },
    {
      title: "Confirmação",
      render: (s) => `
        <div class="card">
          <div class="card-title">Resumo</div>
          <h3>Seu perfil</h3>
          <ul style="list-style:none;padding:0;margin:var(--space-3) 0 0;">
            <li class="row-between" style="padding:8px 0;border-bottom:1px solid var(--border)"><span class="muted">Idade</span><strong>${s.age || "-"} anos</strong></li>
            <li class="row-between" style="padding:8px 0;border-bottom:1px solid var(--border)"><span class="muted">Altura</span><strong>${s.height || "-"} cm</strong></li>
            <li class="row-between" style="padding:8px 0;border-bottom:1px solid var(--border)"><span class="muted">Peso</span><strong>${s.weight || "-"} kg</strong></li>
            <li class="row-between" style="padding:8px 0;border-bottom:1px solid var(--border)"><span class="muted">Objetivo</span><strong>${s.goal || "-"}</strong></li>
            <li class="row-between" style="padding:8px 0;border-bottom:1px solid var(--border)"><span class="muted">Peso alvo</span><strong>${s.target || "-"} kg em ${s.months || "-"} meses</strong></li>
            <li class="row-between" style="padding:8px 0;border-bottom:1px solid var(--border)"><span class="muted">Refeições</span><strong>${s.mealsPerDay || "-"} por dia</strong></li>
            <li class="row-between" style="padding:8px 0"><span class="muted">Restrições</span><strong>${(s.conditions || []).join(", ") || "Nenhuma"}</strong></li>
          </ul>
        </div>
        <p class="muted small mt-3 center">Ao gerar seu perfil, a IA montará um plano semanal personalizado com opções por refeição.</p>
      `,
      valid: () => true,
      collect: () => {}
    }
  ];

  let current = 0;
  let formData = {};
  let editMode = false;

  function toFormData(profile) {
    if (!profile) return {};
    const r = Array.isArray(profile.restrictions) ? profile.restrictions : [];
    const p = Array.isArray(profile.preferences) ? profile.preferences : [];
    return {
      age: profile.age ? String(profile.age) : "",
      height: profile.heightCm ? String(profile.heightCm) : "",
      weight: profile.weightKg ? String(profile.weightKg) : "",
      sex: profile.sex || "",
      goal: profile.objective || "",
      target: profile.targetWeightKg ? String(profile.targetWeightKg) : "",
      months: profile.targetMonths ? String(profile.targetMonths) : "",
      mealsPerDay: profile.mealsPerDay ? String(profile.mealsPerDay) : "",
      fasting: profile.fasting || "",
      budget: profile.weeklyBudget ? String(profile.weeklyBudget) : "",
      conditions: [...r, ...p],
      notes: profile.notes || ""
    };
  }

  function profilePatch(src) {
    const patch = {};
    if (src.age) patch.age = Number(src.age);
    if (src.height) patch.heightCm = Number(src.height);
    if (src.weight) patch.weightKg = Number(src.weight);
    if (src.sex) patch.sex = src.sex;
    if (src.goal) patch.objective = src.goal;
    if (src.target) patch.targetWeightKg = Number(src.target);
    if (src.months) patch.targetMonths = Number(src.months);
    if (src.mealsPerDay) patch.mealsPerDay = Number(src.mealsPerDay);
    if (src.budget) patch.weeklyBudget = Number(src.budget);
    if (src.fasting) patch.fasting = src.fasting;
    if (src.mealsPerDay || src.fasting) {
      const meals = src.mealsPerDay ? src.mealsPerDay + " refeições por dia" : "";
      const fast = src.fasting && src.fasting !== "Não" ? "jejum: " + src.fasting : "";
      patch.routine = [meals, fast].filter(Boolean).join(" · ");
    }
    const conditions = Array.isArray(src.conditions) ? src.conditions : [];
    patch.restrictions = conditions.filter(c => !DIET_CHIPS.has(c));
    patch.preferences = conditions.filter(c => DIET_CHIPS.has(c));
    patch.notes = src.notes || "";
    return patch;
  }

  function renderStep() {
    const stepLabel = document.getElementById("onb-step-label");
    const body = document.getElementById("onb-body");
    const progress = document.getElementById("onb-progress");
    const nextBtn = document.getElementById("onb-next");
    const steps = document.getElementById("onb-steps");

    stepLabel.textContent = "Etapa " + (current + 1) + " de " + STEPS.length;
    progress.style.width = (((current + 1) / STEPS.length) * 100) + "%";
    body.innerHTML = STEPS[current].render(formData);

    Array.from(steps.children).forEach((c, idx) => {
      c.classList.remove("done", "current");
      if (idx < current) c.classList.add("done");
      if (idx === current) c.classList.add("current");
    });

    const finalLabel = editMode ? "Salvar alterações" : "Gerar perfil nutricional";
    nextBtn.textContent = current === STEPS.length - 1 ? finalLabel : "Avançar";
    const skipBtn = document.getElementById("onb-skip");
    if (skipBtn) skipBtn.textContent = editMode ? "Cancelar edição" : "Pular onboarding";
    attachChipHandlers(body);
  }

  function attachChipHandlers(body) {
    const groups = [
      { sel: "#onb-goal", key: "goal", multi: false },
      { sel: "#onb-meals", key: "mealsPerDay", multi: false },
      { sel: "#onb-fast", key: "fasting", multi: false },
      { sel: "#onb-conditions", key: "conditions", multi: true }
    ];
    groups.forEach(g => {
      const wrap = body.querySelector(g.sel);
      if (!wrap) return;
      wrap.addEventListener("click", (e) => {
        const btn = e.target.closest(".chip");
        if (!btn) return;
        const v = btn.dataset.value;
        if (g.multi) {
          formData[g.key] = formData[g.key] || [];
          const idx = formData[g.key].indexOf(v);
          if (idx >= 0) formData[g.key].splice(idx, 1);
          else formData[g.key].push(v);
        } else {
          formData[g.key] = v;
        }
        wrap.querySelectorAll(".chip").forEach(c => {
          const isOn = g.multi
            ? formData[g.key].includes(c.dataset.value)
            : formData[g.key] === c.dataset.value;
          c.classList.toggle("outline", !isOn);
        });
      });
    });
  }

  function next() {
    const body = document.getElementById("onb-body");
    STEPS[current].collect(body, formData);
    if (!editMode && !STEPS[current].valid(formData)) {
      toast.show("Preencha os campos obrigatórios.", "warn");
      return;
    }
    if (current < STEPS.length - 1) {
      current += 1;
      renderStep();
    } else {
      finish();
    }
  }

  function back() {
    const body = document.getElementById("onb-body");
    STEPS[current].collect(body, formData);
    if (current === 0) {
      if (editMode) {
        state.flag("editProfile", false);
        router.go("profile");
      } else {
        router.go("auth");
      }
      return;
    }
    current -= 1;
    renderStep();
  }

  function finish() {
    toast.show(editMode ? "Atualizando seu perfil..." : "Gerando seu perfil nutricional...", "success", 1500);
    const next = document.getElementById("onb-next");
    next.disabled = true;
    next.textContent = editMode ? "Salvando..." : "Gerando...";
    const patch = profilePatch(formData);
    if (Object.keys(patch).length > 0) {
      state.saveUser({ profile: patch });
    }
    const wasEdit = editMode;
    state.flag("editProfile", false);
    setTimeout(() => {
      next.disabled = false;
      state.flag("onboardingSeen", true);
      state.flag("seenApp", true);
      router.go(wasEdit ? "profile" : "dashboard");
    }, 1400);
  }

  function skip() {
    if (editMode) {
      state.flag("editProfile", false);
      router.go("profile");
      return;
    }
    state.flag("onboardingSeen", true);
    state.flag("seenApp", true);
    router.go("dashboard");
  }

  function bindOnce() {
    const root = document.querySelector('[data-screen="onboarding"]');
    if (!root || root.__bound) return;
    root.__bound = true;
    root.querySelector('[data-act="skip"]').addEventListener("click", skip);
    root.querySelector('[data-act="next"]').addEventListener("click", next);
    root.querySelector('[data-act="back"]').addEventListener("click", back);
  }

  router.on("onboarding", () => {
    bindOnce();
    current = 0;
    editMode = !!state.flag("editProfile");
    if (editMode) {
      const user = state.user();
      formData = toFormData(user && user.profile);
    } else {
      formData = {};
    }
    renderStep();
  });
})();
