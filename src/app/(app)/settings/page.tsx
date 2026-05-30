import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { getCurrentUser } from "@/lib/supabase/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { AppearanceSection } from "./appearance-section";
import { ProfileForm } from "./profile-form";
import { SignOutButton } from "./sign-out-button";

export default async function SettingsPage() {
  const user = isSupabaseConfigured ? await getCurrentUser() : null;

  return (
    <div className="space-y-12">
      <PageHeader title="Ajustes" subtitle="Tu cuenta y la apariencia de la app" />

      {/* ---- Account / profile ---- */}
      {user?.profile && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Tu perfil</h2>
            <Link
              href={`/u/${user.profile.username}`}
              className="flex items-center gap-1 text-sm text-accent hover:underline"
            >
              Ver perfil público <ExternalLink size={13} />
            </Link>
          </div>
          <ProfileForm
            initial={{
              name: user.profile.name,
              username: user.profile.username,
              bio: user.profile.bio,
              avatarColor: user.profile.avatarColor,
              isPublic: user.profile.isPublic,
            }}
          />
          <div className="mt-4 flex items-center justify-between rounded-app border border-border-app bg-surface-1 p-4">
            <div>
              <p className="text-sm font-medium">Sesión</p>
              <p className="text-xs text-muted">{user.email}</p>
            </div>
            <SignOutButton />
          </div>
        </section>
      )}

      {isSupabaseConfigured && !user && (
        <section className="rounded-app border border-dashed border-border-app py-10 text-center">
          <p className="text-muted">Inicia sesión para editar tu perfil.</p>
          <Link
            href="/login"
            className="mt-4 inline-block rounded-app bg-primary px-4 py-2 text-sm font-medium text-primary-fg hover:bg-primary-hover"
          >
            Iniciar sesión
          </Link>
        </section>
      )}

      {/* ---- Appearance / theme ---- */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Apariencia</h2>
        <AppearanceSection />
      </section>
    </div>
  );
}
