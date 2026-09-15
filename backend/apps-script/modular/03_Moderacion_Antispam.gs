/** Moderación preventiva educativa. */
function moderationAscii_(text) {
  let s = String(text || '').replace(/[\u200B-\u200D\uFEFF]/g, '').toLowerCase();
  s = s.replace(/[01345789@$€|!]/g, function(ch){
    return ({'0':'o','1':'i','!':'i','3':'e','4':'a','5':'s','7':'t','8':'b','9':'g','@':'a','$':'s','€':'e','|':'i'})[ch] || ch;
  });
  try { s = s.normalize('NFD').replace(/[\u0300-\u036f]/g,''); } catch(e) {}
  s = s.replace(/([a-z])\1{2,}/g, '$1$1');
  return s;
}

function termRegex_(term) {
  const clean = moderationAscii_(term).replace(/[^a-z0-9]+/g,'');
  if (!clean) return null;
  const pieces = clean.split('').map(function(c){ return c.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + '+'; });
  return new RegExp('(?:^|[^a-z0-9])' + pieces.join('[^a-z0-9]*') + '(?:$|[^a-z0-9])','i');
}

function categoryForRule_(rule) {
  const r = moderationAscii_(rule);
  if (/matar|mato|revient|rompo|trompad|pegar|parto la cara|morite|muerete|matate|suicid|kill yourself|kys|espero afuera|agarro afuera/.test(r)) return 'amenaza';
  if (/pack|nudes|desnud|en bolas|tetas|culo|garch|cojan|cojo/.test(r)) return 'sexual';
  if (/negro de|negra de|villero|villera|mongol|mogol|retrasad|retardad|subnormal|maricon|faggot|nigger|nigga/.test(r)) return 'discriminacion';
  return 'lenguaje';
}

function contextualHostile_(ascii, term, target, channel) {
  const re = termRegex_(term);
  if (!re || !re.test(ascii)) return false;
  const compact = ascii.replace(/[^a-z0-9@_-]+/g,' ').trim();
  const wc = compact ? compact.split(/\s+/).length : 0;
  if (channel === 'message' && wc <= 4) return true;
  if (/(^|\s)(vos|sos|eres|te|tu|usted|anda|andate|callate|hacete|pareces|parece|quedaste|alto|alta|re|tremendo|tremenda|terrible)(\s|$)/i.test(compact)) return true;
  const t = moderationAscii_(target || '').replace(/[^a-z0-9_-]/g,'');
  if (t && (compact.indexOf('@' + t) >= 0 || new RegExp('(?:^|\\s)' + t + '(?:$|\\s)','i').test(compact))) return true;
  if (/(?:^|\s)(?:[a-z0-9]\s+){3,}[a-z0-9](?:$|\s)/i.test(compact)) return true;
  return false;
}

function moderateText_(text, from, to, channel) {
  const raw = cleanText_(text, channel === 'comment' ? AG.MAX_COMMENT_LENGTH : AG.MAX_MESSAGE_LENGTH);
  if (!raw) return {ok:false,reason:'Escribí un texto antes de enviar.',category:'vacio',rule:'empty',severity:'low'};
  if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(raw)) return {ok:false,reason:'Por privacidad, no compartas correos electrónicos en AulaGram.',category:'privacidad',rule:'email',severity:'medium'};
  if (/(?:https?:\/\/|www\.)\S+/i.test(raw)) return {ok:false,reason:'Los enlaces externos están deshabilitados en comentarios y mensajes de la actividad.',category:'privacidad',rule:'url',severity:'medium'};
  if (/(^|\D)(?:\+?598[\s-]?)?0?9[1-9](?:[\s-]?\d){6}(?!\d)/.test(raw)) return {ok:false,reason:'Por privacidad, no compartas números de teléfono en AulaGram.',category:'privacidad',rule:'telefono',severity:'medium'};
  const ascii = moderationAscii_(raw);
  const rules = jsonRead_('moderationRules', defaultModerationRules_());
  const strong = (rules.strong || []).slice().sort(function(a,b){ return b.length-a.length; });
  for (let i=0;i<strong.length;i++) {
    const re = termRegex_(strong[i]);
    if (re && re.test(ascii)) {
      const cat = categoryForRule_(strong[i]);
      let reason = 'Ese texto contiene lenguaje que no corresponde a la convivencia de AulaGram. Reformulalo de manera respetuosa.';
      if (cat === 'amenaza') reason = 'Ese texto puede interpretarse como amenaza o incitación al daño. No se envió. Reformulá de forma segura y respetuosa.';
      if (cat === 'sexual') reason = 'Ese contenido no corresponde a una red educativa de estudiantes. No se envió.';
      if (cat === 'discriminacion') reason = 'Ese texto puede resultar discriminatorio o degradante. No se envió. Reformulalo con respeto.';
      return {ok:false,reason:reason,category:cat,rule:strong[i],severity:'high'};
    }
  }
  const context = (rules.context || []).slice().sort(function(a,b){ return b.length-a.length; });
  for (let j=0;j<context.length;j++) {
    if (contextualHostile_(ascii, context[j], to, channel)) return {ok:false,reason:'Ese término puede usarse de forma despectiva cuando se dirige a otra persona. Reformulá la idea sin etiquetar ni atacar a nadie.',category:'contexto',rule:context[j],severity:'medium'};
  }
  const hostile = [
    /\b(nadie|todos)\s+(te\s+)?(quiere|quieren|odia|odian)\b/i,
    /\b(ojala|ojal[aá])\s+(te\s+)?(mueras|pase algo|echen)\b/i,
    /\b(callate|c[aá]llate)\b.*\b(boca|orto)\b/i,
    /\b(sos|eres)\s+(un|una)?\s*(asco|basura|mierda)\b/i,
    /\b(te|los|las)\s+vamos?\s+a\s+(hacer|romper|pegar|matar)\b/i
  ];
  for (let k=0;k<hostile.length;k++) if (hostile[k].test(ascii)) return {ok:false,reason:'El mensaje contiene una expresión de hostigamiento o agresión. No se envió.',category:'hostigamiento',rule:'pattern-'+k,severity:'high'};
  return {ok:true,text:raw};
}

function mutedStatus_(alias) {
  const all = jsonRead_('mutedUsers', {});
  const m = all[alias] || {};
  const manual = !!m.manual;
  const until = Number(m.until || 0);
  return {muted:manual || until > Date.now(),manual:manual,until:until,reason:m.reason || ''};
}

function moderationBlockReason_(alias) {
  const st = mutedStatus_(alias);
  if (!st.muted) return '';
  if (st.manual) return 'Tu mensajería/interacción está pausada por el docente. Consultalo para continuar.';
  const sec = Math.max(1, Math.ceil((st.until-Date.now())/1000));
  return 'Se activó una pausa preventiva por intentos repetidos. Probá nuevamente en aproximadamente ' + sec + ' s.';
}

function recordModeration_(user, target, channel, result) {
  if (!user) return {autoMuted:false};
  const event = {id:Utilities.getUuid(),user:user,target:target,channel:channel,category:result.category||'otro',rule:result.rule||'',severity:result.severity||'medium',time:nowIso_(),ts:Date.now()};
  jsonMutate_('moderationLog', [], function(log){ log.push(event); if (log.length > AG.MAX_MODERATION_LOG) log.splice(0, log.length-AG.MAX_MODERATION_LOG); });
  const log = jsonRead_('moderationLog', []);
  const recent = log.filter(function(e){ return e.user===user && Date.now()-Number(e.ts||0) <= AG.MODERATION_WINDOW_SECONDS*1000; }).length;
  if (recent >= AG.MODERATION_STRIKES) {
    jsonMutate_('mutedUsers', {}, function(all){ all[user] = {manual:false,until:Date.now()+AG.MODERATION_COOLDOWN_SECONDS*1000,reason:'Pausa preventiva automática'}; });
    return {autoMuted:true,recent:recent};
  }
  return {autoMuted:false,recent:recent};
}

function spamKey_(alias, channel) {
  return 'agspam_' + sha256_(normalizeAlias_(alias) + '|' + String(channel || 'accion')).slice(0, 32);
}

function spamFingerprint_(text) {
  return sha256_(moderationAscii_(text).replace(/[^a-z0-9]+/g, ' ').trim()).slice(0, 24);
}

function checkSpam_(alias, channel, text) {
  const cache = CacheService.getScriptCache();
  const key = spamKey_(alias, channel);
  const now = Date.now();
  let state = {times:[], repeats:{}, until:0};
  try { state = JSON.parse(cache.get(key) || '{}'); } catch (e) {}
  state.times = Array.isArray(state.times) ? state.times : [];
  state.repeats = state.repeats && typeof state.repeats === 'object' ? state.repeats : {};
  state.until = Number(state.until || 0);

  if (state.until > now) {
    const sec = Math.max(1, Math.ceil((state.until - now) / 1000));
    return {ok:false,reason:'Estás enviando acciones demasiado rápido. Esperá aproximadamente ' + sec + ' s antes de continuar.',category:'spam',rule:'cooldown',severity:'low'};
  }

  const windowMs = AG.SPAM_WINDOW_SECONDS * 1000;
  state.times = state.times.filter(function(ts){ return now - Number(ts || 0) <= windowMs; });
  state.times.push(now);

  const repeatMs = AG.SPAM_REPEAT_WINDOW_SECONDS * 1000;
  Object.keys(state.repeats).forEach(function(fp){
    if (now - Number((state.repeats[fp] || {}).ts || 0) > repeatMs) delete state.repeats[fp];
  });
  const fp = spamFingerprint_(text);
  const rep = state.repeats[fp] || {count:0,ts:now};
  rep.count = Number(rep.count || 0) + 1; rep.ts = now; state.repeats[fp] = rep;

  let result = {ok:true};
  if (rep.count > AG.SPAM_MAX_REPEAT) {
    state.until = now + AG.SPAM_COOLDOWN_SECONDS * 1000;
    result = {ok:false,reason:'Ese mismo contenido se repitió varias veces. Esperá un momento y continuá la conversación con un mensaje diferente.',category:'spam',rule:'repeticion',severity:'low'};
  } else if (state.times.length > AG.SPAM_MAX_ACTIONS) {
    state.until = now + AG.SPAM_COOLDOWN_SECONDS * 1000;
    result = {ok:false,reason:'Detecté demasiados envíos en pocos segundos. Se aplicó una pausa breve para evitar spam.',category:'spam',rule:'rafaga',severity:'low'};
  }

  cache.put(key, JSON.stringify(state), Math.max(AG.SPAM_REPEAT_WINDOW_SECONDS, AG.SPAM_COOLDOWN_SECONDS) + 15);
  return result;
}

function adminMuteUser(alias, manual, adminToken) {
  requireAdmin_(adminToken);
  alias = normalizeAlias_(alias);
  jsonMutate_('mutedUsers', {}, function(all){
    if (manual) all[alias] = {manual:true,until:0,reason:'Pausa aplicada por el docente'};
    else delete all[alias];
  });
  return {ok:true};
}

function adminAddModerationRule(kind, term, adminToken) {
  requireAdmin_(adminToken);
  kind = kind === 'context' ? 'context' : 'strong';
  term = cleanText_(term, 80).toLowerCase();
  if (!term) throw new Error('Escribí una expresión.');
  jsonMutate_('moderationRules', defaultModerationRules_(), function(rules){
    rules.strong = rules.strong || []; rules.context = rules.context || [];
    const arr = rules[kind];
    if (arr.map(moderationAscii_).indexOf(moderationAscii_(term)) < 0) arr.push(term);
  });
  return {ok:true};
}

function adminClearModerationLog(adminToken) {
  requireAdmin_(adminToken);
  jsonWrite_('moderationLog', []);
  return {ok:true};
}
