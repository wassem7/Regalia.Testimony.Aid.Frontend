"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { useTestimonies } from "@/hooks/useTestimonies";
import { useProfile } from "@/hooks/useProfile";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { logout } from "@/lib/auth";

function titleForPath(pathname: string): string {
  if (pathname.startsWith("/archive")) return "Archive";
  if (pathname.startsWith("/feed")) return "Live Feed";
  if (pathname.startsWith("/admins")) return "Admins";
  return "Review Queue";
}

function DashboardChrome({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const profile = useProfile();
  const { stats } = useTestimonies();

  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = () => {
    logout();
    router.replace("/login");
  };

  return (
    <div className="shell">
      <Sidebar
        pendingCount={stats.pendingCount}
        profile={profile}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onSignOut={handleSignOut}
      />
      <div className="main">
        <Topbar
          title={titleForPath(pathname)}
          onMenuClick={() => setMenuOpen(true)}
        />
        <div className="content">{children}</div>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = useRequireAuth();

  // Avoid flashing the dashboard before the auth check resolves.
  if (!authed) return null;

  return <DashboardChrome>{children}</DashboardChrome>;
}
