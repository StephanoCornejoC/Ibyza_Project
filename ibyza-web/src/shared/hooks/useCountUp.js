import { useEffect, useRef, useState } from 'react'

/**
 * useCountUp — Anima un número de `start` a `end` cuando el elemento entra en el viewport.
 *
 * @param {number} end - Valor final
 * @param {number} duration - Duración en ms (default 2000)
 * @param {number} start - Valor inicial (default 0)
 * @returns {{ ref, count }} - ref para el elemento DOM, count para el valor actual
 */
export function useCountUp(end, duration = 2000, start = 0) {
  const ref = useRef(null)
  const [count, setCount] = useState(start)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          let startTime = null
          const range = end - start

          const step = (timestamp) => {
            if (!startTime) startTime = timestamp
            const elapsed = timestamp - startTime
            const progress = Math.min(elapsed / duration, 1)
            // Easing out cubic
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.round(start + range * eased))

            if (progress < 1) {
              requestAnimationFrame(step)
            }
          }

          requestAnimationFrame(step)
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [end, duration, start])

  return { ref, count }
}
