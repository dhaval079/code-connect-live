import { Logo } from "@/components/ui/logo";

const LINKS = {
  Product: [{ label: "Features", href: "#features" }, { label: "How it works", href: "#how" }, { label: "Open app", href: "https://app.codeconnectai.tech" }],
  Resources: [{ label: "FAQ", href: "#faq" }, { label: "Source", href: "https://github.com/dhaval079/code-connect-live" }],
  Company: [{ label: "Founder", href: "https://github.com/dhaval079" }, { label: "Contact", href: "mailto:dhaval@codeconnectai.tech" }, { label: "Privacy Policy", href: "/privacy" }, { label: "Terms of Service", href: "/terms" }],
};

export function Footer() {
  return (
    <footer className="border-t border-line px-8 pt-12 pb-6">
      <div
        className="max-w-[1280px] mx-auto grid gap-8"
        style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr" }}
      >
        {/* Brand */}
        <div>
          <Logo />
          <p
            className="text-muted mt-3"
            style={{ fontSize: 13, lineHeight: 1.5, maxWidth: "32ch" }}
          >
            A real-time collaborative coding platform. Built by @dhaval079. Get in touch at dhaval@codeconnectai.tech.
          </p>
        </div>

        {/* Link columns */}
        {Object.entries(LINKS).map(([section, items]) => (
          <div key={section}>
            <h4
              className="text-muted uppercase mb-[14px]"
              style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em" }}
            >
              {section}
            </h4>
            <ul className="list-none p-0 m-0 grid gap-2">
              {items.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-ink-2 hover:text-ink no-underline transition-colors duration-[200ms]"
                    style={{ fontSize: 13, lineHeight: 1 }}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div
        className="max-w-[1280px] mx-auto mt-12 pt-6 border-t border-line flex justify-between items-center text-muted"
        style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500, letterSpacing: "0.04em" }}
      >
        <span>© 2026 CODECONNECT</span>
        <span>dhaval@codeconnectai.tech</span>
      </div>
    </footer>
  );
}
