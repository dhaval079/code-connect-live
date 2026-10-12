import { GitBranch, Code } from "lucide-react";

const GUTTER_LINES = Array.from({ length: 12 }, (_, i) => i + 1);

export function EditorMock() {
  return (
    <div
      className="bg-surface rounded-[20px] border border-line overflow-hidden relative"
      style={{ boxShadow: "var(--shadow-3)" }}
    >
      {/* Cyan glow blob */}
      <div
        className="absolute pointer-events-none z-0"
        style={{
          top: -40,
          right: -30,
          width: 140,
          height: 140,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(6,182,212,0.35), transparent 70%)",
          filter: "blur(12px)",
        }}
      />

      {/* Chrome */}
      <div className="relative z-10 flex items-center gap-3 px-4 py-3 bg-paper-2 border-b border-line">
        <div className="flex gap-[6px]">
          <span className="w-[10px] h-[10px] rounded-full bg-[#ef4444]" />
          <span className="w-[10px] h-[10px] rounded-full bg-[#f59e0b]" />
          <span className="w-[10px] h-[10px] rounded-full bg-[#10b981]" />
        </div>
        <div
          className="flex items-center gap-[6px] text-muted"
          style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 500 }}
        >
          <Code size={13} />
          <span className="text-ink font-semibold">room.ts</span>
          <span>—</span>
          <span>cc-4h9k2a</span>
        </div>
        <div
          className="ml-auto flex items-center gap-[6px] text-[#0e7490] px-2 py-1 rounded-full"
          style={{
            background: "rgba(6,182,212,0.1)",
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.08em",
          }}
        >
          <span
            className="w-[6px] h-[6px] rounded-full bg-[#06b6d4] animate-pulse-dot"
            style={{ boxShadow: "0 0 8px #22d3ee" }}
          />
          LIVE · 3
        </div>
      </div>

      {/* Code body */}
      <div
        className="relative z-10 grid py-[14px]"
        style={{
          gridTemplateColumns: "44px 1fr",
          fontFamily: "var(--font-mono)",
          fontSize: 13,
          lineHeight: 1.7,
          fontWeight: 500,
        }}
      >
        <div className="text-subtle text-right pr-[10px] text-[11.5px] select-none">
          {GUTTER_LINES.map((n) => <div key={n}>{n}</div>)}
        </div>
        <div className="px-4 text-ink">
          <div><span className="tk-com">{"// join · share · build"}</span></div>
          <div><span className="tk-kw">import</span> <span className="tk-punc">{"{"}</span> CodeRoom <span className="tk-punc">{"}"}</span> <span className="tk-kw">from</span> <span className="tk-str">"@codeconnect"</span></div>
          <div>&nbsp;</div>
          <div><span className="tk-kw">const</span> room <span className="tk-punc">=</span> <span className="tk-kw">new</span> <span className="tk-fn">CodeRoom</span><span className="tk-punc">(</span><span className="tk-str">"cc-4h9k2a"</span><span className="tk-punc">)</span></div>
          <div>&nbsp;</div>
          <div>room<span className="tk-punc">.</span><span className="tk-fn">onJoin</span><span className="tk-punc">(</span><span className="tk-punc">(</span>user<span className="tk-punc">)</span> <span className="tk-punc">=&gt;</span> <span className="tk-punc">{"{"}</span></div>
          <div>
            &nbsp;&nbsp;console<span className="tk-punc">.</span><span className="tk-fn">log</span><span className="tk-punc">(</span><span className="tk-str">{"` ${user.name} joined`"}</span><span className="tk-punc">)</span>
            <span className="collab-cursor" style={{ background: "#06b6d4" }}>
              <span className="cursor-tag" style={{ background: "#06b6d4" }}>maya</span>
            </span>
          </div>
          <div><span className="tk-punc">{"}"}</span><span className="tk-punc">)</span></div>
          <div>&nbsp;</div>
          <div>room<span className="tk-punc">.</span><span className="tk-fn">onEdit</span><span className="tk-punc">(</span><span className="tk-punc">(</span>delta<span className="tk-punc">)</span> <span className="tk-punc">=&gt;</span> <span className="tk-punc">{"{"}</span></div>
          <div>
            &nbsp;&nbsp;<span className="tk-fn">sync</span><span className="tk-punc">(</span>delta<span className="tk-punc">)</span>
            <span className="collab-cursor" style={{ background: "#8b5cf6" }}>
              <span className="cursor-tag" style={{ background: "#8b5cf6" }}>kenji</span>
            </span>
          </div>
          <div>
            <span className="tk-punc">{"}"}</span><span className="tk-punc">)</span>
            <span className="collab-cursor" style={{ background: "#e11d48" }}>
              <span className="cursor-tag" style={{ background: "#e11d48" }}>you</span>
            </span>
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div
        className="relative z-10 flex items-center gap-4 px-4 py-[10px] border-t border-line bg-paper-2 text-muted"
        style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500 }}
      >
        <span className="inline-flex items-center gap-[6px] px-2 py-1 rounded-full bg-surface border border-line text-ink">
          <GitBranch size={11} /> main
        </span>
        <span>TypeScript</span>
        <span className="opacity-40">·</span>
        <span>UTF-8</span>
        <span className="opacity-40">·</span>
        <span>Ln 10, Col 14</span>
        <div className="ml-auto flex">
          {[
            { color: "#06b6d4", letter: "M" },
            { color: "#8b5cf6", letter: "K" },
            { color: "#e11d48", letter: "D" },
          ].map((av, i) => (
            <div
              key={i}
              className="w-[22px] h-[22px] rounded-full border-2 border-paper-2 grid place-items-center text-white font-sans font-semibold text-[10px]"
              style={{ background: av.color, marginLeft: i === 0 ? 0 : -6 }}
            >
              {av.letter}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
