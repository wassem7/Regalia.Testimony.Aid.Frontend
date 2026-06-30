"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import TestimonyDetail from "@/components/TestimonyDetail";
import TestimonyForm from "@/components/TestimonyForm";
import Toast from "@/components/Toast";
import { AlertIcon, ArrowLeftIcon } from "@/components/icons";
import { useProfile } from "@/hooks/useProfile";
import { useTestimonies } from "@/hooks/useTestimonies";
import { useTestimony } from "@/hooks/useTestimony";
import { useToast } from "@/hooks/useToast";

export default function TestimonyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { testimony, loading, error, update, remove } = useTestimony(id);
  const { approve } = useTestimonies();
  const profile = useProfile();
  const { message, show } = useToast();
  const [editing, setEditing] = useState(false);

  const isSuperAdmin = profile?.role === "Super Admin";

  const handleDelete = async () => {
    try {
      await remove();
      show("Testimony deleted");
      router.push("/queue");
    } catch (err) {
      show(err instanceof Error ? err.message : "Could not delete");
    }
  };

  const handleApprove = async (tid: string) => {
    try {
      await approve(tid);
      show("Published to the live feed");
    } catch (err) {
      show(err instanceof Error ? err.message : "Could not publish");
    }
  };

  if (loading) {
    return (
      <div className="detail">
        <div className="skel skel-line-1" />
        <div className="skel skel-line-2" />
        <div className="skel skel-line-3" />
      </div>
    );
  }

  if (error || !testimony) {
    return (
      <div className="state">
        <div className="ic stateRose">
          <AlertIcon />
        </div>
        <div className="stateTitle">Testimony not found</div>
        <div className="psub maxw-state">
          {error || "This testimony may have been removed."}
        </div>
        <button
          className="btn btn-ghost btn-retry"
          onClick={() => router.push("/queue")}
        >
          <ArrowLeftIcon size={15} />
          Back to queue
        </button>
      </div>
    );
  }

  return (
    <>
      <TestimonyDetail
        testimony={testimony}
        onApprove={handleApprove}
        onEdit={() => setEditing(true)}
        onDelete={isSuperAdmin ? handleDelete : undefined}
      />

      {editing && (
        <TestimonyForm
          testimony={testimony}
          onClose={() => setEditing(false)}
          onCreate={async () => {}}
          onUpdate={async (_id, payload) => {
            await update(payload);
            show("Testimony updated");
          }}
        />
      )}

      {message && <Toast message={message} />}
    </>
  );
}
