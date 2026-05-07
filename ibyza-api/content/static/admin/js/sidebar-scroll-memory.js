/**
 * sidebar-scroll-memory.js
 *
 * Persiste la posicion de scroll del sidebar de django-unfold entre
 * navegaciones del admin. Sin esto, cada vez que abris un modulo el sidebar
 * se reposiciona arriba y se pierde el hilo al configurar varios items.
 *
 * Estrategia:
 *  - Guardamos el scrollTop en sessionStorage cada vez que el usuario
 *    scrollea el sidebar (con un throttle suave) y tambien al pagehide.
 *  - Al cargar la pagina, restauramos el scrollTop si existe.
 *  - Si el sidebar no tiene scroll propio (es una pagina mobile o el
 *    contenido cabe), no hacemos nada.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'unfoldSidebarScrollTop';
  var SELECTORS = [
    'aside[data-sidebar]',
    'aside.sticky',
    '#sidebar',
    'nav[aria-label="Sidebar"]',
    'aside',
  ];

  function findSidebar() {
    for (var i = 0; i < SELECTORS.length; i++) {
      var el = document.querySelector(SELECTORS[i]);
      if (el) return el;
    }
    return null;
  }

  function findScroller(sidebar) {
    if (!sidebar) return null;
    if (sidebar.scrollHeight > sidebar.clientHeight + 4) return sidebar;
    var nodes = sidebar.querySelectorAll('*');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var cs = window.getComputedStyle(el);
      var oy = cs.overflowY;
      if ((oy === 'auto' || oy === 'scroll') && el.scrollHeight > el.clientHeight + 4) {
        return el;
      }
    }
    return null;
  }

  function init() {
    var sidebar = findSidebar();
    var scroller = findScroller(sidebar);
    if (!scroller) return;

    var saved = window.sessionStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      var top = parseInt(saved, 10);
      if (!isNaN(top) && top > 0) {
        // Restauramos en el siguiente frame para evitar saltos visibles
        // mientras el sidebar pinta su contenido.
        window.requestAnimationFrame(function () {
          scroller.scrollTop = top;
        });
      }
    }

    var throttleId = null;
    scroller.addEventListener('scroll', function () {
      if (throttleId) return;
      throttleId = window.setTimeout(function () {
        window.sessionStorage.setItem(STORAGE_KEY, String(scroller.scrollTop));
        throttleId = null;
      }, 120);
    });

    // Backstop: persistir tambien en pagehide para capturar navegaciones
    // rapidas que no disparen un scroll antes del unload.
    window.addEventListener('pagehide', function () {
      window.sessionStorage.setItem(STORAGE_KEY, String(scroller.scrollTop));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
