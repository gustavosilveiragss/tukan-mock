(function () {
  const { aggregate } = window.Tukan.data;
  const ids = ["gustavo", "ana", "marina"];
  const weight = {};
  ids.forEach(id => {
    const c = aggregate.chart(id, "6m");
    const k = aggregate.kpis(id, "6m");
    weight[id] = {
      months: c.labels,
      values: c.values,
      estimatedChange: k.weightChange
    };
  });

  window.Tukan.data.weight = weight;
})();
