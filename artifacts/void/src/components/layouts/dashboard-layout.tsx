import { Link, useLocation } from "wouter";
import { useClerk } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { signOut } = useClerk();
  
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

  const links = [
    { href: "/dashboard", label: "Overview" },
    { href: "/dashboard/links", label: "Links" },
    { href: "/dashboard/photos", label: "Photos" },
    { href: "/dashboard/appearance", label: "Appearance" },
    { href: "/dashboard/analytics", label: "Analytics" },
  ];

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col md:flex-row">
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border p-6 flex flex-col">
        <div className="mb-8">
          <h2 className="text-2xl font-black tracking-tighter uppercase">VOID</h2>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Creator Studio</p>
        </div>
        
        <nav className="flex-1 space-y-2">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              <a className={`block px-4 py-2 text-sm uppercase tracking-widest font-bold transition-colors ${
                location === link.href ? "bg-white text-black" : "text-muted-foreground hover:text-white hover:bg-white/5"
              }`}>
                {link.label}
              </a>
            </Link>
          ))}
        </nav>

        <div className="mt-8 pt-8 border-t border-border">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-white hover:bg-white/5 uppercase tracking-widest text-xs font-bold rounded-none"
            onClick={() => signOut({ redirectUrl: basePath || "/" })}
          >
            Log Out
          </Button>
        </div>
      </aside>
      
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
