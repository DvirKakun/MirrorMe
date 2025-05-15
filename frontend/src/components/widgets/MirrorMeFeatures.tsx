import { useRef } from "react";
import { motion } from "framer-motion";

export const MirrorMeFeatures = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      {/* Title Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-[#4762FF] mb-6">
          מה תמצאי באתר של MirrorMe?
        </h2>
      </motion.div>

      {/* Features in Z-pattern */}
      <div className="space-y-16 md:space-y-24">
        {/* Feature 1 - Right aligned */}
        <FeatureItem
          icon="📖"
          title="סיפורים אישיים"
          description="עדויות אמיתיות של נשים אחרות — שיתופים שקטים שיכולים לשקף גם את מה שאת מרגישה, אפילו אם עוד לא אמרת את זה בקול."
          alignment="right"
          delay={0.1}
        />

        {/* Feature 2 - Left aligned */}
        <FeatureItem
          icon="🗝️"
          title="הכספת שלך"
          description="אזור שמור ודיסקרטי רק בשבילך. אפשר להעלות לשם תמונות, הקלטות, קבצים ושיחות שתרצי לשמור — בלי שאף אחד יידע."
          alignment="right"
          delay={0.2}
        />

        {/* Feature 3 - Right aligned */}
        <FeatureItem
          icon="📝"
          title="שתפי את שעל ליבך"
          description="מרחב אנונימי לפרסום פוסטים, מחשבות ושאלות מהלב — נשים אחרות יוכלו להגיב, להזדהות ולחבק."
          alignment="right"
          delay={0.3}
        />

        {/* Feature 4 - Exit Button (Previously SOS) */}
        <FeatureItemExit
          icon="🚪"
          title="יציאה מהירה"
          description="כפתור גישה מיידית לעזרה או ליציאה מהאתר בלחיצה מהירה — אם מישהו לא צפוי נכנס."
          alignment="right"
          delay={0.4}
        />
      </div>
    </div>
  );
};

// Define TypeScript interface for FeatureItem props
interface FeatureItemProps {
  icon: string;
  title: string;
  description: string;
  alignment: "left" | "right";
  delay: number;
}

// Individual feature component with animations
const FeatureItem = ({
  icon,
  title,
  description,
  alignment,
  delay,
}: FeatureItemProps) => {
  const ref = useRef<HTMLDivElement>(null);

  // Animation variants based on alignment
  const variants = {
    hidden: {
      opacity: 0,
      x: alignment === "right" ? 50 : -50,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        delay,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="relative" ref={ref}>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={variants}
        className={`flex ${
          alignment === "right" ? "flex-row" : "flex-row-reverse"
        } items-center gap-6`}
      >
        {/* Icon Circle */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#E6EBFF] flex items-center justify-center text-3xl md:text-4xl shadow-md">
            {icon}
          </div>
        </div>

        {/* Content */}
        <div
          className={`flex-grow ${
            alignment === "right" ? "text-right" : "text-left"
          }`}
        >
          <h3 className="text-xl md:text-2xl font-bold text-[#4762FF] mb-2">
            {title}
          </h3>
          <p
            className="text-gray-700 text-base md:text-lg"
            style={{ direction: "rtl" }}
          >
            {description}
          </p>
        </div>
      </motion.div>

      {/* Connecting line for z-pattern (not visible on mobile) */}
      <div className="hidden md:block absolute w-1 bg-[#E6EBFF] left-0 h-24 -bottom-24 z-0">
        {alignment === "right" && (
          <motion.div
            initial={{ height: 0 }}
            whileInView={{ height: "100%" }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: delay + 0.4 }}
            className="w-full bg-[#4762FF] h-full opacity-30"
          />
        )}
      </div>
    </div>
  );
};

// Special Exit Button Component with custom styling
const FeatureItemExit = ({
  title,
  description,
  alignment,
  delay,
}: FeatureItemProps) => {
  const ref = useRef<HTMLDivElement>(null);

  // Animation variants based on alignment
  const variants = {
    hidden: {
      opacity: 0,
      x: alignment === "right" ? 50 : -50,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        delay,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="relative" ref={ref}>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={variants}
        className={`flex ${
          alignment === "right" ? "flex-row" : "flex-row-reverse"
        } items-center gap-6`}
      >
        {/* Exit Button with custom styling */}
        <div className="flex-shrink-0">
          <div className="rounded-full shadow-xl w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 border border-black bg-transparent text-black text-[10px] md:text-[12px] font-bold leading-tight p-8 flex items-center justify-center">
            {title}
          </div>
        </div>

        {/* Content */}
        <div
          className={`flex-grow ${
            alignment === "right" ? "text-right" : "text-left"
          }`}
        >
          <h3 className="text-xl md:text-2xl font-bold text-[#4762FF] mb-2">
            {title}
          </h3>
          <p
            className="text-gray-700 text-base md:text-lg"
            style={{ direction: "rtl" }}
          >
            {description}
          </p>
        </div>
      </motion.div>

      {/* No connecting line for the last item */}
    </div>
  );
};
