import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import useConfiguracion from '@/shared/hooks/useConfiguracion';
import api from '@/shared/services/api';
import { buildProjectDetailRoute } from '@/shared/constants/routes';

/**
 * WelcomeModal — Modal de bienvenida configurable desde el CMS.
 *
 * Reglas de visibilidad:
 *   - config.modal_activo === false  -> no se monta nada
 *   - sessionStorage 'ibyza_welcome_seen' -> ya visto en esta sesion, no se muestra
 *   - en cuanto se cierra (X o CTA), se marca como visto en sessionStorage.
 *
 * Comportamiento del CTA:
 *   - modal_cta_es_whatsapp === true: abre wa.me con un mensaje precargado
 *   - sino, si llega slug/id de proyecto: navega a /proyectos/<slug>
 *     (si lo que llega es un id, lo resolvemos contra allProjects).
 */
const SESSION_KEY = 'ibyza_welcome_seen';

const WelcomeModal = () => {
  const { config } = useConfiguracion();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!config) return;
    if (!config.modal_activo) return;

    let seen = false;
    try {
      seen = sessionStorage.getItem(SESSION_KEY) === '1';
    } catch {
      seen = false;
    }
    if (seen) return;

    // Pequeno delay para que el modal no salte sobre la animacion de pagina.
    const t = setTimeout(() => setOpen(true), 700);
    return () => clearTimeout(t);
  }, [config]);

  const markSeen = () => {
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      // Si sessionStorage no esta disponible, fallamos en silencio.
    }
  };

  const handleClose = () => {
    markSeen();
    setOpen(false);
  };

  /**
   * Devuelve el slug del proyecto destino del CTA, resolviendo el id contra
   * /api/proyectos/ si fuera necesario. Retorna null si no se puede resolver.
   *
   * El backend puede exponer:
   *  - modal_proyecto_slug: 'mi-proyecto'      -> uso directo
   *  - modal_proyecto: 'mi-proyecto'           -> string slug
   *  - modal_proyecto: { slug: 'mi-proyecto' } -> objeto serializado
   *  - modal_proyecto: 12                       -> id, requiere GET extra
   */
  const resolveProjectSlug = async () => {
    if (config?.modal_proyecto_slug) return config.modal_proyecto_slug;

    const candidate = config?.modal_proyecto;
    if (!candidate) return null;

    if (typeof candidate === 'string' && Number.isNaN(Number(candidate))) {
      return candidate;
    }
    if (typeof candidate === 'object' && candidate.slug) return candidate.slug;

    const id = Number(candidate);
    if (Number.isNaN(id)) return null;

    // Resolucion por id: pedimos la lista de proyectos al backend y matcheamos.
    try {
      const { data } = await api.get('/api/proyectos/');
      const list = data?.results || data || [];
      const found = Array.isArray(list) && list.find((p) => p.id === id);
      return found?.slug || null;
    } catch {
      return null;
    }
  };

  const handleCtaClick = async () => {
    if (config?.modal_cta_es_whatsapp) {
      const phone = (config?.whatsapp || '').replace(/\D/g, '');
      const text = encodeURIComponent('Hola, vi el modal del sitio y quiero más información');
      if (phone) {
        window.open(`https://wa.me/${phone}?text=${text}`, '_blank', 'noopener,noreferrer');
      }
      handleClose();
      return;
    }

    const slug = await resolveProjectSlug();
    if (slug) {
      handleClose();
      navigate(buildProjectDetailRoute(slug));
      return;
    }

    // Sin destino claro: solo cerramos.
    handleClose();
  };

  if (!config?.modal_activo) return null;

  return (
    <Modal
      isOpen={open}
      onClose={handleClose}
      title=""
      size="md"
      showCloseButton={true}
      closeOnOverlay={true}
    >
      <Wrapper>
        {config?.modal_imagen ? (
          <ImageBox $bg={config.modal_imagen}>
            <ImageGradient />
          </ImageBox>
        ) : (
          <FallbackBox>
            <FallbackGradient />
          </FallbackBox>
        )}

        <Content>
          {config?.modal_titulo && (
            <Title
              as={motion.h2}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              {config.modal_titulo}
            </Title>
          )}

          {config?.modal_subtitulo && (
            <Subtitle
              as={motion.p}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              {config.modal_subtitulo}
            </Subtitle>
          )}

          {config?.modal_cta_texto && (
            <CtaWrap
              as={motion.div}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Button variant="primary" size="lg" onClick={handleCtaClick}>
                {config.modal_cta_texto}
              </Button>
            </CtaWrap>
          )}
        </Content>
      </Wrapper>
    </Modal>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: -${({ theme }) => theme.spacing.xl};

  ${({ theme }) => theme.media.mobile} {
    margin: -${({ theme }) => theme.spacing.md};
  }
`;

const ImageBox = styled.div`
  position: relative;
  width: 100%;
  height: 240px;
  background-image: url(${({ $bg }) => $bg});
  background-size: cover;
  background-position: center;

  ${({ theme }) => theme.media.mobile} {
    height: 180px;
  }
`;

const ImageGradient = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(8,19,31,0.15) 0%,
    rgba(8,19,31,0.55) 70%,
    ${({ theme }) => theme.colors.primary} 100%
  );
`;

const FallbackBox = styled.div`
  position: relative;
  width: 100%;
  height: 160px;
  background: ${({ theme }) => theme.gradients.gold};
`;

const FallbackGradient = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(8,19,31,0.0) 0%,
    rgba(8,19,31,0.3) 60%,
    ${({ theme }) => theme.colors.primary} 100%
  );
`;

const Content = styled.div`
  padding: ${({ theme }) => `${theme.spacing.xl} ${theme.spacing.xxl} ${theme.spacing.xxl}`};
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: ${({ theme }) => theme.spacing.md};

  ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => theme.spacing.lg};
  }
`;

const Title = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes['3xl']};
  font-weight: 900;
  letter-spacing: -1px;
  color: ${({ theme }) => theme.colors.white};
  margin: 0;

  ${({ theme }) => theme.media.mobile} {
    font-size: 1.6rem;
  }
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 300;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.7;
  max-width: 460px;
  margin: 0;
`;

const CtaWrap = styled.div`
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

export default WelcomeModal;
