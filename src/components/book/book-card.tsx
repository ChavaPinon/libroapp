import Link from "next/link";
import type { UserBook } from "@/lib/types";
import { SHELF_LABELS } from "@/lib/types";
import { BookCover } from "./book-cover";
import { StarRating } from "@/components/ui/star-rating";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT = {
  want: "default",
  reading: "primary",
  read: "success",
  dnf: "danger",
  reread: "warning",
} as const;

export function BookCard({ item }: { item: UserBook }) {
  const { book, status, rating, currentPage } = item;
  const pct = book.pages && currentPage ? (currentPage / book.pages) * 100 : 0;

  return (
    <Link href={`/book/${book.id}`} className="group block">
      <div className="relative">
        <BookCover src={book.coverUrl} title={book.title} className="transition-transform group-hover:-translate-y-1" />
        <div className="absolute left-1.5 top-1.5">
          <Badge variant={STATUS_VARIANT[status]}>{SHELF_LABELS[status]}</Badge>
        </div>
      </div>
      <div className="mt-2 space-y-1">
        <h3 className="line-clamp-1 text-sm font-semibold text-text group-hover:text-primary">
          {book.title}
        </h3>
        <p className="line-clamp-1 text-xs text-muted">{book.author}</p>
        {status === "reading" && book.pages ? (
          <ProgressBar value={pct} showLabel />
        ) : rating ? (
          <StarRating value={rating} size={13} />
        ) : (
          <div className="h-[18px]" />
        )}
      </div>
    </Link>
  );
}
