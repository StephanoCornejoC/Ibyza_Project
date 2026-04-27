import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

/**
 * CustomCursor — Cursor personalizado dorado premium.
 * - Punto interno que sigue exactamente al cursor.
 * - Anillo exterior con interpolación suave (lerp).
 * - Se expande sobre botones/links.
 * Solo visible en dispositivos con puntero fino (desktop).
 */
const CustomCursor = () => {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const mouse = useRef({ x: -100, y: -100 })
  const ring = useRef({ x: -100, y: -100 })
  const rafRef = useRef(null)
  const [isHovering, setIsHovering] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Solo activar en desktop (pointer: fine)
    if (!window.matchMedia('(pointer: fine)').matches) return

    const onMouseMove = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY }
      if (!visible) setVisible(true)
    }

    const onMouseOver = (e) => {
      if (e.target.closest('a, button, [role="button"], input, textarea, select, label')) {
        setIsHovering(true)
      }
    }

    const onMouseOut = (e) => {
      if (e.target.closest('a, button, [role="button"], input, textarea, select, label')) {
        setIsHovering(false)
      }
    }

    const onMouseLeave = () => setVisible(false)
    const onMouseEnter = () => setVisible(true)

    const lerp = (a, b, n) => a + (b - a) * n

    const animate = () => {
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mouse.current.x - 5}px, ${mouse.current.y - 5}px)`
      }
      if (ringRef.current) {
        ring.current.x = lerp(ring.current.x, mouse.current.x, 0.1)
        ring.current.y = lerp(ring.current.y, mouse.current.y, 0.1)
        const size = isHovering ? 60 : 40
        ringRef.current.style.transform = `translate(${ring.current.x - size / 2}px, ${ring.current.y - size / 2}px)`
      }
      rafRef.current = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('mouseover', onMouseOver, { passive: true })
    window.addEventListener('mouseout', onMouseOut, { passive: true })
    document.documentElement.addEventListener('mouseleave', onMouseLeave)
    document.documentElement.addEventListener('mouseenter', onMouseEnter)

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseover', onMouseOver)
      window.removeEventListener('mouseout', onMouseOut)
      document.documentElement.removeEventListener('mouseleave', onMouseLeave)
      document.documentElement.removeEventListener('mouseenter', onMouseEnter)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [isHovering, visible])

  return (
    <>
      <CursorDot ref={dotRef} $visible={visible} />
      <CursorRing ref={ringRef} $hovering={isHovering} $visible={visible} />
    </>
  )
}

const CursorDot = styled.div`
  @media (pointer: fine) {
    position: fixed;
    top: 0;
    left: 0;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #D6B370;
    pointer-events: none;
    z-index: 99999;
    will-change: transform;
    opacity: ${({ $visible }) => ($visible ? 1 : 0)};
    transition: opacity 0.3s ease;
    mix-blend-mode: difference;
  }
`

const CursorRing = styled.div`
  @media (pointer: fine) {
    position: fixed;
    top: 0;
    left: 0;
    width: ${({ $hovering }) => ($hovering ? '60px' : '40px')};
    height: ${({ $hovering }) => ($hovering ? '60px' : '40px')};
    border-radius: 50%;
    border: 1.5px solid rgba(214, 179, 112, 0.7);
    background: ${({ $hovering }) =>
      $hovering ? 'rgba(214,179,112,0.12)' : 'transparent'};
    pointer-events: none;
    z-index: 99998;
    will-change: transform, width, height;
    transition: width 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
                height 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
                background 0.3s ease,
                opacity 0.3s ease;
    opacity: ${({ $visible }) => ($visible ? 1 : 0)};
    mix-blend-mode: difference;
  }
`

export default CustomCursor
