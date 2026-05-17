import { Siren, PhoneCall, ArrowRight, Clock, WifiOff } from 'lucide-react';
import type { Card } from '../../types/domain';
import { CardIcon } from '@lib/icons';

interface HeroCardProps {
  card: Card;
  alert: boolean;
  onOpen: () => void;
}

export function HeroCard({ card, alert, onOpen }: HeroCardProps) {
  const isSOS = alert && card.severity === 'critical';

  if (isSOS) {
    return (
      <button
        onClick={onOpen}
        className="block w-full text-left relative rounded-2xl border border-red-500/40 bg-gradient-to-br from-red-950/40 to-zinc-950 p-4 overflow-hidden shimmer card-lift"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-md bg-red-500/15 text-red-300">
              <Siren size={14} />
            </span>
            <span className="text-[10px] font-mono uppercase tracking-[0.28em] text-red-300/90">
              sos · {card.category}
            </span>
          </div>
          <span className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-red-300/80">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 blip" />
            en curso
          </span>
        </div>

        <h2 className="mt-3 text-[22px] leading-tight font-semibold text-red-50 tracking-tight">
          {card.title}
        </h2>
        <p className="mt-1.5 text-[13px] leading-relaxed text-red-200/80">{card.blurb}</p>

        <ul className="mt-4 space-y-2">
          {card.steps.slice(0, 3).map((s, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="mt-[3px] w-4 h-4 rounded-[5px] border border-red-400/60 bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <span className="text-[9px] font-mono text-red-200 tabular-nums">{i + 1}</span>
              </span>
              <span className="text-[13px] leading-snug text-red-100">{s}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-center gap-2">
          <span className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl bg-red-500 text-white font-medium text-[13px] tracking-wide">
            <PhoneCall size={14} strokeWidth={2.25} />
            Llamar a Emergencias
          </span>
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-500/15 text-red-200">
            <ArrowRight size={16} />
          </span>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onOpen}
      className="block w-full text-left relative rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-4 overflow-hidden card-lift"
    >
      <div className="flex items-start gap-3">
        <div className="w-[88px] h-[88px] rounded-xl bg-zinc-800/80 border border-zinc-800 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
          <CardIcon name={card.icon} size={36} className="text-zinc-300" strokeWidth={1.5} />
          <div className="absolute -bottom-3 -right-3 w-12 h-12 rounded-full bg-zinc-700/40 blur-xl" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-zinc-500">
              destacada
            </span>
            <span className="w-1 h-1 rounded-full bg-zinc-700" />
            <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-zinc-500">
              {card.category}
            </span>
          </div>
          <h2 className="mt-1.5 text-[18px] leading-tight font-semibold text-zinc-100 tracking-tight">
            {card.title}
          </h2>
          <p className="mt-1 text-[12.5px] leading-snug text-zinc-400 line-clamp-2">{card.blurb}</p>
          <div className="mt-2.5 flex items-center gap-3 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
            <span className="flex items-center gap-1">
              <Clock size={11} /> {card.eta}
            </span>
            <span className="flex items-center gap-1">
              <WifiOff size={11} /> offline
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
