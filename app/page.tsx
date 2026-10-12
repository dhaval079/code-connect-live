import { RoomProvider } from "@/components/landing/room-context";
import { Ticker } from "@/components/landing/ticker";
import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FaqList } from "@/components/landing/faq-list";
import { CtaBand } from "@/components/landing/cta-band";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <RoomProvider>
      <div className="landing-root">
        <Ticker />
        <Navbar />
        <Hero />
        <Features />
        <HowItWorks />
        <FaqList />
        <CtaBand />
        <Footer />
      </div>
    </RoomProvider>
  );
}
