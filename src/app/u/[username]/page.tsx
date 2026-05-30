import Link from "next/link";
import { notFound } from "next/navigation";
import { BookHeart, Lock, Share2, UserPlus } from "lucide-react";
import { MY_BOOKS, PROFILE, REVIEWS } from "@/lib/mock-data";
import { BookCard } from "@/components/book/book-card";
import { UserAvatar } from "@/components/ui/user-avatar";
import { StarRating } from "@/components/ui/star-rating";
import { SpoilerText } from "@/components/book/spoiler-text";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getPublicProfile } from "@/lib/data/profile";
import { computeStats } from "@/lib/data/stats";
import { relativeTime } from "@/lib/utils";
import type { Review, UserBook } from "@/lib/types";
import { FollowButton } from "./follow-button";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="flex h-14 items-center px-4 md:px-8">
        <Link href="/home" className="flex items-center gap-2">
          <BookHeart className="text-primary" size={22} />
          <span className="font-bold">LibroApp</span>
        </Link>
      </header>
      <div className="mx-auto w-full max-w-5xl px-4 pb-16 md:px-8">{children}</div>
    </div>
  );
}

export default async function PublicProfilePage(props: PageProps<"/u/[username]">) {
  const { username } = await props.params;
  const demo = !isSupabaseConfigured;

  // ---- Resolve profile data (real or mock) ----------------------------------
  let view: {
    name: string;
    username: string;
    bio: string | null;
    avatarColor: string;
    followers: number;
    following: number;
    library: UserBook[];
    reviews: Review[];
    isPublic: boolean;
    id: string;
    isSelf: boolean;
    isFollowing: boolean;
    viewerLoggedIn: boolean;
  };

  if (demo) {
    if (username !== PROFILE.username) notFound();
    view = {
      name: PROFILE.name,
      username: PROFILE.username,
      bio: PROFILE.bio,
      avatarColor: PROFILE.avatarColor,
      followers: PROFILE.followers,
      following: PROFILE.following,
      library: MY_BOOKS,
      reviews: REVIEWS.filter((r) => r.user.username === username),
      isPublic: true,
      id: "demo",
      isSelf: false,
      isFollowing: false,
      viewerLoggedIn: false,
    };
  } else {
    const profile = await getPublicProfile(username);
    if (!profile) notFound();
    view = {
      name: profile.name,
      username: profile.username,
      bio: profile.bio,
      avatarColor: profile.avatarColor,
      followers: profile.followers,
      following: profile.following,
      library: profile.library,
      reviews: profile.reviews,
      isPublic: profile.isPublic,
      id: profile.id,
      isSelf: profile.isSelf,
      isFollowing: profile.isFollowing,
      viewerLoggedIn: profile.viewerLoggedIn,
    };
  }

  // Private profile: show a minimal card, no library/reviews.
  if (!view.isPublic) {
    return (
      <Shell>
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <UserAvatar name={view.name} color={view.avatarColor} size={72} />
          <h1 className="text-xl font-bold">{view.name}</h1>
          <p className="flex items-center gap-1.5 text-sm text-muted">
            <Lock size={14} /> Este perfil es privado.
          </p>
        </div>
      </Shell>
    );
  }

  const read = view.library.filter((b) => b.status === "read");
  const stats = computeStats(view.library, new Date().getFullYear());

  return (
    <Shell>
      <div className="flex flex-col items-center gap-4 py-8 text-center sm:flex-row sm:text-left">
        <UserAvatar name={view.name} color={view.avatarColor} size={88} />
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{view.name}</h1>
          <p className="text-sm text-muted">@{view.username}</p>
          {view.bio && <p className="mt-2 max-w-lg text-sm">{view.bio}</p>}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-muted sm:justify-start">
            <span>
              <b className="text-text">{view.followers}</b> seguidores
            </span>
            <span>
              <b className="text-text">{view.following}</b> siguiendo
            </span>
            <span>
              <b className="text-text">{stats.totalRead}</b> leídos
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {demo ? (
            <button className="flex items-center gap-1.5 rounded-app bg-primary px-4 py-2 text-sm font-medium text-primary-fg hover:bg-primary-hover">
              <UserPlus size={15} /> Seguir
            </button>
          ) : (
            <FollowButton
              targetId={view.id}
              targetUsername={view.username}
              initialFollowing={view.isFollowing}
              isSelf={view.isSelf}
              viewerLoggedIn={view.viewerLoggedIn}
            />
          )}
          <button className="flex items-center gap-1.5 rounded-app border border-border-app px-3 py-2 text-sm hover:bg-surface-2">
            <Share2 size={15} />
          </button>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Este año", `${stats.booksThisYear}`],
          ["Puntuación media", stats.avgRating != null ? `${stats.avgRating}` : "—"],
          ["Páginas", stats.pagesThisYear.toLocaleString("es")],
          ["Leídos", `${stats.totalRead}`],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-app border border-border-app bg-surface-1 p-4 text-center"
          >
            <p className="text-xl font-bold tabular-nums">{value}</p>
            <p className="text-xs text-muted">{label}</p>
          </div>
        ))}
      </div>

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-semibold">Leídos recientemente</h2>
        {read.length === 0 ? (
          <p className="rounded-app border border-dashed border-border-app py-10 text-center text-sm text-muted">
            Aún no hay libros leídos en este perfil.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
            {read.map((item) => (
              <BookCard key={item.book.id} item={item} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Reseñas</h2>
        {view.reviews.length === 0 ? (
          <p className="rounded-app border border-dashed border-border-app py-10 text-center text-sm text-muted">
            Sin reseñas todavía.
          </p>
        ) : (
          <div className="space-y-3">
            {view.reviews.map((r) => (
              <article key={r.id} className="rounded-app border border-border-app bg-surface-1 p-4">
                <div className="flex items-center gap-2">
                  <Link href={`/book/${r.book.id}`} className="text-sm font-semibold hover:text-primary">
                    {r.book.title}
                  </Link>
                  <StarRating value={r.rating} size={14} />
                  <span className="ml-auto text-xs text-subtle">{relativeTime(r.createdAt)}</span>
                </div>
                <div className="mt-2 text-sm">
                  {r.hasSpoilers ? <SpoilerText>{r.body}</SpoilerText> : <p>{r.body}</p>}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </Shell>
  );
}
