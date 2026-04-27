import { useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { AnimatePresence, motion } from 'framer-motion'

/**
 * WhatsAppButton — Boton fijo bottom-right con icono WhatsApp SVG real.
 * Color dorado IBYZA. Posicion estable sin saltos.
 */
const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '+51993674174'
const WHATSAPP_MESSAGE = 'Hola, me interesa conocer mas sobre los proyectos de IBYZA.'

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

const WhatsAppButton = () => {
  const [showTooltip, setShowTooltip] = useState(false)

  const handleClick = () => {
    const encoded = encodeURIComponent(WHATSAPP_MESSAGE)
    const cleaned = WHATSAPP_NUMBER.replace(/\D/g, '')
    window.open(`https://wa.me/${cleaned}?text=${encoded}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <Wrapper>
      <AnimatePresence>
        {showTooltip && (
          <Tooltip
            as={motion.div}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.2 }}
          >
            Escribenos por WhatsApp
          </Tooltip>
        )}
      </AnimatePresence>

      <RippleRing />

      <Button
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        aria-label="Contactar por WhatsApp"
      >
        <WhatsAppIcon />
      </Button>
    </Wrapper>
  )
}

const rippleAnim = keyframes`
  0% { transform: scale(1); opacity: 0.5; }
  100% { transform: scale(2); opacity: 0; }
`

const Wrapper = styled.div`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: ${({ theme }) => theme.zIndex.toast};
  display: flex;
  align-items: center;
  gap: 0;

  ${({ theme }) => theme.media.mobile} {
    bottom: 1rem;
    right: 1rem;
  }
`

const Tooltip = styled.div`
  position: absolute;
  right: calc(100% + 12px);
  top: 50%;
  transform: translateY(-50%);
  background: ${({ theme }) => theme.colors.primary};
  border: 1px solid ${({ theme }) => theme.colors.borderGold};
  color: ${({ theme }) => theme.colors.gold};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 600;
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.md}`};
  border-radius: ${({ theme }) => theme.radii.full};
  white-space: nowrap;
  pointer-events: none;
  box-shadow: 0 4px 16px rgba(0,0,0,0.3);
`

const RippleRing = styled.div`
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid ${({ theme }) => theme.colors.gold};
  animation: ${rippleAnim} 2.5s ease-out infinite;
  pointer-events: none;
`

const Button = styled.button`
  position: relative;
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: ${({ theme }) => theme.gradients.gold};
  color: ${({ theme }) => theme.colors.deepBg};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  box-shadow: 0 4px 20px rgba(214,179,112,0.4), 0 4px 12px rgba(0,0,0,0.3);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  flex-shrink: 0;

  ${({ theme }) => theme.media.mobile} {
    width: 52px;
    height: 52px;

    svg { width: 24px; height: 24px; }
  }

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 8px 32px rgba(214,179,112,0.55), 0 4px 12px rgba(0,0,0,0.3);
  }

  &:active {
    transform: scale(0.95);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.gold};
    outline-offset: 3px;
  }
`

export default WhatsAppButton
