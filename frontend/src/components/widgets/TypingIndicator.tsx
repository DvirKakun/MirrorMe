import { motion } from "framer-motion";

export const TypingIndicator = ({ isTyping = true }) => {
  if (!isTyping) return null;

  return (
    <div className="flex justify-end items-center ml-auto mr-4 mb-4 sm:mb-6">
      <div className="flex items-center gap-1 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full px-4 py-2 shadow-sm">
        <span className="text-gray-500 text-sm font-medium mr-1">
          דנה מקלידה
        </span>
        <div className="flex">
          {[0, 1, 2].map((dot) => (
            <motion.div
              key={dot}
              className="w-1.5 h-1.5 bg-gradient-to-r from-indigo-400 to-blue-400 rounded-full"
              initial={{ opacity: 0.3 }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: dot * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
