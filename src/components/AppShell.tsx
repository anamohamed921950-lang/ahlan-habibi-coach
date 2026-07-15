import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Sparkles, MessageCircleHeart, Camera, TrendingUp, Languages } from "lucide-react";
import { useT, useLang } from "@/lib/i18n";
import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  const { t, lang } = useT();
  const setLang = useLang((s) => s.setLang);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const nav = [
    { to: "/", icon: Home, label: t.home },
    { to: "/habits", icon: Sparkles, label: t.habits },
    { to: "/coach", icon: MessageCircleHeart, label: t.coach },
    { to: "/meal", icon: Camera, label: t.meal },
    { to: "/insights", icon: TrendingUp, label: t.insights },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-20 backdrop-blur-md bg-background/70 border-b border-border/50">
        <div className="mx-auto max-w-md px-5 py-3 flex items-center justify-between">
          <div className="font-display text-xl text-primary">{t.appName}</div>
          <button
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors rounded-full px-3 py-1.5 bg-secondary/50"
            aria-label="Toggle language"
          >
            <Languages className="w-3.5 h-3.5" />
            {lang === "ar" ? "EN" : "ع"}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-md px-5 pt-4">{children}</main>

      <nav className="fixed bottom-0 inset-x-0 z-30 bg-background/85 backdrop-blur-xl border-t border-border/60">
        <div className="mx-auto max-w-md px-2 py-2 flex items-center justify-between">
          {nav.map(({ to, icon: Icon, label }) => {
            const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center gap-0.5 flex-1 py-1.5 rounded-xl transition-all ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all ${active ? "bg-gradient-primary shadow-glow text-primary-foreground" : ""}`}>
                  <Icon className="w-5 h-5" strokeWidth={active ? 2.2 : 1.7} />
                </div>
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}