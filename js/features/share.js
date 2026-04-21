(function () {
  const { modal, toast, state } = window.Tukan;

  function open() {
    const user = state.user();
    const days = user.streak.current;
    const text = "Estou há " + days + " dias no meu foco alimentar com o Tukan.";

    modal.open(
      '<div class="share-root">' +
        '<h3 style="text-align:center">Compartilhar conquista</h3>' +
        '<p class="muted center" style="margin-top:6px">Um card visual da sua ofensiva pronto para compartilhar.</p>' +
        '<div class="share-preview">' +
          '<div class="sp-top"><img src="assets/logo-tukan.svg" alt=""><span>tukan nutrition</span></div>' +
          '<div class="sp-mid">' +
            '<div class="sp-flame">🔥</div>' +
            '<div class="sp-number">' + days + '</div>' +
            '<div class="sp-text">dias consecutivos no meu plano alimentar.</div>' +
          '</div>' +
          '<div class="sp-foot">#tukanNutrition</div>' +
        '</div>' +
        '<div class="celebration"><div class="btn-row">' +
          '<button class="btn btn-ghost" data-act="close">Fechar</button>' +
          '<button class="btn btn-brand" data-act="share">Compartilhar</button>' +
        '</div></div>' +
      '</div>',
      {
        onMount(root) {
          root.querySelector('[data-act="close"]').addEventListener("click", () => modal.close());
          root.querySelector('[data-act="share"]').addEventListener("click", async () => {
            try {
              if (navigator.share) {
                await navigator.share({ title: "Minha ofensiva no Tukan", text });
                toast.show("Compartilhado!", "success");
              } else if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
                toast.show("Texto copiado!", "success");
              } else {
                toast.show("Conquista compartilhada!", "success");
              }
            } catch (e) {
            }
            modal.close();
          });
        }
      }
    );
  }

  window.Tukan = window.Tukan || {};
  window.Tukan.share = { open };
})();
