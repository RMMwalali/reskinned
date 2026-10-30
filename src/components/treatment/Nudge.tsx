"use client";

import { useState } from "react";

/** Queue a progress nudge to a subscriber (sample: nothing is sent). */
export function Nudge({ text }: { text: string }) {
  const [sent, setSent] = useState(false);
  const [open, setOpen] = useState(false);
  return (
    <span style={{ display: "grid", gap: 6, justifyItems: "end" }}>
      <span style={{ display: "flex", gap: 6 }}>
        <button className="btn btn-ghost" style={{ minHeight: 36, padding: "0 12px", fontSize: "0.85rem" }} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          {open ? "Hide" : "Preview"}
        </button>
        <button className="btn btn-primary" style={{ minHeight: 36, padding: "0 12px", fontSize: "0.85rem" }} disabled={sent} onClick={() => setSent(true)}>
          {sent ? "Queued" : "Send nudge"}
        </button>
      </span>
      {open ? <span style={{ maxWidth: 340, fontSize: "0.9rem", textAlign: "left", padding: "10px 12px", borderRadius: 14, background: "var(--lilac)" }}>{text}</span> : null}
    </span>
  );
}
