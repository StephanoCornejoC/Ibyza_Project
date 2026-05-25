/**
 * Persistencia del scroll del sidebar del admin (django-unfold).
 *
 * Problema: cada navegacion del admin recarga la pagina entera. El sidebar
 * vuelve al top, asi que si Diana scrolleo para encontrar un modulo abajo,
 * pierde el lugar al cambiar de seccion.
 *
 * Fix: guardar `scrollTop` en sessionStorage en cada scroll, y restaurarlo
 * en cada page load. El sidebar de unfold usa la libreria `simplebar`, asi
 * que el elemento scrollable real es `.simplebar-content-wrapper` (no `aside`).
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'ibyza_admin_sidebar_scroll';

  function findSidebarScrollWrapper() {
    // Hay multiples `.simplebar-content-wrapper` en la pagina (tooltips, dropdowns).
    // Identificamos el del sidebar porque es el unico que contiene links del admin.
    var wrappers = document.querySelectorAll('.simplebar-content-wrapper');
    for (var i = 0; i < wrappers.length; i++) {
      if (wrappers[i].querySelector('a[href*="/admin/"]')) {
        return wrappers[i];
      }
    }
    return null;
  }

  function restoreScroll() {
    var sb = findSidebarScrollWrapper();
    if (!sb) return false;
    var saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      var pos = parseInt(saved, 10);
      if (!isNaN(pos)) sb.scrollTop = pos;
    }
    return true;
  }

  function attachListener() {
    var sb = findSidebarScrollWrapper();
    if (!sb || sb.dataset.ibyzaScrollAttached) return false;
    sb.dataset.ibyzaScrollAttached = '1';
    sb.addEventListener('scroll', function () {
      sessionStorage.setItem(STORAGE_KEY, sb.scrollTop);
    }, { passive: true });
    return true;
  }

  function init() {
    // simplebar puede inicializarse async, asi que reintentamos hasta encontrar
    // el wrapper (max 10 intentos espaciados 50ms = 500ms total).
    var attempts = 0;
    var maxAttempts = 10;
    function tryInit() {
      attempts++;
      var found = restoreScroll() && attachListener();
      if (!found && attempts < maxAttempts) {
        setTimeout(tryInit, 50);
      }
    }
    tryInit();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
