import type { LucideProps } from 'lucide-react';
import {
  HeartPulse,
  CircleDot,
  Bone,
  Flame,
  Scissors,
  HelpCircle,
} from 'lucide-react';
import type { ComponentType } from 'react';

const iconMap: Record<string, ComponentType<LucideProps>> = {
  HeartPulse,
  CircleDot,
  Bone,
  Flame,
  Scissors,
};

export function CardIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = iconMap[name] ?? HelpCircle;
  return <Icon {...props} />;
}
