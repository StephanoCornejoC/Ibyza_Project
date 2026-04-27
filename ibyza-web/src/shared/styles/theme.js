/**
 * Theme IBYZA — Fuente de verdad para todos los tokens visuales.
 * ADN visual: inconsarq.com adaptado a identidad IBYZA (navy + dorado).
 * NUNCA hardcodear colores o fuentes fuera de este archivo.
 * Pasado como prop "theme" a todos los Styled Components via ThemeProvider.
 */
const theme = {
  colors: {
    primary: '#0d1f33',      // Fondo principal (cards/secciones)
    deepBg: '#08131f',       // Fondo global más oscuro
    footerBg: '#050e18',     // Footer ultra oscuro
    surface: '#0d1f33',      // Superficie de cards/secciones
    gold: '#D6B370',         // Acento principal dorado
    goldDark: '#8D5A1B',     // Dorado oscuro (hover, énfasis)
    goldLight: '#FFE499',    // Dorado claro
    goldMid: '#E7AA51',      // Dorado medio (badges, accents)
    goldGlow: 'rgba(214,179,112,0.25)',
    white: '#FFFFFF',
    black: '#08131f',
    textPrimary: '#FFFFFF',
    textSecondary: '#a3a3a3',
    textMuted: '#666666',
    border: 'rgba(255,255,255,0.06)',
    borderGold: 'rgba(214,179,112,0.3)',
    gray: {
      100: '#F5F5F5',
      300: '#D1D1D1',
      500: '#888888',
      700: '#444444',
    },
    success: '#22C55E',
    error: '#EF4444',
    warning: '#F59E0B',
  },

  fonts: {
    heading: "'Playfair Display', serif",
    body: "'DM Sans', sans-serif",
  },

  fontSizes: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    md: '0.95rem',     // ~15px — body principal
    lg: '1.1rem',      // subtítulos
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '2.2rem',   // H3 — 900 weight
    '4xl': '3.8rem',   // H2 — 900 weight
    '5xl': '5rem',     // H1 — 900 weight
    '6xl': '3.75rem',  // 60px
    eyebrow: '0.72rem', // Eyebrow labels
  },

  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    xxl: '3rem',     // 48px
    xxxl: '4rem',    // 64px
    section: '5rem', // 80px — padding estándar de secciones
  },

  breakpoints: {
    mobileSm: '375px',
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1280px',
    ultrawide: '1536px',
  },

  media: {
    // max-width (mobile-first descendente: aplica AL Y POR DEBAJO del valor)
    mobileSm: '@media (max-width: 375px)',
    mobile: '@media (max-width: 480px)',
    tablet: '@media (max-width: 768px)',
    desktop: '@media (max-width: 1024px)',
    wide: '@media (max-width: 1280px)',
    // min-width (aplica POR ENCIMA del valor)
    minMobile: '@media (min-width: 481px)',
    minTablet: '@media (min-width: 769px)',
    minDesktop: '@media (min-width: 1025px)',
    // touch device (sin hover preciso) — para deshabilitar efectos hover/tilt
    touch: '@media (hover: none), (pointer: coarse)',
  },

  shadows: {
    sm: '0 1px 3px rgba(0,0,0,0.12)',
    md: '0 4px 12px rgba(0,0,0,0.15)',
    lg: '0 8px 24px rgba(0,0,0,0.18)',
    xl: '0 16px 48px rgba(0,0,0,0.22)',
    gold: '0 4px 20px rgba(214,179,112,0.2)',
  },

  radii: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },

  transitions: {
    fast: '0.15s ease',
    normal: '0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
    slow: '0.5s ease',
  },

  zIndex: {
    base: 0,
    dropdown: 100,
    sticky: 200,
    navbar: 300,
    modal: 400,
    toast: 500,
  },

  container: {
    maxWidth: '1200px',
    padding: '0 1.5rem',
  },

  // Tokens de glassmorphism premium (oscuro profundo)
  glass: {
    card: 'rgba(255,255,255,0.04)',
    cardHover: 'rgba(255,255,255,0.07)',
    border: 'rgba(255,255,255,0.06)',
    borderGold: 'rgba(214,179,112,0.3)',
    blur: 'blur(10px)',
    blurStrong: 'blur(20px)',
    shadow: '0 4px 20px rgba(0,0,0,0.4), 0 40px 80px rgba(0,0,0,0.3)',
    shadowGold: '0 4px 20px rgba(214,179,112,0.2)',
  },

  // Gradientes de identidad IBYZA × ADN inconsarq
  gradients: {
    hero: 'linear-gradient(to top, rgba(0,0,0,0) 0%, rgba(8,19,31,0.6) 85%, #08131f 100%)',
    card: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
    gold: 'linear-gradient(135deg, #D6B370 0%, #E7AA51 50%, #FFE499 100%)',
    goldText: 'linear-gradient(135deg, #D6B370 0%, #FFE499 100%)',
    goldDivider: 'linear-gradient(90deg, transparent, #D6B370, transparent)',
    overlay: 'linear-gradient(105deg, transparent 40%, #0d1f33 100%)',
    cardOverlay: 'linear-gradient(180deg, transparent 40%, rgba(8,19,31,0.95) 100%)',
    section: 'linear-gradient(180deg, #08131f 0%, #0d1f33 50%, #08131f 100%)',
  },
};

export default theme;
