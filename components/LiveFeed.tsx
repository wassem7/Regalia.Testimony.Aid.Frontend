"use client";

import type { Testimony } from "@/lib/types";
import { excerpt, timeAgo } from "@/lib/format";
import Avatar from "./Avatar";

interface Props {
  testimonies: Testimony[];
}

/** Read-only mirror of what members see in the app. */
export default function LiveFeed({ testimonies }: Props) {
  const live = testimonies.filter((t) => t.status === "accepted");

  return (
    <div className="maxw">
      <div className="phdr">
        <div>
          <div className="eyebrow">MEMBER APP</div>
          <div className="pgtitle">Live Feed</div>
          <div className="psub">
            What members see in the app. Anonymous testimonies never show a name.
          </div>
        </div>
      </div>

      <div className="feedgrid">
        {live.map((t) => (
          <div className="fcard" key={t.id}>
            <div className="fx ac gap10 feed-head">
              <Avatar
                name={t.submitterName}
                imageUrl={t.submitterImageUrl}
                anonymous={t.isAnonymous}
              />
              <div className="f1 minw0">
                <div className="tname">
                  {t.isAnonymous ? "Anonymous" : t.submitterName}
                </div>
                <div className="tdate mono">
                  {timeAgo(t.approvedAt ?? t.createdAt)}
                </div>
              </div>
              <span className="chip live">
                <span className="kdot em" />
                Live
              </span>
            </div>
            <div className="ttitle">{t.title}</div>
            <div className="texc feed-body">{excerpt(t.body)}</div>
            {t.attachmentType === "image" && t.attachmentUrl && (
              <div className="attimg feed-attimg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={t.attachmentUrl} alt="Submitted attachment" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
