(function () {
  const date = {
    todayISO() {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return d.toISOString().slice(0, 10);
    },
    yesterdayISO() {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      d.setHours(0, 0, 0, 0);
      return d.toISOString().slice(0, 10);
    },
    addDaysISO(iso, days) {
      const d = new Date(iso + "T00:00:00");
      d.setDate(d.getDate() + days);
      return d.toISOString().slice(0, 10);
    },
    diffDays(aISO, bISO) {
      const a = new Date(aISO + "T00:00:00").getTime();
      const b = new Date(bISO + "T00:00:00").getTime();
      return Math.round((a - b) / 86400000);
    },
    weekdayShort(iso) {
      const d = new Date(iso + "T00:00:00");
      return ["S", "T", "Q", "Q", "S", "S", "D"][d.getDay() === 0 ? 6 : d.getDay() - 1];
    },
    weekdayFull(iso) {
      const d = new Date(iso + "T00:00:00");
      return ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"][d.getDay() === 0 ? 6 : d.getDay() - 1];
    },
    hoursNow() {
      return new Date().getHours();
    },
    greeting() {
      const h = date.hoursNow();
      if (h < 5) return "Boa noite";
      if (h < 12) return "Bom dia";
      if (h < 18) return "Boa tarde";
      return "Boa noite";
    },
    weekRange(endISO) {
      const out = [];
      for (let i = 6; i >= 0; i--) {
        out.push(date.addDaysISO(endISO, -i));
      }
      return out;
    }
  };

  window.Tukan = window.Tukan || {};
  window.Tukan.date = date;
})();
