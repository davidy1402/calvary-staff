import type { ReactNode } from 'react';
import { Shirt, Wine, Sparkles } from 'lucide-react';

interface ServiceEventBadgeProps {
  event: string;
  children?: ReactNode;
}

export const ServiceEventBadge = ({ event, children }: ServiceEventBadgeProps) => {
  const isAttire = event.includes('服装');
  const isCommunion = event.includes('圣餐');
  const label = isAttire
    ? event.replace(/^服装要求[:：\s]*/, '')
    : isCommunion ? '圣餐' : event;
  const Icon = isAttire ? Shirt : isCommunion ? Wine : Sparkles;

  return (
    <span
      title={event}
      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 max-w-full ${
        isCommunion
          ? 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40'
          : 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40'
      }`}
    >
      <Icon size={10} strokeWidth={2.2} className="shrink-0" aria-hidden="true" />
      <span className="min-w-0 break-words">{label}</span>
      {children}
    </span>
  );
};
