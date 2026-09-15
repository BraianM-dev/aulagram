function botKnowledge_(bot,q){
  // Comparaciones frecuentes
  if(hasAny_(q,['diferencia entre html css javascript','html css javascript diferencia','html vs css vs javascript','html css js']))return 'HTML organiza la estructura y el significado; CSS controla gran parte de la apariencia; JavaScript agrega comportamiento e interacción. Pensalo como estructura, estilo y acciones.';
  if(hasAny_(q,['diferencia entre html y css','html vs css','html css diferencia']))return 'HTML define la estructura y el significado del contenido; CSS define cómo se presenta visualmente. Un mismo HTML puede verse muy distinto cambiando solamente el CSS.';
  if(hasAny_(q,['diferencia entre javascript y python','javascript vs python','js vs python']))return 'JavaScript nació muy ligado a la Web y corre directamente en el navegador; Python es un lenguaje general muy usado en automatización, datos, web e IA. Ambos pueden programar lógica, pero sus entornos y sintaxis son diferentes.';
  if(hasAny_(q,['diferencia entre frontend y backend','frontend vs backend']))return 'Frontend es la interfaz que usa una persona; backend procesa reglas, permisos y datos. En AulaGram v8 el frontend está en GitHub Pages y el backend está en Google Apps Script.';
  // HTML
  if(hasAny_(q,['doctype']))return '<!DOCTYPE html> le indica al navegador que el documento usa HTML moderno. Suele ser la primera línea.';
  if(hasAny_(q,['que es html','para que sirve html']))return 'HTML organiza la estructura y el significado del contenido: títulos, párrafos, imágenes, enlaces, listas, secciones y más. No es un lenguaje de programación general.';
  if(hasAny_(q,['<h1',' h1','encabezado principal']))return '<h1> representa el encabezado principal de una página o sección principal. En una página sencilla suele existir un h1 claro que explique de qué trata.';
  if(hasAny_(q,['h2','h3','jerarquia de titulos']))return 'h1, h2, h3… expresan niveles de jerarquía. No conviene elegirlos solo por tamaño visual: el tamaño se controla con CSS.';
  if(hasAny_(q,['alt','texto alternativo']))return 'alt describe el propósito o contenido importante de una imagen. Si la imagen es decorativa, alt="" puede ser apropiado. Evitá escribir “imagen de” si no aporta información.';
  if(hasAny_(q,['href','enlace','link']))return 'href indica el destino de un enlace <a>. Para recursos de tu propia carpeta convienen rutas relativas; para sitios externos se usa una URL completa.';
  if(hasAny_(q,['src','ruta relativa','rutas relativas']))return 'src indica de dónde cargar un recurso. “imagenes/foto.jpg” es una ruta relativa: parte desde la ubicación del archivo HTML. Si la ruta está mal, la imagen rota deja una pista visible.';
  if(hasAny_(q,['div','section','article']))return 'div es un contenedor genérico. section agrupa una sección temática y article representa contenido que podría tener sentido por sí mismo, como una publicación.';
  if(hasAny_(q,['header','nav','main','footer','semantica']))return 'HTML semántico usa etiquetas como header, nav, main, section, article y footer para describir mejor la función del contenido. Ayuda a organización y accesibilidad.';
  if(hasAny_(q,['ul','ol','li','lista']))return '<ul> crea una lista sin orden numérico; <ol> una lista ordenada; cada elemento se escribe con <li>.';
  if(hasAny_(q,['strong',' em ','enfasis']))return '<strong> indica importancia y <em> énfasis. No son simplemente “negrita” y “cursiva”; aportan significado.';
  if(hasAny_(q,['atributo','atributos html']))return 'Un atributo agrega información a una etiqueta, por ejemplo class, id, src, alt o href. Se escribe dentro de la etiqueta de apertura.';

  // CSS
  if(hasAny_(q,['que es css','para que sirve css']))return 'CSS define la presentación: colores, tamaños, espacios, bordes, distribución, responsive y animaciones. Se aplica mediante selectores y reglas.';
  if(hasAny_(q,['margin','padding']))return 'En el modelo de caja, padding es espacio entre contenido y borde; margin es espacio por fuera del borde. Probá cambiar uno a la vez para ver la huella.';
  if(hasAny_(q,['box model','modelo de caja']))return 'El modelo de caja se puede pensar como content → padding → border → margin. width/height suelen describir el área de contenido salvo que uses box-sizing:border-box.';
  if(hasAny_(q,['flexbox','display flex','justify-content','align-items']))return 'Flexbox organiza elementos principalmente en una dimensión. display:flex activa el contenedor; justify-content distribuye sobre el eje principal y align-items sobre el eje cruzado.';
  if(hasAny_(q,['css grid','display grid','grid-template']))return 'CSS Grid organiza filas y columnas. grid-template-columns: repeat(3,1fr) crea tres columnas del mismo ancho.';
  if(hasAny_(q,['hover',':hover']))return ':hover aplica estilos mientras el puntero está sobre un elemento. No bases una función importante únicamente en hover porque en pantallas táctiles puede no existir.';
  if(hasAny_(q,['media query','@media','responsive']))return 'Una media query aplica reglas según condiciones como el ancho. Responsive significa adaptar la interfaz sin perder contenido ni funcionalidad.';
  if(hasAny_(q,['especificidad','cascada']))return 'La cascada decide qué regla gana considerando origen, importancia, especificidad y orden. Un selector más específico suele imponerse, pero abusar de !important dificulta mantener CSS.';
  if(hasAny_(q,['border-radius','redondear']))return 'border-radius redondea las esquinas. Con 50% sobre una imagen cuadrada podés obtener un círculo.';
  if(hasAny_(q,['object-fit']))return 'object-fit:cover hace que una imagen llene su caja conservando proporción, recortando lo que sobra. contain muestra todo pero puede dejar espacio vacío.';
  if(hasAny_(q,['rem','em','px','unidades css']))return 'px es una unidad CSS fija relativa al píxel de referencia; rem depende del tamaño raíz y em del tamaño del contexto. Para texto y espaciado, rem suele facilitar escalado.';
  if(hasAny_(q,['prefers-reduced-motion','movimiento reducido']))return 'prefers-reduced-motion permite detectar que la persona prefiere menos movimiento. Podés reducir o quitar animaciones no esenciales con una media query.';

  // JavaScript
  if(hasAny_(q,['que es javascript','para que sirve javascript']))return 'JavaScript agrega comportamiento e interacción en el navegador: eventos, cambios del DOM, validaciones, almacenamiento local y comunicación con servidores.';
  if(hasAny_(q,['let','const','var']))return 'En JavaScript moderno, const se usa cuando no vas a reasignar la variable y let cuando sí. var es más antiguo y tiene reglas de alcance diferentes; para empezar conviene priorizar const y let.';
  if(hasAny_(q,['dom','document object model']))return 'El DOM es la representación de la página que el navegador construye a partir del HTML. JavaScript puede buscar nodos, leerlos, modificarlos o crear otros.';
  if(hasAny_(q,['queryselector','queryselectorall']))return 'document.querySelector(".clase") devuelve el primer elemento que coincide; querySelectorAll devuelve una colección de coincidencias.';
  if(hasAny_(q,['addeventlistener','evento','keydown','click']))return 'addEventListener permite reaccionar a eventos. Ejemplo conceptual: boton.addEventListener("click", funcion). También existen input, submit, keydown y muchos más.';
  if(hasAny_(q,['array','arreglo']))return 'Un array guarda una secuencia de valores. Se accede por índice empezando en 0. Ejemplo: const colores=["rojo","azul"]; colores[0] es “rojo”.';
  if(hasAny_(q,['funcion javascript','function','arrow function']))return 'Una función agrupa instrucciones reutilizables. Puede recibir parámetros y devolver un resultado con return. Las arrow functions son una sintaxis moderna para muchas funciones.';
  if(hasAny_(q,['localstorage']))return 'localStorage guarda pares clave/valor en el navegador y persiste entre recargas. Guarda texto, por eso objetos suelen convertirse con JSON.stringify y JSON.parse.';
  if(hasAny_(q,['fetch','api']))return 'fetch permite hacer solicitudes HTTP desde JavaScript. Una API define una forma acordada de pedir o enviar datos entre programas.';
  if(hasAny_(q,['json']))return 'JSON representa datos con objetos, arrays, números, texto, booleanos y null. Se parece a objetos de JavaScript, pero es un formato de texto con reglas propias.';
  if(hasAny_(q,['textcontent','innerhtml']))return 'textContent trata el contenido como texto. innerHTML interpreta HTML; por eso usar innerHTML con texto no confiable puede crear problemas de seguridad.';

  // Python / programación
  if(hasAny_(q,['que es python','para que sirve python']))return 'Python es un lenguaje de programación general, conocido por una sintaxis legible. Se usa en automatización, web, datos, IA y educación.';
  if(hasAny_(q,['input()',' input ','input en python']))return 'input() muestra opcionalmente un mensaje y devuelve texto. Si necesitás un número, convertí: edad = int(input("Edad: ")).';
  if(hasAny_(q,['print()',' print ','print en python']))return 'print() muestra información. Es útil para resultados y también para depurar observando valores intermedios.';
  if(hasAny_(q,['if','elif','else']))return 'if evalúa una condición; elif permite probar otra si la anterior fue falsa; else cubre el caso restante. La indentación define los bloques.';
  if(hasAny_(q,['while']))return 'while repite mientras una condición sea verdadera. Asegurate de que algo cambie para que el ciclo pueda terminar y evitar un bucle infinito.';
  if(hasAny_(q,['for','range']))return 'for recorre una secuencia. range(5) produce 0,1,2,3,4. Ejemplo: for i in range(5): print(i).';
  if(hasAny_(q,['lista','append','indice']))return 'Una lista de Python guarda valores ordenados y mutables. Los índices empiezan en 0. append(valor) agrega un elemento al final.';
  if(hasAny_(q,['diccionario','dictionary','dict']))return 'Un diccionario guarda pares clave:valor. Ejemplo: personaje={"vida":100,"nivel":2}. Se accede con personaje["vida"].';
  if(hasAny_(q,['and','or','not','operadores logicos']))return 'and exige que ambas condiciones sean verdaderas; or que al menos una lo sea; not invierte un booleano. Conviene leer la condición completa en voz alta.';
  if(hasAny_(q,['funcion python','def ']))return 'En Python una función se define con def nombre(parametros): y puede devolver un valor con return. Sirve para organizar y reutilizar lógica.';
  if(hasAny_(q,['try','except','excepcion']))return 'try/except permite manejar errores esperables. No conviene usarlo para ocultar cualquier error: primero entendé qué excepción puede ocurrir.';
  if(hasAny_(q,['debug','depurar','no funciona','error']))return 'Depurar es investigar. 1) decí qué esperabas; 2) observá qué ocurrió; 3) leé el error; 4) aislá una parte; 5) cambiá una sola cosa; 6) probá de nuevo.';
  if(hasAny_(q,['algoritmo']))return 'Un algoritmo es una secuencia finita y ordenada de pasos para resolver un problema. Puede escribirse con lenguaje natural, diagramas, pseudocódigo o código.';

  // IA
  if(hasAny_(q,['que es ia','inteligencia artificial']))return 'IA es un conjunto amplio de técnicas para construir sistemas que realizan tareas asociadas con percepción, predicción, lenguaje, decisión o generación. No existe una única “IA”.';
  if(hasAny_(q,['machine learning','aprendizaje automatico']))return 'Machine Learning busca modelos que aprendan patrones a partir de datos en vez de programar manualmente cada regla.';
  if(hasAny_(q,['ia generativa','generative ai']))return 'La IA generativa produce contenido nuevo como texto, imágenes, audio o código a partir de patrones aprendidos en datos.';
  if(hasAny_(q,['llm','modelo de lenguaje']))return 'Un LLM es un modelo de lenguaje grande que trabaja con secuencias de tokens y aprende patrones estadísticos del lenguaje. Puede ser útil y también equivocarse.';
  if(hasAny_(q,['alucinacion','hallucination']))return 'Una alucinación ocurre cuando un sistema generativo produce información falsa o sin respaldo con apariencia convincente. La respuesta debe verificarse.';
  if(hasAny_(q,['prompt']))return 'Un buen prompt suele incluir objetivo, contexto, restricciones y formato esperado. También ayuda pedir que explique supuestos o señale incertidumbres.';
  if(hasAny_(q,['token']))return 'Un token es una unidad en la que un modelo de lenguaje divide el texto. No coincide necesariamente con una palabra completa.';
  if(hasAny_(q,['embedding','embeddings']))return 'Un embedding representa información como números en un espacio vectorial, de forma que elementos parecidos puedan quedar cercanos. Se usa, por ejemplo, en búsquedas semánticas.';
  if(hasAny_(q,['rag']))return 'RAG combina recuperación de información con generación: primero busca fragmentos relevantes y luego los usa como contexto para responder. Ayuda a fundamentar mejor, aunque no elimina todos los errores.';
  if(hasAny_(q,['sesgo','bias']))return 'Un sistema puede reflejar sesgos presentes en datos, decisiones de diseño o contexto de uso. Evaluar resultados requiere preguntar quién queda representado y quién puede resultar perjudicado.';
  if(hasAny_(q,['deepfake']))return 'Un deepfake es contenido sintético o manipulado que imita apariencia o voz. Conviene verificar fuente, contexto y evidencia antes de compartirlo.';
  if(hasAny_(q,['ollama','modelo local']))return 'Un modelo local se ejecuta en tu propio equipo o servidor. Puede mejorar control y privacidad, pero necesita recursos y sigue pudiendo equivocarse.';

  // Accesibilidad / DUA
  if(hasAny_(q,['wcag']))return 'WCAG son pautas internacionales de accesibilidad web. Se organizan alrededor de que el contenido sea perceptible, operable, comprensible y robusto.';
  if(hasAny_(q,['contraste']))return 'El contraste ayuda a distinguir texto y controles del fondo. No alcanza con “se ve bien en mi pantalla”: conviene medirlo y probar distintos modos.';
  if(hasAny_(q,['teclado','tab','foco']))return 'Una interfaz accesible debe permitir usar las funciones importantes con teclado. El foco visible muestra qué elemento recibirá la próxima acción.';
  if(hasAny_(q,['lector de pantalla','screen reader']))return 'Un lector de pantalla convierte información de la interfaz en voz o braille. HTML semántico, labels y alt ayudan a ofrecer una estructura comprensible.';
  if(hasAny_(q,['aria']))return 'ARIA agrega información de accesibilidad cuando HTML nativo no alcanza. Regla útil: preferí primero elementos HTML correctos; no uses ARIA para arreglar una estructura incorrecta.';
  if(hasAny_(q,['reflow','zoom','200%']))return 'Al aumentar texto o zoom, el contenido debería reorganizarse sin quedar cortado. Reflow describe esa capacidad de adaptarse al espacio disponible.';
  if(hasAny_(q,['dua','diseno universal para el aprendizaje']))return 'DUA es un marco pedagógico para contemplar la variabilidad del alumnado mediante opciones de compromiso, representación y acción/expresión. No es lo mismo que WCAG, que se centra en accesibilidad web.';
  if(hasAny_(q,['dislexia','lectura amigable']))return 'No hay una única fuente “para dislexia” que funcione para todas las personas. Dar opciones de tipografía, tamaño, espaciado y contraste suele ser más útil que imponer una sola solución.';

  // Redes / web
  if(hasAny_(q,['que es lan','red local']))return 'Una LAN conecta dispositivos en un área cercana, como un salón o edificio. Puede funcionar sin Internet; Internet conecta muchas redes entre sí.';
  if(hasAny_(q,['ip','direccion ip']))return 'Una dirección IP identifica una interfaz dentro de una red IP. IPv4 suele verse como cuatro números separados por puntos, por ejemplo 192.168.1.10.';
  if(hasAny_(q,['dns']))return 'DNS traduce nombres como ejemplo.org a direcciones IP, entre otras funciones. Es como un sistema distribuido de nombres para Internet.';
  if(hasAny_(q,['dhcp']))return 'DHCP puede asignar automáticamente configuración de red como IP, máscara, puerta de enlace y DNS a los equipos.';
  if(hasAny_(q,['router','switch']))return 'Un switch conecta dispositivos dentro de una red local; un router comunica redes diferentes y decide por dónde enviar paquetes. Muchos routers domésticos incluyen además switch y Wi‑Fi.';
  if(hasAny_(q,['http','https']))return 'HTTP define cómo clientes y servidores intercambian solicitudes y respuestas web. HTTPS agrega cifrado y autenticación mediante TLS.';
  if(hasAny_(q,['cliente','servidor']))return 'Un cliente solicita un servicio; un servidor responde. En AulaGram, tu navegador es cliente y la Web App de Apps Script actúa como servidor de la aplicación.';
  if(hasAny_(q,['puerto','puertos de red']))return 'Un puerto identifica un servicio dentro de un equipo. HTTP suele asociarse al 80 y HTTPS al 443, aunque pueden usarse otros.';
  if(hasAny_(q,['nube','cloud']))return 'La nube significa usar infraestructura remota accesible por red para ejecutar servicios o guardar datos. AulaGram v8 usa GitHub Pages para la interfaz y Apps Script + Drive para el backend, por eso la parte social necesita Internet.';
  if(hasAny_(q,['xampp','apache']))return 'XAMPP agrupa herramientas como Apache y PHP para montar un servidor local. AulaGram v6 usaba XAMPP; v8 usa GitHub Pages + Apps Script para no depender de una PC encendida como servidor.';

  // Seguridad / ciudadanía
  if(hasAny_(q,['phishing']))return 'Phishing intenta engañarte para que entregues datos o abras enlaces/archivos maliciosos. Verificá remitente, dominio, urgencia sospechosa y nunca compartas contraseñas.';
  if(hasAny_(q,['malware']))return 'Malware es software malicioso. Incluye, entre otros, troyanos, spyware, ransomware, gusanos y keyloggers.';
  if(hasAny_(q,['ransomware']))return 'Ransomware busca bloquear o cifrar información y exigir un pago. Copias de seguridad, actualizaciones y cuidado con archivos/enlaces reducen riesgo.';
  if(hasAny_(q,['2fa','doble factor','dos factores']))return '2FA agrega una segunda prueba además de la contraseña. Ayuda a proteger una cuenta aunque la contraseña sea descubierta.';
  if(hasAny_(q,['password','contrasena','contraseña']))return 'Una buena contraseña es larga, única y difícil de adivinar. Un gestor de contraseñas ayuda a no reutilizarlas. Nunca publiques contraseñas en AulaGram.';
  if(hasAny_(q,['huella digital']))return 'La huella digital es el rastro de acciones y contenidos asociados a nuestra actividad digital. Pensar antes de publicar ayuda a cuidar identidad y privacidad.';
  if(hasAny_(q,['ciberacoso','ciberbullying']))return 'El ciberacoso implica hostigamiento mediante medios digitales. No lo normalices ni lo multipliques: guardá evidencia, pedí ayuda a un adulto de confianza y usá mecanismos de moderación.';
  if(hasAny_(q,['creative commons','cc by','licencia']))return 'Creative Commons ofrece licencias para comunicar qué usos autoriza una obra. Es importante revisar la licencia concreta y respetar requisitos como atribución.';

  // Hardware/datos/herramientas
  if(hasAny_(q,['cpu','procesador']))return 'La CPU ejecuta instrucciones y coordina gran parte del procesamiento. Núcleos y frecuencia influyen, pero el rendimiento depende de muchos factores.';
  if(hasAny_(q,['ram']))return 'La RAM guarda temporalmente datos y programas en uso. Es rápida pero volátil: al apagar el equipo su contenido se pierde.';
  if(hasAny_(q,['ssd','disco']))return 'SSD es almacenamiento persistente basado en memoria flash. Suele ser mucho más rápido que un disco duro mecánico para iniciar y abrir archivos.';
  if(hasAny_(q,['gpu','tarjeta grafica']))return 'Una GPU procesa muchas operaciones en paralelo y se usa en gráficos, video, simulación y también entrenamiento/inferencia de algunos modelos de IA.';
  if(hasAny_(q,['sistema operativo','linux','windows']))return 'El sistema operativo administra hardware, archivos, procesos, memoria y ofrece servicios para las aplicaciones. Linux, Windows, macOS, Android e iOS son ejemplos.';
  if(hasAny_(q,['bit','byte','binario']))return 'Un bit puede representar 0 o 1. Ocho bits forman un byte. El sistema binario usa base 2 y es fundamental para representar información digital.';
  if(hasAny_(q,['hexadecimal','hex']))return 'Hexadecimal usa 16 símbolos: 0–9 y A–F. En CSS, #FF0000 representa rojo usando pares hexadecimales para R, G y B.';
  if(hasAny_(q,['unicode','emoji']))return 'Unicode asigna códigos a caracteres de muchísimos sistemas de escritura y símbolos, incluidos emojis. UTF‑8 es una codificación muy usada para representarlos.';
  if(hasAny_(q,['git','github']))return 'Git es un sistema de control de versiones distribuido. GitHub es una plataforma que aloja repositorios Git y agrega colaboración, issues, Pages y otras funciones.';
  if(hasAny_(q,['base de datos','sql']))return 'Una base de datos organiza información para consultarla y actualizarla. SQL es un lenguaje usado por muchos sistemas relacionales para consultar y modificar datos.';
  if(hasAny_(q,['frontend','backend']))return 'Frontend es la parte con la que interactúa el usuario; backend procesa lógica y datos del lado del servidor. AulaGram v8 tiene el frontend en GitHub Pages y un backend Apps Script conectado mediante un puente oculto.';
  if(hasAny_(q,['jpg','jpeg','png','webp','gif','imagen']))return 'JPG suele ser útil para fotos; PNG conserva transparencia y gráficos nítidos; WebP puede reducir tamaño manteniendo buena calidad. Optimizar imágenes mejora la carga.';
  if(hasAny_(q,['compresion','comprimir']))return 'Compresión reduce el tamaño de los datos. Puede ser sin pérdida o con pérdida. En imágenes, reducir dimensiones y elegir un formato adecuado puede ahorrar mucho peso.';

  // Temas casuales conectados con informática
  if(hasAny_(q,['videojuego','gaming','minecraft','roblox']))return 'Los videojuegos combinan programación, gráficos, sonido, redes, datos e interacción. Si querés, podemos conectar ese tema con variables, eventos, físicas o cliente/servidor.';
  if(hasAny_(q,['musica','spotify','audio']))return 'El audio digital se representa mediante muestras numéricas. Compresión, streaming, redes y recomendaciones algorítmicas conectan música con informática.';
  if(hasAny_(q,['futbol','deporte']))return 'La informática aparece en deportes mediante sensores, estadísticas, video, transmisión, entradas y análisis de datos. ¿Querés convertir el tema en un pequeño proyecto de datos?';
  return null;
}
