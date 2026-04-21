#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import vm from "node:vm";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const sandbox = { window: {}, console };
sandbox.window.window = sandbox.window;
vm.createContext(sandbox);

const files = [
  "js/data/personas.js",
  "js/data/plan.js",
  "js/data/series.js",
  "js/data/weight-history.js",
  "js/data/adherence.js",
  "js/data/ai-feedback.js"
];
for (const f of files) {
  const code = readFileSync(resolve(root, f), "utf8");
  vm.runInContext(code, sandbox, { filename: f });
}

const T = sandbox.window.Tukan;
let failed = 0;
const failures = [];
function ok(name, cond, detail) {
  if (cond) return;
  failed++;
  failures.push({ name, detail });
}

ok("Tukan namespace exists", T && T.data);
ok("data.series present", T.data.series && T.data.series.gustavo && T.data.series.gustavo.weight.length === 365);
ok("data.aggregate functions present", typeof T.data.aggregate.chart === "function");
ok("data.weight.gustavo populated", T.data.weight && T.data.weight.gustavo && T.data.weight.gustavo.values.length === 6);
ok("data.weight.gustavo.values last == 74.9", T.data.weight.gustavo.values[5] === 74.9, { got: T.data.weight.gustavo.values[5] });
ok("data.weight.gustavo.estimatedChange == -5.1", T.data.weight.gustavo.estimatedChange === -5.1, { got: T.data.weight.gustavo.estimatedChange });
ok("data.adherence.gustavo.week length 7", T.data.adherence.gustavo.week.length === 7);

const gusAvg = Math.round(T.data.adherence.gustavo.week.reduce((s, d) => s + d.pct, 0) / 7);
ok("dashboard computed gustavo adherence avg == 82", gusAvg === 82, { got: gusAvg });

const anaAvg = Math.round(T.data.adherence.ana.week.reduce((s, d) => s + d.pct, 0) / 7);
ok("dashboard computed ana adherence avg == 56", anaAvg === 56, { got: anaAvg });

const marAvg = Math.round(T.data.adherence.marina.week.reduce((s, d) => s + d.pct, 0) / 7);
ok("dashboard computed marina adherence avg == 77", marAvg === 77, { got: marAvg });

const k6 = T.data.aggregate.kpis("gustavo", "6m");
ok("gustavo 6m weightChange == -5.1", k6.weightChange === -5.1, { got: k6.weightChange });

const k1 = T.data.aggregate.kpis("gustavo", "1a");
ok("gustavo 1a weightChange == -7.2", k1.weightChange === -7.2, { got: k1.weightChange });

const k30 = T.data.aggregate.kpis("gustavo", "30d");
ok("gustavo 30d targetHits int >= 0", Number.isInteger(k30.targetHits) && k30.targetHits >= 0, { got: k30.targetHits });

const c6 = T.data.aggregate.chart("gustavo", "6m");
ok("gustavo 6m chart values == expected", JSON.stringify(c6.values) === JSON.stringify([80.0, 78.9, 77.6, 76.4, 75.5, 74.9]), { got: c6.values });

const w7 = T.data.aggregate.adherenceByWeekday("gustavo", "7d").map(d => d.pct);
const w30 = T.data.aggregate.adherenceByWeekday("gustavo", "30d").map(d => d.pct);
ok("gustavo 30d adherence differs from 7d (noise applied)", JSON.stringify(w7) !== JSON.stringify(w30), { w7, w30 });

const gusFb = T.data.aiFeedback.gustavo;
ok("aiFeedback.gustavo é objeto computado", gusFb && typeof gusFb === "object");
ok("aiFeedback.gustavo tem patternTitle string", typeof gusFb.patternTitle === "string" && gusFb.patternTitle.length > 0);
ok("aiFeedback.gustavo tem patternBody string", typeof gusFb.patternBody === "string" && gusFb.patternBody.length > 0);
ok("aiFeedback.gustavo tem summary string", typeof gusFb.summary === "string" && gusFb.summary.length > 0);
ok("aiFeedback.gustavo chips tem 3 itens", Array.isArray(gusFb.chips) && gusFb.chips.length === 3, { got: gusFb.chips });
ok("aiFeedback.gustavo adjustments tem 3 itens", Array.isArray(gusFb.adjustments) && gusFb.adjustments.length === 3, { got: gusFb.adjustments });
ok("aiFeedback.gustavo history começa com 'Hoje'", Array.isArray(gusFb.history) && gusFb.history[0] && gusFb.history[0].date === "Hoje", { got: gusFb.history && gusFb.history[0] });
ok("aiFeedback.gustavo history preserva entrada histórica base", gusFb.history.some(h => h.text.includes("82%")), { got: gusFb.history.map(h => h.date) });

const marFb = T.data.aiFeedback.marina;
ok("aiFeedback.marina sinaliza ofensiva em perigo", marFb.patternTitle.toLowerCase().includes("perigo"), { got: marFb.patternTitle });

const first = T.data.aiFeedback.gustavo;
const second = T.data.aiFeedback.gustavo;
ok("aiFeedback é Proxy dinâmico (nova instância por leitura)", first !== second);

ok("aggregate.liveAdherenceWeek exposto", typeof T.data.aggregate.liveAdherenceWeek === "function");
const liveGus = T.data.aggregate.liveAdherenceWeek("gustavo");
const staticGus = T.data.aggregate.adherenceByWeekday("gustavo", "7d");
ok("liveAdherenceWeek sem state cai no fallback estático", JSON.stringify(liveGus) === JSON.stringify(staticGus));

const gu = T.data.personas.gustavo;
Object.keys(gu.todayMeals).forEach(k => {
  gu.todayMeals[k] = { logged: true, optionId: gu.todayMeals[k].optionId || "x" };
});
const fbComplete = T.data.computeFeedback("gustavo");
ok("day-complete chip usa streak.current sem +1",
   fbComplete.chips[2] === `Ofensiva ${gu.streak.current} dias`,
   { got: fbComplete.chips[2], expected: `Ofensiva ${gu.streak.current} dias` });
ok("day-complete body não contém 'prestes a virar'",
   !fbComplete.patternBody.includes("prestes a virar"),
   { got: fbComplete.patternBody });
ok("day-complete body cita streak.current",
   fbComplete.patternBody.includes(`${gu.streak.current} dias consecutivos`),
   { got: fbComplete.patternBody });

if (failed > 0) {
  console.log(`SMOKE FAIL: ${failed} failures`);
  for (const f of failures) console.log(" -", f.name, f.detail ? JSON.stringify(f.detail) : "");
  process.exit(1);
}
console.log("smoke ok");
