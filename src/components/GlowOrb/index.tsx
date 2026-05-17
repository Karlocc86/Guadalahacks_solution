import { motion, useAnimationControls } from 'framer-motion'
import { useEffect } from 'react'
import { useAppStore } from '../../store/appStore'
import type { RiskLevel } from '../../types/domain'

type GlowKey = RiskLevel | 'offline' | 'loading'

const glowConfig: Record<GlowKey, {
  inner: string
  glow: string
  opacity: number
  pulseDuration: number
}> = {
  low: { inner: '#1e3a5f', glow: '#3b82f6', opacity: 0.2, pulseDuration: 3 },
  medium: { inner: '#3d2b00', glow: '#fbbf24', opacity: 0.25, pulseDuration: 2 },
  high: { inner: '#3d1200', glow: '#f97316', opacity: 0.35, pulseDuration: 0.8 },
  offline: { inner: '#1a2035', glow: '#60a5fa', opacity: 0.15, pulseDuration: 4 },
  loading: { inner: '#0f172a', glow: '#3b82f6', opacity: 0.10, pulseDuration: 1.5 },
}

export function GlowOrb() {
  const { riskLevel, uiMode, isOffline } = useAppStore((s) => ({
    riskLevel: s.riskLevel,
    uiMode: s.uiMode,
    isOffline: s.isOffline,
  }))
  const controls = useAnimationControls()

  const configKey: GlowKey = isOffline
    ? 'offline'
    : uiMode === 'processing'
    ? 'loading'
    : riskLevel

  const config = glowConfig[configKey]

  useEffect(() => {
    controls.start({
      scale: [1, 1.06, 1],
      transition: {
        duration: config.pulseDuration,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    })
  }, [configKey, controls, config.pulseDuration])

  const opacityHex = Math.round(config.opacity * 255)
    .toString(16)
    .padStart(2, '0')

  return (
    <div
      className="relative flex items-center justify-center"
      role="presentation"
      aria-hidden="true"
    >
      {/* Aura exterior */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: config.glow,
          filter: 'blur(60px)',
        }}
        animate={{
          opacity: [config.opacity, config.opacity * 1.5, config.opacity],
        }}
        transition={{
          duration: config.pulseDuration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Orbe principal */}
      <motion.div
        animate={controls}
        className="relative rounded-full border"
        style={{
          width: 'clamp(180px, 22vw, 280px)',
          height: 'clamp(180px, 22vw, 280px)',
          backgroundColor: config.inner,
          borderColor: `${config.glow}30`,
          boxShadow: `0 0 40px ${config.glow}${opacityHex}`,
          transition: 'background-color 0.4s ease, box-shadow 0.4s ease',
        }}
      >
        {/* Highlight interior */}
        <div
          className="absolute top-[15%] left-[20%] rounded-full"
          style={{
            width: '30%',
            height: '20%',
            background: `radial-gradient(circle, ${config.glow}20 0%, transparent 70%)`,
          }}
        />

        {/* Ícono central — brújula / SOS */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            style={{ color: config.glow, opacity: 0.7 }}
          >
            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="1.5" />
            <polygon
              points="24,8 28,24 24,20 20,24"
              fill="currentColor"
              opacity="0.9"
            />
            <polygon
              points="24,40 20,24 24,28 28,24"
              fill="currentColor"
              opacity="0.4"
            />
            <circle cx="24" cy="24" r="2.5" fill="currentColor" />
          </svg>
        </div>
      </motion.div>
    </div>
  )
}
