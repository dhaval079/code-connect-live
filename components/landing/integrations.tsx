const ITEMS = [
  "GITHUB", "GITLAB", "VS CODE", "VIM", "DISCORD", "SLACK", "LINEAR", "FIGMA",
  "VERCEL", "NETLIFY", "NOTION", "CLERK", "SUPABASE", "RAYCAST", "JIRA", "ZOOM",
];

export function Integrations() {
  return (
    <section className="max-w-[1280px] mx-auto px-8 py-24">
      <div className="flex items-end justify-between gap-6 mb-12 flex-wrap">
        <div>
          <div
            className="text-muted"
            style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500, letterSpacing: "0.1em" }}
          >
            § 03 — Integrations
          </div>
          <h2
            className="mt-3 font-bold text-ink"
            style={{ fontSize: "clamp(32px, 4vw, 56px)", lineHeight: 1.05, letterSpacing: "-0.03em", maxWidth: "18ch" }}
          >
            Plays nice with{" "}
            <em style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 400, color: "var(--color-ink-2)" }}>
              your stack
            </em>.
          </h2>
        </div>
        <p className="text-ink-2 max-w-[42ch]" style={{ fontSize: 16, lineHeight: 1.55 }}>
          Sixteen first-party connectors, a typed SDK, and an open webhook spec. Ship on Monday.
        </p>
      </div>

      <div
        className="mt-8 border border-line rounded-[14px] bg-surface overflow-hidden"
        style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)" }}
      >
        {ITEMS.map((item, i) => (
          <div
            key={i}
            className="grid place-items-center text-center text-ink-2 transition-all duration-[240ms] hover:bg-paper-2 hover:text-ink cursor-default p-2"
            style={{
              aspectRatio: "1.2 / 1",
              borderRight: (i + 1) % 8 !== 0 ? "1px solid var(--color-line)" : "none",
              borderBottom: i < 8 ? "1px solid var(--color-line)" : "none",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.06em",
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}
