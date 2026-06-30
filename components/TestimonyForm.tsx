"use client";

import { useRef, useState } from "react";
import { readFileAsBase64 } from "@/lib/file";
import {
  TESTIMONY_CATEGORIES,
  type AdminUpdateTestimonyPayload,
  type AttachmentType,
  type CreateTestimonyPayload,
  type Testimony,
} from "@/lib/types";
import { CloseIcon, DocumentIcon, PaperclipIcon, PhotoIcon } from "./icons";

interface Props {
  /** When set, the form edits this testimony; otherwise it creates a new one. */
  testimony?: Testimony | null;
  onClose: () => void;
  onCreate: (payload: CreateTestimonyPayload) => Promise<void>;
  onUpdate: (id: string, payload: AdminUpdateTestimonyPayload) => Promise<void>;
}

const MAX_MB = 10;

export default function TestimonyForm({
  testimony,
  onClose,
  onCreate,
  onUpdate,
}: Props) {
  const isEdit = Boolean(testimony);

  const [title, setTitle] = useState(testimony?.title ?? "");
  const [body, setBody] = useState(testimony?.body ?? "");
  const [testifier, setTestifier] = useState(
    testimony && !testimony.isAnonymous ? testimony.submitterName : "",
  );
  const [isAnonymous, setIsAnonymous] = useState(testimony?.isAnonymous ?? false);
  const [category, setCategory] = useState(testimony?.category ?? "");
  const [publish, setPublish] = useState(false);
  const [attachment, setAttachment] = useState<{
    data: string;
    type: AttachmentType;
    name: string;
  } | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`Attachment must be ${MAX_MB}MB or smaller.`);
      e.target.value = "";
      return;
    }
    try {
      setAttachment(await readFileAsBase64(file));
    } catch {
      setError("Could not read that file.");
    } finally {
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setError("Title and testimony are required.");
      return;
    }
    if (!isEdit && !isAnonymous && !testifier.trim()) {
      setError("Enter a testifier name, or mark it anonymous.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const common = {
        title: title.trim(),
        body: body.trim(),
        isAnonymous,
        category: category || null,
        // Tags input is hidden for now; preserve any existing tags on edit.
        tags: testimony?.tags ?? null,
        attachmentData: attachment?.data ?? null,
        attachmentType: attachment?.type ?? null,
      };

      if (isEdit && testimony) {
        await onUpdate(testimony.id, common);
      } else {
        await onCreate({
          ...common,
          testifierName: isAnonymous ? undefined : testifier.trim(),
          publishImmediately: publish,
        });
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className="dialog dialog-lg">
        <form onSubmit={handleSubmit}>
          <div className="phead">
            <span className="dialog-title">
              {isEdit ? "Edit testimony" : "Record testimony"}
            </span>
            <button type="button" className="iconbtn" onClick={onClose}>
              <CloseIcon />
            </button>
          </div>

          <div className="pbody">
            {error && <div className="auth-error">{error}</div>}

            <label className="auth-field">
              <span className="auth-label">Title</span>
              <input
                className="auth-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Healed after years of pain"
                autoFocus
              />
            </label>

            <label className="auth-field">
              <span className="auth-label">Testimony</span>
              <textarea
                className="auth-input auth-textarea"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="What God has done…"
                rows={5}
              />
            </label>

            <label className="tf-toggle">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
              />
              <span>Anonymous (hide the testifier&rsquo;s name on the feed)</span>
            </label>

            {!isAnonymous && (
              <label className="auth-field">
                <span className="auth-label">Testifier name</span>
                <input
                  className="auth-input"
                  value={testifier}
                  onChange={(e) => setTestifier(e.target.value)}
                  placeholder="Sir Kwame"
                />
              </label>
            )}

            <label className="auth-field">
              <span className="auth-label">Category</span>
              <select
                className="auth-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">None</option>
                {TESTIMONY_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <input
              ref={fileRef}
              type="file"
              accept="image/*,.pdf,.doc,.docx"
              className="tf-hidden-file"
              onChange={handleFile}
            />
            {attachment ? (
              <div className="tf-attachment">
                {attachment.type === "image" ? (
                  <PhotoIcon size={16} />
                ) : (
                  <DocumentIcon size={16} />
                )}
                <span className="tf-attachment-name">{attachment.name}</span>
                <button
                  type="button"
                  className="tf-attachment-remove"
                  onClick={() => setAttachment(null)}
                >
                  Remove
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="tf-attach-btn"
                onClick={() => fileRef.current?.click()}
              >
                <PaperclipIcon size={15} />
                Add image or document
                {isEdit && testimony?.attachmentUrl ? " (replace)" : ""}
              </button>
            )}

            {!isEdit && (
              <label className="tf-toggle tf-publish">
                <input
                  type="checkbox"
                  checked={publish}
                  onChange={(e) => setPublish(e.target.checked)}
                />
                <span className="tf-publish-text">
                  <span>Publish to the feed immediately</span>
                  <span className="tf-hint">
                    {publish
                      ? "Members will see this in the app right away."
                      : "Leave off to save it to the pending queue for review first."}
                  </span>
                </span>
              </label>
            )}
          </div>

          <div className="pfoot">
            <div className="fx gap10">
              <button
                type="button"
                className="btn btn-ghost btn-lg"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-accent btn-lg f1 jc"
                disabled={submitting}
              >
                {submitting
                  ? "Saving…"
                  : isEdit
                    ? "Save changes"
                    : publish
                      ? "Record & publish"
                      : "Record testimony"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
