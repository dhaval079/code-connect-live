"use client";

import { Button } from "@/components/ui/button";
import { useRoom } from "@/components/landing/room-context";
import { ArrowRight } from "lucide-react";

export function CtaBand() {
  const { startRoom: onStart } = useRoom();
  return (
    <section className="px-8 my-16">
      <div
        className="max-w-[1216px] mx-auto px-12 py-16 rounded-[20px] relative overflow-hidden"
        style={{ background: "var(--color-ink)" }}
      >
        {/* Gradient blobs */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(400px 200px at 80% 50%, rgba(6,182,212,0.35), transparent 60%), radial-gradient(500px 260px at 10% 100%, rgba(139,92,246,0.25), transparent 60%)",
          }}
        />

        <div className="relative flex items-center justify-between gap-8 flex-wrap">
          <h2
            className="text-white font-bold"
            style={{
              fontSize: "clamp(28px, 3.2vw, 44px)",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              maxWidth: "18ch",
            }}
          >
            Ready to{" "}
            <em
              className="grad-text-cyan-violet not-italic"
              style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 400 }}
            >
              code in sync
            </em>?
          </h2>

          <div className="flex items-center gap-3">
            <Button variant="accent" size="lg" onClick={onStart} className="flex items-center gap-2">
              Start a free room <ArrowRight size={15} />
            </Button>
            <button
              className="px-[22px] py-[14px] rounded-full border text-white cursor-pointer font-medium text-[14px] transition-all duration-[220ms] hover:bg-white/10"
              style={{
                background: "rgba(255,255,255,0.06)",
                borderColor: "rgba(255,255,255,0.15)",
                fontFamily: "var(--font-sans)",
              }}
            >
              Read the docs
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
