# Seguridad, privacidad, moderación y antispam

AulaGram es un recurso educativo, no una plataforma privada de mensajería. Se minimizan datos personales mediante alias y se evita pedir correo, teléfono o cuentas externas.

## Controles implementados

- código de clase con token de acceso temporal;
- sesión de perfil y sesión docente separadas;
- PIN docente almacenado preferentemente en Propiedades del script;
- sanitización del HTML/CSS del estudiante;
- `iframe` aislado para mostrar diseños;
- bloqueo de correo, teléfono y enlaces externos en comentarios/mensajes;
- reglas de lenguaje fuerte y reglas contextuales;
- pausa automática tras intentos repetidos rechazados;
- antispam por ráfaga y repetición;
- posibilidad de silenciar usuarios y retirar contenido desde el panel docente;
- respaldo de datos.

## Límites antispam iniciales

Los valores se encuentran en `AG` dentro del backend y pueden ajustarse:

```js
SPAM_WINDOW_SECONDS: 12,
SPAM_MAX_ACTIONS: 6,
SPAM_REPEAT_WINDOW_SECONDS: 60,
SPAM_MAX_REPEAT: 2,
SPAM_COOLDOWN_SECONDS: 45
```

Estos límites buscan frenar automatismos o insistencia repetitiva sin castigar el uso normal de la clase.

## Recomendaciones operativas

No publicar PIN ni código real en el repositorio; renovar el PIN si se compartió accidentalmente; revisar el log de moderación durante la actividad; mantener el panel docente cerrado cuando no se use; crear respaldos antes de reiniciar interacciones o mensajes.
