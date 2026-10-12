import { cn } from "@/lib/utils";

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      className="cc-logo-svg block transition-transform duration-400"
      style={{ filter: "drop-shadow(0 4px 12px rgba(6,182,212,0.25))" }}
    >
      <defs>
        <linearGradient id="cc-lg-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="55%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <radialGradient id="cc-lg-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="rgba(6,182,212,0.35)" />
          <stop offset="100%" stopColor="rgba(6,182,212,0)" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="19" fill="url(#cc-lg-glow)" />
      <polygon
        points="20,3 35.5,11.5 35.5,28.5 20,37 4.5,28.5 4.5,11.5"
        fill="url(#cc-lg-grad)"
        stroke="rgba(10,15,30,0.15)"
        strokeWidth="0.6"
      />
      <polygon
        points="20,9 30,14.5 30,25.5 20,31 10,25.5 10,14.5"
        fill="none"
        stroke="rgba(255,255,255,0.7)"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <circle cx="20" cy="20" r="3" fill="white" />
      <circle cx="20" cy="20" r="1.4" fill="url(#cc-lg-grad)" />
      <line x1="20" y1="20" x2="20" y2="9" stroke="white" strokeWidth="1" strokeOpacity="0.7" />
      <line x1="20" y1="20" x2="30" y2="25.5" stroke="white" strokeWidth="1" strokeOpacity="0.7" />
      <line x1="20" y1="20" x2="10" y2="25.5" stroke="white" strokeWidth="1" strokeOpacity="0.7" />
      <circle cx="20" cy="9" r="1.5" fill="white" />
      <circle cx="30" cy="25.5" r="1.5" fill="white" />
      <circle cx="10" cy="25.5" r="1.5" fill="white" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("inline-flex items-center gap-[10px] group", className)}>
      <div className="relative grid place-items-center w-[30px] h-[30px]">
        <div
          className="absolute inset-[-6px] rounded-full animate-pulse-ring"
          style={{
            background: "radial-gradient(circle, rgba(34,211,238,0.2), transparent 70%)",
          }}
        />
        <LogoMark size={30} />
      </div>
      <span
        className="font-bold text-[18px] leading-none tracking-[-0.02em] text-ink"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        Code
        <b className="grad-text-hero font-bold" style={{ fontStyle: "normal" }}>
          Connect
        </b>
      </span>
    </div>
  );
}
