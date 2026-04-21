(function () {
  const catalog = [
    { id: "sug-wrap-frango", name: "Wrap de frango", kcal: 307, macros: "22g prot, 30g carb, 11g gord", note: "Sugestão compatível com seu plano", mealSlot: "lanche" },
    { id: "sug-bowl-veg", name: "Bowl vegetariano", kcal: 388, macros: "18g prot, 52g carb, 12g gord", note: "Sugestão compatível com seu plano", mealSlot: "jantar" },
    { id: "sug-shake-proteico", name: "Shake proteico", kcal: 212, macros: "30g prot, 14g carb, 4g gord", note: "Sugestão compatível com seu plano", mealSlot: "lanche" },
    { id: "sug-omelete", name: "Omelete de espinafre", kcal: 282, macros: "20g prot, 10g carb, 18g gord", note: "Sugestão compatível com seu plano", mealSlot: "jantar" },
    { id: "sug-tapioca", name: "Tapioca com queijo branco", kcal: 296, macros: "16g prot, 40g carb, 8g gord", note: "Sugestão compatível com seu plano", mealSlot: "cafe" },
    { id: "sug-frutas", name: "Mix de frutas + iogurte", kcal: 178, macros: "8g prot, 32g carb, 2g gord", note: "Sugestão compatível com seu plano", mealSlot: "lanche" }
  ];

  window.Tukan = window.Tukan || {};
  window.Tukan.data = window.Tukan.data || {};
  window.Tukan.data.mealsCatalog = catalog;
})();
