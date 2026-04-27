import { Component } from 'react';
import styled from 'styled-components';

/**
 * ErrorBoundary — Captura errores de renderizado en el árbol de componentes.
 * Muestra un fallback amigable en lugar de pantalla blanca.
 *
 * Es un class component porque React no ofrece hooks equivalentes a
 * componentDidCatch / getDerivedStateFromError todavía.
 *
 * Uso:
 *   <ErrorBoundary>
 *     <ComponenteQuePuedeRomper />
 *   </ErrorBoundary>
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // En producción aquí se enviaría a Sentry u otro servicio
    console.error('[ErrorBoundary] Error capturado:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorWrapper>
          <ErrorIcon>⚠</ErrorIcon>
          <ErrorTitle>Algo salió mal</ErrorTitle>
          <ErrorMessage>
            Ocurrió un error inesperado. Por favor, recarga la página.
          </ErrorMessage>
          {import.meta.env.DEV && (
            <ErrorDetail>{this.state.error?.message}</ErrorDetail>
          )}
          <RetryButton onClick={this.handleReset}>
            Recargar página
          </RetryButton>
        </ErrorWrapper>
      );
    }

    return this.props.children;
  }
}

const ErrorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 2rem;
  text-align: center;
  gap: 1rem;
  background: ${({ theme }) => theme.colors.deepBg};
`;

const ErrorIcon = styled.div`
  font-size: 3rem;
  color: ${({ theme }) => theme.colors.error || '#EF4444'};
`;

const ErrorTitle = styled.h2`
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.fonts.heading};
`;

const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  max-width: 400px;
`;

const ErrorDetail = styled.code`
  background: ${({ theme }) => theme.colors.surface || 'rgba(255,255,255,0.05)'};
  border: 1px solid ${({ theme }) => theme.glass?.border || 'rgba(255,255,255,0.1)'};
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.error || '#EF4444'};
  max-width: 600px;
  word-break: break-word;
`;

const RetryButton = styled.button`
  background: ${({ theme }) => theme.gradients?.gold || '#D6B370'};
  color: ${({ theme }) => theme.colors.deepBg};
  border: none;
  padding: 0.75rem 2rem;
  border-radius: ${({ theme }) => theme.radii?.md || '4px'};
  font-weight: 600;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(214, 179, 112, 0.4);
  }
`;

export default ErrorBoundary;
