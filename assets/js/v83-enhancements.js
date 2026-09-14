(function(g){
'use strict';
const seed=g.AulaGramSeedVisuals;
if(!seed)return;
const originalPostHtml=g.postHtml;
if(typeof originalPostHtml==='function'){
  g.postHtml=function(item,me){
    try{
      const meta=seed.postMeta(item&&item.owner,item&&item.post&&item.post.id);
      if(!meta)return originalPostHtml(item,me);
      const clone=Object.assign({},item,{avatarAsset:seed.avatar(item.owner)||item.avatarAsset,post:Object.assign({},item.post,{title:meta.title,text:meta.text,alt:meta.alt,imageAsset:meta.image})});
      return originalPostHtml(clone,me);
    }catch(e){return originalPostHtml(item,me)}
  };
}
const originalImgHtml=g.imgHtml;
if(typeof originalImgHtml==='function'){
  g.imgHtml=function(asset,cls='',alt=''){
    const a=String(asset||'');
    if(a.startsWith('seed:')){const p=a.split(':');const alias=p[1]||'',name=p[2]||'';const src=name==='avatar'?seed.avatar(alias):seed.post(alias,name);if(src)return `<img class="${g.attr?attr(cls):cls}" src="${src}" alt="${g.attr?attr(alt):alt}" loading="lazy" decoding="async">`;}
    if(/^https:\/\/braianm-dev\.github\.io\/aulagram\/assets\/seed\//.test(a))return `<img class="${g.attr?attr(cls):cls}" src="${a}" alt="${g.attr?attr(alt):alt}" loading="lazy" decoding="async">`;
    const html=originalImgHtml(asset,cls,alt);
    return /loading=/.test(html)?html:html.replace('<img ','<img loading="lazy" decoding="async" ');
  };
}
function aliasFromHref(href){const m=String(href||'').match(/#profile\/([^?#]+)/);if(!m)return '';try{return decodeURIComponent(m[1])}catch(e){return m[1]}}
function applySeedVisuals(root=document){
  root.querySelectorAll('.story').forEach(el=>{const a=aliasFromHref(el.getAttribute('href'));const img=el.querySelector('img');const src=seed.avatar(a);if(img&&src&&img.src!==src)img.src=src});
  root.querySelectorAll('.person-card').forEach(el=>{const a=aliasFromHref(el.querySelector('a[href*="#profile/"]')?.getAttribute('href'));const img=el.querySelector('img.avatar');const src=seed.avatar(a);if(img&&src)img.src=src});
  const route=(location.hash||'').replace(/^#profile\//,'').split('?')[0];if(route&&location.hash.startsWith('#profile/')){
    let a='';try{a=decodeURIComponent(route)}catch(e){a=route}
    const av=root.querySelector('.profile-card .big-avatar');if(av&&seed.avatar(a))av.src=seed.avatar(a);
    root.querySelectorAll('.profile-grid .grid-post').forEach((el,i)=>{const img=el.querySelector('img'),m=seed.postMeta(a,i+1),ov=el.querySelector('.grid-overlay');if(img&&m)img.src=m.image;if(ov&&m){const like=(ov.textContent.match(/♥\s*(\d+)/)||[])[1]||'0';ov.textContent=m.title+' · ♥ '+like}})
  }
  root.querySelectorAll('.conv').forEach(el=>{const click=el.getAttribute('onclick')||'';const m=click.match(/openChat\('([^']+)'\)/);if(!m)return;const img=el.querySelector('img.avatar'),src=seed.avatar(m[1]);if(img&&src)img.src=src});
  root.querySelectorAll('footer').forEach(f=>{if(/AulaGram v8\.1|AulaGram v8\.2/.test(f.textContent))f.innerHTML=f.innerHTML.replace(/AulaGram v8\.[12]/g,'AulaGram v8.3')});
}
function adminActiveInput(){return Array.from(document.querySelectorAll('.toggle input')).find(x=>(x.getAttribute('onchange')||'').includes("adminSetting('active'"))}
async function ag83ToggleActive(){const box=adminActiveInput();if(!box)return;try{await rpc('adminUpdateSettings',{active:!box.checked},state.admin);state.bootAt=0;toast(!box.checked?'AulaGram activada':'AulaGram pausada');await renderAdmin()}catch(e){toast(niceErr(e))}}
async function ag83ExportMessages(){let w=null;try{w=window.open('about:blank','_blank');if(w)w.document.write('<p style="font-family:Arial;padding:20px">Preparando exportación de mensajes…</p>');const r=await rpc('adminExportMessages',state.admin);if(!r||!r.ok)throw new Error((r&&r.message)||'No se pudo exportar');toast('Exportación creada: '+r.csvName,5000);if(w)w.location=r.csvUrl;else location.href=r.csvUrl}catch(e){if(w)w.close();toast(niceErr(e),5000)}}
g.ag83ToggleActive=ag83ToggleActive;g.ag83ExportMessages=ag83ExportMessages;
function enhanceAdmin(){const hero=Array.from(document.querySelectorAll('.hero')).find(x=>x.querySelector('h1')?.textContent.includes('Panel docente'));if(!hero||hero.dataset.v83)return;if(hero.querySelector('.network-status')){hero.dataset.v83='1';return}hero.dataset.v83='1';const active=!!adminActiveInput()?.checked;const box=document.createElement('div');box.className='network-status '+(active?'open':'closed');box.innerHTML=`<div><b>${active?'🟢 AulaGram está ACTIVA':'🔒 AulaGram está PAUSADA'}</b><span>${active?'Los estudiantes pueden ingresar según los controles habilitados.':'Los datos siguen guardados. Los estudiantes verán la red pausada.'}</span></div><div class="row"><button class="btn ${active?'danger':'primary'}" onclick="ag83ToggleActive()">${active?'⏸ Pausar AulaGram':'▶ Activar AulaGram'}</button><button class="btn primary" onclick="ag83ExportMessages()">⬇ Exportar mensajes CSV</button></div>`;hero.appendChild(box)}
const oldRenderAdmin=g.renderAdmin;if(typeof oldRenderAdmin==='function')g.renderAdmin=async function(){const r=await oldRenderAdmin.apply(this,arguments);enhanceAdmin();return r};
function a11yKeyboard(e){const p=document.getElementById('a11yPanel');if(!p||p.hidden)return;if(e.key==='Escape'){e.preventDefault();g.closeA11y&&closeA11y();return}if(e.key==='Tab'){const f=Array.from(p.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')).filter(x=>!x.disabled&&!x.hidden);if(!f.length)return;const first=f[0],last=f[f.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}}
document.addEventListener('keydown',a11yKeyboard);
const mo=new MutationObserver(()=>{applySeedVisuals();enhanceAdmin()});
mo.observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('DOMContentLoaded',()=>{applySeedVisuals();enhanceAdmin();const b=document.getElementById('a11yOpen');if(b){b.setAttribute('aria-haspopup','dialog');b.setAttribute('aria-controls','a11yPanel')}});
})(window);
