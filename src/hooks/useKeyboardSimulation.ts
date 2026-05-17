import { useAppStore } from '../store/appStore'

export function useKeyboardSimulation() {
  const keyboardVisible = useAppStore((s) => s.keyboardVisible)
  const setKeyboardVisible = useAppStore((s) => s.setKeyboardVisible)
  return { keyboardVisible, setKeyboardVisible }
}
