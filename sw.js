/* Dia de Pesca: guarda os arquivos do aplicativo para abrir sem internet.
   A previsão do tempo não passa por aqui: o app.js guarda a última resposta no aparelho. */
var VERSAO = "dia-de-pesca-v7";
var ARQUIVOS = ["./", "index.html", "app.js", "motor.js", "dicas.js", "manifest.webmanifest", "icone-192.png", "icone-512.png",
  "fontes/barlow-400.woff2", "fontes/barlow-600.woff2", "fontes/barlow-condensed-600.woff2", "fontes/barlow-condensed-700.woff2"];

self.addEventListener("install", function (ev) {
  ev.waitUntil(caches.open(VERSAO).then(function (c) { return c.addAll(ARQUIVOS); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (ev) {
  ev.waitUntil(caches.keys().then(function (nomes) {
    return Promise.all(nomes.filter(function (n) { return n !== VERSAO; }).map(function (n) { return caches.delete(n); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (ev) {
  var url = new URL(ev.request.url);
  if (ev.request.method !== "GET" || url.origin !== self.location.origin) return; // previsão do tempo: direto na rede
  // Rede primeiro, para pegar versões novas do aplicativo. Sem rede, usa a cópia guardada.
  ev.respondWith(fetch(ev.request).then(function (resposta) {
    if (resposta.ok) { var copia = resposta.clone(); caches.open(VERSAO).then(function (c) { c.put(ev.request, copia); }); }
    return resposta;
  }).catch(function () {
    return caches.match(ev.request, { ignoreSearch: true }).then(function (r) { return r || caches.match("index.html"); });
  }));
});
