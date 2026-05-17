import { motion, AnimatePresence } from 'framer-motion'
import { Camera, FileText, AlertTriangle } from 'lucide-react'
import { useAppStore } from '../../store/appStore'

interface MenuItem {
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  title: string
  subtitle: string
  titleColor: string
  isLast: boolean
  onClick: () => void
}

export function PlusMenu() {
  const { plusMenuOpen, setPlusMenuOpen, setUIMode, setRiskLevel, setCameraModalOpen } =
    useAppStore((s) => ({
      plusMenuOpen: s.plusMenuOpen,
      setPlusMenuOpen: s.setPlusMenuOpen,
      setUIMode: s.setUIMode,
      setRiskLevel: s.setRiskLevel,
      setCameraModalOpen: s.setCameraModalOpen,
    }))

  if (!plusMenuOpen) return null

  const items: MenuItem[] = [
    {
      icon: <Camera size={18} />,
      iconBg: '#1a2540',
      iconColor: '#3b82f6',
      title: 'Tomar foto rápida',
      subtitle: 'Analiza lo que tienes frente a ti',
      titleColor: '#f1f5f9',
      isLast: false,
      onClick: () => {
        setCameraModalOpen(true)
        setPlusMenuOpen(false)
      },
    },
    {
      icon: <FileText size={18} />,
      iconBg: '#1a2540',
      iconColor: '#3b82f6',
      title: 'Subir documento',
      subtitle: 'PDF, imagen o archivo de texto',
      titleColor: '#f1f5f9',
      isLast: false,
      onClick: () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/*,application/pdf,.txt'
        input.click()
        setPlusMenuOpen(false)
      },
    },
    {
      icon: <AlertTriangle size={18} />,
      iconBg: '#2a1400',
      iconColor: '#f97316',
      title: 'Es una emergencia',
      subtitle: 'Activar modo urgencia SOS',
      titleColor: '#f97316',
      isLast: true,
      onClick: () => {
        setRiskLevel('high')
        setUIMode('idle')
        setPlusMenuOpen(false)
      },
    },
  ]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } }}
        exit={{ opacity: 0, y: 20, transition: { duration: 0.2, ease: 'easeIn' } }}
        className="absolute bottom-full left-0 right-0 z-40"
        style={{
          marginBottom: 8,
          background: '#0d1526',
          backdropFilter: 'blur(20px)',
          border: '0.5px solid rgba(255,255,255,0.08)',
          borderRadius: 20,
          padding: 8,
        }}
      >
        {items.map((item) => (
          <div key={item.title}>
            <motion.button
              onClick={item.onClick}
              className="flex items-center gap-3 w-full text-left"
              style={{ padding: '10px 12px', borderRadius: 12, background: 'transparent', border: 'none', cursor: 'pointer' }}
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15 }}
            >
              <div
                className="shrink-0 flex items-center justify-center"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: item.iconBg,
                  border: '0.5px solid rgba(255,255,255,0.1)',
                  color: item.iconColor,
                }}
              >
                {item.icon}
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, color: item.titleColor, margin: 0 }}>
                  {item.title}
                </p>
                <p style={{ fontSize: 12, color: '#475569', margin: 0, marginTop: 2 }}>
                  {item.subtitle}
                </p>
              </div>
            </motion.button>
            {!item.isLast && (
              <div style={{ height: '0.5px', background: 'rgba(255,255,255,0.06)', margin: '0 12px' }} />
            )}
          </div>
        ))}
      </motion.div>
    </AnimatePresence>
  )
}
