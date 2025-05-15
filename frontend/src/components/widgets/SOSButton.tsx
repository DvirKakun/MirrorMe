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
        className="rounded-full shadow-xl w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 border border-black bg-transparent text-black text-[10px] md:text-[12px] font-bold leading-tight p-8"
        onClick={handleSOS}
      >
        <span>
          יציאה
          <br />
          מהירה
        </span>
      </Button>
    </div>
  );
};
