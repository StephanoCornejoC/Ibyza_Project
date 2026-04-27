import { useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { CreditCard, Building2, MapPin, BedDouble, Maximize2, ArrowRight, ShieldCheck } from 'lucide-react'

import { SectionTitle } from '@/shared/components/ui/SectionTitle'
import { Spinner } from '@/shared/components/ui/Spinner'
import { Badge } from '@/shared/components/ui/Badge'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { formatPriceUSD, formatArea } from '@/shared/utils/formatters'
import { buildProjectDetailRoute } from '@/shared/constants/routes'
import useUIStore from '@/shared/stores/useUIStore'
import useDepartamentosDisponibles from './hooks/useDepartamentosDisponibles'

/**
 * SeparacionPage — Camino directo para separar un departamento.
 * Muestra TODOS los deptos con estado 'disponible' de todos los proyectos.
 * Cada tarjeta abre el modal de separacion con Culqi + Transferencia.
 */
const SeparacionPage = () => {
  const { deptos, loading, error } = useDepartamentosDisponibles()
  const { openSeparationModal } = useUIStore()
  const [filtroProyecto, setFiltroProyecto] = useState('todos')

  // Lista de proyectos unicos con deptos disponibles
  const proyectosConDeptos = useMemo(() => {
    const map = new Map()
    deptos.forEach((d) => {
      if (d.proyecto && !map.has(d.proyecto.slug)) {
        map.set(d.proyecto.slug, d.proyecto)
      }
    })
    return [...map.values()]
  }, [deptos])

  // Deptos filtrados por proyecto seleccionado
  const deptosFiltrados = useMemo(() => {
    if (filtroProyecto === 'todos') return deptos
    return deptos.filter((d) => d.proyecto?.slug === filtroProyecto)
  }, [deptos, filtroProyecto])

  const handleSeparar = (dept) => {
    openSeparationModal(dept, dept.proyecto)
  }

  return (
    <>
      <Helmet>
        <title>Separar Departamento | IBYZA</title>
        <meta
          name="description"
          content="Separa tu departamento disponible en IBYZA con tarjeta de credito o transferencia bancaria. Proceso seguro y rapido."
        />
      </Helmet>

      <Hero>
        <HeroOverlay />
        <HeroContent>
          <SectionTitle
            eyebrow="Separa tu departamento"
            title="Invierte en tu futuro"
            subtitle="Reserva el departamento de tus suenos con un deposito de separacion. Pago con tarjeta o transferencia bancaria."
            light
          />
          <HeroBadges
            as={motion.div}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <HeroBadge>
              <CreditCard size={16} />
              Tarjeta Culqi
            </HeroBadge>
            <HeroBadge>
              <Building2 size={16} />
              Transferencia bancaria
            </HeroBadge>
            <HeroBadge>
              <ShieldCheck size={16} />
              Transaccion segura
            </HeroBadge>
          </HeroBadges>
        </HeroContent>
      </Hero>

      <ContentWrapper>
        {/* Filtros */}
        {!loading && !error && deptos.length > 0 && (
          <FiltersRow>
            <FilterLabel>Filtrar por proyecto</FilterLabel>
            <FilterChips>
              <FilterChip
                $active={filtroProyecto === 'todos'}
                onClick={() => setFiltroProyecto('todos')}
              >
                Todos ({deptos.length})
              </FilterChip>
              {proyectosConDeptos.map((p) => {
                const count = deptos.filter((d) => d.proyecto?.slug === p.slug).length
                return (
                  <FilterChip
                    key={p.slug}
                    $active={filtroProyecto === p.slug}
                    onClick={() => setFiltroProyecto(p.slug)}
                  >
                    {p.nombre} ({count})
                  </FilterChip>
                )
              })}
            </FilterChips>
          </FiltersRow>
        )}

        {loading && <Spinner size="lg" centered />}

        {error && (
          <EmptyState
            title="Error al cargar departamentos"
            description={error}
          />
        )}

        {!loading && !error && deptos.length === 0 && (
          <EmptyState
            title="Sin departamentos disponibles"
            description="Todos nuestros proyectos estan vendidos o separados. Por favor contactanos para futuras oportunidades."
          />
        )}

        {!loading && !error && deptos.length > 0 && (
          <DeptosGrid>
            {deptosFiltrados.map((dept, idx) => (
              <DeptoCard
                key={dept.id}
                as={motion.div}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: (idx % 6) * 0.06 }}
              >
                {/* Hero de la card con imagen del proyecto */}
                <CardHero $bgImage={dept.proyecto?.imagen_fachada}>
                  <CardHeroOverlay />
                  <CardHeroTop>
                    <Badge status="disponible" size="sm" />
                    <CardDeptCode>Depto {dept.codigo}</CardDeptCode>
                  </CardHeroTop>
                  <CardHeroBottom>
                    <CardProyectoNombre>{dept.proyecto?.nombre}</CardProyectoNombre>
                    <CardUbicacion>
                      <MapPin size={12} />
                      {dept.proyecto?.ubicacion}
                    </CardUbicacion>
                  </CardHeroBottom>
                </CardHero>

                {/* Info del depto */}
                <CardBody>
                  <InfoGrid>
                    <InfoItem>
                      <BedDouble size={14} />
                      <InfoValue>{dept.tipo_display}</InfoValue>
                    </InfoItem>
                    <InfoItem>
                      <Maximize2 size={14} />
                      <InfoValue>{formatArea(dept.area_total)}</InfoValue>
                    </InfoItem>
                    <InfoItem>
                      <span>Nivel {dept.nivel_numero}</span>
                    </InfoItem>
                  </InfoGrid>

                  {dept.descripcion && (
                    <Descripcion>{dept.descripcion}</Descripcion>
                  )}

                  <PrecioRow>
                    <PrecioLabel>Precio desde</PrecioLabel>
                    <Precio>{formatPriceUSD(dept.precio)}</Precio>
                  </PrecioRow>
                </CardBody>

                {/* Actions */}
                <CardActions>
                  <SecondaryBtn
                    as={Link}
                    to={buildProjectDetailRoute(dept.proyecto?.slug)}
                  >
                    Ver proyecto
                  </SecondaryBtn>
                  <PrimaryBtn onClick={() => handleSeparar(dept)}>
                    Separar ahora
                    <ArrowRight size={16} />
                  </PrimaryBtn>
                </CardActions>
              </DeptoCard>
            ))}
          </DeptosGrid>
        )}
      </ContentWrapper>
    </>
  )
}

// --- Hero ---

const Hero = styled.section`
  position: relative;
  min-height: 55vh;
  background: linear-gradient(135deg, #0F233B 0%, #1a3a5c 50%, #0F233B 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => `${theme.spacing.section} ${theme.spacing.lg}`};
  padding-top: calc(80px + ${({ theme }) => theme.spacing.xxl});
  overflow: hidden;

  ${({ theme }) => theme.media.tablet} {
    padding: ${({ theme }) => `${theme.spacing.xxxl} ${theme.spacing.md}`};
    padding-top: calc(70px + ${({ theme }) => theme.spacing.xl});
    min-height: 50vh;
  }

  ${({ theme }) => theme.media.mobile} {
    padding-top: calc(64px + ${({ theme }) => theme.spacing.lg});
    min-height: auto;
  }
`

const HeroOverlay = styled.div`
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 30% 30%, rgba(214,179,112,0.08) 0%, transparent 60%),
    radial-gradient(ellipse at 70% 70%, rgba(214,179,112,0.05) 0%, transparent 60%);
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

const HeroBadges = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: center;
  flex-wrap: wrap;
  margin-top: ${({ theme }) => theme.spacing.xl};
`

const HeroBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  background: rgba(214,179,112,0.1);
  border: 1px solid rgba(214,179,112,0.35);
  color: ${({ theme }) => theme.colors.gold};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 600;
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.lg}`};
  border-radius: 999px;
  backdrop-filter: blur(8px);
`

// --- Content ---

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

const FiltersRow = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
`

const FilterLabel = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.eyebrow};
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 3px;
  color: ${({ theme }) => theme.colors.gold};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const FilterChips = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
`

const FilterChip = styled.button`
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.lg}`};
  background: ${({ $active, theme }) =>
    $active ? 'rgba(214,179,112,0.15)' : 'rgba(255,255,255,0.04)'};
  border: 1px solid ${({ $active, theme }) =>
    $active ? theme.colors.gold : theme.glass.border};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.gold : theme.colors.textSecondary};
  border-radius: 999px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 600;
  font-family: ${({ theme }) => theme.fonts.body};
  cursor: pointer;
  transition: all 0.25s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.gold};
    color: ${({ theme }) => theme.colors.gold};
  }
`

// --- Grid ---

const DeptosGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing.xl};

  ${({ theme }) => theme.media.desktop} {
    grid-template-columns: repeat(2, 1fr);
    gap: ${({ theme }) => theme.spacing.lg};
  }
  ${({ theme }) => theme.media.tablet} {
    grid-template-columns: 1fr;
    max-width: 480px;
    margin: 0 auto;
    gap: ${({ theme }) => theme.spacing.md};
  }
`

// --- Card ---

const DeptoCard = styled.div`
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.glass.card};
  border: 1px solid ${({ theme }) => theme.glass.border};
  border-radius: 16px;
  overflow: hidden;
  transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-6px);
    border-color: rgba(214,179,112,0.35);
    box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 24px rgba(214,179,112,0.12);
  }
`

const CardHero = styled.div`
  position: relative;
  height: 180px;
  background-color: ${({ theme }) => theme.colors.primary};
  background-image: ${({ $bgImage }) => ($bgImage ? `url(${$bgImage})` : 'none')};
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.md};

  ${({ theme }) => theme.media.mobile} {
    height: 160px;
  }
`

const CardHeroOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(8,19,31,0.45) 0%, rgba(8,19,31,0.88) 100%);
  z-index: 0;
`

const CardHeroTop = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`

const CardHeroBottom = styled.div`
  position: relative;
  z-index: 1;
`

const CardDeptCode = styled.span`
  background: rgba(0,0,0,0.5);
  border: 1px solid rgba(214,179,112,0.25);
  color: ${({ theme }) => theme.colors.gold};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 900;
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.md}`};
  border-radius: 8px;
  letter-spacing: 1px;
`

const CardProyectoNombre = styled.h3`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: 900;
  color: ${({ theme }) => theme.colors.white};
  margin: 0;
  letter-spacing: -0.5px;
`

const CardUbicacion = styled.p`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: rgba(255,255,255,0.7);
  margin: 4px 0 0;
  text-transform: uppercase;
  letter-spacing: 1px;
`

// --- Card body ---

const CardBody = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  flex: 1;

  ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => theme.spacing.md};
  }
`

const InfoGrid = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;
`

const InfoItem = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};

  svg {
    color: ${({ theme }) => theme.colors.gold};
    opacity: 0.8;
  }
`

const InfoValue = styled.span`
  color: rgba(255,255,255,0.85);
  font-weight: 500;
`

const Descripcion = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const PrecioRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.glass.border};
  margin-top: auto;
`

const PrecioLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  text-transform: uppercase;
  letter-spacing: 2px;
  color: ${({ theme }) => theme.colors.textMuted};
`

const Precio = styled.span`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: 900;
  background: ${({ theme }) => theme.gradients.goldText};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`

// --- Actions ---

const CardActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.lg};
  padding-top: 0;
  flex-wrap: wrap;

  ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => theme.spacing.md};
    padding-top: 0;
  }
`

const SecondaryBtn = styled.a`
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  background: rgba(255,255,255,0.04);
  border: 1px solid ${({ theme }) => theme.glass.border};
  color: rgba(255,255,255,0.85);
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: 600;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  border-radius: 10px;
  text-decoration: none;
  transition: all 0.25s ease;
  cursor: pointer;

  &:hover {
    border-color: rgba(214,179,112,0.4);
    color: ${({ theme }) => theme.colors.gold};
  }
`

const PrimaryBtn = styled.button`
  flex: 1.5;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.gradients.gold};
  color: ${({ theme }) => theme.colors.deepBg};
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: 700;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
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

export default SeparacionPage
