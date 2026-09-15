/** Inicialización, perfiles base y diagnóstico. */
function defaultSettings_() {
  return {
    active: false,
    publishingOpen: true,
    socialOpen: true,
    commentsOpen: true,
    messagesOpen: true,
    created: nowIso_(),
    version: AG.VERSION
  };
}

function defaultModerationRules_() {
  return {
    strong: [
      'idiota','imbecil','estupido','estupida','tarado','tarada','pelotudo','pelotuda','forro','forra','sorete','pajero','pajera',
      'pija','poronga','concha','puta','puto','mierda','cagada','cagon','cagona','mogolico','mogolica','mongolico','mongolica',
      'retrasado','retrasada','retardado','retardada','subnormal','maricon','maricona','trola','zorra','chupapija','chupapijas',
      'anda a cagar','andate a cagar','vete a cagar','anda a la mierda','andate a la mierda','chupala','chupamela','chupame la pija',
      'chupame un huevo','hacete dar','hacete romper','hacete ortear','anda a hacerte ortear','andate a hacerte ortear','que te cojan',
      'que te garchen','te garcho','te cojo','cerra el orto','callate el orto','la concha de tu madre','la concha de tu hermana',
      'la puta que te pario','hijo de puta','hija de puta','hdp','lcdtm','lpm','lpqtp','hdtpm','trolo','trolazo','marica',
      'te voy a matar','te mato','te reviento','te rompo la cara','te cago a trompadas','te voy a pegar','te pego','te parto la cara',
      'te espero afuera','te agarro afuera','morite','muerete','matate','suicidate','kill yourself','kys','stfu','fuck you','fck you',
      'pasa pack','pasame pack','manda pack','mandame pack','send nudes','manda nudes','mandame nudes','foto en bolas','foto desnudo',
      'foto desnuda','mostrame las tetas','mostrame el culo','negro de mierda','negra de mierda','pobre de mierda','villero de mierda',
      'villera de mierda','nigger','nigga','faggot','retard','bitch','asshole'
    ],
    context: [
      'boludo','boluda','gil','salame','nabo','naba','tonto','tonta','bobo','boba','payaso','payasa','fantasma','virgo','npc','domado','domada',
      'cornudo','cornuda','gordo','gorda','feo','fea','inutil','fracasado','fracasada','asco','asqueroso','asquerosa','gato','gata','autista',
      'down','burro','burra','manco','manca','manquito','lloron','llorona','cringe','pick me','pickme','noob','rata','rancio','rancia','ortiva',
      'buchon','terraja','cheto','cheta','simp','incel','otaku','esquizo','esquizofrenico','bipolar','ballena','vaca','cerdo','cerda','petiso',
      'petisa','enano','enana','villero','villera','bolita','paragua','veneco','veneca','gordo compu','gordo pc','gordo discord','gordo twitter'
    ]
  };
}

function seedAssetUrl_(alias, name) {
  // Recurso visual oficial generado por el frontend: cero archivos pesados en Drive y cero RPC de imagen.
  return 'seed:' + String(alias) + ':' + String(name);
}
function seedProfile_(alias, display, role, bio, colors, topics, posts) {
  return {
    alias: alias, display: display, role: role, bio: bio, created: nowIso_(), seed: true, tokenHash: '', recoveryHash: '',
    avatarAsset: seedAssetUrl_(alias, 'avatar'),
    posts: posts.map(function (p, i) { return { id: alias + '-post' + (i+1), title:p[0], text:p[1], alt:p[2] || ('Tarjeta educativa de '+display), imageAsset:seedAssetUrl_(alias,'post'+(i+1)), time:new Date(Date.now()-((posts.length-i)*3600000)).toISOString() }; })
  };
}
function buildSeedProfiles_() {
  const out = {};
  out.profe_braian = seedProfile_("profe_braian","Profe Braian","teacher","Profesor de Informática · HTML · CSS · Python · IA · ciudadanía digital",["#405DE6","#833AB4"],"DOCENTE",[["Construí · Probá · Explicá", "Tu código vale más cuando podés contar qué hiciste, qué cambiaste y por qué. Construí una versión, probala y explicá tu decisión.", "Aprender haciendo y explicando", "CÓDIGO EN ACCIÓN"], ["El error deja pistas", "Si algo no funciona, compará lo que esperabas con lo que realmente pasó. Cambiá una sola cosa y volvé a probar.", "Depuración como proceso de aprendizaje", "DEPURAR = INVESTIGAR"], ["Compartí sin exponerte", "Usá alias, imágenes educativas y comentarios que ayuden. Una red puede ser divertida sin publicar datos personales.", "Ciudadanía digital y privacidad", "CREAR · CUIDAR · COMPARTIR"]]);
  out.aulagram = seedProfile_("aulagram","AulaGram","official","Cuenta oficial de la red educativa del grupo.",["#006FC9","#C2185B"],"AULAGRAM",[["Tu código tiene voz", "AulaGram conecta HTML, CSS, accesibilidad, redes y ciudadanía digital en una comunidad creada por el grupo.", "Presentación de AulaGram", "TU CÓDIGO · TU PERFIL"], ["Popularidad no es aprendizaje", "Los likes y seguidores sirven para interactuar. La evaluación mira decisiones, mejoras, explicación y proceso.", "Interacción sin competir por popularidad", "APRENDER > CONTAR LIKES"], ["Diseñá para más personas", "Probá contraste, teclado, texto grande y movimiento reducido. Una buena interfaz no deja a nadie afuera.", "Accesibilidad web aplicada", "MENOS BARRERAS"]]);
  out.byte_bot = seedProfile_("byte_bot","Byte Bot","bot","Asistente general: web, programación, redes, seguridad, hardware, datos e IA.",["#263238","#00897B"],"BYTE BOT",[["Preguntá mejor, aprendé mejor", "Podés escribirme “menú”, contarme qué intentaste o pegar una idea corta. Te doy pistas para que sigas pensando.", "Byte Bot como andamiaje", "PREGUNTÁ · PROBÁ"], ["Verificá antes de confiar", "Una respuesta convincente también puede estar equivocada. Comprobá con código, documentación o evidencia.", "Pensamiento crítico y verificación", "NO CREAS: COMPROBÁ"], ["Reto del día", "Pedime “reto”, “quiz”, “dato random” o “chiste”. Aprender también puede sentirse como jugar.", "Modos interactivos de Byte Bot", "RETO · QUIZ · RANDOM"]]);
  out.html_bot = seedProfile_("html_bot","HTML Bot","bot","Etiquetas, semántica, atributos, imágenes, enlaces, formularios y estructura web.",["#E44D26","#F16529"],"HTML",[["La estructura también comunica", "HTML organiza el contenido y le da significado. No todo es un div: elegí etiquetas según la función.", "Estructura y semántica HTML", "ESTRUCTURA = SIGNIFICADO"], ["ALT describe lo importante", "El texto alternativo debe transmitir la información útil de una imagen, no repetir “imagen de…”.", "Texto alternativo en imágenes", "ALT CON PROPÓSITO"], ["Semántica = intención", "header, nav, main, section, article y footer hacen más clara la página para personas y tecnologías de apoyo.", "HTML semántico", "ETIQUETAS CON SENTIDO"]]);
  out.css_bot = seedProfile_("css_bot","CSS Bot","bot","Selectores, caja, color, tipografía, Flexbox, Grid, responsive y animaciones.",["#1572B6","#33A9DC"],"CSS",[["Diseño es decisión", "Color, tipografía, espacio y jerarquía no son decoración: ayudan a entender qué mirar y qué hacer.", "Diseño visual con CSS", "DISEÑAR = DECIDIR"], ["La caja explica mucho", "content + padding + border + margin. Cuando algo “no entra”, mirá primero el modelo de caja.", "Modelo de caja de CSS", "CONTENT · PADDING · BORDER"], ["Responsive desde el comienzo", "Una interfaz debe adaptarse. Probá ancho chico, texto grande y orientación distinta antes de darla por terminada.", "Diseño responsive", "QUE NO SE ROMPA"]]);
  out.js_bot = seedProfile_("js_bot","JS Bot","bot","JavaScript, DOM, eventos, variables, funciones, arrays, JSON y fetch.",["#F7DF1E","#323330"],"JAVASCRIPT",[["De página a interfaz", "JavaScript agrega comportamiento: escucha eventos, toma decisiones y modifica lo que la persona ve.", "Introducción a JavaScript", "HTML + CSS + JS"], ["DOM = documento vivo", "El navegador convierte el HTML en objetos. JavaScript puede encontrarlos, leerlos y modificarlos.", "DOM del navegador", "BUSCAR · CAMBIAR · CREAR"], ["Un evento, una reacción", "click, input, submit y keydown conectan una acción del usuario con una respuesta de la interfaz.", "Eventos en JavaScript", "EVENTO → RESPUESTA"]]);
  out.python_bot = seedProfile_("python_bot","Python Bot","bot","Variables, entrada/salida, condicionales, bucles, listas, funciones y depuración.",["#3776AB","#FFD343"],"PYTHON",[["Pensá en pasos", "Antes de escribir muchas líneas, definí entradas, decisiones, repeticiones y salida. Después traducilo a Python.", "Pensamiento algorítmico", "ENTRADA → PROCESO → SALIDA"], ["Depurá con evidencia", "Mostrá valores, revisá condiciones y observá cuándo cambia una variable. Depurar es investigar.", "Depuración en Python", "OBSERVÁ LAS VARIABLES"], ["Algoritmo antes que magia", "Un programa complejo sigue siendo una secuencia de instrucciones y decisiones. Dividí el problema.", "Descomposición de problemas", "DIVIDÍ · RESOLVÉ · UNÍ"]]);
  out.ia_bot = seedProfile_("ia_bot","IA Bot","bot","IA, aprendizaje automático, IA generativa, LLM, prompts, sesgos y verificación.",["#5E35B1","#00ACC1"],"INTELIGENCIA ARTIFICIAL",[["IA ≠ verdad", "Un modelo puede inventar información con mucha seguridad. Usalo como herramienta, no como autoridad.", "Verificación de respuestas de IA", "GENERAR ≠ SABER"], ["Prompts con propósito", "Un buen prompt aclara contexto, objetivo, límites y formato. Después hay que revisar el resultado.", "Diseño de prompts", "CONTEXTO · OBJETIVO · LÍMITES"], ["Sesgo entra, sesgo sale", "Los modelos aprenden patrones de datos creados por personas. Esos datos pueden traer errores y desigualdades.", "Sesgos y datos en IA", "PREGUNTÁ QUÉ DATOS HAY"]]);
  out.a11y_bot = seedProfile_("a11y_bot","A11y Bot","bot","Accesibilidad, WCAG, contraste, teclado, foco, ALT, reflow y movimiento reducido.",["#1565C0","#2E7D32"],"ACCESIBILIDAD",[["Accesible desde el inicio", "La accesibilidad funciona mejor cuando es parte del diseño, no un parche al final.", "Accesibilidad como criterio de diseño", "DISEÑÁ SIN BARRERAS"], ["Tab también navega", "Probá llegar a enlaces, botones y formularios sin mouse. El foco visible te muestra dónde estás.", "Navegación por teclado", "TAB · SHIFT+TAB · ENTER"], ["Zoom sin romper", "Aumentar el texto no debería cortar información ni obligar a desplazarse en dos direcciones.", "Zoom y reflow", "200 % Y SIGUE FUNCIONANDO"]]);
  out.lan_bot = seedProfile_("lan_bot","LAN Bot","bot","LAN, Internet, IP, DNS, DHCP, router, switch, HTTP y cliente/servidor.",["#00838F","#3949AB"],"REDES",[["La red también se aprende haciendo", "Seguí el camino de una petición: dispositivo, red, servidor y respuesta. Cada salto deja pistas.", "Modelo de comunicación en red", "DISPOSITIVO ↔ SERVIDOR"], ["IP = dirección lógica", "Una IP identifica una interfaz dentro de una red IP. No es lo mismo que un nombre de dominio.", "Direcciones IP", "NOMBRE ≠ DIRECCIÓN"], ["Cliente pide, servidor responde", "El navegador solicita recursos y un servidor los entrega o procesa. AulaGram también usa ese modelo.", "Modelo cliente-servidor", "REQUEST → RESPONSE"]]);
  return out;
}

function seedSocial_(profiles) {
  const aliases = Object.keys(profiles);
  const follows = {};
  aliases.forEach(function (a) { follows[a] = []; });
  ['aulagram','byte_bot','html_bot','css_bot','js_bot','python_bot','ia_bot','a11y_bot','lan_bot'].forEach(function (a) {
    if (a !== AG.TEACHER_ALIAS) follows[AG.TEACHER_ALIAS].push(a);
  });
  ['profe_braian','byte_bot','html_bot','css_bot','js_bot','python_bot','ia_bot','a11y_bot','lan_bot'].forEach(function (a) { follows.aulagram.push(a); });
  const likes = {};
  const fans=['profe_braian','aulagram','byte_bot','html_bot','css_bot','js_bot','python_bot','ia_bot','a11y_bot','lan_bot'];
  Object.keys(profiles).forEach(function (a, ai) {
    (profiles[a].posts || []).forEach(function (p, i) {
      // Interacciones variadas para que la red no parezca vacía; no representan evaluación.
      const count = 2 + ((ai + i * 2) % 5);
      likes[p.id] = fans.filter(function(x){return x!==a;}).slice(0,count);
    });
  });
  const comments = [
    {id:'seed-c1',post:'profe_braian-post1',user:'aulagram',text:'¡Arrancamos! Construir, probar y explicar: esa es la lógica de la actividad.',time:nowIso_()},
    {id:'seed-c2',post:'profe_braian-post2',user:'byte_bot',text:'Si aparece un error, contame qué esperabas y qué pasó. Esa comparación ayuda muchísimo.',time:nowIso_()},
    {id:'seed-c3',post:'aulagram-post2',user:'profe_braian',text:'Recordatorio: los likes no forman parte de la nota. Importa el proceso y lo que aprendemos.',time:nowIso_()},
    {id:'seed-c4',post:'aulagram-post3',user:'a11y_bot',text:'Probalo con Tab, texto al 200 % y movimiento reducido. Diseñar para más personas mejora el producto.',time:nowIso_()},
    {id:'seed-c5',post:'html_bot-post1',user:'css_bot',text:'Buena estructura + buen diseño = una interfaz mucho más clara.',time:nowIso_()},
    {id:'seed-c6',post:'html_bot-post2',user:'a11y_bot',text:'Un ALT útil describe la información importante, no solamente “imagen”.',time:nowIso_()},
    {id:'seed-c7',post:'css_bot-post3',user:'js_bot',text:'Responsive también significa pensar qué pasa cuando el contenido cambia o crece.',time:nowIso_()},
    {id:'seed-c8',post:'js_bot-post3',user:'byte_bot',text:'Evento → respuesta. Probá cambiar una sola acción y observá el resultado.',time:nowIso_()},
    {id:'seed-c9',post:'python_bot-post2',user:'profe_braian',text:'Depurar no es adivinar: es buscar evidencia paso a paso.',time:nowIso_()},
    {id:'seed-c10',post:'ia_bot-post1',user:'byte_bot',text:'Excelente regla: una IA puede ayudar, pero lo importante es verificar.',time:nowIso_()},
    {id:'seed-c11',post:'a11y_bot-post2',user:'html_bot',text:'La semántica y el foco visible ayudan muchísimo a la navegación con teclado.',time:nowIso_()},
    {id:'seed-c12',post:'lan_bot-post3',user:'js_bot',text:'AulaGram también es un buen ejemplo de cliente, servidor y datos que viajan por la red.',time:nowIso_()}
  ];
  const messages = [
    {id:'seed-m1',from:'byte_bot',to:'profe_braian',text:'AulaGram v8.3 inicializado. Escribí “menú” para probar mi base de conocimientos.',time:nowIso_(),read:false}
  ];
  return {follows:follows,likes:likes,comments:comments,messages:messages};
}

function setupAulaGramV7() {
  getSecret_();
  const root = rootFolder_();
  systemFolder_(); profilesFolder_(); backupsFolder_();
  const profilesFile = getJsonFile_('profiles', {});
  let profiles = jsonRead_('profiles', {});
  if (!Object.keys(profiles).length) {
    profiles = buildSeedProfiles_();
    jsonWrite_('profiles', profiles);
    const social = seedSocial_(profiles);
    jsonWrite_('likes', social.likes);
    jsonWrite_('comments', social.comments);
    jsonWrite_('follows', social.follows);
    jsonWrite_('messages', social.messages);
  } else {
    getJsonFile_('likes', {}); getJsonFile_('comments', []); getJsonFile_('follows', {}); getJsonFile_('messages', []);
  }
  if (!Object.keys(jsonRead_('settings', {})).length) jsonWrite_('settings', defaultSettings_());
  getJsonFile_('moderationLog', []);
  getJsonFile_('mutedUsers', {});
  if (!Object.keys(jsonRead_('moderationRules', {})).length) jsonWrite_('moderationRules', defaultModerationRules_());
  // Desde v7.2, setup también actualiza los perfiles oficiales/bots sin borrar estudiantes.
  const migration = migrarAulaGramV72();
  return {
    ok: true,
    version: AG.VERSION,
    rootFolderId: root.getId(),
    rootFolderName: root.getName(),
    profiles: Object.keys(jsonRead_('profiles',{})).length,
    migration: migration,
    message: 'AulaGram v8.3 quedó inicializado/migrado. Ejecutá diagnosticoAulaGramV8().'
  };
}

function migrarAulaGramV72() {
  const latest = buildSeedProfiles_();
  const profiles = jsonRead_('profiles', {});
  const seedAliases = Object.keys(latest);
  seedAliases.forEach(function(alias){
    const old = profiles[alias] || {};
    const fresh = latest[alias];
    fresh.tokenHash = old.tokenHash || '';
    fresh.sessionIssued = old.sessionIssued || '';
    fresh.recoveryHash = old.recoveryHash || '';
    profiles[alias] = fresh;
  });
  jsonWrite_('profiles', profiles);

  const seedSocial = seedSocial_(latest);
  const likes = jsonRead_('likes', {});
  // Los posts oficiales son contenido de demostración: actualizar sus reacciones base sin tocar posts de estudiantes.
  Object.keys(seedSocial.likes).forEach(function(pid){ likes[pid] = seedSocial.likes[pid]; });
  jsonWrite_('likes', likes);

  const follows = jsonRead_('follows', {});
  Object.keys(seedSocial.follows).forEach(function(target){
    follows[target] = follows[target] || [];
    seedSocial.follows[target].forEach(function(a){ if (follows[target].indexOf(a) < 0) follows[target].push(a); });
  });
  jsonWrite_('follows', follows);

  let comments = jsonRead_('comments', []).filter(function(c){ return String(c.id||'').indexOf('seed-') !== 0; });
  comments = comments.concat(seedSocial.comments);
  jsonWrite_('comments', comments);

  let messages = jsonRead_('messages', []).filter(function(m){ return String(m.id||'').indexOf('seed-') !== 0; });
  messages = messages.concat(seedSocial.messages);
  jsonWrite_('messages', messages);

  const settings = settings_();
  settings.version = AG.VERSION;
  jsonWrite_('settings', settings);
  return {ok:true,version:AG.VERSION,seedProfiles:seedAliases.length,totalProfiles:Object.keys(profiles).length,message:'Perfiles oficiales v8.3 actualizados. Se conservaron los perfiles de estudiantes.'};
}

function probarFluidezAulaGramV72() {
  const t0 = Date.now();
  const checks = [];
  function timed(name, fn){
    const a=Date.now();
    try { const v=fn(); checks.push({name:name,ok:true,ms:Date.now()-a,value:v}); }
    catch(e){ checks.push({name:name,ok:false,ms:Date.now()-a,value:String(e&&e.message?e.message:e)}); }
  }
  timed('Drive raíz', function(){ return rootFolder_().getName(); });
  timed('Perfiles cacheados', function(){ return Object.keys(jsonRead_('profiles',{})).length; });
  timed('Likes cacheados', function(){ return Object.keys(jsonRead_('likes',{})).length; });
  timed('Mensajes cacheados', function(){ return jsonRead_('messages',[]).length; });
  timed('Bots', function(){ return botReply_('byte_bot','¿Qué diferencia hay entre HTML y CSS?','prueba').slice(0,90); });
  const ok=checks.every(function(x){return x.ok;});
  const result={ok:ok,version:AG.VERSION,totalMs:Date.now()-t0,checks:checks};
  console.log(JSON.stringify(result,null,2));
  return result;
}

function diagnosticoAulaGramV7() {
  const checks = [];
  function check(name, fn) {
    try { const value = fn(); checks.push({name:name,ok:true,value:value}); }
    catch (e) { checks.push({name:name,ok:false,value:String(e && e.message ? e.message : e)}); }
  }
  check('Drive / carpeta raíz', function(){ return rootFolder_().getName(); });
  check('Carpeta sistema', function(){ return systemFolder_().getName(); });
  check('Carpeta perfiles', function(){ return profilesFolder_().getName(); });
  check('Perfiles base', function(){ return Object.keys(jsonRead_('profiles',{})).length; });
  check('Configuración', function(){ return jsonRead_('settings',{}).version || 'sin versión'; });
  check('CacheService', function(){ CacheService.getScriptCache().put('AG7_DIAG','ok',30); return CacheService.getScriptCache().get('AG7_DIAG'); });
  check('Reglas de moderación', function(){ const r=jsonRead_('moderationRules',{}); return (r.strong||[]).length + ' fuertes / ' + (r.context||[]).length + ' contextuales'; });
  check('Bloqueo de ejemplo', function(){ return moderateText_('andate a cagar','alumno1','alumno2','message').ok === false ? 'OK' : 'FALLÓ'; });
  check('Contexto permitido', function(){ return moderateText_('En el juego hay un NPC que vende pociones','alumno1','alumno2','message').ok ? 'OK' : 'FALLÓ'; });
  check('Bot HTML', function(){ return botReply_('html_bot','¿Qué hace h1?','prueba').slice(0,80); });
  check('Bot IA', function(){ return botReply_('ia_bot','¿Qué es una alucinación?','prueba').slice(0,80); });
  const ok = checks.every(function(c){ return c.ok; });
  console.log(JSON.stringify({ok:ok,checks:checks}, null, 2));
  return {ok:ok,checks:checks};
}
