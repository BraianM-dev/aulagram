(function(global){
  'use strict';
  const cfg=global.AulaGramConfig;
  const pending=new Map();
  let frame=null, ready=false, readyVersion='', pingTimer=null;
  let waiters=[];

  function backendOriginAllowed(origin){
    try{if(origin===new URL(cfg.BACKEND_URL).origin)return true}catch(e){}
    return /^https:\/\/(?:script\.google\.com|[a-z0-9-]+\.script\.googleusercontent\.com)$/i.test(origin||'');
  }
  function emit(detail){document.dispatchEvent(new CustomEvent('aulagram:bridge',{detail}));}
  function makeId(){return 'r'+Date.now().toString(36)+Math.random().toString(36).slice(2,9)}
  function ensureFrame(){
    frame=document.getElementById('agBridgeFrame');
    if(!frame){
      frame=document.createElement('iframe');
      frame.id='agBridgeFrame';frame.title='Conexión segura con AulaGram';frame.setAttribute('aria-hidden','true');frame.tabIndex=-1;
      document.body.appendChild(frame);
    }
    if(frame.getAttribute('src')!==cfg.BACKEND_URL) frame.setAttribute('src',cfg.BACKEND_URL);
    return frame;
  }
  function ping(){
    if(ready) return;
    const f=ensureFrame();
    try{f.contentWindow.postMessage({type:'AG8_PING'},'*')}catch(e){}
  }
  function markReady(version){
    if(ready)return;
    ready=true;readyVersion=version||'';clearInterval(pingTimer);
    const list=waiters.slice();waiters=[];list.forEach(w=>{clearTimeout(w.timer);w.resolve(true)});
    emit({status:'ready',version:readyVersion});
  }
  function waitReady(){
    if(ready)return Promise.resolve(true);
    return new Promise((resolve,reject)=>{
      const item={resolve,reject,timer:null};
      item.timer=setTimeout(()=>{
        waiters=waiters.filter(w=>w!==item);
        reject(new Error('El backend de AulaGram no respondió a tiempo. Reintentá en unos segundos.'));
      },cfg.BRIDGE_READY_TIMEOUT_MS||15000);
      waiters.push(item);ping();
    });
  }
  function init(){
    ensureFrame();
    window.addEventListener('message',onMessage);
    pingTimer=setInterval(ping,500);
    ping();
    setTimeout(()=>{if(!ready)emit({status:'error',message:'El backend todavía no respondió. El puente continúa intentando conectarse.'});},cfg.BRIDGE_READY_TIMEOUT_MS||15000);
  }
  function onMessage(event){
    if(!frame || event.source!==frame.contentWindow || !backendOriginAllowed(event.origin)) return;
    const data=event.data||{};
    if(data.type==='AG8_BRIDGE_READY'){markReady(data.version);return;}
    if(data.type==='AG8_RPC_RESULT'){
      const p=pending.get(data.id);if(!p)return;pending.delete(data.id);clearTimeout(p.timer);
      data.ok?p.resolve(data.value):p.reject(new Error(data.error||'Error del servidor'));
    }
  }
  async function call(name,...args){
    await waitReady();
    return new Promise((resolve,reject)=>{
      const id=makeId();
      const timer=setTimeout(()=>{pending.delete(id);reject(new Error('La operación demoró demasiado. Reintentá.'));},cfg.RPC_TIMEOUT_MS||26000);
      pending.set(id,{resolve,reject,timer});
      try{frame.contentWindow.postMessage({type:'AG8_RPC',id,name,args},'*')}catch(e){clearTimeout(timer);pending.delete(id);reject(e)}
    });
  }
  function reconnect(){
    ready=false;readyVersion='';clearInterval(pingTimer);
    waiters.forEach(w=>{clearTimeout(w.timer);w.reject(new Error('Reconectando con AulaGram…'))});waiters=[];
    if(frame){frame.setAttribute('src','about:blank');setTimeout(()=>{frame.setAttribute('src',cfg.BACKEND_URL);pingTimer=setInterval(ping,500);ping();},120)}else init();
    emit({status:'connecting'});
  }
  global.AGBridge={init,call,reconnect,isReady:()=>ready,version:()=>readyVersion};
  document.addEventListener('DOMContentLoaded',init,{once:true});
})(window);
