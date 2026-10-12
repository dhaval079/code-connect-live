"use client";

import { Button } from "@/components/ui/button";
import { EditorMock } from "@/components/landing/editor-mock";
import { useRoom } from "@/components/landing/room-context";
import { ArrowUpRight } from "lucide-react";

export function Hero() {
  const { startRoom: onStart } = useRoom();
  return (
    <section className="max-w-[1280px] mx-auto px-8 pt-16 pb-12 relative">
      <div
        className="grid gap-12 items-start grid-cols-1 md:grid-cols-[1.2fr_1fr]"
      >
        {/* Left column */}
        <div>
          {/* Eyebrow */}
          <span
            className="inline-flex items-center gap-[10px] px-3 py-[6px] rounded-full bg-surface border border-line text-ink-2"
            style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500, letterSpacing: "0.04em" }}
          >
            <span
              className="bg-ink text-paper px-[7px] py-[3px] rounded-full font-semibold"
              style={{ fontSize: 10, letterSpacing: "0.06em" }}
            >
              BROWSER APP
            </span>
            Real-time collaborative coding
          </span>

          {/* Title */}
          <h1
            className="mt-6 mb-5 font-bold text-ink leading-[0.98]"
            style={{
              fontSize: "clamp(48px, 7vw, 96px)",
              letterSpacing: "-0.04em",
              maxWidth: "14ch",
              fontFamily: "var(--font-sans)",
            }}
          >
            Code together,
            <br />
            <em
              className="grad-text-cyan-violet not-italic"
              style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 400, letterSpacing: "-0.02em" }}
            >
              like you're in
            </em>
            <br />
            the same room
            <span
              className="inline-block w-[4px] bg-ink ml-[6px] cc-caret"
              style={{ height: "0.85em", verticalAlign: "-0.04em" }}
            />
          </h1>

          {/* Lede */}
          <p
            className="text-ink-2 mb-8"
            style={{ fontSize: 19, lineHeight: 1.55, maxWidth: "52ch", fontFamily: "var(--font-sans)" }}
          >
            A collaborative editor for pair programming, teaching, and coding interviews.
            Share a room, edit code together, and chat in your browser.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3 mb-12">
            <Button variant="primary" size="lg" onClick={onStart} className="flex items-center gap-2">
              Start a room <ArrowUpRight size={15} />
            </Button>

          </div>
        </div>

        {/* Right column — editor */}
        <div>
          <p className="text-muted mb-3 text-sm">Illustrative editor preview</p>
          <EditorMock />
        </div>
      </div>

    </section>
  );
}
