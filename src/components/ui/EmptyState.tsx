import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 glass rounded-3xl animate-in zoom-in-95 duration-500">
      <div className="w-24 h-24 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mb-6">
        <Icon className="w-12 h-12 text-[var(--color-stabilo)] opacity-50" />
      </div>
      <h3 className="text-2xl font-bold text-[var(--color-text-foreground)] mb-2">{title}</h3>
      <p className="text-slate-400 max-w-sm mb-8">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="bg-[var(--color-stabilo)]/10 text-[var(--color-stabilo)] hover:bg-[var(--color-stabilo)] hover:text-black font-bold py-3 px-8 rounded-xl transition-all border border-[var(--color-stabilo)]/20 shadow-[0_0_15px_rgba(204,255,0,0.1)] hover:shadow-[0_0_20px_rgba(204,255,0,0.3)]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
