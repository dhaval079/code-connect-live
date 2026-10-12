import { Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const PLANS = [
  {
    tier: "Hobby",
    amt: "$0",
    amtSub: "/forever",
    blurb: "For solo builders and weekend hackers.",
    feats: ["Unlimited public rooms", "Up to 3 collaborators", "Community Discord", "7-day session history"],
    cta: "Start for free",
    featured: false,
  },
  {
    tier: "Team",
    tag: "POPULAR",
    amt: "$12",
    amtSub: "/user/month",
    blurb: "For teams shipping real software.",
    feats: ["Unlimited private rooms", "Up to 25 collaborators", "AI assistant · BYOK", "GitHub + GitLab native", "Persistent rooms", "90-day history"],
    cta: "Start 14-day trial",
    featured: true,
  },
  {
    tier: "Enterprise",
    amt: "Custom",
    amtSub: "/annual",
    blurb: "SSO, audit, and air-gap deploys.",
    feats: ["Everything in Team", "SAML SSO · SCIM", "Self-hosted (Helm)", "Dedicated support", "Custom SLA"],
    cta: "Talk to sales",
    featured: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="max-w-[1280px] mx-auto px-8 py-24">
      <div className="flex items-end justify-between gap-6 mb-12 flex-wrap">
        <div>
          <div
            className="text-muted"
            style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500, letterSpacing: "0.1em" }}
          >
            § 06 — Pricing
          </div>
          <h2
            className="mt-3 font-bold text-ink"
            style={{ fontSize: "clamp(32px, 4vw, 56px)", lineHeight: 1.05, letterSpacing: "-0.03em", maxWidth: "18ch" }}
          >
            Pricing that{" "}
            <em style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 400, color: "var(--color-ink-2)" }}>
              scales with you
            </em>.
          </h2>
        </div>
        <p className="text-ink-2 max-w-[42ch]" style={{ fontSize: 16, lineHeight: 1.55 }}>
          Start free, upgrade when you need it. No seat-tax on the assistant.
        </p>
      </div>

      <div
        className="mt-12 border border-line rounded-[20px] bg-surface overflow-hidden grid"
        style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
      >
        {PLANS.map((plan, i) => (
          <div
            key={i}
            className="flex flex-col px-7 py-9 relative"
            style={{
              borderRight: i < 2 ? "1px solid var(--color-line)" : "none",
              background: plan.featured ? "var(--color-ink)" : "var(--color-surface)",
              color: plan.featured ? "var(--color-paper)" : "var(--color-ink)",
            }}
          >
            {/* Tier */}
            <div
              className="inline-flex items-center gap-2 mb-4 uppercase"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.1em",
                color: plan.featured ? "var(--color-cyan-400, #22d3ee)" : "var(--color-muted)",
              }}
            >
              {plan.tier}
              {plan.tag && (
                <span
                  className="px-[7px] py-[3px] rounded-full bg-[#22d3ee] text-ink"
                  style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em" }}
                >
                  {plan.tag}
                </span>
              )}
            </div>

            {/* Price */}
            <div
              className="font-bold"
              style={{
                fontSize: "clamp(36px, 4vw, 52px)",
                lineHeight: 1,
                letterSpacing: "-0.03em",
              }}
            >
              {plan.amt}
              <small
                className="ml-1 not-italic"
                style={{
                  fontSize: 14,
                  fontWeight: 400,
                  letterSpacing: 0,
                  color: plan.featured ? "rgba(255,255,255,0.6)" : "var(--color-muted)",
                }}
              >
                {plan.amtSub}
              </small>
            </div>

            {/* Blurb */}
            <p
              className="mt-3 mb-6"
              style={{
                fontSize: 13,
                lineHeight: 1.5,
                color: plan.featured ? "rgba(255,255,255,0.7)" : "var(--color-muted)",
              }}
            >
              {plan.blurb}
            </p>

            {/* Features */}
            <ul className="list-none p-0 mb-6 grid gap-[10px] flex-1">
              {plan.feats.map((feat, j) => (
                <li key={j} className="flex items-start gap-[10px]" style={{ fontSize: 13, lineHeight: 1.4 }}>
                  <Plus
                    size={13}
                    style={{
                      color: plan.featured ? "#22d3ee" : "var(--color-cyan-ink)",
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  />
                  <span style={{ color: plan.featured ? "rgba(255,255,255,0.85)" : "var(--color-ink-2)" }}>
                    {feat}
                  </span>
                </li>
              ))}
            </ul>

            <Button
              variant={plan.featured ? "accent" : "primary"}
              size="lg"
              className="w-full flex items-center justify-center gap-2"
            >
              {plan.cta} <ArrowRight size={14} />
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
