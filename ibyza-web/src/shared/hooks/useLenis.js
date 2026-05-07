import { useEffect } from 'react'
import Lenis from 'lenis'

/**
 * useLenis — Smooth scroll con Lenis.
 * Inicializa Lenis con física suave y lo destruye al desmontar.
 */
export function useLenis() {
  useEffect(() => {
    // Respetar prefers-reduced-motion: si el usuario lo solicita, no inicializar
    // Lenis y dejar que el navegador maneje el scroll nativo.
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })

    // Exponer la instancia globalmente para que utilidades como useScrollToTop
    // puedan resetear el scroll sin pelear contra el RAF de Lenis.
    if (typeof window !== 'undefined') {
      window.__lenis = lenis
    }

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    const rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
      if (typeof window !== 'undefined' && window.__lenis === lenis) {
        delete window.__lenis
      }
    }
  }, [])
}
