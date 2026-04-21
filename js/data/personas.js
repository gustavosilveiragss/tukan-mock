(function () {
  const today = (function () {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString().slice(0, 10);
  })();
  const daysAgo = (n) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  };

  const personas = {
    gustavo: {
      id: "gustavo",
      profile: {
        name: "Gustavo Silveira",
        initial: "G",
        age: 22,
        heightCm: 178,
        weightKg: 74.9,
        targetWeightKg: 72,
        targetMonths: 3,
        sex: "Masculino",
        objective: "Emagrecimento",
        fasting: "Não",
        restrictions: [],
        preferences: ["Onívoro"],
        notes: "Faculdade + trabalho, baixo tempo para cozinhar",
        routine: "4 refeições por dia",
        weeklyBudget: 380,
        mealsPerDay: 4,
        caloriesTarget: 1655,
        waterTargetL: 2.5,
        waterConsumedL: 1.8
      },
      waterLog: [
        { id: "w-seed-1", time: "07:30", ml: 300 },
        { id: "w-seed-2", time: "09:45", ml: 500 },
        { id: "w-seed-3", time: "12:10", ml: 400 },
        { id: "w-seed-4", time: "14:20", ml: 350 },
        { id: "w-seed-5", time: "16:05", ml: 250 }
      ],
      streak: {
        current: 15,
        longest: 15,
        lastLogDate: daysAgo(1),
        weekHistory: [
          { date: daysAgo(6), completed: true },
          { date: daysAgo(5), completed: true },
          { date: daysAgo(4), completed: true },
          { date: daysAgo(3), completed: true },
          { date: daysAgo(2), completed: true },
          { date: daysAgo(1), completed: true },
          { date: today, completed: false }
        ],
        dangerZone: false,
        description: "Consistente, pronto para superar recorde."
      },
      todayMeals: {
        "cafe": { logged: true, optionId: "cafe-iogurte" },
        "almoco": { logged: true, optionId: "almoco-frango" },
        "lanche": { logged: true, optionId: "lanche-sanduiche" },
        "jantar": { logged: false, optionId: null }
      },
      favorites: [],
      planApplied: false
    },
    ana: {
      id: "ana",
      profile: {
        name: "Ana Costa",
        initial: "A",
        age: 27,
        heightCm: 165,
        weightKg: 68.3,
        targetWeightKg: 64,
        targetMonths: 5,
        sex: "Feminino",
        objective: "Emagrecimento",
        fasting: "Não",
        restrictions: ["Lactose"],
        preferences: ["Vegetariano"],
        notes: "",
        routine: "5 refeições por dia",
        weeklyBudget: 300,
        mealsPerDay: 5,
        caloriesTarget: 1654,
        waterTargetL: 2.2,
        waterConsumedL: 1.1
      },
      waterLog: [
        { id: "w-seed-1", time: "08:00", ml: 250 },
        { id: "w-seed-2", time: "10:30", ml: 300 },
        { id: "w-seed-3", time: "13:15", ml: 350 },
        { id: "w-seed-4", time: "15:40", ml: 200 }
      ],
      streak: {
        current: 2,
        longest: 2,
        lastLogDate: daysAgo(1),
        weekHistory: [
          { date: daysAgo(6), completed: false },
          { date: daysAgo(5), completed: false },
          { date: daysAgo(4), completed: false },
          { date: daysAgo(3), completed: false },
          { date: daysAgo(2), completed: true },
          { date: daysAgo(1), completed: true },
          { date: today, completed: false }
        ],
        dangerZone: false,
        description: "Novata, acabou de começar o acompanhamento."
      },
      todayMeals: {
        "cafe": { logged: true, optionId: "cafe-aveia" },
        "almoco": { logged: false, optionId: null },
        "lanche": { logged: false, optionId: null },
        "jantar": { logged: false, optionId: null },
        "ceia": { logged: false, optionId: null }
      },
      favorites: [],
      planApplied: false
    },
    marina: {
      id: "marina",
      profile: {
        name: "Marina Duarte",
        initial: "M",
        age: 31,
        heightCm: 170,
        weightKg: 62.5,
        targetWeightKg: 65,
        targetMonths: 6,
        sex: "Feminino",
        objective: "Hipertrofia",
        fasting: "Não",
        restrictions: ["Glúten"],
        preferences: ["Onívoro"],
        notes: "Treino de força 4x por semana",
        routine: "5 refeições por dia",
        weeklyBudget: 420,
        mealsPerDay: 5,
        caloriesTarget: 2028,
        waterTargetL: 2.8,
        waterConsumedL: 0.8
      },
      waterLog: [
        { id: "w-seed-1", time: "09:10", ml: 300 },
        { id: "w-seed-2", time: "11:45", ml: 500 }
      ],
      streak: {
        current: 16,
        longest: 21,
        lastLogDate: daysAgo(1),
        weekHistory: [
          { date: daysAgo(6), completed: true },
          { date: daysAgo(5), completed: true },
          { date: daysAgo(4), completed: true },
          { date: daysAgo(3), completed: true },
          { date: daysAgo(2), completed: true },
          { date: daysAgo(1), completed: true },
          { date: today, completed: false }
        ],
        dangerZone: true,
        description: "Ofensiva em perigo. Ainda não registrou nada hoje."
      },
      todayMeals: {
        "cafe": { logged: false, optionId: null },
        "almoco": { logged: false, optionId: null },
        "lanche": { logged: false, optionId: null },
        "jantar": { logged: false, optionId: null },
        "ceia": { logged: false, optionId: null }
      },
      favorites: [],
      planApplied: false
    }
  };

  window.Tukan = window.Tukan || {};
  window.Tukan.data = window.Tukan.data || {};
  window.Tukan.data.personas = personas;
})();
