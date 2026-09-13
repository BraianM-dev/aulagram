# AulaGram v8 - Frontend GitHub Pages

Copiá el CONTENIDO de esta carpeta a tu repositorio, por ejemplo:

`aulagram/`

La URL quedará:
`https://braianm-dev.github.io/aulagram/`

## Configuración
El archivo `assets/js/config.js` ya contiene la URL de Apps Script que proporcionaste. Si alguna vez creás un despliegue nuevo, solo cambiá `BACKEND_URL` y volvé a subir ese archivo.

## Por qué v8 es más fluido
La navegación completa (Inicio, Explorar, Publicar, Mensajes, Actividad, Perfil y Accesibilidad) vive en GitHub Pages y nunca cambia de dominio ni recarga Apps Script. Un iframe oculto de 1 px mantiene una sola conexión con la Web App y usa `postMessage` + `google.script.run` para las operaciones de backend. Esto evita CORS y evita navegar por `script.googleusercontent.com`.
