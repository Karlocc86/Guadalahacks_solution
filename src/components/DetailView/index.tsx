import { Clock, PhoneCall, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import { useAppStore } from '@store/appStore';
import { CARDS } from '@lib/cards';
import { CardIcon } from '@lib/icons';
import { TriagePanel } from '@components/TriagePanel';

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-[10px] font-mono uppercase tracking-[0.28em] text-slate-400">
      {children}
    </span>
  );
}

export function DetailView() {
  const { activeCardId, triageIdx, triagePicks, pickTriage, resetTriage } =
    useAppStore((s) => ({
      activeCardId: s.activeCardId,
      triageIdx: s.triageIdx,
      triagePicks: s.triagePicks,
      pickTriage: s.pickTriage,
      resetTriage: s.resetTriage,
    }));

  const card = CARDS.find((c) => c.id === activeCardId);
  if (!card) return null;

  const critical = card.severity === 'critical';

  return (
    <div className="scroll-pane h-full overflow-y-auto bg-white page-enter">
      <div className="px-4 pt-4 pb-6 space-y-4">

        {/* Severity badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {critical ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-red-200 bg-red-50">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-red-600">
                Severidad: Crítica
              </span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-gray-200 bg-gray-50">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                Severidad: Estándar
              </span>
            </span>
          )}
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-gray-200 bg-gray-50">
            <Clock size={11} className="text-slate-400" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
              {critical ? 'Inmediato' : card.eta}
            </span>
          </span>
        </div>

        {/* Title + icon */}
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-[28px] leading-tight font-bold text-slate-900 tracking-tight">
              {card.title}
            </h1>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-500">{card.long}</p>
          </div>
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
              critical
                ? 'bg-red-100 text-red-500'
                : card.tint === 'amber'
                ? 'bg-amber-100 text-amber-600'
                : 'bg-gray-100 text-slate-500'
            }`}
          >
            <CardIcon name={card.icon} size={26} strokeWidth={1.5} />
          </div>
        </div>

        {/* Critical priority box */}
        {critical && (
          <div className="rounded-2xl bg-red-500 p-4 overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TriangleAlert size={16} className="text-red-200" strokeWidth={2} />
                <span className="text-[14px] font-bold text-white">
                  Cosas que tienes que hacer YA
                </span>
              </div>
              <span className="text-[9px] font-mono uppercase tracking-wider text-red-300">
                PRIORI · YA
              </span>
            </div>

            <div className="space-y-2">
              {card.steps.slice(0, 3).map((step, i) => (
                <div key={i} className="flex items-start gap-2.5 bg-red-600/40 rounded-xl px-3 py-2.5">
                  <span className="flex items-center justify-center w-6 h-6 rounded-md bg-red-500/60 text-[11px] font-mono text-red-100 tabular-nums shrink-0 mt-0.5">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-[13px] leading-snug text-white">{step}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => { window.location.href = 'tel:911'; }}
              className="mt-3 w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-white text-red-600 font-semibold text-[14px] hover:bg-red-50 transition-colors"
            >
              <PhoneCall size={16} strokeWidth={2.25} />
              Llamar al 911
            </button>
          </div>
        )}

        {/* Normal steps */}
        {!critical && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <SectionLabel>Pasos rápidos</SectionLabel>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-300">
                {card.steps.length} acciones
              </span>
            </div>
            <ol className="space-y-1.5">
              {card.steps.map((s, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 p-2.5 rounded-xl border border-gray-200 bg-gray-50"
                >
                  <span className="flex items-center justify-center w-6 h-6 rounded-md bg-white border border-gray-200 font-mono text-[11px] tabular-nums text-slate-500 shrink-0">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-[13px] leading-snug text-slate-700 pt-0.5">{s}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Remaining steps for critical cards */}
        {critical && card.steps.length > 3 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <SectionLabel>Pasos adicionales</SectionLabel>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-300">
                {card.steps.length - 3} más
              </span>
            </div>
            <ol className="space-y-1.5">
              {card.steps.slice(3).map((s, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 p-2.5 rounded-xl border border-gray-200 bg-gray-50"
                >
                  <span className="flex items-center justify-center w-6 h-6 rounded-md bg-white border border-gray-200 font-mono text-[11px] tabular-nums text-slate-500 shrink-0">
                    {String(i + 4).padStart(2, '0')}
                  </span>
                  <span className="text-[13px] leading-snug text-slate-700 pt-0.5">{s}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Triage panel */}
        <TriagePanel
          card={card}
          triageIdx={triageIdx}
          triagePicks={triagePicks}
          onPick={(answer) => pickTriage(answer, card.triage.length)}
          onReset={resetTriage}
        />

        {/* Source footer */}
        <div className="pt-1 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.22em] text-slate-300">
          <span>fuente: omniguia · cruz roja mx</span>
          <span>actualizado · 06-may</span>
        </div>
      </div>
    </div>
  );
}
