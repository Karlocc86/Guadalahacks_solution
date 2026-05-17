import { useState } from 'react';
import { Plus, Mic, ArrowUp, LayoutGrid, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppStore } from '@store/appStore';
import { useIntentSearch } from '@hooks/useIntentSearch';

export function FeedView() {
  const {
    query,
    setQuery,
    setAlertMode,
    openCategories,
    setCameraModalOpen,
  } = useAppStore((s) => ({
    query: s.query,
    setQuery: s.setQuery,
    setAlertMode: s.setAlertMode,
    openCategories: s.openCategories,
    setCameraModalOpen: s.setCameraModalOpen,
  }));

  const { processInput } = useIntentSearch();
  const [isProcessing, setIsProcessing] = useState(false);

  function handleQueryChange(v: string) {
    setQuery(v);
    if (/desmay|paro|ahog|incons|no respira|emergen/.test(v.toLowerCase())) {
      setAlertMode(true);
    }
  }

  async function handleSubmit() {
    const q = query.trim();
    if (!q || isProcessing) return;
    setIsProcessing(true);
    try {
      await processInput(q, 'text');
      setQuery('');
    } finally {
      setIsProcessing(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      void handleSubmit();
    }
  }

  const hasContent = query.trim().length > 0;
  const sendDisabled = isProcessing || !hasContent;

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Vertically centered content group */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 gap-6">
        {/* Hero heading */}
        <h1 className="text-[36px] font-bold text-center text-[#111827] leading-[1.15] tracking-[-0.03em]">
          ¿Cuál es tu<br />emergencia?
        </h1>

        {/* Input + categories group */}
        <div className="w-full flex flex-col items-center gap-4">
          {/* Input bar */}
          <div
            className="w-full flex items-center gap-2 px-2 h-13 bg-white border border-[#e5e7eb] rounded-2xl"
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
          >
            {/* Plus button */}
            <button
              onClick={() => setCameraModalOpen(true)}
              aria-label="Adjuntar"
              className="flex items-center justify-center w-8 h-8 rounded-[10px] bg-[#f9fafb] border border-[#e5e7eb] shrink-0 text-slate-500 hover:bg-gray-100 transition-colors"
            >
              <Plus size={15} />
            </button>

            {/* Input */}
            <input
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe la situación..."
              className="flex-1 bg-transparent outline-none text-[15px] text-[#111827] placeholder:text-[#9ca3af] min-w-0"
            />

            {/* Mic */}
            <button
              aria-label="Usar voz"
              className="flex items-center justify-center w-8 h-8 shrink-0 text-[#9ca3af] hover:text-slate-500 transition-colors"
            >
              <Mic size={15} />
            </button>

            {/* Send */}
            <button
              onClick={() => void handleSubmit()}
              disabled={sendDisabled}
              aria-label="Enviar"
              className={`flex items-center justify-center w-8 h-8 rounded-[10px] shrink-0 bg-[#f3f4f6] text-[#374151] transition-colors ${
                sendDisabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#e5e7eb]'
              }`}
            >
              {isProcessing ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 rounded-full border-2 border-current border-t-transparent"
                />
              ) : (
                <ArrowUp size={15} strokeWidth={2.25} />
              )}
            </button>
          </div>

          {/* Categories button */}
          <button
            onClick={openCategories}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#e5e7eb] rounded-3xl text-[#374151] hover:bg-gray-50 transition-colors"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
          >
            <LayoutGrid size={15} className="text-[#374151]" />
            <span className="text-[14px] text-[#374151]">Buscar por categorías</span>
            <ChevronRight size={15} className="text-[#9ca3af]" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 pb-4 flex justify-end">
        <span className="text-[10px] font-medium tracking-[0.12em] uppercase text-[#9ca3af]">
          SOS · HOME
        </span>
      </div>
    </div>
  );
}
