(function () {
  const { streak, modal, toast, router, state, date } = window.Tukan;

  function log(mealSlot, optionId, meta) {
    const result = streak.registerMeal(mealSlot, optionId);

    if (result.streakChange) {
      celebrate(result.streakChange);
    } else {
      toast.show("Refeição registrada", "success");
    }
    return result;
  }

  function celebrate(change) {
    const user = state.user();
    const days = change.to;
    const diffView = change.from !== change.to
      ? '<div class="streak-diff"><span class="old">' + change.from + '</span><span>→</span><span>' + change.to + '</span></div>'
      : '';

    modal.open(
      '<div class="celebration">' +
        '<div class="check-mark"><svg viewBox="0 0 64 64" aria-hidden="true"><polyline points="14,34 28,48 50,20"></polyline></svg></div>' +
        '<h2>Refeição registrada!</h2>' +
        '<p>Você completou suas refeições obrigatórias de hoje.</p>' +
        '<div class="new-streak"><span class="flame-ico">🔥</span>' + days + ' dias</div>' +
        diffView +
        '<div class="btn-row">' +
          '<button class="btn btn-ghost" data-act="close">Continuar</button>' +
          '<button class="btn btn-primary" data-act="streak">Ver ofensiva</button>' +
        '</div>' +
      '</div>',
      {
        centered: true,
        onMount(root) {
          root.querySelector('[data-act="close"]').addEventListener("click", () => modal.close());
          root.querySelector('[data-act="streak"]').addEventListener("click", () => {
            modal.close();
            router.go("streak");
          });
        }
      }
    );
  }

  window.Tukan = window.Tukan || {};
  window.Tukan.mealLog = { log, celebrate };
})();
