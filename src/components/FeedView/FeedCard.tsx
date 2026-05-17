import { ChevronRight } from 'lucide-react';
import type { Card } from '../../types/domain';
import { CardIcon } from '@lib/icons';

interface FeedCardProps {
  card: Card;
  onOpen: () => void;
}

export function FeedCard({ card, onOpen }: FeedCardProps) {
  const tone =
    card.severity === 'critical' ? 'red' : card.tint === 'amber' ? 'amber' : 'zinc';

  const iconWrap =
    tone === 'red'
      ? 'bg-red-500/10 text-red-300'
      : tone === 'amber'
      ? 'bg-amber-500/10 text-amber-300'
      : 'bg-zinc-800 text-zinc-300';

  return (
    <li>
      <button
        onClick={onOpen}
        className="w-full flex items-center gap-3 p-3 rounded-2xl border border-zinc-900 bg-zinc-950/60 hover:bg-zinc-900/60 card-lift text-left"
      >
        <span
          className={`flex items-center justify-center w-12 h-12 rounded-xl ${iconWrap} flex-shrink-0`}
        >
          <CardIcon name={card.icon} size={20} strokeWidth={1.6} />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 truncate">
            {card.category}
          </span>
          <span className="block text-[14px] font-medium text-zinc-100 tracking-tight truncate">
            {card.title}
          </span>
          <span className="block text-[12px] text-zinc-500 leading-snug line-clamp-1 mt-0.5">
            {card.blurb}
          </span>
        </span>
        <span className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-600 tabular-nums">
            {card.eta}
          </span>
          <ChevronRight size={16} className="text-zinc-600" />
        </span>
      </button>
    </li>
  );
}
