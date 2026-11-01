const V='kashf-v3',CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
 const r=e.request;if(r.method!=='GET')return;
 const u=new URL(r.url);
 if(u.origin===location.origin){
  // own files: network first (always the newest version when online), cached copy when offline or slow
  e.respondWith(caches.open(V).then(async c=>{
   const net=fetch(r,{cache:'no-cache'}).then(res=>{if(res&&res.ok)c.put(r,res.clone());return res});
   const slow=new Promise((_,rej)=>setTimeout(rej,5000));
   try{return await Promise.race([net,slow])}catch(err){
    const hit=await c.match(r,{ignoreSearch:true})||(r.mode==='navigate'?await c.match('./index.html'):null);
    return hit||net.catch(()=>Response.error());
   }
  }));
 }else if(u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com'){
  // fonts: cached on first online visit, then work offline
  e.respondWith(caches.open(V).then(async c=>{
   const hit=await c.match(r);if(hit)return hit;
   try{const res=await fetch(r);if(res&&(res.ok||res.type==='opaque'))c.put(r,res.clone());return res}catch(err){return Response.error()}
  }));
 }
});
