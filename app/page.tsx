import { RoomProvider } from "@/components/landing/room-context";
import { Ticker } from "@/components/landing/ticker";
import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { ProductDemo } from "@/components/landing/product-demo";
import { Features } from "@/components/landing/features";
import { Integrations } from "@/components/landing/integrations";
import { DeepSplit } from "@/components/landing/deep-split";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Pricing } from "@/components/landing/pricing";
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
        <ProductDemo />
        <Features />
        <Integrations />
        <DeepSplit />
        <HowItWorks />
        <Pricing />
        <FaqList />
        <CtaBand />
        <Footer />
      </div>
    </RoomProvider>
  );
}
