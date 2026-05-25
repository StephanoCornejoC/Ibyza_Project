import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { MapPin, Phone, Mail } from 'lucide-react';

const FacebookIcon = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M22 12.07C22 6.48 17.52 2 11.93 2 6.34 2 1.86 6.48 1.86 12.07c0 5.05 3.7 9.24 8.54 9.95v-7.04H7.86v-2.91h2.54V9.84c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.91h-2.34v7.04c4.84-.71 8.54-4.9 8.54-9.95z"/>
  </svg>
);

const InstagramIcon = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);
import { ROUTES } from '@/shared/constants/routes';
import useConfiguracion from '@/shared/hooks/useConfiguracion';

/**
 * Footer — Pie de página de IBYZA. ADN inconsarq: fondo ultra oscuro, dorado como acento.
 */
export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { config } = useConfiguracion();

  const direccion = config?.direccion || 'Puente Bolívar 205, Umacollo, Arequipa';
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
          <MiniMap>
            <iframe
              title="Ubicación IBYZA"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(direccion)}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <MiniMapOverlay
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Abrir ubicación en Google Maps"
            />
          </MiniMap>
          <SocialLinks>
            <SocialLink href={facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <FacebookIcon />
            </SocialLink>
            <SocialLink href={config?.instagram_url || '#'} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <InstagramIcon />
            </SocialLink>
            <SocialLink href={config?.tiktok_url || '#'} target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.34a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.83 4.83 0 0 1-1.84-.26z"/>
              </svg>
            </SocialLink>
          </SocialLinks>
        </FooterBrand>

        {/* Col 2: Navegación */}
        <FooterSection>
          <FooterSectionTitle>Navegación</FooterSectionTitle>
          <FooterLinks>
            <FooterLink as={Link} to={ROUTES.HOME}>Inicio</FooterLink>
            <FooterLink as={Link} to={ROUTES.ABOUT}>Nosotros</FooterLink>
            <FooterLink as={Link} to={ROUTES.PROJECTS}>Proyectos</FooterLink>
            <FooterLink as={Link} to={ROUTES.SEPARACION}>Separar departamento</FooterLink>
            <FooterLink as={Link} to={ROUTES.AVANCE}>Avance de tu compra</FooterLink>
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
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {direccion}
              </a>
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

const MiniMap = styled.div`
  position: relative;
  width: 100%;
  max-width: 280px;
  height: 150px;
  margin-top: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.glass.border};
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  transition: border-color ${({ theme }) => theme.transitions.fast},
    box-shadow ${({ theme }) => theme.transitions.fast};

  iframe {
    width: 100%;
    height: 100%;
    border: 0;
    display: block;
    filter: grayscale(0.25) contrast(1.05);
  }

  &:hover {
    border-color: ${({ theme }) => theme.colors.borderGold};
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35),
      0 0 12px rgba(214, 179, 112, 0.18);
  }

  ${({ theme }) => theme.media.tablet} {
    max-width: 100%;
  }
`;

const MiniMapOverlay = styled.a`
  position: absolute;
  inset: 0;
  z-index: 1;
  display: block;
  text-decoration: none;
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
