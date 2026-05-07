/**
 * scrollLock — utilidad centralizada para bloquear y desbloquear el scroll
 * del body con un contador global. Esto evita que dos modales abiertos
 * en simultaneo (o uno desmontandose mientras otro abre) dejen el body
 * con `overflow: hidden` permanente.
 *
 * Reglas:
 *  - lockScroll() incrementa el contador. Si pasa de 0 a 1, guarda el
 *    overflow original y aplica `hidden`.
 *  - unlockScroll() decrementa el contador. Si vuelve a 0, restaura el
 *    overflow original.
 *  - El contador nunca baja de 0.
 */

let lockCount = 0;
let originalOverflow = '';

export function lockScroll() {
  if (typeof document === 'undefined') return;
  if (lockCount === 0) {
    originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  lockCount += 1;
}

export function unlockScroll() {
  if (typeof document === 'undefined') return;
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.body.style.overflow = originalOverflow;
  }
}

/**
 * Resetea el contador y restaura el overflow original. Utilidad de escape
 * por si algun cleanup falla y el body queda bloqueado.
 */
export function forceResetScrollLock() {
  if (typeof document === 'undefined') return;
  lockCount = 0;
  document.body.style.overflow = originalOverflow;
}
