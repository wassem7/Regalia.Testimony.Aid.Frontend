"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TestimonyRow from "@/components/TestimonyRow";
import TestimonyForm from "@/components/TestimonyForm";
import Toast from "@/components/Toast";
import { AlertIcon, PlusIcon, SearchIcon } from "@/components/icons";
import { useArchive } from "@/hooks/useArchive";
import { useTestimonies } from "@/hooks/useTestimonies";
import { useToast } from "@/hooks/useToast";
import { TESTIMONY_CATEGORIES } from "@/lib/types";

export default function ArchivePage() {
  const router = useRouter();
  const archive = useArchive();
  const { approve } = useTestimonies();
  const { message, show } = useToast();
  const [creating, setCreating] = useState(false);

  const { items, loading, error, filters, updateFilters, page, pageCount } =
    archive;

  const handleApprove = async (id: string) => {
    try {
      await approve(id);
      await archive.reload();
      show("Published to the live feed");
    } catch (err) {
      show(err instanceof Error ? err.message : "Could not publish");
    }
  };

  const view: "loading" | "error" | "empty" | "normal" = loading
    ? "loading"
    : error
      ? "error"
      : items.length === 0
        ? "empty"
        : "normal";

  return (
    <div className="maxw">
      <div className="phdr">
        <div>
          <div className="pgtitle">Archive</div>
          <div className="psub">
            Search and browse every testimony, or record a new one.
          </div>
        </div>
        <button className="btn btn-accent" onClick={() => setCreating(true)}>
          <PlusIcon />
          Record testimony
        </button>
      </div>

      {/* Filter bar */}
      <div className="archbar">
        <div className="search archsearch">
          <SearchIcon />
          <input
            placeholder="Search testimonies…"
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
          />
        </div>
        <select
          className="archfilter"
          value={filters.category}
          onChange={(e) => updateFilters({ category: e.target.value })}
        >
          <option value="">All categories</option>
          {TESTIMONY_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          className="archfilter"
          value={filters.status}
          onChange={(e) => updateFilters({ status: e.target.value })}
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="accepted">Live on feed</option>
        </select>
        <select
          className="archfilter"
          value={filters.source}
          onChange={(e) => updateFilters({ source: e.target.value })}
        >
          <option value="">All sources</option>
          <option value="member">From members</option>
          <option value="admin">Recorded by admin</option>
        </select>
      </div>

      {view === "loading" && (
        <div className="list">
          {[0, 1, 2, 3].map((s) => (
            <div className="tcard" key={s}>
              <div className="skel skel-avatar" />
              <div className="f1">
                <div className="skel skel-line-1" />
                <div className="skel skel-line-2" />
                <div className="skel skel-line-3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {view === "error" && (
        <div className="state">
          <div className="ic stateRose">
            <AlertIcon />
          </div>
          <div className="stateTitle">Couldn&rsquo;t load the archive</div>
          <div className="psub maxw-state">{error}</div>
          <button
            className="btn btn-ghost btn-retry"
            onClick={() => archive.reload()}
          >
            Retry
          </button>
        </div>
      )}

      {view === "empty" && (
        <div className="state">
          <div className="ic stateEm">
            <SearchIcon size={22} />
          </div>
          <div className="stateTitle">No testimonies found</div>
          <div className="psub maxw-state">
            Nothing matches these filters. Try clearing the search, or record a
            new testimony.
          </div>
        </div>
      )}

      {view === "normal" && (
        <>
          <div className="list">
            {items.map((t) => (
              <TestimonyRow
                key={t.id}
                testimony={t}
                onOpen={(id) => router.push(`/queue/${id}`)}
                onApprove={handleApprove}
              />
            ))}
          </div>

          {pageCount > 1 && (
            <div className="pager">
              <div className="psub mono m0">
                Page {page} of {pageCount} · {archive.total} total
              </div>
              <div className="pgbtns">
                <button
                  className="pg"
                  onClick={() => archive.setPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                >
                  ‹
                </button>
                <button
                  className="pg"
                  onClick={() => archive.setPage(Math.min(pageCount, page + 1))}
                  disabled={page >= pageCount}
                >
                  ›
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {creating && (
        <TestimonyForm
          onClose={() => setCreating(false)}
          onCreate={async (payload) => {
            await archive.create(payload);
            await archive.reload();
            show(
              payload.publishImmediately
                ? "Testimony recorded and published"
                : "Testimony recorded",
            );
          }}
          onUpdate={archive.update}
        />
      )}

      {message && <Toast message={message} />}
    </div>
  );
}
