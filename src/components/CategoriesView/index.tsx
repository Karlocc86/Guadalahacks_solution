import { ChevronRight, HeartPulse, Home, CloudLightning, ShieldAlert, MoreHorizontal } from 'lucide-react';
import { CARDS } from '@lib/cards';
import { CardIcon } from '@lib/icons';
import { useAppStore } from '@store/appStore';
import type { Card } from '../../types/domain';
import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  priority: string;
  priorityDot: string;
  tags: string;
  gradient: string;
  Icon: ComponentType<LucideProps>;
  cardIds: string[];
}

const CATEGORIES: Category[] = [
  {
    id: 'medical',
    name: 'Médicas y de salud',
    priority: 'PRIORIDAD ALTA',
    priorityDot: 'bg-red-500',
    tags: 'Lesiones, paros, traumas',
    gradient: 'from-pink-400 via-rose-500 to-red-600',
    Icon: HeartPulse,
    cardIds: ['desmayo', 'fractura', 'quemadura', 'corte'],
  },
  {
    id: 'home',
    name: 'Hogar y estructuras',
    priority: 'PRIORIDAD ALTA',
    priorityDot: 'bg-red-500',
    tags: 'Incendios, Inundaciones',
    gradient: 'from-orange-400 via-amber-400 to-orange-500',
    Icon: Home,
    cardIds: [],
  },
  {
    id: 'natural',
    name: 'Fenómenos naturales',
    priority: 'PRIORIDAD ALTA',
    priorityDot: 'bg-red-500',
    tags: 'Sismos, Tormentas',
    gradient: 'from-slate-400 via-gray-500 to-slate-600',
    Icon: CloudLightning,
    cardIds: [],
  },
  {
    id: 'security',
    name: 'Seguridad',
    priority: 'PRIORIDAD MEDIA',
    priorityDot: 'bg-orange-400',
    tags: 'Policía, Protección',
    gradient: 'from-slate-700 via-slate-600 to-slate-800',
    Icon: ShieldAlert,
    cardIds: [],
  },
  {
    id: 'misc',
    name: 'Misceláneas',
    priority: 'PRIORIDAD BAJA',
    priorityDot: 'bg-slate-400',
    tags: 'Otros incidentes',
    gradient: 'from-zinc-500 via-zinc-400 to-zinc-600',
    Icon: MoreHorizontal,
    cardIds: ['llanta'],
  },
];

const CARD_GRADIENT: Record<string, string> = {
  desmayo: 'from-pink-400 via-rose-500 to-red-600',
  fractura: 'from-slate-300 via-gray-400 to-slate-500',
  quemadura: 'from-orange-300 via-amber-400 to-orange-600',
  corte: 'from-rose-200 via-pink-300 to-red-400',
  llanta: 'from-zinc-400 via-slate-400 to-zinc-500',
};

function severityBadge(card: Card) {
  if (card.severity === 'critical') {
    return (
      <span className="text-[10px] font-mono uppercase tracking-wider text-red-600 border border-red-200 rounded-full px-2 py-0.5 bg-red-50">
        ALTA
      </span>
    );
  }
  if (card.tint === 'amber') {
    return (
      <span className="text-[10px] font-mono uppercase tracking-wider text-amber-600 border border-amber-200 rounded-full px-2 py-0.5 bg-amber-50">
        MEDIA
      </span>
    );
  }
  return (
    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 border border-gray-200 rounded-full px-2 py-0.5 bg-gray-50">
      MEDIA
    </span>
  );
}

export function CategoriesView() {
  const { view, selectedCategoryId, openCategoryDetail, openCardFromCategory } = useAppStore((s) => ({
    view: s.view,
    selectedCategoryId: s.selectedCategoryId,
    openCategoryDetail: s.openCategoryDetail,
    openCardFromCategory: s.openCardFromCategory,
  }));

  // Category detail: driven by store view + selectedCategoryId
  if (view === 'category_detail' && selectedCategoryId !== null) {
    const selected = CATEGORIES.find((c) => c.id === selectedCategoryId) ?? null;
    const categoryCards = selected
      ? (selected.cardIds.map((id) => CARDS.find((c) => c.id === id)).filter(Boolean) as Card[])
      : [];

    return (
      <div className="h-full overflow-y-auto bg-white px-5 pt-4 pb-4 page-enter scroll-pane">
        <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-slate-400">
          Categoría
        </p>
        <h1 className="text-[26px] font-bold tracking-tight text-slate-900 mt-0.5">
          {selected?.name ?? ''}
        </h1>
        <p className="text-[13px] text-slate-400 mt-0.5 mb-5">{selected?.tags ?? ''}</p>

        {categoryCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            {selected && (
              <div className={`w-16 h-16 rounded-2xl bg-linear-to-br ${selected.gradient} flex items-center justify-center mb-4`}>
                <selected.Icon size={28} className="text-white" strokeWidth={1.5} />
              </div>
            )}
            <p className="text-[14px] text-slate-400">Próximamente disponible</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {categoryCards.map((card) => (
              <li key={card.id}>
                <button
                  onClick={() => openCardFromCategory(card.id, card.severity)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl border border-gray-100 bg-white hover:bg-gray-50 transition-colors text-left"
                >
                  <div className={`w-14 h-14 rounded-xl bg-linear-to-br ${CARD_GRADIENT[card.id] ?? 'from-gray-300 to-gray-500'} flex items-center justify-center shrink-0`}>
                    <CardIcon name={card.icon} size={24} className="text-white" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block text-[14px] font-semibold text-slate-800 truncate">
                      {card.title}
                    </span>
                    <span className="block text-[12px] text-slate-400 truncate mt-0.5">
                      {card.blurb}
                    </span>
                  </div>
                  <div className="shrink-0 ml-1">
                    {severityBadge(card)}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  // Category list
  return (
    <div className="h-full overflow-y-auto bg-white px-5 pt-4 pb-4 page-enter scroll-pane">
      <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-slate-400">
        Explorar
      </p>
      <h1 className="text-[26px] font-bold tracking-tight text-slate-900 mt-0.5">
        Explorar
      </h1>
      <p className="text-[13px] text-slate-400 mt-0.5 mb-5">
        Seleccione el tipo de asistencia requerida.
      </p>

      <ul className="space-y-3">
        {CATEGORIES.map((cat) => (
          <li key={cat.id}>
            <button
              onClick={() => openCategoryDetail(cat.id, cat.name)}
              className="w-full flex items-center gap-4 p-3 rounded-2xl border border-gray-100 bg-white hover:bg-gray-50 transition-colors text-left"
            >
              <div className={`w-14 h-14 rounded-xl bg-linear-to-br ${cat.gradient} flex items-center justify-center shrink-0`}>
                <cat.Icon size={24} className="text-white" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="block text-[14px] font-semibold text-slate-800">
                  {cat.name}
                </span>
                <span className="flex items-center gap-1.5 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${cat.priorityDot}`} />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    {cat.priority}
                  </span>
                </span>
                <span className="block text-[11px] text-slate-400 mt-0.5">{cat.tags}</span>
              </div>
              <ChevronRight size={16} className="text-slate-300 shrink-0" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
