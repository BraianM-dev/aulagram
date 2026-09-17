/* AulaGram v8.7 · acceso docente claro sin modificar el backend */
(function(){
  'use strict';

  const TEACHER_ALIAS = 'profe_braian';

  if (typeof window.publishForms === 'function') {
    const originalPublishForms = window.publishForms;
    window.publishForms = function(){
      const base = originalPublishForms();
      const teacher = `
        <section class="card card-pad teacher-access-v87">
          <h2>Acceso docente</h2>
          <p class="small">
            El perfil <strong>@${TEACHER_ALIAS}</strong> ya existe y no usa código de recuperación.
            Para entrar como docente utilizá el PIN del Panel docente.
          </p>
          <a class="btn primary" href="#admin">Entrar como Profe Braian</a>
        </section>`;
      return base + teacher;
    };
  }

  if (typeof window.recoverProfile === 'function') {
    const originalRecoverProfile = window.recoverProfile;
    window.recoverProfile = async function(e){
      const input = document.querySelector('#recAlias');
      const alias = String(input && input.value || '').trim().toLowerCase();

      if (alias === TEACHER_ALIAS) {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();
        if (typeof window.toast === 'function') {
          window.toast('El perfil docente no usa código de recuperación. Ingresá con el PIN docente.');
        }
        location.hash = '#admin';
        return;
      }

      return originalRecoverProfile(e);
    };
  }
})();
