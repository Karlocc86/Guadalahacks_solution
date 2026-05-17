import { useState, useEffect, useRef } from 'react'
import { motion, useAnimationControls, AnimatePresence } from 'framer-motion'

interface HeroQuestionProps {
  hasText: boolean
}

const LINE1 = ['¿Qué', 'está']
const LINE2 = 'ocurriendo?'

const wordEase: [number, number, number, number] = [0.25, 0.1, 0.25, 1]

export function HeroQuestion({ hasText }: HeroQuestionProps) {
  const controls = useAnimationControls()
  const [showCursor, setShowCursor] = useState(false)
  const phaseRef = useRef<'entering' | 'cursor' | 'idle'>('entering')
  const hasTextRef = useRef(hasText)

  useEffect(() => {
    hasTextRef.current = hasText
  }, [hasText])

  function startBreathing() {
    void controls.start({
      opacity: [1, 0.85, 1],
      y: 0,
      transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
    })
  }

  // React to hasText changes — hide/show the block
  useEffect(() => {
    if (hasText) {
      void controls.stop()
      void controls.start({
        opacity: 0,
        y: -8,
        transition: { duration: 0.3, ease: 'easeOut' },
      })
    } else {
      void controls.stop()
      void controls.start({
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: 'easeOut' },
      }).then(() => {
        if (phaseRef.current === 'idle' && !hasTextRef.current) {
          startBreathing()
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasText])

  function handleLastWordComplete() {
    setShowCursor(true)
    phaseRef.current = 'cursor'
  }

  function handleCursorComplete() {
    setShowCursor(false)
    phaseRef.current = 'idle'
    if (!hasTextRef.current) startBreathing()
  }

  return (
    <motion.div
      animate={controls}
      style={{ textAlign: 'center', userSelect: 'none' }}
    >
      {/* "¿Qué está" */}
      <div style={{ lineHeight: 1.2, letterSpacing: '-0.04em' }}>
        {LINE1.map((word, i) => (
          <motion.span
            key={word}
            initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.6, ease: wordEase, delay: 0.3 + i * 0.08 }}
            style={{
              display: 'inline-block',
              marginRight: '0.28em',
              fontSize: 38,
              fontWeight: 200,
              color: '#94a3b8',
            }}
          >
            {word}
          </motion.span>
        ))}
      </div>

      {/* "ocurriendo?" + cursor */}
      <div
        style={{
          lineHeight: 1.2,
          letterSpacing: '-0.04em',
          display: 'inline-flex',
          alignItems: 'center',
        }}
      >
        <motion.span
          initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.6, ease: wordEase, delay: 0.3 + 2 * 0.08 }}
          onAnimationComplete={handleLastWordComplete}
          style={{
            display: 'inline-block',
            fontSize: 38,
            fontWeight: 300,
            color: '#f1f5f9',
          }}
        >
          {LINE2}
        </motion.span>

        <AnimatePresence>
          {showCursor && (
            <motion.span
              initial={{ opacity: 1 }}
              animate={{ opacity: [1, 0, 1, 0, 1, 0] }}
              transition={{ duration: 1.8, times: [0, 0.167, 0.333, 0.5, 0.667, 1] }}
              exit={{ opacity: 0, transition: { duration: 0.3 } }}
              onAnimationComplete={handleCursorComplete}
              style={{
                display: 'inline-block',
                width: 2,
                height: 32,
                background: '#3b82f6',
                borderRadius: 1,
                marginLeft: 4,
                verticalAlign: 'middle',
                flexShrink: 0,
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
