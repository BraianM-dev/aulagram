(function(g){
'use strict';
if(g.AulaGramPerfV86)return;
const VERSION='8.6.0';
const networkRpcRead=g.rpcRead;
const networkRpc=g.rpc;
if(typeof networkRpcRead!=='function'||typeof networkRpc!=='function')return;
const cache=new Map();
const pending=new Map();
const MAX_CACHE=14;
const POLICIES={
  getBootstrap:{fresh:60000,stale:300000},
  getMyState:{fresh:30000,stale:120000},
  getHomeViewData:{fresh:45000,stale:300000},
  getExploreViewData:{fresh:180000,stale:600000},
  getProfileViewData:{fresh:180000,stale:600000},
  getActivityViewData:{fresh:30000,stale:120000},
  getMessagesViewData:{fresh:12000,stale:45000},
  getConversation:{fresh:5000,stale:20000},
  getProfileDesign:{fresh:300000,stale:900000}
};
function hashString(s){let h=2166136261>>>0;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(36)}
function keyFor(name,args){return name+':'+hashString(JSON.stringify(args||[]))}
function touch(key,entry){cache.delete(key);cache.set(key,entry);while(cache.size>MAX_CACHE)cache.delete(cache.keys().next().value)}
function clearMethods(methods){const list=Array.isArray(methods)?methods:[methods];for(const k of Array.from(cache.keys()))if(list.some(m=>k.startsWith(m+':')))cache.delete(k)}
function fetchOnce(name,args,key){if(pending.has(key))return pending.get(key);const p=networkRpcRead(name,...args).then(value=>{touch(key,{ts:Date.now(),value});return value}).finally(()=>pending.delete(key));pending.set(key,p);return p}
function refreshLater(name,args,key){if(pending.has(key)||document.visibilityState==='hidden')return;setTimeout(()=>fetchOnce(name,args,key).catch(()=>{}),0)}
g.rpcRead=async function(name,...args){const p=POLICIES[name];if(!p)return networkRpcRead(name,...args);const key=keyFor(name,args),entry=cache.get(key),now=Date.now();if(entry){touch(key,entry);const age=now-entry.ts;if(age<=p.fresh)return entry.value;if(age<=p.stale){refreshLater(name,args,key);return entry.value}}return fetchOnce(name,args,key)};
const INVALIDATION={
  toggleLike:['getHomeViewData','getProfileViewData','getActivityViewData'],
  addComment:['getHomeViewData','getProfileViewData','getActivityViewData'],
  toggleFollow:['getHomeViewData','getExploreViewData','getProfileViewData','getActivityViewData'],
  sendMessage:['getMessagesViewData','getConversation','getActivityViewData','getMyState'],
  publishProfile:['getBootstrap','getMyState','getHomeViewData','getExploreViewData','getProfileViewData'],
  recoverIdentity:['getBootstrap','getMyState'],
  adminUpdateSettings:['getBootstrap','getHomeViewData'],
  adminMuteUser:['getBootstrap','getHomeViewData','getExploreViewData','getProfileViewData'],
  adminDeleteProfile:['getHomeViewData','getExploreViewData','getProfileViewData'],
  adminDeleteComment:['getHomeViewData','getProfileViewData'],
  adminDeleteMessage:['getMessagesViewData','getConversation'],
  adminResetSocial:['getHomeViewData','getExploreViewData','getProfileViewData','getActivityViewData'],
  adminResetMessages:['getMessagesViewData','getConversation','getActivityViewData']
};
g.rpc=async function(name,...args){const r=await networkRpc(name,...args);if(INVALIDATION[name])clearMethods(INVALIDATION[name]);return r};
const MAX_ASSET_CACHE=12;
const assetQueue=[];
const queued=new Set();
let assetBusy=false;
function rememberAsset(key,value){if(!value)return;state.assets.delete(key);state.assets.set(key,value);while(state.assets.size>MAX_ASSET_CACHE)state.assets.delete(state.assets.keys().next().value)}
function applyAsset(key,value){document.querySelectorAll('img[data-asset="'+CSS.escape(key)+'"]').forEach(img=>{if(img.isConnected)img.src=value})}
async function flushAssets(){if(assetBusy||!assetQueue.length||!state.gate)return;assetBusy=true;const keys=assetQueue.splice(0,4);keys.forEach(k=>queued.delete(k));try{const map=await networkRpcRead('getAssetsData',keys,state.gate);Object.entries(map||{}).forEach(([k,v])=>{if(v){rememberAsset(k,v);applyAsset(k,v)}})}catch(e){}finally{assetBusy=false;if(assetQueue.length)setTimeout(flushAssets,80)}}
function queueAsset(img){const key=img&&img.dataset&&img.dataset.asset;if(!key)return;img.loading='lazy';img.decoding='async';if(state.assets.has(key)){img.src=state.assets.get(key);return}if(!queued.has(key)){queued.add(key);assetQueue.push(key)}if(!assetBusy)setTimeout(flushAssets,40)}
let io=null;if('IntersectionObserver'in g){io=new IntersectionObserver(entries=>entries.forEach(en=>{if(en.isIntersecting){io.unobserve(en.target);queueAsset(en.target)}}),{rootMargin:'220px 0px'})}
g.hydrateAssets=async function(root=document){root.querySelectorAll('img[data-asset]').forEach(img=>{const key=img.dataset.asset;if(!key)return;img.loading='lazy';img.decoding='async';if(state.assets.has(key)){img.src=state.assets.get(key);return}if(io)io.observe(img);else queueAsset(img)})};
g.doLike=function(id){if(!state.session)return toast('Primero publicá o recuperá tu perfil.');const article=document.getElementById(id),btn=article&&article.querySelector('.post-actions .icon-btn'),pill=article&&article.querySelector('.post-actions .pill');const was=btn&&btn.textContent.trim()==='♥',oldCount=pill?parseInt((pill.textContent.match(/\d+/)||['0'])[0],10):0;if(btn){btn.textContent=was?'♡':'♥';btn.setAttribute('aria-label',was?'Me gusta':'Quitar Me gusta')}if(pill)pill.textContent=Math.max(0,oldCount+(was?-1:1))+' Me gusta';rpc('toggleLike',id,state.gate,state.session).catch(e=>{if(btn)btn.textContent=was?'♥':'♡';if(pill)pill.textContent=oldCount+' Me gusta';toast(niceErr(e))})};
g.doComment=function(e,id){e.preventDefault();if(!state.session)return toast('Primero publicá o recuperá tu perfil.');const input=e.target.comment,text=(input&&input.value||'').trim();if(!text)return;input.value='';const article=document.getElementById(id),body=article&&article.querySelector('.post-body');let wrap=article&&article.querySelector('.comments');if(body&&!wrap){wrap=document.createElement('div');wrap.className='comments';body.insertBefore(wrap,body.querySelector('.comment-form')||null)}const temp=document.createElement('div');temp.className='comment ag86-pending';temp.innerHTML='<strong>@'+esc(localStorage.getItem('ag8_alias')||'vos')+'</strong> '+esc(text)+' <small>enviando…</small>';if(wrap)wrap.appendChild(temp);rpc('addComment',id,text,state.gate,state.session).then(r=>{if(!r.ok)throw new Error(r.reason||'Comentario rechazado');temp.classList.remove('ag86-pending');const s=temp.querySelector('small');if(s)s.remove()}).catch(err=>{temp.remove();input.value=text;toast(niceErr(err))})};
g.doFollow=function(alias){if(!state.session)return toast('Primero publicá o recuperá tu perfil.');const buttons=Array.from(document.querySelectorAll('button')).filter(b=>(b.getAttribute('onclick')||'').includes("doFollow('"+alias+"')"));const old=buttons.map(b=>({b,text:b.textContent,cls:b.className}));buttons.forEach(b=>{const f=/Siguiendo/i.test(b.textContent);b.textContent=f?'Seguir':'Siguiendo'});rpc('toggleFollow',alias,state.gate,state.session).catch(e=>{old.forEach(x=>{x.b.textContent=x.text;x.b.className=x.cls});toast(niceErr(e))})};
g.sendChat=function(e){e.preventDefault();const t=document.getElementById('chatText'),text=(t&&t.value||'').trim();if(!text)return;const thread=document.getElementById('thread'),bubble=document.createElement('div');bubble.className='bubble mine ag86-pending';bubble.innerHTML='<b>@'+esc(localStorage.getItem('ag8_alias')||'vos')+'</b><br>'+esc(text)+'<span class="time"> enviando…</span>';if(thread){thread.querySelector('.empty')?.remove();thread.appendChild(bubble);thread.scrollTop=thread.scrollHeight}t.value='';rpc('sendMessage',state.chatUser,text,state.gate,state.session).then(r=>{if(!r.ok)throw new Error(r.reason||'Mensaje rechazado');bubble.classList.remove('ag86-pending');const tm=bubble.querySelector('.time');if(tm)tm.textContent=' enviado'}).catch(err=>{bubble.remove();t.value=text;toast(niceErr(err))})};
g.searchExplore=function(e){e.preventDefault();const q=(document.getElementById('exploreQ')?.value||'').trim().toLowerCase();const cards=Array.from(document.querySelectorAll('.person-card'));if(cards.length){cards.forEach(c=>c.hidden=!!q&&!c.textContent.toLowerCase().includes(q));history.replaceState(null,'','#explore'+(q?'?q='+encodeURIComponent(q):''));return}location.hash='#explore'+(q?'?q='+encodeURIComponent(q):'')};
if('serviceWorker'in navigator){navigator.serviceWorker.getRegistrations().then(rs=>rs.forEach(r=>r.unregister())).catch(()=>{})}
if('caches'in g){caches.keys().then(keys=>keys.filter(k=>k.startsWith('aulagram-static-')).forEach(k=>caches.delete(k))).catch(()=>{})}
const style=document.createElement('style');style.textContent='.ag86-pending{opacity:.7}';document.head.appendChild(style);
g.AulaGramPerfV86=Object.freeze({version:VERSION,clearCache:()=>cache.clear(),cacheSize:()=>cache.size,assetCacheSize:()=>state.assets.size});
})(window);
