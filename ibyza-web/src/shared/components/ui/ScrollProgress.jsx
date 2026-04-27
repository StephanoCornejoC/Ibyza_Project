import { useEffect, useRef } from 'react'
import styled from 'styled-components'

/**
 * ScrollProgress — Barra de progreso de scroll en la parte superior.
 * Gradiente dorado que crece de 0% a 100% según el scroll de la página.
 * Implementado con RAF para máxima fluidez (GPU-accelerated via scaleX).
 */
const ScrollProgress = () => {
  const barRef = useRef(null)

  useEffect(() => {
    let ticking = false

    const updateProgress = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = docHeight > 0 ? scrollTop / docHeight : 0

      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${progress})`
      }
      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateProgress)
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    updateProgress()

    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <ProgressTrack>
      <ProgressBar ref={barRef} />
    </ProgressTrack>
  )
}

const ProgressTrack = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  z-index: 99997;
  background: transparent;
  pointer-events: none;
`

const ProgressBar = styled.div`
  height: 100%;
  width: 100%;
  background: linear-gradient(
    90deg,
    #8B6914 0%,
    #D6B370 30%,
    #FFE499 60%,
    #D6B370 80%,
    #C4973A 100%
  );
  transform-origin: left center;
  transform: scaleX(0);
  will-change: transform;
  box-shadow: 0 0 10px rgba(214, 179, 112, 0.5);
`

export default ScrollProgress
