"use client";

import { BookText } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  src?: string;
  title: string;
  className?: string;
};

/**
 * Book cover with graceful fallback to a generated placeholder when the
 * image is missing or fails to load. Uses a plain <img> because covers come
 * from arbitrary external hosts (Open Library); aspect ratio is locked 2:3.
 */
export function BookCover({ src, title, className }: Props) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={cn(
        "relative aspect-[2/3] w-full overflow-hidden rounded-md bg-surface-2 shadow-md ring-1 ring-black/20",
        className
      )}
    >
      {src && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={`Portada de ${title}`}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-3 text-center">
          <BookText className="text-subtle" size={24} />
          <span className="line-clamp-3 text-xs font-medium text-muted">{title}</span>
        </div>
      )}
    </div>
  );
}
