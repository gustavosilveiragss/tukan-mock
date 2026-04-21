(function () {
  const { state, date } = window.Tukan;

  function requiredSlots(user) {
    return Object.keys(user.todayMeals || {});
  }

  function isDayComplete(user) {
    const req = requiredSlots(user);
    if (req.length === 0) return false;
    return req.every(k => user.todayMeals[k] && user.todayMeals[k].logged);
  }

  function check(user) {
    if (!user) user = state.user();
    const today = date.todayISO();
    const yesterday = date.yesterdayISO();

    const dayComplete = isDayComplete(user);

    let status;
    if (user.streak.lastLogDate === today) {
      status = "completed-today";
    } else if (user.streak.lastLogDate === yesterday) {
      status = user.streak.dangerZone ? "danger" : "active";
    } else if (user.streak.lastLogDate && user.streak.lastLogDate < yesterday) {
      status = "broken";
    } else {
      status = "new";
    }

    return { today, yesterday, dayComplete, status };
  }

  function nowHHMM() {
    const d = new Date();
    return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
  }

  function registerMeal(mealId, optionId) {
    const user = state.user();
    const prevComplete = isDayComplete(user);
    user.todayMeals[mealId] = { logged: true, optionId: optionId, time: nowHHMM() };
    const nowComplete = isDayComplete(user);

    let streakChange = null;
    let streak = { ...user.streak };

    if (!prevComplete && nowComplete) {
      const today = date.todayISO();
      const yesterday = date.yesterdayISO();
      const oldValue = streak.current;
      if (streak.lastLogDate === today) {
      } else if (streak.lastLogDate === yesterday) {
        streak.current = streak.current + 1;
      } else {
        streak.current = 1;
      }
      streak.lastLogDate = today;
      streak.dangerZone = false;
      if (streak.current > streak.longest) streak.longest = streak.current;
      streak.weekHistory = (streak.weekHistory || []).map(w => {
        if (w.date === today) return { ...w, completed: true };
        return w;
      });
      streakChange = { from: oldValue, to: streak.current };
    }

    state.saveUser({ todayMeals: user.todayMeals, streak });
    return { dayComplete: nowComplete, streakChange };
  }

  function reset() {
    const user = state.user();
    const cleared = {};
    Object.keys(user.todayMeals).forEach(k => {
      cleared[k] = { logged: false, optionId: null };
    });
    state.saveUser({ todayMeals: cleared });
  }

  window.Tukan = window.Tukan || {};
  window.Tukan.streak = { check, registerMeal, reset, isDayComplete, requiredSlots };
})();
