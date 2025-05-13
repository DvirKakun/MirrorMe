import { Link } from "react-router-dom";
import type { NavButtonProps } from "../../types/index";

export const NavButton = ({ to, label, icon, isActive }: NavButtonProps) => (
  <Link
    to={to}
    className={`flex flex-col items-center text-center w-full gap-1 px-1 py-2 transition-colors relative ${
      isActive
        ? "text-[#4762FF] border-l-2 md:border-l-4 border-[#4762FF]"
        : "text-gray-600 hover:text-[#4762FF]"
    }`}
  >
    <div
      className={`text-lg sm:text-xl md:text-2xl ${
        isActive ? "text-[#4762FF]" : "text-gray-600"
      }`}
    >
      {icon}
    </div>
    <span className="text-[8px] sm:text-[10px] leading-tight">{label}</span>
  </Link>
);
