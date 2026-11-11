/* Dia de Pesca: telas "Dias" e "Espécies". Os dados ficam no aparelho. */
(function () {
  "use strict";
  var M = window.Motor, DIC = window.Dicas.POR_ESPECIE;
  var PADRAO = { lat: -23.69, lon: -46.57, nome: "São Bernardo do Campo" };
  var SEM = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
  var SEM3 = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
  var MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  var VARIAVEIS = "temperature_2m,cloud_cover,shortwave_radiation,precipitation,wind_speed_10m,wind_gusts_10m,pressure_msl";
  var MEDIDA = { otimo: "Muito bom", bom: "Vale ir", medio: "Dia médio", fraco: "Não vale a pena" };
  var SELO = { otimo: "Muito bom", bom: "Bom", medio: "Médio", fraco: "Fraco" };
  var GERAIS = [
    "A temperatura da água manda. Escolha a espécie pelo dia: com água fria, carpas, tilápia e traíra; com água quente, tambaqui e os outros redondos.",
    "Com água fria ou amena, a tarde costuma render mais, porque a água de cima esquenta ao longo do dia.",
    "Peixe em cima, no calor: boia e isca flutuante. Dia difícil ou frio: fundo ou meia-água, isca de cheiro e parada.",
    "Peixes de couro comem melhor com pouca luz: amanhecer, entardecer e céu fechado.",
    "Queda forte de temperatura derruba a pescaria por um ou dois dias. A virada do tempo, com chuva refrescando um dia quente, costuma ativar os peixes.",
    "Peixe boiando sem comer no começo da manhã é sinal de pouco oxigênio. Espere o sol subir.",
    "Com vento forte, evite boia cevadeira no pesqueiro: a linha corre e enrosca na do vizinho.",
    "Fim de semana e lago cheio deixam o peixe mais arisco. O horário do trato do pesqueiro também muda o comportamento.",
    "Confira sempre a regra do pesqueiro para anzol, isca e chicote."
  ];
  var SEM1 = ["D", "S", "T", "Q", "Q", "S", "S"];
  var OCULTOS = [4]; // horários tirados do aplicativo: 4 = das 17h às 20h. Não aparecem nem contam na nota.
  var FORA = [];     // horários que aparecem, mas não contam na nota do dia
  function conta(k) { return FORA.indexOf(k) < 0; }
  function contadas(v) { return v.filter(function (_, k) { return conta(k); }); }
  function melhorDe(v) { var m = -1; v.forEach(function (x, k) { if (conta(k) && (m < 0 || x > v[m])) m = k; }); return m; }
  var FAIXA = { sup: "superfície", meia: "meia-água", fundo: "fundo", raso: "raso, nas margens" };
  var BOIA = '<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="15" y="1" width="2" height="9" rx="1" fill="#fff"/><rect x="15" y="25" width="2" height="6" rx="1" fill="#9DBBAF"/><path d="M16 8c4 0 6.5 4 6.5 9h-13C9.500 12 12 8 16 8z" fill="#F4C20D"/><path d="M9.500 17h13c0 5-2.500 9-6.500 9s-6.500-4-6.500-9z" fill="#fff"/></svg>';
  var params = new URLSearchParams(location.search);
  var app = document.getElementById("app");
  var estado = { dias: [], prox: [], res: {}, posicao: null, aviso: "", baixadoEm: null, cfg: lerCfg(), dia: null, per: null, esp: null };

  // ---------- armazenamento local
  function ler(chave) { try { return JSON.parse(localStorage.getItem(chave)); } catch (e) { return null; } }
  function gravar(chave, v) { try { localStorage.setItem(chave, JSON.stringify(v)); } catch (e) { /* sem armazenamento: segue sem guardar */ } }
  function lerCfg() {
    var c = ler("pesca.cfg") || {};
    return { alvos: Array.isArray(c.alvos) ? c.alvos : M.ESPECIES.filter(function (e) { return e.alvo; }).map(function (e) { return e.id; }), motor: M.CONFIG_PADRAO };
  }
  function salvarCfg() { gravar("pesca.cfg", { alvos: estado.cfg.alvos }); }

  // ---------- utilidades
  function hojeISO() {
    if (params.get("hoje")) return params.get("hoje");
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function dataLocal(iso) { var p = iso.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function n1(v) { return v.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }); }
  function grau(v) { return n1(v) + " °C"; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function curto(e) { return e.nome.split(",")[0]; }
  function lista(xs) { return xs.length > 1 ? xs.slice(0, -1).join(", ") + " e " + xs[xs.length - 1] : (xs[0] || ""); }
  function corNota(n) {
    var v = Math.round(n);
    if (v >= 90) return "background:#0B4A3E;color:#fff";
    if (v >= 80) return "background:#2F7767;color:#fff";
    if (v >= 70) return "background:#7BA698;color:#14261F";
    if (v >= 60) return "background:#A9C4BA;color:#14261F";
    if (v >= 50) return "background:#C9D8D1;color:#14261F";
    return "background:#E3EAE6;color:#14261F";
  }
  function ehAlvo(e) { return estado.cfg.alvos.indexOf(e.id) >= 0; }
  function alvos() { var l = M.ESPECIES.filter(ehAlvo); return l.length ? l : M.ESPECIES; }
  function especie(id) { return M.ESPECIES.filter(function (e) { return e.id === id; })[0]; }

  // ---------- resumo de um dia: notas, medida do dia e medida por espécie
  function resumir(dia) {
    var esp = alvos(), cfg = estado.cfg.motor;
    var fds = [0, 6].indexOf(dataLocal(dia.data).getDay()) >= 0, desc = fds ? cfg.descontoFds : 0;
    var notas = {}, ver = {};
    M.ESPECIES.forEach(function (e) {
      notas[e.id] = dia.periodos.map(function (p) { return M.notaEspecie(p, e, cfg).nota; });
      ver[e.id] = M.veredito(contadas(notas[e.id]), cfg, desc);
    });
    var medias = dia.periodos.map(function (p, k) { return esp.reduce(function (s, e) { return s + notas[e.id][k]; }, 0) / esp.length; });
    var melhor = melhorDe(medias);
    return { notas: notas, ver: ver, medias: medias, melhor: melhor, fds: fds, desc: desc,
      notaDia: Math.max(0, medias[melhor] - desc), medida: M.veredito(contadas(medias), cfg, desc) };
  }
  function recalcular() {
    estado.res = {};
    estado.prox.forEach(function (d) { estado.res[d.data] = resumir(d); });
  }
  function diaSel() { return estado.prox.filter(function (d) { return d.data === estado.dia; })[0] || estado.prox[0]; }
  function melhorHorarioEsp(r, id) { return melhorDe(r.notas[id]); }
  function notaEsp(r, id) { return r.notas[id][melhorDe(r.notas[id])]; }
  /* Iscas que combinam com o dia: escolhidas pela faixa de profundidade sugerida e por o dia estar difícil para a espécie. */
  function iscasDia(e, d, r, k) {
    var tab = DIC[e.id].porDia, o = M.profundidade(d.periodos[k], e, DIC[e.id].zona, estado.cfg.motor);
    var dificil = r.ver[e.id] === "fraco" || d.tendencia < 0.6;
    return (dificil && tab.dificil) || tab[o.faixa] || tab.padrao;
  }

  // ---------- posição e dados
  function obterPosicao() {
    return new Promise(function (resolver) {
      var padrao = { lat: PADRAO.lat, lon: PADRAO.lon, origem: "padrao" };
      if (params.get("semgps") || !navigator.geolocation) return resolver(padrao);
      var feito = false;
      var relogio = setTimeout(function () { if (!feito) { feito = true; resolver(padrao); } }, 9000);
      navigator.geolocation.getCurrentPosition(function (p) {
        if (feito) return; feito = true; clearTimeout(relogio);
        resolver({ lat: +p.coords.latitude.toFixed(3), lon: +p.coords.longitude.toFixed(3), origem: "gps" });
      }, function () {
        if (feito) return; feito = true; clearTimeout(relogio); resolver(padrao);
      }, { timeout: 8000, maximumAge: 600000 });
    });
  }
  function urlDados(pos) {
    var teste = params.get("dados"); // só para testes: arquivo de dados na mesma pasta do aplicativo
    if (teste && /^[\w.\/-]+$/.test(teste) && teste.indexOf("//") < 0) return teste;
    return "https://api.open-meteo.com/v1/forecast?latitude=" + pos.lat + "&longitude=" + pos.lon +
      "&hourly=" + VARIAVEIS + "&past_days=45&forecast_days=16&timezone=auto";
  }
  function carregar(pos) {
    var guardado = ler("pesca.dados");
    var perto = guardado && Math.abs(guardado.lat - pos.lat) < 0.05 && Math.abs(guardado.lon - pos.lon) < 0.05;
    var recente = perto && (Date.now() - guardado.quando) < 2 * 3600 * 1000;
    if (recente && !params.get("dados")) return Promise.resolve({ horario: guardado.horario, quando: guardado.quando, antigo: false });
    return fetch(urlDados(pos)).then(function (r) {
      if (!r.ok) throw new Error("resposta " + r.status);
      return r.json();
    }).then(function (j) {
      gravar("pesca.dados", { lat: pos.lat, lon: pos.lon, quando: Date.now(), horario: j.hourly });
      return { horario: j.hourly, quando: Date.now(), antigo: false };
    }).catch(function (erro) {
      if (perto) return { horario: guardado.horario, quando: guardado.quando, antigo: true };
      throw erro;
    });
  }
  function iniciar() {
    obterPosicao().then(function (pos) { estado.posicao = pos; return carregar(pos); }).then(function (r) {
      estado.dias = M.calcular(r.horario);
      estado.dias.forEach(function (d) {
        d.periodos = d.periodos.filter(function (_, k) { return OCULTOS.indexOf(k) < 0; });
        d.chuvaPesca = d.periodos.reduce(function (s, p) { return s + p.chuva; }, 0);
      });
      var hoje = hojeISO();
      estado.prox = estado.dias.filter(function (d) { return d.data >= hoje; }).slice(0, 16);
      estado.baixadoEm = r.quando;
      estado.aviso = r.antigo ? "Sem conexão. Mostrando a previsão guardada em " + quando(r.quando) + "." : "";
      recalcular();
      if (!estado.prox.length) throw new Error("sem dias");
      estado.dia = estado.prox[0].data; estado.per = null;
      desenhar();
    }).catch(function (erro) {
      if (window.console) console.error(erro);
      app.innerHTML = cabecalho("") + '<main class="pagina"><p class="aviso">Não foi possível buscar a previsão do tempo. Confira a conexão com a internet e toque em Tentar de novo.</p>' +
        '<p><button class="conta" data-a="recarregar">Tentar de novo</button></p></main>';
    });
  }
  function quando(ms) { return new Date(ms).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }); }

  // ---------- peças das telas
  function cabecalho(aba) {
    var p = estado.posicao, onde = !p ? "" : (p.origem === "gps" ? "Posição do aparelho (" + p.lat.toFixed(2).replace(".", ",") + " / " + p.lon.toFixed(2).replace(".", ",") + ")" : PADRAO.nome + " (posição padrão)");
    return '<header class="topo"><div class="dentro"><div class="marca">' + BOIA + '<h1>Dia de Pesca</h1></div>' +
      (p ? '<div class="local"><span>' + esc(onde) + '</span><button data-a="pos">Atualizar posição</button></div>' : '') +
      '<nav class="abas" aria-label="Telas"><button data-a="nav" data-v="dias"' + (aba === "dias" ? ' aria-current="page"' : '') + '>Dias</button>' +
      '<button data-a="nav" data-v="especies"' + (aba === "especies" ? ' aria-current="page"' : '') + '>Espécies</button></nav></div></header>';
  }
  function avisos() {
    var h = estado.aviso ? '<p class="aviso">' + esc(estado.aviso) + '</p>' : '';
    if (estado.posicao.origem !== "gps" && !params.get("semgps")) h += '<p class="aviso">Não consegui ler a posição do aparelho. Usando ' + PADRAO.nome + '. Libere a localização para este site e toque em Atualizar posição.</p>';
    return h;
  }
  function tituloDia(d) { var dt = dataLocal(d.data); return SEM[dt.getDay()] + ", " + dt.getDate() + " de " + MESES[dt.getMonth()] + (d.data === hojeISO() ? " (hoje)" : ""); }
  /* gráfico de barras dos 16 dias. valor(d, r) -> nota; medida(d, r) -> "bom" | "medio" | "fraco" */
  function grafico(valor, medida) {
    return '<div class="grafico" role="group" aria-label="Notas dos próximos dias">' + estado.prox.map(function (d, i) {
      var r = estado.res[d.data], v = valor(d, r), m = medida(d, r), dt = dataLocal(d.data);
      var alt = Math.max(6, Math.min(100, (v - 50) / 50 * 100));
      return '<button data-a="dia" data-v="' + esc(d.data) + '" class="' + m + (i >= 7 ? " longe" : "") + (r.fds ? " fds" : "") + '" aria-pressed="' + (d.data === estado.dia) + '" aria-label="' + SEM[dt.getDay()] + " " + dt.getDate() + ", nota " + Math.round(v) + ", " + MEDIDA[m] + '">' +
        '<span class="v">' + Math.round(v) + '</span><span class="b" style="height:' + alt.toFixed(0) + '%"></span><span class="s"><i class="l1">' + SEM1[dt.getDay()] + '</i><i class="l3">' + SEM3[dt.getDay()] + '</i></span><span class="n">' + dt.getDate() + '</span></button>';
    }).join("") + '</div><div class="legenda"><span><i class="otimo"></i>' + MEDIDA.otimo + '</span><span><i></i>' + MEDIDA.bom + '</span><span><i class="medio"></i>' + MEDIDA.medio + '</span><span><i class="fraco"></i>' + MEDIDA.fraco + '</span><span>Barras claras: previsão distante, pode mudar.</span></div>';
  }
  function horarios(d, notas, melhor, per) {
    return '<div class="horarios" role="group" aria-label="Horário">' + d.periodos.map(function (p, k) {
      return '<button data-a="per" data-v="' + k + '" aria-pressed="' + (k === per) + '"' + (k === melhor ? ' class="melhor"' : (conta(k) ? '' : ' class="fora"')) + ' aria-label="' + p.nome + ", " + p.faixa + ", nota " + Math.round(notas[k]) + (conta(k) ? "" : ", não conta na nota do dia") + '"><span class="h">' + p.faixa.replace("h a ", " a ") + '</span><span class="q">' + Math.round(notas[k]) + '</span></button>';
    }).join("") + '</div>';
  }
  function dicaGeral(d, p) {
    var cfg = estado.cfg.motor, tc = p.tCima + cfg.ajusteCima, tf = p.tFundo + cfg.ajusteFundo, t = [];
    if (d.emCamadas) t.push("Lago em camadas: neste horário a água de cima está " + n1(tc - tf) + "\u00a0°C mais quente que a do fundo. Espécies de água quente tendem a ficar da meia-água para cima, mais ainda à tarde.");
    else if (tc - tf >= 1) t.push("Lago misturado na média do dia, mas neste horário o sol deixa a água de cima " + n1(tc - tf) + "\u00a0°C mais quente. Espécies de água quente tendem a subir.");
    else t.push("Lago misturado: temperatura parecida de cima a baixo. A profundidade depende mais do hábito de cada espécie.");
    if (p.fatorFundo < 1) t.push("Camadas há " + d.diasCamadas + " dias com calor: o fundo da parte mais funda deve ter pouco oxigênio. Evite o fundo ali.");
    if (d.tendencia < 0.6) t.push("Água esfriando nos últimos dias: peixe mais lento e mais fundo, isca parada.");
    if (d.riscoO2 >= 0.3) t.push("No começo do dia pode faltar oxigênio: peixe na superfície sem comer é sinal disso.");
    return t.join(" ");
  }
  function colunaAgua(d, r, per) {
    var p = d.periodos[per], cfg = estado.cfg.motor, grupos = { raso: [], sup: [], meia: [], fundo: [] };
    alvos().forEach(function (e) {
      var o = M.profundidade(p, e, DIC[e.id].zona, cfg);
      grupos[o.faixa].push('<button class="peixe" data-a="esp" data-v="' + e.id + '">' + esc(curto(e)) + '<b style="' + corNota(r.notas[e.id][per]) + '">' + Math.round(r.notas[e.id][per]) + '</b></button>');
    });
    function faixa(classe, rot, sub, temp, chave) {
      return '<div class="f ' + classe + '"><span class="rot">' + rot + '<small>' + sub + '</small></span><div class="peixes">' + grupos[chave].join("") + '</div><span class="t">' + temp + '</span></div>';
    }
    return '<div class="agua">' +
      (grupos.raso.length ? faixa("raso", "Margens", "raso, estruturas", "", "raso") : "") +
      faixa("sup", "Superfície", "até 0,5 m", grau(p.tCima + cfg.ajusteCima), "sup") +
      faixa("meia", "Meia-água", "de 1 a 2 m", "", "meia") +
      faixa("fundo" + (p.fatorFundo < 1 ? " ruim" : ""), "Fundo", p.fatorFundo < 1 ? "pouco oxigênio no fundão" : "até 4 m", grau(p.tFundo + cfg.ajusteFundo), "fundo") +
      '</div><p class="dica-geral">' + esc(dicaGeral(d, p)) + '</p>';
  }
  function listaEspecies(d, r, per) {
    var p = d.periodos[per], cfg = estado.cfg.motor;
    var ordem = M.ESPECIES.slice().sort(function (a, b) { return (ehAlvo(b) - ehAlvo(a)) || (r.notas[b.id][per] - r.notas[a.id][per]); });
    return ordem.map(function (e) {
      var n = r.notas[e.id][per], o = M.profundidade(p, e, DIC[e.id].zona, cfg);
      return '<div class="esp"><button class="marca-alvo" data-a="alvo" data-v="' + e.id + '" aria-pressed="' + ehAlvo(e) + '" aria-label="' + esc(e.nome) + ': contar na nota do dia">✓</button>' +
        '<button class="abre" data-a="esp" data-v="' + e.id + '"><span class="nome">' + esc(e.nome) + '</span><span class="selo ' + r.ver[e.id] + '">' + SELO[r.ver[e.id]] + '</span>' +
        '<br><span class="onde">Onde: ' + FAIXA[o.faixa] + '. Melhor horário: ' + d.periodos[melhorHorarioEsp(r, e.id)].nome.toLowerCase() + '</span>' +
        '<br><span class="onde">Isca: ' + esc(iscasDia(e, d, r, per).slice(0, 2).join(", ")) + '</span>' +
        '<span class="barra"><i style="width:' + Math.max(4, Math.min(100, n)).toFixed(0) + '%;' + corNota(n).split(";")[0] + '"></i></span></button>' +
        '<span class="q">' + Math.round(n) + '</span></div>';
    }).join("");
  }
  /* Explicação da nota do dia: quanto cada componente rendeu no melhor horário, na média das espécies marcadas. */
  function porque(d, r) {
    var cfg = estado.cfg.motor, w = cfg.pesos, p = d.periodos[r.melhor], esp = alvos(), n = esp.length, L = cfg.limites;
    var tc = p.tCima + cfg.ajusteCima, tf = p.tFundo + cfg.ajusteFundo, ft = 0, luz = 0, dentro = [], abaixo = [], acima = [];
    esp.forEach(function (e) {
      ft += M.notaEspecie(p, e, cfg).termica; luz += p.luz[e.grupo];
      var t = M.fTermica(tc, e) >= M.fTermica(tf, e) ? tc : tf, nome = curto(e).toLowerCase();
      if (t < e.c1) abaixo.push(nome + " (conforto a partir de " + e.c1 + "\u00a0°C)"); else if (t > e.c2) acima.push(nome + " (conforto até " + e.c2 + "\u00a0°C)"); else dentro.push(nome);
    });
    var regime = { frio: "Com água fria, as espécies de dia pontuam mais do meio do dia para a tarde.", ameno: "Com água amena, as espécies de dia pontuam bem da manhã à tarde e menos no amanhecer.", quente: "Com calor, as espécies de dia pontuam mais cedo e menos nas horas de sol forte." }[d.regime];
    var virada = [];
    if (Math.abs(p.dp24) >= 1) virada.push("A pressão " + (p.dp24 < 0 ? "caiu " : "subiu ") + n1(Math.abs(p.dp24)) + " hPa em relação a ontem. " + (p.dp24 < 0 ? "Queda dá pontos, por indicar mudança de tempo chegando." : "Alta tira pontos, por ser típica de depois da frente."));
    else virada.push("Pressão parada em relação a ontem.");
    if (p.sRefresco) virada.push("Chuva refrescando um dia quente dá pontos.");
    if (p.sFechou) virada.push("Céu fechando depois de sol dá pontos.");
    if (!p.sRefresco && !p.sFechou) virada.push("Sem chuva refrescando nem céu fechando neste horário. Tempo parado vale metade dos pontos.");
    var partes = [
      { nome: "Temperatura da água", max: w.temperatura, v: w.temperatura * ft / n,
        texto: "Neste horário a água está em " + grau(tc) + " em cima e " + grau(tf) + " no fundo. " + (dentro.length ? "No conforto: " + lista(dentro) + ". " : "") +
          (abaixo.length ? "Fria para: " + lista(abaixo) + ". " : "") + (acima.length ? "Quente para: " + lista(acima) + ". " : "") + "Cada espécie pontua pela camada que mais lhe serve." + (p.fatorFundo < 1 ? " O fundo perde pontos por pouco oxigênio." : "") },
      { nome: "Tendência da temperatura", max: w.tendencia, v: w.tendencia * p.tendencia,
        texto: (d.quedaAr < 0.5 && d.quedaAgua < 0.3) ? "Sem queda de temperatura nos últimos dias." :
          "O ar ficou " + grau(d.quedaAr) + " mais frio em um ou dois dias e a água de cima " + (d.quedaAgua < 0.3 ? "se manteve" : "perdeu " + grau(d.quedaAgua) + " em três dias") + ". Queda forte faz o peixe parar de comer. Os pontos zeram com 5\u00a0°C de queda no ar ou 3\u00a0°C na água." },
      { nome: "Oxigênio", max: w.oxigenio, v: w.oxigenio * p.oxigenio,
        texto: d.riscoO2 < 0.1 ? "Sem sinal de falta de oxigênio." : "Risco de pouco oxigênio estimado em " + Math.round(d.riscoO2 * 100) + "%, por água quente, dias nublados seguidos, falta de vento ou chuva forte. Pesa mais no amanhecer e menos à tarde." },
      { nome: "Luz e horário", max: w.luz, v: w.luz * luz / n,
        texto: "Pontos do horário (" + p.nome.toLowerCase() + ") para as espécies marcadas. " + regime + " Peixes de couro e predadores pontuam mais com pouca luz." + (p.nuvens >= 70 ? " O céu nublado deste horário dá um bônus a eles." : "") },
      { nome: "Virada do tempo", max: w.virada, v: w.virada * p.virada, texto: virada.join(" ") }
    ];
    // arredonda as partes de modo que a soma mostrada bata com a nota
    var alvoSoma = Math.round(r.medias[r.melhor]), base = partes.map(function (x) { return Math.floor(x.v); }), falta = alvoSoma - base.reduce(function (a, b) { return a + b; }, 0);
    partes.map(function (x, i) { return [x.v - Math.floor(x.v), i]; }).sort(function (a, b) { return b[0] - a[0]; }).forEach(function (f) { if (falta > 0 && base[f[1]] < partes[f[1]].max) { base[f[1]]++; falta--; } });
    partes.forEach(function (x, i) { x.pts = base[i]; });
    var pior = partes.slice().sort(function (a, b) { return (b.max - b.v) - (a.max - a.v); })[0];
    var h = '<p class="sub" style="margin:10px 0 8px">Conta feita no melhor horário (' + p.nome.toLowerCase() + ', das ' + p.faixa + '), na média das ' + n + ' espécies marcadas. A nota vai de 0 a 100 e soma cinco partes.</p>' +
      partes.map(function (x) {
        return '<div class="parte"><div class="pl"><b>' + x.nome + '</b><span>' + x.pts + ' de ' + x.max + '</span></div><div class="pb"><i style="width:' + Math.max(2, x.v / x.max * 100).toFixed(0) + '%"></i></div><p>' + esc(x.texto) + '</p></div>';
      }).join("");
    var itens = ["Soma das cinco partes: " + Math.round(r.medias[r.melhor]) + "." + (r.fds ? " Fim de semana: menos " + cfg.descontoFds + " pontos pelo pesqueiro mais cheio. Nota do dia: " + Math.round(r.notaDia) + "." : " Sem desconto de fim de semana.")];
    if (pior.max - pior.v >= 2) itens.push("O que mais tirou pontos: " + pior.nome.toLowerCase() + ", com " + (pior.max - pior.pts) + " a menos que o máximo.");
    itens.push("Nota de cada horário: " + d.periodos.map(function (q, k) { return q.faixa + " " + Math.round(r.medias[k]); }).join(", ") + ".");
    itens.push("Medida: \"" + MEDIDA[r.medida] + "\". \"" + MEDIDA.bom + "\" pede pelo menos " + L.horariosBons + " horários com " + L.bom + " ou mais. \"" + MEDIDA.otimo + "\" pede, além disso, nota do dia de " + L.muitoBom + " ou mais. \"" + MEDIDA.fraco + "\" é quando nenhum horário chega a " + L.fraco + ".");
    itens.push("A nota considera os horários das 5h às 17h. Chuva e vento não entram na nota do peixe.");
    return h + '<ul class="porque">' + itens.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + '</ul>';
  }
  function tabelaTempo(d, per) {
    var cfg = estado.cfg.motor;
    function linha(rot, f, cls) { return "<tr><th>" + rot + "</th>" + d.periodos.map(function (p, k) { var c = [k === per ? "sel" : "", cls ? cls(p) : ""].join(" ").trim(); return "<td" + (c ? ' class="' + c + '"' : "") + ">" + f(p) + "</td>"; }).join("") + "</tr>"; }
    return '<div class="rolagem"><table><thead><tr><th></th>' + d.periodos.map(function (p, k) { return "<th" + (k === per ? ' class="sel"' : "") + ">" + p.faixa.replace(" a ", "<br>a ") + "</th>"; }).join("") + '</tr></thead><tbody>' +
      linha("Ar (°C)", function (p) { return Math.round(p.tempAr); }) +
      linha("Chuva (mm)", function (p) { return p.chuva > 0.05 ? n1(p.chuva) : "0"; }, function (p) { return p.chuva > 0.3 ? "chuva" : ""; }) +
      linha("Vento (km/h)", function (p) { return Math.round(p.vento); }) +
      linha("Rajada (km/h)", function (p) { return Math.round(p.rajada); }) +
      linha("Nuvens (%)", function (p) { return Math.round(p.nuvens); }) +
      linha("Água em cima (°C)", function (p) { return n1(p.tCima + cfg.ajusteCima); }) +
      '</tbody></table></div><p class="sub" style="margin:8px 0 0">Chuva e vento não entram na nota do peixe. Servem para você decidir se vale ir.</p>';
  }
  function ceu(p) {
    if (p.chuva > 3) return ["🌧", "chuva"]; if (p.chuva > 0.3) return ["🌦", "chuva fraca"];
    if (p.nuvens >= 80) return ["☁", "nublado"]; if (p.nuvens >= 40) return ["⛅", "sol e nuvens"]; return ["☀", "sol"];
  }
  function previsao(d) {
    var raj = Math.max.apply(null, d.periodos.map(function (p) { return p.rajada; }));
    return '<section class="cartao"><h2>Previsão do tempo</h2><p class="sub">Mínima de ' + Math.round(d.tmin) + '\u00a0°C e máxima de ' + Math.round(d.tmax) + '\u00a0°C. Chuva das 5h às 17h: ' +
      (d.chuvaPesca >= 0.5 ? Math.round(d.chuvaPesca) + " mm" : "sem chuva") + '. Rajadas de até ' + Math.round(raj) + ' km/h.</p><div class="tempo">' +
      d.periodos.map(function (p, k) {
        var c = ceu(p);
        return '<div' + (conta(k) ? '' : ' class="fora"') + '><span class="h">' + p.faixa.replace("h a ", " a ") + '</span><span class="c" role="img" aria-label="' + c[1] + '">' + c[0] + '</span><span class="g">' + Math.round(p.tempAr) + '°</span>' +
          '<span class="ch' + (p.chuva > 0.3 ? " chuva" : "") + '">' + (p.chuva > 0.05 ? n1(p.chuva) + " mm" : "0 mm") + '</span><span class="v">' + Math.round(p.vento) + ' km/h</span><span class="d">' + c[1] + '</span></div>';
      }).join("") + '</div></section>';
  }
  function rodape() {
    return '<p class="rodape">Temperatura da água estimada pelo tempo, ainda sem calibração. Notas, medida do dia e profundidade são calculadas por regras provisórias do projeto. Dicas de isca e montagem vêm de prática de pescadores.<br>' +
      'Previsão do tempo: <a href="https://open-meteo.com/">Open-Meteo</a>, licença CC BY 4.0. Atualizada em ' + (estado.baixadoEm ? quando(estado.baixadoEm) : "") + '.</p>';
  }

  /* Estratégia do dia: frases montadas a partir das notas, da profundidade sugerida e do tempo previsto. */
  function estrategia(d, r) {
    var cfg = estado.cfg.motor, t = [], P = d.periodos, melhor = r.melhor, topo = r.medias[melhor];
    function hora(k, fim) { return P[k].faixa.split(" a ")[fim ? 1 : 0]; }
    // 1. janela: horários seguidos com nota perto da melhor
    var a = melhor, b = melhor;
    while (a > 0 && conta(a - 1) && r.medias[a - 1] >= topo - 4) a--;
    while (b < P.length - 1 && conta(b + 1) && r.medias[b + 1] >= topo - 4) b++;
    if (a === 0 && (b === P.length - 1 || !conta(b + 1))) t.push("Horário: o dia inteiro está parecido. Sem pressa para chegar.");
    else t.push("Horário: concentre a pescaria das " + hora(a) + " às " + hora(b, true) + (r.medias[0] < topo - 8 && a > 0 ? ". A manhã cedo é o ponto fraco, não precisa madrugar." : "."));
    // 2. espécies
    var esc2 = alvos(), bons = esc2.filter(function (e) { return r.ver[e.id] === "bom" || r.ver[e.id] === "otimo"; })
      .sort(function (x, y) { return notaEsp(r, y.id) - notaEsp(r, x.id); });
    var fracos = esc2.filter(function (e) { return r.ver[e.id] === "fraco"; });
    if (bons.length) t.push("Espécies: mire em " + lista(bons.slice(0, 4).map(curto)).toLowerCase() + "." + (fracos.length ? " Deixe para outro dia: " + lista(fracos.map(curto)).toLowerCase() + "." : ""));
    else {
      var resto = M.ESPECIES.slice().sort(function (x, y) { return notaEsp(r, y.id) - notaEsp(r, x.id); }).slice(0, 3);
      t.push("Espécies: nenhuma das marcadas está em dia bom. Se for mesmo assim, as de nota mais alta são " + lista(resto.map(curto)).toLowerCase() + ".");
    }
    // 3. onde e como, por faixa de profundidade
    var base = (bons.length ? bons : esc2).slice(0, 6), grupos = { sup: [], meia: [], fundo: [], raso: [] };
    base.forEach(function (e) {
      var f = M.profundidade(P[melhor], e, DIC[e.id].zona, cfg).faixa;
      if (f === "sup" && d.tendencia < 0.6) f = "meia"; // água esfriando: o peixe não sobe
      grupos[f].push(curto(e).toLowerCase());
    });
    var partes = [];
    if (grupos.sup.length) partes.push(lista(grupos.sup) + " na superfície, com boia e isca flutuante (ração ou pão)");
    if (grupos.meia.length) partes.push(lista(grupos.meia) + " na meia-água, com boia regulada ou chicote mais curto");
    if (grupos.fundo.length) partes.push(lista(grupos.fundo) + " no fundo, com isca de cheiro e parada");
    if (grupos.raso.length) partes.push(lista(grupos.raso) + " nas margens, rente à vegetação e à sombra");
    t.push("Onde e como: " + partes.join("; ") + ". Sem ação em meia hora, mude a altura da isca antes de mudar de lugar.");
    // 4. tempo
    var refresco = P.filter(function (q, k) { return conta(k) && q.sRefresco; })[0], fechou = P.filter(function (q, k) { return conta(k) && q.sFechou && !q.sRefresco; })[0];
    if (refresco) t.push("Virada do tempo: chuva prevista em dia quente (" + refresco.nome.toLowerCase() + "). Vale ficar para depois da chuva, quando os peixes costumam se ativar.");
    else if (fechou) t.push("Virada do tempo: o céu fecha depois de sol (" + fechou.nome.toLowerCase() + "). Bom momento para peixes de couro.");
    if (d.tendencia < 0.6) t.push("Água esfriando nos últimos dias: peixe lento. Isca parada, no fundo ou na meia-água, e mais paciência entre os arremessos.");
    if (d.riscoO2 >= 0.3) t.push("Evite o amanhecer: risco de pouco oxigênio. O peixe volta a comer conforme o sol sobe.");
    var janela = P.slice(a, b + 1);
    if (janela.some(function (q) { return q.rajada >= 45 || q.vento > 25; })) t.push("Vento forte na melhor janela: evite boia cevadeira, que corre e enrosca na linha do vizinho.");
    var chuvosa = P.filter(function (q, k) { return conta(k) && q.chuva > 10; })[0];
    if (chuvosa) t.push("Chuva forte prevista (" + chuvosa.nome.toLowerCase() + ", " + Math.round(chuvosa.chuva) + " mm): leve capa e escolha um ponto com cobertura.");
    var top3 = (bons.length ? bons : esc2).slice(0, 3).map(function (e) { return curto(e).toLowerCase() + ": " + iscasDia(e, d, r, melhor).slice(0, 2).join(" ou "); });
    t.push("Iscas para começar: " + top3.join("; ") + ".");
    if (r.fds) t.push("Fim de semana: lago mais cheio e peixe mais arisco. A nota já desconta " + cfg.descontoFds + " pontos.");
    return t;
  }

  // ---------- tela Dias
  function telaDias() {
    var d = diaSel(), r = estado.res[d.data], per = estado.per === null ? r.melhor : estado.per, p = d.periodos[per];
    var escolhidas = alvos();
    var bons = escolhidas.filter(function (e) { return r.ver[e.id] === "bom" || r.ver[e.id] === "otimo"; }).map(curto), fracos = escolhidas.filter(function (e) { return r.ver[e.id] === "fraco"; }).map(curto);
    var chuvaDia = d.chuvaPesca >= 1 ? " Chuva das 5h às 17h: " + Math.round(d.chuvaPesca) + " mm." : "";
    var h = cabecalho("dias") + '<main class="pagina">' + avisos() + '<div class="grade"><div class="col-a">' +
      '<section class="medida ' + r.medida + '"><div class="data">' + tituloDia(d) + '</div><div class="linha"><div class="palavra">' + MEDIDA[r.medida] + '</div><div class="num">' + Math.round(r.notaDia) + '<small>nota do dia</small></div></div>' +
      '<p>Melhor horário: <b>' + d.periodos[r.melhor].nome.toLowerCase() + ', das ' + d.periodos[r.melhor].faixa + '</b>.' + chuvaDia + '</p>' +
      (bons.length ? '<p>Bom para: <b>' + esc(lista(bons)) + '</b>.</p>' : '') + (fracos.length ? '<p>Fraco para: <b>' + esc(lista(fracos)) + '</b>.</p>' : '') + '</section>' +
      previsao(d) +
      '<section class="cartao"><h2>Próximos ' + estado.prox.length + ' dias</h2><p class="sub">Toque em um dia. A cor é a medida do dia para as espécies marcadas.</p>' +
      grafico(function (x, rr) { return rr.notaDia; }, function (x, rr) { return rr.medida; }) + '</section>' +
      '<section class="cartao estrategia"><h2>Estratégia para o dia</h2><p class="sub">Montada com a previsão e as notas deste dia.</p><ul class="porque" style="margin-top:0">' +
      estrategia(d, r).map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + '</ul></section></div>' +
      '<div class="col-b"><section class="cartao"><h2>Onde os peixes devem estar</h2><p class="sub">Escolha o horário. A estrela marca o melhor do dia.</p>' +
      horarios(d, r.medias, r.melhor, per) + colunaAgua(d, r, per) + '</section>' +
      '<section class="cartao"><h2>Nota por espécie, ' + p.nome.toLowerCase() + '</h2><p class="sub">O círculo marca as espécies que contam na nota do dia. Toque no nome para ver iscas e montagens.</p>' + listaEspecies(d, r, per) + '</section></div>' +
      '<div class="col-c"><details class="cartao"><summary>Estratégias que valem para qualquer dia</summary><ul class="porque">' + GERAIS.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") +
      '</ul><p class="sub" style="margin:8px 0 0">Resumo das pesquisas do projeto. Prática de pescadores e regras do modelo, ainda em conferência.</p></details>' +
      '<details class="cartao" open><summary>Por que essa nota</summary>' + porque(d, r) + '</details>' +
      '<details class="cartao"' + (window.innerWidth >= 900 ? " open" : "") + '><summary>Tempo para quem pesca</summary>' + tabelaTempo(d, per) + '</details></div></div>' + rodape() + '</main>';
    app.innerHTML = h;
  }

  // ---------- tela Espécies
  function barraTermica(e, p) {
    var cfg = estado.cfg.motor, a = e.z1 - 2, b = e.z2 + 2, pos = function (t) { return Math.max(0, Math.min(100, (t - a) / (b - a) * 100)); };
    var g = "linear-gradient(90deg,#E3EAE6 " + pos(e.z1) + "%,#0F5C4D " + pos(e.c1) + "%,#0F5C4D " + pos(e.c2) + "%,#E3EAE6 " + pos(e.z2) + "%)";
    var tc = p.tCima + cfg.ajusteCima, tf = p.tFundo + cfg.ajusteFundo, junto = Math.abs(tc - tf) < 1.2;
    return '<div class="termica" style="background:' + g + '">' +
      (junto ? '<span class="m" style="left:' + pos(tc) + '%">água ' + grau(tc) + '</span>' :
        '<span class="m esq" style="left:' + pos(tf) + '%">fundo ' + n1(tf) + '</span><span class="m dir" style="left:' + pos(tc) + '%">cima ' + n1(tc) + '</span>') +
      '<span class="e" style="left:' + pos(e.c1) + '%">' + e.c1 + '</span><span class="e" style="left:' + pos(e.c2) + '%">' + e.c2 + ' °C</span></div>';
  }
  function telaEspecie(e) {
    var d = diaSel(), r = estado.res[d.data], dic = DIC[e.id], cfg = estado.cfg.motor;
    var melhor = melhorHorarioEsp(r, e.id), per = estado.per === null ? melhor : estado.per, p = d.periodos[per];
    var o = M.profundidade(p, e, dic.zona, cfg), notaDia = Math.max(0, r.notas[e.id][melhor] - r.desc);
    function ul(xs) { return "<ul>" + xs.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>"; }
    var h = cabecalho("especies") + '<main class="pagina">' + avisos() +
      '<div class="troca" role="group" aria-label="Espécie">' + M.ESPECIES.map(function (x) { return '<button data-a="esp" data-v="' + x.id + '" aria-pressed="' + (x.id === e.id) + '">' + esc(curto(x)) + '</button>'; }).join("") + '</div>' +
      '<div class="grade"><div class="col-a"><section class="medida ' + r.ver[e.id] + '"><div class="data">' + esc(e.nome) + ', ' + tituloDia(d) + '</div>' +
      '<div class="linha"><div class="palavra">' + { otimo: "Dia muito bom", bom: "Dia bom", medio: "Dia médio", fraco: "Dia fraco" }[r.ver[e.id]] + '</div><div class="num">' + Math.round(notaDia) + '<small>nota do dia</small></div></div>' +
      '<p>Melhor horário: <b>' + d.periodos[melhor].nome.toLowerCase() + ', das ' + d.periodos[melhor].faixa + '</b>.</p>' +
      '<button class="conta" data-a="alvo" data-v="' + e.id + '" aria-pressed="' + ehAlvo(e) + '">' + (ehAlvo(e) ? "✓ Conta na nota do dia" : "Não conta na nota do dia. Tocar para contar") + '</button></section>' +
      '<section class="cartao"><h2>Próximos ' + estado.prox.length + ' dias para ' + esc(curto(e)).toLowerCase() + '</h2><p class="sub">Toque em um dia para ver os horários.</p>' +
      grafico(function (x, rr) { return Math.max(0, notaEsp(rr, e.id) - rr.desc); }, function (x, rr) { return rr.ver[e.id]; }) + '</section></div>' +
      '<div class="col-b"><section class="cartao"><h2>Horários e profundidade</h2><p class="sub">Nota da espécie em cada horário do dia escolhido.</p>' + horarios(d, r.notas[e.id], melhor, per) +
      '<p style="margin:0"><b style="font-weight:600">Onde procurar, ' + p.nome.toLowerCase() + ':</b> ' + esc(o.texto) + '</p>' +
      '<p style="margin:8px 0 0"><b style="font-weight:600">Iscas para este dia:</b> ' + esc(lista(iscasDia(e, d, r, per))) + '.</p>' +
      '<h3 style="margin-top:16px;font-size:1.1rem">Temperatura da água e faixa de conforto</h3>' + barraTermica(e, p) +
      '<p class="sub" style="margin:0">Verde escuro: faixa de conforto. A nota térmica zera em ' + e.z1 + ' °C e em ' + e.z2 + ' °C.' + (e.provisorio ? " Faixa provisória, com pouca fonte." : "") + '</p></section>' +
      '<section class="cartao ficha"><h2>Como pescar</h2><p>' + esc(dic.habito) + '</p>' +
      '<h3>Iscas</h3>' + ul(dic.iscas) + '<h3>Montagens</h3>' + ul(dic.montagens) + '<h3>Linha e anzol</h3><p>' + esc(dic.linha) + '</p><h3>Dicas</h3>' + ul(dic.dicas) +
      '<p class="sub" style="margin:14px 0 0">' + (dic.fonte === "pouca" ? "Pouca fonte específica de pesqueiro para esta espécie. " : "") + 'Prática de pescadores e de sites de pesca, sem medição. Confira sempre a regra do pesqueiro para anzol, isca e chicote. Fontes em pesquisa/03 do projeto.</p></section></div></div>' + rodape() + '</main>';
    app.innerHTML = h;
  }

  // ---------- navegação e toques
  function desenhar(manterRolagem) {
    var y = window.scrollY, m = location.hash.match(/^#especie-([a-z]+)$/), e = m && especie(m[1]);
    if (!estado.prox.length) return;
    if (e) { estado.esp = e.id; telaEspecie(e); } else telaDias();
    window.scrollTo(0, manterRolagem ? y : 0);
    var sel = app.querySelector('.troca [aria-pressed="true"]'); if (sel && sel.scrollIntoView) sel.scrollIntoView({ block: "nearest", inline: "center" });
  }
  window.addEventListener("hashchange", function () { estado.per = null; desenhar(); });
  app.addEventListener("click", function (ev) {
    var b = ev.target.closest("[data-a]"); if (!b) return;
    var a = b.dataset.a, v = b.dataset.v;
    if (a === "dia") { estado.dia = v; estado.per = null; desenhar(true); }
    else if (a === "per") { estado.per = +v; desenhar(true); }
    else if (a === "esp") { if (location.hash === "#especie-" + v) return; location.hash = "especie-" + v; }
    else if (a === "nav") { location.hash = v === "especies" ? "especie-" + (estado.esp || alvos()[0].id) : "dias"; }
    else if (a === "alvo") {
      var k = estado.cfg.alvos.indexOf(v); if (k >= 0) estado.cfg.alvos.splice(k, 1); else estado.cfg.alvos.push(v);
      salvarCfg(); recalcular(); desenhar(true);
    }
    else if (a === "pos") { gravar("pesca.dados", null); app.innerHTML = cabecalho("") + '<main class="pagina"><p class="carregando">Lendo a posição do aparelho.</p></main>'; iniciar(); }
    else if (a === "recarregar") location.reload();
  });

  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    navigator.serviceWorker.register("sw.js").catch(function () { /* sem modo offline */ });
  }
  iniciar();
})();
