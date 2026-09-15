function botDisplayName_(bot) {
  const names={byte_bot:'Byte Bot',html_bot:'HTML Bot',css_bot:'CSS Bot',js_bot:'JS Bot',python_bot:'Python Bot',ia_bot:'IA Bot',a11y_bot:'A11y Bot',lan_bot:'LAN Bot',aulagram:'AulaGram'};
  return names[bot] || 'AulaGram Bot';
}

function botSmallTalk_(bot, q, from) {
  const name=botDisplayName_(bot);
  if (/^(hola+|buenas+|holi+|hey+|ey+|hello+)(\s|$)/.test(q) || hasAny_(q,['buen dia','buenas tardes','buenas noches']))
    return pick_(['¡Hola! Soy '+name+'. ¿En qué andás? Podés preguntarme algo de informática o escribir “menú”.','¡Buenas! 👋 Soy '+name+'. Contame qué estás haciendo y vemos cómo seguir.','¡Hola! ¿Todo bien? Si querés charlamos un poco o vamos directo a HTML, CSS, JS, Python, IA, redes o accesibilidad.']);
  if (hasAny_(q,['como te llamas','quien sos','quien eres','tu nombre'])) return 'Soy '+name+', uno de los asistentes educativos de AulaGram. No soy una persona real y respondo con reglas y contenidos preparados para esta actividad.';
  if (hasAny_(q,['como estas','todo bien','como andas'])) return pick_(['¡Funcionando y listo para ayudar! 😄 ¿Vos qué estás probando hoy?','Todo en orden por acá. Decime qué estás haciendo y te doy una mano sin hacerte toda la tarea.','Bien, gracias por preguntar. ¿Querés charlar, pedir un reto o consultar algo técnico?']);
  if (hasAny_(q,['gracias','muchas gracias','genial','me sirvio','me sirve'])) return pick_(['¡De nada! Si querés, probá lo que hiciste y contame qué resultado te dio.','¡Bien ahí! La mejor comprobación es probarlo. Si aparece un error, traeme la pista.','¡Me alegra que te sirva! Cuando quieras seguimos.']);
  if (hasAny_(q,['chau','adios','hasta luego','nos vemos'])) return pick_(['¡Nos vemos! Guardá tus cambios antes de cerrar. 👋','¡Hasta la próxima! Acordate: construir, probar y explicar.','¡Chau! Cuando vuelvas podés escribir “menú” para retomar.']);
  if (hasAny_(q,['estoy aburrido','me aburro','aburrido','aburrida'])) return 'Entonces te propongo algo corto: escribí “reto”, “quiz”, “dato random” o “chiste”. Elegí uno y arrancamos.';
  if (hasAny_(q,['que haces','que podes hacer','que puedes hacer'])) return botMenu_(bot);
  if (hasAny_(q,['sos una ia','eres una ia','sos un bot','eres un bot'])) return 'Soy un bot educativo de AulaGram basado en reglas y contenidos preparados. No uso una IA externa ni envío esta conversación a un modelo generativo.';
  if (hasAny_(q,['mi nombre es','me llamo '])) return 'Podés contarme cómo querés que te llame dentro de esta conversación, pero en AulaGram conviene usar el alias del perfil y evitar publicar tu nombre completo u otros datos personales.';
  return null;
}

function botReply_(bot, question, from) {
  const q=botNorm_(question);
  if(!q)return 'Escribime una pregunta o “menú”.';
  const casual=botSmallTalk_(bot,q,from);
  if(casual)return casual;
  if(hasAny_(q,['menu','menú','que sabes','ayuda']))return botMenu_(bot);
  if(hasAny_(q,['reto','desafio','desafío']))return botChallenge_();
  if(hasAny_(q,['quiz','pregunta flash','preguntame']))return botQuiz_();
  if(hasAny_(q,['dato random','dato curioso','random']))return botFact_();
  if(hasAny_(q,['chiste','joke']))return botJoke_();
  if(hasAny_(q,['haceme toda la tarea','hazme toda la tarea','resolve todo','resuelve todo']))return 'Puedo ayudarte a entender y revisar, pero no conviene saltarse el proceso. Decime qué parte te cuesta y la dividimos en pasos.';
  if(hasAny_(q,['pista']))return 'Pista general: nombrá qué esperabas ver, qué ves realmente y cuál fue el último cambio que hiciste. Esa comparación suele señalar dónde mirar.';
  const answer=botKnowledge_(bot,q);
  if(answer)return answer;
  return 'No entendí del todo esa pregunta. Probá reformularla con una palabra clave o un ejemplo. Puedo trabajar con HTML, CSS, JavaScript, Python, IA, accesibilidad/WCAG, LAN, IP, HTTP, redes, archivos, JSON, Git/GitHub, hardware, seguridad, ciudadanía digital, “reto”, “quiz” o “dato random”.';
}
