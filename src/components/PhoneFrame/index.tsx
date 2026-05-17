import type { ReactNode } from 'react'
import { Signal, Wifi, BatteryFull } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../../store/appStore'
import { SimulatedKeyboard } from '../SimulatedKeyboard'
import { CameraModal } from '../CameraModal'

interface PhoneFrameProps {
  children: ReactNode
}

export function PhoneFrame({ children }: PhoneFrameProps) {
  const keyboardVisible = useAppStore((s) => s.keyboardVisible)

  return (
    <div
      style={{
        background: '#0a0a0a',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      {/* Outer frame shell */}
      <div
        style={{
          width: 390,
          height: 844,
          borderRadius: 48,
          border: '2px solid #2a2a2a',
          background: '#111111',
          boxShadow: [
            'inset 0 0 0 1.5px #1a1a1a',
            '0 40px 100px rgba(0,0,0,0.95)',
            '0 16px 40px rgba(0,0,0,0.7)',
            '0 4px 12px rgba(0,0,0,0.5)',
            '0 0 0 0.5px rgba(255,255,255,0.03)',
          ].join(', '),
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}
      >
        {/* Dynamic Island */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 120,
            height: 34,
            borderRadius: 20,
            background: '#000000',
            zIndex: 60,
          }}
        />

        {/* Status bar */}
        <div
          style={{
            height: 44,
            paddingLeft: 28,
            paddingRight: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            position: 'relative',
            zIndex: 50,
          }}
        >
          <span
            style={{
              color: '#ffffff',
              fontWeight: 500,
              fontSize: 15,
              fontFamily: "'Inter', system-ui, sans-serif",
              letterSpacing: '-0.01em',
            }}
          >
            9:41
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Signal size={14} color="#ffffff" strokeWidth={2} />
            <Wifi size={14} color="#ffffff" strokeWidth={2} />
            <BatteryFull size={16} color="#ffffff" strokeWidth={2} />
          </div>
        </div>

        {/* Content wrapper — keyboard lives here as a sibling to the scrollable content */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {/* App content — slides up when keyboard visible */}
          <motion.div
            className="phone-frame-content"
            animate={{ y: keyboardVisible ? -220 : 0 }}
            transition={{ duration: keyboardVisible ? 0.3 : 0.25, ease: keyboardVisible ? 'easeOut' : 'easeIn' }}
          >
            {children}
          </motion.div>

          {/* Simulated keyboard — slides up from bottom */}
          <AnimatePresence>
            {keyboardVisible && <SimulatedKeyboard />}
          </AnimatePresence>

          {/* Camera modal — full overlay, unaffected by keyboard translation */}
          <CameraModal />
        </div>

        {/* Home indicator */}
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 134,
            height: 5,
            borderRadius: 3,
            background: '#ffffff',
            opacity: 0.3,
            zIndex: 50,
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  )
}
