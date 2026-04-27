import { motion } from 'framer-motion'
import styled from 'styled-components'
import { wordReveal, staggerContainer } from '@/shared/utils/animations'

/**
 * AnimatedText — Divide un texto en palabras y las anima con entrada escalonada.
 *
 * Props:
 * - text: string — El texto a animar
 * - as: string — Elemento HTML ('h1', 'h2', 'h3', 'p'). Default 'h2'
 * - className: string — Para styled-components override
 * - once: boolean — Solo animar una vez. Default true
 */
const AnimatedText = ({ text, as = 'h2', className, once = true }) => {
  const words = text.split(' ')

  return (
    <Wrapper
      as={motion.div}
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-50px' }}
      className={className}
      role="heading"
      aria-label={text}
    >
      {words.map((word, i) => (
        <WordWrapper key={`${word}-${i}`}>
          <motion.span
            variants={wordReveal}
            custom={i}
            style={{ display: 'inline-block' }}
            aria-hidden="true"
          >
            {word}
          </motion.span>
          {i < words.length - 1 && <span aria-hidden="true">&nbsp;</span>}
        </WordWrapper>
      ))}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0;
`

const WordWrapper = styled.span`
  overflow: hidden;
  display: inline-flex;
`

export default AnimatedText
