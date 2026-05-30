import { cn } from "@/lib/utils";

type Props = {
  value: number; // 0..100
  className?: string;
  showLabel?: boolean;
};

export function ProgressBar({ value, className, showLabel }: Props) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full bg-progress transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs tabular-nums text-muted w-9 text-right">{Math.round(pct)}%</span>
      )}
    </div>
  );
}
