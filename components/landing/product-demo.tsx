"use client";

import { useState } from "react";
import { Users, Sparkles, GitBranch, Plus } from "lucide-react";

type Tab = 0 | 1 | 2;

const TABS = [
  { num: "01", label: "Live presence", Icon: Users },
  { num: "02", label: "AI assistant", Icon: Sparkles },
  { num: "03", label: "Git-native rooms", Icon: GitBranch },
];

const PANELS = [
  {
    title: (
      <>
        Every keystroke, <em style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 400, color: "var(--color-cyan-ink)" }}>everywhere</em>, at once.
      </>
    ),
    body: "See teammates' cursors, selections and edits in real time. CRDT-backed sync means merges just work — even when two people type over each other.",
    bullets: ["Shared cursors with name tags", "Selection highlights per user", "Conflict-free merges via Yjs"],
    viz: (
      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
        {[
          {
            fname: "room.ts · maya",
            lines: ["const room = new", "  CodeRoom()"],
            cursor: { color: "#06b6d4", name: "maya", after: 0 },
          },
          {
            fname: "sync.ts · kenji",
            lines: ["export function sync(", "  delta: Delta", ") { merge(delta) }"],
            cursor: { color: "#8b5cf6", name: "kenji", after: 1 },
          },
        ].map((file, fi) => (
          <div
            key={fi}
            className="bg-paper-2 rounded-[10px] p-[14px] font-mono text-ink relative"
            style={{ fontSize: 12, lineHeight: 1.7, fontWeight: 500 }}
          >
            <div
              className="flex items-center gap-[6px] text-muted uppercase mb-2"
              style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em" }}
            >
              <span className="w-[6px] h-[6px] rounded-full bg-[#10b981]" style={{ boxShadow: "0 0 6px #10b981" }} />
              {file.fname}
            </div>
            {file.lines.map((line, li) => (
              <div key={li}>
                {line}
                {li === file.cursor.after && (
                  <span
                    className="collab-cursor"
                    style={{ background: file.cursor.color }}
                  >
                    <span className="cursor-tag" style={{ background: file.cursor.color }}>
                      {file.cursor.name}
                    </span>
                  </span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    ),
  },
  {
    title: (
      <>
        An AI that <em style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 400, color: "var(--color-cyan-ink)" }}>reads the room</em>.
      </>
    ),
    body: "The assistant sees the whole session — not just the file you have open. Ask in natural language; it cites the lines and edits that matter.",
    bullets: ["Context spans all open files", "Cite-and-diff style answers", "BYOK: Claude, GPT-4, Llama"],
    viz: (
      <div className="grid gap-[10px]">
        <div
          className="px-[14px] py-3 rounded-[12px] bg-paper-2 text-ink self-end max-w-[80%] ml-auto border border-line"
          style={{ fontSize: 13, lineHeight: 1.5, fontFamily: "var(--font-sans)" }}
        >
          <div className="text-muted uppercase mb-[6px]" style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", fontFamily: "var(--font-mono)" }}>You</div>
          why does sync() drop the last keystroke?
        </div>
        <div
          className="px-[14px] py-3 rounded-[12px] bg-ink text-paper max-w-[90%] border border-ink"
          style={{ fontSize: 13, lineHeight: 1.5, fontFamily: "var(--font-sans)" }}
        >
          <div className="text-white/60 uppercase mb-[6px]" style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", fontFamily: "var(--font-mono)" }}>Claude · codeconnect</div>
          Your debounce in{" "}
          <code className="px-[6px] py-[2px] rounded bg-white/[0.08] text-[#67e8f9]" style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>
            room.ts:47
          </code>{" "}
          fires on the leading edge. Swap to{" "}
          <code className="px-[6px] py-[2px] rounded bg-white/[0.08] text-[#67e8f9]" style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>
            {"{ trailing: true }"}
          </code>{" "}
          and the final keystroke lands.
        </div>
        <div className="inline-flex gap-1 px-[14px] py-[10px] bg-ink rounded-[12px]">
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              className="w-[6px] h-[6px] rounded-full bg-[#22d3ee] animate-bounce-dot"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
      </div>
    ),
  },
  {
    title: (
      <>
        Your room <em style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 400, color: "var(--color-cyan-ink)" }}>is</em> a branch.
      </>
    ),
    body: "Every room is a live checkout. Commit from the chrome, push to your remote, or open a PR — without leaving the editor.",
    bullets: ["Native GitHub / GitLab / Gitea", "PR review inside the room", "Room link = branch URL"],
    viz: (
      <div className="grid gap-[10px]">
        {[
          { msg: "Fix CRDT merge race on paste", hash: "a7f2e91 · maya · 2m ago", branch: "main" },
          { msg: "Add trailing debounce", hash: "c4d819f · kenji · 5m ago", branch: "feat/sync" },
          { msg: "Initial room scaffold", hash: "f0a1b3c · dhaval · 1h ago", branch: "main" },
        ].map((commit, i) => (
          <div
            key={i}
            className="grid items-center gap-3 px-[14px] py-[10px] bg-paper-2 rounded-[10px] text-ink-2"
            style={{ gridTemplateColumns: "20px 1fr auto", fontFamily: "var(--font-sans)", fontSize: 13, lineHeight: 1.3 }}
          >
            <span
              className="w-[10px] h-[10px] rounded-full bg-[#06b6d4]"
              style={{ boxShadow: "0 0 0 3px rgba(6,182,212,0.2)" }}
            />
            <span>
              <strong className="text-ink font-semibold">{commit.msg}</strong>
              <div className="text-muted mt-[2px]" style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>
                {commit.hash}
              </div>
            </span>
            <span className="text-muted" style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>
              {commit.branch}
            </span>
          </div>
        ))}
      </div>
    ),
  },
];

export function ProductDemo() {
  const [tab, setTab] = useState<Tab>(0);
  const p = PANELS[tab];

  return (
    <section id="product" className="max-w-[1280px] mx-auto px-8 py-24">
      <div className="flex items-end justify-between gap-6 mb-12 flex-wrap">
        <div>
          <div
            className="text-muted"
            style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500, letterSpacing: "0.1em" }}
          >
            § 02 — Product tour
          </div>
          <h2
            className="mt-3 font-bold text-ink"
            style={{
              fontSize: "clamp(32px, 4vw, 56px)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              maxWidth: "18ch",
              fontFamily: "var(--font-sans)",
            }}
          >
            The editor that{" "}
            <em style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 400, color: "var(--color-ink-2)" }}>
              shows up
            </em>{" "}
            for you.
          </h2>
        </div>
        <p className="text-ink-2 max-w-[42ch]" style={{ fontSize: 16, lineHeight: 1.55, fontFamily: "var(--font-sans)" }}>
          Three primitives, one tab. Each does exactly what it should, and gets out of the way.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-line mb-8 overflow-x-auto">
        {TABS.map((t, i) => (
          <button
            key={i}
            onClick={() => setTab(i as Tab)}
            className="flex items-center gap-2 px-5 py-[14px] border-b-2 -mb-px transition-all duration-[240ms] whitespace-nowrap bg-transparent border-0 cursor-pointer"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 13,
              fontWeight: 500,
              color: tab === i ? "var(--color-ink)" : "var(--color-muted)",
              borderBottomColor: tab === i ? "var(--color-ink)" : "transparent",
              borderBottomStyle: "solid",
              borderBottomWidth: 2,
            }}
          >
            <span
              className="text-muted"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.08em",
                color: tab === i ? "var(--color-cyan-ink)" : undefined,
              }}
            >
              {t.num}
            </span>
            <t.Icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Panel */}
      <div className="grid gap-12 items-start" style={{ gridTemplateColumns: "1fr 1.4fr" }}>
        <div>
          <div
            className="text-muted"
            style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500, letterSpacing: "0.1em" }}
          >
            FEATURE {TABS[tab].num}
          </div>
          <h3
            className="mt-3 mb-4 font-bold text-ink"
            style={{
              fontSize: "clamp(24px, 2.6vw, 36px)",
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              fontFamily: "var(--font-sans)",
            }}
          >
            {p.title}
          </h3>
          <p className="text-ink-2 max-w-[42ch]" style={{ fontSize: 15, lineHeight: 1.6, fontFamily: "var(--font-sans)" }}>
            {p.body}
          </p>
          <ul className="list-none p-0 mt-6 grid gap-3">
            {p.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-[10px] text-ink-2" style={{ fontSize: 14, lineHeight: 1.5, fontFamily: "var(--font-sans)" }}>
                <Plus size={14} className="text-cyan-ink flex-shrink-0 mt-[3px]" />
                {b}
              </li>
            ))}
          </ul>
        </div>
        <div
          className="bg-surface border border-line rounded-[14px] p-6 relative overflow-hidden"
          style={{ minHeight: 320, boxShadow: "var(--shadow-2)" }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(10,15,30,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(10,15,30,0.035) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
              maskImage: "linear-gradient(135deg, rgba(0,0,0,0.6), transparent 80%)",
            }}
          />
          <div className="relative">{p.viz}</div>
        </div>
      </div>
    </section>
  );
}
