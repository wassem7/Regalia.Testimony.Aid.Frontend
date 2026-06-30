"use client";

import { createContext, useContext } from "react";
import { useTestimonies } from "./useTestimonies";

type TestimoniesValue = ReturnType<typeof useTestimonies>;

const TestimoniesContext = createContext<TestimoniesValue | null>(null);

/**
 * Fetches the testimony list once and shares it across the dashboard
 * (queue, feed, detail, sidebar stats) so there's a single source of truth
 * and no duplicate fetches between routes.
 */
export function TestimoniesProvider({ children }: { children: React.ReactNode }) {
  const value = useTestimonies();
  return (
    <TestimoniesContext.Provider value={value}>
      {children}
    </TestimoniesContext.Provider>
  );
}

export function useTestimoniesContext(): TestimoniesValue {
  const ctx = useContext(TestimoniesContext);
  if (!ctx) {
    throw new Error(
      "useTestimoniesContext must be used within a TestimoniesProvider",
    );
  }
  return ctx;
}
