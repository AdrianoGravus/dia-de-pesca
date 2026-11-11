/* Dia de Pesca: dicas por espécie (iscas, montagens, linha, anzol e profundidade).
   Origem: pesquisa/02 e pesquisa/03 do projeto. É prática de pescadores e de sites de pesca, sem medição.
   "fonte" diz o quanto a pesquisa encontrou: "boa" (várias fontes de pesqueiro) ou "pouca" (poucas fontes, dicas gerais). */
(function (raiz) {
  "use strict";
  var REDONDOS = {
    iscas: ["Ração de pesqueiro furada, na superfície ou no fundo", "Pão na boia (boia pão)", "Massa", "Iscas de EVA e anteninha", "Tripa de frango e fígado de boi", "Pedaços ou cabeça de tilápia em dia difícil"],
    montagens: [
      "Boia cevadeira: a linha da carretilha e o rabicho da boia ficam de um lado do girador e o chicote com o anzol do outro, para a linha não torcer. Copo cheio de ração.",
      "Chicote de 1,5 a 2 m quando a ração trabalha na superfície.",
      "Boia torpedo para arremesso longo.",
      "Palminho (boinha e boião): boia pequena de isopor a um palmo do anzol, para peixe manhoso que está no fundo e sobe para a ração.",
      "Fundo: fígado em anzol encastoado, com chumbada solta na linha."
    ],
    linha: "Monofilamento de 0,37 mm (cevadeira) a 0,40 mm (boia pão), citados por um canal de pesqueiro. Anzóis citados: tipo pacu e chinu, sem farpa. Chicote de multifilamento só se o pesqueiro permitir."
  };
  var D = {
    carpas: {
      habito: "Carpa comum e húngara comem no fundo. A cabeçuda filtra plâncton e fica na meia-água. A capim é herbívora e não come ração.",
      zona: "fundo",
      iscas: ["Massa, pastilhas e milho", "Cabeçuda: pastilha que se dissolve devagar e forma uma nuvem em volta dos anzóis", "Capim: vegetais e pão"],
      montagens: [
        "Comum e húngara: pesca de fundo com massa.",
        "Cabeçuda: chuveirinho (vários anzóis em volta de uma mola que segura a massa ou a pastilha), suspenso na meia-água com boia. O stop na linha regula a altura.",
        "Em ponto mais fundo, chuveirinho de fundo."
      ],
      linha: "Não achei bitola específica nas fontes. Vale a regra do pesqueiro.",
      dicas: ["No frio a carpa come em janelas curtas, em geral no fim da tarde.", "É a espécie da lista que menos sente a água fria."],
      fonte: "boa"
    },
    jundia: {
      habito: "Bagre nativo, onívoro, de fundo. Continua ativo no inverno.",
      zona: "fundo",
      iscas: ["Minhoca e minhocuçu", "Coração de frango ou de boi", "Iscas de cheiro forte usadas para bagres"],
      montagens: ["Pesca de fundo com chumbo para manter a isca parada."],
      linha: "Equipamento leve a médio. Sem bitola específica nas fontes.",
      dicas: ["Dicas emprestadas dos outros bagres. Achei pouca coisa específica de jundiá em pesqueiro."],
      fonte: "pouca"
    },
    traira: {
      habito: "Traíra: predador de emboscada, fica em margens com vegetação, troncos e sombra. Dourado: carnívoro de hábito diurno, ataca na superfície.",
      zona: "raso",
      iscas: ["Traíra, artificiais: superfície (zara, popper, stick), soft com anzol offset para não enroscar", "Traíra, naturais: tuvira, lambari, minhocuçu, pedaço de carne fresca", "Dourado: iscas de superfície"],
      montagens: ["Artificial arremessada rente à vegetação e às estruturas.", "Soft antienrosco trabalhada devagar no fundo quando o peixe não sobe."],
      linha: "Em pesquisa com pescadores de isca artificial, a maioria prefere multifilamento. Empate resistente a dente é prática comum, mas não achei fonte para a bitola.",
      dicas: ["Iscas de superfície rendem mais no começo da manhã e no fim da tarde.", "Quando a temperatura cai, a traíra fica lenta e desce para o fundo ou entra nas estruturas."],
      fonte: "boa"
    },
    catfish: {
      habito: "Bagre de fundo, guiado pelo olfato. Fica agitado com muita luz e água transparente.",
      zona: "fundo",
      iscas: ["Peixe em postas", "Fígado de galinha, coração de frango ou de boi", "Minhoca e salsicha", "Massas de cheiro forte"],
      montagens: ["Pesca de fundo com chumbo para manter a isca no fundo."],
      linha: "Equipamento leve a médio.",
      dicas: ["Noite e amanhecer são os horários mais citados, quando ele vai para o raso e para as margens.", "Dias nublados e água turva ajudam."],
      fonte: "boa"
    },
    tilapia: {
      habito: "Onívora. Belisca e testa a isca antes de levar. Sobe no calor e fica no fundo em dia difícil.",
      zona: "coluna",
      iscas: ["Massa macia, do tamanho de uma azeitona média, cobrindo todo o anzol", "Minhoca, milho, bicho da laranjeira", "Calor: massas doces e frutadas que soltam partículas", "Dia difícil: massa de cheiro forte, que dissolve devagar"],
      montagens: [
        "Linha folgada e chumbo livre, para o peixe trabalhar a massa sem sentir peso.",
        "Chuveirinho com mola para segurar a massa.",
        "No calor, boia cevadeira na superfície.",
        "Peixe manhoso: massa parada no fundo."
      ],
      linha: "Anzol pequeno e discreto, tipo chinu ou tinu. Para tilápia menor, chinu 2 a 4. Sem bitola de linha nas fontes: quanto mais fina o pesqueiro permitir, melhor a fisgada.",
      dicas: ["Se a massa some e não fisga, diminua a bolinha.", "Fisgue quando a linha esticar, não no primeiro toque."],
      fonte: "boa"
    },
    matrinxa: {
      habito: "Peixes de escama ativos, de superfície e meia-água.",
      zona: "coluna",
      iscas: ["Ração", "Coração de frango", "Milho, para piau e piraputanga", "Matrinxã: pequenas iscas artificiais (spinner e plug pequeno)"],
      montagens: ["Boia com isca na superfície ou na meia-água."],
      linha: "Sem bitola nas fontes.",
      dicas: ["Achei pouca coisa específica destas espécies em pesqueiro. Trate como ponto de partida."],
      fonte: "pouca"
    },
    pacu: {
      habito: "Onívoro. É o mais tolerante ao frio entre os redondos.",
      zona: "coluna",
      iscas: REDONDOS.iscas.concat(["Milho"]), montagens: REDONDOS.montagens, linha: REDONDOS.linha,
      dicas: ["Com água morna, sobe para comer na superfície. Em dia ruim fica no fundo ou na meia-água.", "Boia cevadeira não combina com vento forte em pesqueiro: a linha corre e enrosca na do vizinho."],
      fonte: "boa"
    },
    tambacu: {
      habito: "Híbrido de tambaqui com pacu. Aguenta mais frio que o tambaqui e menos que o pacu.",
      zona: "coluna",
      iscas: REDONDOS.iscas, montagens: REDONDOS.montagens, linha: REDONDOS.linha,
      dicas: ["Boia na superfície quando o peixe sobe, em dia quente.", "Em dia ruim, fundo ou meia-água, com isca de cheiro (fígado, tilápia)."],
      fonte: "boa"
    },
    pintado: {
      habito: "Predadores de fundo. Caçam mais com pouca luz.",
      zona: "fundo",
      iscas: ["Peixes pequenos e pedaços de peixe", "Tilápia em postas ou cabeça", "Fígado e iscas de cheiro forte"],
      montagens: ["Pesca de fundo com chumbada solta e isca natural."],
      linha: "Líder de fluorocarbono é citado para a linha não ser cortada. Sem bitola nas fontes.",
      dicas: ["Amanhecer e entardecer são os melhores horários. De dia, céu fechado ajuda."],
      fonte: "boa"
    },
    tambaqui: {
      habito: "Onívoro amazônico. Precisa de água quente e tolera pouco oxigênio.",
      zona: "coluna",
      iscas: REDONDOS.iscas, montagens: REDONDOS.montagens, linha: REDONDOS.linha,
      dicas: ["Abaixo de 25 °C já perde apetite. Em São Bernardo, é peixe de dias quentes.", "Com calor, sobe e ataca a ração na superfície."],
      fonte: "boa"
    },
    pirapitinga: {
      habito: "Redondos de origem amazônica e seus híbridos. Sentem bastante o frio.",
      zona: "coluna",
      iscas: REDONDOS.iscas, montagens: REDONDOS.montagens, linha: REDONDOS.linha,
      dicas: ["Use as mesmas montagens dos outros redondos.", "Faixa de temperatura da pirapitinga. Para os híbridos é uma aproximação."],
      fonte: "pouca"
    },
    pirarara: {
      habito: "Bagre grande, de fundo, onívoro e noturno.",
      zona: "fundo",
      iscas: ["Isca natural grande: peixe inteiro ou em postas", "Cabeça e guelras de tilápia", "Fígado de boi", "Salsicha"],
      montagens: ["Pesca de fundo com anzol circular forte.", "Fígado em anzol encastoado, com chumbada solta."],
      linha: "Equipamento reforçado. Sem bitola nas fontes.",
      dicas: ["Dê tempo para o peixe engolir a isca antes de fisgar.", "Depois da fisgada, pressione logo para ele não levar a linha para as estruturas.", "Faixa de temperatura estimada pela origem amazônica."],
      fonte: "boa"
    },
    pirarucu: {
      habito: "Pirarucu sobe para respirar na superfície. Tucunaré é predador de estrutura.",
      zona: "raso",
      iscas: ["Pirarucu: isca viva ou natural, conforme a regra do pesqueiro", "Tucunaré: iscas artificiais de superfície e de meia-água, e soft"],
      montagens: ["Tucunaré: artificial trabalhada perto de estruturas."],
      linha: "Sem bitola nas fontes.",
      dicas: ["Achei pouca coisa específica de pesqueiro. Trate como ponto de partida.", "Faixa de temperatura estimada pela origem amazônica."],
      fonte: "pouca"
    }
  };
  var api = { POR_ESPECIE: D };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else raiz.Dicas = api;
})(typeof window !== "undefined" ? window : this);
