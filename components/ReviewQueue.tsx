"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Testimony } from "@/lib/types";
import type { Filter } from "./types";
import { AlertIcon, CheckIcon, SearchIcon } from "./icons";
import TestimonyRow from "./TestimonyRow";

const PAGE_SIZE = 5;

const FILTER_KEYS: Filter[] = ["pending", "live", "all"];

function parseFilter(value: string | null): Filter {
  return FILTER_KEYS.includes(value as Filter) ? (value as Filter) : "pending";
}

interface Props {
  testimonies: Testimony[];
  loading: boolean;
  error: string | null;
  approvedThisWeek: number;
  liveTotal: number;
  onOpen: (id: string) => void;
  onApprove: (id: string) => void;
  onRetry: () => void;
}

const FILTERS: { key: Filter; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "live", label: "Live on feed" },
  { key: "all", label: "All" },
];

export default function ReviewQueue({
  testimonies,
  loading,
  error,
  approvedThisWeek,
  liveTotal,
  onOpen,
  onApprove,
  onRetry,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filter = parseFilter(searchParams.get("filter"));

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const pendingCount = testimonies.filter((t) => t.status === "pending").length;

  const { items, pageCount, pageClamped, total, startI } = useMemo(() => {
    const q = search.trim().toLowerCase();
    let base = testimonies;
    if (filter === "pending") base = base.filter((t) => t.status === "pending");
    else if (filter === "live") base = base.filter((t) => t.status === "accepted");
    if (q)
      base = base.filter((t) =>
        (t.title + " " + t.body + " " + t.submitterName).toLowerCase().includes(q),
      );

    const total = base.length;
    const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const pageClamped = Math.min(page, pageCount);
    const startI = (pageClamped - 1) * PAGE_SIZE;
    return {
      items: base.slice(startI, startI + PAGE_SIZE),
      pageCount,
      pageClamped,
      total,
      startI,
    };
  }, [testimonies, filter, search, page]);

  const view: "loading" | "error" | "empty" | "normal" = loading
    ? "loading"
    : error
      ? "error"
      : items.length === 0
        ? "empty"
        : "normal";

  const rangeLabel =
    total === 0 ? "0 of 0" : `${startI + 1}–${startI + items.length} of ${total}`;

  const changeFilter = (f: Filter) => {
    setPage(1);
    const params = new URLSearchParams(searchParams.toString());
    if (f === "pending") {
      params.delete("filter"); // keep the default URL clean
    } else {
      params.set("filter", f);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return (
    <div className="maxw">
      <div className="phdr">
        <div>
          <div className="pgtitle">Review Queue</div>
          <div className="psub">
            Approve testimonies to publish them to the member app feed.
          </div>
        </div>
        <div className="statstrip">
          <span className="stat">
            <span className="stat-num">{pendingCount}</span>
            <span className="stat-lab">Pending</span>
          </span>
          <span className="stat-div" />
          <span className="stat">
            <span className="stat-num">{approvedThisWeek}</span>
            <span className="stat-lab">This week</span>
          </span>
          <span className="stat-div" />
          <span className="stat">
            <span className="stat-num">{liveTotal}</span>
            <span className="stat-lab">Live</span>
          </span>
        </div>
      </div>

      <div className="fx ac jb wrap gap12 mb16">
        <div className="tabs">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={"tab" + (filter === f.key ? " on" : "")}
              onClick={() => changeFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="search">
          <SearchIcon />
          <input
            placeholder="Search testimonies…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
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
              <div className="skel skel-btn" />
            </div>
          ))}
        </div>
      )}

      {view === "error" && (
        <div className="state">
          <div className="ic stateRose">
            <AlertIcon />
          </div>
          <div className="stateTitle">Couldn&rsquo;t load the queue</div>
          <div className="psub maxw-state">
            {error || "We hit a snag reaching the member portal."} Nothing was
            lost — your place in the queue is safe.
          </div>
          <button className="btn btn-ghost btn-retry" onClick={onRetry}>
            Retry
          </button>
        </div>
      )}

      {view === "empty" && (
        <div className="state">
          <div className="ic stateEm">
            <CheckIcon size={24} />
          </div>
          <div className="stateTitle">You&rsquo;re all caught up</div>
          <div className="psub maxw-state">
            No testimonies match this view. New submissions from the member
            portal will appear here.
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
                onOpen={onOpen}
                onApprove={onApprove}
              />
            ))}
          </div>

          <div className="pager">
            <div className="psub mono m0">{rangeLabel}</div>
            <div className="pgbtns">
              <button
                className="pg"
                onClick={() => setPage(Math.max(1, pageClamped - 1))}
                disabled={pageClamped <= 1}
              >
                ‹
              </button>
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={"pg" + (p === pageClamped ? " on" : "")}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
              <button
                className="pg"
                onClick={() => setPage(Math.min(pageCount, pageClamped + 1))}
                disabled={pageClamped >= pageCount}
              >
                ›
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
