/** Panel docente: configuración, moderación, limpieza y respaldo. */
function adminGetDashboard(adminToken) {
  requireAdmin_(adminToken);
  const profiles=jsonRead_('profiles',{}), settings=settings_(), comments=jsonRead_('comments',[]), messages=jsonRead_('messages',[]), log=jsonRead_('moderationLog',[]), muted=jsonRead_('mutedUsers',{}), rules=jsonRead_('moderationRules',defaultModerationRules_());
  return {
    settings:settings,
    counts:{profiles:Object.keys(profiles).length,students:Object.keys(profiles).filter(function(a){return profiles[a].role==='student';}).length,comments:comments.length,messages:messages.length,moderation:log.length},
    profiles:Object.keys(profiles).map(function(a){return {alias:a,display:profiles[a].display||a,role:profiles[a].role,muted:!!(mutedStatus_(a).muted),updated:profiles[a].updated||profiles[a].created||''};}).sort(function(a,b){return a.alias.localeCompare(b.alias);}),
    recentComments:comments.slice(-80).reverse(),
    recentMessages:messages.slice(-120).reverse(),
    moderationLog:log.slice(-120).reverse(),
    rules:{strong:(rules.strong||[]).slice().sort(),context:(rules.context||[]).slice().sort()}
  };
}

function adminUpdateSettings(patch, adminToken) {
  requireAdmin_(adminToken);
  const allowed=['active','publishingOpen','socialOpen','commentsOpen','messagesOpen'];
  return jsonMutate_('settings', defaultSettings_(), function(s){
    allowed.forEach(function(k){if(Object.prototype.hasOwnProperty.call(patch||{},k))s[k]=!!patch[k];});
    s.updated=nowIso_();
    return {ok:true,settings:s};
  });
}

function adminDeleteComment(id, adminToken) {
  requireAdmin_(adminToken);
  jsonMutate_('comments', [], function(list){for(let i=list.length-1;i>=0;i--)if(list[i].id===id)list.splice(i,1);});
  return {ok:true};
}

function adminDeleteMessage(id, adminToken) {
  requireAdmin_(adminToken);
  jsonMutate_('messages', [], function(list){for(let i=list.length-1;i>=0;i--)if(list[i].id===id)list.splice(i,1);});
  return {ok:true};
}

function adminResetSocial(adminToken) {
  requireAdmin_(adminToken);
  const profiles=jsonRead_('profiles',{}), seed=seedSocial_(profiles);
  jsonWrite_('likes',seed.likes);jsonWrite_('comments',seed.comments);jsonWrite_('follows',seed.follows);
  Object.keys(profiles).forEach(function(a){if(profiles[a].role==='student')onboardStudent_(a,profiles[a],profiles[a].cssFeatures&&profiles[a].cssFeatures.hover?':hover':'');});
  return {ok:true};
}

function adminResetMessages(adminToken) {
  requireAdmin_(adminToken);
  jsonWrite_('messages',[]);
  const profiles=jsonRead_('profiles',{});
  Object.keys(profiles).forEach(function(a){if(profiles[a].role==='student')appendMessage_('byte_bot',a,'¡Hola de nuevo @'+a+'! La mensajería se reinició. Escribí “menú” para ver mis temas.',false);});
  return {ok:true};
}

function adminCreateBackup(adminToken) {
  requireAdmin_(adminToken);
  const folder=backupsFolder_().createFolder('backup_'+Utilities.formatDate(new Date(),AG.TIMEZONE,'yyyyMMdd_HHmmss'));
  Object.keys(AG_FILES).forEach(function(logical){
    try{const f=getJsonFile_(logical,{});f.makeCopy(f.getName(),folder);}catch(e){}
  });
  folder.createFile('LEEME.txt','Respaldo de archivos JSON de AulaGram v8. Creado: '+nowIso_(),MimeType.PLAIN_TEXT);
  return {ok:true,folderId:folder.getId(),name:folder.getName()};
}

/** Reinstalación/recuperación manual (ejecutar SOLO desde el editor de Apps Script).
 * Permite vincular un proyecto nuevo con una carpeta AulaGram existente sin compartirla.
 */
function vincularCarpetaAulaGramV83(rootFolderId) {
  const folder = DriveApp.getFolderById(String(rootFolderId || '').trim());
  const props = PropertiesService.getScriptProperties();
  props.setProperty('AG_ROOT_FOLDER_ID', folder.getId());
  Object.keys(AG_FILES).forEach(function(logical){ props.deleteProperty(filePropKey_(logical)); });
  try { CacheService.getScriptCache().removeAll(Object.keys(AG_FILES).map(jsonCacheKey_)); } catch (e) {}
  const setup = setupAulaGramV7();
  return {ok:true,rootFolderId:folder.getId(),rootName:folder.getName(),setup:setup};
}

/** Restaura los JSON desde una carpeta creada por "Crear respaldo completo".
 * Por seguridad deja AulaGram pausada luego de restaurar; el docente la reactiva desde el panel.
 */
function restaurarBackupAulaGramV83(backupFolderId) {
  const folder = DriveApp.getFolderById(String(backupFolderId || '').trim());
  const restored = [];
  Object.keys(AG_FILES).forEach(function(logical){
    const filename = AG_FILES[logical];
    const it = folder.getFilesByName(filename);
    if (!it.hasNext()) return;
    const source = it.next();
    const data = JSON.parse(source.getBlob().getDataAsString('UTF-8') || 'null');
    jsonWrite_(logical, data);
    restored.push(filename);
  });
  if (!restored.length) throw new Error('La carpeta indicada no contiene archivos JSON de respaldo de AulaGram.');
  const settings = jsonRead_('settings', defaultSettings_());
  settings.version = AG.VERSION;
  settings.active = false;
  jsonWrite_('settings', settings);
  return {ok:true,restored:restored,version:AG.VERSION,active:false,message:'Respaldo restaurado. AulaGram quedó pausada por seguridad.'};
}

function obtenerIdCarpetaAulaGramV83() {
  const folder = rootFolder_();
  return {ok:true,id:folder.getId(),name:folder.getName(),url:'https://drive.google.com/drive/folders/'+folder.getId()};
}

function csvCell_(value) {
  const v = String(value === undefined || value === null ? '' : value).replace(/\r?\n/g, ' ');
  return '"' + v.replace(/"/g, '""') + '"';
}

function adminExportMessages(adminToken) {
  requireAdmin_(adminToken);
  const messages = jsonRead_('messages', []);
  const stamp = Utilities.formatDate(new Date(), AG.TIMEZONE, 'yyyyMMdd_HHmmss');
  const folder = backupsFolder_().createFolder('mensajes_' + stamp);
  const rows = [['id','fecha','de','para','mensaje','leido']];
  messages.forEach(function(m){ rows.push([m.id||'',m.time||'',m.from||'',m.to||'',m.text||'',m.read?'si':'no']); });
  const csv = '\uFEFF' + rows.map(function(r){ return r.map(csvCell_).join(','); }).join('\r\n');
  const csvName = 'AulaGram_mensajes_' + stamp + '.csv';
  const jsonName = 'AulaGram_mensajes_' + stamp + '.json';
  const csvFile = folder.createFile(csvName, csv, 'text/csv');
  const jsonFile = folder.createFile(jsonName, JSON.stringify(messages, null, 2), MimeType.PLAIN_TEXT);
  folder.createFile('LEEME.txt', 'Exportación privada de mensajes aceptados de AulaGram. Creada: ' + nowIso_() + '\nTotal: ' + messages.length + '\nLos intentos bloqueados por moderación no guardan el texto completo.', MimeType.PLAIN_TEXT);
  return {
    ok:true,
    count:messages.length,
    csvName:csvName,
    jsonName:jsonName,
    csvUrl:'https://drive.google.com/uc?export=download&id=' + csvFile.getId(),
    jsonUrl:'https://drive.google.com/uc?export=download&id=' + jsonFile.getId(),
    folderUrl:'https://drive.google.com/drive/folders/' + folder.getId()
  };
}

function adminRemoveModerationRule(kind, term, adminToken) {
  requireAdmin_(adminToken);kind=kind==='context'?'context':'strong';
  const target=moderationAscii_(term);
  jsonMutate_('moderationRules',defaultModerationRules_(),function(r){r[kind]=(r[kind]||[]).filter(function(x){return moderationAscii_(x)!==target;});});
  return {ok:true};
}
