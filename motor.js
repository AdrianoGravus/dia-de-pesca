/*
 * Motor de notas do aplicativo de pesca (versao 2 das regras, igual a planilha notas_sao_bernardo_v2.xlsx).
 * Funciona no navegador (window.Motor) e no Node (module.exports), para permitir teste de paridade.
 * Todos os coeficientes sao provisorios. Ver especificacao, secoes 4.3 e 4.4.
 */
(function (raiz) {
  "use strict";

  // ---- modelo de temperatura da agua
  var K_SOL = 0.010, K_VENTO = 0.05, TAU_CIMA = 3.0, TAU_FUNDO = 10.0, TAU_COLUNA = 6.0, PESO_CIMA = 0.5;
  var VENTO_MISTURA_MAX = 30.0, VENTO_MISTURA_MEDIO = 18.0, CHUVA_MISTURA = 30.0, DIF_CAMADAS = 1.0;

  var PERIODOS = [
    { nome: "Amanhecer", faixa: "5h a 8h", horas: [5, 6, 7], desloc: -0.50, fatorO2: 1.0 },
    { nome: "Manhã", faixa: "8h a 11h", horas: [8, 9, 10], desloc: -0.25, fatorO2: 0.6 },
    { nome: "Meio do dia", faixa: "11h a 14h", horas: [11, 12, 13], desloc: 0.15, fatorO2: 0.3 },
    { nome: "Tarde", faixa: "14h a 17h", horas: [14, 15, 16], desloc: 0.50, fatorO2: 0.2 },
    { nome: "Entardecer", faixa: "17h a 20h", horas: [17, 18, 19], desloc: 0.30, fatorO2: 0.2 }
  ];
  var LUZ = {
    couro: [0.8, 0.5, 0.3, 0.5, 1.0],
    predadores: [1.0, 0.7, 0.4, 0.6, 1.0],
    diurnos_frio: [0.3, 0.5, 0.8, 1.0, 0.8],
    diurnos_ameno: [0.6, 0.9, 0.8, 0.9, 0.9],
    diurnos_quente: [0.9, 1.0, 0.5, 0.6, 1.0]
  };
  // zero inferior, conforto de, conforto ate, zero superior (graus C)
  var ESPECIES = [
    { id: "carpacomum", nome: "Carpa comum", z1: 4, c1: 20, c2: 28, z2: 32, grupo: "diurnos", alvo: true, provisorio: false },
    { id: "carpacabecuda", nome: "Carpa cabeçuda", z1: 6, c1: 20, c2: 29, z2: 33, grupo: "diurnos", alvo: false, provisorio: true },
    { id: "carpacapim", nome: "Carpa capim", z1: 8, c1: 20, c2: 28, z2: 32, grupo: "diurnos", alvo: false, provisorio: true },
    { id: "jundia", nome: "Jundiá", z1: 6, c1: 18, c2: 28, z2: 32, grupo: "couro", alvo: false, provisorio: true },
    { id: "dourado", nome: "Dourado", z1: 8, c1: 20, c2: 28, z2: 32, grupo: "predadores", alvo: false, provisorio: true },
    { id: "traira", nome: "Traíra", z1: 6, c1: 18, c2: 28, z2: 32, grupo: "predadores", alvo: false, provisorio: true },
    { id: "catfish", nome: "Catfish americano", z1: 8, c1: 20, c2: 30, z2: 34, grupo: "couro", alvo: false, provisorio: false },
    { id: "tilapia", nome: "Tilápia", z1: 12, c1: 20, c2: 32, z2: 36, grupo: "diurnos", alvo: true, provisorio: false },
    { id: "matrinxa", nome: "Matrinxã", z1: 15, c1: 23, c2: 30, z2: 34, grupo: "predadores", alvo: false, provisorio: false },
    { id: "piraputanga", nome: "Piraputanga", z1: 14, c1: 22, c2: 30, z2: 34, grupo: "predadores", alvo: false, provisorio: true },
    { id: "piau", nome: "Piau e piauçu", z1: 14, c1: 22, c2: 30, z2: 34, grupo: "diurnos", alvo: false, provisorio: true },
    { id: "pacu", nome: "Pacu", z1: 15, c1: 23, c2: 29, z2: 33, grupo: "diurnos", alvo: true, provisorio: false },
    { id: "tambacu", nome: "Tambacu", z1: 16, c1: 24, c2: 31, z2: 35, grupo: "diurnos", alvo: true, provisorio: false },
    { id: "patinga", nome: "Patinga", z1: 16, c1: 24, c2: 30, z2: 34, grupo: "diurnos", alvo: false, provisorio: true },
    { id: "pintado", nome: "Pintado", z1: 16, c1: 24, c2: 30, z2: 34, grupo: "couro", alvo: true, provisorio: false },
    { id: "cachara", nome: "Cachara", z1: 16, c1: 24, c2: 30, z2: 34, grupo: "couro", alvo: false, provisorio: false },
    { id: "cachapira", nome: "Cachapira e pintado-amazônico", z1: 17, c1: 25, c2: 31, z2: 35, grupo: "couro", alvo: false, provisorio: true },
    { id: "tambaqui", nome: "Tambaqui", z1: 17, c1: 25, c2: 34, z2: 38, grupo: "diurnos", alvo: true, provisorio: false },
    { id: "pirapitinga", nome: "Pirapitinga", z1: 17, c1: 25, c2: 32, z2: 36, grupo: "diurnos", alvo: false, provisorio: false },
    { id: "tambatinga", nome: "Tambatinga", z1: 17, c1: 25, c2: 33, z2: 37, grupo: "diurnos", alvo: false, provisorio: true },
    { id: "pirarara", nome: "Pirarara", z1: 17, c1: 25, c2: 32, z2: 36, grupo: "couro", alvo: false, provisorio: true },
    { id: "tucunare", nome: "Tucunaré", z1: 17, c1: 24, c2: 31, z2: 35, grupo: "predadores", alvo: false, provisorio: false },
    { id: "pirarucu", nome: "Pirarucu", z1: 18, c1: 24, c2: 31, z2: 35, grupo: "predadores", alvo: false, provisorio: true }
  ];
  var CONFIG_PADRAO = {
    pesos: { temperatura: 40, tendencia: 15, oxigenio: 20, luz: 15, virada: 10 },
    descontoFds: 5, ajusteCima: 0, ajusteFundo: 0,
    // medida do dia: "otimo" se, além de "bom", a melhor nota arredondada chega a 90;
    // "bom" se pelo menos dois horários chegam a 80; "fraco" se nenhum chega a 65
    limites: { muitoBom: 90, bom: 80, horariosBons: 2, fraco: 65 }
  };

  function clip(v, a, b) { a = a === undefined ? 0 : a; b = b === undefined ? 1 : b; return Math.max(a, Math.min(b, v)); }
  function num(v) { return (v === null || v === undefined) ? 0 : v; }
  function media(xs) {
    var s = 0, n = 0;
    for (var i = 0; i < xs.length; i++) { if (xs[i] !== null && xs[i] !== undefined) { s += xs[i]; n++; } }
    return n ? s / n : null;
  }
  function fTermica(t, e) {
    return Math.max(0, Math.min(1, (t - e.z1) / (e.c1 - e.z1), (e.z2 - t) / (e.z2 - e.c2)));
  }

  /* horario: objeto "hourly" do Open-Meteo, com time[] em hora local (AAAA-MM-DDTHH:00). */
  function calcular(horario) {
    var porDia = {}, ordem = [];
    for (var i = 0; i < horario.time.length; i++) {
      var t = horario.time[i], dia = t.slice(0, 10), h = parseInt(t.slice(11, 13), 10);
      if (!porDia[dia]) { porDia[dia] = {}; ordem.push(dia); }
      porDia[dia][h] = {
        temp: horario.temperature_2m[i],
        nuvens: horario.cloud_cover ? horario.cloud_cover[i] : null,
        rad: horario.shortwave_radiation[i],
        chuva: horario.precipitation[i],
        vento: horario.wind_speed_10m[i],
        rajada: horario.wind_gusts_10m ? horario.wind_gusts_10m[i] : null,
        pressao: horario.pressure_msl ? horario.pressure_msl[i] : null
      };
    }
    var dias = ordem.filter(function (d) {
      if (Object.keys(porDia[d]).length !== 24) return false;
      for (var h = 0; h < 24; h++) { if (porDia[d][h].temp === null || porDia[d][h].temp === undefined) return false; }
      return true;
    }).sort();

    var D = {};
    dias.forEach(function (d) {
      var hs = []; for (var h = 0; h < 24; h++) hs.push(porDia[d][h]);
      D[d] = {
        data: d,
        tmed: media(hs.map(function (x) { return x.temp; })),
        tmin: Math.min.apply(null, hs.map(function (x) { return x.temp; })),
        tmax: Math.max.apply(null, hs.map(function (x) { return x.temp; })),
        rad: num(media(hs.map(function (x) { return x.rad; }))),
        vmed: num(media(hs.map(function (x) { return x.vento; }))),
        vmax: Math.max.apply(null, hs.map(function (x) { return num(x.vento); })),
        chuva: hs.reduce(function (s, x) { return s + num(x.chuva); }, 0),
        nuvens: num(media(hs.map(function (x) { return x.nuvens; })))
      };
    });

    // ---- temperatura da agua em duas camadas
    var col = media(dias.slice(0, 7).map(function (d) { return D[d].tmed; })) + 1.0;
    var cima = col, fundo = col, misturado = true, diasCamadas = 0;
    dias.forEach(function (d) {
      var x = D[d];
      var te = x.tmed + K_SOL * x.rad - K_VENTO * Math.max(0, x.vmed - 5);
      var evento = x.vmax >= VENTO_MISTURA_MAX || x.vmed >= VENTO_MISTURA_MEDIO || x.chuva >= CHUVA_MISTURA;
      if (misturado) {
        if (te > col + 1.0 && !evento) {
          cima = col + (te - col) / TAU_CIMA;
          fundo = col + (cima - col) / TAU_FUNDO;
          misturado = false;
        } else {
          col = col + (te - col) / TAU_COLUNA;
          cima = fundo = col;
        }
      } else {
        cima = cima + (te - cima) / TAU_CIMA;
        fundo = fundo + (cima - fundo) / TAU_FUNDO;
        if (evento || cima <= fundo + 0.1) {
          col = PESO_CIMA * cima + (1 - PESO_CIMA) * fundo;
          cima = fundo = col;
          misturado = true;
        }
      }
      var emCamadas = (cima - fundo) >= DIF_CAMADAS;
      diasCamadas = emCamadas ? diasCamadas + 1 : 0;
      x.cima = cima; x.fundo = fundo; x.emCamadas = emCamadas; x.diasCamadas = diasCamadas;
      x.amp = (0.5 + 0.008 * x.rad) * (1 - Math.min(x.vmed, 20) / 40);
      x.fatorFundo = (diasCamadas >= 7 && cima >= 26) ? 0.6 : ((diasCamadas >= 3 && cima >= 24) ? 0.8 : 1.0);
    });

    // ---- componentes por dia e por periodo (a partir do quarto dia da serie)
    var saida = [];
    for (var k = 3; k < dias.length; k++) {
      (function (i) {
        var d = dias[i], x = D[d], a1 = D[dias[i - 1]], a2 = D[dias[i - 2]], a3 = D[dias[i - 3]];
        var queda = Math.max(a2.tmed - x.tmed, a1.tmed - x.tmed, 0);
        var tendAr = clip(1 - queda / 5);
        var quedaAgua = Math.max(a3.cima - x.cima, 0);
        var tendAgua = clip(1 - quedaAgua / 3);
        x.tendencia = Math.min(tendAr, tendAgua);
        x.quedaAr = queda; x.quedaAgua = quedaAgua;
        var calor = clip((x.cima - 26) / 4), morna = clip((x.cima - 18) / 6);
        var nublado = (a1.nuvens >= 80 && a2.nuvens >= 80) ? 1 : (a1.nuvens >= 85 ? 0.5 : 0);
        var calmaria = a1.vmed < 5 ? 1 : 0;
        var chuvaForte = (a1.chuva >= 30 || x.chuva >= 30) ? 1 : 0;
        x.riscoO2 = Math.min(1, 0.40 * calor + morna * (0.35 * nublado + 0.15 * calmaria) + 0.35 * chuvaForte);
        x.regime = x.cima < 20 ? "frio" : ((x.cima >= 27 || x.tmax >= 30) ? "quente" : "ameno");
        x.periodos = PERIODOS.map(function (P, kp) {
          var hh = P.horas.map(function (h) { return porDia[d][h]; });
          var chuvaP = hh.reduce(function (s, v) { return s + num(v.chuva); }, 0);
          var ventoP = num(media(hh.map(function (v) { return v.vento; })));
          var rajadaP = Math.max.apply(null, hh.map(function (v) { return num(v.rajada); }));
          var nuvensP = num(media(hh.map(function (v) { return v.nuvens; })));
          var tempP = media(hh.map(function (v) { return v.temp; }));
          var bonus = nuvensP >= 70 ? 0.2 : 0;
          var luzDiur = LUZ["diurnos_" + x.regime][kp];
          if (x.regime === "quente" && (kp === 2 || kp === 3)) luzDiur = Math.min(1, luzDiur + bonus);
          // virada do tempo
          var meio = P.horas[1];
          var pHoje = porDia[d][meio].pressao, ontem = porDia[dias[i - 1]] || {}, pOntem = ontem[meio] ? ontem[meio].pressao : null;
          var dp24 = (pHoje !== null && pHoje !== undefined && pOntem !== null && pOntem !== undefined) ? pHoje - pOntem : 0;
          var sPressao = clip(-dp24 / 4, -1, 1);
          var chuva6 = 0, tmaxAte = -99, h;
          for (h = Math.max(0, P.horas[0] - 3); h <= P.horas[2]; h++) chuva6 += num(porDia[d][h].chuva);
          for (h = 0; h <= P.horas[2]; h++) tmaxAte = Math.max(tmaxAte, porDia[d][h].temp);
          var sRefresco = (chuva6 >= 2 && tmaxAte >= 25 && x.cima >= 21) ? 1 : 0;
          var antes = []; for (h = 6; h < P.horas[0]; h++) antes.push(porDia[d][h].nuvens);
          var sFechou = (antes.length && nuvensP >= 80 && num(media(antes)) <= 60) ? 1 : 0;
          var virada = clip(0.5 + 0.15 * sPressao + 0.25 * sRefresco + 0.20 * sFechou);
          var conforto = chuvaP > 10 ? "Chuva forte" : chuvaP > 3 ? "Chuva moderada" : chuvaP > 0.3 ? "Chuva fraca" : "Seco";
          if (rajadaP >= 60) conforto += ", rajadas muito fortes";
          else if (rajadaP >= 45 || ventoP > 25) conforto += ", vento forte";
          return {
            nome: P.nome, faixa: P.faixa,
            tCima: x.cima + P.desloc * x.amp, tFundo: x.fundo, fatorFundo: x.fatorFundo,
            tendencia: x.tendencia, oxigenio: 1 - x.riscoO2 * P.fatorO2, virada: virada,
            luz: { couro: Math.min(1, LUZ.couro[kp] + bonus), predadores: Math.min(1, LUZ.predadores[kp] + bonus), diurnos: luzDiur },
            tempAr: tempP, chuva: chuvaP, vento: ventoP, rajada: rajadaP, nuvens: nuvensP, conforto: conforto,
            sPressao: sPressao, sRefresco: sRefresco, sFechou: sFechou, dp24: dp24
          };
        });
        saida.push(x);
      })(k);
    }
    return saida;
  }

  /* Nota de uma especie em um periodo. Devolve nota (0 a 100), nota termica e a melhor camada. */
  function notaEspecie(p, e, cfg) {
    cfg = cfg || CONFIG_PADRAO;
    var w = cfg.pesos;
    var fc = fTermica(p.tCima + (cfg.ajusteCima || 0), e);
    var ff = p.fatorFundo * fTermica(p.tFundo + (cfg.ajusteFundo || 0), e);
    var ft = Math.max(fc, ff);
    var soma = w.temperatura + w.tendencia + w.oxigenio + w.luz + w.virada;
    var nota = 100 * (w.temperatura * ft + w.tendencia * p.tendencia + w.oxigenio * p.oxigenio + w.luz * p.luz[e.grupo] + w.virada * p.virada) / soma;
    var camada = Math.abs(fc - ff) < 0.02 ? "igual" : (fc > ff ? "cima" : "fundo");
    return { nota: nota, termica: ft, camada: camada };
  }

  /* Medida do dia a partir das cinco notas (0 a 100) dos horários. Devolve "otimo", "bom", "medio" ou "fraco". */
  function veredito(notas, cfg, desconto) {
    var L = (cfg || CONFIG_PADRAO).limites || CONFIG_PADRAO.limites;
    var v = notas.map(function (n) { return n - (desconto || 0); }).sort(function (a, b) { return b - a; });
    if (v[L.horariosBons - 1] >= L.bom) return Math.round(v[0]) >= L.muitoBom ? "otimo" : "bom";
    if (v[0] < L.fraco) return "fraco";
    return "medio";
  }

  /* Onde procurar a espécie em um horário. zona: hábito da espécie ("fundo", "coluna" ou "raso").
     Devolve faixa ("sup", "meia", "fundo" ou "raso") e uma frase. É sugestão calculada, ainda não conferida no lago. */
  function profundidade(p, e, zona, cfg) {
    cfg = cfg || CONFIG_PADRAO;
    var tc = p.tCima + (cfg.ajusteCima || 0), tf = p.tFundo + (cfg.ajusteFundo || 0);
    var camadas = (tc - tf) >= 1, fundoRuim = p.fatorFundo < 1;
    var frio = Math.max(tc, tf) < e.c1, quente = tc > e.c2;
    if (zona === "raso") {
      if (frio) return { faixa: "fundo", texto: "Água fria para a espécie: peixe lento, mais fundo e dentro das estruturas. Isca devagar." };
      return { faixa: "raso", texto: "Raso, junto de margens, vegetação, troncos e sombra." };
    }
    if (zona === "meia") { // filtradores de meia-água, como a carpa cabeçuda
      if (frio) return { faixa: "fundo", texto: "Água fria para a espécie: mais fundo, com chuveirinho de fundo." };
      return { faixa: "meia", texto: "Meia-água, com chuveirinho suspenso por boia." };
    }
    if (zona === "caca") { // predadores de água aberta
      if (frio) return { faixa: "meia", texto: "Água fria para a espécie: peixe lento e mais fundo. Isca trabalhada devagar, na meia-água ou perto do fundo." };
      if (quente) return { faixa: "meia", texto: "Água de cima quente demais: meia-água nas horas de sol, superfície cedo." };
      return { faixa: "sup", texto: "Superfície e meia-água, com isca em movimento." };
    }
    if (zona === "fundo") {
      if (fundoRuim) return { faixa: "meia", texto: "Fundo das partes mais rasas, até uns 2 m. Na parte mais funda o fundo deve estar com pouco oxigênio." };
      if (frio && camadas) return { faixa: "fundo", texto: "Fundo, de preferência nas partes rasas e com sol, onde a água está mais quente." };
      return { faixa: "fundo", texto: "Fundo." };
    }
    if (quente) return { faixa: "meia", texto: "Água de cima quente demais para a espécie: meia-água ou mais fundo nas horas de sol." };
    if (frio) {
      if (camadas) return { faixa: "meia", texto: "Meia-água para cima, onde a água está mais quente. Sem ação, desça a isca até o fundo." };
      return { faixa: "fundo", texto: "Água fria e igual de cima a baixo: fundo ou meia-água, com isca parada." };
    }
    if (tc >= e.c1) return { faixa: "sup", texto: "Superfície e meia-água. Boia com isca flutuante." };
    return { faixa: "meia", texto: "Meia-água." };
  }

  var api = { veredito: veredito, profundidade: profundidade, calcular: calcular, notaEspecie: notaEspecie, fTermica: fTermica, ESPECIES: ESPECIES, PERIODOS: PERIODOS, CONFIG_PADRAO: CONFIG_PADRAO };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else raiz.Motor = api;
})(typeof window !== "undefined" ? window : this);
