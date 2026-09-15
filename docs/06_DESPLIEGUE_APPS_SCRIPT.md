# Despliegue del backend en Google Apps Script

## Primera instalación

1. Abrir Google Apps Script y crear un proyecto vacío.
2. Crear en Apps Script los archivos `.gs` que aparecen en `backend/apps-script/modular/` y copiar sus contenidos.
3. Activar la edición del manifiesto y copiar `backend/apps-script/appsscript.json`.
4. Desde el editor ejecutar, con valores propios:

```js
configurarAulaGramSeguridad("CODIGO-DE-CLASE", "PIN-DOCENTE-SEGURO")
```

5. Ejecutar `setupAulaGramV7()` y conceder permisos sobre Drive.
6. Ejecutar `diagnosticoAulaGramV8()`.
7. Implementar → **Nueva implementación** → **Aplicación web**.
8. Ejecutar como propietario del proyecto y elegir el nivel de acceso compatible con el entorno educativo.
9. Copiar la URL `/exec` al frontend (`assets/js/config.js`).

## Actualización de una instalación existente

1. Crear un respaldo desde el panel docente.
2. Reemplazar el código del proyecto por la nueva versión modular.
3. Conservar las Propiedades del script existentes.
4. Ejecutar el diagnóstico.
5. En **Administrar implementaciones**, editar el despliegue y seleccionar una versión nueva.
6. Mantener la misma URL `/exec` siempre que se actualice el mismo despliegue.
7. Probar entrada, publicación, comentario, mensajes, bots y panel docente antes de usarlo con todo el grupo.
