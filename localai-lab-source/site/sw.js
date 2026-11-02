/* Offline shell only. No personally identifiable or model prompt data is cached. */
const CACHE='localai-lab-static-v1';
const FILES=['./','./index.html','./styles.css','./app.mjs','./engine.mjs','./catalog.mjs','./manifest.webmanifest','./icons/icon.svg','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('localai-lab-static-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 const req=e.request;if(req.method!=='GET')return;
 const u=new URL(req.url),scope=new URL(self.registration.scope);
 if(u.origin!==scope.origin||!u.pathname.startsWith(scope.pathname))return;
 e.respondWith(fetch(req).then(res=>{if(res.ok&&res.type==='basic'){const copy=res.clone();e.waitUntil(caches.open(CACHE).then(c=>c.put(req,copy)))}return res;}).catch(()=>caches.match(req).then(c=>c||(req.mode==='navigate'?caches.match('./index.html'):Response.error()))));
});
