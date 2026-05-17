import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UIMode, RiskLevel, AppView, CardSeverity } from '../types/domain';
import { HISTORY_DEFAULT } from '../lib/cards';

interface AppState {
  uiMode: UIMode;
  riskLevel: RiskLevel;
  isOffline: boolean;
  isOfflineBannerVisible: boolean;

  view: AppView;
  activeCardId: string | null;
  alertMode: boolean;
  historyIds: string[];
  historyOpen: boolean;
  query: string;

  triageIdx: number;
  triagePicks: string[];

  plusMenuOpen: boolean;
  keyboardVisible: boolean;
  cameraModalOpen: boolean;
  keyboardInsert: string | null;
  prefillInput: string | null;
  ollamaOk: boolean;
  flaskOk: boolean;
  capturedPhotoUrls: string[];

  setUIMode: (mode: UIMode) => void;
  setRiskLevel: (level: RiskLevel) => void;
  setOffline: (offline: boolean) => void;
  dismissOfflineBanner: () => void;

  setView: (v: AppView) => void;
  openCard: (id: string, severity: CardSeverity) => void;
  openCategories: () => void;
  backToFeed: () => void;
  setAlertMode: (on: boolean) => void;
  setHistoryOpen: (open: boolean) => void;
  toggleHistoryOpen: () => void;
  setQuery: (q: string) => void;

  pickTriage: (answer: string, totalQuestions: number) => void;
  resetTriage: () => void;

  setPlusMenuOpen: (open: boolean) => void;
  togglePlusMenu: () => void;
  setKeyboardVisible: (visible: boolean) => void;
  setCameraModalOpen: (open: boolean) => void;
  setKeyboardInsert: (char: string | null) => void;
  setPrefillInput: (text: string | null) => void;
  setServiceStatus: (ollama: boolean, flask: boolean) => void;
  addCapturedPhotos: (urls: string[]) => void;
  removeCapturedPhoto: (index: number) => void;
  clearCapturedPhotos: () => void;
  reset: () => void;
}

const initialState = {
  uiMode: 'idle' as UIMode,
  riskLevel: 'low' as RiskLevel,
  isOffline: false,
  isOfflineBannerVisible: false,

  view: 'feed' as AppView,
  activeCardId: null as string | null,
  alertMode: false,
  historyIds: HISTORY_DEFAULT,
  historyOpen: false,
  query: '',

  triageIdx: 0,
  triagePicks: [] as string[],

  plusMenuOpen: false,
  keyboardVisible: false,
  cameraModalOpen: false,
  keyboardInsert: null as string | null,
  prefillInput: null as string | null,
  ollamaOk: false,
  flaskOk: false,
  capturedPhotoUrls: [] as string[],
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,

      setUIMode: (mode) => set({ uiMode: mode }),
      setRiskLevel: (level) => set({ riskLevel: level }),
      setOffline: (offline) => set({ isOffline: offline, isOfflineBannerVisible: offline }),
      dismissOfflineBanner: () => set({ isOfflineBannerVisible: false }),

      setView: (v) => set({ view: v }),
      openCard: (id, severity) =>
        set((state) => ({
          activeCardId: id,
          view: 'detail',
          triageIdx: 0,
          triagePicks: [],
          historyOpen: false,
          plusMenuOpen: false,
          alertMode: severity === 'critical' ? true : state.alertMode,
          historyIds: [id, ...state.historyIds.filter((h) => h !== id)].slice(0, 5),
        })),
      openCategories: () => set({ view: 'categories', historyOpen: false, plusMenuOpen: false }),
      backToFeed: () => set({ view: 'feed', activeCardId: null }),
      setAlertMode: (on) => set({ alertMode: on }),
      setHistoryOpen: (open) => set({ historyOpen: open }),
      toggleHistoryOpen: () => set((state) => ({ historyOpen: !state.historyOpen })),
      setQuery: (q) => set({ query: q }),

      pickTriage: (answer, totalQuestions) =>
        set((state) => {
          const nextPicks = [...state.triagePicks, answer];
          const nextIdx = state.triageIdx + 1;
          return {
            triagePicks: nextPicks,
            triageIdx: nextIdx >= totalQuestions ? totalQuestions : nextIdx,
          };
        }),
      resetTriage: () => set({ triageIdx: 0, triagePicks: [] }),

      setPlusMenuOpen: (open) => set({ plusMenuOpen: open }),
      togglePlusMenu: () => set((state) => ({ plusMenuOpen: !state.plusMenuOpen })),
      setKeyboardVisible: (visible) => set({ keyboardVisible: visible }),
      setCameraModalOpen: (open) => set({ cameraModalOpen: open }),
      setKeyboardInsert: (char) => set({ keyboardInsert: char }),
      setPrefillInput: (text) => set({ prefillInput: text }),
      setServiceStatus: (ollama, flask) => set({ ollamaOk: ollama, flaskOk: flask }),
      addCapturedPhotos: (urls) =>
        set((state) => ({ capturedPhotoUrls: [...state.capturedPhotoUrls, ...urls] })),
      removeCapturedPhoto: (index) =>
        set((state) => ({ capturedPhotoUrls: state.capturedPhotoUrls.filter((_, i) => i !== index) })),
      clearCapturedPhotos: () => set({ capturedPhotoUrls: [] }),
      reset: () => set(initialState),
    }),
    {
      name: 'sos360-store',
      partialize: () => ({}),
    }
  )
);
