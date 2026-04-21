#!/usr/bin/env node

import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const { series, aggregate, ANCHORS, _internals } = require(resolve(root, "js/data/series.js"));

let failed = 0;
let passed = 0;
const failures = [];

function ok(name, cond, detail) {
  if (cond) {
    passed++;
  } else {
    failed++;
    failures.push({ name, detail });
  }
}
function eq(a, b) { return a === b; }
function near(a, b, tol) { return Math.abs(a - b) <= tol; }
function arrEq(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}
function arrNear(a, b, tol) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (Math.abs(a[i] - b[i]) > tol) return false;
  return true;
}

const ids = ["gustavo", "ana", "marina"];
const periods = ["7d", "30d", "6m", "1a"];
const todayWd = _internals.todayWeekday();

function wd(i) {
  return _internals.weekdayOfOffset(i, todayWd);
}

for (const id of ids) {
  const a = ANCHORS[id];
  const s = series[id];

  ok(`[${id}] series.weight.length=365`, s.weight.length === 365);
  ok(`[${id}] series.adherence.length=365`, s.adherence.length === 365);
  ok(`[${id}] series.calories.length=365`, s.calories.length === 365);

  ok(`[${id}] weight[0] == monthly[0]`, s.weight[0] === a.monthly[0], { got: s.weight[0], want: a.monthly[0] });
  ok(`[${id}] weight[30] == monthly[1]`, s.weight[30] === a.monthly[1], { got: s.weight[30], want: a.monthly[1] });
  ok(`[${id}] weight[60] == monthly[2]`, s.weight[60] === a.monthly[2], { got: s.weight[60], want: a.monthly[2] });
  ok(`[${id}] weight[90] == monthly[3]`, s.weight[90] === a.monthly[3], { got: s.weight[90], want: a.monthly[3] });
  ok(`[${id}] weight[120] == monthly[4]`, s.weight[120] === a.monthly[4], { got: s.weight[120], want: a.monthly[4] });
  ok(`[${id}] weight[150] == monthly[5]`, s.weight[150] === a.monthly[5], { got: s.weight[150], want: a.monthly[5] });
  ok(`[${id}] weight[330] == yearStart`, s.weight[330] === a.yearStart, { got: s.weight[330], want: a.yearStart });

  let maxJump = 0;
  for (let i = 1; i < s.weight.length; i++) {
    const j = Math.abs(s.weight[i] - s.weight[i - 1]);
    if (j > maxJump) maxJump = j;
  }
  ok(`[${id}] weight day-to-day jump <= 0.5`, maxJump <= 0.5, { maxJump });

  for (let i = 0; i < 7; i++) {
    const base = a.week[wd(i)];
    ok(`[${id}] adherence[${i}] == week[${wd(i)}]=${base}`, s.adherence[i] === base, { got: s.adherence[i], want: base });
  }

  let inRange = true;
  for (const v of s.adherence) if (v < 0 || v > 100) { inRange = false; break; }
  ok(`[${id}] adherence in [0,100]`, inRange);

  let calPos = true;
  for (const v of s.calories) if (v <= 0) { calPos = false; break; }
  ok(`[${id}] calories > 0`, calPos);

  for (let i = 0; i < s.calories.length; i++) {
    const expected = Math.round(a.calTarget * s.adherence[i] / 100);
    if (s.calories[i] !== expected) {
      ok(`[${id}] calories[${i}] derived from adherence`, false, { got: s.calories[i], want: expected });
      break;
    }
  }

  const sumWeek = a.week.reduce((x, y) => x + y, 0);
  const weekMean = sumWeek / 7;
  const adhMean365 = s.adherence.reduce((x, y) => x + y, 0) / s.adherence.length;
  ok(`[${id}] 365d adherence mean ≈ weekly mean (±3)`, Math.abs(adhMean365 - weekMean) <= 3, { adhMean365, weekMean });

  for (const p of periods) {
    const c = aggregate.chart(id, p);
    const k = aggregate.kpis(id, p);
    const w = aggregate.adherenceByWeekday(id, p);

    ok(`[${id}/${p}] chart.labels.length == values.length`, c.labels.length === c.values.length);
    ok(`[${id}/${p}] chart.values[last] == weight[0]`, c.values[c.values.length - 1] === s.weight[0]);
    let chartOk = true;
    for (const v of c.values) if (typeof v !== "number" || Number.isNaN(v)) { chartOk = false; break; }
    ok(`[${id}/${p}] chart.values all finite`, chartOk);

    ok(`[${id}/${p}] adherenceByWeekday.length == 7`, w.length === 7);
    let wOrdered = true;
    const wdNames = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
    for (let i = 0; i < 7; i++) if (w[i].day !== wdNames[i]) { wOrdered = false; break; }
    ok(`[${id}/${p}] adherence bars ordered Seg..Dom`, wOrdered);
    let pctRange = true;
    for (const d of w) if (d.pct < 0 || d.pct > 100) { pctRange = false; break; }
    ok(`[${id}/${p}] adherence pct in [0,100]`, pctRange);

    const expectedChange = Math.round((c.values[c.values.length - 1] - c.values[0]) * 10) / 10;
    ok(`[${id}/${p}] kpi.weightChange == chart end − start`, k.weightChange === expectedChange, { kpi: k.weightChange, chartDiff: expectedChange });

    const win = _internals.WIN[p];
    const adhWin = s.adherence.slice(0, win);
    const expectedAvgCal = Math.round(adhWin.reduce((x, y) => x + Math.round(a.calTarget * y / 100), 0) / win);
    ok(`[${id}/${p}] kpi.avgCalories matches series calories mean`, k.avgCalories === expectedAvgCal, { kpi: k.avgCalories, want: expectedAvgCal });

    const expectedHits = adhWin.filter(v => v >= _internals.HITS_THRESHOLD).length;
    ok(`[${id}/${p}] kpi.targetHits matches count(adh >= 80)`, k.targetHits === expectedHits, { kpi: k.targetHits, want: expectedHits });

    ok(`[${id}/${p}] pace in allowed set`, ["Consistente", "No ritmo", "Em adaptação", "Atenção"].includes(k.pace), { got: k.pace });
  }

  const w7 = aggregate.adherenceByWeekday(id, "7d");
  const pct7 = w7.map(d => d.pct);
  ok(`[${id}] 7d adherence bars == ANCHORS.week`, arrEq(pct7, a.week), { got: pct7, want: a.week });

  const chart6m = aggregate.chart(id, "6m");
  const expected6m = [a.monthly[5], a.monthly[4], a.monthly[3], a.monthly[2], a.monthly[1], a.monthly[0]];
  ok(`[${id}] chart('6m').values == monthly reversed`, arrEq(chart6m.values, expected6m), { got: chart6m.values, want: expected6m });

  const k7 = aggregate.kpis(id, "7d");
  const expectedHits7 = a.week.filter(v => v >= _internals.HITS_THRESHOLD).length;
  ok(`[${id}] 7d targetHits matches stored semantic`, k7.targetHits === expectedHits7, { got: k7.targetHits, want: expectedHits7 });

  const chart1a = aggregate.chart(id, "1a");
  ok(`[${id}] chart('1a').values.length == 12`, chart1a.values.length === 12);
  ok(`[${id}] chart('1a').values[0] == yearStart (${a.yearStart})`, chart1a.values[0] === a.yearStart, { got: chart1a.values[0], want: a.yearStart });
  ok(`[${id}] chart('1a').values[11] == today weight (${a.monthly[0]})`, chart1a.values[11] === a.monthly[0], { got: chart1a.values[11], want: a.monthly[0] });
}

const personasFile = readFileSync(resolve(root, "js/data/personas.js"), "utf8");
function personaNumber(id, field) {
  const re = new RegExp(id + "[\\s\\S]*?" + field + ":\\s*([\\d.]+)");
  const m = personasFile.match(re);
  return m ? parseFloat(m[1]) : null;
}
for (const id of ids) {
  const pWeight = personaNumber(id, "weightKg");
  const pCal = personaNumber(id, "caloriesTarget");
  ok(`[${id}] personas.weightKg == ANCHORS.monthly[0]`, pWeight === ANCHORS[id].monthly[0], { pWeight, anchor: ANCHORS[id].monthly[0] });
  ok(`[${id}] personas.caloriesTarget == ANCHORS.calTarget`, pCal === ANCHORS[id].calTarget, { pCal, anchor: ANCHORS[id].calTarget });
}

const aiFb = readFileSync(resolve(root, "js/data/ai-feedback.js"), "utf8");
const gusWeekMean = Math.round(ANCHORS.gustavo.week.reduce((x, y) => x + y, 0) / 7);
ok(`ai-feedback: Gustavo aderência = ${gusWeekMean}%`, aiFb.includes(`em ${gusWeekMean}%`), { want: gusWeekMean });

const gusHits = ANCHORS.gustavo.week.filter(v => v >= _internals.HITS_THRESHOLD).length;
ok(`ai-feedback: Gustavo meta de ${gusHits} dias`, aiFb.includes(`Meta de ${gusHits} dias`), { want: gusHits });

const monthChangeAbs = Math.round(Math.abs(ANCHORS.gustavo.monthly[2] - ANCHORS.gustavo.monthly[1]) * 10) / 10;
const monthChangeStr = monthChangeAbs.toString().replace(".", ",");
ok(`ai-feedback: Gustavo queda ${monthChangeStr} kg (monthly[1]↔monthly[2])`, aiFb.includes(`Queda de ${monthChangeStr} kg`), { want: monthChangeStr });

const marJanAbr = Math.round(Math.abs(ANCHORS.marina.monthly[0] - ANCHORS.marina.monthly[3]) * 10) / 10;
const marJanAbrStr = marJanAbr.toString().replace(".", ",");
ok(`ai-feedback: Marina +${marJanAbrStr} kg desde janeiro`, aiFb.includes(`+${marJanAbrStr} kg de massa desde janeiro`), { want: marJanAbrStr });

const adhFile = readFileSync(resolve(root, "js/data/adherence.js"), "utf8");
ok("adherence.js uses aggregate.adherenceByWeekday", adhFile.includes("aggregate.adherenceByWeekday"));
ok("adherence.js uses aggregate.kpis", adhFile.includes("aggregate.kpis"));

const whFile = readFileSync(resolve(root, "js/data/weight-history.js"), "utf8");
ok("weight-history.js uses aggregate.chart", whFile.includes("aggregate.chart"));
ok("weight-history.js uses aggregate.kpis", whFile.includes("aggregate.kpis"));

const indexHtml = readFileSync(resolve(root, "index.html"), "utf8");
const iSeries = indexHtml.indexOf("js/data/series.js");
const iWh = indexHtml.indexOf("js/data/weight-history.js");
const iAdh = indexHtml.indexOf("js/data/adherence.js");
ok("index.html: series.js loaded before weight-history.js", iSeries !== -1 && iSeries < iWh);
ok("index.html: series.js loaded before adherence.js", iSeries !== -1 && iSeries < iAdh);

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("\nFailures:");
  for (const f of failures) {
    console.log(`  - ${f.name}`);
    if (f.detail) console.log(`      ${JSON.stringify(f.detail)}`);
  }
  process.exit(1);
}
