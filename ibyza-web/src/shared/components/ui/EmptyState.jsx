import styled from 'styled-components'
import { motion } from 'framer-motion'
import { Package } from 'lucide-react'

/**
 * EmptyState — Componente reutilizable para listados vacios.
 * Props:
 * - icon: Lucide icon component (default: Package)
 * - title: string
 * - description: string (opcional)
 */
const EmptyState = ({ icon: Icon = Package, title, description }) => (
  <Wrapper
    as={motion.div}
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
  >
    <IconCircle>
      <Icon size={28} />
    </IconCircle>
    <Title>{title}</Title>
    {description && <Description>{description}</Description>}
  </Wrapper>
)

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xxl};
  text-align: center;
  min-height: 200px;
`

const IconCircle = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(214,179,112,0.08);
  border: 1px solid rgba(214,179,112,0.2);
  color: ${({ theme }) => theme.colors.gold};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const Title = styled.h3`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const Description = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 300;
  color: ${({ theme }) => theme.colors.textMuted};
  max-width: 400px;
  line-height: 1.7;
`

export { EmptyState }
export default EmptyState
