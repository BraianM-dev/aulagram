# AulaGram

**Red social educativa para 9.º EBI · HTML + CSS + accesibilidad + ciudadanía digital**

AulaGram convierte el perfil HTML/CSS de cada estudiante en parte de una pequeña comunidad educativa: feed, perfiles, seguimiento, likes, comentarios, mensajería moderable y bots temáticos. La evaluación se centra en el proceso y el aprendizaje, no en métricas de popularidad.

**Frontend:** https://braianm-dev.github.io/aulagram/

## Estado

Versión de mantenimiento **v8.6.1**. Conserva el frontend liviano de v8.6 y agrega documentación completa, plantilla pública del estudiante, backend reproducible, conversación casual de bots y antispam en mensajes/comentarios.

## Arquitectura

- **GitHub Pages:** interfaz HTML/CSS/JS.
- **Google Apps Script:** API/backend, sesiones, validación, moderación y bots.
- **Google Drive privado del docente:** perfiles, imágenes, JSON y respaldos.
- **Alumnado:** trabaja únicamente con `perfil.html`, `estilo.css` e imágenes locales.

## Estructura útil

- `backend/apps-script/` → instrucciones y código para Google Apps Script.
- `plantilla-alumno/` → material que se entrega a estudiantes.
- `docs/` → instalación, guía docente, guía estudiante, seguridad y arquitectura.
- `dist/` → paquete completo listo para descargar, incluido `AulaGram.gs`.
- `assets/` → frontend publicado por GitHub Pages.

## Instalación rápida del backend

En el paquete `dist/AulaGram_v8_6_1_COMPLETO.zip` está el backend completo. Después de copiar `AulaGram.gs` y `appsscript.json` a Apps Script, ejecutar:

```js
configurarAulaGramSeguridad("CODIGO-DE-CLASE", "PIN-DOCENTE-SEGURO")
```

Luego ejecutar `setupAulaGramV7()`, `diagnosticoAulaGramV8()` y desplegar como aplicación web. Las credenciales reales deben permanecer en **Propiedades del script**, no en GitHub.

## Bots educativos

Los bots son basados en reglas y no llaman a una IA externa. Además de respuestas educativas, entienden intercambios básicos como saludos, presentación, agradecimiento, despedida, `¿cómo te llamás?`, `¿cómo estás?`, `reto`, `quiz` y `dato random`.

## Antispam y moderación

A la moderación existente se suma control de frecuencia: limita ráfagas y repeticiones de mensajes/comentarios, aplica una pausa corta y registra el evento para el panel docente. Los límites se configuran en el objeto `AG` del backend.

## Privacidad

AulaGram utiliza alias y no requiere una cuenta personal propia de la aplicación. Se bloquea el envío de correos, teléfonos y enlaces en comentarios/mensajes. La mensajería es educativa y moderable por el docente; no se presenta como un canal privado frente al docente.

## Licencia

Código: **MIT**. Documentación y recursos educativos originales: **CC BY 4.0**. Ver `LICENSE` y `LICENSES/`.
