/** Transporte v8.3: GitHub Pages -> POST cross-origin + resultado JSONP.
 *
 * Evita incrustar HtmlService dentro de un iframe de terceros. Apps Script usa su
 * propio sandbox IFRAME; anidar ese sandbox dentro de GitHub puede impedir que
 * postMessage llegue al documento correcto en algunos navegadores.
 */
const AG_RPC_ALLOWED = Object.freeze([
  'enterClass','adminLogin','getClientSnapshot','getBootstrap','getMyState','getHomeViewData','getExploreViewData',
  'getProfileViewData','getActivityViewData','getMessagesViewData','getConversation','getProfileDesign',
  'getAssetsData','publishProfile','recoverIdentity','toggleLike','toggleFollow','addComment','sendMessage',
  'adminGetDashboard','adminUpdateSettings','adminMuteUser','adminDeleteProfile','adminDeleteComment',
  'adminDeleteMessage','adminAddModerationRule','adminRemoveModerationRule','adminClearModerationLog',
  'adminCreateBackup','adminExportMessages','adminResetSocial','adminResetMessages','diagnosticoAulaGramV8'
]);

// Lecturas seguras para una sola ida por JSONP. Las mutaciones siguen exclusivamente por POST.
const AG_RPC_GET_ALLOWED = Object.freeze([
  'getClientSnapshot','getBootstrap','getMyState','getHomeViewData','getExploreViewData','getProfileViewData',
  'getActivityViewData','getMessagesViewData','getConversation','getProfileDesign','getAssetsData'
]);

function validRpcId_(rid) {
  return /^[A-Za-z0-9_-]{12,80}$/.test(String(rid || ''));
}

function validJsonpCallback_(cb) {
  return /^AGCB_[A-Za-z0-9_]{8,100}$/.test(String(cb || ''));
}

function jsonpOutput_(callback, obj) {
  if (!validJsonpCallback_(callback)) {
    return ContentService.createTextOutput('/* callback inválido */')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  const json = JSON.stringify(obj === undefined ? null : obj)
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
  return ContentService.createTextOutput(String(callback) + '(' + json + ');')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function rpcDispatch_(name, args) {
  name = String(name || '');
  if (AG_RPC_ALLOWED.indexOf(name) < 0) throw new Error('Método no permitido: ' + name);
  args = Array.isArray(args) ? args : [];
  const map = {
    enterClass: enterClass,
    adminLogin: adminLogin,
    getClientSnapshot: getClientSnapshot,
    getBootstrap: getBootstrap,
    getMyState: getMyState,
    getHomeViewData: getHomeViewData,
    getExploreViewData: getExploreViewData,
    getProfileViewData: getProfileViewData,
    getActivityViewData: getActivityViewData,
    getMessagesViewData: getMessagesViewData,
    getConversation: getConversation,
    getProfileDesign: getProfileDesign,
    getAssetsData: getAssetsData,
    publishProfile: publishProfile,
    recoverIdentity: recoverIdentity,
    toggleLike: toggleLike,
    toggleFollow: toggleFollow,
    addComment: addComment,
    sendMessage: sendMessage,
    adminGetDashboard: adminGetDashboard,
    adminUpdateSettings: adminUpdateSettings,
    adminMuteUser: adminMuteUser,
    adminDeleteProfile: adminDeleteProfile,
    adminDeleteComment: adminDeleteComment,
    adminDeleteMessage: adminDeleteMessage,
    adminAddModerationRule: adminAddModerationRule,
    adminRemoveModerationRule: adminRemoveModerationRule,
    adminClearModerationLog: adminClearModerationLog,
    adminCreateBackup: adminCreateBackup,
    adminExportMessages: adminExportMessages,
    adminResetSocial: adminResetSocial,
    adminResetMessages: adminResetMessages,
    diagnosticoAulaGramV8: diagnosticoAulaGramV8
  };
  return map[name].apply(null, args);
}

function rpcResultCacheKey_(rid) { return 'AG83_RPC_' + String(rid); }
function rpcResultFilename_(rid) { return '_rpc_' + String(rid) + '.json'; }

function storeRpcResult_(rid, result) {
  if (!validRpcId_(rid)) throw new Error('ID RPC inválido');
  const raw = JSON.stringify(result);
  const cache = CacheService.getScriptCache();
  const key = rpcResultCacheKey_(rid);
  // CacheService es rápido, pero cada valor tiene un tamaño acotado.
  if (raw.length <= 85000) {
    cache.put(key, raw, 120);
    return;
  }
  const folder = systemFolder_();
  const old = folder.getFilesByName(rpcResultFilename_(rid));
  while (old.hasNext()) { try { old.next().setTrashed(true); } catch (e) {} }
  const file = folder.createFile(rpcResultFilename_(rid), raw, MimeType.PLAIN_TEXT);
  cache.put(key, '@FILE:' + file.getId(), 120);
}

function takeRpcResult_(rid) {
  if (!validRpcId_(rid)) return null;
  const cache = CacheService.getScriptCache();
  const key = rpcResultCacheKey_(rid);
  let raw = cache.get(key);
  cache.remove(key);
  if (raw && raw.indexOf('@FILE:') === 0) {
    const id = raw.slice(6);
    try {
      const f = DriveApp.getFileById(id);
      raw = f.getBlob().getDataAsString('UTF-8');
      f.setTrashed(true);
    } catch (e) { raw = null; }
  }
  // Si el puntero de caché expiró antes del primer sondeo, buscar el archivo temporal.
  if (!raw) {
    try {
      const it = systemFolder_().getFilesByName(rpcResultFilename_(rid));
      if (it.hasNext()) {
        const f = it.next();
        raw = f.getBlob().getDataAsString('UTF-8');
        f.setTrashed(true);
      }
    } catch (e) {}
  }
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (e) { return {ok:false,error:'Respuesta RPC dañada'}; }
}

function doPost(e) {
  resetExecJsonCache_();
  const p = (e && e.parameter) || {};
  if (String(p.api || '') !== 'rpc') {
    return ContentService.createTextOutput('AulaGram backend ' + AG.VERSION)
      .setMimeType(ContentService.MimeType.TEXT);
  }
  const rid = String(p.rid || '');
  if (!validRpcId_(rid)) {
    return ContentService.createTextOutput('RID inválido').setMimeType(ContentService.MimeType.TEXT);
  }
  let result;
  try {
    const req = JSON.parse(String(p.payload || '{}'));
    const value = rpcDispatch_(req.name, req.args);
    result = {ok:true,value:value};
  } catch (err) {
    result = {ok:false,error:String(err && err.message ? err.message : err)};
  }
  try { storeRpcResult_(rid, result); }
  catch (storeErr) { /* El cliente agotará timeout y podrá reintentar. */ }
  return ContentService.createTextOutput('OK').setMimeType(ContentService.MimeType.TEXT);
}

function doGet(e) {
  resetExecJsonCache_();
  const p = (e && e.parameter) || {};
  const api = String(p.api || '');
  const cb = String(p.callback || '');
  if (api === 'health') {
    return jsonpOutput_(cb, {
      ok:true,
      version:AG.VERSION,
      architecture:'github-pages + local-first-snapshot + direct-jsonp-read + drive',
      time:nowIso_()
    });
  }
  if (api === 'result') {
    const rid = String(p.rid || '');
    const result = takeRpcResult_(rid);
    return jsonpOutput_(cb, result ? {pending:false,result:result} : {pending:true});
  }
  if (api === 'rpcget') {
    const rpcStarted = Date.now();
    let result;
    try {
      const method = String(p.method || '');
      // v8.4: las lecturas de pantalla viajan en una sola petición JSONP.
      // Ninguna mutación ni función administrativa sensible se permite por GET.
      if (AG_RPC_GET_ALLOWED.indexOf(method) < 0) throw new Error('Método GET no permitido');
      const args = JSON.parse(String(p.args || '[]'));
      result = {ok:true,value:rpcDispatch_(method,args)};
    } catch (err) {
      result = {ok:false,error:String(err && err.message ? err.message : err)};
    }
    return jsonpOutput_(cb,{result:result,serverMs:Date.now()-rpcStarted,version:AG.VERSION});
  }
  const html = '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>AulaGram Backend</title>'+
    '<style>body{font-family:Arial,sans-serif;background:#f7f8fb;color:#202124;padding:28px}.card{max-width:680px;margin:30px auto;background:#fff;border:1px solid #dadce0;border-radius:14px;padding:24px}.ok{color:#087a45;font-weight:800}a{color:#006fc9}</style></head><body><main class="card">'+
    '<h1>AulaGram Backend</h1><p class="ok">● Backend activo · v'+AG.VERSION+'</p><p>La interfaz de clase se abre desde GitHub Pages.</p><p><a href="'+AG.FRONTEND_URL+'" target="_top">Abrir AulaGram</a></p></main></body></html>';
  return HtmlService.createHtmlOutput(html).setTitle('AulaGram Backend ' + AG.VERSION);
}

/** Diagnóstico específico de la arquitectura GitHub Pages + transporte POST/JSONP. */
function diagnosticoAulaGramV8() {
  const base = diagnosticoAulaGramV7();
  return Object.assign({}, base, {
    architecture: 'github-pages + local-first-snapshot + direct-jsonp-read + post-write + drive',
    version: AG.VERSION,
    frontendOrigin: AG.FRONTEND_ORIGIN,
    frontendUrl: AG.FRONTEND_URL,
    bridge: false,
    transport: 'local-first-snapshot+direct-jsonp-read+post-write'
  });
}

function getBootstrap(gateToken, sessionToken, adminToken) {
  requireGate_(gateToken);
  const settings=settings_();
  const meAlias=sessionAlias_(sessionToken||'');
  const profiles=jsonRead_('profiles',{});
  return {
    ok:true,
    version:AG.VERSION,
    className:AG.CLASS_NAME,
    settings:settings,
    me:meAlias&&profiles[meAlias]?publicProfile_(profiles[meAlias],meAlias):null,
    admin:verifySignedToken_(adminToken||'','admin'),
    profileCount:Object.keys(profiles).length,
    botAliases:Object.keys(profiles).filter(function(a){return profiles[a].role==='bot'||profiles[a].role==='official';})
  };
}

function logoutProfile() { return {ok:true}; }

function getMyState(gateToken, sessionToken) {
  requireGate_(gateToken);
  const alias=sessionAlias_(sessionToken||'');
  if(!alias)return {logged:false};
  const profiles=jsonRead_('profiles',{});
  return {logged:true,profile:publicProfile_(profiles[alias],alias),unread:unreadCount_(alias,jsonRead_('messages',[]))};
}
