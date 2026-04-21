(function () {
  const { router, state, date, data } = window.Tukan;

  function mealIcon() {
    return '<svg width="14" height="14"><use href="#i-restaurant"></use></svg>';
  }

  function renderPlanList(user, planForUser) {
    const root = document.getElementById("dash-plan");
    if (!root) return;
    const slots = data.mealOrder.filter(m => user.todayMeals[m.id] && planForUser[m.id]);
    root.innerHTML = slots.map(meta => {
      const slot = meta.id;
      const t = planForUser[slot];
      const m = t.main;
      const logged = user.todayMeals[slot] && user.todayMeals[slot].logged;
      const tag = logged ? 'class="meal-row"' : 'class="meal-row meal-row-action" role="button" tabindex="0" data-slot="' + slot + '"';
      return `
        <div ${tag}>
          <div class="meal-ico">${mealIcon()}</div>
          <div>
            <div class="meal-name">${meta.name} ${logged ? '<span class="chip" style="font-size:10px;padding:2px 8px;margin-left:4px">Registrado</span>' : ''}</div>
            <div class="meal-desc">${m.title}</div>
          </div>
          <div class="meal-kcal">${m.kcal} kcal</div>
        </div>
      `;
    }).join("");

    root.querySelectorAll(".meal-row-action[data-slot]").forEach(el => {
      const go = () => router.go("register?slot=" + el.dataset.slot);
      el.addEventListener("click", go);
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); }
      });
    });
  }

  function renderStreak(user) {
    document.getElementById("dash-streak-days").textContent = user.streak.current;
    document.getElementById("dash-streak-desc").textContent = user.streak.dangerZone
      ? "sua ofensiva está em perigo"
      : "dias de foco na dieta";
    const hero = document.getElementById("dash-streak");
    hero.classList.toggle("danger", !!user.streak.dangerZone);

    const completedDays = (user.streak.weekHistory || []).filter(w => w.completed).length;
    document.getElementById("dash-ring-center").textContent = completedDays + "/7";
    const dash = 2 * Math.PI * 40;
    const ratio = Math.min(1, completedDays / 7);
    document.getElementById("dash-ring").setAttribute("stroke-dasharray", dash);
    document.getElementById("dash-ring").setAttribute("stroke-dashoffset", dash * (1 - ratio));

    if (user.streak.dangerZone) {
      document.getElementById("dash-streak-label").textContent = "Atenção: ofensiva em perigo";
    } else {
      document.getElementById("dash-streak-label").textContent = "Sua ofensiva ativa";
    }
  }

  function renderMetrics(user) {
    const targets = user.profile;
    document.getElementById("m-cal").textContent = targets.caloriesTarget.toLocaleString("pt-BR") + " kcal";
    const loggedCount = Object.values(user.todayMeals).filter(m => m.logged).length;
    const target = targets.mealsPerDay;
    document.getElementById("m-meals").textContent = loggedCount + " / " + target;
    let mealsSub;
    if (loggedCount >= target) mealsSub = "Dia completo";
    else if (loggedCount >= Math.ceil(target * 0.6)) mealsSub = "Bom ritmo";
    else mealsSub = "Continue";
    document.getElementById("m-meals-sub").textContent = mealsSub;
    document.getElementById("m-water").textContent = targets.waterConsumedL.toString().replace(".", ",") + " L";
    document.getElementById("m-water-sub").textContent = "Meta " + targets.waterTargetL.toString().replace(".", ",") + " L";

    const avg = data.aggregate.liveAdherenceWeek(user.id).reduce((s, d) => s + d.pct, 0) / 7;
    document.getElementById("m-adh").textContent = Math.round(avg) + "%";
  }

  function renderWeekBars(user) {
    const root = document.getElementById("dash-week-bars");
    if (!root) return;
    const week = data.aggregate.liveAdherenceWeek(user.id);
    const todayIdx = (new Date().getDay() + 6) % 7;
    root.innerHTML = week.map((d, i) => {
      const h = Math.max(6, Math.round((d.pct / 100) * 60));
      const today = i === todayIdx ? "today" : "";
      return `<div class="${today}" style="height:${h}px" title="${d.day}: ${d.pct}%"></div>`;
    }).join("");
  }

  function renderAI(user) {
    const fb = data.aiFeedback[user.id];
    if (!fb) return;
    document.getElementById("dash-ai").textContent = fb.summary;
  }

  function renderAll() {
    const user = state.user();
    const planForUser = data.plans[user.id];

    document.getElementById("dash-greeting").textContent = date.greeting();
    document.getElementById("dash-name").textContent = user.profile.name.split(" ")[0];
    document.getElementById("dash-subtitle").textContent = user.streak.description;

    renderStreak(user);
    renderMetrics(user);
    renderPlanList(user, planForUser);
    renderWeekBars(user);
    renderAI(user);
  }

  function bindOnce() {
    const root = document.querySelector('[data-screen="dashboard"]');
    if (!root || root.__bound) return;
    root.__bound = true;

    root.querySelector("#dash-streak").addEventListener("click", () => router.go("streak"));
    root.querySelector("#dash-streak").addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); router.go("streak"); }
    });
  }

  router.on("dashboard", () => {
    bindOnce();
    renderAll();
  });

  state.subscribe("user", () => {
    if (router.parseHash() === "dashboard") renderAll();
  });
  state.subscribe("persona", () => {
    if (router.parseHash() === "dashboard") renderAll();
  });
})();
