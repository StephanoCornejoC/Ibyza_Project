import { useEffect, useRef, useState } from 'react'

/**
 * useCountUp — Anima un numero de `start` a `end` con easing out cubic.
 *
 * La animacion arranca cada vez que cambia `end` (ej: los stats vienen del
 * CMS asincronamente, primero hay un valor fallback y luego llega el real;
 * el hook re-anima al valor nuevo).
 *
 * Antes el hook usaba IntersectionObserver para animar solo al entrar en
 * viewport, pero eso causaba un bug: si el elemento entraba en viewport con
 * el valor fallback, marcaba hasAnimated=true y nunca re-animaba al valor
 * real del CMS. Quedaba congelado en el fallback (6, 50, etc.).
 *
 * Simplificacion: la animacion corre apenas cambia `end`. Si el elemento no
 * esta en viewport, igual la animacion termina en pocos segundos y el
 * usuario ve el valor final cuando scrollea.
 *
 * @param {number|string} end - Valor final
 * @param {number} duration - Duracion en ms (default 2000)
 * @param {number} start - Valor inicial (default 0)
 * @returns {{ ref, count }} - ref (para retrocompat) y count actual
 */
export function useCountUp(end, duration = 2000, start = 0) {
  const ref = useRef(null)
  const [count, setCount] = useState(start)

  useEffect(() => {
    // Validar input: si end no es un numero o es NaN, mantener start.
    const target = Number(end)
    if (!Number.isFinite(target)) {
      setCount(start)
      return
    }

    // Si el tab esta oculto al iniciar, no usamos rAF (esta pausado por el
    // browser) — saltamos directo al valor final. Cuando el usuario vuelva
    // al tab vera el valor correcto sin animacion.
    if (typeof document !== 'undefined' && document.hidden) {
      setCount(target)
      return
    }

    let rafId = null
    let startTime = null
    const range = target - start

    const step = (timestamp) => {
      if (startTime === null) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Easing out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(start + range * eased))

      if (progress < 1) {
        rafId = requestAnimationFrame(step)
      }
    }

    // Si el tab pasa a oculto durante la animacion, saltamos al final
    // (rAF queda pausado y nunca termina).
    const handleVisibility = () => {
      if (document.hidden) {
        if (rafId !== null) cancelAnimationFrame(rafId)
        setCount(target)
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    // Resetear count al inicio para que la animacion sea visible desde 0
    setCount(start)
    rafId = requestAnimationFrame(step)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [end, duration, start])

  return { ref, count }
}
