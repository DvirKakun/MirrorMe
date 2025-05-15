import { useState, useEffect } from "react";

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  // Track scroll position and update state
  useEffect(() => {
    const handleScroll = () => {
      // Consider "scrolled" when the user has scrolled down more than 10px
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 10);
    };

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll);

    // Clean up event listener on unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={`h-[80px] fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 md:px-12 lg:px-24 py-3 md:py-4 border-b shadow-sm flex items-center transition-all duration-300 ${
        isScrolled ? "bg-white/65 backdrop-blur-sm" : "bg-white"
      }`}
    >
      <h1 className="font-bold text-[32px] tracking-tight ml-2 sm:ml-6">
        MirrorMe
      </h1>
    </header>
  );
};
