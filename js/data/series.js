(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    root.Tukan = root.Tukan || {};
    root.Tukan.data = root.Tukan.data || {};
    root.Tukan.data.series = api.series;
    root.Tukan.data.aggregate = api.aggregate;
    root.Tukan.data.ANCHORS = api.ANCHORS;
  }
})(typeof window !== "undefined" ? window : globalThis, function () {
  const DAYS = 365;
  const MONTH_DAYS = 30;
  const HITS_THRESHOLD = 80;
  const WD_NAMES = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  const MONTH_NAMES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const WIN = { "7d": 7, "30d": 30, "6m": 180, "1a": 365 };

  const ANCHORS = {
    gustavo: {
      monthly: [74.9, 75.5, 76.4, 77.6, 78.9, 80.0],
      yearStart: 82.1,
      week: [72, 84, 79, 90, 86, 76, 88],
      adhNoise: 4,
      objective: "Emagrecimento",
      calTarget: 1655
    },
    ana: {
      monthly: [68.3, 68.4, 68.4, 68.5, 68.6, 68.8],
      yearStart: 69.1,
      week: [40, 58, 52, 65, 60, 48, 70],
      adhNoise: 5,
      objective: "Emagrecimento",
      calTarget: 1654
    },
    marina: {
      monthly: [62.5, 62.1, 61.8, 61.3, 60.8, 60.1],
      yearStart: 59.4,
      week: [88, 92, 85, 94, 80, 70, 32],
      adhNoise: 6,
      objective: "Hipertrofia",
      calTarget: 2028
    }
  };

  function mulberry32(seed) {
    let t = seed >>> 0;
    return function () {
      t = (t + 0x6D2B79F5) | 0;
      let x = Math.imul(t ^ (t >>> 15), 1 | t);
      x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
  }
  function fnv1a(s) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function todayWeekday(now) {
    const d = now || new Date();
    return (d.getDay() + 6) % 7;
  }
  function weekdayOfOffset(i, todayWd) {
    return (((todayWd - i) % 7) + 7) % 7;
  }
  function roundKg(v) {
    return Math.round(v * 10) / 10;
  }

  function weightAt(i, a) {
    if (i <= 150) {
      const slot = i / MONTH_DAYS;
      const lo = Math.floor(slot);
      const t = slot - lo;
      const a0 = a.monthly[lo];
      const a1 = a.monthly[Math.min(lo + 1, 5)];
      return a0 + (a1 - a0) * t;
    }
    if (i <= 330) {
      const t = (i - 150) / (330 - 150);
      return a.monthly[5] + (a.yearStart - a.monthly[5]) * t;
    }
    const slope = (a.yearStart - a.monthly[5]) / (330 - 150);
    return a.yearStart + slope * (i - 330);
  }

  function buildSeries(personaId, todayWd) {
    const a = ANCHORS[personaId];
    const weight = new Array(DAYS);
    for (let i = 0; i < DAYS; i++) weight[i] = roundKg(weightAt(i, a));

    const adherence = new Array(DAYS);
    const r = mulberry32(fnv1a(personaId));
    for (let i = 0; i < DAYS; i++) {
      const wd = weekdayOfOffset(i, todayWd);
      const base = a.week[wd];
      let v;
      if (i < 7) {
        v = base;
      } else {
        const noise = (r() - 0.5) * 2 * a.adhNoise;
        v = base + noise;
      }
      adherence[i] = Math.max(0, Math.min(100, Math.round(v)));
    }

    const calories = new Array(DAYS);
    for (let i = 0; i < DAYS; i++) {
      calories[i] = Math.round(a.calTarget * adherence[i] / 100);
    }

    return { weight, adherence, calories };
  }

  const todayWd = todayWeekday();
  const series = {};
  Object.keys(ANCHORS).forEach(id => { series[id] = buildSeries(id, todayWd); });

  function meanOf(arr) {
    let s = 0;
    for (let i = 0; i < arr.length; i++) s += arr[i];
    return arr.length ? s / arr.length : 0;
  }

  function chart(personaId, period) {
    const s = series[personaId].weight;
    if (period === "7d") {
      const labels = [];
      const values = [];
      for (let k = 6; k >= 0; k--) {
        labels.push(WD_NAMES[weekdayOfOffset(k, todayWd)]);
        values.push(s[k]);
      }
      return { labels, values };
    }
    if (period === "30d") {
      return {
        labels: ["S1", "S2", "S3", "S4"],
        values: [s[21], s[14], s[7], s[0]]
      };
    }
    if (period === "6m") {
      const nowMonth = new Date().getMonth();
      const labels = [];
      for (let k = 5; k >= 0; k--) {
        labels.push(MONTH_NAMES[(nowMonth - k + 12) % 12]);
      }
      return {
        labels,
        values: [s[150], s[120], s[90], s[60], s[30], s[0]]
      };
    }
    if (period === "1a") {
      const nowMonth = new Date().getMonth();
      const labels = [];
      const values = [];
      for (let k = 11; k >= 0; k--) {
        labels.push(MONTH_NAMES[(nowMonth - k + 12) % 12]);
        values.push(s[k * 30]);
      }
      return { labels, values };
    }
    throw new Error("unknown period: " + period);
  }

  function adherenceByWeekday(personaId, period) {
    const s = series[personaId].adherence;
    const win = WIN[period];
    const buckets = [[], [], [], [], [], [], []];
    for (let i = 0; i < win; i++) {
      buckets[weekdayOfOffset(i, todayWd)].push(s[i]);
    }
    return buckets.map((arr, wd) => ({
      day: WD_NAMES[wd],
      pct: arr.length ? Math.round(meanOf(arr)) : 0
    }));
  }

  function liveAdherenceWeek(personaId) {
    const base = adherenceByWeekday(personaId, "7d");
    const st = (typeof window !== "undefined" && window.Tukan && window.Tukan.state) || null;
    const user = st && st.user ? st.user(personaId) : null;
    if (!user) return base;
    const slots = user.todayMeals || {};
    const total = Object.keys(slots).length;
    if (total === 0) return base;
    const logged = Object.values(slots).filter(m => m && m.logged).length;
    const pctToday = Math.round((logged / total) * 100);
    const todayWdIdx = todayWeekday();
    return base.map((d, wd) => wd === todayWdIdx ? { day: d.day, pct: pctToday } : d);
  }

  function paceFor(objective, weightChangeKg, windowDays, adhMean) {
    const expectedPerWeek = objective === "Hipertrofia" ? 0.10 : -0.20;
    const observedPerWeek = weightChangeKg / (windowDays / 7);
    const ratio = observedPerWeek / expectedPerWeek;
    if (ratio >= 0.75 && adhMean >= 75) return "Consistente";
    if (ratio >= 0.45) return "No ritmo";
    if (ratio >= 0.15) return "Em adaptação";
    return "Atenção";
  }

  function kpis(personaId, period) {
    const a = ANCHORS[personaId];
    const s = series[personaId];
    const win = WIN[period];
    const adhWin = s.adherence.slice(0, win);
    const calWin = s.calories.slice(0, win);
    const adhMean = meanOf(adhWin);
    const avgCalories = Math.round(meanOf(calWin));
    const targetHits = adhWin.filter(v => v >= HITS_THRESHOLD).length;
    const c = chart(personaId, period);
    const weightChange = roundKg(c.values[c.values.length - 1] - c.values[0]);
    const pace = paceFor(a.objective, weightChange, win, adhMean);
    return { avgCalories, targetHits, weightChange, pace, adhMean: Math.round(adhMean) };
  }

  const aggregate = { chart, adherenceByWeekday, kpis, liveAdherenceWeek };

  return { series, aggregate, ANCHORS, _internals: { buildSeries, weightAt, weekdayOfOffset, todayWeekday, WIN, HITS_THRESHOLD, WD_NAMES, MONTH_NAMES } };
});
