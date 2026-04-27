import { useEffect, useRef, useCallback } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { ROUTES } from '@/shared/constants/routes'
import useUIStore from '@/shared/stores/useUIStore'

/**
 * Navbar — Barra de navegación premium con:
 * - Hide en scroll DOWN / Show en scroll UP (con Framer Motion)
 * - Glass oscuro al scroll
 * - Logo con shimmer dorado al hover
 * - Links con underline glow dorado al activo/hover
 */
const NAV_LINKS = [
  { label: 'Inicio', to: ROUTES.HOME },
  { label: 'Nosotros', to: ROUTES.ABOUT },
  { label: 'Proyectos', to: ROUTES.PROJECTS },
  { label: 'Separar', to: ROUTES.SEPARACION },
  { label: 'Contacto', to: ROUTES.CONTACT },
]

export const Navbar = () => {
  const { navbarScrolled, setNavbarScrolled, mobileMenuOpen, toggleMobileMenu, setMobileMenuOpen } =
    useUIStore()
  const location = useLocation()

  const scrollToTop = useCallback((to) => (e) => {
    if (location.pathname === to) {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [location.pathname])

  const ticking = useRef(false)

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          setNavbarScrolled(window.scrollY > 60)
          ticking.current = false
        })
        ticking.current = true
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [setNavbarScrolled])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setMobileMenuOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [setMobileMenuOpen])

  return (
    <>
      <NavBar
        $scrolled={navbarScrolled}
      >
        <NavInner>
          {/* Logo con shimmer */}
          <LogoLink to={ROUTES.HOME} aria-label="IBYZA — Inicio" onClick={scrollToTop(ROUTES.HOME)}>
            <LogoText>IBYZA</LogoText>
          </LogoLink>

          {/* Navegación desktop */}
          <NavLinks>
            {NAV_LINKS.map((link) => (
              <StyledNavLink
                key={link.to}
                to={link.to}
                end={link.to === ROUTES.HOME}
                onClick={scrollToTop(link.to)}
              >
                {link.label}
              </StyledNavLink>
            ))}
          </NavLinks>

          {/* CTA desktop */}
          <NavCTA>
            <CTAButton as={Link} to={ROUTES.PROJECTS}>
              Ver proyectos
            </CTAButton>
          </NavCTA>

          {/* Botón hamburguesa móvil */}
          <HamburgerButton
            onClick={toggleMobileMenu}
            aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </HamburgerButton>
        </NavInner>
      </NavBar>

      {/* Menú móvil */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <MobileMenu
            as={motion.nav}
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {NAV_LINKS.map((link) => (
              <MobileNavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                end={link.to === ROUTES.HOME}
              >
                {link.label}
              </MobileNavLink>
            ))}
            <MobileCTA
              as={Link}
              to={ROUTES.PROJECTS}
              onClick={() => setMobileMenuOpen(false)}
            >
              Ver proyectos
            </MobileCTA>
          </MobileMenu>
        )}
      </AnimatePresence>
    </>
  )
}

// --- Shimmer animation ---
const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`

// --- Estilos ---

const NavBar = styled.header`
  --navbar-height: 80px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: ${({ theme }) => theme.zIndex.navbar};
  height: var(--navbar-height);
  transition: background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
  will-change: transform;

  background: ${({ $scrolled, theme }) =>
    $scrolled ? `${theme.colors.primary}e6` : 'transparent'};
  backdrop-filter: ${({ $scrolled }) => ($scrolled ? 'blur(10px)' : 'none')};
  -webkit-backdrop-filter: ${({ $scrolled }) => ($scrolled ? 'blur(10px)' : 'none')};
  border-bottom: 1px solid ${({ $scrolled }) =>
    $scrolled ? 'rgba(255,255,255,0.06)' : 'transparent'};
  box-shadow: ${({ $scrolled }) =>
    $scrolled ? '0 4px 24px rgba(0,0,0,0.35)' : 'none'};

  ${({ theme }) => theme.media.tablet} {
    --navbar-height: 70px;
  }

  ${({ theme }) => theme.media.mobile} {
    --navbar-height: 64px;
  }
`

const NavInner = styled.div`
  max-width: ${({ theme }) => theme.container.maxWidth};
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.lg};
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.xl};

  ${({ theme }) => theme.media.tablet} {
    padding: 0 ${({ theme }) => theme.spacing.md};
    gap: ${({ theme }) => theme.spacing.md};
  }
`

const LogoLink = styled(Link)`
  text-decoration: none;
  flex-shrink: 0;
`

const LogoText = styled.span`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: 900;
  letter-spacing: 0.14em;
  background: ${({ theme }) => theme.gradients.goldText};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  transition: opacity ${({ theme }) => theme.transitions.fast};

  ${({ theme }) => theme.media.mobile} {
    font-size: 1.4rem;
    letter-spacing: 0.1em;
  }

  &:hover {
    background: linear-gradient(
      90deg,
      #8B6914 0%,
      #D6B370 25%,
      #FFE499 50%,
      #D6B370 75%,
      #8B6914 100%
    );
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: ${shimmer} 1.5s linear infinite;
  }
`

const NavLinks = styled.nav`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xl};
  flex: 1;
  justify-content: center;

  ${({ theme }) => theme.media.tablet} {
    display: none;
  }
`

const StyledNavLink = styled(NavLink)`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 400;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-decoration: none;
  position: relative;
  padding-bottom: 4px;
  transition: color 0.2s ease;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background: ${({ theme }) => theme.colors.gold};
    border-radius: 2px;
    box-shadow: 0 0 8px ${({ theme }) => theme.colors.goldGlow};
    transition: width 0.3s ease;
  }

  &:hover {
    color: ${({ theme }) => theme.colors.white};
    &::after { width: 100%; }
  }

  &.active {
    color: ${({ theme }) => theme.colors.gold} !important;
    &::after { width: 100%; }
  }
`

const NavCTA = styled.div`
  flex-shrink: 0;

  ${({ theme }) => theme.media.tablet} {
    display: none;
  }
`

const CTAButton = styled.a`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 600;
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.lg}`};
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1.5px solid ${({ theme }) => theme.colors.gold};
  color: ${({ theme }) => theme.colors.deepBg};
  background: ${({ theme }) => theme.gradients.gold};
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    box-shadow: 0 4px 20px ${({ theme }) => theme.colors.goldGlow};
    transform: translateY(-1px);
    opacity: 0.92;
  }
`

const HamburgerButton = styled.button`
  display: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: ${({ theme }) => theme.spacing.xs};
  background: ${({ theme }) => theme.glass.card};
  border: 1px solid ${({ theme }) => theme.glass.border};
  border-radius: ${({ theme }) => theme.radii.md};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: rgba(255,255,255,0.08);
    border-color: ${({ theme }) => theme.colors.borderGold};
    color: ${({ theme }) => theme.colors.gold};
  }

  ${({ theme }) => theme.media.tablet} {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    padding: 0;
  }
`

const MobileMenu = styled.div`
  position: fixed;
  top: 70px;
  left: 0;
  right: 0;
  background: ${({ theme }) => `${theme.colors.primary}f5`};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(214,179,112,0.15);
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing.lg};
  gap: 0;
  z-index: ${({ theme }) => theme.zIndex.navbar - 1};
  box-shadow: 0 16px 40px rgba(0,0,0,0.5);
  max-height: calc(100vh - 70px);
  overflow-y: auto;

  ${({ theme }) => theme.media.mobile} {
    top: 64px;
    max-height: calc(100vh - 64px);
    padding: ${({ theme }) => theme.spacing.md};
  }

  ${({ theme }) => theme.media.minTablet} {
    display: none;
  }
`

const MobileNavLink = styled(NavLink)`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: 400;
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: ${({ theme }) => theme.spacing.md} 0;
  border-bottom: 1px solid ${({ theme }) => theme.glass.border};
  text-decoration: none;
  transition: color ${({ theme }) => theme.transitions.fast};

  &:hover, &.active {
    color: ${({ theme }) => theme.colors.gold};
  }

  &:last-child {
    border-bottom: none;
  }
`

const MobileCTA = styled.a`
  margin-top: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.gradients.gold};
  color: ${({ theme }) => theme.colors.deepBg};
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: 700;
  font-size: ${({ theme }) => theme.fontSizes.md};
  border-radius: ${({ theme }) => theme.radii.md};
  text-align: center;
  text-decoration: none;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`

export default Navbar
