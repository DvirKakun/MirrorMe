// CircularProgress.tsx
import React from "react";

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  primaryColor?: string;
  secondaryColor?: string;
  textColor?: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage = 0,
  size = 120,
  strokeWidth = 8,
  label = "Loading",
  primaryColor = "#0ea5e9",
  secondaryColor = "#e2e8f0",
  textColor = "black",
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-start h-full">
      {/* Circle fixed size block */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          className="w-full h-full"
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: "rotate(-90deg)" }}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={secondaryColor}
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={primaryColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-bold" style={{ color: textColor }}>
            {Math.round(percentage)}%
          </span>
        </div>
      </div>

      {/* Label expands below without pushing circle */}
      {label && (
        <div
          className="mt-2 text-center font-medium whitespace-pre-line leading-snug"
          style={{ color: textColor }}
          dir="rtl"
        >
          {label}
        </div>
      )}
    </div>
  );
};

export default CircularProgress;
