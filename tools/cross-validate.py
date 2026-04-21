#!/usr/bin/env python3

import json
import subprocess
import sys
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

DAYS = 365
MONTH_DAYS = 30
HITS_THRESHOLD = 80
WD = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]
MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
WIN = {"7d": 7, "30d": 30, "6m": 180, "1a": 365}

U32 = 0xFFFFFFFF

def imul(a, b):
    return (a * b) & U32

def fnv1a(s: str) -> int:
    h = 2166136261
    for ch in s:
        h ^= ord(ch)
        h = imul(h, 16777619)
    return h & U32

def mulberry32(seed: int):
    state = [seed & U32]
    def f():
        state[0] = (state[0] + 0x6D2B79F5) & U32
        t = state[0]
        x = imul(t ^ (t >> 15), 1 | t)
        x = (x + imul(x ^ (x >> 7), 61 | x)) ^ x
        x &= U32
        return ((x ^ (x >> 14)) & U32) / 4294967296
    return f

import math as _math

def js_round(v):
    return _math.floor(v + 0.5)

def round_kg(v):
    return js_round(v * 10) / 10

def round_half_up(v):
    return js_round(v)

def weight_at(i, monthly, year_start):
    if i <= 150:
        slot = i / MONTH_DAYS
        lo = int(slot)
        t = slot - lo
        a0 = monthly[lo]
        a1 = monthly[min(lo + 1, 5)]
        return a0 + (a1 - a0) * t
    if i <= 330:
        t = (i - 150) / (330 - 150)
        return monthly[5] + (year_start - monthly[5]) * t
    slope = (year_start - monthly[5]) / (330 - 150)
    return year_start + slope * (i - 330)

def weekday_of_offset(i, today_wd):
    return ((today_wd - i) % 7 + 7) % 7

def build_series(persona_id, anchors, today_wd):
    a = anchors[persona_id]
    weight = [round_kg(weight_at(i, a["monthly"], a["yearStart"])) for i in range(DAYS)]
    adherence = []
    r = mulberry32(fnv1a(persona_id))
    for i in range(DAYS):
        wd = weekday_of_offset(i, today_wd)
        base = a["week"][wd]
        if i < 7:
            v = base
        else:
            noise = (r() - 0.5) * 2 * a["adhNoise"]
            v = base + noise
        adherence.append(max(0, min(100, round_half_up(v))))
    calories = [round_half_up(a["calTarget"] * adherence[i] / 100) for i in range(DAYS)]
    return {"weight": weight, "adherence": adherence, "calories": calories}

def chart(persona_id, period, series, anchors, today_wd):
    s = series[persona_id]["weight"]
    if period == "7d":
        labels = []
        values = []
        for k in range(6, -1, -1):
            labels.append(WD[weekday_of_offset(k, today_wd)])
            values.append(s[k])
        return {"labels": labels, "values": values}
    if period == "30d":
        return {"labels": ["S1", "S2", "S3", "S4"], "values": [s[21], s[14], s[7], s[0]]}
    if period == "6m":
        import datetime as dt
        now_month = dt.date.today().month - 1
        labels = [MONTHS[(now_month - k + 12) % 12] for k in range(5, -1, -1)]
        return {"labels": labels, "values": [s[150], s[120], s[90], s[60], s[30], s[0]]}
    if period == "1a":
        import datetime as dt
        now_month = dt.date.today().month - 1
        labels = []
        values = []
        for k in range(11, -1, -1):
            labels.append(MONTHS[(now_month - k + 12) % 12])
            values.append(s[k * 30])
        return {"labels": labels, "values": values}
    raise ValueError(period)

def adherence_by_weekday(persona_id, period, series, today_wd):
    s = series[persona_id]["adherence"]
    win = WIN[period]
    buckets = [[] for _ in range(7)]
    for i in range(win):
        buckets[weekday_of_offset(i, today_wd)].append(s[i])
    return [{"day": WD[wd], "pct": round_half_up(sum(b) / len(b)) if b else 0} for wd, b in enumerate(buckets)]

def pace_for(objective, change, window_days, adh_mean):
    expected = 0.10 if objective == "Hipertrofia" else -0.20
    observed = change / (window_days / 7)
    ratio = observed / expected
    if ratio >= 0.75 and adh_mean >= 75:
        return "Consistente"
    if ratio >= 0.45:
        return "No ritmo"
    if ratio >= 0.15:
        return "Em adaptação"
    return "Atenção"

def kpis(persona_id, period, series, anchors, today_wd):
    a = anchors[persona_id]
    s = series[persona_id]
    win = WIN[period]
    adh_win = s["adherence"][:win]
    cal_win = s["calories"][:win]
    adh_mean = sum(adh_win) / len(adh_win)
    avg_calories = round_half_up(sum(cal_win) / len(cal_win))
    target_hits = sum(1 for v in adh_win if v >= HITS_THRESHOLD)
    c = chart(persona_id, period, series, anchors, today_wd)
    weight_change = round_kg(c["values"][-1] - c["values"][0])
    pace = pace_for(a["objective"], weight_change, win, adh_mean)
    return {
        "avgCalories": avg_calories,
        "targetHits": target_hits,
        "weightChange": weight_change,
        "pace": pace,
        "adhMean": round_half_up(adh_mean)
    }

def main():
    result = subprocess.run(
        ["node", str(ROOT / "tools/dump-series.mjs")],
        capture_output=True, text=True, check=True
    )
    js = json.loads(result.stdout)

    anchors = js["anchors"]
    today_wd = js["todayWeekday"]

    failed = 0
    failures = []

    def chk(name, a, b):
        nonlocal failed
        if a != b:
            failed += 1
            failures.append((name, a, b))

    for pid in anchors.keys():
        py_series = build_series(pid, anchors, today_wd)
        js_series = js["series"][pid]

        chk(f"{pid}.weight", py_series["weight"], js_series["weight"])
        chk(f"{pid}.adherence", py_series["adherence"], js_series["adherence"])
        chk(f"{pid}.calories", py_series["calories"], js_series["calories"])

        for p in ["7d", "30d", "6m", "1a"]:
            py_chart = chart(pid, p, {pid: py_series}, anchors, today_wd)
            py_adh = adherence_by_weekday(pid, p, {pid: py_series}, today_wd)
            py_k = kpis(pid, p, {pid: py_series}, anchors, today_wd)
            jsagg = js["aggregates"][pid][p]

            chk(f"{pid}/{p}.chart.values", py_chart["values"], jsagg["chart"]["values"])
            chk(f"{pid}/{p}.chart.labels", py_chart["labels"], jsagg["chart"]["labels"])
            chk(f"{pid}/{p}.adherence", py_adh, jsagg["adherence"])
            chk(f"{pid}/{p}.kpis.avgCalories", py_k["avgCalories"], jsagg["kpis"]["avgCalories"])
            chk(f"{pid}/{p}.kpis.targetHits", py_k["targetHits"], jsagg["kpis"]["targetHits"])
            chk(f"{pid}/{p}.kpis.weightChange", py_k["weightChange"], jsagg["kpis"]["weightChange"])
            chk(f"{pid}/{p}.kpis.pace", py_k["pace"], jsagg["kpis"]["pace"])
            chk(f"{pid}/{p}.kpis.adhMean", py_k["adhMean"], jsagg["kpis"]["adhMean"])

    if failed:
        print(f"CROSS-VALIDATE FAIL: {failed} divergências")
        for name, py, jsv in failures[:20]:
            print(f"  - {name}")
            print(f"      py: {py}")
            print(f"      js: {jsv}")
        sys.exit(1)
    print(f"cross-validate ok (JS == Python byte-a-byte)")

if __name__ == "__main__":
    main()
