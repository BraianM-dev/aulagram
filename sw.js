const CACHE='aulagram-static-v85';
const STATIC=[
  './','./index.html',
  './assets/css/styles.css?v=8.3.0','./assets/css/v83.css?v=8.3.0',
  './assets/js/config.js?v=8.5.0','./assets/js/bridge-v850.js?v=8.5.0',
  './assets/js/accessibility.js?v=8.3.0','./assets/js/seed-visuals.js?v=8.3.3',
  './assets/js/a11y-svg-fix.js?v=8.3.3','./assets/js/app.js?v=8.3.0',
  './assets/js/v83-enhancements.js?v=8.3.2','./assets/js/v85-performance.js?v=8.5.0'
];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(c=>Promise.allSettled(STATIC.map(u=>c.add(u)))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('aulagram-static-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  const req=event.request;if(req.method!=='GET')return;
  const url=new URL(req.url);if(url.origin!==self.location.origin)return;
  if(req.mode==='navigate'){
    event.respondWith(fetch(req).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put('./index.html',copy));return r}).catch(()=>caches.match('./index.html')));
    return;
  }
  event.respondWith(caches.match(req).then(hit=>{
    const net=fetch(req).then(r=>{if(r&&r.ok)caches.open(CACHE).then(c=>c.put(req,r.clone()));return r}).catch(()=>null);
    return hit||net;
  }));
});
