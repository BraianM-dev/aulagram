/**
 * AulaGram v8.7 · Historias educativas.
 * - Estudiantes: vencen a los 45 minutos.
 * - Docente, cuenta oficial y bots: permanentes.
 * - Vistas y reacciones quedan registradas en JSON privados de Drive.
 */
const AG_STORY = Object.freeze({
  STUDENT_TTL_MINUTES: 45,
  MAX_TITLE: 90,
  MAX_TEXT: 420,
  MAX_AUDIT: 5000,
  MAX_STORIES: 1600,
  REACTIONS: ['❤️','👏','🔥','💡','👍'],
  TEACHER_STORY_ID: 'story-permanent-' + AG.TEACHER_ALIAS
});

function storyJson_(name, fallback) { return jsonRead_('stories_v87_' + name + '.json', fallback); }
function storyMutate_(name, fallback, fn) { return jsonMutate_('stories_v87_' + name + '.json', fallback, fn); }
function storyColor_(value, fallback) { const v=String(value||'').trim(); return /^#[0-9a-fA-F]{6}$/.test(v)?v.toUpperCase():fallback; }
function storyEmoji_(value, fallback) { const v=cleanText_(value||'',12); return v||fallback||'✨'; }
function storyActive_(story) { if(!story||story.active===false)return false;if(story.permanent)return true;const exp=Date.parse(String(story.expiresAt||''));return Number.isFinite(exp)&&exp>Date.now(); }
function storyRoleRank_(role) { return role==='teacher'?0:role==='official'?1:role==='bot'?2:3; }

function storyReactionSummary_(storyId, viewer) {
  const all=storyJson_('reactions',{}),map=all[storyId]||{},counts={};
  AG_STORY.REACTIONS.forEach(function(r){counts[r]=0;});
  Object.keys(map).forEach(function(alias){const r=map[alias];if(Object.prototype.hasOwnProperty.call(counts,r))counts[r]++;});
  return {counts:counts,myReaction:viewer?(map[viewer]||''):''};
}

function storyAudit_(actor, action, story, detail) {
  const ev={id:Utilities.getUuid(),time:nowIso_(),actor:cleanText_(actor||'guest',32),action:cleanText_(action||'',40),storyId:story&&story.id?story.id:'',owner:story&&story.owner?story.owner:'',detail:cleanText_(detail||'',120)};
  storyMutate_('audit',[],function(list){list.push(ev);if(list.length>AG_STORY.MAX_AUDIT)list.splice(0,list.length-AG_STORY.MAX_AUDIT);});
  return ev;
}

function permanentStoryDefaults_() {
  return [
    {owner:'profe_braian',title:'Bienvenidos a la clase',text:'Durante estos 45 minutos construimos, probamos y explicamos. Si algo falla, el error deja pistas: observá, cambiá una cosa y volvé a probar.',emoji:'👨‍💻',background:'#405DE6',textColor:'#FFFFFF',accent:'#FF4F8B'},
    {owner:'aulagram',title:'Tu código · Tu perfil · Tu comunidad',text:'AulaGram es un espacio educativo. Usá alias, cuidá tus datos personales y recordá que likes y seguidores no forman parte de la evaluación.',emoji:'📱',background:'#006FC9',textColor:'#FFFFFF',accent:'#FF4F8B'},
    {owner:'byte_bot',title:'Preguntame y probá',text:'Puedo ayudarte con web, programación, redes, seguridad, hardware, datos e IA. Una pista sirve más cuando después la comprobás.',emoji:'🤖',background:'#00897B',textColor:'#FFFFFF',accent:'#B2DFDB'},
    {owner:'html_bot',title:'HTML da estructura',text:'Etiquetas, atributos, imágenes, enlaces y semántica: preguntame por cualquiera de esos temas.',emoji:'🧱',background:'#E44D26',textColor:'#FFFFFF',accent:'#FFD8CC'},
    {owner:'css_bot',title:'CSS toma decisiones visuales',text:'Color, caja, Flexbox, Grid, responsive y animaciones. Probá cambiar una propiedad y observá la huella.',emoji:'🎨',background:'#1572B6',textColor:'#FFFFFF',accent:'#9AD8F5'},
    {owner:'js_bot',title:'JavaScript agrega comportamiento',text:'DOM, eventos, variables, funciones, arrays, JSON, localStorage y fetch. Elegí un tema y preguntame.',emoji:'⚡',background:'#F7DF1E',textColor:'#202124',accent:'#323330'},
    {owner:'python_bot',title:'Python: pensá en pasos',text:'Variables, input/print, condicionales, bucles, listas y funciones. Dividí el problema antes de escribir mucho código.',emoji:'🐍',background:'#3776AB',textColor:'#FFFFFF',accent:'#FFD343'},
    {owner:'ia_bot',title:'IA no significa verdad',text:'LLM, prompts, RAG, sesgos, deepfakes y verificación. Una respuesta convincente también puede equivocarse.',emoji:'🧠',background:'#5E35B1',textColor:'#FFFFFF',accent:'#00ACC1'},
    {owner:'a11y_bot',title:'Diseñá sin barreras',text:'Probá teclado, foco, contraste, alt, zoom al 200 % y movimiento reducido. La accesibilidad se piensa desde el inicio.',emoji:'♿',background:'#1565C0',textColor:'#FFFFFF',accent:'#66BB6A'},
    {owner:'lan_bot',title:'Seguí el camino de los datos',text:'LAN, IP, DNS, DHCP, router, switch, HTTP y cliente/servidor. Cada salto de una petición deja pistas.',emoji:'🌐',background:'#00838F',textColor:'#FFFFFF',accent:'#7986CB'}
  ];
}

function ensureStorySeeds_() {
  const profiles=jsonRead_('profiles',{}),defaults=permanentStoryDefaults_(),current=storyJson_('stories',[]),ids={};
  current.forEach(function(s){ids[s.id]=true;});
  const missing=defaults.some(function(d){return !ids['story-permanent-'+d.owner];});
  if(!missing)return current;
  return storyMutate_('stories',[],function(list){
    const existing={};list.forEach(function(s){existing[s.id]=true;});
    defaults.forEach(function(d){const id='story-permanent-'+d.owner;if(existing[id]||!profiles[d.owner])return;list.push({id:id,owner:d.owner,permanent:true,active:true,title:d.title,text:d.text,emoji:d.emoji,background:d.background,textColor:d.textColor,accent:d.accent,imageFileId:'',created:nowIso_(),updated:nowIso_(),expiresAt:'',views:0});});
    return safeJsonClone_(list);
  });
}

function setupHistoriasV87() { const stories=ensureStorySeeds_();storyJson_('reactions',{});storyJson_('audit',[]);return {ok:true,version:AG.VERSION,permanent:stories.filter(function(s){return s.permanent;}).length,studentTtlMinutes:AG_STORY.STUDENT_TTL_MINUTES}; }

function storyPublic_(story, viewer) {
  const profiles=jsonRead_('profiles',{}),p=profiles[story.owner]||{display:story.owner,role:'student'},reactions=storyReactionSummary_(story.id,viewer),expires=story.permanent?null:Date.parse(String(story.expiresAt||''));
  return {id:story.id,owner:story.owner,display:p.display||story.owner,role:p.role||'student',avatarAsset:p.avatarAsset||(p.avatarPath?'student:'+story.owner+':'+p.avatarPath:''),title:story.title||'',text:story.text||'',emoji:story.emoji||'✨',background:story.background||'#405DE6',textColor:story.textColor||'#FFFFFF',accent:story.accent||'#FF4F8B',permanent:!!story.permanent,expiresAt:story.expiresAt||'',remainingSeconds:story.permanent?null:Math.max(0,Math.floor((expires-Date.now())/1000)),views:Number(story.views||0),reactionCounts:reactions.counts,myReaction:reactions.myReaction,hasImage:!!story.imageFileId,updated:story.updated||story.created||''};
}

function getActiveStories(gateToken, sessionToken) {
  requireGate_(gateToken);const viewer=sessionAlias_(sessionToken||''),profiles=jsonRead_('profiles',{});
  const stories=ensureStorySeeds_().filter(function(s){return storyActive_(s)&&!!profiles[s.owner];});
  stories.sort(function(a,b){const ar=storyRoleRank_((profiles[a.owner]||{}).role||'student'),br=storyRoleRank_((profiles[b.owner]||{}).role||'student');return ar-br||String(b.updated||b.created||'').localeCompare(String(a.updated||a.created||''));});
  return {ok:true,ttlMinutes:AG_STORY.STUDENT_TTL_MINUTES,stories:stories.map(function(s){return storyPublic_(s,viewer);})};
}

function storyById_(storyId, requireActive) { const stories=ensureStorySeeds_(),s=stories.find(function(x){return x.id===String(storyId||'');});if(!s)throw new Error('Historia inexistente.');if(requireActive&&!storyActive_(s))throw new Error('Esta historia ya venció.');return s; }
function getStoryDetail(storyId, gateToken, sessionToken) { requireGate_(gateToken);const viewer=sessionAlias_(sessionToken||'');return {ok:true,story:storyPublic_(storyById_(storyId,true),viewer),reactions:AG_STORY.REACTIONS.slice()}; }
function getStoryImageData(storyId, gateToken) { requireGate_(gateToken);const story=storyById_(storyId,true);if(!story.imageFileId)return {ok:true,data:''};try{return {ok:true,data:dataUriFromBlob_(DriveApp.getFileById(story.imageFileId).getBlob())};}catch(e){return {ok:true,data:''};} }

function registerStoryView(storyId, gateToken, sessionToken) {
  requireGate_(gateToken);const actor=sessionAlias_(sessionToken||'')||'guest';let updated=null;
  storyMutate_('stories',[],function(list){const s=list.find(function(x){return x.id===String(storyId||'');});if(!s||!storyActive_(s))throw new Error('Esta historia ya no está disponible.');s.views=Number(s.views||0)+1;s.lastViewedAt=nowIso_();updated=safeJsonClone_(s);});
  storyAudit_(actor,'view',updated,'');return {ok:true,views:updated.views};
}

function reactStory(storyId, reaction, gateToken, sessionToken) {
  requireGate_(gateToken);requireActive_();const actor=requireUser_(sessionToken),story=storyById_(storyId,true);reaction=String(reaction||'');
  if(AG_STORY.REACTIONS.indexOf(reaction)<0)throw new Error('Reacción no permitida.');const block=moderationBlockReason_(actor);if(block)throw new Error(block);
  const result=storyMutate_('reactions',{},function(all){all[story.id]=all[story.id]||{};const old=all[story.id][actor]||'';if(old===reaction)delete all[story.id][actor];else all[story.id][actor]=reaction;return {active:old!==reaction,reaction:old===reaction?'':reaction};});
  storyAudit_(actor,result.active?'reaction':'reaction_removed',story,result.reaction||reaction);const summary=storyReactionSummary_(story.id,actor);return {ok:true,myReaction:summary.myReaction,reactionCounts:summary.counts};
}

function decodeStoryImage_(img) { if(!img||!img.base64)return null;return decodeUploadImage_(img); }

function publishStudentStory(payload) {
  payload=payload||{};requireGate_(payload.gateToken);requireActive_();const alias=requireUser_(payload.sessionToken),profiles=jsonRead_('profiles',{}),profile=profiles[alias];
  if(!profile||profile.role!=='student')throw new Error('Solo los perfiles estudiantiles publican historias temporales.');const block=moderationBlockReason_(alias);if(block)throw new Error(block);
  const title=cleanText_(payload.title||'Mi historia',AG_STORY.MAX_TITLE),text=cleanText_(payload.text||'',AG_STORY.MAX_TEXT);if(!title||!text)return {ok:false,reason:'La historia necesita título y texto.'};
  const safe=moderateText_(title+' '+text,alias,'aulagram','story');if(!safe.ok){recordModeration_(alias,'aulagram','historia',safe);return safe;}const spam=checkSpam_(alias,'historia',title+' '+text);if(!spam.ok){recordModeration_(alias,'aulagram','historia',spam);return spam;}
  let imageFileId='';const blob=decodeStoryImage_(payload.image);if(blob){let folder=null;try{folder=profile.folderId?DriveApp.getFolderById(profile.folderId):null;}catch(e){}if(!folder)folder=folderByNameOrCreate_(profilesFolder_(),alias);const ext=blob.getContentType()==='image/png'?'.png':blob.getContentType()==='image/webp'?'.webp':'.jpg';const storyFile=folder.createFile(blob.copyBlob().setName('historia_'+Date.now()+ext));imageFileId=storyFile.getId();}
  const created=nowIso_(),expiresAt=new Date(Date.now()+AG_STORY.STUDENT_TTL_MINUTES*60000).toISOString();
  const story={id:'story-'+alias+'-'+Date.now(),owner:alias,permanent:false,active:true,title:title,text:text,emoji:storyEmoji_(payload.emoji,'✨'),background:storyColor_(payload.background,'#405DE6'),textColor:storyColor_(payload.textColor,'#FFFFFF'),accent:storyColor_(payload.accent,'#FF4F8B'),imageFileId:imageFileId,created:created,updated:created,expiresAt:expiresAt,views:0};
  storyMutate_('stories',[],function(list){list.forEach(function(s){if(s.owner===alias&&!s.permanent&&storyActive_(s)){s.active=false;s.supersededAt=created;}});list.push(story);if(list.length>AG_STORY.MAX_STORIES)list.splice(0,list.length-AG_STORY.MAX_STORIES);});
  storyAudit_(alias,'publish',story,'vence en '+AG_STORY.STUDENT_TTL_MINUTES+' min');return {ok:true,story:storyPublic_(story,alias),message:'Historia publicada por '+AG_STORY.STUDENT_TTL_MINUTES+' minutos.'};
}

function adminGetStoryDashboard(adminToken) { requireAdmin_(adminToken);const stories=ensureStorySeeds_(),audit=storyJson_('audit',[]),active=stories.filter(storyActive_).map(function(s){return storyPublic_(s,AG.TEACHER_ALIAS);}),teacher=active.find(function(s){return s.id===AG_STORY.TEACHER_STORY_ID;})||null;return {ok:true,teacher:teacher,active:active,total:stories.length,recentAudit:audit.slice(-120).reverse(),ttlMinutes:AG_STORY.STUDENT_TTL_MINUTES}; }

function adminUpdateTeacherStory(payload, adminToken) {
  requireAdmin_(adminToken);payload=payload||{};ensureStorySeeds_();let updated=null;
  storyMutate_('stories',[],function(list){let s=list.find(function(x){return x.id===AG_STORY.TEACHER_STORY_ID;});if(!s){const d=permanentStoryDefaults_()[0];s={id:AG_STORY.TEACHER_STORY_ID,owner:AG.TEACHER_ALIAS,permanent:true,active:true,created:nowIso_(),views:0};Object.assign(s,d);list.push(s);}s.title=cleanText_(payload.title||s.title,AG_STORY.MAX_TITLE);s.text=cleanText_(payload.text||s.text,AG_STORY.MAX_TEXT);s.emoji=storyEmoji_(payload.emoji,s.emoji||'👨‍💻');s.background=storyColor_(payload.background,s.background||'#405DE6');s.textColor=storyColor_(payload.textColor,s.textColor||'#FFFFFF');s.accent=storyColor_(payload.accent,s.accent||'#FF4F8B');s.permanent=true;s.active=true;s.expiresAt='';s.updated=nowIso_();updated=safeJsonClone_(s);});
  storyAudit_(AG.TEACHER_ALIAS,'teacher_update',updated,'');return {ok:true,story:storyPublic_(updated,AG.TEACHER_ALIAS)};
}

function adminDeactivateStory(storyId, adminToken) {
  requireAdmin_(adminToken);if(String(storyId||'')===AG_STORY.TEACHER_STORY_ID)throw new Error('La historia docente es permanente. Editala en lugar de desactivarla.');let changed=null;
  storyMutate_('stories',[],function(list){const s=list.find(function(x){return x.id===String(storyId||'');});if(!s)throw new Error('Historia inexistente.');s.active=false;s.deactivatedAt=nowIso_();changed=safeJsonClone_(s);});storyAudit_(AG.TEACHER_ALIAS,'admin_deactivate',changed,'');return {ok:true};
}
