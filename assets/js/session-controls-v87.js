/* AulaGram v8.7 · controles de sesión visibles sin tocar el backend */
(function(){
  'use strict';
  if(typeof window.appHeader !== 'function' || typeof window.logout !== 'function') return;

  const originalAppHeader = window.appHeader;

  window.appHeader = function(me, unread){
    let html = originalAppHeader(me, unread);
    if(!me) return html;

    /* Evita duplicar el botón antiguo de .session: conserva solo el alias. */
    html = html.replace(/\s·\s<button class="btn"[^>]*onclick="logout\(\)"[^>]*>Salir<\/button>/, '');

    /* Botón explícito en la navegación superior. */
    const desktopLogout = '<button class="nav-logout" type="button" onclick="logout()" title="Cerrar sesión" aria-label="Cerrar sesión">⏻ <span class="label">Salir</span></button>';
    html = html.replace('<button id="a11yOpen"', desktopLogout + '<button id="a11yOpen"');

    /* Botón para la barra inferior en móviles. */
    const mobileLogout = '<button class="bottom-logout" type="button" onclick="logout()" aria-label="Cerrar sesión"><span aria-hidden="true">⏻</span><span>Salir</span></button>';
    const lastNav = html.lastIndexOf('</nav>');
    if(lastNav >= 0) html = html.slice(0,lastNav) + mobileLogout + html.slice(lastNav);

    return html;
  };
})();
