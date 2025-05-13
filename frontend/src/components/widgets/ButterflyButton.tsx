import { Button } from "../../components/ui/button";

export const ButterflyButton = () => (
  <div className="fixed right-3 sm:right-4 md:right-6 bottom-24 sm:bottom-28 md:bottom-32 z-40">
    <Button className="rounded-full shadow-lg w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-fuchsia-500 hover:bg-fuchsia-600">
      🦋
    </Button>
  </div>
);
