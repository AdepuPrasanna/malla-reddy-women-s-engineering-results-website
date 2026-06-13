import { useEffect, useState } from "react";
import SEOHead from "./components/SEOHead";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import About from "./components/About";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";

export default function App() {
  const [tab, setTab] = useState("individual");
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "dark";
    return localStorage.getItem("mrecw-theme") || "dark";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("mrecw-theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }

  return (
    <>
      <SEOHead />
      <Navbar theme={theme} onToggleTheme={toggleTheme} />
      <main>
        <Hero tab={tab} setTab={setTab} />
        <Features />
        <About />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
