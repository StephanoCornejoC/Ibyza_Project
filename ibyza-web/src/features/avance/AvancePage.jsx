import { useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import {
  MapPin,
  BedDouble,
  Maximize2,
  Hash,
  Building2,
  Calendar,
  Construction,
  ArrowLeft,
  ArrowRight,
  KeyRound,
  AlertCircle,
} from 'lucide-react'

import { SectionTitle } from '@/shared/components/ui/SectionTitle'
import { Spinner } from '@/shared/components/ui/Spinner'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { ROUTES, buildAvanceRoute, buildProjectDetailRoute } from '@/shared/constants/routes'
import useAvance from './hooks/useAvance'
import heroBg from '@/assets/images/hero-projects-pexels-1920w.webp'

/**
 * AvancePage — Avance de obra para compradores con código.
 *
 * Modos:
 *  - Sin :codigo → muestra form de búsqueda. Submit → navigate(/avance/<codigo>).
 *  - Con :codigo → consulta /api/avance/<codigo>/ y renderiza:
 *      header del proyecto + info del departamento + timeline cronológico.
 *
 * Errores 404 y 429 se manejan con cards específicas. El comprador siempre
 * puede volver al form con "Probar con otro código".
 */
const AvancePage = () => {
  const { codigo } = useParams()
  const [searchParams] = useSearchParams()
  const errorFromQuery = searchParams.get('error')

  const isSearching = Boolean(codigo)
  const { data, loading, error } = useAvance(codigo)

  return (
    <>
      <Helmet>
        <title>Avance de obra | IBYZA</title>
        <meta
          name="description"
          content="Consulta el avance de obra de tu departamento IBYZA con el código que recibiste al separar tu unidad."
        />
      </Helmet>

      {!isSearching && <SearchView errorFromQuery={errorFromQuery} />}

      {isSearching && loading && <LoadingView />}
      {isSearching && !loading && error && (
        <ErrorView errorCode={error} codigo={codigo} />
      )}
      {isSearching && !loading && !error && data && <ResultView data={data} />}
    </>
  )
}

// ============================================================================
// Search view (sin código en URL)
// ============================================================================

const SearchView = ({ errorFromQuery }) => {
  const navigate = useNavigate()
  const [codigo, setCodigo] = useState('')
  const [touched, setTouched] = useState(false)

  const trimmed = codigo.trim()
  const isValid = trimmed.length > 0
  const showInlineError = touched && !isValid

  const handleSubmit = (e) => {
    e.preventDefault()
    setTouched(true)
    if (!isValid) return
    navigate(buildAvanceRoute(trimmed))
  }

  // Mensaje desde query (?error=invalid) — por si llegamos desde un redirect
  const queryErrorMessage = useMemo(() => {
    if (errorFromQuery === 'invalid') return 'Código inválido o expirado.'
    if (errorFromQuery === 'throttled') return 'Demasiadas solicitudes. Esperá un minuto antes de reintentar.'
    return null
  }, [errorFromQuery])

  return (
    <>
      <Hero $half>
        <HeroOverlay />
        <HeroContent>
          <SectionTitle
            eyebrow="Avance de obra"
            title="Avance de tu departamento"
            subtitle="Ingresá el código que recibiste al separar tu unidad para ver el progreso de la obra."
            light
          />
        </HeroContent>
      </Hero>

      <ContentWrapper>
        <SearchCard
          as={motion.div}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <SearchHeader>
            <SearchIconCircle>
              <KeyRound size={26} />
            </SearchIconCircle>
            <SearchTitle>Ingresá tu código</SearchTitle>
            <SearchHelp>
              Lo encontrás en el correo de confirmación de tu separación.
            </SearchHelp>
          </SearchHeader>

          {queryErrorMessage && (
            <InlineError role="alert">
              <AlertCircle size={16} />
              {queryErrorMessage}
            </InlineError>
          )}

          <Form onSubmit={handleSubmit} noValidate>
            <InputGroup>
              <InputLabel htmlFor="codigo-avance">Código de comprador</InputLabel>
              <Input
                id="codigo-avance"
                type="text"
                placeholder="Ej: ABC-123-XYZ9"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                onBlur={() => setTouched(true)}
                autoComplete="off"
                autoFocus
                aria-invalid={showInlineError}
                aria-describedby={showInlineError ? 'codigo-error' : undefined}
              />
              {showInlineError && (
                <FieldError id="codigo-error">
                  Ingresá el código que recibiste al separar.
                </FieldError>
              )}
            </InputGroup>

            <SubmitBtn type="submit">
              Ver avance
              <ArrowRight size={16} />
            </SubmitBtn>
          </Form>

          <SearchFooter>
            <span>¿Aún no separaste tu departamento?</span>
            <FooterLink to={ROUTES.SEPARACION}>Ver disponibles</FooterLink>
          </SearchFooter>
        </SearchCard>
      </ContentWrapper>
    </>
  )
}

// ============================================================================
// Loading view
// ============================================================================

const LoadingView = () => (
  <>
    <Hero $half>
      <HeroOverlay />
      <HeroContent>
        <SectionTitle eyebrow="Avance de obra" title="Cargando..." light />
      </HeroContent>
    </Hero>
    <ContentWrapper>
      <CenteredColumn>
        <Spinner size="lg" />
        <LoadingText>Cargando avance de tu departamento...</LoadingText>
      </CenteredColumn>
    </ContentWrapper>
  </>
)

// ============================================================================
// Error view (404 / 429 / network)
// ============================================================================

const ErrorView = ({ errorCode }) => {
  const navigate = useNavigate()

  const copy = useMemo(() => {
    if (errorCode === 'CODE_NOT_FOUND') {
      return {
        title: 'Código inválido o expirado',
        description:
          'No encontramos un avance asociado a este código. Verificá que esté escrito correctamente, o que no haya vencido.',
      }
    }
    if (errorCode === 'THROTTLED') {
      return {
        title: 'Demasiadas solicitudes',
        description: 'Esperá un minuto antes de reintentar la búsqueda.',
      }
    }
    return {
      title: 'No pudimos cargar el avance',
      description: 'Hubo un problema de conexión. Intentá de nuevo en unos segundos.',
    }
  }, [errorCode])

  return (
    <>
      <Hero $half>
        <HeroOverlay />
        <HeroContent>
          <SectionTitle eyebrow="Avance de obra" title="Sin resultados" light />
        </HeroContent>
      </Hero>

      <ContentWrapper>
        <ErrorCard
          as={motion.div}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <ErrorIconCircle>
            <AlertCircle size={28} />
          </ErrorIconCircle>
          <ErrorTitle>{copy.title}</ErrorTitle>
          <ErrorDescription>{copy.description}</ErrorDescription>
          <ErrorActions>
            <SecondaryBtn type="button" onClick={() => navigate(ROUTES.AVANCE)}>
              <ArrowLeft size={16} />
              Probar con otro código
            </SecondaryBtn>
          </ErrorActions>
        </ErrorCard>
      </ContentWrapper>
    </>
  )
}

// ============================================================================
// Result view (200 OK con data)
// ============================================================================

const ResultView = ({ data }) => {
  const { proyecto, departamento, avances } = data

  // Ordenamos avances por fecha desc (más recientes arriba).
  // El backend ya los devuelve ordenados, pero defensivamente lo aseguramos.
  const avancesOrdenados = useMemo(() => {
    const lista = Array.isArray(avances) ? [...avances] : []
    return lista.sort((a, b) => {
      const fa = a?.fecha ? new Date(a.fecha).getTime() : 0
      const fb = b?.fecha ? new Date(b.fecha).getTime() : 0
      return fb - fa
    })
  }, [avances])

  return (
    <>
      {/* Hero: imagen del proyecto + nombre + ubicación */}
      <ProjectHero $bgImage={proyecto?.imagen_fachada}>
        <ProjectHeroOverlay />
        <ProjectHeroContent>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ProjectEyebrow>— AVANCE DE OBRA —</ProjectEyebrow>
            <ProjectName>{proyecto?.nombre || 'Proyecto'}</ProjectName>
            {proyecto?.ubicacion && (
              <ProjectLocation>
                <MapPin size={16} />
                {proyecto.ubicacion}
              </ProjectLocation>
            )}
          </motion.div>
          {proyecto?.slug && (
            <ProjectLink to={buildProjectDetailRoute(proyecto.slug)}>
              Ver proyecto
              <ArrowRight size={14} />
            </ProjectLink>
          )}
        </ProjectHeroContent>
      </ProjectHero>

      <ContentWrapper>
        {/* Info del departamento */}
        <DeptInfoCard
          as={motion.div}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          <DeptInfoHeader>
            <DeptInfoLabel>Tu departamento</DeptInfoLabel>
            <DeptInfoCode>Depto {departamento?.codigo}</DeptInfoCode>
          </DeptInfoHeader>

          <DeptInfoGrid>
            <InfoItem>
              <Building2 size={16} />
              <InfoStack>
                <InfoCaption>Piso</InfoCaption>
                <InfoValue>{departamento?.piso ?? '—'}</InfoValue>
              </InfoStack>
            </InfoItem>
            <InfoItem>
              <BedDouble size={16} />
              <InfoStack>
                <InfoCaption>Tipo</InfoCaption>
                <InfoValue>{departamento?.tipo_display || '—'}</InfoValue>
              </InfoStack>
            </InfoItem>
            <InfoItem>
              <Maximize2 size={16} />
              <InfoStack>
                <InfoCaption>Área total</InfoCaption>
                <InfoValue>{formatArea(departamento?.area_total)}</InfoValue>
              </InfoStack>
            </InfoItem>
            <InfoItem>
              <Hash size={16} />
              <InfoStack>
                <InfoCaption>Área techada</InfoCaption>
                <InfoValue>{formatArea(departamento?.area_techada)}</InfoValue>
              </InfoStack>
            </InfoItem>
          </DeptInfoGrid>
        </DeptInfoCard>

        {/* Timeline de avances */}
        <TimelineSection>
          <TimelineHeader>
            <TimelineEyebrow>— PROGRESO DE LA OBRA —</TimelineEyebrow>
            <TimelineTitle>Lo que viene avanzando</TimelineTitle>
            <TimelineDivider />
          </TimelineHeader>

          {avancesOrdenados.length === 0 && (
            <EmptyState
              icon={Construction}
              title="Aún no hay avances publicados"
              description="Cuando el equipo de obra publique nuevos hitos, los verás acá."
            />
          )}

          {avancesOrdenados.length > 0 && (
            <Timeline>
              {avancesOrdenados.map((avance, idx) => (
                <TimelineItem
                  key={avance.id ?? `${avance.fecha}-${idx}`}
                  as={motion.li}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: Math.min(idx * 0.05, 0.3) }}
                >
                  <TimelineDot aria-hidden="true">
                    <TimelineDotInner />
                  </TimelineDot>

                  <TimelineCard>
                    {avance.imagen && (
                      <TimelineImageWrap>
                        <TimelineImage
                          src={avance.imagen}
                          alt={avance.titulo || 'Avance de obra'}
                          loading="lazy"
                        />
                      </TimelineImageWrap>
                    )}
                    <TimelineBody>
                      <TimelineDate>
                        <Calendar size={13} />
                        {formatFecha(avance.fecha)}
                      </TimelineDate>
                      <TimelineCardTitle>{avance.titulo}</TimelineCardTitle>
                      {avance.contenido && (
                        <TimelineContent>{avance.contenido}</TimelineContent>
                      )}
                    </TimelineBody>
                  </TimelineCard>
                </TimelineItem>
              ))}
            </Timeline>
          )}
        </TimelineSection>
      </ContentWrapper>
    </>
  )
}

// ============================================================================
// Helpers
// ============================================================================

const formatArea = (value) => {
  if (value === null || value === undefined || value === '') return '—'
  const num = typeof value === 'number' ? value : Number(value)
  if (Number.isNaN(num)) return String(value)
  return `${num.toFixed(2)} m²`
}

const formatFecha = (fecha) => {
  if (!fecha) return '—'
  // Aceptamos 'YYYY-MM-DD' o ISO. Construimos local-aware.
  const date = new Date(fecha)
  if (Number.isNaN(date.getTime())) return String(fecha)
  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

// ============================================================================
// Styled components
// ============================================================================

// --- Hero genérico (search, loading, error) ---

const Hero = styled.section`
  position: relative;
  height: ${({ $half }) => ($half ? '50vh' : '100vh')};
  min-height: ${({ $half }) => ($half ? '380px' : '600px')};
  background-color: ${({ theme }) => theme.colors.deepBg};
  background-image: url(${heroBg});
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => `${theme.spacing.section} ${theme.spacing.lg}`};
  padding-top: calc(80px + ${({ theme }) => theme.spacing.xl});
  overflow: hidden;

  ${({ theme }) => theme.media.tablet} {
    padding: ${({ theme }) => `${theme.spacing.xxxl} ${theme.spacing.md}`};
    padding-top: calc(70px + ${({ theme }) => theme.spacing.lg});
    min-height: 320px;
  }

  ${({ theme }) => theme.media.mobile} {
    padding-top: calc(64px + ${({ theme }) => theme.spacing.md});
    min-height: 280px;
  }
`

const HeroOverlay = styled.div`
  position: absolute;
  inset: 0;
  background:
    linear-gradient(135deg, rgba(15,35,59,0.86) 0%, rgba(15,35,59,0.74) 100%),
    radial-gradient(ellipse at 30% 30%, rgba(214,179,112,0.10) 0%, transparent 60%),
    radial-gradient(ellipse at 70% 70%, rgba(214,179,112,0.06) 0%, transparent 60%);
  pointer-events: none;
`

const HeroContent = styled.div`
  position: relative;
  z-index: 1;
  max-width: ${({ theme }) => theme.container.maxWidth};
  width: 100%;
  margin: 0 auto;
  text-align: center;
`

const ContentWrapper = styled.div`
  max-width: ${({ theme }) => theme.container.maxWidth};
  margin: 0 auto;
  padding: ${({ theme }) => `${theme.spacing.section} ${theme.spacing.lg}`};

  ${({ theme }) => theme.media.tablet} {
    padding: ${({ theme }) => `${theme.spacing.xxxl} ${theme.spacing.md}`};
  }

  ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => `${theme.spacing.xxl} ${theme.spacing.md}`};
  }
`

const CenteredColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.xxl} 0;
`

const LoadingText = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 300;
  letter-spacing: 0.3px;
`

// --- Search card ---

const SearchCard = styled.div`
  max-width: 540px;
  margin: 0 auto;
  background: ${({ theme }) => theme.glass.card};
  border: 1px solid ${({ theme }) => theme.glass.border};
  border-radius: 18px;
  padding: ${({ theme }) => theme.spacing.xxl};
  backdrop-filter: ${({ theme }) => theme.glass.blur};
  box-shadow: ${({ theme }) => theme.glass.shadow};

  ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => theme.spacing.xl};
    border-radius: 14px;
  }
`

const SearchHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`

const SearchIconCircle = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(214,179,112,0.10);
  border: 1px solid rgba(214,179,112,0.28);
  color: ${({ theme }) => theme.colors.gold};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${({ theme }) => theme.spacing.md};
`

const SearchTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: 900;
  color: ${({ theme }) => theme.colors.white};
  margin: 0 0 ${({ theme }) => theme.spacing.sm};
  letter-spacing: -0.5px;
`

const SearchHelp = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
  line-height: 1.6;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`

const InputLabel = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.eyebrow};
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 3px;
  color: ${({ theme }) => theme.colors.gold};
`

const Input = styled.input`
  background: rgba(255,255,255,0.04);
  border: 1px solid ${({ theme }) => theme.glass.border};
  border-radius: 10px;
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.md};
  letter-spacing: 1px;
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.md}`};
  transition: border-color 0.25s ease, background 0.25s ease;
  width: 100%;

  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
    letter-spacing: 0.5px;
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.gold};
    background: rgba(255,255,255,0.06);
  }

  &[aria-invalid='true'] {
    border-color: ${({ theme }) => theme.colors.error};
  }
`

const FieldError = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.error};
`

const SubmitBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.gradients.gold};
  color: ${({ theme }) => theme.colors.deepBg};
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: 700;
  font-size: ${({ theme }) => theme.fontSizes.md};
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
  border-radius: 10px;
  border: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 4px 16px rgba(214,179,112,0.3);

  &:hover {
    box-shadow: 0 8px 24px rgba(214,179,112,0.45);
    transform: translateY(-2px);
  }

  svg { transition: transform 0.15s ease; }
  &:hover svg { transform: translateX(3px); }
`

const InlineError = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  background: rgba(239,68,68,0.08);
  border: 1px solid rgba(239,68,68,0.35);
  color: ${({ theme }) => theme.colors.error};
  border-radius: 10px;
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const SearchFooter = styled.div`
  margin-top: ${({ theme }) => theme.spacing.xl};
  padding-top: ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.glass.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textMuted};

  ${({ theme }) => theme.media.mobile} {
    flex-direction: column;
    align-items: flex-start;
    gap: ${({ theme }) => theme.spacing.sm};
  }
`

const FooterLink = styled(Link)`
  color: ${({ theme }) => theme.colors.gold};
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.goldLight};
  }
`

// --- Error card ---

const ErrorCard = styled.div`
  max-width: 540px;
  margin: 0 auto;
  background: ${({ theme }) => theme.glass.card};
  border: 1px solid ${({ theme }) => theme.glass.border};
  border-radius: 18px;
  padding: ${({ theme }) => theme.spacing.xxl};
  backdrop-filter: ${({ theme }) => theme.glass.blur};
  box-shadow: ${({ theme }) => theme.glass.shadow};
  text-align: center;

  ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => theme.spacing.xl};
  }
`

const ErrorIconCircle = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: rgba(239,68,68,0.08);
  border: 1px solid rgba(239,68,68,0.35);
  color: ${({ theme }) => theme.colors.error};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${({ theme }) => theme.spacing.lg};
`

const ErrorTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: 900;
  color: ${({ theme }) => theme.colors.white};
  margin: 0 0 ${({ theme }) => theme.spacing.sm};
  letter-spacing: -0.5px;
`

const ErrorDescription = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 300;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.7;
  margin: 0 0 ${({ theme }) => theme.spacing.xl};
  max-width: 420px;
  margin-left: auto;
  margin-right: auto;
`

const ErrorActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: center;
  flex-wrap: wrap;
`

const SecondaryBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  background: rgba(255,255,255,0.04);
  border: 1px solid ${({ theme }) => theme.glass.border};
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: 600;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.lg}`};
  border-radius: 10px;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.25s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.gold};
    color: ${({ theme }) => theme.colors.gold};
  }
`

// --- Project hero (result view) ---

const ProjectHero = styled.section`
  position: relative;
  height: 50vh;
  min-height: 380px;
  background-color: ${({ theme }) => theme.colors.deepBg};
  background-image: ${({ $bgImage }) => ($bgImage ? `url(${$bgImage})` : `url(${heroBg})`)};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: flex-end;
  padding: ${({ theme }) => `${theme.spacing.xxl} ${theme.spacing.lg}`};
  padding-top: calc(80px + ${({ theme }) => theme.spacing.xl});
  overflow: hidden;

  ${({ theme }) => theme.media.tablet} {
    padding: ${({ theme }) => `${theme.spacing.xl} ${theme.spacing.md}`};
    padding-top: calc(70px + ${({ theme }) => theme.spacing.lg});
    min-height: 320px;
  }

  ${({ theme }) => theme.media.mobile} {
    padding-top: calc(64px + ${({ theme }) => theme.spacing.md});
    min-height: 280px;
  }
`

const ProjectHeroOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(8,19,31,0.45) 0%, rgba(8,19,31,0.92) 100%);
  pointer-events: none;
`

const ProjectHeroContent = styled.div`
  position: relative;
  z-index: 1;
  max-width: ${({ theme }) => theme.container.maxWidth};
  width: 100%;
  margin: 0 auto;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.lg};

  ${({ theme }) => theme.media.tablet} {
    flex-direction: column;
    align-items: flex-start;
  }
`

const ProjectEyebrow = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.eyebrow};
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 4px;
  color: ${({ theme }) => theme.colors.gold};
  margin: 0 0 ${({ theme }) => theme.spacing.sm};
`

const ProjectName = styled.h1`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes['4xl']};
  font-weight: 900;
  color: ${({ theme }) => theme.colors.white};
  letter-spacing: -1.5px;
  line-height: 1.05;
  margin: 0 0 ${({ theme }) => theme.spacing.sm};

  ${({ theme }) => theme.media.tablet} {
    font-size: 2.4rem;
    letter-spacing: -1px;
  }

  ${({ theme }) => theme.media.mobile} {
    font-size: 1.85rem;
    letter-spacing: -0.5px;
  }
`

const ProjectLocation = styled.p`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: rgba(255,255,255,0.8);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1.5px;

  svg { color: ${({ theme }) => theme.colors.gold}; }
`

const ProjectLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  background: rgba(214,179,112,0.12);
  border: 1px solid rgba(214,179,112,0.4);
  color: ${({ theme }) => theme.colors.gold};
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: 600;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.lg}`};
  border-radius: 999px;
  text-decoration: none;
  white-space: nowrap;
  transition: all 0.25s ease;

  &:hover {
    background: rgba(214,179,112,0.2);
    color: ${({ theme }) => theme.colors.goldLight};
  }
`

// --- Department info card ---

const DeptInfoCard = styled.div`
  background: ${({ theme }) => theme.glass.card};
  border: 1px solid ${({ theme }) => theme.glass.border};
  border-radius: 18px;
  padding: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
  backdrop-filter: ${({ theme }) => theme.glass.blur};
  box-shadow: ${({ theme }) => theme.glass.shadow};

  ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => theme.spacing.lg};
    border-radius: 14px;
  }
`

const DeptInfoHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  padding-bottom: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.glass.border};

  ${({ theme }) => theme.media.mobile} {
    flex-direction: column;
    align-items: flex-start;
  }
`

const DeptInfoLabel = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.eyebrow};
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 3px;
  color: ${({ theme }) => theme.colors.gold};
  margin: 0;
`

const DeptInfoCode = styled.span`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: 900;
  color: ${({ theme }) => theme.colors.white};
  letter-spacing: 1px;
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.md}`};
  background: rgba(0,0,0,0.4);
  border: 1px solid rgba(214,179,112,0.25);
  border-radius: 8px;
`

const DeptInfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${({ theme }) => theme.spacing.lg};

  ${({ theme }) => theme.media.tablet} {
    grid-template-columns: repeat(2, 1fr);
  }

  ${({ theme }) => theme.media.mobile} {
    grid-template-columns: repeat(2, 1fr);
    gap: ${({ theme }) => theme.spacing.md};
  }
`

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};

  svg {
    color: ${({ theme }) => theme.colors.gold};
    opacity: 0.85;
    flex-shrink: 0;
  }
`

const InfoStack = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`

const InfoCaption = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-bottom: 2px;
`

const InfoValue = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.white};
  letter-spacing: 0.2px;
`

// --- Timeline ---

const TimelineSection = styled.section`
  max-width: 760px;
  margin: 0 auto;
`

const TimelineHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
`

const TimelineEyebrow = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.eyebrow};
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 4px;
  color: ${({ theme }) => theme.colors.gold};
  margin: 0 0 ${({ theme }) => theme.spacing.sm};
`

const TimelineTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes['3xl']};
  font-weight: 900;
  color: ${({ theme }) => theme.colors.white};
  margin: 0;
  letter-spacing: -1px;

  ${({ theme }) => theme.media.mobile} {
    font-size: 1.7rem;
  }
`

const TimelineDivider = styled.div`
  height: 1px;
  width: 80px;
  background: ${({ theme }) => theme.gradients.goldDivider};
  margin: ${({ theme }) => theme.spacing.md} auto 0;
  box-shadow: 0 0 10px rgba(214,179,112,0.3);
`

const Timeline = styled.ol`
  list-style: none;
  position: relative;
  padding: 0;
  margin: 0;

  /* Línea vertical dorada */
  &::before {
    content: '';
    position: absolute;
    left: 11px;
    top: 6px;
    bottom: 6px;
    width: 2px;
    background: linear-gradient(
      180deg,
      rgba(214,179,112,0.4) 0%,
      rgba(214,179,112,0.15) 100%
    );
  }

  ${({ theme }) => theme.media.mobile} {
    &::before { left: 9px; }
  }
`

const TimelineItem = styled.li`
  position: relative;
  padding-left: ${({ theme }) => theme.spacing.xl};
  padding-bottom: ${({ theme }) => theme.spacing.xl};

  &:last-child { padding-bottom: 0; }

  ${({ theme }) => theme.media.mobile} {
    padding-left: ${({ theme }) => theme.spacing.lg};
  }
`

const TimelineDot = styled.div`
  position: absolute;
  left: 0;
  top: 6px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.deepBg};
  border: 2px solid rgba(214,179,112,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;

  ${({ theme }) => theme.media.mobile} {
    width: 20px;
    height: 20px;
  }
`

const TimelineDotInner = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ theme }) => theme.gradients.gold};
  box-shadow: 0 0 8px rgba(214,179,112,0.6);
`

const TimelineCard = styled.article`
  background: ${({ theme }) => theme.glass.card};
  border: 1px solid ${({ theme }) => theme.glass.border};
  border-radius: 14px;
  overflow: hidden;
  transition: border-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    border-color: rgba(214,179,112,0.3);
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(0,0,0,0.4);
  }
`

const TimelineImageWrap = styled.div`
  width: 100%;
  aspect-ratio: 16 / 9;
  background: ${({ theme }) => theme.colors.primary};
  overflow: hidden;
`

const TimelineImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`

const TimelineBody = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};

  ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => theme.spacing.md};
  }
`

const TimelineDate = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  text-transform: uppercase;
  letter-spacing: 2px;
  color: ${({ theme }) => theme.colors.gold};
  font-weight: 700;
  margin-bottom: ${({ theme }) => theme.spacing.sm};

  svg { opacity: 0.85; }
`

const TimelineCardTitle = styled.h3`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: 900;
  color: ${({ theme }) => theme.colors.white};
  margin: 0 0 ${({ theme }) => theme.spacing.sm};
  letter-spacing: -0.3px;
  line-height: 1.25;
`

const TimelineContent = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 300;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.75;
  margin: 0;
`

export default AvancePage
