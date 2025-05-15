import { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";

export const SlidingTextWithPercentage = ({
  percentage = 63,
  text = "הזדהו עם המשפט : ''לפעמים הוא צועק, אבל הוא אף פעם לא יפגע בי באמת''",
  primaryColor = "#4361ee",
  textColor = "#000000",
  direction = "rtl",
  animationDuration = 1400,
  delay = 300,
}) => {
  const controls = useAnimation();
  const messageControls = useAnimation();
  const [displayedPercentage, setDisplayedPercentage] = useState(0);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Handle the text slide animation
  useEffect(() => {
    if (inView) {
      // Start the main animation
      controls.start("visible");

      // Start the message animation after a fixed delay
      const messageDelay = animationDuration;
      setTimeout(() => {
        messageControls.start("visible");
      }, messageDelay);
    }
  }, [inView, controls, messageControls, animationDuration, delay]);

  // Handle the percentage counting animation
  useEffect(() => {
    if (!inView) return;

    // Calculate how many steps to take for smooth animation
    const steps = 60; // 60 steps for a smooth animation
    const stepDuration = animationDuration / steps; // Time per step
    const increment = percentage / steps; // How much to increment each step

    let currentStep = 0;
    let currentValue = 0;

    const timer = setInterval(() => {
      currentStep++;
      currentValue = Math.min(percentage, Math.round(increment * currentStep));
      setDisplayedPercentage(currentValue);

      if (currentStep >= steps || currentValue >= percentage) {
        setDisplayedPercentage(percentage); // Ensure we end at exact percentage
        clearInterval(timer);
      }
    }, stepDuration);

    return () => clearInterval(timer); // Cleanup on unmount
  }, [inView, percentage, animationDuration]);

  const slideVariants = {
    hidden: {
      x: direction === "rtl" ? 300 : -300,
      opacity: 0,
    },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "tween",
        ease: "easeOut",
        duration: animationDuration / 1000,
        delay: delay / 1000,
      },
    },
  };

  return (
    <div
      className="w-full mb-[104px] rounded-lg"
      ref={ref}
      style={{ minHeight: "300px" }}
    >
      {/* Main content - percentage and text */}
      <motion.div
        className="flex items-center justify-center max-w-3xl mx-auto h-full"
        initial="hidden"
        animate={controls}
        variants={slideVariants}
      >
        <div
          className="p-6 text-6xl md:text-9xl font-bold flex items-center justify-center"
          style={{ color: primaryColor }}
        >
          {displayedPercentage}%
        </div>

        <div
          className="p-6 text-xl md:text-[25px] font-medium w-64 md:w-80 break-words whitespace-normal leading-tight min-h-32 flex items-center"
          style={{
            color: textColor,
            textAlign: direction === "rtl" ? "right" : "left",
          }}
          dir={direction}
        >
          {text}
        </div>
      </motion.div>
    </div>
  );
};
