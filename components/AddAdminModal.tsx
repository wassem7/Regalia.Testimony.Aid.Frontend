"use client";

import { useState } from "react";
import { ADMIN_ROLES, type AdminRole } from "@/lib/types";
import { CloseIcon } from "./icons";

interface Props {
  onClose: () => void;
  onAdd: (tkn: string, role: AdminRole) => Promise<void>;
}

export default function AddAdminModal({ onClose, onAdd }: Props) {
  const [tkn, setTkn] = useState("");
  const [role, setRole] = useState<AdminRole>("Admin");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tkn.trim()) {
      setError("Enter the member's TKN.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onAdd(tkn.trim(), role);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add admin.");
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className="dialog">
        <form onSubmit={handleSubmit}>
          <div className="phead">
            <span className="dialog-title">Add admin</span>
            <button type="button" className="iconbtn" onClick={onClose}>
              <CloseIcon />
            </button>
          </div>

          <div className="pbody">
            <p className="psub dialog-intro">
              Grant a member access to review and publish testimonies.
            </p>

            {error && <div className="auth-error">{error}</div>}

            <label className="auth-field">
              <span className="auth-label">Member TKN</span>
              <input
                className="auth-input mono"
                type="text"
                placeholder="TKN-0000"
                value={tkn}
                onChange={(e) => setTkn(e.target.value)}
                autoFocus
              />
            </label>

            <label className="auth-field">
              <span className="auth-label">Role</span>
              <select
                className="auth-input"
                value={role}
                onChange={(e) => setRole(e.target.value as AdminRole)}
              >
                {ADMIN_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
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
                {submitting ? "Adding…" : "Add admin"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
