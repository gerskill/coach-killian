/* Coach Killian – service worker : app shell en cache, Open Food Facts en réseau */
const CACHE = 'coach-killian-v14';
const SHELL = [
  './', './index.html', './style.css', './app.js', './design.js', './manifest.json',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png', './icons/apple-touch-icon.png',
  // lecteur de codes-barres pour iPhone (polyfill + wasm locaux, utilisables hors ligne)
  './vendor/barcode-detector/barcode-detector.ponyfill.js', './vendor/barcode-detector/zxing_reader.wasm',
  // photos des exercices des séances A et B (les autres se mettent en cache à la 1re ouverture)
  ...['Dumbbell_Bench_Press', 'Bent_Over_Barbell_Row', 'Split_Squat_with_Dumbbells', 'Standing_Military_Press', 'Dumbbell_Bicep_Curl',
    'Barbell_Deadlift', 'Dips_-_Chest_Version', 'Pullups', 'Barbell_Hip_Thrust', 'Lying_Triceps_Press']
    .flatMap(id => [`./exercises/${id}/0.jpg`, `./exercises/${id}/1.jpg`])
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  // on ne met en cache que les GET de l'appli elle-même : api.anthropic.com (POST) et Open Food Facts
  // passent toujours directement par le réseau, rien n'est stocké
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit => {
      const net = fetch(req).then(res => {
        if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
        return res;
      }).catch(() => hit || caches.match('./index.html'));
      return hit || net;
    })
  );
});
