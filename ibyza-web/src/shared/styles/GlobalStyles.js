import { createGlobalStyle } from 'styled-components';

/**
 * Estilos globales de la aplicación IBYZA.
 * ADN visual: inconsarq.com — fondo negro profundo, tipografía grande, dorado como acento.
 * Se aplican una sola vez desde App.jsx via ThemeProvider.
 */
const GlobalStyles = createGlobalStyle`
  /* Reset moderno */
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    scroll-behavior: smooth;
    font-size: 16px;

    ${({ theme }) => theme.media.tablet} {
      font-size: 15px;
    }

    ${({ theme }) => theme.media.mobile} {
      font-size: 14px;
    }
  }

  body {
    font-family: ${({ theme }) => theme.fonts.body};
    font-size: ${({ theme }) => theme.fontSizes.md};
    font-weight: 400;
    line-height: 1.85;
    color: ${({ theme }) => theme.colors.textPrimary};
    background-color: ${({ theme }) => theme.colors.deepBg};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
    width: 100%;
    max-width: 100vw;
  }

  /* Prevenir overflow horizontal en mobile */
  #root {
    overflow-x: hidden;
    width: 100%;
    max-width: 100vw;
  }

  /* Cursor personalizado — solo en desktop con puntero fino */
  @media (pointer: fine) {
    *, *::before, *::after {
      cursor: none !important;
    }
  }

  /* Imagenes y video nunca se desbordan */
  img, video, svg, picture {
    max-width: 100%;
    height: auto;
  }

  /* Tablas con scroll horizontal en mobile */
  table {
    max-width: 100%;
  }

  /* Headings: Playfair Display con weight 900 y letter-spacing ajustado */
  h1 {
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: ${({ theme }) => theme.fontSizes['5xl']};
    font-weight: 900;
    letter-spacing: -3px;
    line-height: 1;
    color: ${({ theme }) => theme.colors.textPrimary};

    ${({ theme }) => theme.media.tablet} {
      font-size: 3rem;
      letter-spacing: -2px;
    }

    ${({ theme }) => theme.media.mobile} {
      font-size: 2.2rem;
      letter-spacing: -1px;
    }
  }

  h2 {
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: ${({ theme }) => theme.fontSizes['4xl']};
    font-weight: 900;
    letter-spacing: -2px;
    line-height: 1.05;
    color: ${({ theme }) => theme.colors.textPrimary};

    ${({ theme }) => theme.media.tablet} {
      font-size: 2.5rem;
      letter-spacing: -1px;
    }

    ${({ theme }) => theme.media.mobile} {
      font-size: 1.85rem;
      letter-spacing: -0.5px;
    }
  }

  h3 {
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: ${({ theme }) => theme.fontSizes['3xl']};
    font-weight: 900;
    letter-spacing: -1px;
    line-height: 1.1;
    color: ${({ theme }) => theme.colors.textPrimary};

    ${({ theme }) => theme.media.tablet} {
      font-size: 1.75rem;
    }

    ${({ theme }) => theme.media.mobile} {
      font-size: 1.5rem;
      letter-spacing: -0.3px;
    }
  }

  h4, h5, h6 {
    font-family: ${({ theme }) => theme.fonts.heading};
    font-weight: 700;
    line-height: 1.2;
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  a {
    color: inherit;
    text-decoration: none;
    transition: color ${({ theme }) => theme.transitions.fast};
  }

  img {
    max-width: 100%;
    height: auto;
    display: block;
  }

  button {
    cursor: pointer;
    border: none;
    background: none;
    font-family: inherit;
  }

  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
  }

  ul, ol {
    list-style: none;
  }

  /* Utilidades de accesibilidad */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  /* Contenedor centrado estándar */
  .container {
    max-width: ${({ theme }) => theme.container.maxWidth};
    margin: 0 auto;
    padding: ${({ theme }) => theme.container.padding};
  }

  /* Scrollbar personalizado elegante */
  ::-webkit-scrollbar {
    width: 6px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.deepBg};
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.gradients.goldDivider};
    border-radius: ${({ theme }) => theme.radii.full};
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.gold};
  }

  /* Selección de texto con dorado */
  ::selection {
    background-color: rgba(214, 179, 112, 0.35);
    color: ${({ theme }) => theme.colors.goldLight};
  }

  /* ===== ANIMACIONES GLOBALES ===== */

  /* Shimmer — para bordes y texto degradado animado */
  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }

  /* Gradient text animado */
  @keyframes gradientShift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }

  /* Float — para elementos decorativos */
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-12px); }
  }

  /* Pulse — para cursor y WhatsApp */
  @keyframes pulse {
    0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(214,179,112,0.4); }
    50% { transform: scale(1.05); box-shadow: 0 0 0 15px rgba(214,179,112,0); }
  }

  /* Glow border */
  @keyframes glowBorder {
    0%, 100% { box-shadow: 0 0 10px rgba(214,179,112,0.3); }
    50% { box-shadow: 0 0 25px rgba(214,179,112,0.7), 0 0 50px rgba(214,179,112,0.2); }
  }

  /* Respeta preferencias de accesibilidad */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;

export default GlobalStyles;
