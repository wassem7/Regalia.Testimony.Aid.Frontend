import { initials } from "@/lib/format";
import { PersonIcon } from "./icons";

interface Props {
  name?: string;
  imageUrl?: string | null;
  anonymous?: boolean;
  /** Extra classes (e.g. sizing) appended to the base `.av`. */
  className?: string;
}

/**
 * Member avatar: shows the photo when available, falls back to initials,
 * or a neutral person glyph for anonymous submitters.
 */
export default function Avatar({
  name,
  imageUrl,
  anonymous = false,
  className = "",
}: Props) {
  const cls = `av${anonymous ? " anon" : ""}${className ? ` ${className}` : ""}`;

  if (anonymous) {
    return (
      <div className={cls}>
        <PersonIcon />
      </div>
    );
  }

  if (imageUrl) {
    return (
      <div className={cls}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="av-img" src={imageUrl} alt={name ?? ""} />
      </div>
    );
  }

  return <div className={cls}>{initials(name ?? "")}</div>;
}
