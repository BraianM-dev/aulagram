(function(g){
'use strict';
const V='8.7.0';
const STORY_REACTIONS=['❤️','👏','🔥','💡','👍'];
const originalAppHeader=g.appHeader;
const originalShell=g.shell;
const originalRenderHome=g.renderHome;
const originalRenderProfile=g.renderProfile;
const originalRenderAdmin=g.renderAdmin;
const originalConversationHtml=g.conversationHtml;
const originalSubmitProfile=g.submitProfile;

function storyEsc(v){return typeof g.esc==='function'?g.esc(v):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function storyAttr(v){return typeof g.attr==='function'?g.attr(v):storyEsc(v);}
function storyTimeLabel(s){if(s.permanent)return 'Permanente';const m=Math.max(0,Math.ceil(Number(s.remainingSeconds||0)/60));return m+' min';}
function storyReactionTotal(s){return Object.values(s.reactionCounts||{}).reduce((a,b)=>a+Number(b||0),0);}
function validHex(v,fallback){return /^#[0-9a-f]{6}$/i.test(String(v||''))?String(v).toUpperCase():fallback;}

function storyLogoutButton(mobile){return `<button class="${mobile?'bottom-logout':'nav-logout'}" type="button" onclick="agLogoutV87()" title="Cerrar sesión" aria-label="Cerrar sesión">⎋<span>${mobile?'Salir':'Cerrar sesión'}</span></button>`;}

g.appHeader=function(me,unread=0){
  const mobile=`<nav class="bottom-nav" aria-label="Navegación móvil"><a href="#home">⌂<span>Inicio</span></a><a href="#explore">⌕<span>Explorar</span></a><a href="#publish">＋<span>Publicar</span></a>${me?`<a href="#messages">✉${unread?`<b class="nav-badge">${Math.min(unread,99)}</b>`:''}<span>Mensajes</span></a><a href="#activity">♡<span>Actividad</span></a>${storyLogoutButton(true)}`:''}</nav>`;
  return `<a class="skip" href="#main">Saltar al contenido principal</a><header class="topbar"><div class="top-inner"><a class="brand" href="#home" aria-label="AulaGram inicio"><span class="a">Aula</span><span class="g">Gram</span></a><nav class="nav" aria-label="Navegación"><a href="#home" title="Inicio">⌂ <span class="label">Inicio</span></a><a href="#explore" title="Explorar">⌕ <span class="label">Explorar</span></a>${me?`<a href="#messages" title="Mensajes">✉ <span class="label">Mensajes</span>${unread?`<b class="nav-badge">${Math.min(unread,99)}</b>`:''}</a><a href="#activity" title="Actividad">♡ <span class="label">Actividad</span></a>`:''}<a href="#publish" title="Publicar">＋ <span class="label">Publicar</span></a><button id="a11yOpen" class="a11y-btn" onclick="openA11y()" aria-label="Abrir accesibilidad">♿</button>${me?storyLogoutButton(false):''}</nav><div class="session">${me?`<a href="#profile/${encodeURIComponent(me.alias)}">@${storyEsc(me.alias)}</a>`:`<a href="#publish">Entrar</a>`}</div></div></header>${mobile}`;
};

g.shell=function(content,me,unread=0){return g.appHeader(me,unread)+`<main id="main" class="page">${content}</main><footer class="page small" style="padding-top:0">AulaGram v${V} · 9.º EBI · HTML + CSS + ciudadanía digital + accesibilidad</footer>`;};

g.agLogoutV87=async function(){
  if(!confirm('¿Cerrar la sesión de AulaGram en este navegador?'))return;
  try{if(state.gate&&state.session)await rpc('logoutProfile',state.gate,state.session);}catch(e){}
  setSession('','');setAdmin('');state.chatUser='';state.boot=null;state.bootAt=0;
  toast('Sesión cerrada');location.hash='#home';renderRoute();
};

function ensureStoryModal(){
  let modal=document.getElementById('storyModalV87');if(modal)return modal;
  modal=document.createElement('div');modal.id='storyModalV87';modal.className='story-modal-v87';modal.hidden=true;
  modal.innerHTML='<div class="story-modal-backdrop" onclick="closeStoryV87()"></div><section class="story-dialog-v87" role="dialog" aria-modal="true" aria-labelledby="storyTitleV87"><button class="story-close-v87" onclick="closeStoryV87()" aria-label="Cerrar historia">×</button><div id="storyBodyV87"></div></section>';
  document.body.appendChild(modal);return modal;
}

g.closeStoryV87=function(){const m=document.getElementById('storyModalV87');if(m)m.hidden=true;};
document.addEventListener('keydown',e=>{if(e.key==='Escape'){const m=document.getElementById('storyModalV87');if(m&&!m.hidden)g.closeStoryV87();}});

function storyButtonHtml(s){
  const av=typeof imgHtml==='function'?imgHtml(s.avatarAsset,'story-avatar-v87','Avatar de '+s.display):'';
  return `<button class="story story-v87" type="button" onclick="openStoryV87('${storyAttr(s.id)}')" aria-label="Ver historia de ${storyAttr(s.display)}"><div class="avatar-ring story-ring-v87">${av}<span class="story-badge-v87">${storyEsc(s.emoji||'✨')}</span></div><span>@${storyEsc(s.owner)}</span><small>${storyEsc(storyTimeLabel(s))}</small></button>`;
}

async function hydrateStoriesV87(silent=false){
  const holder=document.querySelector('.stories');if(!holder||!state.gate)return;
  try{
    const r=await rpcRead('getActiveStories',state.gate,state.session||'');
    const list=(r&&r.stories)||[];
    holder.innerHTML=list.length?list.map(storyButtonHtml).join(''):'<div class="empty small">Todavía no hay historias activas.</div>';
    if(typeof hydrateAssets==='function')await hydrateAssets(holder);
  }catch(e){if(!silent)console.warn('Historias:',e);}
}
g.hydrateStoriesV87=hydrateStoriesV87;

async function storyImageHtml(s){
  if(!s.hasImage)return '';
  try{const r=await rpcRead('getStoryImageData',s.id,state.gate);if(r&&r.data)return `<img class="story-main-image-v87" src="${storyAttr(r.data)}" alt="Imagen de la historia de ${storyAttr(s.display)}">`;}
  catch(e){}
  return '';
}

function reactionsHtml(s,reactions){
  const allowed=(reactions&&reactions.length?reactions:STORY_REACTIONS);
  if(!state.session)return '<p class="story-login-hint-v87">Publicá o recuperá tu perfil para reaccionar.</p>';
  return `<div class="story-reactions-v87" aria-label="Reacciones">${allowed.map(r=>`<button type="button" class="story-reaction-v87 ${s.myReaction===r?'active':''}" onclick="reactStoryV87('${storyAttr(s.id)}','${r}')"><span>${r}</span><b>${Number((s.reactionCounts||{})[r]||0)}</b></button>`).join('')}</div>`;
}

g.openStoryV87=async function(id,recordView=true){
  const modal=ensureStoryModal(),body=document.getElementById('storyBodyV87');modal.hidden=false;body.innerHTML=loading('Abriendo historia…');
  try{
    const r=await rpcRead('getStoryDetail',id,state.gate,state.session||'');const s=r.story;
    const image=await storyImageHtml(s);
    const total=storyReactionTotal(s);
    body.innerHTML=`<article class="story-card-v87" style="--story-bg:${storyAttr(s.background)};--story-text:${storyAttr(s.textColor)};--story-accent:${storyAttr(s.accent)}"><div class="story-top-v87"><div><b id="storyTitleV87">@${storyEsc(s.owner)}</b><span>${storyEsc(s.display)}</span></div><span class="story-expiry-v87">${storyEsc(storyTimeLabel(s))}</span></div>${image}<div class="story-content-v87"><div class="story-emoji-v87" aria-hidden="true">${storyEsc(s.emoji||'✨')}</div><h2>${storyEsc(s.title)}</h2><p>${storyEsc(s.text)}</p></div><div class="story-meta-v87"><span>👁 ${Number(s.views||0)} vistas</span><span>·</span><span>${total} reacciones</span></div>${reactionsHtml(s,r.reactions)}</article>`;
    if(recordView&&state.session)rpc('registerStoryView',s.id,state.gate,state.session).catch(()=>{});
  }catch(e){body.innerHTML=`<div class="notice danger">${storyEsc(niceErr(e))}</div>`;}
};

g.reactStoryV87=async function(id,reaction){
  try{const r=await rpc('reactStory',id,reaction,state.gate,state.session);if(!r.ok)return toast(r.reason||'No se pudo reaccionar');await g.openStoryV87(id,false);hydrateStoriesV87(true);}catch(e){toast(niceErr(e));}
};

if(typeof originalRenderHome==='function')g.renderHome=async function(){const r=await originalRenderHome.apply(this,arguments);await hydrateStoriesV87(true);return r;};

if(typeof originalRenderProfile==='function')g.renderProfile=async function(alias){
  const r=await originalRenderProfile.apply(this,arguments);
  try{
    const data=await rpcRead('getActiveStories',state.gate,state.session||'');const s=(data.stories||[]).find(x=>x.owner===alias);
    if(s){const main=document.getElementById('main');if(main){const box=document.createElement('section');box.className='card card-pad profile-story-v87';box.innerHTML=`<div class="row"><div style="flex:1"><h2 style="margin:0">Historia activa ${storyEsc(s.emoji||'✨')}</h2><p class="small">${storyEsc(s.permanent?'Historia permanente':('Disponible por '+storyTimeLabel(s)))}</p></div><button class="btn primary" onclick="openStoryV87('${storyAttr(s.id)}')">Ver historia</button></div>`;main.appendChild(box);}}
  }catch(e){}
  return r;
};

// Botones rápidos compactos y con todos los temas que el bot declara poder trabajar.
g.conversationHtml=function(r,alias){
  if(!r)return loading('Abriendo conversación…');
  const msgs=(r.messages||[]).map(m=>`<div class="bubble ${m.from===r.me?'mine':''}"><b>@${storyEsc(m.from)}</b><br>${storyEsc(m.text)}<span class="time">${storyEsc(m.time||'')}</span></div>`).join('');
  const picks=['menú','HTML','CSS','JavaScript','Python','IA','WCAG','Redes','IP','HTTP','Archivos','JSON','Git/GitHub','Hardware','Seguridad','Ciudadanía digital','reto','quiz','dato random'];
  return `<div class="chat-head">Conversación con @${storyEsc(alias)}</div><div class="chat-picks">${picks.map(x=>`<button type="button" onclick="quickChat('${storyAttr(x)}')">${storyEsc(x)}</button>`).join('')}</div><div class="chat-thread" id="thread">${msgs||'<div class="empty">Escribí el primer mensaje.</div>'}</div><form class="composer" onsubmit="sendChat(event)"><textarea id="chatText" maxlength="600" placeholder="Escribí un mensaje… Enter envía · Shift+Enter hace un salto" onkeydown="chatKey(event)"></textarea><button class="btn primary" type="submit">Enviar</button></form>`;
};

function extractStoryTheme(css){
  function value(name,fallback){const m=String(css||'').match(new RegExp(name+'\\s*:\\s*(#[0-9a-fA-F]{6})'));return validHex(m&&m[1],fallback);}
  return {background:value('--historia-fondo','#405DE6'),textColor:value('--historia-texto','#FFFFFF'),accent:value('--historia-acento','#FF4F8B')};
}
function fileBase(path){return String(path||'').replace(/\\/g,'/').split('/').pop();}
function extractStudentStory(html,css,images){
  try{
    const doc=new DOMParser().parseFromString(String(html||''),'text/html'),root=doc.querySelector('.historia');if(!root)return null;
    const title=(root.querySelector('.historia-titulo')?.textContent||'').trim();
    const text=(root.querySelector('.historia-texto')?.textContent||'').trim();
    const emoji=(root.querySelector('.historia-emoji')?.textContent||'✨').trim().slice(0,8);
    const src=root.querySelector('img.historia-imagen')?.getAttribute('src')||'';
    const wanted=fileBase(src);const image=(images||[]).find(x=>fileBase(x.name)===wanted)||null;
    const theme=extractStoryTheme(css);
    if(!title&&!text)return null;
    return Object.assign({title:title||'Mi historia',text:text||'Mi historia de AulaGram',emoji:emoji,image:image},theme);
  }catch(e){return null;}
}

// Publicación del perfil + historia definida por el propio HTML/CSS del estudiante.
g.submitProfile=async function(e){
  e.preventDefault();const out=$('#publishResult');out.innerHTML=loading('Validando y subiendo…');
  try{
    const htmlFile=$('#pubHtml').files[0],cssFile=$('#pubCss').files[0],imgs=Array.from($('#pubImages').files||[]);
    const htmlText=await readTextFile(htmlFile),cssText=await readTextFile(cssFile),images=[];
    for(const f of imgs)images.push(await optimizeImageForUpload(f));
    const payload={gateToken:state.gate,sessionToken:state.session,alias:$('#pubAlias').value,htmlText:htmlText,cssText:cssText,images:images};
    const r=await rpc('publishProfile',payload);
    if(!r.ok){
      if(r.needsRecovery){out.innerHTML=`<div class="notice warn">${storyEsc(r.message)}</div>`;return;}
      const issues=(r.validation?.issues||[]).map(x=>`<li>${storyEsc(x)}</li>`).join('');const warnings=(r.validation?.warnings||[]).map(x=>`<li>${storyEsc(x)}</li>`).join('');
      out.innerHTML=`<div class="notice danger"><b>Faltan algunos requisitos:</b><ul>${issues}</ul>${warnings?`<b>Advertencias:</b><ul>${warnings}</ul>`:''}</div>`;return;
    }
    setSession(r.sessionToken,r.alias);
    let storyResult='';const story=extractStudentStory(htmlText,cssText,images);
    if(story){
      try{const sr=await rpc('publishStudentStory',Object.assign({gateToken:state.gate,sessionToken:r.sessionToken},story));storyResult=sr&&sr.ok?`<div class="notice ok"><b>Historia publicada por 45 minutos.</b> Podés verla desde Inicio.</div>`:`<div class="notice warn">El perfil se publicó, pero la historia no: ${storyEsc(sr&&sr.reason||'revisá el contenido')}</div>`;}catch(err){storyResult=`<div class="notice warn">El perfil se publicó, pero no pude publicar la historia: ${storyEsc(niceErr(err))}</div>`;}
    }
    const code=r.recoveryCode?`<div class="notice ok"><b>Tu código de recuperación es: <span style="font-size:1.25rem">${storyEsc(r.recoveryCode)}</span></b><br>Guardalo. No lo compartas.</div>`:'';
    out.innerHTML=`<div class="notice ok"><b>${storyEsc(r.message)}</b></div>${storyResult}${code}<a class="btn primary" href="#profile/${encodeURIComponent(r.alias)}">Ver mi perfil</a>`;toast('Perfil publicado correctamente');
  }catch(err){out.innerHTML=`<div class="notice danger">${storyEsc(niceErr(err))}</div>`;}
};

async function enhanceStoryAdmin(){
  if(!state.admin)return;const main=document.getElementById('main');if(!main||document.getElementById('storyAdminV87'))return;
  try{
    const d=await rpc('adminGetStoryDashboard',state.admin);const t=d.teacher||{};
    const section=document.createElement('section');section.id='storyAdminV87';section.className='card card-pad story-admin-v87';
    const rows=(d.active||[]).map(s=>`<tr><td>@${storyEsc(s.owner)}</td><td>${storyEsc(s.permanent?'Permanente':storyTimeLabel(s))}</td><td>${Number(s.views||0)}</td><td>${storyReactionTotal(s)}</td><td>${s.owner!== 'profe_braian'?`<button class="btn danger" onclick="adminDeactivateStoryV87('${storyAttr(s.id)}')">Ocultar</button>`:'—'}</td></tr>`).join('');
    section.innerHTML=`<h2>Historias</h2><p class="small">Las historias estudiantiles vencen automáticamente a los ${Number(d.ttlMinutes||45)} minutos. Las del docente y bots son permanentes.</p><div class="grid2"><form class="stack" onsubmit="saveTeacherStoryV87(event)"><h3>Historia del docente</h3><div class="field"><label>Título</label><input id="teacherStoryTitle" maxlength="90" value="${storyAttr(t.title||'')}"></div><div class="field"><label>Texto</label><textarea id="teacherStoryText" maxlength="420">${storyEsc(t.text||'')}</textarea></div><div class="row"><div class="field" style="flex:1"><label>Emoji</label><input id="teacherStoryEmoji" maxlength="8" value="${storyAttr(t.emoji||'👨‍💻')}"></div><div class="field" style="flex:1"><label>Fondo</label><input id="teacherStoryBg" type="color" value="${storyAttr(validHex(t.background,'#405DE6'))}"></div><div class="field" style="flex:1"><label>Acento</label><input id="teacherStoryAccent" type="color" value="${storyAttr(validHex(t.accent,'#FF4F8B'))}"></div></div><button class="btn primary">Guardar historia permanente</button></form><div><h3>Registro</h3><p><b>${Number(d.active?.length||0)}</b> historias activas · <b>${Number(d.total||0)}</b> almacenadas.</p><div class="story-audit-v87">${(d.recentAudit||[]).slice(0,12).map(x=>`<div><b>${storyEsc(x.action)}</b> · @${storyEsc(x.actor)}<span>${storyEsc(x.time||'')}</span></div>`).join('')||'<p class="small">Sin actividad todavía.</p>'}</div></div></div><div class="scrollbox"><table class="admin-table"><thead><tr><th>Historia</th><th>Vigencia</th><th>Vistas</th><th>Reacciones</th><th>Acción</th></tr></thead><tbody>${rows}</tbody></table></div>`;
    main.appendChild(section);
  }catch(e){console.warn(e);}
}

g.saveTeacherStoryV87=async function(e){e.preventDefault();try{await rpc('adminUpdateTeacherStory',{title:$('#teacherStoryTitle').value,text:$('#teacherStoryText').value,emoji:$('#teacherStoryEmoji').value,background:$('#teacherStoryBg').value,accent:$('#teacherStoryAccent').value,textColor:'#FFFFFF'},state.admin);toast('Historia docente actualizada');document.getElementById('storyAdminV87')?.remove();await enhanceStoryAdmin();}catch(err){toast(niceErr(err));}};
g.adminDeactivateStoryV87=async function(id){if(!confirm('¿Ocultar esta historia? El registro se conserva.'))return;try{await rpc('adminDeactivateStory',id,state.admin);toast('Historia ocultada');document.getElementById('storyAdminV87')?.remove();await enhanceStoryAdmin();}catch(e){toast(niceErr(e));}};

if(typeof originalRenderAdmin==='function')g.renderAdmin=async function(){const r=await originalRenderAdmin.apply(this,arguments);requestAnimationFrame(()=>enhanceStoryAdmin());return r;};

setInterval(()=>{if(typeof route==='function'&&route()==='home'&&state.gate)hydrateStoriesV87(true);},60000);
document.addEventListener('DOMContentLoaded',()=>ensureStoryModal(),{once:true});
g.AulaGramStoriesV87=Object.freeze({version:V,hydrate:hydrateStoriesV87});
})(window);
