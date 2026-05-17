import { motion } from 'framer-motion'
import { useAppStore } from '../../store/appStore'

const BACKSPACE = '__BACKSPACE__'

const ROW1 = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P']
const ROW2 = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L']
const ROW3_MID = ['Z', 'X', 'C', 'V', 'B', 'N', 'M']

const KEY_NORMAL = { background: '#3a3a3c', color: '#ffffff', borderRadius: 5, fontSize: 16, boxShadow: '0 1px 0 rgba(0,0,0,0.4)' }
const KEY_SPECIAL = { ...KEY_NORMAL, background: '#636366', fontSize: 15 }

interface KeyProps {
  label: string
  action?: string
  style?: React.CSSProperties
  flex?: number | string
  width?: number
}

function Key({ label, action, style, flex, width }: KeyProps) {
  const setKeyboardInsert = useAppStore((s) => s.setKeyboardInsert)

  function handlePress() {
    const value = action ?? label.toLowerCase()
    setKeyboardInsert(value)
  }

  return (
    <motion.button
      onMouseDown={(e) => {
        e.preventDefault()
        handlePress()
      }}
      onTouchStart={(e) => {
        e.preventDefault()
        handlePress()
      }}
      whileTap={{ scale: 0.85, transition: { duration: 0.1 } }}
      className="flex items-center justify-center h-[42px] select-none"
      style={{
        ...KEY_NORMAL,
        ...style,
        flex: width ? undefined : (flex ?? 1),
        width: width,
        cursor: 'pointer',
        border: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
      aria-label={label}
    >
      {label}
    </motion.button>
  )
}

export function SimulatedKeyboard() {
  return (
    <motion.div
      className="absolute bottom-0 left-0 right-0"
      style={{ height: 220, background: '#1c1c1e', zIndex: 20 }}
      initial={{ y: 220 }}
      animate={{ y: 0, transition: { duration: 0.3, ease: 'easeOut' } }}
      exit={{ y: 220, transition: { duration: 0.25, ease: 'easeIn' } }}
    >
      {/* Suggestion bar */}
      <div
        className="flex items-center"
        style={{ height: 44, background: '#2c2c2e', borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}
      >
        {['I', 'The', "I'm"].map((suggestion, i) => (
          <div key={suggestion} className="flex items-center flex-1 justify-center h-full">
            <span style={{ fontSize: 16, color: '#ffffff' }}>{suggestion}</span>
            {i < 2 && (
              <div
                className="absolute"
                style={{ right: 0, top: '20%', height: '60%', width: '0.5px', background: 'rgba(255,255,255,0.2)' }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Key rows */}
      <div className="flex flex-col" style={{ padding: '8px 3px 4px', gap: 10 }}>
        {/* Row 1 */}
        <div className="flex gap-[6px]">
          {ROW1.map((k) => <Key key={k} label={k} />)}
        </div>

        {/* Row 2 — indented */}
        <div className="flex gap-[6px]" style={{ paddingLeft: 16, paddingRight: 16 }}>
          {ROW2.map((k) => <Key key={k} label={k} />)}
        </div>

        {/* Row 3 — shift + letters + backspace */}
        <div className="flex gap-[6px]">
          <Key label="⇧" style={KEY_SPECIAL} flex={1.5} />
          <div className="flex gap-[6px] flex-1">
            {ROW3_MID.map((k) => <Key key={k} label={k} />)}
          </div>
          <Key label="⌫" action={BACKSPACE} style={KEY_SPECIAL} flex={1.5} />
        </div>

        {/* Row 4 — number toggle, space, return */}
        <div className="flex gap-[6px]">
          <Key label="123" style={KEY_SPECIAL} width={47} />
          <Key label=" " action=" " style={{ ...KEY_NORMAL, fontSize: 14, color: '#636366' }} />
          <Key label="return" action="\n" style={{ ...KEY_SPECIAL, fontSize: 14 }} width={87} />
        </div>
      </div>
    </motion.div>
  )
}
