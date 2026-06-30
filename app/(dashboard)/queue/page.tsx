"use client";

import { useRouter } from "next/navigation";
import ReviewQueue from "@/components/ReviewQueue";
import Toast from "@/components/Toast";
import { useTestimonies } from "@/hooks/useTestimonies";
import { useToast } from "@/hooks/useToast";

export default function QueuePage() {
  const router = useRouter();
  const { message, show } = useToast();
  const { testimonies, loading, error, stats, reload, approve } =
    useTestimonies();

  const handleApprove = async (id: string) => {
    try {
      await approve(id);
      show("Published to the live feed");
    } catch (err) {
      show(err instanceof Error ? err.message : "Could not publish");
    }
  };

  return (
    <>
      <ReviewQueue
        testimonies={testimonies}
        loading={loading}
        error={error}
        approvedThisWeek={stats.approvedThisWeek}
        liveTotal={stats.liveTotal}
        onOpen={(id) => router.push(`/queue/${id}`)}
        onApprove={handleApprove}
        onRetry={reload}
      />
      {message && <Toast message={message} />}
    </>
  );
}
