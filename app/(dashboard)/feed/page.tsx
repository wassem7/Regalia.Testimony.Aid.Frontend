"use client";

import LiveFeed from "@/components/LiveFeed";
import { useTestimonies } from "@/hooks/useTestimonies";

export default function FeedPage() {
  const { testimonies } = useTestimonies();
  return <LiveFeed testimonies={testimonies} />;
}
