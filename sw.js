const CACHE = 'cochamo-supervision-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './logo.jpeg',
  './icon.png'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('message', e => {
  if(e.data === 'skipWaiting') self.skipWaiting();
});
self.addEventListener('fetch', e => {
  const req = e.request;
  const isHTML = req.mode === 'navigate' || (req.headers.get('accept')||'').includes('text/html');
  if(isHTML){
    e.respondWith(
      fetch(req).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE).then(c => c.put('./index.html', copy)).catch(()=>{});
        return resp;
      }).catch(()=> caches.match('./index.html'))
    );
  } else {
    e.respondWith(
      caches.match(req).then(r => r || fetch(req).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE).then(c => { try{ c.put(req, copy); }catch(_){} });
        return resp;
      }).catch(()=>caches.match('./index.html')))
    );
  }
});
