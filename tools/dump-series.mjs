#!/usr/bin/env node
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const { series, aggregate, ANCHORS, _internals } = require(resolve(root, "js/data/series.js"));

const periods = ["7d", "30d", "6m", "1a"];
const out = {
  anchors: ANCHORS,
  todayWeekday: _internals.todayWeekday(),
  series: {},
  aggregates: {}
};
for (const id of Object.keys(ANCHORS)) {
  out.series[id] = series[id];
  out.aggregates[id] = {};
  for (const p of periods) {
    out.aggregates[id][p] = {
      chart: aggregate.chart(id, p),
      adherence: aggregate.adherenceByWeekday(id, p),
      kpis: aggregate.kpis(id, p)
    };
  }
}
console.log(JSON.stringify(out));
