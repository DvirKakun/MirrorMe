import { useState, useEffect } from "react";
import { AlertComponent } from "../components/widgets/Alert";
import type { AlertType } from "../components/widgets/Alert";

// Alert context props
type AlertContextProps = {
  showAlert: (message: string, type?: AlertType) => void;
  hideAlert: () => void;
};

// Create a context for the alert
import { createContext, useContext } from "react";
const AlertContext = createContext<AlertContextProps | undefined>(undefined);

// Custom hook to use the alert
export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
};

// Alert Provider component
export const AlertProvider = ({ children }: { children: React.ReactNode }) => {
  const [alertInfo, setAlertInfo] = useState<{
    message: string;
    type: AlertType;
    isVisible: boolean;
  }>({
    message: "",
    type: "error",
    isVisible: false,
  });

  const showAlert = (message: string, type: AlertType = "error") => {
    setAlertInfo({
      message,
      type,
      isVisible: true,
    });
  };

  const hideAlert = () => {
    setAlertInfo((prev) => ({ ...prev, isVisible: false }));
  };

  // Auto-hide the alert after 5 seconds
  useEffect(() => {
    if (alertInfo.isVisible) {
      const timer = setTimeout(() => {
        hideAlert();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alertInfo.isVisible]);

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <AlertComponent
        message={alertInfo.message}
        type={alertInfo.type}
        isVisible={alertInfo.isVisible}
        onClose={hideAlert}
      />
    </AlertContext.Provider>
  );
};
