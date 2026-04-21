(function () {
  const baseHistory = {
    gustavo: [
      { date: "10 Abr 2026", text: "Progressão estável. Aderência semanal em 82% após ajustes no café da manhã." },
      { date: "03 Abr 2026", text: "Ritmo consistente. Meta de 4 dias alcançada pela 3ª semana consecutiva." },
      { date: "27 Mar 2026", text: "Primeiro mês de uso. Queda de 0,9 kg mantendo distribuição proteica alvo." }
    ],
    ana: [
      { date: "05 Abr 2026", text: "Primeira semana em acompanhamento. Ajustes iniciais aplicados." }
    ],
    marina: [
      { date: "15 Abr 2026", text: "Evolução em hipertrofia. +1,2 kg de massa desde janeiro." },
      { date: "01 Abr 2026", text: "Meta parcial atingida. Distribuição calórica ajustada para pós-treino." }
    ]
  };

  function firstPendingMealName(user) {
    const order = window.Tukan.data.mealOrder || [];
    for (const meta of order) {
      const slot = user.todayMeals[meta.id];
      if (slot && !slot.logged) return meta.name;
    }
    return null;
  }

  function pendingMealNames(user) {
    const order = window.Tukan.data.mealOrder || [];
    const names = [];
    for (const meta of order) {
      const slot = user.todayMeals[meta.id];
      if (slot && !slot.logged) names.push(meta.name.toLowerCase());
    }
    return names;
  }

  function pickSignal(ctx) {
    const { streak, loggedToday, pending, totalMeals, waterPct, planApplied } = ctx;
    if (streak.dangerZone && loggedToday === 0) return "streak-danger";
    if (totalMeals > 0 && pending === 0) return "day-complete";
    if (loggedToday === 0) return "day-start";
    if (pending <= 2 && pending > 0) return "almost-there";
    if (waterPct < 0.5) return "low-water";
    if (planApplied) return "plan-applied";
    return "default";
  }

  function objectiveChip(objective) {
    return objective === "Hipertrofia" ? "Alta proteína" : "Controle calórico";
  }

  function restrictionChip(user) {
    const r = user.profile.restrictions || [];
    const p = user.profile.preferences || [];
    const tag = [...p, ...r].find(Boolean);
    return tag || "Plano personalizado";
  }

  function objectiveAdjustment(objective) {
    return objective === "Hipertrofia"
      ? "Aumentar fracionamento proteico ao longo do dia"
      : "Priorizar refeições leves e frequentes";
  }

  function ceiaAdjustment(objective) {
    return objective === "Hipertrofia"
      ? "Lembrete de ceia anti-catabólica"
      : "Lembrete de ceia controlada em calorias";
  }

  function buildCopy(signal, ctx) {
    const { user, objective, streak, loggedToday, totalMeals, pending, avgAdherence, waterPct, favorites } = ctx;
    const objLower = (objective || "").toLowerCase();
    const nextMeal = firstPendingMealName(user);
    const pendingList = pendingMealNames(user);
    const waterPctRounded = Math.round(waterPct * 100);

    switch (signal) {
      case "streak-danger": {
        const first = nextMeal || "primeira refeição do dia";
        return {
          title: "Ofensiva em perigo detectada.",
          body: `Você tem ${streak.current} dias consecutivos, mas ainda não registrou nada hoje. Para manter o ritmo de ${objLower}, é essencial registrar ao menos o ${first.toLowerCase()}.`,
          summary: `Ofensiva de ${streak.current} dias em risco. Registre o ${first.toLowerCase()} para proteger o ritmo.`,
          chips: [`Ofensiva ${streak.current} dias`, objectiveChip(objective), `Ritmo de ${objLower}`],
          adjustments: [
            `Notificação imediata para o ${first.toLowerCase()}`,
            objectiveAdjustment(objective),
            ceiaAdjustment(objective)
          ]
        };
      }
      case "day-complete": {
        return {
          title: "Dia completo. Plano alinhado.",
          body: `Todas as ${totalMeals} refeições registradas. Aderência semanal em ${avgAdherence}% com ofensiva em ${streak.current} dias consecutivos. Mantenha o ritmo para consolidar o padrão de ${objLower}.`,
          summary: `Dia completo com aderência em ${avgAdherence}%. Ofensiva em ${streak.current} dias consecutivos.`,
          chips: ["Dia completo", `Aderência ${avgAdherence}%`, `Ofensiva ${streak.current} dias`],
          adjustments: [
            "Manter horários das refeições principais",
            waterPct < 1 ? "Reforçar hidratação no fim do dia" : "Hidratação no alvo, manter",
            "Planejar compras da próxima semana"
          ]
        };
      }
      case "almost-there": {
        const list = pendingList.length ? pendingList.join(", ") : "últimas refeições";
        return {
          title: `Quase lá. Faltam ${pending} ${pending === 1 ? "refeição" : "refeições"}.`,
          body: `Você já registrou ${loggedToday} de ${totalMeals} refeições hoje. Faltam ${list} para fechar o dia e manter o ritmo de ${objLower}.`,
          summary: `${loggedToday}/${totalMeals} refeições registradas. Faltam ${list}.`,
          chips: [`${loggedToday}/${totalMeals} hoje`, objectiveChip(objective), `Ofensiva ${streak.current} dias`],
          adjustments: [
            `Priorizar ${pendingList[0] || "próxima refeição"} no próximo horário`,
            objectiveAdjustment(objective),
            waterPct < 0.7 ? "Reforçar hidratação até o fim do dia" : "Manter hidratação no ritmo atual"
          ]
        };
      }
      case "day-start": {
        const first = nextMeal || "café da manhã";
        return {
          title: "Dia começando. Registre a primeira refeição.",
          body: `Plano com ${totalMeals} refeições programadas. Comece pelo ${first.toLowerCase()} para ativar a ofensiva (hoje você acumula ${streak.current} dias).`,
          summary: `Dia começando. Registre o ${first.toLowerCase()} para manter a ofensiva de ${streak.current} dias.`,
          chips: [`Ofensiva ${streak.current} dias`, objectiveChip(objective), restrictionChip(user)],
          adjustments: [
            `Notificação para o ${first.toLowerCase()}`,
            objectiveAdjustment(objective),
            "Lembrete de hidratação distribuída ao longo do dia"
          ]
        };
      }
      case "low-water": {
        return {
          title: "Hidratação abaixo do ritmo.",
          body: `Você está em ${waterPctRounded}% da meta de ${user.profile.waterTargetL.toString().replace(".", ",")}L. Hidratação influencia saciedade, recuperação e aderência. Refeições registradas hoje: ${loggedToday} de ${totalMeals}.`,
          summary: `Hidratação em ${waterPctRounded}% da meta. Reforce nas próximas horas.`,
          chips: [`Água ${waterPctRounded}%`, objectiveChip(objective), `Ofensiva ${streak.current} dias`],
          adjustments: [
            "Lembretes de hidratação a cada 90 minutos",
            "Copo fixo ao lado das refeições principais",
            objectiveAdjustment(objective)
          ]
        };
      }
      case "plan-applied": {
        const favLine = favorites.length
          ? `${favorites.length} ${favorites.length === 1 ? "favorito marcado" : "favoritos marcados"} estão priorizados nas sugestões.`
          : "Marque favoritos no plano para priorizar opções nas próximas sugestões.";
        return {
          title: "Ajustes aplicados ao seu plano.",
          body: `Plano atualizado com base no seu padrão recente. ${favLine} Aderência semanal atual: ${avgAdherence}%.`,
          summary: `Ajustes aplicados. Aderência em ${avgAdherence}% com o plano atualizado.`,
          chips: ["Plano ajustado", objectiveChip(objective), `Aderência ${avgAdherence}%`],
          adjustments: [
            objectiveAdjustment(objective),
            favorites.length ? "Priorizar favoritos nas próximas sugestões" : "Marcar favoritos no plano para personalização",
            "Monitorar aderência nos próximos 7 dias"
          ]
        };
      }
      default: {
        return {
          title: "Ritmo em construção.",
          body: `Aderência semanal em ${avgAdherence}% e ${loggedToday} de ${totalMeals} refeições registradas hoje. Mantenha consistência para consolidar o padrão de ${objLower}.`,
          summary: `Aderência em ${avgAdherence}%. ${loggedToday}/${totalMeals} refeições registradas hoje.`,
          chips: [`Aderência ${avgAdherence}%`, objectiveChip(objective), `Ofensiva ${streak.current} dias`],
          adjustments: [
            objectiveAdjustment(objective),
            waterPct < 0.7 ? "Reforçar hidratação nas próximas horas" : "Hidratação no ritmo, manter",
            "Revisar plano caso apareça refeição pulada com frequência"
          ]
        };
      }
    }
  }

  function buildTodayHistory(ctx) {
    const { loggedToday, totalMeals, avgAdherence, streak, signal } = ctx;
    const texts = {
      "streak-danger": `Ofensiva de ${streak.current} dias em alerta. Nada registrado até o momento; aderência semanal em ${avgAdherence}%.`,
      "day-complete": `Dia completo com ${totalMeals} refeições registradas. Aderência semanal em ${avgAdherence}%.`,
      "almost-there": `${loggedToday} de ${totalMeals} refeições registradas. Aderência semanal em ${avgAdherence}%.`,
      "day-start": `Dia iniciado. Ofensiva atual de ${streak.current} dias. Aderência semanal em ${avgAdherence}%.`,
      "low-water": `${loggedToday} de ${totalMeals} refeições registradas. Hidratação abaixo da meta.`,
      "plan-applied": `Ajustes do plano aplicados. Aderência semanal em ${avgAdherence}%.`,
      "default": `${loggedToday} de ${totalMeals} refeições registradas. Aderência semanal em ${avgAdherence}%.`
    };
    return { date: "Hoje", text: texts[signal] || texts["default"] };
  }

  function computeFeedback(personaId) {
    const { state, data } = window.Tukan;
    if (!data) return null;
    const user = state && state.user
      ? state.user(personaId)
      : (data.personas ? data.personas[personaId] : null);
    if (!user) return null;

    const objective = user.profile.objective;
    const streak = user.streak;
    const meals = user.todayMeals || {};
    const totalMeals = Object.keys(meals).length;
    const loggedToday = Object.values(meals).filter(m => m && m.logged).length;
    const pending = totalMeals - loggedToday;
    const waterTarget = user.profile.waterTargetL || 1;
    const waterPct = (user.profile.waterConsumedL || 0) / waterTarget;
    const favorites = user.favorites || [];
    const planApplied = !!user.planApplied;

    const week = data.aggregate && data.aggregate.liveAdherenceWeek
      ? data.aggregate.liveAdherenceWeek(personaId)
      : ((data.adherence && data.adherence[personaId] && data.adherence[personaId].week) || []);
    const avgAdherence = week.length
      ? Math.round(week.reduce((s, d) => s + (d.pct || 0), 0) / week.length)
      : 0;

    const signal = pickSignal({ streak, loggedToday, pending, totalMeals, waterPct, planApplied });
    const copy = buildCopy(signal, { user, objective, streak, loggedToday, totalMeals, pending, avgAdherence, waterPct, favorites });

    const todayEntry = buildTodayHistory({ loggedToday, totalMeals, avgAdherence, streak, signal });
    const history = [todayEntry, ...(baseHistory[personaId] || [])];

    return {
      summary: copy.summary,
      patternTitle: copy.title,
      patternBody: copy.body,
      chips: copy.chips,
      adjustments: copy.adjustments,
      history
    };
  }

  const aiFeedback = new Proxy({}, {
    get(_, personaId) {
      if (typeof personaId !== "string") return undefined;
      return computeFeedback(personaId);
    },
    has(_, personaId) {
      return typeof personaId === "string" && !!window.Tukan.data.personas[personaId];
    }
  });

  window.Tukan = window.Tukan || {};
  window.Tukan.data = window.Tukan.data || {};
  window.Tukan.data.aiFeedback = aiFeedback;
  window.Tukan.data.computeFeedback = computeFeedback;
})();
