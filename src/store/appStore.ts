import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UIMode, RiskLevel } from '../types/domain'

interface AppState {
  uiMode: UIMode
  riskLevel: RiskLevel
  isOffline: boolean
  isOfflineBannerVisible: boolean
  plusMenuOpen: boolean
  keyboardVisible: boolean
  cameraModalOpen: boolean
  keyboardInsert: string | null
  prefillInput: string | null

  setUIMode: (mode: UIMode) => void
  setRiskLevel: (level: RiskLevel) => void
  setOffline: (offline: boolean) => void
  dismissOfflineBanner: () => void
  setPlusMenuOpen: (open: boolean) => void
  togglePlusMenu: () => void
  setKeyboardVisible: (visible: boolean) => void
  setCameraModalOpen: (open: boolean) => void
  setKeyboardInsert: (char: string | null) => void
  setPrefillInput: (text: string | null) => void
  reset: () => void
}

const initialState = {
  uiMode: 'idle' as UIMode,
  riskLevel: 'low' as RiskLevel,
  isOffline: false,
  isOfflineBannerVisible: false,
  plusMenuOpen: false,
  keyboardVisible: false,
  cameraModalOpen: false,
  keyboardInsert: null,
  prefillInput: null,
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,

      setUIMode: (mode) => set({ uiMode: mode }),
      setRiskLevel: (level) => set({ riskLevel: level }),
      setOffline: (offline) =>
        set({ isOffline: offline, isOfflineBannerVisible: offline }),
      dismissOfflineBanner: () => set({ isOfflineBannerVisible: false }),
      setPlusMenuOpen: (open) => set({ plusMenuOpen: open }),
      togglePlusMenu: () => set((state) => ({ plusMenuOpen: !state.plusMenuOpen })),
      setKeyboardVisible: (visible) => set({ keyboardVisible: visible }),
      setCameraModalOpen: (open) => set({ cameraModalOpen: open }),
      setKeyboardInsert: (char) => set({ keyboardInsert: char }),
      setPrefillInput: (text) => set({ prefillInput: text }),
      reset: () => set(initialState),
    }),
    {
      name: 'sos360-store',
      partialize: () => ({}),
    }
  )
)
