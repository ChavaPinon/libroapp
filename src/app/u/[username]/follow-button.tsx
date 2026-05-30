"use client";

import { useState, useTransition } from "react";
import { Check, UserPlus } from "lucide-react";
import { toggleFollow } from "./follow-actions";
import { cn } from "@/lib/utils";

export function FollowButton({
  targetId,
  targetUsername,
  initialFollowing,
  isSelf,
  viewerLoggedIn,
}: {
  targetId: string;
  targetUsername: string;
  initialFollowing: boolean;
  isSelf: boolean;
  viewerLoggedIn: boolean;
}) {
  const [following, setFollowing] = useState(initialFollowing);
  const [pending, startTransition] = useTransition();

  // Your own profile → edit link instead of follow.
  if (isSelf) {
    return (
      <a
        href="/settings"
        className="rounded-app border border-border-app px-4 py-2 text-sm font-medium hover:bg-surface-2"
      >
        Editar perfil
      </a>
    );
  }

  if (!viewerLoggedIn) {
    return (
      <a
        href="/login"
        className="flex items-center gap-1.5 rounded-app bg-primary px-4 py-2 text-sm font-medium text-primary-fg hover:bg-primary-hover"
      >
        <UserPlus size={15} /> Seguir
      </a>
    );
  }

  function onClick() {
    const prev = following;
    setFollowing(!prev); // optimistic
    startTransition(async () => {
      const res = await toggleFollow(targetId, targetUsername, prev);
      if (!res.ok) setFollowing(prev);
    });
  }

  return (
    <button
      onClick={onClick}
      disabled={pending}
      className={cn(
        "flex items-center gap-1.5 rounded-app px-4 py-2 text-sm font-medium disabled:opacity-60",
        following
          ? "border border-border-app hover:bg-surface-2"
          : "bg-primary text-primary-fg hover:bg-primary-hover"
      )}
    >
      {following ? (
        <>
          <Check size={15} /> Siguiendo
        </>
      ) : (
        <>
          <UserPlus size={15} /> Seguir
        </>
      )}
    </button>
  );
}
