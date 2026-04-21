(function () {
  const { router, state, data } = window.Tukan;

  let weightChart = null;
  let currentPeriod = "6m";

  const PERIOD_META = {
    "7d": {
      chartTitle: "Peso ao longo da semana",
      adhRange: "Últimos 7 dias",
      hitsLabel: "Metas batidas na semana",
      hitsUnit: "dias",
      calLabel: "Calorias médias (dia)",
      weightLabel: "Variação na semana"
    },
    "30d": {
      chartTitle: "Peso ao longo do mês",
      adhRange: "Média diária no mês",
      hitsLabel: "Metas batidas no mês",
      hitsUnit: "dias",
      calLabel: "Calorias médias (dia)",
      weightLabel: "Variação no mês"
    },
    "6m": {
      chartTitle: "Peso ao longo dos últimos 6 meses",
      adhRange: "Média diária no semestre",
      hitsLabel: "Metas batidas no semestre",
      hitsUnit: "dias",
      calLabel: "Calorias médias (dia)",
      weightLabel: "Variação no semestre"
    },
    "1a": {
      chartTitle: "Peso ao longo do último ano",
      adhRange: "Média diária no ano",
      hitsLabel: "Metas batidas no ano",
      hitsUnit: "dias",
      calLabel: "Calorias médias (dia)",
      weightLabel: "Variação no ano"
    }
  };

  function formatKg(n) {
    const rounded = Math.round(n * 10) / 10;
    const sign = rounded < 0 ? "" : (rounded > 0 ? "+" : "");
    return sign + rounded.toString().replace(".", ",") + " kg";
  }

  function syncChips() {
    const root = document.getElementById("prog-filters");
    if (!root) return;
    root.querySelectorAll(".chip[data-period]").forEach(c => {
      if (c.dataset.period === currentPeriod) c.setAttribute("data-active", "true");
      else c.removeAttribute("data-active");
    });
  }

  function drawChart(user) {
    const ctx = document.getElementById("chart-weight");
    if (!ctx || typeof Chart === "undefined") return;
    const chart = data.aggregate.chart(user.id, currentPeriod);
    const meta = PERIOD_META[currentPeriod];

    const titleEl = document.getElementById("prog-chart-title");
    if (titleEl) titleEl.textContent = meta.chartTitle;

    if (weightChart) weightChart.destroy();

    weightChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: chart.labels,
        datasets: [{
          label: "Peso (kg)",
          data: chart.values,
          borderColor: "#0fb776",
          backgroundColor: "rgba(19, 209, 136, 0.12)",
          fill: true,
          tension: 0.35,
          pointBackgroundColor: "#0b1324",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: "#6b7a89", font: { size: 11 } } },
          y: { grid: { color: "#eef3f0" }, ticks: { color: "#6b7a89", font: { size: 11 } } }
        }
      }
    });
  }

  function renderAdherenceList(user) {
    const root = document.getElementById("adherence-list");
    if (!root) return;
    const week = currentPeriod === "7d"
      ? data.aggregate.liveAdherenceWeek(user.id)
      : data.aggregate.adherenceByWeekday(user.id, currentPeriod);
    root.innerHTML = week.map(d => `
      <div class="adherence-row">
        <span class="day">${d.day}</span>
        <span class="bar"><span style="width:${d.pct}%"></span></span>
        <span class="pct">${d.pct}%</span>
      </div>
    `).join("");

    const rangeEl = document.getElementById("prog-adh-range");
    if (rangeEl) rangeEl.textContent = PERIOD_META[currentPeriod].adhRange;
  }

  function renderKPIs(user) {
    const k = data.aggregate.kpis(user.id, currentPeriod);
    const meta = PERIOD_META[currentPeriod];

    document.getElementById("kpi-cal").textContent = k.avgCalories.toLocaleString("pt-BR") + " kcal";
    document.getElementById("kpi-hits").textContent = k.targetHits + " " + meta.hitsUnit;
    document.getElementById("kpi-weight").textContent = formatKg(k.weightChange);
    document.getElementById("kpi-pace").textContent = k.pace;

    const calLabel = document.getElementById("kpi-cal-label");
    const hitsLabel = document.getElementById("kpi-hits-label");
    const weightLabel = document.getElementById("kpi-weight-label");
    if (calLabel) calLabel.textContent = meta.calLabel;
    if (hitsLabel) hitsLabel.textContent = meta.hitsLabel;
    if (weightLabel) weightLabel.textContent = meta.weightLabel;
  }

  function renderHistory(user) {
    const root = document.getElementById("prog-ia-history");
    if (!root) return;
    const items = data.aiFeedback[user.id].history;
    root.innerHTML = items.map(i => `
      <div class="prog-ia-item">
        <div class="date">${i.date}</div>
        <p>${i.text}</p>
      </div>
    `).join("");
  }

  function bindOnce() {
    const root = document.querySelector('[data-screen="progress"]');
    if (!root || root.__bound) return;
    root.__bound = true;
    root.querySelector("#prog-filters").addEventListener("click", (e) => {
      const btn = e.target.closest(".chip[data-period]");
      if (!btn) return;
      currentPeriod = btn.dataset.period;
      syncChips();
      const user = state.user();
      drawChart(user);
      renderAdherenceList(user);
      renderKPIs(user);
    });
  }

  function renderAll() {
    syncChips();
    const user = state.user();
    drawChart(user);
    renderAdherenceList(user);
    renderKPIs(user);
    renderHistory(user);
  }

  router.on("progress", (params) => {
    bindOnce();
    if (params && params.period && PERIOD_META[params.period]) {
      currentPeriod = params.period;
    }
    renderAll();
  });

  state.subscribe("user", () => {
    if (router.parseHash() === "progress") renderAll();
  });
  state.subscribe("persona", () => {
    if (router.parseHash() === "progress") renderAll();
  });
})();
