import { useCallback } from 'react';
import { detectIntent } from '@lib/ollama';
import { CARDS } from '@lib/cards';
import { useAppStore } from '@store/appStore';
import type { IntentResult } from '../types/domain';

export function useIntentSearch() {
  const setUIMode = useAppStore((s) => s.setUIMode);
  const openCard = useAppStore((s) => s.openCard);

  const processInput = useCallback(
    async (text: string, source?: 'text' | 'camera'): Promise<IntentResult> => {
      setUIMode('processing');
      try {
        const intent = await detectIntent(text, source);
        setUIMode(intent.severity === 'emergency' ? 'emergency' : 'idle');
        if (intent.matchedCardId) {
          const card = CARDS.find((c) => c.id === intent.matchedCardId);
          if (card) openCard(card.id, card.severity);
        }
        return intent;
      } catch {
        setUIMode('idle');
        return { severity: 'standard', contextType: 'general', summary: '', confidence: 0.5 };
      }
    },
    [setUIMode, openCard]
  );

  return { processInput };
}
