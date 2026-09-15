/**
 * AulaGram v8 - configuración general.
 * Cambiá CLASS_CODE y ADMIN_PIN antes de desplegar.
 */
const AG = Object.freeze({
  VERSION: '8.7.0',
  ROOT_NAME: 'AulaGram_9no_v8',
  CLASS_CODE: 'CAMBIAR-CODIGO',
  ADMIN_PIN: 'CAMBIAR-PIN',
  TEACHER_ALIAS: 'profe_braian',
  GENERAL_BOT: 'byte_bot',
  SESSION_DAYS: 30,
  GATE_HOURS: 12,
  ADMIN_HOURS: 8,
  MAX_IMAGE_BYTES: 900000,
  MAX_TOTAL_UPLOAD_BYTES: 5000000,
  MAX_IMAGES: 8,
  MAX_MESSAGE_LENGTH: 600,
  MAX_COMMENT_LENGTH: 320,
  MAX_BIO_LENGTH: 260,
  MAX_MODERATION_LOG: 500,
  MODERATION_WINDOW_SECONDS: 300,
  MODERATION_STRIKES: 3,
  MODERATION_COOLDOWN_SECONDS: 120,
  SPAM_WINDOW_SECONDS: 12,
  SPAM_MAX_ACTIONS: 6,
  SPAM_REPEAT_WINDOW_SECONDS: 60,
  SPAM_MAX_REPEAT: 2,
  SPAM_COOLDOWN_SECONDS: 45,
  FEED_LIMIT: 24,
  MESSAGE_LIMIT: 120,
  CLASS_NAME: 'AulaGram · 9.º EBI',
  TIMEZONE: 'America/Montevideo',
  FRONTEND_ORIGIN: 'https://braianm-dev.github.io',
  FRONTEND_URL: 'https://braianm-dev.github.io/aulagram/'
});

const AG_FILES = Object.freeze({
  settings: 'settings.json',
  profiles: 'profiles.json',
  likes: 'likes.json',
  comments: 'comments.json',
  follows: 'follows.json',
  messages: 'messages.json',
  moderationLog: 'moderation_log.json',
  mutedUsers: 'muted_users.json',
  moderationRules: 'moderation_rules.json'
});
function include_(filename){return HtmlService.createHtmlOutputFromFile(filename).getContent();}
function nowIso_(){return Utilities.formatDate(new Date(),AG.TIMEZONE,"yyyy-MM-dd'T'HH:mm:ssXXX");}
function normalizeAlias_(value){let s=String(value||'').trim().toLowerCase();try{s=s.normalize('NFD').replace(/[\u0300-\u036f]/g,'');}catch(e){}return s.replace(/[^a-z0-9_-]/g,'').slice(0,24);}
function cleanText_(value,maxLen){return String(value||'').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,'').replace(/[\u200B-\u200D\uFEFF]/g,'').trim().slice(0,maxLen||1000);}
function randomToken_(){return Utilities.getUuid().replace(/-/g,'')+Utilities.getUuid().replace(/-/g,'');}
function randomRecoveryCode_(){return String(Math.floor(100000+Math.random()*900000));}
function bytesToHex_(bytes){return bytes.map(function(b){const v=(b+256)%256;return ('0'+v.toString(16)).slice(-2);}).join('');}
function sha256_(value){return bytesToHex_(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,String(value),Utilities.Charset.UTF_8));}
function hmac_(value){const secret=getSecret_();return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(String(value),secret,Utilities.Charset.UTF_8)).replace(/=+$/g,'');}
function getSecret_(){const p=PropertiesService.getScriptProperties();let secret=p.getProperty('AG_SECRET');if(!secret){secret=randomToken_();p.setProperty('AG_SECRET',secret);}return secret;}
function makeSignedToken_(kind,hours){const exp=Date.now()+Number(hours||1)*3600000,nonce=Utilities.getUuid().replace(/-/g,'').slice(0,18),body=[kind,exp,nonce].join('.');return body+'.'+hmac_(body);}
function verifySignedToken_(token,kind){const parts=String(token||'').split('.');if(parts.length!==4||parts[0]!==kind)return false;const body=parts.slice(0,3).join('.');if(hmac_(body)!==parts[3])return false;const exp=Number(parts[1]);return Number.isFinite(exp)&&exp>Date.now();}
function folderByNameOrCreate_(parent,name){const it=parent.getFoldersByName(name);return it.hasNext()?it.next():parent.createFolder(name);}
function rootFolder_(){const props=PropertiesService.getScriptProperties(),id=props.getProperty('AG_ROOT_FOLDER_ID');if(id){try{return DriveApp.getFolderById(id);}catch(e){}}const it=DriveApp.getFoldersByName(AG.ROOT_NAME),folder=it.hasNext()?it.next():DriveApp.createFolder(AG.ROOT_NAME);props.setProperty('AG_ROOT_FOLDER_ID',folder.getId());return folder;}
function systemFolder_(){return folderByNameOrCreate_(rootFolder_(),'sistema');}
function profilesFolder_(){return folderByNameOrCreate_(rootFolder_(),'perfiles');}
function backupsFolder_(){return folderByNameOrCreate_(rootFolder_(),'backups');}
function filePropKey_(logical){return 'AG_FILE_'+String(logical).replace(/[^A-Za-z0-9_]/g,'_').toUpperCase();}
function getJsonFile_(logical,createDefault){const props=PropertiesService.getScriptProperties(),key=filePropKey_(logical),id=props.getProperty(key);if(id){try{return DriveApp.getFileById(id);}catch(e){}}const filename=AG_FILES[logical]||logical,folder=systemFolder_(),it=folder.getFilesByName(filename);let file;if(it.hasNext())file=it.next();else file=folder.createFile(filename,JSON.stringify(createDefault===undefined?{}:createDefault,null,2),MimeType.PLAIN_TEXT);props.setProperty(key,file.getId());return file;}
let AG_EXEC_JSON_CACHE_=Object.create(null);
function resetExecJsonCache_(){AG_EXEC_JSON_CACHE_=Object.create(null);}
function hasExecJson_(logical){return Object.prototype.hasOwnProperty.call(AG_EXEC_JSON_CACHE_,logical);}
function jsonCacheKey_(logical){return 'AG7_JSON_'+String(logical||'').replace(/[^A-Za-z0-9_]/g,'_').toUpperCase();}
function jsonCacheRead_(logical){try{const raw=CacheService.getScriptCache().get(jsonCacheKey_(logical));if(raw===null)return {hit:false,data:null};return {hit:true,data:JSON.parse(raw)};}catch(e){return {hit:false,data:null};}}
function jsonCacheWrite_(logical,data){try{const raw=JSON.stringify(data),cache=CacheService.getScriptCache();if(raw.length<=85000)cache.put(jsonCacheKey_(logical),raw,300);else cache.remove(jsonCacheKey_(logical));}catch(e){}}
function jsonReadFresh_(logical,fallback){try{const file=getJsonFile_(logical,fallback),raw=file.getBlob().getDataAsString('UTF-8'),parsed=JSON.parse(raw||'null'),data=parsed===null?fallback:parsed;AG_EXEC_JSON_CACHE_[logical]=data;jsonCacheWrite_(logical,data);return data;}catch(e){AG_EXEC_JSON_CACHE_[logical]=fallback;return fallback;}}
function jsonRead_(logical,fallback){if(hasExecJson_(logical))return AG_EXEC_JSON_CACHE_[logical];const cached=jsonCacheRead_(logical);if(cached.hit){AG_EXEC_JSON_CACHE_[logical]=cached.data;return cached.data;}return jsonReadFresh_(logical,fallback);}
function jsonWrite_(logical,data){const file=getJsonFile_(logical,data);file.setContent(JSON.stringify(data));AG_EXEC_JSON_CACHE_[logical]=data;jsonCacheWrite_(logical,data);return data;}
function jsonMutate_(logical,fallback,fn){const lock=LockService.getScriptLock();lock.waitLock(15000);try{const data=jsonReadFresh_(logical,fallback),result=fn(data);jsonWrite_(logical,data);return result;}finally{lock.releaseLock();}}
function safeJsonClone_(obj){return JSON.parse(JSON.stringify(obj));}
function dataUriFromBlob_(blob){const type=blob.getContentType()||'application/octet-stream';return 'data:'+type+';base64,'+Utilities.base64Encode(blob.getBytes());}
function seedSvg_(label,emoji,c1,c2,subtitle){const esc=function(s){return String(s||'').replace(/[&<>]/g,function(m){return ({'&':'&amp;','<':'&lt;','>':'&gt;'})[m];});};const svg='<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="'+c1+'"/><stop offset="1" stop-color="'+c2+'"/></linearGradient></defs><rect width="900" height="900" rx="90" fill="url(#g)"/><circle cx="450" cy="320" r="185" fill="rgba(255,255,255,.18)"/><text x="450" y="390" text-anchor="middle" font-size="190" font-family="Arial">'+esc(emoji)+'</text><text x="450" y="620" text-anchor="middle" fill="white" font-size="68" font-weight="700" font-family="Arial">'+esc(label)+'</text><text x="450" y="690" text-anchor="middle" fill="white" opacity=".92" font-size="32" font-family="Arial">'+esc(subtitle||'AulaGram')+'</text></svg>';return 'data:image/svg+xml;base64,'+Utilities.base64Encode(svg,Utilities.Charset.UTF_8);}
function getAssetData(assetKey,gateToken){requireGate_(gateToken);const key=String(assetKey||'');if(key.indexOf('data:')===0)return key;if(key.indexOf('student:')!==0)return '';const rest=key.slice(8),sep=rest.indexOf(':');if(sep<1)return '';const alias=normalizeAlias_(rest.slice(0,sep)),path=normalizePath_(rest.slice(sep+1)),profiles=jsonRead_('profiles',{}),p=profiles[alias];if(!p||p.role!=='student')return '';const map=p.imageFiles||{};let id='';imageNameCandidates_(path).some(function(k){if(map[k]){id=map[k];return true;}return false;});if(!id)return '';try{return dataUriFromBlob_(DriveApp.getFileById(id).getBlob());}catch(e){return '';}}
function getAssetsData(assetKeys,gateToken){requireGate_(gateToken);const keys=Array.from(new Set((assetKeys||[]).map(String))).slice(0,24),out={};keys.forEach(function(key){try{out[key]=getAssetData(key,gateToken)||'';}catch(e){out[key]='';}});return out;}
function securitySetting_(name,fallback){try{const v=PropertiesService.getScriptProperties().getProperty(name);if(v!=null&&String(v).trim())return String(v).trim();}catch(e){}return String(fallback||'').trim();}
function configurarAulaGramSeguridad(classCode,adminPin){classCode=cleanText_(classCode,64);adminPin=cleanText_(adminPin,64);if(classCode.length<6)throw new Error('El código de clase debe tener al menos 6 caracteres.');if(adminPin.length<8)throw new Error('El PIN docente debe tener al menos 8 caracteres.');PropertiesService.getScriptProperties().setProperties({CLASS_CODE:classCode,ADMIN_PIN:adminPin},false);return {ok:true,message:'Credenciales guardadas en Propiedades del script. No las publiques en GitHub.'};}
function enterClass(classCode){const ok=String(classCode||'').trim()===securitySetting_('CLASS_CODE',AG.CLASS_CODE);if(!ok)return {ok:false,message:'El código de clase no es correcto.'};return {ok:true,gateToken:makeSignedToken_('gate',AG.GATE_HOURS),className:AG.CLASS_NAME,version:AG.VERSION};}
function requireGate_(token){if(!verifySignedToken_(token,'gate'))throw new Error('Sesión de clase vencida. Volvé a ingresar el código de clase.');}
function adminLogin(pin){if(String(pin||'')!==securitySetting_('ADMIN_PIN',AG.ADMIN_PIN))return {ok:false,message:'PIN docente incorrecto.'};const adminToken=makeSignedToken_('admin',AG.ADMIN_HOURS),teacherSession=issueProfileSession_(AG.TEACHER_ALIAS);return {ok:true,adminToken:adminToken,sessionToken:teacherSession,gateToken:makeSignedToken_('gate',AG.GATE_HOURS),alias:AG.TEACHER_ALIAS};}
function requireAdmin_(token){if(!verifySignedToken_(token,'admin'))throw new Error('Sesión docente vencida. Volvé a ingresar el PIN.');}
function issueProfileSession_(alias){const token=randomToken_();jsonMutate_('profiles',{},function(profiles){if(!profiles[alias])throw new Error('Perfil inexistente.');profiles[alias].tokenHash=sha256_(token);profiles[alias].sessionIssued=nowIso_();});return token;}
function sessionAlias_(token){const hash=sha256_(String(token||''));if(!token)return '';const profiles=jsonRead_('profiles',{}),aliases=Object.keys(profiles);for(let i=0;i<aliases.length;i++){const p=profiles[aliases[i]]||{};if(p.tokenHash&&p.tokenHash===hash)return aliases[i];}return '';}
function requireUser_(token){const alias=sessionAlias_(token);if(!alias)throw new Error('No hay una identidad activa. Publicá o recuperá tu perfil.');return alias;}
