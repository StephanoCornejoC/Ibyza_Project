import styled from 'styled-components';
import { Modal } from '@/shared/components/ui/Modal';

/**
 * PoliticasModal — Renderiza el HTML de politicas de privacidad que viene
 * desde el CMS (ConfiguracionSitio.politicas_privacidad_html).
 *
 * Importante:
 *  - El HTML viene del CMS controlado por equipo IBYZA, asi que el riesgo
 *    de XSS es controlable. Si en el futuro se permite a usuarios externos
 *    editar este campo, hay que sanitizar antes de inyectar.
 */
const PoliticasModal = ({ isOpen, onClose, htmlContent }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Politicas de privacidad" size="lg">
      <PoliticasContent
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html:
            htmlContent ||
            '<p>Las politicas de privacidad estaran disponibles pronto.</p>',
        }}
      />
    </Modal>
  );
};

const PoliticasContent = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  line-height: 1.75;

  h1, h2, h3, h4 {
    font-family: ${({ theme }) => theme.fonts.heading};
    color: ${({ theme }) => theme.colors.white};
    margin: ${({ theme }) => theme.spacing.lg} 0 ${({ theme }) => theme.spacing.sm};
  }
  h1 { font-size: ${({ theme }) => theme.fontSizes['2xl']}; }
  h2 { font-size: ${({ theme }) => theme.fontSizes.xl}; }
  h3 { font-size: ${({ theme }) => theme.fontSizes.lg}; }

  p {
    margin: 0 0 ${({ theme }) => theme.spacing.md};
  }

  a {
    color: ${({ theme }) => theme.colors.gold};
    text-decoration: underline;
    word-break: break-word;
  }

  ul, ol {
    margin: 0 0 ${({ theme }) => theme.spacing.md};
    padding-left: ${({ theme }) => theme.spacing.lg};
  }

  li {
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }

  strong { color: ${({ theme }) => theme.colors.white}; }
`;

export default PoliticasModal;
