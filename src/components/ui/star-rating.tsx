"use client";

import { Star, StarHalf } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  value: number; // 0..5, allows .5 steps
  onChange?: (value: number) => void;
  size?: number;
  className?: string;
};

/** Star rating. Read-only when no onChange; interactive (with half steps) otherwise. */
export function StarRating({ value, onChange, size = 16, className }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? value;
  const interactive = !!onChange;

  return (
    <div className={cn("inline-flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = display >= i;
        const half = !filled && display >= i - 0.5;
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            aria-label={`${i} estrellas`}
            className={cn(
              "relative leading-none",
              interactive && "cursor-pointer hover:scale-110 transition-transform"
            )}
            onMouseMove={
              interactive
                ? (e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const isLeft = e.clientX - rect.left < rect.width / 2;
                    setHover(isLeft ? i - 0.5 : i);
                  }
                : undefined
            }
            onMouseLeave={interactive ? () => setHover(null) : undefined}
            onClick={interactive ? () => onChange?.(hover ?? i) : undefined}
          >
            {half ? (
              <span className="relative inline-block" style={{ width: size, height: size }}>
                <Star size={size} className="absolute inset-0 text-subtle" strokeWidth={1.5} />
                <StarHalf
                  size={size}
                  className="absolute inset-0 fill-star text-star"
                  strokeWidth={1.5}
                />
              </span>
            ) : (
              <Star
                size={size}
                strokeWidth={1.5}
                className={cn(filled ? "fill-star text-star" : "text-subtle")}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
