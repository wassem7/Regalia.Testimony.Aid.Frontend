"use client";

import LiveFeed from "@/components/LiveFeed";
import { useTestimoniesContext } from "@/hooks/TestimoniesProvider";

export default function FeedPage() {
  const { testimonies } = useTestimoniesContext();
  return <LiveFeed testimonies={testimonies} />;
}
