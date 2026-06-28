"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, BarChart3, Settings, LayoutDashboard, Trophy, Package, LogOut, User } from "lucide-react";
import { signOut } from "next-auth/react";

export function Sidebar() {
  const pathname = usePathname();

  if (pathname === "/login") return null;

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/work-entries", label: "Work Entries", icon: Briefcase },
    { href: "/salary-review", label: "Salary Review", icon: Trophy },
    { href: "/releases", label: "Releases", icon: Package },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="w-64 border-r border-border/50 bg-sidebar flex flex-col">
      <div className="flex h-14 items-center border-b border-border/50 px-4 font-bold text-lg text-primary-foreground tracking-tight">
        <LayoutDashboard className="mr-2 h-5 w-5 text-accent" />
        Dev Dashboard
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname.startsWith(link.href);
          return (
            <Link 
              key={link.href}
              href={link.href} 
              className={`flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300 relative group overflow-hidden
                ${isActive 
                  ? "bg-accent/15 text-accent" 
                  : "text-muted-foreground hover:bg-accent/5 hover:text-accent"
                }`}
            >
              {/* Active Glow Bar */}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
              )}
              {/* Hover Glow Bar */}
              {!isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent/50 rounded-r-full -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
              )}
              
              <Icon className={`mr-3 h-4 w-4 ${isActive ? "text-accent drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" : ""}`} /> 
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border/40 bg-card/30">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-9 h-9 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent shadow-inner">
            <User className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-primary-foreground leading-none mb-1">Developer</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Pro Plan</span>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-destructive/5 border border-destructive/10 px-3 py-2 text-sm font-medium text-destructive/80 hover:bg-destructive hover:text-destructive-foreground hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all duration-300"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </div>
  );
}
