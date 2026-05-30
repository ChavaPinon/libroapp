import Link from "next/link";
import { BookHeart, Search } from "lucide-react";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { UserMenu, type MenuUser } from "./user-menu";

export function Topbar({ user }: { user: MenuUser }) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border-app bg-bg/80 px-4 backdrop-blur-md md:px-6">
      {/* Mobile logo */}
      <Link href="/home" className="flex items-center gap-2 md:hidden">
        <BookHeart className="text-primary" size={22} />
        <span className="font-bold">LibroApp</span>
      </Link>

      <Link
        href="/search"
        className="ml-auto flex h-9 max-w-md flex-1 items-center gap-2 rounded-app border border-border-app bg-surface-1 px-3 text-sm text-subtle hover:border-primary/40 md:ml-0"
      >
        <Search size={16} />
        <span className="truncate">Buscar libros, autores, lectores…</span>
        <kbd className="ml-auto hidden rounded bg-surface-2 px-1.5 py-0.5 text-[10px] text-muted sm:inline">
          ⌘K
        </kbd>
      </Link>

      <div className="ml-auto flex items-center gap-1 md:ml-0">
        <ThemeSwitcher />
        <UserMenu user={user} />
      </div>
    </header>
  );
}
