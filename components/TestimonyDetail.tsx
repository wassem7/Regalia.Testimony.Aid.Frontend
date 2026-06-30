"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Testimony } from "@/lib/types";
import { timeAgo } from "@/lib/format";
import Avatar from "./Avatar";
import {
  ArrowLeftIcon,
  CheckIcon,
  DocumentIcon,
  PencilIcon,
  ShieldIcon,
} from "./icons";

interface Props {
  testimony: Testimony;
  onApprove: (id: string) => Promise<void> | void;
  onEdit?: () => void;
}

type Stage = "view" | "confirm" | "done";

/** Full-page testimony detail with the view → confirm → done approval flow. */
export default function TestimonyDetail({ testimony: t, onApprove, onEdit }: Props) {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("view");
  const isLive = t.status === "accepted";

  const publish = async () => {
    await onApprove(t.id);
    setStage("done");
  };

  return (
    <div className="detail">
      <button className="backlink" onClick={() => router.push("/queue")}>
        <ArrowLeftIcon size={16} />
        Back to queue
      </button>

      <div className="detail-head">
        <span className={isLive ? "chip live" : "chip pend"}>
          {isLive ? "Live on feed" : "Pending review"}
        </span>
        {t.category && <span className="cat-chip">{t.category}</span>}
        {t.source === "admin" && (
          <span className="src-chip">Recorded by admin</span>
        )}
        {onEdit && (
          <button className="btn btn-ghost detail-edit" onClick={onEdit}>
            <PencilIcon size={14} />
            Edit
          </button>
        )}
      </div>

      {t.tags && t.tags.length > 0 && (
        <div className="tagrow">
          {t.tags.map((tag) => (
            <span key={tag} className="tag-chip">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {t.isAnonymous && (
        <div className="anonnote">
          <span className="row-icon">
            <ShieldIcon />
          </span>
          <span>
            <b className="accent-text">Submitted anonymously.</b> The name below
            is shown for moderation only — it will not appear on the public feed.
          </span>
        </div>
      )}

      <div className="submitcard">
        <Avatar
          name={t.submitterName}
          imageUrl={t.submitterImageUrl}
          anonymous={t.isAnonymous}
        />
        <div className="f1 minw0">
          <div className="submitter-name">{t.submitterName}</div>
          <div className="psub submitter-meta">
            Member · submitted {timeAgo(t.createdAt)}
          </div>
        </div>
      </div>

      <h1 className="ttitle detail-title">{t.title}</h1>
      <div className="bodytext">{t.body}</div>

      {t.attachmentType === "image" && t.attachmentUrl && (
        <a
          className="attimg"
          href={t.attachmentUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={t.attachmentUrl} alt="Submitted attachment" />
        </a>
      )}
      {t.attachmentType === "document" && (
        <div className="docchip">
          <div className="docic">
            <DocumentIcon size={18} />
          </div>
          <div className="f1 minw0">
            <div className="docchip-name">{t.attachmentUrl}</div>
            <div className="psub docchip-sub">Document attachment</div>
          </div>
          <button className="btn btn-ghost">Download</button>
        </div>
      )}

      {/* Approval action area */}
      <div className="detail-actions">
        {!isLive && stage === "view" && (
          <div className="fx gap10">
            <button
              className="btn btn-ghost btn-lg"
              onClick={() => router.push("/queue")}
            >
              Leave pending
            </button>
            <button
              className="btn btn-accent btn-lg f1 jc"
              onClick={() => setStage("confirm")}
            >
              <CheckIcon size={16} />
              Approve &amp; publish
            </button>
          </div>
        )}

        {stage === "confirm" && (
          <>
            <div className="confirmbox">
              This testimony will be{" "}
              <b className="accent-text">published to the live feed</b> and
              become visible to all members in the app.
            </div>
            <div className="fx gap10">
              <button
                className="btn btn-ghost btn-lg"
                onClick={() => setStage("view")}
              >
                Cancel
              </button>
              <button className="btn btn-accent btn-lg f1 jc" onClick={publish}>
                Yes, publish to feed
              </button>
            </div>
          </>
        )}

        {stage === "done" && (
          <>
            <div className="donebox">
              <div className="donecirc">
                <CheckIcon size={26} />
              </div>
              <div className="done-title">Published to the feed</div>
              <div className="psub">
                Members can now see this testimony in the app.
              </div>
            </div>
            <div className="fx gap10 mt14">
              <button
                className="btn btn-ghost btn-lg f1 jc"
                onClick={() => router.push("/feed")}
              >
                View on feed
              </button>
              <button
                className="btn btn-ghost btn-lg"
                onClick={() => router.push("/queue")}
              >
                Back to queue
              </button>
            </div>
          </>
        )}

        {isLive && stage !== "done" && (
          <div className="fx ac gap10">
            <span className="chip live">
              <span className="kdot em" />
              Live on feed
            </span>
            <span className="psub m0">This testimony is published.</span>
          </div>
        )}
      </div>
    </div>
  );
}
