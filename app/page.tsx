import CTASection from "./components/CTASection";
import FAQ from "./components/FAQ";
import Features from "./components/Features";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";
import Marquee from "./components/Marquee";
import MouseGlow from "./components/MouseGlow";
import Navbar from "./components/Navbar";
import Showcase from "./components/Showcase";
import Stats from "./components/Stats";
import Testimonials from "./components/Testimonials";

const marqueeItems = [
  "Client-first workflows",
  "Built for speed",
  "Calm by design",
  "Quietly powerful",
  "Engineered to scale",
  "Made for teams",
];

export default function Home() {
  return (
    <div className="relative isolate flex min-h-screen flex-col bg-black text-white">
      <MouseGlow />
      <Navbar />
      <main className="relative z-10 flex flex-1 flex-col">
        <Hero />
        <Marquee items={marqueeItems} />
        <Features />
        <Showcase />
        <HowItWorks />
        <Marquee items={marqueeItems.slice().reverse()} reverse />
        <Stats />
        <Testimonials />
        <FAQ />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
