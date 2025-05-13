import { Button } from "../../components/ui/button";

export const SOSButton = () => {
  const handleSOS = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.replace("https://www.ynet.co.il");
  };
  return (
    <div className="fixed right-3 sm:right-4 md:right-6 bottom-10 sm:bottom-12 md:bottom-16 z-50">
      <Button
        variant="destructive"
        className="rounded-full shadow-xl w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14"
        onClick={handleSOS}
      >
        SOS
      </Button>
    </div>
  );
};
