import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { MapPin, Phone, Mail, Share2, MessageSquare, Rss } from 'lucide-react';
import { ROUTES } from '@/shared/constants/routes';
import useConfiguracion from '@/shared/hooks/useConfiguracion';

/**
 * Footer — Pie de página de IBYZA. ADN inconsarq: fondo ultra oscuro, dorado como acento.
 */
export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { config } = useConfiguracion();

  const direccion = config?.direccion || 'Puente Bolivar 205, Umacollo, Arequipa';
  const telefono = config?.telefono || '+51 993 674 174';
  const email = config?.email || 'ventas@ibyzacorp.com';
  const facebookUrl = config?.facebook_url || 'https://www.facebook.com/profile.php?id=61580984001744';

  return (
    <FooterWrapper>
      {/* Separador superior con gradiente dorado */}
      <GoldDivider />

      <FooterInner>
        {/* Col 1: Marca */}
        <FooterBrand>
          <BrandLogo>IBYZA</BrandLogo>
          <BrandTagline>
            Tu mejor inversión al mejor precio y en la mejor ubicación.
          </BrandTagline>
          <SocialLinks>
            <SocialLink href={facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <MessageSquare size={16} />
            </SocialLink>
            {config?.instagram_url && (
              <SocialLink href={config.instagram_url} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <Share2 size={16} />
              </SocialLink>
            )}
            {config?.tiktok_url && (
              <SocialLink href={config.tiktok_url} target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                <Rss size={16} />
              </SocialLink>
            )}
          </SocialLinks>
        </FooterBrand>

        {/* Col 2: Navegación */}
        <FooterSection>
          <FooterSectionTitle>Navegación</FooterSectionTitle>
          <FooterLinks>
            <FooterLink as={Link} to={ROUTES.HOME}>Inicio</FooterLink>
            <FooterLink as={Link} to={ROUTES.ABOUT}>Nosotros</FooterLink>
            <FooterLink as={Link} to={ROUTES.PROJECTS}>Proyectos</FooterLink>
            <FooterLink as={Link} to={ROUTES.CONTACT}>Contacto</FooterLink>
          </FooterLinks>
        </FooterSection>

        {/* Col 3: Proyectos */}
        <FooterSection>
          <FooterSectionTitle>Proyectos</FooterSectionTitle>
          <FooterLinks>
            <FooterLink as={Link} to={ROUTES.PROJECTS}>Ver todos</FooterLink>
            <FooterLink as={Link} to={ROUTES.CONTACT}>Solicitar información</FooterLink>
            <FooterLink as={Link} to={ROUTES.CONTACT}>Agendar visita</FooterLink>
          </FooterLinks>
        </FooterSection>

        {/* Col 4: Contacto */}
        <FooterSection>
          <FooterSectionTitle>Contacto</FooterSectionTitle>
          <ContactList>
            <ContactItem>
              <MapPin size={15} />
              <span>{direccion}</span>
            </ContactItem>
            <ContactItem>
              <Phone size={15} />
              <a href={`tel:${telefono.replace(/\s/g, '')}`}>{telefono}</a>
            </ContactItem>
            <ContactItem>
              <Mail size={15} />
              <a href={`mailto:${email}`}>{email}</a>
            </ContactItem>
          </ContactList>
        </FooterSection>
      </FooterInner>

      <FooterBottom>
        <FooterCopy>
          © {currentYear} IBYZA. Todos los derechos reservados.
        </FooterCopy>
        <FooterCredit>
          Desarrollado por{' '}
          <a href="https://coremlabs.pe" target="_blank" rel="noopener noreferrer">
            COREM Labs
          </a>
        </FooterCredit>
      </FooterBottom>
    </FooterWrapper>
  );
};

const FooterWrapper = styled.footer`
  background-color: ${({ theme }) => theme.colors.deepBg};
  color: ${({ theme }) => theme.colors.textSecondary};
  padding-top: ${({ theme }) => theme.spacing.xxxl};

  ${({ theme }) => theme.media.tablet} {
    padding-top: ${({ theme }) => theme.spacing.xxl};
  }
`;

const GoldDivider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.gradients.goldDivider};
  margin-bottom: ${({ theme }) => theme.spacing.xxxl};
  opacity: 0.7;
`;

const FooterInner = styled.div`
  max-width: ${({ theme }) => theme.container.maxWidth};
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.lg};
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr;
  gap: ${({ theme }) => theme.spacing.xxl};

  ${({ theme }) => theme.media.desktop} {
    grid-template-columns: 1fr 1fr;
    gap: ${({ theme }) => theme.spacing.xl};
  }

  ${({ theme }) => theme.media.tablet} {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.xl};
    padding: 0 ${({ theme }) => theme.spacing.md};
  }
`;

const FooterBrand = styled.div``;

const BrandLogo = styled.div`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes['3xl']};
  font-weight: 900;
  letter-spacing: -1px;
  background: ${({ theme }) => theme.gradients.goldText};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: ${({ theme }) => theme.spacing.md};

  ${({ theme }) => theme.media.mobile} {
    font-size: 1.6rem;
  }
`;

const BrandTagline = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 300;
  line-height: 1.85;
  color: ${({ theme }) => theme.colors.textSecondary};
  max-width: 280px;
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  ${({ theme }) => theme.media.tablet} {
    max-width: 100%;
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.glass.card};
  border: 1px solid ${({ theme }) => theme.glass.border};
  color: ${({ theme }) => theme.colors.textSecondary};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    border-color: ${({ theme }) => theme.colors.borderGold};
    color: ${({ theme }) => theme.colors.gold};
    background: rgba(214,179,112,0.08);
    transform: translateY(-2px);
  }
`;

const FooterSection = styled.div``;

const FooterSectionTitle = styled.h4`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.eyebrow};
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 4px;
  color: ${({ theme }) => theme.colors.gold};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const FooterLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const FooterLink = styled.a`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 300;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-decoration: none;
  transition: color ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.white};
  }
`;

const ContactList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const ContactItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};

  svg {
    color: ${({ theme }) => theme.colors.gold};
    flex-shrink: 0;
    margin-top: 2px;
    opacity: 0.7;
  }

  a {
    color: ${({ theme }) => theme.colors.textSecondary};
    text-decoration: none;
    transition: color ${({ theme }) => theme.transitions.fast};

    &:hover {
      color: ${({ theme }) => theme.colors.gold};
    }
  }
`;

const FooterBottom = styled.div`
  max-width: ${({ theme }) => theme.container.maxWidth};
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.lg};
  margin-top: ${({ theme }) => theme.spacing.xxl};
  border-top: 1px solid ${({ theme }) => theme.glass.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};

  ${({ theme }) => theme.media.tablet} {
    flex-direction: column;
    text-align: center;
    padding: ${({ theme }) => theme.spacing.md};
    margin-top: ${({ theme }) => theme.spacing.xl};
  }
`;

const FooterCopy = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textMuted};
`;

const FooterCredit = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textMuted};

  a {
    color: rgba(214,179,112,0.6);
    text-decoration: none;
    transition: color ${({ theme }) => theme.transitions.fast};

    &:hover {
      color: ${({ theme }) => theme.colors.gold};
    }
  }
`;

export default Footer;
