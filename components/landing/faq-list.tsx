"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

const FAQS = [
  {
    q: "Do I need to install anything?",
    a: "No. CodeConnect runs entirely in your browser. A room is a URL — share it and your team is in.",
  },
  {
    q: "What languages are supported?",
    a: "TypeScript, JavaScript, Python, Go, Rust, Java, C++, Ruby, plus syntax-highlighting for ~40 more via Tree-sitter.",
  },
  {
    q: "Is my code saved?",
    a: "Rooms are ephemeral by default. Upgrade to persistent rooms — backed by your GitHub repo — from the dashboard.",
  },
  {
    q: "How does the AI assistant see my code?",
    a: "Context is scoped to the room. Nothing leaves your session unless you explicitly share a snippet. BYOK supported.",
  },
  {
    q: "Can I self-host?",
    a: "Yes. Team and Enterprise plans include a Helm chart and a single-binary option for air-gapped deployments.",
  },
];

export function FaqList() {
  const [open, setOpen] = useState<number>(0);

  return (
    <section id="faq" className="max-w-[1280px] mx-auto px-8 py-24">
      <div className="flex items-end justify-between gap-6 mb-12 flex-wrap">
        <div>
          <div
            className="text-muted"
            style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500, letterSpacing: "0.1em" }}
          >
            § 03 — FAQ
          </div>
          <h2
            className="mt-3 font-bold text-ink"
            style={{ fontSize: "clamp(32px, 4vw, 56px)", lineHeight: 1.05, letterSpacing: "-0.03em", maxWidth: "18ch" }}
          >
            You ask,{" "}
            <em style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 400, color: "var(--color-ink-2)" }}>
              we answer
            </em>.
          </h2>
        </div>
      </div>

      <div className="border-t border-ink">
        {FAQS.map((faq, i) => (
          <div
            key={i}
            className="border-b border-line transition-colors duration-[200ms]"
            style={{ background: open === i ? "var(--color-paper-2)" : "transparent" }}
          >
            <button
              className="w-full flex items-center justify-between gap-6 py-6 text-left bg-transparent border-0 cursor-pointer"
              onClick={() => setOpen(open === i ? -1 : i)}
            >
              <span
                className="text-muted min-w-[32px]"
                style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 500, letterSpacing: "0.08em" }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className="flex-1 text-ink"
                style={{ fontSize: 18, lineHeight: 1.4, letterSpacing: "-0.01em", fontWeight: 500 }}
              >
                {faq.q}
              </span>
              <span
                className="w-8 h-8 rounded-full border border-line-2 grid place-items-center text-ink flex-shrink-0 transition-all duration-[260ms]"
                style={{
                  background: open === i ? "var(--color-ink)" : "transparent",
                  color: open === i ? "var(--color-paper)" : "var(--color-ink)",
                  borderColor: open === i ? "var(--color-ink)" : "var(--color-line-2)",
                  transform: open === i ? "rotate(45deg)" : "rotate(0deg)",
                }}
              >
                <Plus size={14} />
              </span>
            </button>
            {open === i && (
              <div
                className="text-ink-2 pb-6"
                style={{ fontSize: 15, lineHeight: 1.6, paddingLeft: 44, paddingRight: 56, maxWidth: "62ch" }}
              >
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
