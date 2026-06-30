"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { AlertIcon, EyeIcon, EyeOffIcon, IdIcon, KeyIcon } from "./icons";

export default function LoginForm() {
  const router = useRouter();
  const [tkn, setTkn] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tkn.trim() || !password) {
      setError("Enter your TKN and password.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await login(tkn.trim(), password);
      router.replace("/");
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setError("You don't have access to this dashboard.");
      } else {
        setError(err instanceof Error ? err.message : "Sign in failed.");
      }
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="auth-logo" src="/logo.png" alt="Testimony Aid" />

        <h1 className="auth-title">Sign in</h1>
        <p className="auth-sub">
          Testimony Aid · review &amp; publish member testimonies.
        </p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="auth-error" role="alert">
              <AlertIcon size={16} />
              <span>{error}</span>
            </div>
          )}

          <label className="auth-field">
            <span className="auth-label">TKN</span>
            <span className="auth-control">
              <span className="auth-lead">
                <IdIcon />
              </span>
              <input
                className="auth-input mono"
                type="text"
                autoComplete="username"
                placeholder="2023012"
                value={tkn}
                onChange={(e) => setTkn(e.target.value)}
                autoFocus
              />
            </span>
          </label>

          <label className="auth-field">
            <span className="auth-label">Password</span>
            <span className="auth-control">
              <span className="auth-lead">
                <KeyIcon />
              </span>
              <input
                className="auth-input"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="auth-reveal"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </span>
          </label>

          <button className="auth-submit" type="submit" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>

      <p className="auth-foot">
        © 2026 Tech Ambition. All rights reserved.
      </p>
    </div>
  );
}
