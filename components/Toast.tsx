"use client";

import { CheckIcon } from "./icons";

export default function Toast({ message }: { message: string }) {
  return (
    <div className="toast">
      <CheckIcon size={16} />
      <span>{message}</span>
    </div>
  );
}
