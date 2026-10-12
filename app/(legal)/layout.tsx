import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="landing-root">
      <header className="border-b border-line px-6 py-6">
        <nav aria-label="Policy navigation" className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-4">
          <Link href="/" aria-label="CodeConnect home"><Logo /></Link>
          <div className="flex gap-6 text-sm underline underline-offset-4">
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-12 text-ink-2 leading-7 [&_h1]:mb-4 [&_h1]:text-4xl [&_h1]:font-bold [&_h1]:leading-tight [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_a]:underline [&_a]:underline-offset-4">
        {children}
      </main>
      <footer className="border-t border-line px-6 py-6 text-center text-sm text-muted">
        Questions? <a className="underline" href="mailto:dhaval@codeconnectai.tech">dhaval@codeconnectai.tech</a>
      </footer>
    </div>
  );
}
