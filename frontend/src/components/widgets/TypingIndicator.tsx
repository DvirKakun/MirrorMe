import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import type { FC } from "react";

import type { TypewriterTextProps } from "../../types";

// Modern Typing Indicator
export const TypingIndicator = ({ isTyping = true }) => {
  if (!isTyping) return null;

  return (
    <div className="flex justify-end items-center ml-auto mr-4 mb-4 sm:mb-6">
      <motion.div
        className="flex items-center gap-2 bg-white rounded-full px-4 py-2.5 shadow-md border border-gray-100"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <span className="text-gray-700 text-sm font-medium mr-1">
          אלין מקלידה
        </span>
        <div className="flex gap-1">
          {[0, 1, 2].map((dot) => (
            <motion.div
              key={dot}
              className="w-2 h-2 bg-gradient-to-br from-[#4762FF] to-blue-400 rounded-full"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: dot * 0.15,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

// Completely redesigned Text Typing Animation Component
export const TypewriterText: FC<TypewriterTextProps> = ({
  text,
  typingSpeed = 30,
  startDelay = 500,
  showCursor = true,
  isComplete = false,
  onComplete = () => {},
  className = "",
}) => {
  // Instead of building up the text letter by letter, we'll reveal
  // characters from the full text based on a counter
  const [visibleChars, setVisibleChars] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fullTextRef = useRef(text);
  const containerRef = useRef<HTMLDivElement>(null);

  // Always update the ref if text changes
  useEffect(() => {
    fullTextRef.current = text;
  }, [text]);

  // Clear any existing timers when component unmounts
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Handle the animation start with delay
  useEffect(() => {
    if (isComplete) {
      // Immediately complete if requested
      setVisibleChars(fullTextRef.current.length);
      setIsDone(true);
      onComplete();
      return;
    }

    // Reset animation state on new text
    setVisibleChars(0);
    setIsDone(false);

    // Start with delay
    const startTimer = setTimeout(() => {
      animateText();
    }, startDelay);

    return () => clearTimeout(startTimer);
  }, [text, startDelay, isComplete]); // eslint-disable-line react-hooks/exhaustive-deps

  // The animation function
  const animateText = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Begin revealing characters one by one
    let currentIndex = 0;

    const revealNextChar = () => {
      if (currentIndex < fullTextRef.current.length) {
        currentIndex++;
        setVisibleChars(currentIndex);

        // Schedule next character
        timerRef.current = setTimeout(revealNextChar, typingSpeed);
      } else {
        // Animation complete - wait a moment before removing cursor
        timerRef.current = setTimeout(() => {
          setIsDone(true);
          onComplete();
        }, 800); // Keep cursor visible for a short time after animation finishes
      }
    };

    // Start the chain
    revealNextChar();
  };

  // Get the visible portion of text
  const visibleText = text.substring(0, visibleChars);

  return (
    <div className={`relative ${className}`} dir="rtl" ref={containerRef}>
      <div className="whitespace-pre-wrap min-w-[1ch]">
        {visibleText}
        {/* Inline cursor for better positioning */}
        {showCursor && !isDone && (
          <motion.span
            className="inline-block w-2 h-5 bg-[#4762FF] align-middle mx-[1px] relative top-[1px]"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </div>
    </div>
  );
};
