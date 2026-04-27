import { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * Modal — Componente base reutilizable con overlay glassmorphism premium. ADN inconsarq.
 *
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - title: string (opcional)
 * - size: 'sm' | 'md' | 'lg' | 'xl' | 'full' (default: 'md')
 * - closeOnOverlay: boolean (default: true)
 * - showCloseButton: boolean (default: true)
 * - children: ReactNode
 */
export const Modal = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  closeOnOverlay = true,
  showCloseButton = true,
  children,
}) => {
  // Cerrar con tecla Escape
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Bloquear scroll del body mientras el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleOverlayClick = (e) => {
    if (closeOnOverlay && e.target === e.currentTarget) onClose();
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <Overlay
          as={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={handleOverlayClick}
          role="dialog"
          aria-modal="true"
          aria-label={title || 'Modal'}
        >
          <ModalContainer
            as={motion.div}
            initial={{ opacity: 0, scale: 0.9, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 24 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            $size={size}
            onClick={(e) => e.stopPropagation()}
          >
            {(title || showCloseButton) && (
              <ModalHeader>
                {title && <ModalTitle>{title}</ModalTitle>}
                {showCloseButton && (
                  <CloseButton onClick={onClose} aria-label="Cerrar modal">
                    <X size={18} />
                  </CloseButton>
                )}
              </ModalHeader>
            )}
            <ModalBody>{children}</ModalBody>
          </ModalContainer>
        </Overlay>
      )}
    </AnimatePresence>,
    document.body
  );
};

const sizeMap = {
  sm: 'min(400px, 95vw)',
  md: 'min(560px, 95vw)',
  lg: 'min(720px, 95vw)',
  xl: 'min(900px, 95vw)',
  full: '95vw',
};

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(5, 10, 20, 0.88);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.md};
  z-index: ${({ theme }) => theme.zIndex.modal};
  overflow-y: auto;

  ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => theme.spacing.sm};
    align-items: flex-start;
    padding-top: ${({ theme }) => theme.spacing.lg};
  }
`;

const ModalContainer = styled.div`
  background: ${({ theme }) => theme.colors.primary};
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  border: 1px solid rgba(214, 179, 112, 0.2);
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: 0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px ${({ theme }) => theme.glass.border};
  width: 100%;
  max-width: ${({ $size }) => sizeMap[$size] || sizeMap.md};
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  ${({ theme }) => theme.media.mobile} {
    max-height: calc(100dvh - ${({ theme }) => theme.spacing.xl});
    border-radius: ${({ theme }) => theme.radii.lg};
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => `${theme.spacing.lg} ${theme.spacing.xl}`};
  border-bottom: 1px solid rgba(214, 179, 112, 0.15);
  flex-shrink: 0;
  gap: ${({ theme }) => theme.spacing.sm};

  ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => theme.spacing.md};
  }
`;

const ModalTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: 700;
  letter-spacing: -0.5px;
  color: ${({ theme }) => theme.colors.white};
  margin: 0;
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.glass.card};
  color: ${({ theme }) => theme.colors.textSecondary};
  border: 1px solid ${({ theme }) => theme.glass.border};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: rgba(255,255,255,0.1);
    color: ${({ theme }) => theme.colors.white};
    border-color: ${({ theme }) => theme.colors.borderGold};
  }
`;

const ModalBody = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  overflow-y: auto;
  flex: 1;

  ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => theme.spacing.md};
  }
`;

export default Modal;
