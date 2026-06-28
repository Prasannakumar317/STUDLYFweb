import React, { useState } from "react";
import { Toaster } from "./components/ui/sonner";
import Navbar from "./components/landing/Navbar";
import Hero from "./components/landing/Hero";
import TrustedBy from "./components/landing/TrustedBy";
import Features from "./components/landing/Features";
import Solutions from "./components/landing/Solutions";
import Workflow from "./components/landing/Workflow";
import Agents from "./components/landing/Agents";
import DashboardPreview from "./components/landing/DashboardPreview";
import Metrics from "./components/landing/Metrics";
import Testimonials from "./components/landing/Testimonials";
import Pricing from "./components/landing/Pricing";
import FAQ from "./components/landing/FAQ";
import Blog from "./components/landing/Blog";
import Newsletter from "./components/landing/Newsletter";
import Footer from "./components/landing/Footer";
import ChatWidget from "./components/landing/ChatWidget";
import SignupDialog from "./components/landing/SignupDialog";
import "./App.css";

function App() {
  const [signupOpen, setSignupOpen] = useState(false);
  const openSignup = () => setSignupOpen(true);

  const watchDemo = () => {
    document.getElementById("workflow")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="App relative bg-white text-gray-900 overflow-x-hidden" data-testid="landing-page">
      <Navbar onGetStarted={openSignup} />
      <main>
        <Hero onGetStarted={openSignup} onWatchDemo={watchDemo} />
        <TrustedBy />
        <Features />
        <Solutions />
        <Workflow />
        <Agents />
        <DashboardPreview />
        <Metrics />
        <Testimonials />
        <Pricing onSelect={openSignup} />
        <Blog />
        <FAQ />
        <Newsletter />
      </main>
      <Footer />
      <ChatWidget />
      <SignupDialog open={signupOpen} onOpenChange={setSignupOpen} />
      <Toaster position="bottom-center" richColors />
    </div>
  );
}

export default App;
