(function () {
  const { router, state, data, toast, streak } = window.Tukan;

  function femaleTag(sex, base) {
    if (sex !== "Feminino") return base;
    if (base === "Novato") return "Novata";
    return base;
  }

  function buildMeta(user) {
    const s = user.streak || {};
    const current = s.current || 0;
    const sex = user.profile && user.profile.sex;
    if (s.dangerZone) {
      return { tag: "Em perigo", desc: current + " dias, precisa registrar hoje." };
    }
    if (current <= 3) {
      return {
        tag: femaleTag(sex, "Novato"),
        desc: "Começou há " + current + (current === 1 ? " dia" : " dias") + ", ainda se adaptando."
      };
    }
    if (s.longest && current >= s.longest) {
      return { tag: "Consistente", desc: "Ofensiva de " + current + " dias, em recorde pessoal." };
    }
    return { tag: "Consistente", desc: "Ofensiva de " + current + " dias, ritmo estável." };
  }

  function renderHero() {
    const user = state.user();
    document.getElementById("profile-avatar").textContent = user.profile.initial;
    document.getElementById("profile-name").textContent = user.profile.name;
    document.getElementById("profile-sub").textContent = user.profile.objective + ", " + user.profile.mealsPerDay + " refeições por dia";
  }

  function renderPersonas() {
    const active = state.activePersonaId();
    const root = document.getElementById("profile-personas");
    root.innerHTML = Object.keys(data.personas).map(id => {
      const p = state.user(id) || data.personas[id];
      const meta = buildMeta(p);
      const isActive = id === active;
      return `
        <button type="button" class="persona-card" data-id="${id}" data-active="${isActive}">
          <span class="avatar">${p.profile.initial}</span>
          <div class="info">
            <strong>${p.profile.name}</strong>
            <p>${meta.desc}</p>
          </div>
          <span class="chip ${isActive ? "" : "outline"}" style="font-size:10px">${meta.tag}</span>
          <span class="active-mark"><svg width="14" height="14"><use href="#i-check"></use></svg></span>
        </button>
      `;
    }).join("");

    root.querySelectorAll(".persona-card").forEach(b => {
      b.addEventListener("click", () => {
        const id = b.dataset.id;
        state.setActivePersonaId(id);
        toast.show("Usuário trocado para " + data.personas[id].profile.name.split(" ")[0], "success");
        renderHero();
        renderPersonas();
      });
    });
  }

  function bindOnce() {
    const root = document.querySelector('[data-screen="profile"]');
    if (!root || root.__bound) return;
    root.__bound = true;

    root.querySelector('[data-act="edit"]').addEventListener("click", () => {
      state.flag("editProfile", true);
      router.go("onboarding");
    });
    root.querySelector('[data-act="feedback"]').addEventListener("click", () => {
      router.go("feedback");
    });
    root.querySelector('[data-act="reset-day"]').addEventListener("click", () => {
      streak.reset();
      toast.show("Refeições de hoje zeradas", "success");
    });
    root.querySelector('[data-act="reset-all"]').addEventListener("click", () => {
      state.resetAll();
      toast.show("Dados resetados", "success");
      setTimeout(() => location.reload(), 700);
    });
    root.querySelector('[data-act="logout"]').addEventListener("click", () => {
      state.flag("seenApp", false);
      router.go("landing");
    });
  }

  router.on("profile", () => {
    bindOnce();
    renderHero();
    renderPersonas();
  });

  state.subscribe("user", () => {
    if (router.parseHash() === "profile") {
      renderHero();
      renderPersonas();
    }
  });
  state.subscribe("persona", () => {
    if (router.parseHash() === "profile") {
      renderHero();
      renderPersonas();
    }
  });
})();
