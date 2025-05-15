import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import AnimatedCircularProgress from "./AnimatedCircularProgress";

export const CircularProgressContainer = ({
  items = [
    {
      percentage: 75,
      label:
        "מהנשים הגיעו דרך המשפט:\n'הוא רק מרים את הקול הוא לא באמת יפגע בי'",
    },
    {
      percentage: 45,
      label:
        "מהנשים הגיעו דרך המשפט:\n'הוא לא אוהב את החברות שלי, הן משפיעות עליי בצורה רעה לדעתו'",
    },
    {
      percentage: 90,
      label:
        "מהנשים הגיעו דרך המשפט:\n'הוא אומר שאני לא מספיק טובה, אבל זה רק כדי לעזור לי להשתפר'",
    },
  ],
  containerWidth = 1000,
  rtl = false,
  accentColor = "#4762FF",
  trackColor = "#e2e8f0",
  textColor = "black",
  backgroundColor = "white",
}) => {
  const circleSize = Math.floor((containerWidth - 120) / 3);
  const thickness = Math.max(8, Math.floor(circleSize / 25));

  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold: 0.3 });

  useEffect(() => {
    if (inView) {
      controls.start({ opacity: 1, y: 0, transition: { duration: 0.8 } });
    } else {
      controls.start({ opacity: 0, y: 40, transition: { duration: 0.5 } });
    }
  }, [inView, controls]);

  return (
    <motion.div
      ref={ref}
      className="w-full flex justify-center my-8"
      initial={{ opacity: 0, y: 40 }}
      animate={controls}
    >
      <div
        className={`flex flex-row items-start h-full justify-between p-8`}
        style={{
          width: `${containerWidth}px`,
          direction: rtl ? "rtl" : "ltr",
          backgroundColor: backgroundColor,
        }}
      >
        {items.map((item, index) => (
          <div key={index} className="flex-1 mx-4">
            <div className="rounded-full p-6">
              <AnimatedCircularProgress
                targetPercentage={item.percentage}
                label={item.label}
                size={circleSize - 48}
                strokeWidth={thickness}
                primaryColor={accentColor}
                secondaryColor={trackColor}
                textColor={textColor}
                resetTrigger={!inView} // 🔹 this triggers the reset
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
