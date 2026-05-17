import { History, Settings, ChevronLeft, ArrowUpRight } from 'lucide-react';
import { useAppStore } from '@store/appStore';
import { CARDS } from '@lib/cards';
import { CardIcon } from '@lib/icons';

export function TopBar() {
  const {
    view,
    alertMode,
    historyOpen,
    historyIds,
    toggleHistoryOpen,
    setPlusMenuOpen,
    openCard,
    backToFeed,
  } = useAppStore((s) => ({
    view: s.view,
    alertMode: s.alertMode,
    historyOpen: s.historyOpen,
    historyIds: s.historyIds,
    toggleHistoryOpen: s.toggleHistoryOpen,
    setPlusMenuOpen: s.setPlusMenuOpen,
    openCard: s.openCard,
    backToFeed: s.backToFeed,
  }));

  const historyCards = historyIds
    .map((id) => CARDS.find((c) => c.id === id))
    .filter(Boolean) as typeof CARDS;

  const hoverBg = alertMode ? 'hover:bg-red-100/60' : 'hover:bg-gray-200';

  return (
    <div className="relative z-20 px-4 pt-4 pb-3 flex items-center justify-between shrink-0 border-b border-gray-100 bg-white transition-colors duration-300">

      {/* Left: History icon or Back button */}
      <div className="relative">
        {view === 'feed' ? (
          <>
            <button
              onClick={() => {
                toggleHistoryOpen();
                setPlusMenuOpen(false);
              }}
              className={`flex items-center justify-center w-9 h-9 rounded-full bg-[#f3f4f6] transition-colors ${hoverBg}`}
              aria-label="Historial"
            >
              <History size={16} className="text-slate-600" />
            </button>

            {historyOpen && (
              <div className="absolute left-0 top-11 w-65 rounded-2xl border border-gray-200 bg-white shadow-xl shadow-black/8 overflow-hidden page-enter z-30">
                <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">
                    Recientes
                  </span>
                  <span className="text-[10px] font-mono text-slate-300">offline · caché</span>
                </div>
                <ul className="py-1">
                  {historyCards.map((card, i) => (
                    <li key={card.id}>
                      <button
                        onClick={() => openCard(card.id, card.severity)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left"
                      >
                        <span className="text-[10px] font-mono text-slate-300 w-4 tabular-nums">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span
                          className={`flex items-center justify-center w-7 h-7 rounded-md ${
                            card.severity === 'critical'
                              ? 'bg-red-50 text-red-500'
                              : 'bg-gray-100 text-slate-500'
                          }`}
                        >
                          <CardIcon name={card.icon} size={14} />
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-[13px] text-slate-800 truncate">{card.title}</span>
                          <span className="block text-[10px] text-slate-400 truncate font-mono uppercase tracking-wider">
                            {card.category}
                          </span>
                        </span>
                        <ArrowUpRight size={13} className="text-slate-300 shrink-0" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <button
            onClick={backToFeed}
            className={`flex items-center gap-1 h-9 px-2 rounded-xl transition-colors ${hoverBg}`}
          >
            <ChevronLeft size={20} className="text-slate-600" />
            <span className="text-[13px] font-medium text-slate-600">Inicio</span>
          </button>
        )}
      </div>

      {/* Center: SOS360 logo */}
      <span className="text-[16px] font-semibold tracking-[0.02em] select-none">
        <span className="text-[#111827]">SOS</span>
        <span className="text-[#f97316]">360</span>
      </span>

      {/* Right: Settings gear in gray circle */}
      <button
        aria-label="Configuración"
        className={`flex items-center justify-center w-9 h-9 rounded-full bg-[#f3f4f6] transition-colors ${hoverBg}`}
      >
        <Settings size={16} strokeWidth={1.75} className="text-slate-600" />
      </button>
    </div>
  );
}
