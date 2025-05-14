import { Link } from "react-router-dom";
import type { NavButtonProps } from "../../types/index";

export const NavButton = ({
  to,
  label,
  icon,
  activeIcon,
  isActive,
}: NavButtonProps) => (
  <Link
    to={to}
    className={`flex flex-col items-center text-center w-full gap-1 px-1 py-2 transition-colors relative ${
      isActive
        ? "text-main border-l-2 md:border-l-4 border-main"
        : "text-gray-600 hover:text-main"
    }`}
  >
    <div
      className={`text-lg sm:text-xl md:text-2xl ${
        isActive ? "text-main" : "text-gray-600"
      }`}
    >
      {isActive ? activeIcon : icon}
    </div>
    <span className="text-[10px] sm:text-[14px] font-medium leading-tight">
      {label}
    </span>
  </Link>
);
