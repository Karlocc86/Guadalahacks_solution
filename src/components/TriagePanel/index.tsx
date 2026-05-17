import { Sparkles, Check, PhoneCall } from 'lucide-react';
import type { Card } from '../../types/domain';

interface TriagePanelProps {
  card: Card;
  triageIdx: number;
  triagePicks: string[];
  onPick: (answer: string) => void;
  onReset: () => void;
}

export function TriagePanel({ card, triageIdx, triagePicks, onPick, onReset }: TriagePanelProps) {
  const total = card.triage.length;
  const done = triageIdx >= total;
  const current = card.triage[triageIdx];
  const critical = card.severity === 'critical';

  const panelBorder = critical ? 'border-red-200 bg-red-50/50' : 'border-gray-200 bg-gray-50/50';
  const headerIcon = critical ? 'bg-red-100 text-red-400' : 'bg-gray-100 text-slate-400';
  const headerLabel = critical ? 'text-slate-600' : 'text-slate-500';
  const progressBar = critical ? 'bg-red-400' : 'bg-slate-300';
  const progressTrack = 'bg-gray-200';
  const optStyle = critical
    ? 'border-red-200 bg-white text-red-700 hover:bg-red-50 hover:border-red-300'
    : 'border-gray-200 bg-white text-slate-700 hover:bg-gray-50 hover:border-gray-300';

  return (
    <div className={`relative rounded-2xl border ${panelBorder} overflow-hidden`}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100">
        <span className={`flex items-center justify-center w-6 h-6 rounded-md ${headerIcon}`}>
          <Sparkles size={12} />
        </span>
        <span className={`text-[11px] font-mono uppercase tracking-[0.22em] ${headerLabel}`}>
          Diagnóstico asistido
        </span>
        <span className="ml-auto text-[10px] font-mono uppercase tracking-wider text-slate-400 tabular-nums">
          {Math.min(triagePicks.length, total)}/{total}
        </span>
      </div>

      {/* Progress bar */}
      <div className={`h-px ${progressTrack} relative`}>
        <div
          className={`absolute inset-y-0 left-0 ${progressBar} transition-all duration-300`}
          style={{ width: `${(triagePicks.length / total) * 100}%` }}
        />
      </div>

      <div className="p-3">
        {!done ? (
          <div className="page-enter" key={triageIdx}>
            <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-slate-400">
              Pregunta {triageIdx + 1}
            </p>
            <p className="mt-1.5 text-[15px] leading-snug text-slate-800 tracking-tight">
              {current.q}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {current.opts.map((opt) => (
                <button
                  key={opt}
                  onClick={() => onPick(opt)}
                  className={`opt-btn flex-1 min-w-[88px] px-3 py-2.5 rounded-xl border text-[13px] font-medium tracking-tight transition-colors ${optStyle}`}
                >
                  {opt}
                </button>
              ))}
            </div>

            {triagePicks.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-1.5">
                {triagePicks.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px]">
                    <Check size={11} className={critical ? 'text-red-400' : 'text-emerald-500'} />
                    <span className="text-slate-400 font-mono">P{i + 1}</span>
                    <span className="text-slate-600 truncate">{p}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <Verdict card={card} onReset={onReset} />
        )}
      </div>
    </div>
  );
}

function Verdict({ card, onReset }: { card: Card; onReset: () => void }) {
  const critical = card.severity === 'critical';

  const levelStyle = critical
    ? 'bg-red-100 text-red-600 border border-red-200'
    : 'bg-emerald-50 text-emerald-600 border border-emerald-200';

  const actionStyle = critical
    ? 'bg-red-500 text-white hover:bg-red-600'
    : 'bg-slate-900 text-white hover:bg-slate-700';

  return (
    <div className="page-enter">
      <div className="flex items-center gap-2">
        <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-[0.22em] ${levelStyle}`}>
          {card.verdict.level}
        </span>
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
          veredicto final
        </span>
      </div>
      <h3 className="mt-2 text-[18px] font-semibold text-slate-800 tracking-tight">
        {card.verdict.title}
      </h3>
      <p className="mt-1 text-[12.5px] text-slate-400 leading-snug">{card.verdict.body}</p>

      <button
        onClick={() => { if (critical) window.location.href = 'tel:911'; }}
        className={`mt-4 w-full flex items-center justify-center gap-2 h-14 rounded-2xl font-semibold text-[15px] tracking-tight transition-colors ${actionStyle}`}
      >
        <PhoneCall size={18} strokeWidth={2.25} />
        {critical ? 'Llamar a Emergencias' : 'Marcar como resuelto'}
      </button>

      <button
        onClick={onReset}
        className="mt-2 w-full text-[11px] font-mono uppercase tracking-[0.22em] text-slate-400 hover:text-slate-600 py-2 transition-colors"
      >
        ↻ reiniciar diagnóstico
      </button>
    </div>
  );
}
