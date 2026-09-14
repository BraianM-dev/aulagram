(function(global){
  'use strict';
  const cfg=global.AulaGramConfig;
  let ready=false, readyVersion='', checking=null, healthTimer=null;
  const timings=new Map();

  const DIRECT_READS=new Set([
    'getBootstrap','getMyState','getHomeViewData','getExploreViewData','getProfileViewData',
    'getActivityViewData','getMessagesViewData','getConversation','getProfileDesign','getAssetsData'
  ]);

  function emit(detail){document.dispatchEvent(new CustomEvent('aulagram:bridge',{detail}));}
  function now(){return (global.performance&&performance.now)?performance.now():Date.now();}
  function rememberTiming(name,total,serverMs){
    timings.set(name,{totalMs:Math.round(total),serverMs:Number(serverMs||0),at:Date.now()});
    if(timings.size>40){const first=timings.keys().next().value;timings.delete(first);}
  }
  function markReady(version){
    ready=true;
    if(version)readyVersion=String(version);
    emit({status:'ready',version:readyVersion,transport:'direct-jsonp-read + post-write',timings:Object.fromEntries(timings)});
  }
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
      script.onerror=()=>finish(new Error('No se pudo contactar el backend de AulaGram.'));
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
    const t=now();
    checking=jsonp({api:'health'},cfg.BRIDGE_READY_TIMEOUT_MS||12000)
      .then(data=>{
        if(!data||!data.ok)throw new Error((data&&data.error)||'El backend respondió sin estado válido.');
        rememberTiming('health',now()-t,0);
        markReady(data.version||'');
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
    await fetch(cfg.BACKEND_URL,{
      method:'POST',mode:'no-cors',credentials:'omit',cache:'no-store',redirect:'follow',body:body
    });
  }
  async function pollResult(rid,timeout){
    const start=Date.now();let wait=140;
    const limit=timeout||cfg.RPC_TIMEOUT_MS||35000;
    while(Date.now()-start<limit){
      await sleep(wait);
      try{
        const data=await jsonp({api:'result',rid:rid},Math.min(7000,limit));
        if(data&&data.pending){wait=Math.min(700,Math.round(wait*1.32));continue;}
        if(!data||!data.result)throw new Error('Respuesta incompleta del backend.');
        return data.result;
      }catch(e){
        if(Date.now()-start>=limit)throw e;
        wait=Math.min(850,Math.round(wait*1.3));
      }
    }
    throw new Error('La operación demoró demasiado. Reintentá.');
  }
  async function callPost(name,args){
    const t=now();
    const rid=makeId();
    try{await submitRpc(rid,name,args);}catch(err){
      ready=false;emit({status:'error',message:'No se pudo enviar la operación al servidor.'});
      throw new Error('No se pudo enviar la operación a AulaGram. Verificá la conexión y reintentá.');
    }
    const result=await pollResult(rid,cfg.RPC_TIMEOUT_MS||35000);
    rememberTiming(name,now()-t,0);
    markReady(readyVersion);
    if(!result.ok)throw new Error(result.error||'Error del servidor');
    return result.value;
  }
  async function callDirectRead(name,args){
    const t=now();
    const data=await jsonp({api:'rpcget',method:name,args:JSON.stringify(args)},cfg.RPC_TIMEOUT_MS||35000);
    if(!data||!data.result)throw new Error('Respuesta incompleta del servidor.');
    rememberTiming(name,now()-t,data.serverMs||0);
    if(!data.result.ok)throw new Error(data.result.error||'Error del servidor');
    markReady(data.version||readyVersion);
    return data.result.value;
  }
  function mayUseDirectRead(name,args){
    if(!DIRECT_READS.has(name))return false;
    if(name==='getBootstrap' && args && args[2])return false;
    return true;
  }
  async function call(name,...args){
    // v8.5: la operación real no espera primero a /health. Antes eso duplicaba
    // la latencia del primer acceso. La propia lectura/escritura confirma el backend.
    if(mayUseDirectRead(name,args)){
      try{return await callDirectRead(name,args);}
      catch(err){
        const msg=String(err&&err.message||err);
        if(!/GET no permitido|Método GET no permitido|Método no permitido/i.test(msg)){
          ready=false;emit({status:'error',message:msg});throw err;
        }
      }
    }
    try{return await callPost(name,args);}
    catch(err){ready=false;emit({status:'error',message:String(err&&err.message||err)});throw err;}
  }
  function init(){
    clearTimeout(healthTimer);
    // Con una clase ya abierta, la primera lectura hace de health-check y evita
    // una ejecución extra de Apps Script. En la portada sí comprobamos estado.
    const hasGate=!!localStorage.getItem('ag8_gate');
    if(!hasGate)healthTimer=setTimeout(()=>checkHealth(true).catch(()=>{}),700);
  }
  function reconnect(){ready=false;readyVersion='';return checkHealth(true);}
  global.AGBridge={
    init,call,reconnect,isReady:()=>ready,version:()=>readyVersion,
    transport:()=> 'direct-jsonp-read + post-write',directReads:()=>Array.from(DIRECT_READS),
    timings:()=>Object.fromEntries(timings)
  };
  document.addEventListener('DOMContentLoaded',init,{once:true});
})(window);
