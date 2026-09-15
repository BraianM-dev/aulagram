/** Publicación, validación, perfiles y recuperación. */
function stripTags_(html) {
  return String(html || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ').trim();
}

function classInner_(html, className) {
  const re = new RegExp('<([a-z0-9]+)\\b[^>]*class\\s*=\\s*(["\\\'])[^"\\\']*\\b' + className.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + '\\b[^"\\\']*\\2[^>]*>([\\s\\S]*?)<\\/\\1>', 'i');
  const m = String(html || '').match(re);
  return m ? m[3] : '';
}

function attr_(tag, name) {
  const re = new RegExp('\\b' + name + '\\s*=\\s*(["\\\'])([\\s\\S]*?)\\1', 'i');
  const m = String(tag || '').match(re);
  return m ? m[2].trim() : '';
}

function firstTagWithClass_(html, className, tagName) {
  const tag = tagName || '[a-z0-9]+';
  const re = new RegExp('<' + tag + '\\b[^>]*class\\s*=\\s*(["\\\'])[^"\\\']*\\b' + className.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + '\\b[^"\\\']*\\1[^>]*>', 'i');
  const m = String(html || '').match(re);
  return m ? m[0] : '';
}

function sanitizeCss_(css) {
  let out = String(css || '').slice(0, 180000);
  out = out.replace(/@import[\s\S]*?;/gi, '/* @import bloqueado por AulaGram */');
  out = out.replace(/expression\s*\([^)]*\)/gi, '');
  out = out.replace(/url\s*\(\s*["']?https?:[^)]*\)/gi, 'none');
  out = out.replace(/javascript\s*:/gi, '');
  out = out.replace(/-moz-binding\s*:[^;]+;/gi, '');
  return out;
}

function sanitizeStudentHtml_(html) {
  let out = String(html || '').slice(0, 220000);
  out = out.replace(/<script\b[\s\S]*?<\/script>/gi, '');
  out = out.replace(/<iframe\b[\s\S]*?<\/iframe>/gi, '');
  out = out.replace(/<object\b[\s\S]*?<\/object>/gi, '');
  out = out.replace(/<embed\b[^>]*>/gi, '');
  out = out.replace(/<\/?(?:form|input|textarea|button|video|audio|source|canvas|svg|math)\b[^>]*>/gi, '');
  out = out.replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*')/gi, '');
  out = out.replace(/\s+srcset\s*=\s*("[^"]*"|'[^']*')/gi, '');
  out = out.replace(/javascript\s*:/gi, '');
  out = out.replace(/<meta\b[^>]*http-equiv\s*=\s*(["'])?refresh\1?[^>]*>/gi, '');
  out = out.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, function(_, css){ return '<style>' + sanitizeCss_(css) + '</style>'; });
  return out;
}

function normalizePath_(p) {
  let s = String(p || '').replace(/\\/g, '/').replace(/^\.\//, '');
  while (s.indexOf('../') >= 0) s = s.replace('../','');
  return s.replace(/^\/+/, '').slice(0, 180);
}

function imageNameCandidates_(path) {
  const p = normalizePath_(path);
  const base = p.split('/').pop();
  return [p, base, 'imagenes/' + base];
}

function parseStudentProfile_(alias, html, imageFiles, publishedAt) {
  const display = cleanText_(stripTags_(classInner_(html, 'nombre-usuario')) || alias, 60);
  const bio = cleanText_(stripTags_(classInner_(html, 'biografia')), AG.MAX_BIO_LENGTH);
  const avatarTag = firstTagWithClass_(html, 'foto-perfil', 'img');
  const avatarPath = normalizePath_(attr_(avatarTag, 'src'));
  const posts = [];
  const postRe = /<article\b[^>]*class\s*=\s*(["'])[^"']*\bpublicacion\b[^"']*\1[^>]*>([\s\S]*?)<\/article>/gi;
  let m, index = 0;
  while ((m = postRe.exec(html)) !== null && index < 12) {
    index++;
    const body = m[2];
    const imgMatch = body.match(/<img\b[^>]*>/i);
    const imgTag = imgMatch ? imgMatch[0] : '';
    const imagePath = normalizePath_(attr_(imgTag,'src'));
    const alt = cleanText_(attr_(imgTag,'alt'), 180);
    const titleMatch = body.match(/<h[23]\b[^>]*>([\s\S]*?)<\/h[23]>/i);
    const pMatch = body.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i);
    posts.push({
      id: alias + '-post' + index,
      title: cleanText_(stripTags_(titleMatch ? titleMatch[1] : ''), 90),
      text: cleanText_(stripTags_(pMatch ? pMatch[1] : ''), 360),
      alt: alt,
      imagePath: imagePath,
      imageAsset: 'student:' + alias + ':' + imagePath,
      time: publishedAt || nowIso_()
    });
  }
  return {
    display: display,
    bio: bio,
    avatarPath: avatarPath,
    avatarAsset: 'student:' + alias + ':' + avatarPath,
    posts: posts
  };
}

function validateStudentFiles_(alias, html, css, uploadedImages) {
  const issues = [], warnings = [];
  if (!/^([a-z0-9_-]{3,24})$/.test(alias)) issues.push('El alias debe tener entre 3 y 24 caracteres y usar letras minúsculas, números, _ o -.');
  if (!/<title\b[^>]*>[\s\S]*?<\/title>/i.test(html)) issues.push('Falta <title>.');
  if (!/<h1\b[^>]*>[\s\S]*?<\/h1>/i.test(html)) issues.push('Falta al menos un <h1>.');
  if (!stripTags_(classInner_(html,'nombre-usuario'))) issues.push('Falta el alias visible con class="nombre-usuario".');
  if (!stripTags_(classInner_(html,'biografia'))) issues.push('Falta una biografía con class="biografia".');
  if (!firstTagWithClass_(html,'foto-perfil','img')) issues.push('Falta la foto con class="foto-perfil".');
  if (!/<link\b[^>]*rel\s*=\s*(["'])stylesheet\1[^>]*href\s*=\s*(["'])estilo\.css\2/i.test(html) &&
      !/<link\b[^>]*href\s*=\s*(["'])estilo\.css\1[^>]*rel\s*=\s*(["'])stylesheet\2/i.test(html)) {
    issues.push('Falta enlazar estilo.css con <link rel="stylesheet" href="estilo.css">.');
  }
  if (/<script\b/i.test(html) || /\son[a-z]+\s*=/i.test(html)) warnings.push('Se encontró JavaScript o manejadores de eventos: AulaGram los elimina por seguridad.');
  if (/https?:\/\/[^\s"']+\.(?:png|jpe?g|webp|gif|svg)/i.test(html)) issues.push('Las imágenes deben ser archivos locales, no URLs externas.');

  const imageMap = {};
  (uploadedImages || []).forEach(function(img){
    imageNameCandidates_(img.name).forEach(function(k){ imageMap[k] = true; });
  });
  const imgs = String(html).match(/<img\b[^>]*>/gi) || [];
  if (!imgs.length) issues.push('Falta al menos una imagen.');
  imgs.forEach(function(tag){
    const src = normalizePath_(attr_(tag,'src'));
    const alt = cleanText_(attr_(tag,'alt'), 200);
    if (alt.length < 5) issues.push('Todas las imágenes deben tener un alt descriptivo.');
    if (/^(?:https?:)?\/\//i.test(src) || /^data:/i.test(src)) issues.push('Las imágenes del trabajo deben subirse como archivos locales.');
    if (src && !imageNameCandidates_(src).some(function(k){ return imageMap[k]; })) issues.push('No se encontró el archivo usado en <img src="' + src + '">.');
  });
  const posts = String(html).match(/<article\b[^>]*class\s*=\s*(["'])[^"']*\bpublicacion\b[^"']*\1[^>]*>[\s\S]*?<\/article>/gi) || [];
  if (posts.length < 2) issues.push('Necesitás al menos 2 <article class="publicacion">.');
  posts.forEach(function(post){
    if (!/<img\b/i.test(post) || !/<h[23]\b/i.test(post) || !/<p\b/i.test(post)) issues.push('Cada publicación debe incluir imagen, título h2/h3 y párrafo.');
  });
  if (String(css || '').trim().length < 80) issues.push('estilo.css está demasiado vacío: personalizá el diseño.');
  return {ok: issues.length === 0, issues: Array.from(new Set(issues)), warnings: Array.from(new Set(warnings))};
}

function decodeUploadImage_(img) {
  const allowed = ['image/png','image/jpeg','image/webp'];
  const type = String(img.type || '').toLowerCase();
  if (allowed.indexOf(type) < 0) throw new Error('Formato no permitido en ' + img.name + '. Usá PNG, JPG/JPEG o WebP.');
  const bytes = Utilities.base64Decode(String(img.base64 || ''));
  if (bytes.length > AG.MAX_IMAGE_BYTES) throw new Error(img.name + ' supera el máximo de ' + Math.round(AG.MAX_IMAGE_BYTES/1000) + ' KB. Optimizá la imagen antes de subirla.');
  return Utilities.newBlob(bytes, type, normalizePath_(img.name).split('/').pop());
}

function publishProfile(payload) {
  payload = payload || {};
  requireGate_(payload.gateToken);
  const settings = jsonRead_('settings', defaultSettings_());
  if (!settings.active) throw new Error('AulaGram está pausada por el docente.');
  if (!settings.publishingOpen) throw new Error('La publicación de perfiles está pausada.');
  const alias = normalizeAlias_(payload.alias);
  const html = String(payload.htmlText || '');
  const css = String(payload.cssText || '');
  const images = Array.isArray(payload.images) ? payload.images : [];
  if (html.length > 220000 || css.length > 180000) throw new Error('Los archivos HTML/CSS son demasiado grandes para esta actividad.');
  if (!images.length || images.length > AG.MAX_IMAGES) throw new Error('Subí entre 1 y ' + AG.MAX_IMAGES + ' imágenes.');
  let total = 0;
  images.forEach(function(i){ total += Math.ceil(String(i.base64 || '').length * 0.75); });
  if (total > AG.MAX_TOTAL_UPLOAD_BYTES) throw new Error('Las imágenes superan el máximo total permitido. Optimizalas antes de subirlas.');

  const validation = validateStudentFiles_(alias, html, css, images);
  if (!validation.ok) return {ok:false,validation:validation};
  const profiles = jsonRead_('profiles', {});
  const existing = profiles[alias];
  const currentAlias = sessionAlias_(payload.sessionToken || '');
  if (existing && existing.role !== 'student') return {ok:false,validation:{ok:false,issues:['Ese alias está reservado por AulaGram.'],warnings:[]}};
  if (existing && currentAlias !== alias) return {ok:false,needsRecovery:true,message:'Ese alias ya existe. Usá Recuperar identidad para editarlo.'};

  const root = profilesFolder_();
  let folder;
  const it = root.getFoldersByName(alias);
  folder = it.hasNext() ? it.next() : root.createFolder(alias);
  const oldFiles = folder.getFiles();
  while (oldFiles.hasNext()) oldFiles.next().setTrashed(true);

  const cleanHtml = sanitizeStudentHtml_(html);
  const cleanCss = sanitizeCss_(css);
  const htmlFile = folder.createFile('perfil.html', cleanHtml, MimeType.HTML);
  const cssFile = folder.createFile('estilo.css', cleanCss, MimeType.PLAIN_TEXT);
  const imageFiles = {};
  images.forEach(function(img){
    const blob = decodeUploadImage_(img);
    const file = folder.createFile(blob);
    imageNameCandidates_(img.name).forEach(function(k){ imageFiles[k] = file.getId(); });
  });
  const publishedAt = nowIso_();
  const parsed = parseStudentProfile_(alias, cleanHtml, imageFiles, publishedAt);
  const recoveryCode = existing ? '' : randomRecoveryCode_();
  const sessionToken = randomToken_();
  const record = {
    alias: alias,
    display: parsed.display,
    bio: parsed.bio,
    role: 'student',
    seed: false,
    created: existing ? existing.created : publishedAt,
    updated: publishedAt,
    folderId: folder.getId(),
    htmlFileId: htmlFile.getId(),
    cssFileId: cssFile.getId(),
    imageFiles: imageFiles,
    avatarPath: parsed.avatarPath,
    posts: parsed.posts,
    cssFeatures: { hover: /:hover\b/i.test(cleanCss), grid: /display\s*:\s*grid/i.test(cleanCss), flex: /display\s*:\s*flex/i.test(cleanCss) },
    tokenHash: sha256_(sessionToken),
    recoveryHash: existing ? existing.recoveryHash : sha256_(recoveryCode)
  };
  jsonMutate_('profiles', {}, function(all){ all[alias] = record; });
  if (!existing) onboardStudent_(alias, record, cleanCss);
  return {
    ok:true,
    alias:alias,
    sessionToken:sessionToken,
    recoveryCode:recoveryCode,
    validation:validation,
    message: existing ? 'Perfil actualizado correctamente.' : 'Perfil publicado. Guardá el código de recuperación.'
  };
}

function recoverIdentity(alias, recoveryCode, gateToken) {
  requireGate_(gateToken);
  alias = normalizeAlias_(alias);
  const profiles = jsonRead_('profiles', {});
  const p = profiles[alias];
  if (!p || p.role !== 'student') return {ok:false,message:'No encontré un perfil estudiantil con ese alias.'};
  const cache = CacheService.getScriptCache();
  const key = 'recfail_' + alias;
  const fails = Number(cache.get(key) || 0);
  if (fails >= 5) return {ok:false,message:'Demasiados intentos. Esperá unos minutos o consultá al docente.'};
  if (sha256_(String(recoveryCode || '').trim()) !== p.recoveryHash) {
    cache.put(key, String(fails + 1), 600);
    return {ok:false,message:'Código de recuperación incorrecto.'};
  }
  cache.remove(key);
  const token = issueProfileSession_(alias);
  return {ok:true,alias:alias,sessionToken:token,message:'Identidad recuperada.'};
}

function countsFor_(alias) {
  const follows = jsonRead_('follows', {});
  const followers = (follows[alias] || []).length;
  let following = 0;
  Object.keys(follows).forEach(function(target){ if ((follows[target] || []).indexOf(alias) >= 0) following++; });
  return {followers:followers,following:following};
}

function publicProfile_(p, viewerAlias) {
  const counts = countsFor_(p.alias);
  const follows = jsonRead_('follows', {});
  return {
    alias:p.alias,
    display:p.display || p.alias,
    bio:p.bio || '',
    role:p.role || 'student',
    seed:!!p.seed,
    avatarAsset:p.avatarAsset || (p.avatarPath ? 'student:' + p.alias + ':' + p.avatarPath : ''),
    posts:(p.posts || []).map(function(post){ return safeJsonClone_(post); }),
    followers:counts.followers,
    following:counts.following,
    isFollowing:viewerAlias ? (follows[p.alias] || []).indexOf(viewerAlias) >= 0 : false,
    isMe:viewerAlias === p.alias
  };
}

function getProfile(alias, gateToken, sessionToken) {
  requireGate_(gateToken);
  alias = normalizeAlias_(alias);
  const profiles = jsonRead_('profiles', {});
  if (!profiles[alias]) throw new Error('Perfil no encontrado.');
  const viewer = sessionAlias_(sessionToken || '');
  const p = publicProfile_(profiles[alias], viewer);
  p.posts = enrichPosts_(p.posts, viewer);
  p.designAvailable = profiles[alias].role === 'student';
  return p;
}

function getProfiles(gateToken, sessionToken, query) {
  requireGate_(gateToken);
  const viewer = sessionAlias_(sessionToken || '');
  const q = cleanText_(query || '', 60).toLowerCase();
  const profiles = jsonRead_('profiles', {});
  return Object.keys(profiles).filter(function(alias){
    const p=profiles[alias];
    return !q || alias.indexOf(q)>=0 || String(p.display||'').toLowerCase().indexOf(q)>=0 || String(p.bio||'').toLowerCase().indexOf(q)>=0;
  }).map(function(alias){ return publicProfile_(profiles[alias], viewer); }).sort(function(a,b){
    const ar = a.role === 'student' ? 0 : 1, br = b.role === 'student' ? 0 : 1;
    return ar-br || a.alias.localeCompare(b.alias);
  });
}

function replaceLocalImagesWithData_(html, record) {
  const map = record.imageFiles || {};
  return String(html).replace(/(<img\b[^>]*\bsrc\s*=\s*)(["'])([^"']+)\2/gi, function(all, prefix, quote, src){
    const candidates = imageNameCandidates_(src);
    let id = '';
    candidates.some(function(k){ if (map[k]) { id = map[k]; return true; } return false; });
    if (!id) return prefix + quote + '' + quote;
    try { return prefix + quote + dataUriFromBlob_(DriveApp.getFileById(id).getBlob()) + quote; }
    catch (e) { return prefix + quote + '' + quote; }
  });
}

function getProfileDesign(alias, gateToken) {
  requireGate_(gateToken);
  alias = normalizeAlias_(alias);
  const profiles = jsonRead_('profiles', {});
  const p = profiles[alias];
  if (!p || p.role !== 'student') return {ok:false,html:''};
  const html = DriveApp.getFileById(p.htmlFileId).getBlob().getDataAsString('UTF-8');
  const css = DriveApp.getFileById(p.cssFileId).getBlob().getDataAsString('UTF-8');
  let src = replaceLocalImagesWithData_(sanitizeStudentHtml_(html), p);
  src = src.replace(/<link\b[^>]*href\s*=\s*(["'])estilo\.css\1[^>]*>/i, '<style>' + sanitizeCss_(css) + '</style>');
  src = src.replace(/<a\b([^>]*)href\s*=\s*(["'])https?:\/\/[^"']+\2([^>]*)>/gi, '<a$1href="#" aria-disabled="true"$3>');
  const csp = '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; img-src data:; style-src \'unsafe-inline\';">';
  const guard = '<style>html,body{max-width:100%;overflow-wrap:anywhere}img{max-width:100%;height:auto}*{box-sizing:border-box}</style>';
  if (/<head[^>]*>/i.test(src)) src = src.replace(/<head[^>]*>/i, function(m){ return m + csp + guard; });
  else src = '<!doctype html><html lang="es"><head>' + csp + guard + '<style>' + sanitizeCss_(css) + '</style></head><body>' + src + '</body></html>';
  return {ok:true,html:src};
}

function adminDeleteProfile(alias, adminToken) {
  requireAdmin_(adminToken);
  alias = normalizeAlias_(alias);
  const profiles = jsonRead_('profiles', {});
  const p = profiles[alias];
  if (!p || p.role !== 'student') throw new Error('Solo se pueden eliminar perfiles estudiantiles.');
  if (p.folderId) { try { DriveApp.getFolderById(p.folderId).setTrashed(true); } catch(e){} }
  jsonMutate_('profiles', {}, function(all){ delete all[alias]; });
  cleanupUserSocial_(alias);
  return {ok:true};
}
