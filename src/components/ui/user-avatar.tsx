import { cn } from "@/lib/utils";

type Props = {
  name: string;
  color?: string;
  size?: number;
  className?: string;
};

/** Avatar with colored background + initials fallback (no image needed). */
export function UserAvatar({ name, color = "var(--primary)", size = 36, className }: Props) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white",
        className
      )}
      style={{ width: size, height: size, background: color, fontSize: size * 0.4 }}
    >
      {initials}
    </span>
  );
}
