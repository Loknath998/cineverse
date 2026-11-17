import { Link, useNavigate, useRouterState } from "../../lib/router";
import {
  BarChart3,
  Bookmark,
  Calendar,
  Film as FilmIcon,
  Menu,
  Moon,
  Search,
  Sun,
  User,
  X,
} from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { searchAll } from "../../lib/tmdb.api";
import type { MovieCard, PersonCard, CollectionCard } from "../../lib/tmdb-map";

const PRIMARY_NAV = [
  { to: "/discover", label: "Discover" },
  { to: "/filmmakers", label: "Filmmakers" },
  { to: "/collections", label: "Collections" },
  { to: "/library/watched", label: "Diary & Library" },
] as const;

const MOBILE_EXPLORE = [
  { to: "/discover", label: "Discover" },
  { to: "/filmmakers", label: "Filmmakers" },
  { to: "/collections", label: "Collections" },
  { to: "/compare", label: "Compare" },
] as const;

const MOBILE_JOURNAL = [
  { to: "/library/watched", label: "Diary & Watched", icon: Calendar },
  { to: "/library/watchlist", label: "Watchlist", icon: Bookmark },
  { to: "/library/favorites", label: "Favorites", icon: FilmIcon },
  { to: "/library/stats", label: "CineStats", icon: BarChart3 },
] as const;

type SearchResults = { films: MovieCard[]; people: PersonCard[]; collections: CollectionCard[] };
type Theme = "dark" | "light";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return localStorage.getItem("cineverse-theme") === "light" ? "light" : "dark";
}

function syncThemeColorMeta(theme: Theme) {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "light" ? "#faf7f0" : "#1a1712");
}

export function Navbar() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResults>({ films: [], people: [], collections: [] });
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 340 });

  const searchRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s: any) => s.location.pathname });

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("cineverse-theme", theme);
    syncThemeColorMeta(theme);
  }, [theme]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  // Keyboard shortcut '/' to focus search
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes((document.activeElement?.tagName || ""))
      ) {
        e.preventDefault();
        inputRef.current?.focus();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const value = q.trim();
    if (!value) {
      setResults({ films: [], people: [], collections: [] });
      return;
    }
    const timer = window.setTimeout(async () => {
      const found = await searchAll({ data: { q: value } });
      setResults({
        films: found.films.slice(0, 5),
        people: found.people.slice(0, 4),
        collections: found.collections.slice(0, 3),
      });
    }, 280);
    return () => window.clearTimeout(timer);
  }, [q]);

  useEffect(() => {
    const onPointer = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, []);

  const measureDropdown = useCallback(() => {
    const el = formRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const margin = 12;
    const viewportWidth = window.innerWidth;
    const desiredWidth = Math.min(viewportWidth * 0.94, 460);
    const width = Math.min(desiredWidth, viewportWidth - margin * 2);
    let left = rect.right - width;
    left = Math.max(margin, Math.min(left, viewportWidth - width - margin));
    setDropdownPos({ top: rect.bottom + 8, left, width });
  }, []);

  useLayoutEffect(() => {
    if (!searchOpen) return;
    measureDropdown();
    window.addEventListener("resize", measureDropdown);
    window.addEventListener("scroll", measureDropdown, { passive: true });
    return () => {
      window.removeEventListener("resize", measureDropdown);
      window.removeEventListener("scroll", measureDropdown);
    };
  }, [searchOpen, measureDropdown]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const isActive = (to: string) =>
    to === "/" ? pathname === "/" : pathname.startsWith(to.split("/").slice(0, 2).join("/"));

  const isExactOrChild = (to: string) => pathname === to || pathname.startsWith(to + "/");

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    if (q.trim()) {
      navigate({ to: "/discover", search: { q: q.trim() } });
      setSearchOpen(false);
    }
  };

  const hasResults = Boolean(results.films.length || results.people.length || results.collections.length);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/92 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-3 px-3 sm:gap-4 sm:px-6 lg:px-8">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((o) => !o)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          className="grid size-8 shrink-0 place-items-center rounded-xl border border-border/70 bg-surface text-muted-foreground transition hover:border-gold/60 hover:text-foreground md:hidden"
        >
          {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>

        {/* Brand Logotype */}
        <Link
          to="/"
          className="shrink-0 font-display text-sm tracking-[0.16em] whitespace-nowrap sm:text-base sm:tracking-[0.22em]"
        >
          CINE<span className="text-gold">VERSE</span>
        </Link>

        {/* Primary Editorial Navigation (Desktop) */}
        <nav className="ml-2 hidden shrink-0 items-center gap-4 lg:flex xl:gap-5">
          {PRIMARY_NAV.map((n) => {
            const active = isActive(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`relative py-1 font-sans text-xs tracking-wide whitespace-nowrap transition-colors ${
                  active
                    ? "font-medium text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        {/* Search Pill */}
        <div
          ref={searchRef}
          className="relative z-[60] ml-auto min-w-0 max-w-[200px] flex-1 sm:max-w-[280px] md:max-w-[340px] lg:max-w-[380px]"
        >
          <form
            ref={formRef}
            className="flex h-9 items-center gap-2 rounded-full border border-border/70 bg-surface px-3 shadow-sm transition-all focus-within:border-gold/70 focus-within:ring-1 focus-within:ring-gold/30"
            onSubmit={submitSearch}
          >
            <Search className="size-3.5 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              value={q}
              onFocus={() => setSearchOpen(true)}
              onChange={(e) => {
                setQ(e.target.value);
                setSearchOpen(true);
              }}
              placeholder="Search films, filmmakers…"
              aria-label="Search films and filmmakers"
              className="w-full min-w-0 bg-transparent font-sans text-xs text-foreground outline-none placeholder:text-muted-foreground"
            />
            {q ? (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setQ("");
                  setResults({ films: [], people: [], collections: [] });
                }}
                className="grid size-4 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            ) : (
              <kbd className="hidden rounded border border-border/60 bg-surface-2 px-1.5 py-0.5 font-mono text-[0.55rem] text-muted-foreground sm:inline-block">
                /
              </kbd>
            )}
          </form>

          {/* Search Dropdown */}
          {searchOpen && q.trim() && hasResults ? (
            <div
              style={{
                position: "fixed",
                top: dropdownPos.top,
                left: dropdownPos.left,
                width: dropdownPos.width,
              }}
              className="z-[100] max-h-[min(70vh,520px)] overflow-y-auto overscroll-contain rounded-2xl border border-border bg-surface p-2 shadow-2xl shadow-stone-900/15 dark:shadow-black/60"
            >
              {results.films.length ? (
                <div>
                  <div className="label-mono px-2 py-1.5">Films</div>
                  {results.films.map((m) => (
                    <Link
                      key={m.id}
                      to="/movie/$id"
                      params={{ id: String(m.id) }}
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-surface-2"
                    >
                      <div className="flex h-12 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-2">
                        {m.poster ? (
                          <img src={m.poster} alt="" className="size-full object-cover" />
                        ) : (
                          <FilmIcon className="size-3.5 text-muted-foreground" aria-hidden="true" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-display text-xs text-foreground font-medium sm:text-sm">
                          {m.title}
                        </div>
                        <div className="font-mono text-[0.6rem] text-muted-foreground">
                          {m.year} · <span className="text-gold font-medium">★ {m.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : null}

              {results.people.length ? (
                <div className="mt-1 border-t border-border/50 pt-1">
                  <div className="label-mono px-2 py-1.5">Filmmakers & Cast</div>
                  {results.people.map((p) => (
                    <Link
                      key={p.id}
                      to="/person/$id"
                      params={{ id: String(p.id) }}
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-surface-2"
                    >
                      <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-2 ring-1 ring-border/50">
                        {p.profile ? (
                          <img src={p.profile} alt="" className="size-full object-cover" />
                        ) : (
                          <User className="size-4 text-muted-foreground" aria-hidden="true" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-display text-xs text-foreground sm:text-sm font-medium">
                          {p.name}
                        </div>
                        <div className="font-mono text-[0.6rem] text-muted-foreground">{p.role}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : null}

              {results.collections.length ? (
                <div className="mt-1 border-t border-border/50 pt-1">
                  <div className="label-mono px-2 py-1.5">Collections & Sagas</div>
                  {results.collections.map((c) => (
                    <Link
                      key={c.id}
                      to="/collections/$id"
                      params={{ id: String(c.id) }}
                      onClick={() => setSearchOpen(false)}
                      className="block rounded-xl p-2 transition-colors hover:bg-surface-2"
                    >
                      <div className="font-display text-xs text-foreground sm:text-sm">{c.name}</div>
                      <div className="font-mono text-[0.6rem] text-muted-foreground">
                        {c.count || "TMDB"} films
                      </div>
                    </Link>
                  ))}
                </div>
              ) : null}

              <button
                onClick={submitSearch as any}
                className="mt-2 w-full rounded-xl border border-border px-3 py-2 text-left font-mono text-[0.62rem] tracking-wider text-gold hover:bg-surface-2"
              >
                VIEW ALL RESULTS →
              </button>
            </div>
          ) : null}
        </div>

        {/* Stats Direct Link (Desktop) */}
        <Link
          to="/library/stats"
          className={`hidden shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 font-sans text-xs transition-colors md:flex ${
            pathname.startsWith("/library/stats")
              ? "border-gold/60 bg-surface-2 text-foreground font-medium"
              : "border-border/70 bg-surface text-muted-foreground hover:border-gold/50 hover:text-foreground"
          }`}
        >
          <BarChart3 className="size-3 text-gold" />
          <span>Stats</span>
        </Link>

        {/* Day / Night Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-pressed={theme === "light"}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          className="group flex h-8 shrink-0 items-center gap-0.5 rounded-full border border-border/70 bg-surface p-0.5 text-muted-foreground transition hover:border-gold/60"
        >
          <span
            className={`grid size-6 place-items-center rounded-full transition-all duration-200 ${
              theme === "light"
                ? "bg-gold text-primary-foreground shadow-sm"
                : "group-hover:text-gold"
            }`}
          >
            <Sun className="size-3.5" aria-hidden="true" />
          </span>
          <span
            className={`grid size-6 place-items-center rounded-full transition-all duration-200 ${
              theme === "dark" ? "bg-surface-2 text-foreground shadow-sm" : "group-hover:text-gold"
            }`}
          >
            <Moon className="size-3.5" aria-hidden="true" />
          </span>
        </button>

        {/* Profile Avatar */}
        <Link
          to="/profile"
          aria-label="Your cinephile profile"
          className="grid size-8 shrink-0 place-items-center rounded-full border border-border/70 bg-surface text-foreground transition-all hover:border-gold/60 hover:text-gold"
        >
          <User className="size-3.5" />
        </Link>
      </div>

      {/* Mobile Editorial Drawer */}
      {mobileMenuOpen ? (
        <div className="border-t border-border/60 bg-surface p-4 shadow-xl md:hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="space-y-5">
            <div>
              <div className="label-mono mb-2">Explore Cinema</div>
              <div className="grid grid-cols-2 gap-2">
                {MOBILE_EXPLORE.map((n) => (
                  <Link
                    key={n.to}
                    to={n.to}
                    className={`rounded-xl border border-border/60 p-2.5 font-sans text-xs transition-colors ${
                      isActive(n.to)
                        ? "border-gold/60 bg-surface-2 text-foreground font-medium"
                        : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                    }`}
                  >
                    {n.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <div className="label-mono mb-2">Personal Film Journal</div>
              <div className="grid grid-cols-3 gap-2">
                {MOBILE_JOURNAL.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border border-border/60 p-2.5 text-center font-sans text-xs transition-colors ${
                        isExactOrChild(item.to)
                          ? "border-gold/60 bg-surface-2 text-foreground font-medium"
                          : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                      }`}
                    >
                      <Icon className="size-4 text-gold" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border/50 pt-3">
              <Link
                to="/profile"
                className="font-sans text-xs text-muted-foreground hover:text-foreground"
              >
                Profile & Sync Status
              </Link>
              <Link
                to="/about"
                className="font-sans text-xs text-muted-foreground hover:text-foreground"
              >
                About CineVerse
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
