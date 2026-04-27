import { useRef, useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';

/**
 * FloorPlanSpotlight — Efecto linterna/spotlight sobre el plano del nivel.
 * Wrapper glass añadido alrededor del canvas. La lógica se mantiene intacta.
 *
 * Props:
 * - src: string — URL de la imagen del plano
 * - alt: string — texto alternativo
 * - revealedIds: array de IDs de departamentos ya revelados (WIP)
 */
const FloorPlanSpotlight = ({ src, alt = 'Plano del nivel', revealedIds = [] }) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [mousePos, setMousePos] = useState(null);
  const animFrameRef = useRef(null);

  const SPOTLIGHT_RADIUS = 120;
  const OVERLAY_ALPHA = 0.72;

  const drawOverlay = useCallback((ctx, width, height, pos) => {
    ctx.clearRect(0, 0, width, height);

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = `rgba(15, 35, 59, ${OVERLAY_ALPHA})`;
    ctx.fillRect(0, 0, width, height);

    if (pos) {
      ctx.globalCompositeOperation = 'destination-out';

      const gradient = ctx.createRadialGradient(
        pos.x, pos.y, 0,
        pos.x, pos.y, SPOTLIGHT_RADIUS
      );
      gradient.addColorStop(0, 'rgba(0,0,0,1)');
      gradient.addColorStop(0.6, 'rgba(0,0,0,0.85)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, SPOTLIGHT_RADIUS, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalCompositeOperation = 'source-over';
    }
  }, [OVERLAY_ALPHA]);

  const syncCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const rect = image.getBoundingClientRect();
    if (canvas.width !== rect.width || canvas.height !== rect.height) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }
  }, []);

  const scheduleRedraw = useCallback((pos) => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      syncCanvasSize();
      drawOverlay(ctx, canvas.width, canvas.height, pos);
    });
  }, [drawOverlay, syncCanvasSize]);

  useEffect(() => {
    if (!imageLoaded) return;
    scheduleRedraw(null);
  }, [imageLoaded, scheduleRedraw]);

  useEffect(() => {
    if (!imageLoaded) return;
    scheduleRedraw(mousePos);
  }, [mousePos, imageLoaded, scheduleRedraw]);

  useEffect(() => {
    const handleResize = () => {
      if (imageLoaded) scheduleRedraw(mousePos);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [imageLoaded, mousePos, scheduleRedraw]);

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseLeave = () => {
    setMousePos(null);
  };

  return (
    <GlassWrapper>
      <Container ref={containerRef}>
        <PlanImage
          ref={imageRef}
          src={src}
          alt={alt}
          onLoad={() => setImageLoaded(true)}
          draggable={false}
        />

        {imageLoaded && (
          <SpotlightCanvas
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            role="presentation"
            aria-hidden="true"
          />
        )}

        {!mousePos && imageLoaded && (
          <HintOverlay>
            <HintText>Mueve el cursor para explorar el plano</HintText>
          </HintOverlay>
        )}

        {!imageLoaded && (
          <LoadingState>
            <span>Cargando plano...</span>
          </LoadingState>
        )}
      </Container>
    </GlassWrapper>
  );
};

const GlassWrapper = styled.div`
  background: ${({ theme }) => theme.glass.card};
  backdrop-filter: ${({ theme }) => theme.glass.blur};
  -webkit-backdrop-filter: ${({ theme }) => theme.glass.blur};
  border: 1px solid ${({ theme }) => theme.glass.borderGold};
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: ${({ theme }) => theme.spacing.md};
  box-shadow: ${({ theme }) => theme.glass.shadowGold};
  overflow: hidden;
`;

const Container = styled.div`
  position: relative;
  width: 100%;
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;
  background: rgba(10, 20, 40, 0.5);
  cursor: crosshair;
  user-select: none;

  ${({ theme }) => theme.media.touch} {
    cursor: default;
    canvas { display: none; }
  }
`;

const PlanImage = styled.img`
  display: block;
  width: 100%;
  height: auto;
  max-height: 500px;
  object-fit: contain;
`;

const SpotlightCanvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: auto;
`;

const HintOverlay = styled.div`
  position: absolute;
  bottom: ${({ theme }) => theme.spacing.md};
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
  z-index: 10;

  ${({ theme }) => theme.media.touch} {
    display: none;
  }
`;

const HintText = styled.span`
  background: rgba(10, 25, 48, 0.85);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(214,179,112,0.25);
  color: ${({ theme }) => theme.colors.gold};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 500;
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.md}`};
  border-radius: ${({ theme }) => theme.radii.full};
  letter-spacing: 0.06em;
  white-space: nowrap;
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: rgba(255,255,255,0.35);
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

export default FloorPlanSpotlight;
