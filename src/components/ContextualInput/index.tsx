import { useRef, useEffect, useState, KeyboardEvent } from 'react'
import { Mic, Send } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAppStore } from '../../store/appStore'

interface ContextualInputProps {
  onHasTextChange?: (hasText: boolean) => void
}

export function ContextualInput({ onHasTextChange }: ContextualInputProps) {
  const [text, setText] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { setKeyboardVisible, keyboardInsert, setKeyboardInsert, prefillInput, setPrefillInput } =
    useAppStore((s) => ({
      setKeyboardVisible: s.setKeyboardVisible,
      keyboardInsert: s.keyboardInsert,
      setKeyboardInsert: s.setKeyboardInsert,
      prefillInput: s.prefillInput,
      setPrefillInput: s.setPrefillInput,
    }))

  // Auto-focus
  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 100)}px`
  }, [text])

  // Consume keyboard inserts from SimulatedKeyboard
  useEffect(() => {
    if (keyboardInsert === null) return
    setText((prev) => {
      const next =
        keyboardInsert === '__BACKSPACE__' ? prev.slice(0, -1) : prev + keyboardInsert
      onHasTextChange?.(next.trim() !== '')
      return next
    })
    setKeyboardInsert(null)
  }, [keyboardInsert, setKeyboardInsert, onHasTextChange])

  // Consume prefill from CameraModal
  useEffect(() => {
    if (prefillInput === null) return
    setText(prefillInput)
    onHasTextChange?.(prefillInput.trim() !== '')
    setPrefillInput(null)
    textareaRef.current?.focus()
  }, [prefillInput, setPrefillInput, onHasTextChange])

  function handleTextChange(val: string) {
    setText(val)
    onHasTextChange?.(val.trim() !== '')
  }

  function handleSubmit() {
    const trimmed = text.trim()
    if (!trimmed) return
    setText('')
    onHasTextChange?.(false)
    // Navigation to content pages will be implemented here
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const hasSpeech =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  return (
    <motion.div
      animate={{
        borderColor: isFocused
          ? 'rgba(59,130,246,0.4)'
          : 'rgba(255,255,255,0.08)',
      }}
      transition={{ duration: 0.15 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '0 14px',
        minHeight: 50,
        background: '#111827',
        border: '0.5px solid rgba(255,255,255,0.08)',
        borderRadius: 26,
      }}
    >
      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => handleTextChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          setIsFocused(true)
          setKeyboardVisible(true)
        }}
        onBlur={() => {
          setIsFocused(false)
          setKeyboardVisible(false)
        }}
        placeholder="Describe lo que estás viendo..."
        rows={1}
        aria-label="Describe tu situación"
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          resize: 'none',
          fontSize: 14,
          lineHeight: '1.5',
          color: '#f1f5f9',
          caretColor: '#3b82f6',
          minHeight: 24,
          maxHeight: 100,
          overflowY: 'auto',
          padding: '13px 0',
          fontFamily: 'inherit',
        }}
      />

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        {hasSpeech && (
          <button
            aria-label="Hablar"
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(59,130,246,0.08)',
              border: 'none',
              cursor: 'pointer',
              color: '#3b82f6',
            }}
          >
            <Mic size={16} />
          </button>
        )}

        <button
          onClick={handleSubmit}
          disabled={!text.trim()}
          aria-label="Enviar"
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: text.trim() ? '#2563eb' : 'rgba(255,255,255,0.06)',
            border: 'none',
            cursor: text.trim() ? 'pointer' : 'default',
            color: text.trim() ? '#ffffff' : '#475569',
            transition: 'background 150ms, color 150ms',
          }}
        >
          <Send size={15} />
        </button>
      </div>
    </motion.div>
  )
}
