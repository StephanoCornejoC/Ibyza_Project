import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { ROUTES } from '@/shared/constants/routes';

/**
 * NotFoundPage — Página 404 para rutas no encontradas.
 * Muestra un mensaje amigable y un botón para volver al inicio.
 */
const NotFoundPage = () => (
  <>
    <Helmet>
      <title>Página no encontrada | IBYZA</title>
    </Helmet>
    <Wrapper>
      <ErrorCode>404</ErrorCode>
      <Title>Página no encontrada</Title>
      <Message>
        La página que buscas no existe o fue movida.
      </Message>
      <HomeLink to={ROUTES.HOME}>Volver al inicio</HomeLink>
    </Wrapper>
  </>
);

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 2rem;
  text-align: center;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const ErrorCode = styled.h1`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 6rem;
  font-weight: 900;
  background: ${({ theme }) => theme.gradients.goldText};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  margin: 0;
`;

const Title = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.white};
  margin: 0;
`;

const Message = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  max-width: 400px;
  font-weight: 300;
`;

const HomeLink = styled(Link)`
  background: ${({ theme }) => theme.gradients.gold};
  color: ${({ theme }) => theme.colors.deepBg};
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.xl}`};
  border-radius: ${({ theme }) => theme.radii.md};
  font-weight: 700;
  text-decoration: none;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(214, 179, 112, 0.4);
  }
`;

export default NotFoundPage;
