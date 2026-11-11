/* Dia de Pesca: dicas por espécie (iscas, montagens, linha, anzol e profundidade).
   Origem: pesquisa/02 e pesquisa/03 do projeto. É prática de pescadores e de sites de pesca, sem medição.
   "fonte" diz o quanto a pesquisa encontrou: "boa" (várias fontes de pesqueiro) ou "pouca" (poucas fontes, dicas gerais). */
(function (raiz) {
  "use strict";
  var REDONDOS = {
    iscas: ["Ração de pesqueiro furada, na superfície ou no fundo", "Pão na boia (boia pão)", "Massa", "Iscas de EVA e anteninha", "Salsicha", "Tripa de frango e fígado de boi", "Pedaço, cabeça ou filé de tilápia em dia frio ou difícil"],
    montagens: [
      "Boia cevadeira: a linha da carretilha e o rabicho da boia ficam de um lado do girador e o chicote com o anzol do outro, para a linha não torcer. Uma cevadeira pequena, de 45 g, com ração já chama o peixe para cima.",
      "Chicote de 1,5 a 2 m quando a ração trabalha na superfície.",
      "Sistema goiano, de superfície: girador pequeno e chicote curto, de 30 a 40 cm.",
      "Boia pão: girador, duas miçangas claras, boia guia grande sem pintura, chumbo grande e pão branco fresco no anzol maruseigo.",
      "Boia pão regulável: a boia corre entre as duas miçangas travadas por stops. Mudando os stops você muda a profundidade da isca sem refazer a montagem.",
      "Salsicha: girador pequeno, 30 cm de linha transparente e anzol maruseigo.",
      "Palminho (boinha e boião): boia pequena de isopor a um palmo do anzol, para peixe manhoso que está no fundo e sobe para a ração.",
      "Boia torpedo para arremesso longo.",
      "Fundo: fígado em anzol encastoado, com chumbada solta na linha."
    ],
    linha: "As fontes variam com o porte do peixe: monofilamento de 0,37 mm (cevadeira) e 0,40 mm (boia pão) em um vídeo, 0,50 ou 0,60 mm na boia pão para tambaqui grande em outro. Anzóis citados: tipo pacu, chinu e maruseigo, sem farpa. Um canal diz perder menos peixe com o anzol tipo pacu do que com o octopus. Chicote curto de multifilamento, de 20 a 25 cm, é difícil de o peixe cortar, mas só vale se o pesqueiro permitir.",
    porDia: {
      sup: ["ração na cevadeira pequena", "pão na boia", "anteninha de EVA"],
      meia: ["massa na boia pão regulável", "ração furada na boia regulável", "salsicha"],
      fundo: ["massa no fundo", "ração furada no fundo", "fígado de boi"],
      dificil: ["pedaço, cabeça ou filé de tilápia na boia pão", "salsicha", "fígado de boi ou tripa de frango", "massa no fundo"]
    }
  };
  /* porDia: iscas por situação. Chaves: sup, meia, fundo e raso (faixa sugerida), dificil (dia fraco ou água esfriando) e padrao. */
  var D = {
    carpacomum: {
      habito: "Carpa comum, húngara e espelho. Onívora, come no fundo. É a espécie da lista que menos sente a água fria.",
      zona: "fundo",
      iscas: ["Massa", "Milho", "Pastilhas"],
      montagens: ["Pesca de fundo com massa.", "Chuveirinho de fundo com massa.", "Técnica europeia, se o pesqueiro permitir: isca presa num laço ao lado do anzol (montagem de cabelo). Em fundo de lama, isca flutuante que fica um pouco acima do fundo."],
      linha: "Não achei bitola específica nas fontes. Vale a regra do pesqueiro.",
      dicas: ["No frio a carpa come em janelas curtas, em geral no fim da tarde.", "Fica mais perto da superfície no amanhecer e no fim da tarde, e no fundo no resto do dia.", "Com vento, massa e isca natural no fundo rendem mais que boia.", "Melhor crescimento entre 20 e 28 °C. Só para de comer perto de 4 °C."],
      fonte: "boa",
      porDia: { padrao: ["massa no fundo", "milho", "pastilha"], dificil: ["massa no fundo", "milho"] }
    },
    carpacabecuda: {
      habito: "Carpa de cabeça grande. Filtra zooplâncton e fica na meia-água. Não ataca isca comum: é pega com a nuvem de massa em volta dos anzóis.",
      zona: "meia",
      iscas: ["Pastilha de dissolução lenta, que forma uma nuvem em volta dos anzóis", "Massa fina própria para cabeçuda", "Massa turbinada: farelo seco e um pouco de essência (banana ou mel) na massa base"],
      montagens: ["Chuveirinho (vários anzóis em volta de uma mola que segura a pastilha), suspenso na meia-água com boia. O stop na linha regula a altura.", "Em ponto mais fundo, chuveirinho de fundo."],
      linha: "Não achei bitola nas fontes.",
      dicas: ["O que atrai é a nuvem de partículas, não o cheiro forte.", "Peneire a massa: ela dissolve por igual e forma a neve que chama a carpa.", "Não exagere na essência, para não chamar outros peixes.", "Ajuste a altura do chuveirinho até achar a camada onde o cardume está.", "Faixa de temperatura estimada pelas outras carpas."],
      fonte: "boa",
      porDia: { padrao: ["pastilha no chuveirinho de meia-água", "massa fina para cabeçuda"], dificil: ["pastilha no chuveirinho de fundo"] }
    },
    carpacapim: {
      habito: "Herbívora. Come plantas e capim, não ração. Tolera grande variação de temperatura, mas a atividade cai bastante no outono e no inverno.",
      zona: "coluna",
      iscas: ["Capim e grama frescos, não secos", "Pão", "Milho", "Ração, que ela aprende a comer na criação"],
      montagens: ["Boia com pão ou vegetal na superfície.", "No frio, isca vegetal no fundo."],
      linha: "Não achei bitola nas fontes.",
      dicas: ["Temperatura ideal de crescimento perto de 24 °C. Aguenta bem variação de temperatura e pouco oxigênio.", "Come capim e grama na superfície. Isca vegetal boiando rende mais com água morna.", "Pouca fonte de pesqueiro. Trate como ponto de partida."],
      fonte: "pouca",
      porDia: { sup: ["pão na boia", "folhas ou capim", "milho"], padrao: ["pão", "milho", "vegetais no fundo"] }
    },
    jundia: {
      porDia: { padrao: ["minhoca ou minhocuçu", "coração de frango", "isca de cheiro forte"] },
      habito: "Bagre nativo, onívoro, de fundo. Continua ativo no inverno.",
      zona: "fundo",
      iscas: ["Minhoca e minhocuçu", "Coração de frango ou de boi", "Iscas de cheiro forte usadas para bagres"],
      montagens: ["Pesca de fundo com chumbo para manter a isca parada."],
      linha: "Equipamento leve a médio. Sem bitola específica nas fontes.",
      dicas: ["Dicas emprestadas dos outros bagres. Achei pouca coisa específica de jundiá em pesqueiro."],
      fonte: "pouca"
    },
    dourado: {
      habito: "Carnívoro de hábito diurno, de água aberta. Ataca na superfície. É espécie da bacia do Prata e resiste ao frio do Sul.",
      zona: "caca",
      iscas: ["Iscas artificiais de superfície e de meia-água", "Peixes pequenos", "Coração de frango"],
      montagens: ["Artificial recolhida com velocidade, na superfície ou logo abaixo.", "Isca natural na meia-água, com boia."],
      linha: "Em pesquisa com pescadores de isca artificial, a maioria prefere multifilamento. Empate resistente a dente é prática comum, sem fonte para a bitola.",
      dicas: ["Rende mais com luz baixa e água movimentada, perto da entrada de água ou do aerador.", "Ataca isca de superfície. Use anzol simples sem farpa e deixe o peixe pouco tempo fora da água.", "Pouca fonte específica de pesqueiro. Faixa de temperatura provisória."],
      fonte: "pouca",
      porDia: { sup: ["artificial de superfície", "artificial de meia-água", "peixe pequeno na boia"], padrao: ["artificial de meia-água trabalhada devagar", "peixe pequeno", "coração de frango"] }
    },
    traira: {
      habito: "Predador de emboscada. Fica em margens com vegetação densa, troncos submersos e sombra. Resiste bem ao frio.",
      zona: "raso",
      iscas: ["Artificiais de superfície (zara, popper, stick)", "Soft com anzol offset, para não enroscar", "Tuvira, lambari, minhocuçu e pedaço de carne fresca"],
      montagens: ["Artificial arremessada rente à vegetação e às estruturas.", "Soft antienrosco trabalhada devagar no fundo quando o peixe não sobe."],
      linha: "Em pesquisa com pescadores de isca artificial, a maioria prefere multifilamento. Empate resistente a dente é prática comum, sem fonte para a bitola.",
      dicas: ["Iscas de superfície rendem mais no começo da manhã e no fim da tarde.", "Quando a temperatura cai, fica lenta e desce para o fundo ou entra nas estruturas.", "Trabalhe a artificial com pausas. A parada costuma disparar o ataque.", "Tire o anzol com alicate de bico, por causa dos dentes."],
      fonte: "boa",
      porDia: { raso: ["artificial de superfície (zara ou popper)", "soft antienrosco", "lambari ou tuvira"], padrao: ["soft antienrosco devagar no fundo", "lambari, tuvira ou minhocuçu", "pedaço de carne fresca"], dificil: ["soft antienrosco devagar no fundo", "lambari, tuvira ou minhocuçu", "pedaço de carne fresca"] }
    },
    catfish: {
      porDia: { padrao: ["fígado de galinha", "coração de frango ou de boi", "minhoca", "massa de cheiro forte", "salsicha"] },
      habito: "Bagre de fundo, guiado pelo olfato. Fica agitado com muita luz e água transparente.",
      zona: "fundo",
      iscas: ["Peixe em postas", "Fígado de galinha, coração de frango ou de boi", "Minhoca e salsicha", "Massas de cheiro forte"],
      montagens: ["Pesca de fundo com chumbo para manter a isca no fundo."],
      linha: "Equipamento leve a médio.",
      dicas: ["Noite e amanhecer são os horários mais citados, quando ele vai para o raso e para as margens.", "Dias nublados e água turva ajudam.", "Em água muito clara e com muita luz ele fica agitado. Procure sombra, fundo e o lado mais turvo do lago."],
      fonte: "boa"
    },
    tilapia: {
      habito: "Onívora. Belisca e testa a isca antes de levar. Sobe no calor. No frio vai para o fundo e come menos.",
      zona: "coluna",
      iscas: ["Massa macia, do tamanho de uma azeitona média, cobrindo todo o anzol", "Minhoca, milho, bicho da laranjeira", "Calor: massas doces e frutadas que soltam partículas", "Frio ou dia difícil: massa de cheiro forte (queijo, sangue ou fígado), que dissolve devagar", "Massa em tablete ou bloco quando há lambari beliscando"],
      montagens: [
        "Linha folgada e chumbo livre: quando a tilápia puxa, quem se mexe é o chicote, não o chumbo, e ela não sente peso.",
        "Chuveirinho com mola para segurar a massa.",
        "No calor, boia cevadeira na superfície.",
        "No frio ou com peixe manhoso: massa parada no fundo."
      ],
      linha: "Anzol pequeno e discreto, tipo chinu ou tinu. Para tilápia menor, chinu 2 a 4. Sem bitola de linha nas fontes: quanto mais fina o pesqueiro permitir, melhor a fisgada.",
      dicas: ["Se a massa some e não fisga, diminua a bolinha.", "Fisgue quando a linha esticar, não no primeiro toque.", "Em água turva, massa vermelha ou branca aparece mais.", "Em criação, o desempenho já cai com a água abaixo de 23 °C e o conforto fica entre 27 e 32 °C."],
      fonte: "boa",
      porDia: { sup: ["massa doce ou frutada que solta partículas", "ração na boia cevadeira", "milho"], meia: ["massa macia", "minhoca", "milho"], padrao: ["massa de cheiro forte (queijo, sangue ou fígado) no fundo", "minhoca", "massa em tablete"], dificil: ["massa de cheiro forte (queijo, sangue ou fígado) no fundo", "minhoca", "massa em tablete"] }
    },
    matrinxa: {
      habito: "Peixe de escama amazônico, ativo, de superfície e meia-água. Tolera de 18 a 36 °C. A 12 °C morre.",
      zona: "coluna",
      iscas: ["Ração", "Coração de frango", "Milho", "Pequenas iscas artificiais (spinner e plug pequeno)"],
      montagens: ["Boia com isca na superfície ou na meia-água.", "Artificial pequena recolhida rápido."],
      linha: "Sem bitola nas fontes.",
      porDia: { padrao: ["ração", "coração de frango", "milho"], dificil: ["coração de frango", "milho"] },
      dicas: ["Faixa ideal de criação entre 25 e 28 °C. Abaixo disso come menos.", "No rio vive junto a pedras e troncos e come frutinhas, sementes, insetos e peixes pequenos. Use isca pequena, perto de estrutura.", "Se faltar oxigênio, sobe para respirar na camada de cima e não come."],
      fonte: "pouca"
    },
    piraputanga: {
      habito: "Parente da matrinxã, do Pantanal. Onívora, come frutos e insetos na superfície.",
      zona: "coluna",
      iscas: ["Ração", "Coração de frango", "Milho", "Pequenas iscas artificiais (spinner e plug pequeno)"],
      montagens: ["Boia com isca na superfície ou na meia-água.", "Artificial pequena recolhida rápido."],
      linha: "Sem bitola nas fontes.",
      porDia: { padrao: ["ração", "coração de frango", "milho"], dificil: ["coração de frango", "milho"] },
      dicas: ["Não achei faixa de temperatura própria. Usei a da matrinxã com um pouco mais de tolerância ao frio.", "Pouca fonte de pesqueiro."],
      fonte: "pouca"
    },
    piau: {
      habito: "Piau e piauçu. Onívoros, comem perto do fundo e na meia-água. O piauçu é da bacia do Paraguai e come mais conforme a água esquenta.",
      zona: "fundo",
      iscas: ["Milho", "Massa", "Minhoca", "Coração de frango"],
      montagens: ["Pesca de fundo ou de meia-água com anzol pequeno."],
      linha: "Sem bitola nas fontes. Peixe de boca pequena: anzol pequeno.",
      dicas: ["Belisca a isca. Use dois grãos de milho cobrindo todo o anzol.", "Temperatura de criação indicada perto de 27 °C. Faixa provisória."],
      fonte: "pouca",
      porDia: { padrao: ["milho", "massa", "minhoca"], dificil: ["minhoca", "milho"] }
    },
    pacu: {
      habito: "Onívoro. É o mais tolerante ao frio entre os redondos.",
      zona: "coluna",
      iscas: REDONDOS.iscas.concat(["Milho"]), montagens: REDONDOS.montagens, linha: REDONDOS.linha, porDia: REDONDOS.porDia,
      dicas: ["Com água morna, sobe para comer na superfície. Em dia ruim fica no fundo ou na meia-água.", "Boia cevadeira não combina com vento forte em pesqueiro: a linha corre e enrosca na do vizinho."],
      fonte: "boa"
    },
    tambacu: {
      habito: "Híbrido de tambaqui com pacu. Aguenta mais frio que o tambaqui e menos que o pacu.",
      zona: "coluna",
      iscas: REDONDOS.iscas, montagens: REDONDOS.montagens, linha: REDONDOS.linha, porDia: REDONDOS.porDia,
      dicas: ["Boia na superfície quando o peixe sobe, em dia quente.", "Em dia ruim, fundo ou meia-água, com isca de cheiro (fígado, tilápia)."],
      fonte: "boa"
    },
    patinga: {
      habito: "Híbrido de pacu com pirapitinga. Fica entre os dois na tolerância ao frio.",
      zona: "coluna",
      iscas: REDONDOS.iscas, montagens: REDONDOS.montagens, linha: REDONDOS.linha, porDia: REDONDOS.porDia,
      dicas: ["Use as mesmas montagens dos outros redondos.", "Há relatos de mortandade de patinga com água a 12 °C ou menos. Faixa de temperatura provisória."],
      fonte: "pouca"
    },
    pintado: {
      porDia: { padrao: ["tilápia em postas ou cabeça", "peixes pequenos", "fígado"] },
      habito: "Surubim de pintas. Predador de fundo, caça mais com pouca luz. Conforto de 24 a 30 °C.",
      zona: "fundo",
      iscas: ["Peixes pequenos e pedaços de peixe", "Tilápia em postas ou cabeça", "Fígado e iscas de cheiro forte", "Massa de fundo com cheiro de sangue ou de peixe"],
      montagens: ["Pesca de fundo com chumbada solta e isca natural."],
      linha: "Líder de fluorocarbono é citado para a linha não ser cortada. Sem bitola nas fontes.",
      dicas: ["Amanhecer e entardecer são os melhores horários. De dia, céu fechado ajuda.", "Fica no fundo ou na meia-água, junto a troncos e pedras. Coloque a isca rente à estrutura.", "Com artificial, soft no fundo, devagar e com pausas."],
      fonte: "boa"
    },
    cachara: {
      habito: "Surubim de listras. Predador de fundo, caça mais com pouca luz. Mesma faixa de conforto do pintado, de 24 a 30 °C.",
      zona: "fundo",
      iscas: ["Peixes pequenos e pedaços de peixe", "Tilápia em postas ou cabeça", "Fígado e iscas de cheiro forte"],
      montagens: ["Pesca de fundo com chumbada solta e isca natural."],
      linha: "Líder de fluorocarbono é citado para a linha não ser cortada. Sem bitola nas fontes.",
      porDia: { padrao: ["tilápia em postas ou cabeça", "peixes pequenos", "fígado"] },
      dicas: ["Amanhecer e céu fechado são os melhores momentos entre 5h e 17h.", "Costuma ficar parada, de tocaia. Isca natural parada no fundo, perto de estruturas, e paciência."],
      fonte: "boa"
    },
    cachapira: {
      habito: "Híbridos de surubim com bagres amazônicos (cachara com pirarara, cachara com jundiá-da-amazônia). Predadores de fundo, sensíveis ao frio.",
      zona: "fundo",
      iscas: ["Peixes pequenos e pedaços de peixe", "Tilápia em postas ou cabeça", "Fígado e iscas de cheiro forte"],
      montagens: ["Pesca de fundo com chumbada solta e isca natural."],
      linha: "Líder de fluorocarbono é citado para a linha não ser cortada. Sem bitola nas fontes.",
      porDia: { padrao: ["tilápia em postas ou cabeça", "peixes pequenos", "fígado"] },
      dicas: ["Há relatos de mortandade do pintado-amazônico com água a 12 °C ou menos. Em água fria quase não come.", "Faixa de temperatura provisória, puxada para o lado amazônico."],
      fonte: "pouca"
    },
    tambaqui: {
      habito: "Onívoro amazônico. Precisa de água quente e tolera pouco oxigênio.",
      zona: "coluna",
      iscas: REDONDOS.iscas, montagens: REDONDOS.montagens, linha: REDONDOS.linha, porDia: REDONDOS.porDia,
      dicas: ["Abaixo de 25 °C já perde apetite. Em São Bernardo, é peixe de dias quentes.", "Na friagem o metabolismo e a fome caem muito. Depois de frente fria, espere a água esquentar de novo.", "Com calor, sobe e ataca a ração na superfície."],
      fonte: "boa"
    },
    pirapitinga: {
      habito: "Redondo amazônico. Conforto de 25 a 32 °C. Sente bastante o frio.",
      zona: "coluna",
      iscas: REDONDOS.iscas, montagens: REDONDOS.montagens, linha: REDONDOS.linha, porDia: REDONDOS.porDia,
      dicas: ["Use as mesmas montagens dos outros redondos.", "Em São Bernardo, só em dias quentes."],
      fonte: "boa"
    },
    tambatinga: {
      habito: "Híbrido de tambaqui com pirapitinga. Os dois pais são amazônicos: é peixe de água quente.",
      zona: "coluna",
      iscas: REDONDOS.iscas, montagens: REDONDOS.montagens, linha: REDONDOS.linha, porDia: REDONDOS.porDia,
      dicas: ["Use as mesmas montagens dos outros redondos.", "Em São Bernardo, só em dias quentes. Faixa de temperatura provisória."],
      fonte: "pouca"
    },
    pirarara: {
      habito: "Bagre grande, de fundo, onívoro e noturno. Come quase de tudo: os pescadores a chamam de lixeira do lago.",
      zona: "fundo",
      iscas: ["Cabeça de tilápia e peixe em postas", "Isca viva, se o pesqueiro permitir: tilápia ou lambari", "Salsicha, queijo, bacon, ovo cozido e filé de frango", "Fígado de boi"],
      montagens: ["Pesca de fundo com anzol circular forte.", "Fígado em anzol encastoado, com chumbada solta.", "Com o lago cheio ela se afasta da margem: arremesse de 5 a 20 m para dentro."],
      linha: "Equipamento pesado. Sem bitola nas fontes.",
      dicas: ["Dê tempo para o peixe engolir a isca antes de fisgar.", "Depois da fisgada, pressione logo para ele não levar a linha para as estruturas.", "Segure sempre na horizontal, apoiando o corpo. Levantar pela boca ou pela guelra pode matar o peixe.", "Faixa de temperatura estimada pela origem amazônica."],
      fonte: "boa",
      porDia: { padrao: ["cabeça de tilápia ou peixe em postas", "salsicha", "fígado de boi", "queijo ou bacon"] }
    },
    tucunare: {
      habito: "Predador diurno de estrutura, de origem amazônica. Ótimo perto de 28 °C. Perto de 15 °C morre.",
      zona: "raso",
      iscas: ["Iscas artificiais de superfície e de meia-água", "Jig e soft", "Peixe pequeno, se o pesqueiro permitir"],
      montagens: ["Artificial trabalhada perto de estruturas e margens."],
      linha: "Sem bitola nas fontes.",
      dicas: ["Frente fria derruba a atividade. Depois de dias quentes seguidos, volta a atacar.", "Pouca fonte específica de pesqueiro."],
      fonte: "pouca",
      porDia: { raso: ["artificial de superfície", "artificial de meia-água", "jig"], padrao: ["jig ou soft devagar", "artificial de meia-água"], dificil: ["jig ou soft devagar", "peixe pequeno, se permitido"] }
    },
    pirarucu: {
      habito: "Gigante amazônico. Sobe à superfície para respirar. Precisa de água entre 22 e 30 °C.",
      zona: "caca",
      iscas: ["Isca viva ou natural (peixe), conforme a regra do pesqueiro", "Ração, em lagos onde é tratado com ela"],
      montagens: ["Isca natural com boia, perto de onde o peixe sobe para respirar."],
      linha: "Equipamento reforçado. Sem bitola nas fontes.",
      dicas: ["Observe onde ele boia para respirar e arremesse perto.", "Ele sobe para respirar ar a cada 15 a 20 minutos. Marque o ponto e espere a próxima subida.", "Em São Bernardo a água fica fria para ele boa parte do ano. Faixa de temperatura provisória."],
      fonte: "pouca",
      porDia: { padrao: ["peixe vivo ou em pedaços, se o pesqueiro permitir", "ração, se for o trato do lago"] }
    }
  };
  var api = { POR_ESPECIE: D };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else raiz.Dicas = api;
})(typeof window !== "undefined" ? window : this);
