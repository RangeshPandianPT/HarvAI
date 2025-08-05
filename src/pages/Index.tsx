import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import LiveDemo from "@/components/LiveDemo";
import RealTimeStats from "@/components/RealTimeStats";
import InteractiveMap from "@/components/InteractiveMap";
import VideoShowcase from "@/components/VideoShowcase";
import HowItWorks from "@/components/HowItWorks";
import TechStack from "@/components/TechStack";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Dashboard from "@/components/Dashboard";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-lg">Loading HarvAI...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <LiveDemo />
      <RealTimeStats />
      <InteractiveMap />
      <VideoShowcase />
      <HowItWorks />
      <TechStack />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
