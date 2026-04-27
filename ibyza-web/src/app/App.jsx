import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { HelmetProvider } from 'react-helmet-async';
import router from './router';
import theme from '@/shared/styles/theme';
import GlobalStyles from '@/shared/styles/GlobalStyles';

/**
 * App — Componente raíz de IBYZA Web.
 *
 * Jerarquía de providers:
 * HelmetProvider → ThemeProvider → RouterProvider
 *
 * ThemeProvider inyecta el theme de IBYZA en todos los Styled Components.
 * GlobalStyles aplica los estilos base (reset, fuentes, scroll).
 * ScrollToTop se aplica dentro del Layout que ya usa useLocation.
 */
const App = () => {
  return (
    <HelmetProvider>
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        <RouterProvider router={router} />
      </ThemeProvider>
    </HelmetProvider>
  );
};

export default App;
