import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, CheckCircle } from "lucide-react";

export type AlertType = "error" | "success";

export const AlertComponent = ({
  message,
  type = "error",
  isVisible,
  onClose,
}: {
  message: string;
  type: AlertType;
  isVisible: boolean;
  onClose: () => void;
}) => {
  // Determine background color and icon based on type
  const getBackground = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-300";
      case "error":
      default:
        return "bg-red-50 border-red-300";
    }
  };

  const getIconColor = () => {
    switch (type) {
      case "success":
        return "text-green-500";
      case "error":
      default:
        return "text-red-500";
    }
  };

  const Icon = type === "success" ? CheckCircle : AlertCircle;

  return (
    <div
      className="fixed inset-0 flex items-end justify-center pointer-events-none z-50 mb-4 p-4 rtl"
      dir="rtl"
    >
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`${getBackground()} border shadow-lg rounded-lg p-4 max-w-md w-full pointer-events-auto flex items-start`}
          >
            <div className={`flex-shrink-0 ${getIconColor()}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="mr-3 flex-1">
              <p className="text-sm text-gray-800">{message}</p>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 mr-auto ml-1 bg-transparent text-gray-400 hover:text-gray-500 focus:outline-none rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
