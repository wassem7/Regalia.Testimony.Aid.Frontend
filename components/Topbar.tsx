"use client";

import { MenuIcon } from "./icons";

interface Props {
  title: string;
  onMenuClick: () => void;
}

export default function Topbar({ title, onMenuClick }: Props) {
  return (
    <div className="topbar">
      <button
        className="menubtn"
        title="Open menu"
        aria-label="Open menu"
        onClick={onMenuClick}
      >
        <MenuIcon />
      </button>
      <div className="h-title">{title}</div>
    </div>
  );
}
