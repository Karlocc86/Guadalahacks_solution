import { useState, useRef, useEffect } from 'react';
import { Plus, Mic, ArrowUp, LayoutGrid, ChevronRight, Camera, ImagePlus, ArrowLeft, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@store/appStore';
import { detectIntent } from '@lib/ollama';
import { CARDS } from '@lib/cards';
import type { Card } from '../../types/domain';

const DISPLAY_CARD_IDS = ['desmayo', 'fractura', 'quemadura', 'llanta'];

const CARD_GRADIENT: Record<string, string> = {
  desmayo: 'from-pink-400 via-rose-500 to-red-600',
  fractura: 'from-slate-300 via-gray-400 to-slate-500',
  quemadura: 'from-orange-300 via-amber-400 to-orange-600',
  llanta: 'from-zinc-400 via-slate-400 to-zinc-500',
};

const DISPLAY_TITLE: Record<string, string> = {
  desmayo: 'Desmayo',
  fractura: 'Fractura de brazo',
  quemadura: 'Quemadura',
  llanta: 'Cambio de llanta',
};

function cardPriority(card: Card): { text: string; badgeClass: string } {
  if (card.severity === 'critical') return { text: 'ALTA', badgeClass: 'bg-red-600 text-white' };
  if (card.tint === 'amber') return { text: 'MEDIA', badgeClass: 'bg-amber-500 text-white' };
  return { text: 'BAJA', badgeClass: 'bg-zinc-800 text-white' };
}

export function FeedView() {
  const {
    query,
    setQuery,
    setAlertMode,
    feedShowResults,
    feedResultCardId,
    feedSearchQuery,
    showFeedResults,
    hideFeedResults,
    plusMenuOpen,
    togglePlusMenu,
    setPlusMenuOpen,
    openCard,
    openCategories,
    setCameraModalOpen,
  } = useAppStore((s) => ({
    query: s.query,
    setQuery: s.setQuery,
    setAlertMode: s.setAlertMode,
    feedShowResults: s.feedShowResults,
    feedResultCardId: s.feedResultCardId,
    feedSearchQuery: s.feedSearchQuery,
    showFeedResults: s.showFeedResults,
    hideFeedResults: s.hideFeedResults,
    plusMenuOpen: s.plusMenuOpen,
    togglePlusMenu: s.togglePlusMenu,
    setPlusMenuOpen: s.setPlusMenuOpen,
    openCard: s.openCard,
    openCategories: s.openCategories,
    setCameraModalOpen: s.setCameraModalOpen,
  }));

  const [isProcessing, setIsProcessing] = useState(false);
  const plusRef = useRef<HTMLDivElement>(null);

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

  const displayCards: Card[] = DISPLAY_CARD_IDS
    .map((id) => CARDS.find((c) => c.id === id))
    .filter(Boolean) as Card[];

  const heroCard = feedResultCardId
    ? (displayCards.find((c) => c.id === feedResultCardId) ?? null)
    : null;

  const relatedCards = heroCard
    ? displayCards.filter((c) => c.id !== heroCard.id)
    : displayCards;

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
      const intent = await detectIntent(q, 'text');
      showFeedResults(intent.matchedCardId ?? null, q);
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

  function renderInputBar() {
    return (
      <div
        className="w-full flex items-center gap-2 px-2 h-13 bg-white border border-[#e5e7eb] rounded-2xl"
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
      >
        <div className="relative shrink-0" ref={plusRef}>
          <button
            onClick={togglePlusMenu}
            aria-label="Adjuntar"
            className="flex items-center justify-center w-8 h-8 rounded-[10px] bg-[#f9fafb] border border-[#e5e7eb] text-slate-500 hover:bg-gray-100 transition-colors"
          >
            <motion.div
              animate={{ rotate: plusMenuOpen ? 45 : 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              style={{ display: 'flex' }}
            >
              <Plus size={15} />
            </motion.div>
          </button>

          <AnimatePresence>
            {plusMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="absolute left-0 bottom-12 w-60 rounded-2xl overflow-hidden z-30"
                style={{
                  border: '1px solid #e5e7eb',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                }}
              >
                <button
                  onClick={() => { setPlusMenuOpen(false); setCameraModalOpen(true); }}
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

        <input
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe la situación..."
          className="flex-1 bg-transparent outline-none text-[15px] text-[#111827] placeholder:text-[#9ca3af] min-w-0"
        />
        <button
          aria-label="Usar voz"
          className="flex items-center justify-center w-8 h-8 shrink-0 text-[#9ca3af] hover:text-slate-500 transition-colors"
        >
          <Mic size={15} />
        </button>
        <button
          onClick={() => void handleSubmit()}
          disabled={sendDisabled}
          aria-label="Enviar"
          className={`flex items-center justify-center w-8 h-8 rounded-[10px] shrink-0 bg-[#f3f4f6] text-[#374151] transition-colors ${sendDisabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#e5e7eb]'}`}
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
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <AnimatePresence mode="wait">
        {!feedShowResults ? (
          <motion.div
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col items-center justify-center px-5 gap-6"
          >
            <h1 className="text-[36px] font-bold text-center text-[#111827] leading-[1.15] tracking-[-0.03em]">
              ¿Cuál es tu<br />emergencia?
            </h1>
            <div className="w-full flex flex-col items-center gap-4">
              {renderInputBar()}
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
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 overflow-y-auto px-5 pt-4 pb-4 scroll-pane"
          >
            <button
              onClick={hideFeedResults}
              className="flex items-center gap-1 mb-3 text-[13px] text-[#374151] hover:text-[#111827] transition-colors"
              aria-label="Volver al inicio"
            >
              <ArrowLeft size={15} />
              <span>Inicio</span>
            </button>

            <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-slate-400">
              Resultados de búsqueda
            </p>
            <h2 className="mt-0.5 text-[22px] font-bold text-[#111827] tracking-tight leading-tight">
              Resultados para:{' '}
              <span className="text-slate-400 font-normal">{feedSearchQuery}</span>
            </h2>

            {/* Hero card */}
            {heroCard && (() => {
              const prio = cardPriority(heroCard);
              const gradient = CARD_GRADIENT[heroCard.id] ?? 'from-slate-400 to-slate-600';
              return (
                <button
                  onClick={() => openCard(heroCard.id, heroCard.severity)}
                  className="mt-4 w-full text-left rounded-2xl overflow-hidden card-lift"
                  style={{ border: '1px solid #e5e7eb' }}
                >
                  <div className={`relative h-40 bg-linear-to-br ${gradient}`}>
                    <div className={`absolute top-3 left-3 inline-flex items-center gap-1.5 px-2 py-1 rounded-md ${prio.badgeClass} shadow-lg`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-white blip" />
                      <span className="text-[9px] font-mono uppercase tracking-[0.22em] font-semibold">
                        PRIORIDAD: {prio.text}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3 w-7 h-7 rounded-md bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md text-slate-700">
                      <ShieldAlert size={14} />
                    </div>
                    <div
                      className="absolute left-0 right-0 bottom-0 p-3.5"
                      style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)' }}
                    >
                      <h3 className="text-[18px] font-semibold tracking-tight leading-tight text-white">
                        {DISPLAY_TITLE[heroCard.id] ?? heroCard.title}
                      </h3>
                      <p className="mt-1 text-[12px] leading-snug line-clamp-2" style={{ color: 'rgba(255,255,255,0.85)' }}>
                        {heroCard.blurb}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })()}

            {/* No match — plain grid */}
            {!heroCard && (
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                {displayCards.map((card) => {
                  const prio = cardPriority(card);
                  const gradient = CARD_GRADIENT[card.id] ?? 'from-slate-400 to-slate-600';
                  return (
                    <button
                      key={card.id}
                      onClick={() => openCard(card.id, card.severity)}
                      className="text-left rounded-xl overflow-hidden card-lift"
                      style={{ border: '1px solid #e5e7eb' }}
                    >
                      <div className={`relative h-20 bg-linear-to-br ${gradient} flex items-end p-2`}>
                        <span className={`text-[8px] font-mono uppercase tracking-[0.18em] px-1.5 py-0.5 rounded ${prio.badgeClass}`}>
                          {prio.text}
                        </span>
                      </div>
                      <div className="p-2.5 bg-white">
                        <p className="text-[12px] font-medium text-[#111827] leading-snug truncate">
                          {DISPLAY_TITLE[card.id] ?? card.title}
                        </p>
                        <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mt-0.5">
                          prioridad: <span className="text-slate-600">{prio.text}</span>
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* "También relevantes" smaller grid */}
            {heroCard && relatedCards.length > 0 && (
              <>
                <div className="mt-5 mb-2 flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-[0.28em] text-slate-400">
                    también relevantes
                  </span>
                  <span className="flex-1 h-px bg-gray-200" />
                  <span className="text-[10px] font-mono text-slate-400 tabular-nums">
                    {relatedCards.length}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {relatedCards.map((card) => {
                    const prio = cardPriority(card);
                    const gradient = CARD_GRADIENT[card.id] ?? 'from-slate-400 to-slate-600';
                    return (
                      <button
                        key={card.id}
                        onClick={() => openCard(card.id, card.severity)}
                        className="text-left rounded-xl overflow-hidden card-lift"
                        style={{ border: '1px solid #e5e7eb' }}
                      >
                        <div className={`relative h-20 bg-linear-to-br ${gradient} flex items-end p-2`}>
                          <span className={`text-[8px] font-mono uppercase tracking-[0.18em] px-1.5 py-0.5 rounded ${prio.badgeClass}`}>
                            {prio.text}
                          </span>
                        </div>
                        <div className="p-2.5 bg-white">
                          <p className="text-[12px] font-medium text-[#111827] leading-snug truncate">
                            {DISPLAY_TITLE[card.id] ?? card.title}
                          </p>
                          <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mt-0.5">
                            prioridad: <span className="text-slate-600">{prio.text}</span>
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* Inline search */}
            <div className="mt-5">
              {renderInputBar()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!feedShowResults && (
        <div className="px-5 pb-4 flex justify-end shrink-0">
          <span className="text-[10px] font-medium tracking-[0.12em] uppercase text-[#9ca3af]">
            SOS · HOME
          </span>
        </div>
      )}
    </div>
  );
}
