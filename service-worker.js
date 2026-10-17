const CACHE_NAME = 'mon-budget-42';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css'
];

self.addEventListener('install', e => {
  // cache: 'reload' : on met en cache la version du serveur, pas une copie périmée du cache HTTP
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll(ASSETS.map(url => new Request(url, { cache: 'reload' })))
    )
  );
  // Pas de skipWaiting ici : la nouvelle version attend que l'utilisateur clique sur « Mettre à jour ».
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.mode === 'navigate') {
    // La page vient du cache de la version active : une nouvelle version ne s'affiche
    // qu'une fois activée (clic sur « Mettre à jour »). Réseau en secours si le cache est vide.
    e.respondWith(
      caches.match('./index.html').then(cached => cached || fetch(e.request))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});

self.addEventListener('message', e => {
  if (e.data && e.data.action === 'skipWaiting') self.skipWaiting();
});
