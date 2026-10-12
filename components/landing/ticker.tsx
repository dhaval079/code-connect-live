"use client";

const ITEMS = [
  "REAL-TIME COLLAB",
  "WEBRTC P2P",
  "INSTANT ROOMS",
  "AI ASSISTANT",
  "60 FPS · GPU ACCELERATED",
  "CODE TOGETHER",
  "NO INSTALL",
  "BYOB — BRING YOUR OWN BUG",
];

export function Ticker() {
  const track = [...ITEMS, ...ITEMS];

  return (
    <div
      className="bg-ink text-paper overflow-hidden border-b border-white/[0.08]"
      style={{ padding: "10px 0" }}
    >
      <div
        className="flex gap-12 whitespace-nowrap w-max animate-marquee"
        style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500, letterSpacing: "0.08em" }}
      >
        {track.map((t, i) => (
          <span key={i} className="inline-flex items-center gap-2">
            <span
              className="w-[5px] h-[5px] rounded-full bg-[#22d3ee]"
              style={{ boxShadow: "0 0 8px rgba(34,211,238,0.8)" }}
            />
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
