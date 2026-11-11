/* Dia de Pesca: guarda os arquivos do aplicativo para abrir sem internet e confere os dias marcados
   com o aplicativo fechado, quando o celular permite (sincronização periódica do Chrome no Android). */
importScripts("motor.js");
var VERSAO = "dia-de-pesca-v9", DADOS = "pesca-dados";
var ARQUIVOS = ["./", "index.html", "app.js", "motor.js", "dicas.js", "manifest.webmanifest", "icone-192.png", "icone-512.png",
  "fontes/barlow-400.woff2", "fontes/barlow-600.woff2", "fontes/barlow-condensed-600.woff2", "fontes/barlow-condensed-700.woff2"];

self.addEventListener("install", function (ev) {
  ev.waitUntil(caches.open(VERSAO).then(function (c) { return c.addAll(ARQUIVOS); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (ev) {
  ev.waitUntil(caches.keys().then(function (nomes) {
    return Promise.all(nomes.filter(function (n) { return n !== VERSAO && n !== DADOS; }).map(function (n) { return caches.delete(n); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (ev) {
  var url = new URL(ev.request.url);
  if (ev.request.method !== "GET" || url.origin !== self.location.origin) return; // previsão do tempo e busca: direto na rede
  ev.respondWith(fetch(ev.request).then(function (resposta) {
    if (resposta.ok) { var copia = resposta.clone(); caches.open(VERSAO).then(function (c) { c.put(ev.request, copia); }); }
    return resposta;
  }).catch(function () {
    return caches.match(ev.request, { ignoreSearch: true }).then(function (r) { return r || caches.match("index.html"); });
  }));
});

/* Refaz a nota dos dias marcados e avisa se mudou 10 pontos ou mais desde a última vez que o aplicativo viu. */
function conferir() {
  return caches.open(DADOS).then(function (c) {
    return c.match("marcado.json").then(function (r) { return r ? r.json() : null; }).then(function (d) {
      if (!d || !d.marcados || !d.marcados.length) return;
      var url = "https://api.open-meteo.com/v1/forecast?latitude=" + d.lat + "&longitude=" + d.lon +
        "&hourly=temperature_2m,cloud_cover,shortwave_radiation,precipitation,wind_speed_10m,wind_gusts_10m,pressure_msl&past_days=45&forecast_days=16&timezone=auto";
      return fetch(url).then(function (r) { return r.json(); }).then(function (j) {
        var M = self.Motor, cfg = {}, k; for (k in M.CONFIG_PADRAO) cfg[k] = M.CONFIG_PADRAO[k];
        cfg.ajusteCima = d.ajusteCima || 0; cfg.ajusteFundo = d.ajusteFundo || 0;
        var dias = M.calcular(j.hourly), esp = M.ESPECIES.filter(function (e) { return (d.alvos || []).indexOf(e.id) >= 0; }), mudancas = [];
        if (!esp.length) esp = M.ESPECIES;
        d.marcados.forEach(function (m) {
          var dia = dias.filter(function (x) { return x.data === m.data; })[0]; if (!dia || !m.visto) return;
          var P = dia.periodos.filter(function (_, i) { return (d.ocultos || []).indexOf(i) < 0; });
          var medias = P.map(function (p) { return esp.reduce(function (s, e) { return s + M.notaEspecie(p, e, cfg).nota; }, 0) / esp.length; });
          var sem = new Date(m.data + "T12:00:00").getDay(), desc = (sem === 0 || sem === 6) ? cfg.descontoFds : 0;
          var nota = Math.round(Math.max(0, Math.max.apply(null, medias) - desc));
          if (Math.abs(nota - m.visto.nota) >= 10) { mudancas.push(m.data.split("-").reverse().slice(0, 2).join("/") + ": nota de " + m.visto.nota + " para " + nota); m.visto.nota = nota; }
        });
        if (!mudancas.length) return;
        return c.put("marcado.json", new Response(JSON.stringify(d), { headers: { "content-type": "application/json" } })).then(function () {
          return self.registration.showNotification("Dia de Pesca: mudança no dia marcado", { body: mudancas.join(". ") + ". Abra o aplicativo para ver o motivo.", icon: "icone-192.png", tag: "pesca-mudanca" });
        });
      });
    });
  }).catch(function () { /* sem rede ou sem dados: tenta de novo na próxima vez */ });
}
self.addEventListener("periodicsync", function (ev) { if (ev.tag === "conferir-pescaria") ev.waitUntil(conferir()); });
self.addEventListener("notificationclick", function (ev) { ev.notification.close(); ev.waitUntil(self.clients.openWindow("./")); });
