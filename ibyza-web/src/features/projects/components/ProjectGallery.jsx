import { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Expand } from 'lucide-react';
import { createPortal } from 'react-dom';

/**
 * ProjectGallery — Galería con lightbox glass. ADN inconsarq.
 *
 * Props:
 * - images: array de strings (URLs) o de objetos { url, caption }
 */
export const ProjectGallery = ({ images = [] }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!images || images.length === 0) return null;

  const normalizedImages = images.map((img) => {
    if (typeof img === 'string') return { url: img, caption: '' };
    // API returns { imagen, descripcion } from ImagenGaleriaSerializer
    if (img.imagen) return { url: img.imagen, caption: img.descripcion || '' };
    return { url: img.url || '', caption: img.caption || '' };
  });

  const openLightbox = (index) => {
    setActiveIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const prev = () =>
    setActiveIndex((i) => (i - 1 + normalizedImages.length) % normalizedImages.length);

  const next = () =>
    setActiveIndex((i) => (i + 1) % normalizedImages.length);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'Escape') closeLightbox();
  };

  return (
    <GalleryWrapper>
      {/* Imagen principal */}
      <MainImageWrapper onClick={() => openLightbox(activeIndex)}>
        <AnimatePresence mode="wait">
          <MainImage
            key={activeIndex}
            as={motion.img}
            src={normalizedImages[activeIndex].url}
            alt={normalizedImages[activeIndex].caption || `Imagen ${activeIndex + 1}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        </AnimatePresence>
        <ExpandButton aria-label="Ver en pantalla completa">
          <Expand size={18} />
        </ExpandButton>
        {normalizedImages.length > 1 && (
          <Counter>
            {activeIndex + 1} / {normalizedImages.length}
          </Counter>
        )}
      </MainImageWrapper>

      {/* Thumbnails */}
      {normalizedImages.length > 1 && (
        <ThumbsRow>
          {normalizedImages.map((img, idx) => (
            <Thumb
              key={idx}
              $active={idx === activeIndex}
              onClick={() => setActiveIndex(idx)}
            >
              <img src={img.url} alt={`Miniatura ${idx + 1}`} loading="lazy" />
            </Thumb>
          ))}
        </ThumbsRow>
      )}

      {/* Lightbox */}
      {lightboxOpen &&
        createPortal(
          <LightboxOverlay
            onClick={closeLightbox}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="dialog"
            aria-label="Galería en pantalla completa"
          >
            <LightboxContent onClick={(e) => e.stopPropagation()}>
              <CloseBtn onClick={closeLightbox} aria-label="Cerrar">
                <X size={22} />
              </CloseBtn>

              {normalizedImages.length > 1 && (
                <NavBtn $side="left" onClick={prev} aria-label="Anterior">
                  <ChevronLeft size={28} />
                </NavBtn>
              )}

              <AnimatePresence mode="wait">
                <LightboxImage
                  key={activeIndex}
                  as={motion.img}
                  src={normalizedImages[activeIndex].url}
                  alt={normalizedImages[activeIndex].caption || `Imagen ${activeIndex + 1}`}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.25 }}
                />
              </AnimatePresence>

              {normalizedImages.length > 1 && (
                <NavBtn $side="right" onClick={next} aria-label="Siguiente">
                  <ChevronRight size={28} />
                </NavBtn>
              )}

              {normalizedImages[activeIndex].caption && (
                <LightboxCaption>
                  {normalizedImages[activeIndex].caption}
                </LightboxCaption>
              )}
            </LightboxContent>
          </LightboxOverlay>,
          document.body
        )}
    </GalleryWrapper>
  );
};

const GalleryWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const MainImageWrapper = styled.div`
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  cursor: zoom-in;
  background: ${({ theme }) => theme.colors.primary};
  aspect-ratio: 16 / 9;
  border: 1px solid ${({ theme }) => theme.glass.border};
  box-shadow: ${({ theme }) => theme.glass.shadow};
  transition: border-color 0.3s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.borderGold};
  }
`;

const MainImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ExpandButton = styled.button`
  position: absolute;
  top: ${({ theme }) => theme.spacing.md};
  right: ${({ theme }) => theme.spacing.md};
  background: rgba(8, 19, 31, 0.8);
  backdrop-filter: blur(8px);
  border: 1px solid ${({ theme }) => theme.glass.border};
  color: white;
  border-radius: ${({ theme }) => theme.radii.md};
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity ${({ theme }) => theme.transitions.fast};

  ${MainImageWrapper}:hover & {
    opacity: 1;
  }
`;

const Counter = styled.div`
  position: absolute;
  bottom: ${({ theme }) => theme.spacing.md};
  right: ${({ theme }) => theme.spacing.md};
  background: rgba(8, 19, 31, 0.8);
  backdrop-filter: blur(8px);
  border: 1px solid ${({ theme }) => theme.glass.border};
  color: rgba(255,255,255,0.85);
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 600;
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border-radius: ${({ theme }) => theme.radii.full};
`;

const ThumbsRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  overflow-x: auto;
  padding-bottom: 4px;

  &::-webkit-scrollbar {
    height: 3px;
  }
  &::-webkit-scrollbar-track { background: rgba(255,255,255,0.04); }
  &::-webkit-scrollbar-thumb { background: rgba(214,179,112,0.4); border-radius: 2px; }
`;

const Thumb = styled.button`
  flex-shrink: 0;
  width: 72px;
  height: 54px;
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
  border: 2px solid ${({ theme, $active }) =>
    $active ? theme.colors.gold : 'transparent'};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  opacity: ${({ $active }) => ($active ? 1 : 0.5)};
  box-shadow: ${({ $active }) =>
    $active ? '0 0 12px rgba(214,179,112,0.4)' : 'none'};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &:hover {
    opacity: 1;
  }
`;

// Lightbox
const LightboxOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(5, 10, 20, 0.96);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  outline: none;
`;

const LightboxContent = styled.div`
  position: relative;
  width: 100%;
  max-width: 1000px;
  padding: ${({ theme }) => theme.spacing.xl};

  ${({ theme }) => theme.media.tablet} {
    padding: ${({ theme }) => theme.spacing.lg};
  }

  ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => theme.spacing.md};
  }
`;

const LightboxImage = styled.img`
  width: 100%;
  max-height: 80vh;
  object-fit: contain;
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.glass.border};
  box-shadow: 0 24px 64px rgba(0,0,0,0.7);
`;

const CloseBtn = styled.button`
  position: absolute;
  top: ${({ theme }) => theme.spacing.sm};
  right: ${({ theme }) => theme.spacing.xl};

  ${({ theme }) => theme.media.mobile} {
    right: ${({ theme }) => theme.spacing.md};
    width: 36px;
    height: 36px;
  }
  background: ${({ theme }) => theme.glass.card};
  backdrop-filter: blur(8px);
  border: 1px solid ${({ theme }) => theme.glass.border};
  border-radius: ${({ theme }) => theme.radii.md};
  color: rgba(255,255,255,0.8);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: rgba(255,255,255,0.12);
    color: white;
    border-color: ${({ theme }) => theme.colors.borderGold};
  }
`;

const NavBtn = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${({ $side }) => ($side === 'left' ? 'left: 8px;' : 'right: 8px;')}
  background: ${({ theme }) => theme.glass.card};
  backdrop-filter: blur(8px);
  border: 1px solid ${({ theme }) => theme.glass.border};
  color: rgba(255,255,255,0.8);
  border-radius: ${({ theme }) => theme.radii.md};
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);

  &:hover {
    background: rgba(214,179,112,0.12);
    color: ${({ theme }) => theme.colors.gold};
    border-color: ${({ theme }) => theme.colors.borderGold};
    transform: translateY(-50%) scale(1.05);
  }
`;

const LightboxCaption = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 300;
  margin-top: ${({ theme }) => theme.spacing.md};
`;

export default ProjectGallery;
