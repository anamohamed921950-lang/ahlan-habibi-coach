import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home,
  CalendarDays,
  MessageCircleHeart,
  Camera,
  Sparkles,
  Languages,
  UserCog,
} from "lucide-react";
import { useT, useLang } from "@/lib/i18n";
import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  const { t, lang } = useT();
  const setLang = useLang((s) => s.setLang);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const nav = [
    { to: "/", icon: Home, label: t.home },
    { to: "/plan", icon: CalendarDays, label: t.plan },
    { to: "/habits", icon: Sparkles, label: t.habits },
    { to: "/coach", icon: MessageCircleHeart, label: t.coach },
    { to: "/meal", icon: Camera, label: t.meal },
  ];

  return (
    <div className="min-h-screen pb-28">
      <header className="sticky top-0 z-20 backdrop-blur-md bg-background/70 border-b border-border/50">
        <div className="mx-auto max-w-md px-5 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="inline-block w-6 h-6 rounded-full bg-gradient-sunset shadow-soft" />
            <span className="font-display text-xl text-foreground tracking-tight">{t.appName}</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to="/insights"
              className="text-[11px] uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors rounded-full px-2.5 py-1.5"
            >
              {t.insights}
            </Link>
            <Link
              to="/profile"
              className="inline-flex items-center justify-center w-9 h-9 rounded-full text-muted-foreground hover:text-primary transition-colors bg-secondary/60"
              aria-label="Edit profile"
            >
              <UserCog className="w-4 h-4" />
            </Link>
            <button
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-primary transition-colors rounded-full px-2.5 h-9 bg-secondary/60"
              aria-label="Toggle language"
            >
              <Languages className="w-3.5 h-3.5" />
              {lang === "ar" ? "EN" : "ع"}
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-md px-5 pt-4">{children}</main>
      <nav className="fixed bottom-3 inset-x-3 z-30 mx-auto max-w-md bg-card/95 backdrop-blur-xl border border-border/60 rounded-full shadow-ink">
        <div className="px-2 py-1.5 flex items-center justify-between">
          {nav.map(({ to, icon: Icon, label }) => {
            const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center gap-0.5 flex-1 py-1.5 rounded-full transition-all ${active ? "text-primary-foreground" : "text-muted-foreground"}`}
              >
                <div className={`px-3 py-1.5 rounded-full transition-all inline-flex items-center gap-1.5 ${active ? "bg-gradient-primary shadow-glow" : ""}`}>
                  <Icon className="w-4 h-4" strokeWidth={active ? 2.4 : 1.8} />
                  {active ? <span className="text-[11px] font-semibold">{label}</span> : null}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}