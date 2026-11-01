/* Cache only public app shell. Learner data remains solely in localStorage. */
const CACHE='tutorforge-shell-v1';
const ASSETS=['./','./index.html','./app.mjs','./domain.mjs','./styles.css','./icons/icon.svg','./icons/icon-192.png','./icons/icon-512.png','./manifest.webmanifest'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('tutorforge-shell-')&&k!==CACHE).map(k=>caches.delete(k)))),self.clients.claim()])));
self.addEventListener('fetch',e=>{const req=e.request;if(req.method!=='GET')return;const u=new URL(req.url),scope=new URL(self.registration.scope);if(u.origin!==scope.origin||!u.pathname.startsWith(scope.pathname))return;e.respondWith(fetch(req).then(res=>{if(res.ok&&res.type==='basic'){const c=res.clone();e.waitUntil(caches.open(CACHE).then(cache=>cache.put(req,c)))}return res}).catch(()=>caches.match(req).then(cached=>cached||(req.mode==='navigate'?caches.match('./index.html'):Response.error()))))});
