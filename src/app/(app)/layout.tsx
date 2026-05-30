import { Sidebar } from "@/components/shell/sidebar";
import { Topbar } from "@/components/shell/topbar";
import { BottomNav } from "@/components/shell/bottom-nav";
import { getCurrentUser } from "@/lib/supabase/auth";
import type { MenuUser } from "@/components/shell/user-menu";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const current = await getCurrentUser();
  const menuUser: MenuUser = current?.profile
    ? {
        name: current.profile.name,
        username: current.profile.username,
        avatarColor: current.profile.avatarColor,
      }
    : null;

  return (
    <div className="flex min-h-screen">
      <Sidebar username={menuUser?.username ?? null} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar user={menuUser} />
        <main className="flex-1 px-4 pb-24 pt-6 md:px-6 md:pb-10">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
