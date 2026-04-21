(function () {
  const { aggregate } = window.Tukan.data;
  const ids = ["gustavo", "ana", "marina"];
  const adherence = {};
  ids.forEach(id => {
    const k = aggregate.kpis(id, "7d");
    adherence[id] = {
      week: aggregate.adherenceByWeekday(id, "7d"),
      avgCalories: k.avgCalories,
      targetHits: k.targetHits,
      pace: k.pace
    };
  });

  window.Tukan.data.adherence = adherence;
})();
