import React, { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import CircularProgress from "./CircularProgress";

interface AnimatedCircularProgressProps {
  targetPercentage: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  primaryColor?: string;
  secondaryColor?: string;
  textColor?: string;
  resetTrigger?: boolean;
}

const AnimatedCircularProgress: React.FC<AnimatedCircularProgressProps> = ({
  targetPercentage,
  size,
  strokeWidth,
  label,
  primaryColor,
  secondaryColor,
  textColor,
  resetTrigger,
}) => {
  const [ref, inView] = useInView({ triggerOnce: false });
  const [animatedPercent, setAnimatedPercent] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (inView) {
      let current = 0;
      const duration = 1000;
      const fps = 60;
      const totalFrames = (duration / 1000) * fps;
      const increment = targetPercentage / totalFrames;

      interval = setInterval(() => {
        current += increment;
        if (current >= targetPercentage) {
          current = targetPercentage;
          clearInterval(interval);
        }
        setAnimatedPercent(Math.round(current));
      }, 1000 / fps);
    }

    return () => clearInterval(interval);
  }, [inView, targetPercentage, resetTrigger]); // 🔹 resetTrigger in deps

  useEffect(() => {
    if (!inView) {
      setAnimatedPercent(0); // 🔹 reset to 0 when out of view
    }
  }, [inView]);

  return (
    <div ref={ref}>
      <CircularProgress
        percentage={animatedPercent}
        size={size}
        strokeWidth={strokeWidth}
        label={label}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        textColor={textColor}
      />
    </div>
  );
};

export default AnimatedCircularProgress;
