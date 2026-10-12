import { Plus, Users, Boxes } from "lucide-react";

const STEPS = [
  {
    num: "1",
    title: "Open a room",
    desc: "Sign in, choose a username, and create a room in your browser.",
    Icon: Plus,
  },
  {
    num: "2",
    title: "Invite your team",
    desc: "Share the room link so your collaborators can join.",
    Icon: Users,
  },
  {
    num: "3",
    title: "Build",
    desc: "Write, run, and discuss code together.",
    Icon: Boxes,
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="max-w-[1280px] mx-auto px-8 py-24">
      <div className="flex items-end justify-between gap-6 mb-12 flex-wrap">
        <div>
          <div
            className="text-muted"
            style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500, letterSpacing: "0.1em" }}
          >
            § 02 — The flow
          </div>
          <h2
            className="mt-3 font-bold text-ink"
            style={{ fontSize: "clamp(32px, 4vw, 56px)", lineHeight: 1.05, letterSpacing: "-0.03em", maxWidth: "18ch" }}
          >
            From zero to{" "}
            <em style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 400, color: "var(--color-ink-2)" }}>
              shipping
            </em>, in three moves.
          </h2>
        </div>
      </div>

      <div
        className="grid border-t border-line"
        style={{ gridTemplateColumns: "1fr 1fr 1fr" }}
      >
        {STEPS.map((step, i) => (
          <div
            key={i}
            className="px-7 py-8 bg-surface border-b border-line transition-colors duration-[240ms] hover:bg-paper-2"
            style={{ borderRight: i < 2 ? "1px solid var(--color-line)" : "none" }}
          >
            <div
              className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-ink"
              style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600 }}
            >
              {step.num}
            </div>
            <div
              className="font-semibold text-ink mt-4 mb-2"
              style={{ fontSize: 20, lineHeight: 1.2, letterSpacing: "-0.02em" }}
            >
              {step.title}
            </div>
            <div className="text-ink-2" style={{ fontSize: 14, lineHeight: 1.55 }}>
              {step.desc}
            </div>
            <step.Icon size={32} className="mt-6 text-ink" />
          </div>
        ))}
      </div>
    </section>
  );
}
