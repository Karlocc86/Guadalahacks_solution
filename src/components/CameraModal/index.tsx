import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useAppStore } from '../../store/appStore'

export function CameraModal() {
  const { cameraModalOpen, setCameraModalOpen, setPrefillInput } = useAppStore((s) => ({
    cameraModalOpen: s.cameraModalOpen,
    setCameraModalOpen: s.setCameraModalOpen,
    setPrefillInput: s.setPrefillInput,
  }))

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [hasStream, setHasStream] = useState(false)
  const [flashActive, setFlashActive] = useState(false)

  useEffect(() => {
    if (!cameraModalOpen) {
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
      setHasStream(false)
      setFlashActive(false)
      return
    }

    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: 'environment' } })
      .then((stream) => {
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream
        setHasStream(true)
      })
      .catch(() => setHasStream(false))
  }, [cameraModalOpen])

  function handleCapture() {
    setFlashActive(true)
  }

  function handleFlashComplete() {
    setFlashActive(false)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setHasStream(false)
    setCameraModalOpen(false)
    setPrefillInput('📷 Imagen capturada — analizando...')
  }

  const cornerConfigs = [
    { top: 8, left: 8, rotate: 0 },
    { top: 8, right: 8, rotate: 90 },
    { bottom: 8, right: 8, rotate: 180 },
    { bottom: 8, left: 8, rotate: 270 },
  ] as const

  return (
    <AnimatePresence>
      {cameraModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 z-[30]"
            style={{ background: 'rgba(0,0,0,0.85)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setCameraModalOpen(false)}
          />

          {/* Bottom sheet */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 z-[40] flex flex-col"
            style={{ height: '75%', background: '#080c18', borderRadius: '24px 24px 0 0' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div style={{ width: 40, height: 4, borderRadius: 2, background: '#1e2a40' }} />
            </div>

            {/* Header row */}
            <div className="flex items-center px-5 py-3">
              <button
                onClick={() => setCameraModalOpen(false)}
                style={{ fontSize: 14, color: '#475569', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Cancelar
              </button>
              <p className="flex-1 text-center font-medium" style={{ fontSize: 16, color: '#f1f5f9', margin: 0 }}>
                Tomar foto
              </p>
              <div style={{ width: 56 }} />
            </div>

            {/* Viewfinder */}
            <div className="flex justify-center flex-1 items-start px-4 pt-2">
              <div
                className="relative overflow-hidden"
                style={{
                  width: '85%',
                  aspectRatio: '4/3',
                  borderRadius: 16,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: '#0a0f1e',
                }}
              >
                {hasStream ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    {/* Rule-of-thirds grid */}
                    <svg className="absolute inset-0 w-full h-full">
                      <line x1="33.33%" y1="0" x2="33.33%" y2="100%" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                      <line x1="66.66%" y1="0" x2="66.66%" y2="100%" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                      <line x1="0" y1="33.33%" x2="100%" y2="33.33%" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                      <line x1="0" y1="66.66%" x2="100%" y2="66.66%" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p style={{ fontSize: 13, color: '#475569', textAlign: 'center' }}>
                        Apunta hacia la situación
                      </p>
                    </div>
                  </>
                )}

                {/* L-shaped corner markers */}
                {cornerConfigs.map((pos, i) => (
                  <div
                    key={i}
                    className="absolute"
                    style={{
                      width: 20,
                      height: 20,
                      top: 'top' in pos ? pos.top : undefined,
                      bottom: 'bottom' in pos ? pos.bottom : undefined,
                      left: 'left' in pos ? pos.left : undefined,
                      right: 'right' in pos ? pos.right : undefined,
                      transform: `rotate(${pos.rotate}deg)`,
                    }}
                  >
                    <div style={{ position: 'absolute', top: 0, left: 0, width: 20, height: 2, background: '#3b82f6', borderRadius: 1 }} />
                    <div style={{ position: 'absolute', top: 0, left: 0, width: 2, height: 20, background: '#3b82f6', borderRadius: 1 }} />
                  </div>
                ))}

                {/* Flash overlay */}
                {flashActive && (
                  <motion.div
                    className="absolute inset-0 z-10"
                    style={{ background: 'white' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.9, 0] }}
                    transition={{ duration: 0.4 }}
                    onAnimationComplete={handleFlashComplete}
                  />
                )}
              </div>
            </div>

            {/* Capture button */}
            <div className="flex justify-center py-6">
              <motion.button
                onClick={handleCapture}
                whileTap={{ scale: 0.92 }}
                aria-label="Capturar foto"
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: '50%',
                  border: '3px solid white',
                  background: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'white' }} />
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
