/** Feed, likes, seguimientos, comentarios, actividad y mensajes. */
function settings_() { return jsonRead_('settings', defaultSettings_()); }
function requireActive_() { if (!settings_().active) throw new Error('AulaGram está pausada por el docente.'); }

function findPost_(postId) {
  const profiles = jsonRead_('profiles', {});
  const aliases = Object.keys(profiles);
  for (let i=0;i<aliases.length;i++) {
    const p = profiles[aliases[i]];
    const posts = p.posts || [];
    for (let j=0;j<posts.length;j++) if (posts[j].id === postId) return {owner:aliases[i],post:posts[j],profile:p};
  }
  return null;
}

function enrichPosts_(posts, viewer) {
  const likes = jsonRead_('likes', {});
  const comments = jsonRead_('comments', []);
  return (posts || []).map(function(post){
    const p = safeJsonClone_(post);
    p.likeCount = (likes[p.id] || []).length;
    p.liked = viewer ? (likes[p.id] || []).indexOf(viewer) >= 0 : false;
    p.comments = comments.filter(function(c){ return c.post === p.id; }).slice(-20);
    return p;
  });
}

function getHome(gateToken, sessionToken) {
  requireGate_(gateToken);
  const settings = settings_();
  const viewer = sessionAlias_(sessionToken || '');
  const profiles = jsonRead_('profiles', {});
  let feed = [];
  Object.keys(profiles).forEach(function(alias){
    const p = profiles[alias];
    (p.posts || []).forEach(function(post){
      feed.push({owner:alias,display:p.display||alias,role:p.role||'student',avatarAsset:p.avatarAsset || (p.avatarPath ? 'student:'+alias+':'+p.avatarPath : ''),post:safeJsonClone_(post)});
    });
  });
  feed.sort(function(a,b){ return String(b.post.time||'').localeCompare(String(a.post.time||'')); });
  feed = feed.slice(0, AG.FEED_LIMIT);
  const likes = jsonRead_('likes', {}), comments = jsonRead_('comments', []);
  feed.forEach(function(item){
    item.post.likeCount = (likes[item.post.id]||[]).length;
    item.post.liked = viewer ? (likes[item.post.id]||[]).indexOf(viewer)>=0 : false;
    item.post.comments = comments.filter(function(c){ return c.post===item.post.id; }).slice(-6);
  });
  const stories = Object.keys(profiles).slice(0,16).map(function(alias){ return publicProfile_(profiles[alias], viewer); });
  return {settings:settings,viewer:viewer,feed:feed,stories:stories,version:AG.VERSION,className:AG.CLASS_NAME};
}

function getHomeViewData(gateToken, sessionToken) {
  return {me:getMyState(gateToken, sessionToken), data:getHome(gateToken, sessionToken)};
}

function getExploreViewData(gateToken, sessionToken, query) {
  return {me:getMyState(gateToken, sessionToken), profiles:getProfiles(gateToken, sessionToken, query)};
}

function getProfileViewData(alias, gateToken, sessionToken) {
  return {me:getMyState(gateToken, sessionToken), profile:getProfile(alias, gateToken, sessionToken)};
}

function getActivityViewData(gateToken, sessionToken) {
  const me = getMyState(gateToken, sessionToken);
  return {me:me, activity:me.logged ? getActivity(gateToken, sessionToken) : []};
}

function getMessagesViewData(initialAlias, gateToken, sessionToken) {
  const me = getMyState(gateToken, sessionToken);
  if (!me.logged) return {me:me,conversations:[],profiles:[],target:'',conversation:null};
  const conversations = getConversations(gateToken, sessionToken);
  const profiles = getProfiles(gateToken, sessionToken, '');
  let target = normalizeAlias_(initialAlias || '');
  if (!target) target = conversations.length ? conversations[0].alias : AG.GENERAL_BOT;
  const conversation = getConversation(target, gateToken, sessionToken);
  return {me:me,conversations:conversations,profiles:profiles,target:target,conversation:conversation};
}

function toggleLike(postId, gateToken, sessionToken) {
  requireGate_(gateToken); requireActive_();
  const s=settings_(); if(!s.socialOpen) throw new Error('Likes y seguimientos están pausados.');
  const user=requireUser_(sessionToken); const block=moderationBlockReason_(user); if(block) throw new Error(block);
  if(!findPost_(postId)) throw new Error('Publicación inexistente.');
  return jsonMutate_('likes', {}, function(likes){
    likes[postId]=likes[postId]||[]; const i=likes[postId].indexOf(user);
    if(i>=0) likes[postId].splice(i,1); else likes[postId].push(user);
    return {ok:true,liked:i<0,count:likes[postId].length};
  });
}

function toggleFollow(target, gateToken, sessionToken) {
  requireGate_(gateToken); requireActive_();
  const s=settings_(); if(!s.socialOpen) throw new Error('Likes y seguimientos están pausados.');
  const user=requireUser_(sessionToken); target=normalizeAlias_(target);
  if(user===target) throw new Error('No necesitás seguirte a vos mismo.');
  const profiles=jsonRead_('profiles',{}); if(!profiles[target]) throw new Error('Perfil inexistente.');
  const block=moderationBlockReason_(user); if(block) throw new Error(block);
  return jsonMutate_('follows', {}, function(f){
    f[target]=f[target]||[]; const i=f[target].indexOf(user);
    if(i>=0) f[target].splice(i,1); else f[target].push(user);
    return {ok:true,following:i<0,count:f[target].length};
  });
}

function addComment(postId, text, gateToken, sessionToken) {
  requireGate_(gateToken); requireActive_();
  const s=settings_(); if(!s.commentsOpen) throw new Error('Los comentarios están pausados.');
  const user=requireUser_(sessionToken); const found=findPost_(postId); if(!found) throw new Error('Publicación inexistente.');
  const block=moderationBlockReason_(user); if(block) throw new Error(block);
  const safe=moderateText_(text,user,found.owner,'comment');
  if(!safe.ok){ const strike=recordModeration_(user,found.owner,'comentario',safe); if(strike.autoMuted) safe.reason += ' Además, se activó una pausa preventiva breve.'; return safe; }
  const spam=checkSpam_(user,'comentario',safe.text);
  if(!spam.ok){ recordModeration_(user,found.owner,'comentario',spam); return spam; }
  const c={id:Utilities.getUuid(),post:postId,user:user,text:safe.text,time:nowIso_()};
  jsonMutate_('comments', [], function(list){ list.push(c); if(list.length>2000) list.splice(0,list.length-2000); });
  return {ok:true,comment:c};
}

function getActivity(gateToken, sessionToken) {
  requireGate_(gateToken); const me=requireUser_(sessionToken);
  const profiles=jsonRead_('profiles',{}), follows=jsonRead_('follows',{}), likes=jsonRead_('likes',{}), comments=jsonRead_('comments',[]);
  const myPosts=(profiles[me].posts||[]).map(function(p){return p.id;});
  const events=[];
  (follows[me]||[]).forEach(function(u){ if(u!==me) events.push({type:'follow',user:u,text:'@'+u+' comenzó a seguirte.'}); });
  comments.forEach(function(c){ if(myPosts.indexOf(c.post)>=0 && c.user!==me) events.push({type:'comment',user:c.user,text:'@'+c.user+' comentó: '+c.text,time:c.time}); });
  myPosts.forEach(function(pid){ (likes[pid]||[]).forEach(function(u){ if(u!==me) events.push({type:'like',user:u,text:'@'+u+' indicó que le gusta una publicación tuya.'}); }); });
  return events.slice(-120).reverse();
}

function unreadCount_(alias, messages) {
  return messages.filter(function(m){ return m.to===alias && !m.read; }).length;
}

function getConversations(gateToken, sessionToken) {
  requireGate_(gateToken); const me=requireUser_(sessionToken);
  const messages=jsonRead_('messages',[]), profiles=jsonRead_('profiles',{}), map={};
  messages.forEach(function(m){
    if(m.from!==me && m.to!==me) return;
    const other=m.from===me?m.to:m.from;
    if(!profiles[other]) return;
    if(!map[other]) map[other]={alias:other,display:profiles[other].display||other,avatarAsset:profiles[other].avatarAsset || (profiles[other].avatarPath?'student:'+other+':'+profiles[other].avatarPath:''),last:'',time:'',unread:0};
    if(String(m.time||'')>=String(map[other].time||'')){map[other].last=m.text;map[other].time=m.time;}
    if(m.to===me&&!m.read)map[other].unread++;
  });
  return Object.keys(map).map(function(k){return map[k];}).sort(function(a,b){return String(b.time).localeCompare(String(a.time));});
}

function getConversation(other, gateToken, sessionToken) {
  requireGate_(gateToken); const me=requireUser_(sessionToken); other=normalizeAlias_(other);
  const profiles=jsonRead_('profiles',{}); if(!profiles[other]) throw new Error('Perfil inexistente.');
  const allMessages=jsonRead_('messages',[]);
  const needsReadUpdate=allMessages.some(function(m){return m.from===other&&m.to===me&&!m.read;});
  if(needsReadUpdate){
    jsonMutate_('messages', [], function(all){ all.forEach(function(m){ if(m.from===other&&m.to===me&&!m.read)m.read=true; }); });
  }
  const latest=jsonRead_('messages',[]);
  const msgs=latest.filter(function(m){return (m.from===me&&m.to===other)||(m.from===other&&m.to===me);}).slice(-AG.MESSAGE_LIMIT);
  return {me:me,other:publicProfile_(profiles[other],me),messages:msgs};
}

function appendMessage_(from,to,text,read) {
  const msg={id:Utilities.getUuid(),from:from,to:to,text:text,time:nowIso_(),read:!!read};
  jsonMutate_('messages', [], function(list){ list.push(msg); if(list.length>4000) list.splice(0,list.length-4000); });
  return msg;
}

function isBotAlias_(alias) {
  const p=jsonRead_('profiles',{})[alias]; return !!p && (p.role==='bot'||p.role==='official');
}

function sendMessage(to, text, gateToken, sessionToken) {
  requireGate_(gateToken); requireActive_();
  const s=settings_(); if(!s.messagesOpen) throw new Error('La mensajería está pausada.');
  const from=requireUser_(sessionToken); to=normalizeAlias_(to);
  const profiles=jsonRead_('profiles',{}); if(!profiles[to]) throw new Error('Perfil inexistente.'); if(from===to) throw new Error('No necesitás enviarte un mensaje a vos mismo.');
  const block=moderationBlockReason_(from); if(block) throw new Error(block);
  const safe=moderateText_(text,from,to,'message');
  if(!safe.ok){const strike=recordModeration_(from,to,'mensaje',safe);if(strike.autoMuted)safe.reason+=' Además, se activó una pausa preventiva breve.';return safe;}
  const spam=checkSpam_(from,'mensaje',safe.text);
  if(!spam.ok){recordModeration_(from,to,'mensaje',spam);return spam;}
  const userMsg=appendMessage_(from,to,safe.text,false);
  let botMsg=null;
  if(isBotAlias_(to)) botMsg=appendMessage_(to,from,botReply_(to,safe.text,from),false);
  return {ok:true,message:userMsg,botReply:botMsg};
}

function onboardStudent_(alias, record, css) {
  const bots=['aulagram','byte_bot','html_bot','css_bot','js_bot','python_bot','ia_bot','a11y_bot'];
  jsonMutate_('follows', {}, function(f){ f[alias]=f[alias]||[]; bots.forEach(function(b){ if(f[alias].indexOf(b)<0)f[alias].push(b); }); });
  const first=(record.posts||[])[0], second=(record.posts||[])[1]||first;
  if(first) jsonMutate_('likes', {}, function(l){ l[first.id]=l[first.id]||[]; bots.forEach(function(b){if(l[first.id].indexOf(b)<0)l[first.id].push(b);}); if(second){l[second.id]=l[second.id]||[];if(l[second.id].indexOf('aulagram')<0)l[second.id].push('aulagram');} });
  if(first){
    const seeded=[
      {id:'welcome-'+alias,post:first.id,user:'aulagram',text:'¡Bienvenido @'+alias+'! Tu perfil ya forma parte de la red de la clase.',time:nowIso_()},
      {id:'html-'+alias,post:first.id,user:'html_bot',text:'Detecté '+record.posts.length+' publicaciones. Tu HTML ya dejó una huella visible en AulaGram.',time:nowIso_()}
    ];
    if(second)seeded.push({id:'css-'+alias,post:second.id,user:'css_bot',text:String(css||'').indexOf(':hover')>=0?'¡Encontré un :hover en tu CSS! Buen detalle de interacción visual.':'Tu hoja de estilos ya está aplicada. Probá cambiar una propiedad y observar qué cambia.',time:nowIso_()});
    jsonMutate_('comments', [], function(list){ const ids=list.map(function(c){return c.id;}); seeded.forEach(function(c){if(ids.indexOf(c.id)<0)list.push(c);}); });
  }
  appendMessage_('byte_bot',alias,'¡Bienvenido/a @'+alias+'! Soy Byte Bot 🤖. Escribí “menú” para ver mis temas. También podés usar “reto”, “quiz”, “dato random” o “chiste”. Mis respuestas son pistas: probá siempre lo que te sugiero.',false);
}

function cleanupUserSocial_(alias) {
  jsonMutate_('follows', {}, function(f){ delete f[alias]; Object.keys(f).forEach(function(k){ f[k]=(f[k]||[]).filter(function(x){return x!==alias;}); }); });
  jsonMutate_('likes', {}, function(l){ Object.keys(l).forEach(function(k){ l[k]=(l[k]||[]).filter(function(x){return x!==alias;}); }); });
  jsonMutate_('comments', [], function(c){ for(let i=c.length-1;i>=0;i--)if(c[i].user===alias)c.splice(i,1); });
  jsonMutate_('messages', [], function(m){ for(let i=m.length-1;i>=0;i--)if(m[i].from===alias||m[i].to===alias)m.splice(i,1); });
  jsonMutate_('mutedUsers', {}, function(m){ delete m[alias]; });
}
