(function () {
  const MEAL_ORDER = [
    { id: "cafe", name: "Café da manhã" },
    { id: "almoco", name: "Almoço" },
    { id: "lanche", name: "Lanche" },
    { id: "jantar", name: "Jantar" },
    { id: "ceia", name: "Ceia" }
  ];

  const plans = {
    gustavo: {
      cafe: {
        main: {
          id: "cafe-iogurte",
          title: "Iogurte natural com frutas",
          portion: "1 pote 170g",
          kcal: 396, prot: 28, carb: 44, gord: 12,
          description: "Iogurte natural, banana, aveia e chia com opção sem lactose.",
          tag: "Adaptado para rotina corrida"
        },
        alternatives: [
          { id: "cafe-ovos", title: "Ovos mexidos + torrada integral", portion: "2 ovos", kcal: 354, prot: 25, carb: 32, gord: 14, description: "Proteína rápida, 4 minutos de preparo." },
          { id: "cafe-shake", title: "Shake proteico + banana", portion: "350ml", kcal: 318, prot: 30, carb: 36, gord: 6, description: "Pronto em 1 minuto, portátil." }
        ]
      },
      almoco: {
        main: {
          id: "almoco-frango",
          title: "Almoço balanceado",
          portion: "prato padrão",
          kcal: 546, prot: 38, carb: 58, gord: 18,
          description: "Arroz integral, feijão, frango grelhado e salada fresca.",
          tag: "Controle glicêmico"
        },
        alternatives: [
          { id: "almoco-quinoa", title: "Quinoa com legumes + peixe", portion: "prato padrão", kcal: 516, prot: 36, carb: 48, gord: 20, description: "Mais leve, ótimo pós treino." },
          { id: "almoco-wrap", title: "Wrap integral de frango", portion: "1 wrap", kcal: 456, prot: 34, carb: 44, gord: 16, description: "Prático para levar." }
        ]
      },
      lanche: {
        main: {
          id: "lanche-sanduiche",
          title: "Lanche da tarde",
          portion: "1 sanduíche",
          kcal: 233, prot: 16, carb: 22, gord: 9,
          description: "Sanduíche natural com pasta de ricota e tomate.",
          tag: "Prático para faculdade"
        },
        alternatives: [
          { id: "lanche-mix", title: "Mix de castanhas + fruta", portion: "40g + 1 fruta", kcal: 272, prot: 8, carb: 24, gord: 16, description: "Fácil de carregar, sem preparo." },
          { id: "lanche-wrap", title: "Wrap de frango", portion: "1 unidade", kcal: 307, prot: 22, carb: 30, gord: 11, description: "Sugestão compatível com seu plano." }
        ]
      },
      jantar: {
        main: {
          id: "jantar-omelete",
          title: "Jantar leve",
          portion: "prato médio",
          kcal: 480, prot: 34, carb: 41, gord: 20,
          description: "Omelete com legumes, batata-doce assada e folhas verdes.",
          tag: "Leve e saciante"
        },
        alternatives: [
          { id: "jantar-bowl", title: "Bowl vegetariano", portion: "1 bowl", kcal: 388, prot: 18, carb: 52, gord: 12, description: "Arroz, grão-de-bico, legumes assados." },
          { id: "jantar-sopa", title: "Sopa rica + torrada", portion: "1 tigela", kcal: 414, prot: 28, carb: 44, gord: 14, description: "Sopa de frango com legumes." }
        ]
      }
    },
    ana: {
      cafe: {
        main: { id: "cafe-aveia", title: "Overnight oats vegano", portion: "1 pote", kcal: 354, prot: 14, carb: 52, gord: 10, description: "Aveia, leite de amêndoas, frutas vermelhas.", tag: "Vegetariano, sem lactose" },
        alternatives: [
          { id: "cafe-tapioca", title: "Tapioca com tofu", portion: "1 tapioca", kcal: 304, prot: 18, carb: 40, gord: 8, description: "Proteína vegetal + carb rápido." },
          { id: "cafe-smoothie", title: "Smoothie verde", portion: "400ml", kcal: 278, prot: 12, carb: 44, gord: 6, description: "Folhas, frutas e proteína vegetal." }
        ]
      },
      almoco: {
        main: { id: "almoco-salada", title: "Salada completa vegetariana", portion: "prato grande", kcal: 482, prot: 22, carb: 58, gord: 18, description: "Grão-de-bico, quinoa, folhas, abacate, castanhas.", tag: "Fonte de fibras" },
        alternatives: [
          { id: "almoco-tofu", title: "Tofu grelhado com arroz", portion: "prato médio", kcal: 438, prot: 26, carb: 52, gord: 14, description: "Prato asiático leve." },
          { id: "almoco-lentilha", title: "Lentilha com legumes", portion: "prato médio", kcal: 410, prot: 24, carb: 56, gord: 10, description: "Rica em ferro." }
        ]
      },
      lanche: {
        main: { id: "lanche-mix-ana", title: "Fruta + castanhas", portion: "1 fruta + 30g", kcal: 244, prot: 6, carb: 28, gord: 12, description: "Castanhas-do-pará, nozes, maçã.", tag: "Rápido" },
        alternatives: [
          { id: "lanche-hummus", title: "Hummus com cenoura", portion: "100g + vegetais", kcal: 244, prot: 10, carb: 24, gord: 12, description: "Lanche salgado saciante." },
          { id: "lanche-barra", title: "Barra de proteína vegana", portion: "1 barra", kcal: 216, prot: 14, carb: 22, gord: 8, description: "Prática para levar na bolsa." }
        ]
      },
      jantar: {
        main: { id: "jantar-legumes", title: "Legumes assados + grão", portion: "prato médio", kcal: 382, prot: 16, carb: 48, gord: 14, description: "Abóbora, batata-doce, brócolis, grão-de-bico.", tag: "Leve e saciante" },
        alternatives: [
          { id: "jantar-bowl-ana", title: "Bowl asiático", portion: "1 bowl", kcal: 412, prot: 18, carb: 58, gord: 12, description: "Arroz jasmim, tofu, shimeji." },
          { id: "jantar-sopa-ana", title: "Creme de abóbora", portion: "1 tigela", kcal: 266, prot: 8, carb: 36, gord: 10, description: "Sopa sem lactose." }
        ]
      },
      ceia: {
        main: { id: "ceia-chia", title: "Pudim de chia", portion: "1 pote", kcal: 192, prot: 8, carb: 22, gord: 8, description: "Chia, leite vegetal, frutas vermelhas.", tag: "Sem lactose" },
        alternatives: [
          { id: "ceia-cha", title: "Chá + fruta", portion: "1 xícara + 1 fruta", kcal: 120, prot: 2, carb: 28, gord: 0, description: "Opção bem leve." }
        ]
      }
    },
    marina: {
      cafe: {
        main: { id: "cafe-omelete-mar", title: "Omelete proteica", portion: "3 ovos", kcal: 424, prot: 34, carb: 18, gord: 24, description: "Ovos, queijo, espinafre. Sem glúten.", tag: "Hipertrofia" },
        alternatives: [
          { id: "cafe-panqueca", title: "Panqueca de banana + whey", portion: "2 unidades", kcal: 394, prot: 32, carb: 44, gord: 10, description: "Sem glúten, alta proteína." },
          { id: "cafe-iogurte-mar", title: "Iogurte grego + granola sem glúten", portion: "1 pote", kcal: 346, prot: 26, carb: 38, gord: 10, description: "Fonte de proteína." }
        ]
      },
      almoco: {
        main: { id: "almoco-picanha", title: "Arroz + carne magra + legumes", portion: "prato generoso", kcal: 612, prot: 46, carb: 62, gord: 20, description: "Arroz, patinho grelhado, brócolis no vapor.", tag: "Pós treino" },
        alternatives: [
          { id: "almoco-salmao", title: "Salmão + batata-doce", portion: "150g + 200g", kcal: 574, prot: 42, carb: 52, gord: 22, description: "Ômega 3 + carb complexo." },
          { id: "almoco-frango-mar", title: "Frango + purê de mandioca", portion: "prato médio", kcal: 518, prot: 44, carb: 54, gord: 14, description: "Sem glúten." }
        ]
      },
      lanche: {
        main: { id: "lanche-shake-mar", title: "Shake proteico + fruta", portion: "500ml + 1 fruta", kcal: 320, prot: 32, carb: 30, gord: 8, description: "Whey isolado, banana, aveia sem glúten.", tag: "Pré treino" },
        alternatives: [
          { id: "lanche-iogurte-mar", title: "Iogurte grego + castanhas", portion: "1 pote + 30g", kcal: 294, prot: 22, carb: 20, gord: 14, description: "Lanche saciante." }
        ]
      },
      jantar: {
        main: { id: "jantar-peixe-mar", title: "Peixe grelhado + legumes", portion: "prato médio", kcal: 474, prot: 38, carb: 40, gord: 18, description: "Tilápia, arroz integral, salada.", tag: "Leve" },
        alternatives: [
          { id: "jantar-carne-mar", title: "Carne magra + purê", portion: "prato médio", kcal: 514, prot: 40, carb: 48, gord: 18, description: "Reposição proteica." }
        ]
      },
      ceia: {
        main: { id: "ceia-shake-mar", title: "Shake de caseína", portion: "250ml", kcal: 198, prot: 24, carb: 12, gord: 6, description: "Proteína de liberação lenta.", tag: "Anti-catabólico" },
        alternatives: [
          { id: "ceia-requeijao", title: "Requeijão + fruta", portion: "40g + 1 fruta", kcal: 216, prot: 14, carb: 22, gord: 8, description: "Caseína natural." }
        ]
      }
    }
  };

  window.Tukan = window.Tukan || {};
  window.Tukan.data = window.Tukan.data || {};
  window.Tukan.data.plans = plans;
  window.Tukan.data.mealOrder = MEAL_ORDER;
})();
