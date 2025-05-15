import { motion } from "framer-motion";
import { useState } from "react";

export const InfoPage = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const staggerItems = {
    visible: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <div
      className="min-h-[calc(100vh-200px)] p-4 sm:p-6 w-full mt-[104px]"
      dir="rtl"
    >
      <motion.div
        className="max-w-full sm:max-w-lg md:max-w-2xl lg:max-w-3xl w-full mx-auto"
        initial="hidden"
        animate="visible"
        variants={staggerItems}
      >
        {/* Header */}
        <motion.div variants={fadeIn} className="mb-8 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-[#333333]">
            מידע על <span className="text-[#4361ee]">אלימות</span>
          </h1>
          <p className="text-[#666666] mt-2 text-sm sm:text-base">
            משאבים ומידע לתמיכה והעלאת מודעות
          </p>
        </motion.div>

        {/* Podcast section */}
        <motion.div
          variants={fadeIn}
          className="bg-white rounded-lg shadow-sm p-6 mb-8 border-r-4 border-[#4361ee]"
        >
          <h2 className="text-xl font-bold text-[#333333] mb-3">
            הפודקאסט המומלץ
          </h2>
          <p className="text-[#666666] mb-4">
            הפודקאסט "קולות" עוסק בסיפורים אמיתיים של נשים שחוו אלימות ומצאו את
            דרכן החוצה. הסיפורים הללו מעלים מודעות ומספקים תקווה לנשים במצבים
            דומים.
          </p>

          <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-16 w-16 bg-[#4361ee] rounded-md flex items-center justify-center">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="text-white"
                >
                  {isPlaying ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="6" y="4" width="4" height="16"></rect>
                      <rect x="14" y="4" width="4" height="16"></rect>
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  )}
                </button>
              </div>
              <div className="mr-4">
                <h3 className="text-lg font-medium text-[#333333]">
                  קולות: הסיפור האישי שלי
                </h3>
                <p className="text-sm text-[#666666]">
                  פרק 12: לשבור את מעגל השתיקה
                </p>
              </div>
            </div>

            {/* Simple progress bar */}
            <div className="mt-3 bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#4361ee] h-2 rounded-full"
                style={{
                  width: isPlaying ? "45%" : "12%",
                  transition: "width 1s ease-in-out",
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-[#666666] mt-1">
              <span>{isPlaying ? "18:23" : "5:12"}</span>
              <span>42:10</span>
            </div>
          </div>
        </motion.div>

        {/* Resources section */}
        <motion.div
          variants={fadeIn}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <h2 className="text-xl font-bold text-[#333333] mb-3">
            משאבים נוספים
          </h2>
          <ul className="space-y-3">
            <li>
              <a
                href="#"
                className="flex items-center text-[#4361ee] hover:underline"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                קו חירום ארצי לנפגעות אלימות
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center text-[#4361ee] hover:underline"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                מרכזי תמיכה וסיוע
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center text-[#4361ee] hover:underline"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                מידע משפטי ראשוני
              </a>
            </li>
          </ul>
        </motion.div>

        {/* Bottom message */}
        <motion.div variants={fadeIn} className="mt-6 text-center">
          <p className="text-sm text-[#666666]">
            <span className="text-[#4361ee] font-bold">זכרי: </span>
            את לא לבד. יש אנשים שיכולים ורוצים לעזור.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};
