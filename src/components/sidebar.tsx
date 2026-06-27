"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, BarChart3, Settings, LayoutDashboard, Trophy, Package } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

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
              className={`flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200 
                ${isActive 
                  ? "bg-accent/20 text-accent shadow-[0_0_15px_rgba(59,130,246,0.15)]" 
                  : "text-muted-foreground hover:bg-accent/10 hover:text-accent hover:shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                }`}
            >
              <Icon className="mr-3 h-4 w-4" /> {link.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
