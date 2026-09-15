# Estructura del repositorio

```text
/
├── index.html                 # interfaz publicada en GitHub Pages
├── 404.html
├── sw.js
├── assets/
│   ├── css/                   # estilos de AulaGram
│   └── js/                    # frontend, puente y accesibilidad
├── backend/
│   └── apps-script/           # código que va en Google Apps Script
├── plantilla-alumno/          # archivos que recibe y edita el estudiante
│   ├── perfil.html
│   ├── estilo.css
│   └── imagenes/
├── docs/                      # documentación docente/técnica/estudiante
├── LICENSE                    # esquema de licenciamiento
└── LICENSES/
```

El frontend publicado y el backend se mantienen separados deliberadamente: GitHub Pages no ejecuta código de servidor y Google Apps Script no debe usarse como `iframe` de interfaz.
