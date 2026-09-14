(function(g){
'use strict';
if(g.AulaGramPerfV84)return;
const VERSION='8.5.0';
const CACHE_PREFIX='ag85:data:';
const viewCache=new Map();
const pendingReads=new Map();
const networkRpcRead=g.rpcRead;
const networkRpc=g.rpc;
const oldLoading=g.loading;
const oldHydrate=g.hydrateAssets;

if(typeof networkRpcRead!=='function'||typeof networkRpc!=='function')return;

const POLICIES={
  getBootstrap:{fresh:60_000,stale:600_000},
  getMyState:{fresh:30_000,stale:300_000},
  getHomeViewData:{fresh:60_000,stale:600_000},
  getExploreViewData:{fresh:300_000,stale:900_000},
  getProfileViewData:{fresh:300_000,stale:900_000},
  getActivityViewData:{fresh:30_000,stale:300_000},
  getMessagesViewData:{fresh:20_000,stale:120_000},
  getConversation:{fresh:10_000,stale:60_000},
  getProfileDesign:{fresh:600_000,stale:3_600_000}
};

function hashString(s){let h=2166136261>>>0;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(36)}
function dataKey(name,args){return CACHE_PREFIX+name+':'+hashString(JSON.stringify(args||[]))}
function readEntry(key){
  try{const raw=sessionStorage.getItem(key);if(!raw)return null;const v=JSON.parse(raw);return v&&typeof v.ts==='number'?v:null}catch(e){return null}
}
function writeEntry(key,value){
  try{sessionStorage.setItem(key,JSON.stringify({ts:Date.now(),value:value}))}catch(e){
    clearAllDataCache();
    try{sessionStorage.setItem(key,JSON.stringify({ts:Date.now(),value:value}))}catch(_e){}
  }
}
function clearByMethods(methods){
  const list=Array.isArray(methods)?methods:[methods];
  try{for(let i=sessionStorage.length-1;i>=0;i--){const k=sessionStorage.key(i);if(k&&list.some(m=>k.startsWith(CACHE_PREFIX+m+':')))sessionStorage.removeItem(k)}}catch(e){}
}
function clearAllDataCache(){
  try{for(let i=sessionStorage.length-1;i>=0;i--){const k=sessionStorage.key(i);if(k&&k.startsWith(CACHE_PREFIX))sessionStorage.removeItem(k)}}catch(e){}
}
function fetchAndCache(name,args,key){
  if(pendingReads.has(key))return pendingReads.get(key);
  const p=networkRpcRead(name,...args).then(v=>{writeEntry(key,v);return v}).finally(()=>pendingReads.delete(key));
  pendingReads.set(key,p);return p;
}
function backgroundRefresh(name,args,key){
  if(pendingReads.has(key)||document.visibilityState==='hidden')return;
  fetchAndCache(name,args,key).then(()=>document.dispatchEvent(new CustomEvent('aulagram:fresh',{detail:{method:name}}))).catch(()=>{});
}

g.rpcRead=async function(name,...args){
  const policy=POLICIES[name];
  if(!policy)return networkRpcRead(name,...args);
  const key=dataKey(name,args),entry=readEntry(key),now=Date.now();
  if(entry){
    const age=now-entry.ts;
    if(age<=policy.stale){
      if(age>policy.fresh)backgroundRefresh(name,args,key);
      return entry.value;
    }
  }
  return fetchAndCache(name,args,key);
};

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

g.rpc=async function(name,...args){
  const result=await networkRpc(name,...args);
  if(INVALIDATION[name]){
    clearByMethods(INVALIDATION[name]);
    for(const k of Array.from(viewCache.keys())){
      if(name==='sendMessage'&&k.startsWith('messages'))viewCache.delete(k);
      else if(name==='toggleLike'&&k==='home')viewCache.delete(k);
      else if(name==='addComment'&&k==='home')viewCache.delete(k);
      else if(name==='toggleFollow'&&(k==='explore'||k.startsWith('profile/')))viewCache.delete(k);
      else if(name==='publishProfile')viewCache.delete(k);
    }
  }
  return result;
};

function routeKey(){try{return (g.route?g.route():(location.hash||'#home').slice(1))||'home'}catch(e){return 'home'}}
function snapshot(){const app=document.getElementById('app');if(app&&app.innerHTML)viewCache.set(routeKey(),app.innerHTML)}

if(typeof oldLoading==='function'){
  g.loading=function(msg){
    if(arguments.length===0){
      const snap=viewCache.get(routeKey());
      if(snap)return snap+'<div class="ag84-sync" role="status" aria-live="polite">Actualizando…</div>';
    }
    return oldLoading.apply(this,arguments);
  };
}

['renderHome','renderExplore','renderProfile','renderPublish','renderActivity','renderMessages'].forEach(name=>{
  const fn=g[name];if(typeof fn!=='function')return;
  g[name]=async function(){const r=await fn.apply(this,arguments);snapshot();return r};
});

const assetQueue=new Set(),assetEls=new Map(),assetPending=new Set();
let assetTimer=null,assetBusy=false;
function hasRealSrc(el){const src=el&&el.getAttribute&&el.getAttribute('src');return !!src&&src!=='about:blank'}
function rememberEl(key,el){if(!assetEls.has(key))assetEls.set(key,new Set());assetEls.get(key).add(el)}
function queueAsset(el){
  if(!el||!el.dataset)return;const key=el.dataset.asset;if(!key)return;
  if(state.assets.has(key)){el.src=state.assets.get(key);return}
  rememberEl(key,el);assetQueue.add(key);
  if(!assetTimer)assetTimer=setTimeout(flushAssets,80);
}
async function flushAssets(){
  assetTimer=null;if(assetBusy)return;
  for(const key of Array.from(assetQueue)){
    const els=assetEls.get(key)||new Set();
    if(Array.from(els).some(hasRealSrc)){assetQueue.delete(key);assetEls.delete(key)}
  }
  const keys=Array.from(assetQueue).filter(k=>!assetPending.has(k)).slice(0,8);
  if(!keys.length)return;
  keys.forEach(k=>{assetQueue.delete(k);assetPending.add(k)});assetBusy=true;
  try{
    const map=await networkRpcRead('getAssetsData',keys,state.gate);
    Object.entries(map||{}).forEach(([k,v])=>{if(v){state.assets.set(k,v);(assetEls.get(k)||[]).forEach(el=>{if(el&&el.isConnected)el.src=v})}});
  }catch(e){}finally{
    keys.forEach(k=>assetPending.delete(k));assetBusy=false;
    if(assetQueue.size)assetTimer=setTimeout(flushAssets,120);
  }
}
let io=null;
if('IntersectionObserver'in g){
  io=new IntersectionObserver(entries=>entries.forEach(en=>{if(en.isIntersecting){io.unobserve(en.target);queueAsset(en.target)}}),{rootMargin:'700px 0px'});
}
g.hydrateAssets=async function(root=document){
  const els=Array.from(root.querySelectorAll('img[data-asset]'));
  els.forEach(el=>{
    const key=el.dataset.asset;if(!key)return;
    if(state.assets.has(key)){el.src=state.assets.get(key);return}
    rememberEl(key,el);
    if(hasRealSrc(el))return;
    if(io)io.observe(el);else queueAsset(el);
  });
  return Promise.resolve();
};

const oldLike=g.doLike;
g.doLike=function(id){
  if(!state.session)return toast('Primero publicá o recuperá tu perfil.');
  const article=document.getElementById(id),btn=article&&article.querySelector('.post-actions .icon-btn'),pill=article&&article.querySelector('.post-actions .pill');
  const was=btn&&btn.textContent.trim()==='♥';
  const oldCount=pill?parseInt((pill.textContent.match(/\d+/)||['0'])[0],10):0;
  if(btn){btn.textContent=was?'♡':'♥';btn.setAttribute('aria-label',was?'Me gusta':'Quitar Me gusta')}
  if(pill)pill.textContent=Math.max(0,oldCount+(was?-1:1))+' Me gusta';
  rpc('toggleLike',id,state.gate,state.session).catch(e=>{
    if(btn){btn.textContent=was?'♥':'♡';btn.setAttribute('aria-label',was?'Quitar Me gusta':'Me gusta')}
    if(pill)pill.textContent=oldCount+' Me gusta';toast(niceErr(e));
  });
};

g.doComment=function(e,id){
  e.preventDefault();if(!state.session)return toast('Primero publicá o recuperá tu perfil.');
  const input=e.target.comment,text=(input&&input.value||'').trim();if(!text)return;
  const article=document.getElementById(id),host=article&&article.querySelector('.comments');
  const temp=document.createElement('div');temp.className='comment ag84-pending';
  const who=localStorage.getItem('ag8_alias')||'vos';temp.innerHTML='<strong>@'+esc(who)+'</strong>'+esc(text)+' <small>enviando…</small>';
  if(host)host.appendChild(temp);else if(article){const body=article.querySelector('.post-body');if(body){const wrap=document.createElement('div');wrap.className='comments';wrap.appendChild(temp);const form=body.querySelector('.comment-form');body.insertBefore(wrap,form||null)}}
  input.value='';
  rpc('addComment',id,text,state.gate,state.session).then(r=>{
    if(!r.ok)throw new Error(r.reason||'Comentario rechazado');
    temp.classList.remove('ag84-pending');const s=temp.querySelector('small');if(s)s.remove();
  }).catch(err=>{temp.remove();input.value=text;toast(niceErr(err))});
};

g.doFollow=function(alias){
  if(!state.session)return toast('Primero publicá o recuperá tu perfil.');
  const buttons=Array.from(document.querySelectorAll('button')).filter(b=>(b.getAttribute('onclick')||'').includes("doFollow('"+alias+"')"));
  const old=buttons.map(b=>({b,text:b.textContent,cls:b.className}));
  buttons.forEach(b=>{const following=/Siguiendo/i.test(b.textContent);b.textContent=following?'Seguir':'Siguiendo';b.classList.toggle('soft',!following);b.classList.toggle('primary',following)});
  rpc('toggleFollow',alias,state.gate,state.session).then(()=>toast('Seguimiento actualizado')).catch(e=>{old.forEach(x=>{x.b.textContent=x.text;x.b.className=x.cls});toast(niceErr(e))});
};

g.sendChat=function(e){
  e.preventDefault();const t=document.getElementById('chatText'),text=(t&&t.value||'').trim();if(!text)return;
  const thread=document.getElementById('thread'),me=localStorage.getItem('ag8_alias')||'vos';
  const bubble=document.createElement('div');bubble.className='bubble mine ag84-pending';bubble.innerHTML='<b>@'+esc(me)+'</b><br>'+esc(text)+'<span class="time"> enviando…</span>';
  if(thread){const empty=thread.querySelector('.empty');if(empty)empty.remove();thread.appendChild(bubble);thread.scrollTop=thread.scrollHeight}
  t.value='';
  rpc('sendMessage',state.chatUser,text,state.gate,state.session).then(r=>{
    if(!r.ok)throw new Error(r.reason||'Mensaje rechazado');
    bubble.classList.remove('ag84-pending');const tm=bubble.querySelector('.time');if(tm)tm.textContent=' enviado';
    setTimeout(()=>{if(route().startsWith('messages')&&state.chatUser)loadConversation(state.chatUser,true)},250);
  }).catch(err=>{bubble.remove();t.value=text;toast(niceErr(err))});
};

g.searchExplore=function(e){
  e.preventDefault();const input=document.getElementById('exploreQ'),q=(input&&input.value||'').trim().toLowerCase();
  const cards=Array.from(document.querySelectorAll('.person-card'));
  if(cards.length){cards.forEach(c=>{c.hidden=!!q&&!c.textContent.toLowerCase().includes(q)});history.replaceState(null,'','#explore'+(q?'?q='+encodeURIComponent(q):''));return}
  location.hash='#explore'+(q?'?q='+encodeURIComponent(q):'');
};

// v8.5: sin prefetch por hover/foco. Con muchos equipos esas lecturas
// especulativas multiplicaban llamadas a Apps Script sin necesidad.

if('serviceWorker'in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js?v=8.5.0').catch(()=>{}),{once:true})}

const style=document.createElement('style');style.textContent=`
.ag84-sync{position:fixed;right:14px;bottom:74px;z-index:1000;background:var(--panel,#fff);color:var(--text,#222);border:1px solid var(--line,#ddd);border-radius:999px;padding:6px 10px;font-size:.78rem;box-shadow:0 4px 16px #0002;opacity:.82;pointer-events:none}
.ag84-pending{opacity:.68}
@media (min-width:800px){.ag84-sync{bottom:18px}}
`;
document.head.appendChild(style);

g.AulaGramPerfV84=Object.freeze({version:VERSION,clearCache:clearAllDataCache,viewCache:viewCache});
})(window);
