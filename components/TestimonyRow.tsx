"use client";

import { useState } from "react";
import type { Testimony } from "@/lib/types";
import { excerpt, timeAgo } from "@/lib/format";
import Avatar from "./Avatar";
import { CheckIcon, CloseIcon, DocumentIcon, EyeIcon } from "./icons";

interface Props {
  testimony: Testimony;
  onOpen: (id: string) => void;
  onApprove: (id: string) => void;
}

/** A single row in the review queue, with inline approve-confirm. */
export default function TestimonyRow({ testimony: t, onOpen, onApprove }: Props) {
  const [confirming, setConfirming] = useState(false);
  const isLive = t.status === "accepted";

  // Buttons live inside the clickable card, so stop the open-on-click bubbling.
  const act = (fn: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    fn();
  };

  return (
    <div className="tcard" onClick={() => onOpen(t.id)}>
      <div className="tleft">
        <Avatar
          name={t.submitterName}
          imageUrl={t.submitterImageUrl}
          anonymous={t.isAnonymous}
        />
        <div className="minw0">
          <div className="ttitle">{t.title}</div>
          <div className="texc">{excerpt(t.body)}</div>
          <div className="meta">
            <span className="tname">{t.submitterName}</span>
            {t.isAnonymous && (
              <span className="badge-anon">Anonymous on feed</span>
            )}
            {t.category && <span className="cat-chip">{t.category}</span>}
            <span className="dot" />
            {t.attachmentType && (
              <>
                <span className="att">
                  {t.attachmentType === "image" && <span className="thumb striped" />}
                  {t.attachmentType === "document" && <DocumentIcon />}
                  <span className="att-url">This testimony has an attachment</span>
                </span>
                <span className="dot" />
              </>
            )}
            <span className="tdate mono">{timeAgo(t.createdAt)}</span>
          </div>
        </div>
      </div>

      <div className="rowacts">
        {isLive ? (
          <span className="chip live">
            <span className="kdot em" />
            Live on feed
          </span>
        ) : confirming ? (
          <>
            <button
              className="btn btn-accent"
              onClick={act(() => {
                setConfirming(false);
                onApprove(t.id);
              })}
            >
              Confirm publish
            </button>
            <button className="iconbtn" onClick={act(() => setConfirming(false))}>
              <CloseIcon size={15} />
            </button>
          </>
        ) : (
          <>
            <button className="btn btn-ghost" onClick={act(() => onOpen(t.id))}>
              <EyeIcon size={15} />
              View
            </button>
            <button className="btn btn-accent" onClick={act(() => setConfirming(true))}>
              <CheckIcon />
              Approve
            </button>
          </>
        )}
      </div>
    </div>
  );
}
