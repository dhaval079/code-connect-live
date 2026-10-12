"use client";

import { Users, Zap, Cpu, Lock, MessageSquare, GitBranch } from "lucide-react";

const FEATURES = [
  {
    icon: Users,
    title: "Real-time collaboration",
    desc: "Edit code in the same room and see updates from your collaborators.",
    tag: "01 — FLAGSHIP",
    span: "hero-card",
    preview: true,
  },
  {
    icon: Zap,
    title: "Live code updates",
    desc: "Room participants receive code changes through a shared realtime connection.",
    tag: "02",
    span: "span-3",
  },
  {
    icon: Cpu,
    title: "AI assistant",
    desc: "Use the editor’s assistant to ask questions about your code.",
    tag: "03",
    span: "span-3",
  },
  {
    icon: Lock,
    title: "Shareable rooms",
    desc: "Create a room and invite collaborators with its link. Share it only with people you trust.",
    tag: "04",
    span: "span-2",
  },
  {
    icon: MessageSquare,
    title: "Room chat",
    desc: "Discuss your code with collaborators without leaving the editor.",
    tag: "05",
    span: "span-2",
  },
  {
    icon: GitBranch,
    title: "Browser editor",
    desc: "Write and run code from your browser without installing an editor.",
    tag: "06",
    span: "span-2",
  },
];

export function Features() {
  return (
    <section id="features" className="max-w-[1280px] mx-auto px-8 py-24">
      <div className="flex items-end justify-between gap-6 mb-12 flex-wrap">
        <div>
          <div
            className="text-muted"
            style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500, letterSpacing: "0.1em" }}
          >
            § 01 — Primitives
          </div>
          <h2
            className="mt-3 font-bold text-ink"
            style={{ fontSize: "clamp(32px, 4vw, 56px)", lineHeight: 1.05, letterSpacing: "-0.03em", maxWidth: "18ch" }}
          >
            Built for the way{" "}
            <em style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 400, color: "var(--color-ink-2)" }}>
              real teams
            </em>{" "}
            code.
          </h2>
        </div>
        <p className="text-ink-2 max-w-[42ch]" style={{ fontSize: 16, lineHeight: 1.55 }}>
          CodeConnect brings shared editing and conversation into one browser workspace.
        </p>
      </div>

      <div
        className="grid gap-5"
        style={{ gridTemplateColumns: "repeat(6, 1fr)" }}
      >
        {FEATURES.map((feat, i) => {
          const isHero = feat.span === "hero-card";
          const spanCol =
            feat.span === "hero-card" ? 3 : feat.span === "span-3" ? 3 : feat.span === "span-2" ? 2 : 4;

          return (
            <div
              key={i}
              className="p-7 rounded-[14px] border relative overflow-hidden transition-all duration-[280ms] group"
              style={{
                gridColumn: `span ${spanCol}`,
                gridRow: isHero ? "span 2" : undefined,
                background: isHero ? "var(--color-ink)" : "var(--color-surface)",
                borderColor: isHero ? "var(--color-ink)" : "var(--color-line)",
                display: isHero ? "flex" : undefined,
                flexDirection: isHero ? "column" : undefined,
                padding: isHero ? 36 : 28,
              }}
              onMouseEnter={(e) => {
                if (!isHero) {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-2)";
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--color-line-2)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isHero) {
                  (e.currentTarget as HTMLElement).style.transform = "";
                  (e.currentTarget as HTMLElement).style.boxShadow = "";
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--color-line)";
                }
              }}
            >
              {/* Icon */}
              <div
                className="w-10 h-10 rounded-[10px] grid place-items-center mb-5 flex-shrink-0"
                style={{
                  background: isHero ? "rgba(255,255,255,0.08)" : "var(--color-paper-2)",
                  color: isHero ? "#22d3ee" : "var(--color-ink)",
                }}
              >
                <feat.icon size={20} />
              </div>

              {/* Tag */}
              <div
                className="absolute top-[18px] right-[18px]"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: "0.06em",
                  color: isHero ? "rgba(255,255,255,0.5)" : "var(--color-muted)",
                }}
              >
                {feat.tag}
              </div>

              <div
                className="font-semibold mb-2"
                style={{
                  fontSize: isHero ? 26 : 18,
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                  color: isHero ? "white" : "var(--color-ink)",
                }}
              >
                {feat.title}
              </div>
              <div
                style={{
                  fontSize: isHero ? 15 : 14,
                  lineHeight: 1.55,
                  color: isHero ? "rgba(255,255,255,0.7)" : "var(--color-ink-2)",
                }}
              >
                {feat.desc}
              </div>

              {feat.preview && (
                <div
                  className="mt-auto rounded-[10px] p-[14px] border"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    borderColor: "rgba(255,255,255,0.08)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    lineHeight: 1.6,
                    color: "rgba(255,255,255,0.75)",
                    marginTop: "auto",
                  }}
                >
                  <div><span className="tk-kw-dark">on</span>(<span className="tk-str-dark">'cursor'</span>, <span className="tk-fn-dark">broadcast</span>)</div>
                  <div><span className="tk-kw-dark">on</span>(<span className="tk-str-dark">'edit'</span>, <span className="tk-fn-dark">merge</span>)</div>
                  <div><span className="tk-kw-dark">on</span>(<span className="tk-str-dark">'join'</span>, <span className="tk-fn-dark">welcome</span>)</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
