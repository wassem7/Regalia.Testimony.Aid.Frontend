"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { initials } from "@/lib/format";
import type { Profile } from "@/lib/types";
import { AdminsIcon, ArchiveIcon, FeedIcon, QueueIcon, SignOutIcon } from "./icons";

interface Props {
  pendingCount: number;
  profile: Profile | null;
  open: boolean;
  onClose: () => void;
  onSignOut: () => void;
}

const NAV_SECTIONS = [
  {
    section: "Workspace",
    items: [
      { href: "/queue", label: "Review Queue", icon: QueueIcon },
      { href: "/archive", label: "Archive", icon: ArchiveIcon },
      { href: "/feed", label: "Live Feed", icon: FeedIcon },
    ],
  },
  {
    section: "Administration",
    items: [{ href: "/admins", label: "Admins", icon: AdminsIcon }],
  },
] as const;

export default function Sidebar({
  pendingCount,
  profile,
  open,
  onClose,
  onSignOut,
}: Props) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <>
      <div
        className={"side-backdrop" + (open ? " on" : "")}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={"side" + (open ? " open" : "")}>
      <div className="brandrow">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="brand-logo" src="/logo.png" alt="" />
        <div>
          <div className="brand-name">Testimony Aid</div>
          <div className="brand-sub">Review portal</div>
        </div>
      </div>

      {NAV_SECTIONS.map((group) => (
        <div key={group.section}>
          <div className="navsec">{group.section}</div>
          {group.items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={"navitem" + (isActive(item.href) ? " on" : "")}
              >
                <Icon />
                <span className="f1">{item.label}</span>
                {item.href === "/queue" && (
                  <span className="navbadge">{pendingCount}</span>
                )}
              </Link>
            );
          })}
        </div>
      ))}

      <div className="navspacer" />
      <div className="who">
        <div className="av who-avatar">
          {profile?.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="who-avatar-img"
              src={profile.imageUrl}
              alt={profile.name}
            />
          ) : profile ? (
            initials(profile.name)
          ) : (
            "··"
          )}
        </div>
        <div className="f1 minw0">
          <div className="who-name">{profile?.name ?? "Loading…"}</div>
          <div className="who-role">{profile?.role ?? ""}</div>
        </div>
        <button className="iconbtn" title="Sign out" onClick={onSignOut}>
          <SignOutIcon />
        </button>
      </div>
      </aside>
    </>
  );
}
