# Arquitectura técnica

```text
Navegador del estudiante
        │
        ├── GitHub Pages
        │      └── HTML + CSS + JavaScript del frontend
        │
        └── Google Apps Script /exec
               ├── validación de perfiles
               ├── sesiones y permisos
               ├── comentarios / mensajes / interacciones
               ├── moderación + antispam
               ├── bots educativos
               └── Google Drive privado del docente
```

## Decisiones principales

**GitHub Pages** sirve una interfaz estática y fácil de distribuir. **Apps Script** evita mantener un servidor propio y ejecuta la lógica de aplicación. **Drive** conserva los archivos y JSON del proyecto sin compartir directamente la carpeta con estudiantes.

El frontend no incrusta Apps Script mediante `iframe`. La comunicación se hace mediante el puente implementado por AulaGram para evitar las restricciones de `X-Frame-Options` que afectaron versiones anteriores.

Los perfiles HTML del alumnado se muestran dentro de un `iframe` aislado y sin JavaScript. El backend sanitiza el HTML y CSS y sustituye las imágenes locales por datos controlados antes de entregarlo.
