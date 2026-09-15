/** Chatbots educativos basados en reglas. No usan APIs externas. */
function botNorm_(text) {
  let q=String(text||'').toLowerCase();
  try{q=q.normalize('NFD').replace(/[\u0300-\u036f]/g,'');}catch(e){}
  q=q.replace(/htlm/g,'html').replace(/ccs/g,'css').replace(/pyton/g,'python').replace(/javscript/g,'javascript').replace(/internte/g,'internet').replace(/servidro/g,'servidor');
  return q.replace(/\s+/g,' ').trim();
}

function hasAny_(q,terms){
  return terms.some(function(t){
    t=String(t||'').toLowerCase();
    if(!t)return false;
    if(/^[a-z0-9_]+$/.test(t)){
      const e=t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
      return new RegExp('(?:^|[^a-z0-9_])'+e+'(?:$|[^a-z0-9_])','i').test(q);
    }
    return q.indexOf(t)>=0;
  });
}
function pick_(arr){return arr[Math.floor(Math.random()*arr.length)];}

function botMenu_(bot){
  const common='También podés escribir: reto, quiz, dato random, chiste, pista o depurar.';
  const map={
    html_bot:'HTML: estructura, etiquetas, semántica, atributos, imágenes, alt, enlaces, listas y rutas. '+common,
    css_bot:'CSS: selectores, cascada, caja, color, tipografía, Flexbox, Grid, responsive, hover y animaciones. '+common,
    js_bot:'JavaScript: variables, tipos, condicionales, bucles, funciones, arrays, DOM, eventos, JSON, localStorage y fetch. '+common,
    python_bot:'Python: variables, input/print, tipos, if/elif/else, while, for, range, listas, diccionarios, funciones, random y errores. '+common,
    ia_bot:'IA: machine learning, IA generativa, LLM, prompts, tokens, embeddings, RAG, sesgos, alucinaciones, deepfakes y uso responsable. '+common,
    a11y_bot:'Accesibilidad: WCAG, contraste, alt, teclado, foco, zoom/reflow, movimiento reducido, ARIA y DUA vs WCAG. '+common,
    lan_bot:'Redes: LAN, Internet, IP, DNS, DHCP, router, switch, HTTP/HTTPS, puertos, cliente/servidor, nube y XAMPP. '+common,
    aulagram:'AulaGram: publicar perfil, recuperar identidad, accesibilidad, convivencia, bots, feed, comentarios y mensajes. '+common
  };
  return map[bot] || 'Temas: HTML, CSS, JavaScript, Python, IA, accesibilidad, redes, seguridad, hardware, datos, Git/GitHub y ciudadanía digital. '+common;
}

function botChallenge_(){return pick_([
  'Reto HTML: agregá una lista con tres intereses y comprobá que siga teniendo sentido si quitás el CSS.',
  'Reto CSS: cambiá padding y margin por separado en una tarjeta. Explicá qué espacio modifica cada propiedad.',
  'Reto responsive: achicá la ventana hasta tamaño celular. Detectá una cosa que se rompa y corregila sin borrar contenido.',
  'Reto accesibilidad: recorré la página solo con Tab y Shift+Tab. ¿Siempre ves dónde está el foco?',
  'Reto de rutas: escribí temporalmente mal la ruta de una imagen, observá la huella del error y corregila.',
  'Reto JS conceptual: pensá qué evento usarías para reaccionar cuando una persona presiona un botón. ¿click, input o load?',
  'Reto Python: creá una variable puntos=0 y pensá cómo cambiaría con botones +1, -1 y x2.',
  'Reto de redes: explicá con tus palabras por qué una LAN puede funcionar aunque no haya Internet.',
  'Reto IA: pedile a una IA una explicación de un tema que ya conozcas y buscá un dato que debas verificar.'
]);}
function botQuiz_(){return pick_([
  'Quiz: ¿qué diferencia principal hay entre HTML, CSS y JavaScript? Respondé antes de pedirme la pista.',
  'Quiz: ¿padding está dentro o fuera del borde? ¿Y margin?',
  'Quiz: ¿qué atributo de <img> ayuda a describir una imagen cuando no se puede ver?',
  'Quiz: ¿un switch y un router hacen exactamente lo mismo? Explicá tu respuesta.',
  'Quiz: ¿qué devuelve input() en Python antes de convertirlo?',
  'Quiz: ¿const y let son exactamente iguales en JavaScript?',
  'Quiz: ¿una respuesta de IA generativa debe considerarse automáticamente verdadera?',
  'Quiz: ¿qué significa que una página sea usable con teclado?'
]);}
function botFact_(){return pick_([
  'Dato random: 1 byte está formado por 8 bits.',
  'Dato random: 127.0.0.1 suele representar la propia computadora y se conoce como localhost.',
  'Dato random: una LAN puede funcionar aunque no tenga salida a Internet.',
  'Dato random: HTML describe estructura y significado; CSS describe gran parte de la presentación.',
  'Dato random: JSON es texto estructurado y se usa mucho para intercambiar datos entre programas.',
  'Dato random: Unicode permite representar caracteres de muchísimos idiomas y también emojis.',
  'Dato random: WebP puede comprimir imágenes con muy buen equilibrio entre tamaño y calidad.',
  'Dato random: un modelo generativo no “busca la verdad”; calcula continuaciones probables a partir de patrones aprendidos.'
]);}
function botJoke_(){return pick_([
  'Chiste informático: intenté discutir con margin, pero necesitaba su espacio. 😄',
  'El router organizó una fiesta, pero solo dejó entrar a quienes estaban en la misma red. 😄',
  '¿Por qué el CSS fue al psicólogo? Porque tenía demasiados problemas de estilo. 😄',
  'Mi código funciona… no sé por qué. Mi código no funciona… tampoco sé por qué. Bienvenido a depurar. 😄'
]);}
