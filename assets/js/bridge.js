(function(global){
  'use strict';
  const cfg=global.AulaGramConfig;
  let ready=false, readyVersion='', checking=null, healthTimer=null;

  function emit(detail){document.dispatchEvent(new CustomEvent('aulagram:bridge',{detail}));}
  function makeId(){
    try{
      const b=new Uint8Array(16);crypto.getRandomValues(b);
      return 'r'+Array.from(b,x=>x.toString(16).padStart(2,'0')).join('');
    }catch(e){return 'r'+Date.now().toString(36)+Math.random().toString(36).slice(2,14)}
  }
  function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
  function qs(obj){
    const p=new URLSearchParams();
    Object.entries(obj||{}).forEach(([k,v])=>{if(v!==undefined&&v!==null)p.set(k,String(v));});
    return p.toString();
  }
  function jsonp(params, timeout){
    return new Promise((resolve,reject)=>{
      const cb='AGCB_'+makeId().replace(/[^A-Za-z0-9_]/g,'');
      const script=document.createElement('script');
      let done=false;
      const finish=(err,val)=>{
        if(done)return;done=true;clearTimeout(timer);
        try{delete global[cb]}catch(e){global[cb]=undefined}
        if(script.parentNode)script.parentNode.removeChild(script);
        err?reject(err):resolve(val);
      };
      global[cb]=data=>finish(null,data);
      script.async=true;
      script.referrerPolicy='no-referrer';
      script.onerror=()=>finish(new Error('No se pudo contactar el backend de AulaGram. Verificá el despliegue público de Apps Script.'));
      const sep=cfg.BACKEND_URL.includes('?')?'&':'?';
      script.src=cfg.BACKEND_URL+sep+qs(Object.assign({},params,{callback:cb,_:Date.now()}));
      const timer=setTimeout(()=>finish(new Error('El backend de AulaGram no respondió a tiempo.')),timeout||cfg.BRIDGE_READY_TIMEOUT_MS||12000);
      document.head.appendChild(script);
    });
  }
  async function checkHealth(force){
    if(ready&&!force)return {ok:true,version:readyVersion};
    if(checking&&!force)return checking;
    emit({status:'connecting'});
    checking=jsonp({api:'health'},cfg.BRIDGE_READY_TIMEOUT_MS||12000)
      .then(data=>{
        if(!data||!data.ok)throw new Error((data&&data.error)||'El backend respondió sin estado válido.');
        ready=true;readyVersion=data.version||'';
        emit({status:'ready',version:readyVersion,transport:'fetch-no-cors+jsonp'});
        return data;
      })
      .catch(err=>{
        ready=false;readyVersion='';emit({status:'error',message:err.message});throw err;
      })
      .finally(()=>{checking=null;});
    return checking;
  }
  async function submitRpc(rid,name,args){
    const body=new URLSearchParams();
    body.set('api','rpc');
    body.set('rid',rid);
    body.set('payload',JSON.stringify({name:name,args:args||[]}));
    // no-cors: la respuesta es opaca, pero el POST se ejecuta. El resultado se lee luego por JSONP.
    await fetch(cfg.BACKEND_URL,{
      method:'POST',
      mode:'no-cors',
      credentials:'omit',
      cache:'no-store',
      redirect:'follow',
      body:body
    });
  }
  async function pollResult(rid,timeout){
    const start=Date.now();let wait=280;
    const limit=timeout||cfg.RPC_TIMEOUT_MS||35000;
    while(Date.now()-start<limit){
      await sleep(wait);
      try{
        const data=await jsonp({api:'result',rid:rid},Math.min(7000,limit));
        if(data&&data.pending){wait=Math.min(950,Math.round(wait*1.35));continue;}
        if(!data||!data.result)throw new Error('Respuesta incompleta del backend.');
        return data.result;
      }catch(e){
        if(Date.now()-start>=limit)throw e;
        wait=Math.min(1100,Math.round(wait*1.4));
      }
    }
    throw new Error('La operación demoró demasiado. Reintentá.');
  }
  async function call(name,...args){
    await checkHealth(false);
    if(name==='getAssetsData'){
      const data=await jsonp({api:'rpcget',method:name,args:JSON.stringify(args)},cfg.RPC_TIMEOUT_MS||35000);
      if(!data||!data.result)throw new Error('Respuesta incompleta del servidor.');
      if(!data.result.ok)throw new Error(data.result.error||'Error del servidor');
      return data.result.value;
    }
    const rid=makeId();
    try{
      await submitRpc(rid,name,args);
    }catch(err){
      ready=false;
      emit({status:'error',message:'No se pudo enviar la operación al servidor.'});
      throw new Error('No se pudo enviar la operación a AulaGram. Verificá la conexión y reintentá.');
    }
    const result=await pollResult(rid,cfg.RPC_TIMEOUT_MS||35000);
    if(!result.ok)throw new Error(result.error||'Error del servidor');
    return result.value;
  }
  function init(){
    checkHealth(true).catch(()=>{});
    clearInterval(healthTimer);
    healthTimer=setInterval(()=>{if(!ready)checkHealth(true).catch(()=>{});},15000);
  }
  function reconnect(){ready=false;readyVersion='';return checkHealth(true);}
  global.AGBridge={init,call,reconnect,isReady:()=>ready,version:()=>readyVersion,transport:()=> 'fetch-no-cors+jsonp'};
  document.addEventListener('DOMContentLoaded',init,{once:true});
})(window);
(function(global){
  'use strict';
  const cfg=global.AulaGramConfig;
  let ready=false, readyVersion='', checking=null, healthTimer=null;

  function emit(detail){document.dispatchEvent(new CustomEvent('aulagram:bridge',{detail}));}
  function makeId(){
    try{
      const b=new Uint8Array(16);crypto.getRandomValues(b);
      return 'r'+Array.from(b,x=>x.toString(16).padStart(2,'0')).join('');
    }catch(e){return 'r'+Date.now().toString(36)+Math.random().toString(36).slice(2,14)}
  }
  function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
  function qs(obj){
    const p=new URLSearchParams();
    Object.entries(obj||{}).forEach(([k,v])=>{if(v!==undefined&&v!==null)p.set(k,String(v));});
    return p.toString();
  }
  function jsonp(params, timeout){
    return new Promise((resolve,reject)=>{
      const cb='AGCB_'+makeId().replace(/[^A-Za-z0-9_]/g,'');
      const script=document.createElement('script');
      let done=false;
      const finish=(err,val)=>{
        if(done)return;done=true;clearTimeout(timer);
        try{delete global[cb]}catch(e){global[cb]=undefined}
        if(script.parentNode)script.parentNode.removeChild(script);
        err?reject(err):resolve(val);
      };
      global[cb]=data=>finish(null,data);
      script.async=true;
      script.referrerPolicy='no-referrer';
      script.onerror=()=>finish(new Error('No se pudo contactar el backend de AulaGram. Verificá que la Web App esté desplegada para acceso público.'));
      const sep=cfg.BACKEND_URL.includes('?')?'&':'?';
      script.src=cfg.BACKEND_URL+sep+qs(Object.assign({},params,{callback:cb,_:Date.now()}));
      const timer=setTimeout(()=>finish(new Error('El backend de AulaGram no respondió a tiempo.')),timeout||cfg.BRIDGE_READY_TIMEOUT_MS||12000);
      document.head.appendChild(script);
    });
  }
  async function checkHealth(force){
    if(ready&&!force)return {ok:true,version:readyVersion};
    if(checking&&!force)return checking;
    emit({status:'connecting'});
    checking=jsonp({api:'health'},cfg.BRIDGE_READY_TIMEOUT_MS||12000)
      .then(data=>{
        if(!data||!data.ok)throw new Error((data&&data.error)||'El backend respondió sin estado válido.');
        ready=true;readyVersion=data.version||'';
        emit({status:'ready',version:readyVersion,transport:'post-jsonp'});
        return data;
      })
      .catch(err=>{
        ready=false;readyVersion='';emit({status:'error',message:err.message});throw err;
      })
      .finally(()=>{checking=null;});
    return checking;
  }
  function ensurePostTarget(rid){
    const name='agRpcTarget_'+rid;
    const frame=document.createElement('iframe');
    frame.name=name;frame.title='Transporte AulaGram';frame.tabIndex=-1;frame.setAttribute('aria-hidden','true');
    frame.style.position='fixed';frame.style.width='1px';frame.style.height='1px';frame.style.opacity='0';frame.style.pointerEvents='none';frame.style.border='0';frame.style.left='-10000px';
    document.body.appendChild(frame);
    return {frame,name};
  }
  function submitRpc(rid,name,args){
    const {frame,name:target}=ensurePostTarget(rid);
    const form=document.createElement('form');
    form.method='POST';form.action=cfg.BACKEND_URL;form.target=target;form.style.display='none';form.acceptCharset='UTF-8';
    const fields={api:'rpc',rid:rid,payload:JSON.stringify({name:name,args:args||[]})};
    Object.entries(fields).forEach(([k,v])=>{const i=document.createElement('input');i.type='hidden';i.name=k;i.value=v;form.appendChild(i);});
    document.body.appendChild(form);
    form.submit();
    setTimeout(()=>{if(form.parentNode)form.remove();},100);
    return ()=>{setTimeout(()=>{if(frame.parentNode)frame.remove();},250);};
  }
  async function pollResult(rid,timeout){
    const start=Date.now();let wait=260;
    while(Date.now()-start<(timeout||cfg.RPC_TIMEOUT_MS||30000)){
      await sleep(wait);
      try{
        const data=await jsonp({api:'result',rid:rid},Math.min(7000,timeout||7000));
        if(data&&data.pending){wait=Math.min(900,Math.round(wait*1.35));continue;}
        if(!data||!data.result)throw new Error('Respuesta incompleta del backend.');
        return data.result;
      }catch(e){
        if(Date.now()-start>=(timeout||cfg.RPC_TIMEOUT_MS||30000))throw e;
        wait=Math.min(1000,Math.round(wait*1.4));
      }
    }
    throw new Error('La operación demoró demasiado. Reintentá.');
  }
  async function call(name,...args){
    await checkHealth(false);
    // Los recursos gráficos se pueden leer por JSONP directo para evitar una ejecución extra.
    if(name==='getAssetsData'){
      const data=await jsonp({api:'rpcget',method:name,args:JSON.stringify(args)},cfg.RPC_TIMEOUT_MS||30000);
      if(!data||!data.result)throw new Error('Respuesta incompleta del servidor.');
      if(!data.result.ok)throw new Error(data.result.error||'Error del servidor');
      return data.result.value;
    }
    const rid=makeId();
    const cleanup=submitRpc(rid,name,args);
    try{
      const result=await pollResult(rid,cfg.RPC_TIMEOUT_MS||30000);
      if(!result.ok)throw new Error(result.error||'Error del servidor');
      return result.value;
    }finally{cleanup();}
  }
  function init(){
    checkHealth(true).catch(()=>{});
    clearInterval(healthTimer);
    healthTimer=setInterval(()=>{if(!ready)checkHealth(true).catch(()=>{});},12000);
  }
  function reconnect(){ready=false;readyVersion='';return checkHealth(true);}
  global.AGBridge={init,call,reconnect,isReady:()=>ready,version:()=>readyVersion,transport:()=> 'post-jsonp'};
  document.addEventListener('DOMContentLoaded',init,{once:true});
})(window);
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
