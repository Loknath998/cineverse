import { createRoute } from "../lib/route";
import { Link } from "../lib/router";
import { useState } from "react";
import type { FormEvent } from "react";
import { Cloud, HardDrive, LogOut, Mail, TriangleAlert } from "lucide-react";

import { SectionHeader } from "../components/site/media";
import { useAuth } from "../lib/auth";
import { useLibrary } from "../lib/library";
import type { Profile } from "../lib/library";

export const Route = createRoute({
  path: "/profile",
  head: () => ({
    meta: [
      { title: "Your profile — CineVerse" },
      {
        name: "description",
        content: "Your CineVerse profile: taste summary, counts and viewing preferences.",
      },
      { property: "og:title", content: "Your profile — CineVerse" },
      {
        property: "og:description",
        content: "Manage your CineVerse identity and see your taste at a glance.",
      },
    ],
  }),
  component: ProfilePage,
});

function AuthPanel() {
  const { configured, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    const result = mode === "signin" ? await signIn(email, password) : await signUp(email, password);
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.needsEmailConfirmation) {
      setNotice("Check your inbox to confirm your email, then sign in.");
      setMode("signin");
    }
  };

  return (
    <div className="rounded-xl border border-border/60 bg-surface p-6">
      <div className="label-gold">{configured ? "Sign in to sync your library" : "Account sync unavailable"}</div>
      <h1 className="mt-3 font-display text-2xl text-foreground sm:text-3xl">
        {configured ? "Your CineVerse account" : "Running in local-only mode"}
      </h1>
      <p className="mt-2 max-w-md font-sans text-sm leading-relaxed text-muted-foreground">
        {configured
          ? "Sign in with email and password to keep your watchlist, ratings and notes backed up and available on any device."
          : "This deployment hasn't been connected to Supabase yet, so your watchlist, ratings and notes are saved to this browser only. See README.md to enable account sync."}
      </p>

      {configured ? (
        <form onSubmit={submit} className="mt-6 grid max-w-sm gap-3">
          <div className="flex gap-1 rounded-full border border-border/70 bg-background p-1 text-center">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setError(null);
                  setNotice(null);
                }}
                className={`flex-1 rounded-full py-1.5 font-mono text-[0.62rem] tracking-wider transition-colors ${
                  mode === m ? "bg-gold text-background" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "signin" ? "SIGN IN" : "CREATE ACCOUNT"}
              </button>
            ))}
          </div>

          <label className="block">
            <span className="label-mono">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 font-sans text-sm text-foreground outline-none focus:border-gold"
            />
          </label>
          <label className="block">
            <span className="label-mono">Password</span>
            <input
              type="password"
              required
              minLength={6}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 font-sans text-sm text-foreground outline-none focus:border-gold"
            />
          </label>

          {error ? <p className="font-sans text-xs text-destructive">{error}</p> : null}
          {notice ? <p className="font-sans text-xs text-gold">{notice}</p> : null}

          <button
            type="submit"
            disabled={busy}
            className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-5 py-2.5 font-sans text-xs tracking-wide text-background transition-colors hover:bg-gold-soft disabled:opacity-50"
          >
            <Mail className="size-3.5" />
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
          <p className="font-sans text-[0.7rem] text-muted-foreground">
            Your CineVerse activity here in this browser will carry over into your new account.
          </p>
        </form>
      ) : null}
    </div>
  );
}

function ProfilePage() {
  const { user, configured, signOut } = useAuth();
  const { ready, watched, watchlist, favorites, ratings, activity, profile, saveProfile, syncing, cloudSynced, syncError } =
    useLibrary();
  const [editing, setEditing] = useState(false);

  const save = (next: Profile) => {
    saveProfile(next);
    setEditing(false);
  };

  const ratingValues = Object.values(ratings);
  const avg = ratingValues.length
    ? (ratingValues.reduce((s, v) => s + v, 0) / ratingValues.length).toFixed(1)
    : "—";

  if (!user) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-8">
        <AuthPanel />

        <section className="mt-14">
          <SectionHeader
            title="Your numbers"
            subtitle="Saved to this browser"
            action={
              <Link to="/library/stats" className="label-gold hover:text-gold">
                Full journal
              </Link>
            }
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {(
              [
                ["Watched", ready ? String(watched.length) : "—"],
                ["Watchlist", ready ? String(watchlist.length) : "—"],
                ["Favourites", ready ? String(favorites.length) : "—"],
                ["Average rating", ready ? avg : "—"],
              ] as [string, string][]
            ).map(([k, v]) => (
              <div key={k} className="rounded-xl border border-border/60 bg-surface p-5">
                <div className="label-mono">{k}</div>
                <div className="mt-2 font-display text-3xl text-gold">{v}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-8">
      <section className="grid gap-8 md:grid-cols-[200px_1fr]">
        <div className="grid aspect-square place-items-center rounded-xl bg-gradient-to-br from-gold-soft/60 to-surface-2 font-display text-5xl text-background ring-1 ring-border/60">
          {profile.name.slice(0, 1).toUpperCase()}
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="label-gold">Member profile</div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[0.58rem] tracking-wider ${
                syncError
                  ? "border-destructive/50 text-destructive"
                  : cloudSynced
                    ? "border-gold/50 text-gold"
                    : "border-border text-muted-foreground"
              }`}
            >
              {syncError ? (
                <TriangleAlert className="size-3" />
              ) : cloudSynced ? (
                <Cloud className="size-3" />
              ) : (
                <HardDrive className="size-3" />
              )}
              {syncError ? "SYNC FAILED" : cloudSynced ? (syncing ? "SYNCING…" : "SYNCED") : "LOCAL ONLY"}
            </span>
          </div>

          {syncError ? (
            <p className="mt-2 max-w-md font-sans text-xs leading-relaxed text-destructive">
              Couldn't sync to your account: {syncError} Your changes are still saved to this browser — see{" "}
              <span className="font-mono">supabase/schema.sql</span> and the README's Supabase setup steps.
            </p>
          ) : null}

          {editing ? (
            <form
              className="mt-4 grid max-w-lg gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                const form = new FormData(e.currentTarget);
                save({
                  name: String(form.get("name") || profile.name),
                  handle: String(form.get("handle") || profile.handle),
                  bio: String(form.get("bio") || ""),
                  favouriteEra: String(form.get("favouriteEra") || profile.favouriteEra),
                });
              }}
            >
              {(
                [
                  ["name", "Display name", profile.name],
                  ["handle", "Handle", profile.handle],
                  ["favouriteEra", "Favourite era", profile.favouriteEra],
                ] as const
              ).map(([field, label, value]) => (
                <label key={field} className="block">
                  <span className="label-mono">{label}</span>
                  <input
                    name={field}
                    defaultValue={value}
                    className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 font-sans text-sm text-foreground outline-none focus:border-gold"
                  />
                </label>
              ))}
              <label className="block">
                <span className="label-mono">Bio</span>
                <textarea
                  name="bio"
                  defaultValue={profile.bio}
                  rows={3}
                  className="mt-1 w-full resize-none rounded-xl border border-border bg-surface px-3 py-2 font-sans text-sm text-foreground outline-none focus:border-gold"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  className="rounded-xl bg-gold px-5 py-2.5 font-sans text-xs tracking-wide text-background hover:bg-gold-soft"
                >
                  Save profile
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="rounded-xl border border-border px-5 py-2.5 font-sans text-xs tracking-wide text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <h1 className="mt-3 font-display text-4xl text-foreground">{profile.name}</h1>
              <div className="mt-2 font-mono text-[0.65rem] tracking-wider text-muted-foreground">
                {profile.handle} · favours the {profile.favouriteEra}
              </div>
              {user.email ? (
                <div className="mt-1 font-mono text-[0.65rem] tracking-wider text-muted-foreground">{user.email}</div>
              ) : null}
              <p className="mt-4 max-w-xl font-sans text-sm leading-relaxed text-muted-foreground">{profile.bio}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                <button
                  onClick={() => setEditing(true)}
                  className="rounded-xl border border-border bg-surface px-5 py-2.5 font-sans text-xs tracking-wide text-foreground hover:border-gold/60"
                >
                  Edit profile
                </button>
                {configured ? (
                  <button
                    onClick={() => signOut()}
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-5 py-2.5 font-sans text-xs tracking-wide text-muted-foreground hover:border-destructive/60 hover:text-destructive"
                  >
                    <LogOut className="size-3.5" />
                    Sign out
                  </button>
                ) : null}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="mt-14">
        <SectionHeader
          title="Your numbers"
          subtitle="Live from your library"
          action={
            <Link to="/library/stats" className="label-gold hover:text-gold">
              Full journal
            </Link>
          }
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {(
            [
              ["Watched", ready ? String(watched.length) : "—"],
              ["Watchlist", ready ? String(watchlist.length) : "—"],
              ["Favourites", ready ? String(favorites.length) : "—"],
              ["Average rating", ready ? avg : "—"],
            ] as [string, string][]
          ).map(([k, v]) => (
            <div key={k} className="rounded-xl border border-border/60 bg-surface p-5">
              <div className="label-mono">{k}</div>
              <div className="mt-2 font-display text-3xl text-gold">{v}</div>
            </div>
          ))}
        </div>
      </section>

      {ready && favorites.length ? (
        <section className="mt-14">
          <SectionHeader title="Favourite four" subtitle="Pinned to your profile" />
          <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
            {favorites.slice(0, 8).map((f) => (
              <Link key={f.id} to="/movie/$id" params={{ id: String(f.id) }} className="w-32 shrink-0">
                <div className="aspect-[2/3] overflow-hidden rounded-xl ring-1 ring-border/60 hover:ring-gold/60">
                  {f.poster ? (
                    <img src={f.poster} alt={f.title} loading="lazy" className="size-full object-cover" />
                  ) : null}
                </div>
                <div className="mt-2 font-display text-xs text-foreground">{f.title}</div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {ready && activity.length ? (
        <section className="mt-14">
          <SectionHeader title="Latest activity" />
          <ul className="divide-y divide-border/50 rounded-xl border border-border/60 bg-surface">
            {activity.slice(0, 6).map((a, i) => (
              <li key={`${a.id}-${a.at}-${i}`} className="flex items-center gap-3 px-4 py-3">
                <Link to="/movie/$id" params={{ id: String(a.id) }} className="font-display text-xs text-foreground hover:text-gold">
                  {a.title}
                </Link>
                <span className="ml-auto font-mono text-[0.6rem] text-muted-foreground">
                  {a.kind === "rated" ? `rated ${a.value}/10` : a.kind}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
