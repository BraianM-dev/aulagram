# Backend de AulaGram · Google Apps Script

Este directorio contiene el backend que debe copiarse o importarse en un proyecto de **Google Apps Script**. GitHub Pages aloja la interfaz; Apps Script procesa sesiones, perfiles, publicaciones, moderación, bots y almacenamiento en Drive.

## Archivos

- `modular/*.gs`: backend completo dividido por responsabilidad para facilitar mantenimiento.
- `appsscript.json`: manifiesto del proyecto.

Los archivos `modular/*.gs` concatenados en orden numérico son exactamente equivalentes al `AulaGram.gs` monolítico v8.6.1.

## Instalación resumida

1. Crear un proyecto nuevo en Google Apps Script.
2. Crear un archivo `.gs` por cada archivo de `modular/` y copiar su contenido.
3. Reemplazar el manifiesto por `appsscript.json`.
4. Ejecutar una vez `configurarAulaGramSeguridad("CODIGO-DE-CLASE", "PIN-DOCENTE-SEGURO")` desde el editor.
5. Ejecutar `setupAulaGramV7()` para crear/actualizar la estructura de Drive.
6. Ejecutar `diagnosticoAulaGramV8()` y revisar el registro.
7. Implementar como **Aplicación web** ejecutando como el propietario y con el acceso necesario para el grupo.
8. Copiar la URL terminada en `/exec` a `assets/js/config.js` del frontend.
9. Cada vez que se modifica el backend, crear una **nueva versión del despliegue**.

## Credenciales

La v8.6.1 permite guardar el código de clase y el PIN docente en **Propiedades del script**. No se recomienda escribir credenciales reales en GitHub. Si no existen propiedades, el código usa los valores de respaldo `CAMBIAR-CODIGO` y `CAMBIAR-PIN`, que deben considerarse inválidos para producción.

## Antispam

El backend limita mensajes y comentarios mediante dos reglas complementarias:

- ráfaga: más de 6 envíos en 12 segundos;
- repetición: más de 2 envíos iguales dentro de 60 segundos.

Cuando se activa, aplica una pausa breve de 45 segundos y registra el evento para el panel docente. El estado temporal se guarda en `CacheService`; no se crea una segunda copia persistente del mensaje solo para detectar spam.

## Bots

Los bots son asistentes **basados en reglas y contenidos preparados**. No usan una API de IA externa. Además de contenidos educativos, reconocen saludos, presentación, agradecimientos, despedidas, preguntas como “¿cómo te llamás?” o “¿cómo estás?”, y algunos intercambios casuales.
