import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

import { Coins, LogOut, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

type NavItem = { to: string; label: string; icon: ReactNode };

export function AppShell({
  title,
  subtitle,
  nav,
  user,
  children,
}: {
  title: string;
  subtitle?: string;
  nav: NavItem[];
  user?: { nombre: string; xp?: number; monedas?: number; nivel?: number } | null;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const router = useRouter();

  async function handleSignOut() {
    await supabase.auth.signOut();
    await router.invalidate();
    navigate({ to: "/" });
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-7xl flex-col px-4 py-6 sm:px-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2">
          <img src="/Hispania-Favicon.png" alt="Hispania Quest" className="h-10 w-10 rounded-xl object-contain bg-white/80 shadow-glow" />
          <div className="min-w-0">
            <div className="font-display text-lg font-black leading-none">Hispania Quest</div>
            {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
          </div>
        </Link>
        <div className="flex items-center gap-2">
          {user && (
            <div className="hidden sm:flex items-center gap-2 rounded-full glass px-3 py-1.5 text-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-semibold">{user.xp ?? 0}</span>
              <span className="text-muted-foreground">XP</span>
              <span className="mx-1 h-4 w-px bg-border" />
              <Coins className="h-4 w-4 text-amber-500" />
              <span className="font-semibold">{user.monedas ?? 0}</span>
            </div>
          )}
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-sm font-semibold hover:bg-white/70"
          >
            <LogOut className="h-4 w-4" /> Salir
          </button>
        </div>
      </header>

      {nav.length > 0 && (
        <nav className="mb-6 flex flex-wrap gap-2">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeProps={{ className: "bg-brand text-primary-foreground shadow-glow" }}
              inactiveProps={{ className: "glass hover:bg-white/70 text-foreground" }}
              activeOptions={{ exact: n.to === "/alumno" || n.to === "/profesor" }}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition"
            >
              {n.icon}
              {n.label}
            </Link>
          ))}
        </nav>
      )}

      <h1 className="mb-6 font-display text-2xl font-black sm:text-3xl">{title}</h1>

      <div className="flex-1">{children}</div>
    </div>
  );
}
