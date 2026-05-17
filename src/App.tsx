import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Settings } from 'lucide-react'
import { ContextualInput } from './components/ContextualInput'
import { HeroQuestion } from './components/HeroQuestion'
import { PlusMenu } from './components/PlusMenu'
import { useAppStore } from './store/appStore'

export default function App() {
  const [hasInputText, setHasInputText] = useState(false)
  const plusAreaRef = useRef<HTMLDivElement>(null)

  const { plusMenuOpen, togglePlusMenu, setPlusMenuOpen } = useAppStore((s) => ({
    plusMenuOpen: s.plusMenuOpen,
    togglePlusMenu: s.togglePlusMenu,
    setPlusMenuOpen: s.setPlusMenuOpen,
  }))

  // Close plus menu on click-outside the bottom area
  useEffect(() => {
    if (!plusMenuOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (plusAreaRef.current && !plusAreaRef.current.contains(e.target as Node)) {
        setPlusMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [plusMenuOpen, setPlusMenuOpen])

  return (
    <div
      style={{
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#080c18',
        position: 'relative',
      }}
    >
      {/* Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 20px 8px',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#0d1526',
              border: '1px solid rgba(59,130,246,0.25)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#3b82f6" strokeWidth="1.5" />
              <polygon points="12,4 14,12 12,10 10,12" fill="#3b82f6" opacity="0.9" />
              <polygon points="12,20 10,12 12,14 14,12" fill="#3b82f6" opacity="0.4" />
              <circle cx="12" cy="12" r="1.5" fill="#3b82f6" />
            </svg>
          </div>
          <h1
            style={{
              fontSize: 15,
              fontWeight: 500,
              color: '#f1f5f9',
              margin: 0,
              lineHeight: 1,
            }}
          >
            SOS 360
          </h1>
        </div>

        <button
          aria-label="Configuración"
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.04)',
            border: 'none',
            cursor: 'pointer',
            color: '#475569',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#94a3b8' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#475569' }}
        >
          <Settings size={17} />
        </button>
      </header>

      {/* Main — hero text centered in remaining space above the bar */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 24px 90px',
        }}
      >
        <HeroQuestion hasText={hasInputText} />
      </main>

      {/* Bottom bar — absolutely pinned to frame bottom */}
      <div
        ref={plusAreaRef}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '12px 16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

          {/* Plus button + floating menu */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <AnimatePresence>
              {plusMenuOpen && <PlusMenu />}
            </AnimatePresence>

            <motion.button
              onClick={togglePlusMenu}
              aria-label="Más opciones"
              aria-expanded={plusMenuOpen}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.1 }}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: plusMenuOpen ? '#1e2a40' : '#1c2333',
                border: '0.5px solid rgba(255,255,255,0.08)',
                color: plusMenuOpen ? '#3b82f6' : '#94a3b8',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <motion.div
                animate={{ rotate: plusMenuOpen ? 45 : 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
              >
                <Plus size={17} />
              </motion.div>
            </motion.button>
          </div>

          {/* Input bar */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <ContextualInput onHasTextChange={setHasInputText} />
          </div>

        </div>
      </div>
    </div>
  )
}
