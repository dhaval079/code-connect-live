import { Plus } from "lucide-react";

const CLI_COMMANDS = [
  { prompt: true, text: "cc init ", flag: "--team", val: "framestack" },
  { gray: true, text: "→ Creating room · verifying org…" },
  { ok: true, text: "✓ Room ", val: "cc-4h9k2a", after: " ready" },
  { gray: true, text: "→ Watching ", val: "./src", after: " for changes" },
  { blank: true },
  { prompt: true, text: "cc invite ", val: "maya@framestack.dev" },
  { ok: true, text: "✓ Invite sent · ", val: "https://cc.dev/r/4h9k2a" },
  { blank: true },
  { prompt: true, text: "cc status" },
  { text: "room ", val: "cc-4h9k2a", after: " · ", ok2: true, okText: "live", after2: " · 3 peers · 28ms" },
  { prompt: true, cursor: true },
];

export function DeepSplit() {
  return (
    <section
      className="max-w-[1280px] mx-auto px-8 py-24 grid gap-16 items-center"
      style={{ gridTemplateColumns: "1fr 1fr" }}
    >
      {/* Copy */}
      <div>
        <div
          className="text-muted uppercase"
          style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500, letterSpacing: "0.1em" }}
        >
          § 04 — CLI
        </div>
        <h3
          className="mt-3 mb-4 font-bold text-ink"
          style={{ fontSize: "clamp(28px, 3.2vw, 44px)", lineHeight: 1.1, letterSpacing: "-0.03em" }}
        >
          Yes, there's a{" "}
          <em style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 400, color: "var(--color-cyan-ink)" }}>
            CLI
          </em>.
        </h3>
        <p className="text-ink-2 max-w-[48ch]" style={{ fontSize: 16, lineHeight: 1.6 }}>
          Spawn a room from your terminal, pipe stdout into a shared console, and pull back the whole session as a Git commit. Scriptable end-to-end.
        </p>
        <ul className="list-none p-0 mt-6 grid gap-3">
          {[
            { cmd: "cc init", desc: "new room from cwd" },
            { cmd: "cc invite", desc: "print shareable link" },
            { cmd: "cc commit", desc: "snapshot + push" },
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-[10px] text-ink-2" style={{ fontSize: 14, lineHeight: 1.5 }}>
              <Plus size={14} className="text-cyan-ink flex-shrink-0 mt-[3px]" />
              <code style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>{item.cmd}</code>
              <span>— {item.desc}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Terminal */}
      <div
        className="relative rounded-[20px] overflow-hidden"
        style={{
          background: "var(--color-ink)",
          padding: 20,
          color: "var(--color-paper)",
          fontFamily: "var(--font-mono)",
          fontSize: 13,
          lineHeight: 1.7,
          fontWeight: 500,
          boxShadow: "var(--shadow-3)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(400px 200px at 100% 0%, rgba(6,182,212,0.15), transparent 60%)",
          }}
        />
        <div className="relative">
          {/* Chrome */}
          <div
            className="flex items-center gap-[10px] mb-[14px]"
            style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 500 }}
          >
            <div className="flex gap-[5px]">
              {["", "", ""].map((_, i) => (
                <span key={i} className="w-[9px] h-[9px] rounded-full bg-white/20" />
              ))}
            </div>
            <span>~/projects/app · zsh</span>
          </div>

          {/* Lines */}
          {CLI_COMMANDS.map((line, i) => {
            if (line.blank) return <div key={i}>&nbsp;</div>;
            if (line.cursor) return (
              <div key={i}>
                <span style={{ color: "#10b981" }}>$</span>{" "}
                <span style={{ opacity: 0.5 }}>▌</span>
              </div>
            );
            return (
              <div key={i} style={{ color: line.gray ? "rgba(255,255,255,0.5)" : "var(--color-paper)" }}>
                {line.prompt && <span style={{ color: "#10b981" }}>$ </span>}
                {line.ok && <span style={{ color: "#86efac" }}>{line.text}</span>}
                {line.ok2 === undefined && !line.ok && line.text && <span>{line.text}</span>}
                {line.val && <span style={{ color: "#fbbf24" }}>{line.val}</span>}
                {line.flag && <span style={{ color: "#22d3ee" }}>{line.flag}</span>}
                {line.after && <span style={{ color: line.gray ? "rgba(255,255,255,0.5)" : "var(--color-paper)" }}>{line.after}</span>}
                {line.ok2 && (
                  <>
                    {line.text}
                    <span style={{ color: "#fbbf24" }}>{line.val}</span>
                    {line.after}
                    <span style={{ color: "#86efac" }}>{line.okText}</span>
                    {line.after2}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
