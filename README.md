# AulaGram v8.3 - Frontend GitHub Pages

AulaGram usa GitHub Pages para toda la interfaz y Google Apps Script + Google Drive para persistencia y lógica del servidor.

- Interfaz: https://braianm-dev.github.io/aulagram/
- Panel docente: https://braianm-dev.github.io/aulagram/#admin
- Transporte: `fetch(..., mode: "no-cors")` para escrituras y JSONP para lecturas/resultados. No se incrusta Apps Script en iframes.

## v8.3

- Publicaciones iniciales renovadas con 30 tarjetas visuales y 10 avatares, generados localmente en el navegador y cacheados durante la sesión.
- Frases y textos renovados para HTML, CSS, JavaScript, Python, IA, accesibilidad, redes y ciudadanía digital.
- Botón docente visible para activar/pausar AulaGram.
- Exportación de mensajes a CSV/JSON desde el panel docente (requiere backend v8.3).
- Centro de accesibilidad: tema, alto contraste, lectura amigable, texto 100-200 %, espaciado, movimiento, subrayado de enlaces y foco reforzado. Escape cierra el panel y Tab queda contenido en el diálogo.
- Carga diferida (`loading=lazy`) y decodificación asíncrona de imágenes.
- Las imágenes oficiales no consumen Drive ni llamadas RPC.

## Backend

En el paquete de respaldo completo se incluye el código de Google Apps Script. Antes de desplegar, cambiá `CLASS_CODE` y `ADMIN_PIN` únicamente en Apps Script. No publiques el PIN real en este repositorio.

Después de actualizar el backend ejecutá `setupAulaGramV7()` y `diagnosticoAulaGramV8()`, y publicá una nueva versión del mismo despliegue `/exec`.
