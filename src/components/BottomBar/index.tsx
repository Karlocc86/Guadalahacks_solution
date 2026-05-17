import { useEffect, useRef, useState } from 'react';
import { Plus, Mic, ArrowUp, ImagePlus, Camera, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@store/appStore';
import { useIntentSearch } from '@hooks/useIntentSearch';

export function BottomBar() {
  const {
    alertMode,
    query,
    setQuery,
    setAlertMode,
    plusMenuOpen,
    togglePlusMenu,
    setPlusMenuOpen,
    setHistoryOpen,
    setCameraModalOpen,
    capturedPhotoUrls,
    removeCapturedPhoto,
    clearCapturedPhotos,
  } = useAppStore((s) => ({
    alertMode: s.alertMode,
    query: s.query,
    setQuery: s.setQuery,
    setAlertMode: s.setAlertMode,
    plusMenuOpen: s.plusMenuOpen,
    togglePlusMenu: s.togglePlusMenu,
    setPlusMenuOpen: s.setPlusMenuOpen,
    setHistoryOpen: s.setHistoryOpen,
    setCameraModalOpen: s.setCameraModalOpen,
    capturedPhotoUrls: s.capturedPhotoUrls,
    removeCapturedPhoto: s.removeCapturedPhoto,
    clearCapturedPhotos: s.clearCapturedPhotos,
  }));

  const { processInput } = useIntentSearch();
  const [isProcessing, setIsProcessing] = useState(false);
  const plusRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!plusMenuOpen) return;
    function handler(e: MouseEvent) {
      if (plusRef.current && !plusRef.current.contains(e.target as Node)) {
        setPlusMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [plusMenuOpen, setPlusMenuOpen]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [query]);

  function handleQueryChange(v: string) {
    setQuery(v);
    const k = v.toLowerCase();
    if (/desmay|paro|ahog|incons|no respira|emergen/.test(k)) {
      setAlertMode(true);
    }
  }

  async function handleSubmit() {
    const q = query.trim();
    if ((!q && capturedPhotoUrls.length === 0) || isProcessing) return;
    setIsProcessing(true);
    try {
      if (q) await processInput(q, 'text');
      setQuery('');
      clearCapturedPhotos();
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    } finally {
      setIsProcessing(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit();
    }
  }

  const hasContent = query.trim().length > 0 || capturedPhotoUrls.length > 0;
  const sendDisabled = isProcessing || !hasContent;

  const barStyle = alertMode
    ? 'border-red-200 bg-red-50'
    : 'border-gray-200 bg-white';

  const voiceStyle = alertMode
    ? 'bg-red-100 text-red-400 hover:bg-red-200'
    : 'bg-gray-100 text-slate-400 hover:bg-gray-200';

  const sendBase = alertMode
    ? 'bg-red-500 text-white hover:bg-red-600'
    : 'bg-slate-900 text-white hover:bg-slate-700';

  return (
    <div className="relative z-20 px-3 pb-3 pt-2 shrink-0">
      <div className={`relative flex flex-col rounded-2xl border ${barStyle} transition-colors`}>

        {/* Photo thumbnails */}
        {capturedPhotoUrls.length > 0 && (
          <div className="flex gap-2 px-3 pt-2.5 pb-1 overflow-x-auto">
            {capturedPhotoUrls.map((url, i) => (
              <div key={i} className="relative shrink-0">
                <img
                  src={url}
                  alt=""
                  className="w-14 h-14 rounded-xl object-cover"
                  style={{ border: '1px solid rgba(0,0,0,0.08)' }}
                />
                <button
                  onClick={() => removeCapturedPhoto(i)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm"
                >
                  <X size={10} className="text-slate-500" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input row */}
        <div className="flex items-end gap-2 px-2 py-2">
          {/* Plus button + popover */}
          <div className="relative shrink-0" ref={plusRef}>
            <button
              onClick={() => {
                togglePlusMenu();
                setHistoryOpen(false);
              }}
              className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all ${
                plusMenuOpen
                  ? 'bg-slate-900 text-white'
                  : alertMode
                  ? 'bg-red-100 text-red-500 hover:bg-red-200'
                  : 'bg-gray-100 text-slate-500 hover:bg-gray-200'
              }`}
            >
              <motion.div
                animate={{ rotate: plusMenuOpen ? 45 : 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                style={{ display: 'flex' }}
              >
                <Plus size={18} />
              </motion.div>
            </button>

            <AnimatePresence>
              {plusMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="absolute bottom-12 left-0 w-60 rounded-2xl overflow-hidden z-30"
                  style={{
                    border: '1px solid #e5e7eb',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                  }}
                >
                  <button
                    onClick={() => {
                      setPlusMenuOpen(false);
                      setCameraModalOpen(true);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#f3f4f6] text-[#374151] shrink-0">
                      <Camera size={16} />
                    </span>
                    <span className="text-left">
                      <span className="block text-[15px] font-medium text-[#111827]">Tomar foto</span>
                      <span className="block text-[13px] text-[#9ca3af]">Analiza lo que tienes frente a ti</span>
                    </span>
                  </button>
                  <button
                    onClick={() => setPlusMenuOpen(false)}
                    className="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-50 transition-colors border-t border-[#e5e7eb]"
                  >
                    <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#f3f4f6] text-[#374151] shrink-0">
                      <ImagePlus size={16} />
                    </span>
                    <span className="text-left">
                      <span className="block text-[15px] font-medium text-[#111827]">Subir foto</span>
                      <span className="block text-[13px] text-[#9ca3af]">Eres libre de poner uno</span>
                    </span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder={alertMode ? 'Describe la emergencia…' : 'Dime cómo ayudarte'}
            style={{ resize: 'none', overflow: 'hidden' }}
            className={`flex-1 bg-transparent outline-none text-[14px] placeholder:text-slate-400 min-w-0 leading-snug py-1.5 ${
              alertMode ? 'text-red-700' : 'text-slate-800'
            }`}
          />

          {/* Voice button */}
          <button
            aria-label="Usar voz"
            className={`flex items-center justify-center w-9 h-9 rounded-xl transition-colors shrink-0 ${voiceStyle}`}
          >
            <Mic size={16} />
          </button>

          {/* Send button */}
          <button
            onClick={() => void handleSubmit()}
            disabled={sendDisabled}
            aria-label="Enviar"
            className={`flex items-center justify-center w-9 h-9 rounded-xl transition-colors shrink-0 ${sendBase} ${sendDisabled ? 'opacity-30 cursor-not-allowed' : ''}`}
          >
            {isProcessing ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 rounded-full border-2 border-current border-t-transparent"
              />
            ) : (
              <ArrowUp size={16} strokeWidth={2.25} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
