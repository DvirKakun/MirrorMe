import type { LayoutProps } from "../types/index";
import { useLocation } from "react-router-dom";
import { ButterflyButton } from "../components/widgets/ButterflyButton";
import { SOSButton } from "../components/widgets/SOSButton";
import { NavButton } from "../components/navigation/NavButton";

export const MainLayout = ({ children }: LayoutProps) => {
  // Get current location for active state
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col">
      {/* Top header with MirrorMe title */}
      <header className="px-4 sm:px-8 md:px-12 lg:px-24 py-3 md:py-4 border-b shadow-sm bg-white flex items-center">
        <h1 className="font-bold text-xl tracking-tight ml-2 sm:ml-6">
          MirrorMe
        </h1>
      </header>

      <div className="flex flex-1 relative">
        {/* Left side navigation */}
        <aside className="w-14 sm:w-16 md:w-20 lg:w-24 bg-white border-r flex flex-col items-center py-6 md:py-10 lg:py-20 space-y-6 md:space-y-8 fixed h-full z-20">
          <NavButton
            to="/"
            label="צ'אט"
            icon={
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M5.348 2.521C7.71613 2.1734 10.1065 1.99927 12.5 2C14.93 2 17.317 2.178 19.652 2.52C21.63 2.812 23 4.544 23 6.49V12.51C23 14.456 21.63 16.188 19.652 16.48C18.4983 16.6491 17.3389 16.7768 16.176 16.863C16.1168 16.8669 16.0593 16.8842 16.0079 16.9137C15.9564 16.9431 15.9123 16.984 15.879 17.033L13.124 21.166C13.0555 21.2687 12.9627 21.3529 12.8539 21.4112C12.745 21.4694 12.6235 21.4999 12.5 21.4999C12.3765 21.4999 12.255 21.4694 12.1461 21.4112C12.0373 21.3529 11.9445 21.2687 11.876 21.166L9.121 17.033C9.08768 16.984 9.04361 16.9431 8.99214 16.9137C8.94068 16.8842 8.88317 16.8669 8.824 16.863C7.66113 16.7765 6.50172 16.6484 5.348 16.479C3.37 16.189 2 14.455 2 12.509V6.491C2 4.545 3.37 2.811 5.348 2.521ZM7.25 8C7.25 7.80109 7.32902 7.61032 7.46967 7.46967C7.61032 7.32902 7.80109 7.25 8 7.25H17C17.1989 7.25 17.3897 7.32902 17.5303 7.46967C17.671 7.61032 17.75 7.80109 17.75 8C17.75 8.19891 17.671 8.38968 17.5303 8.53033C17.3897 8.67098 17.1989 8.75 17 8.75H8C7.80109 8.75 7.61032 8.67098 7.46967 8.53033C7.32902 8.38968 7.25 8.19891 7.25 8ZM8 10.25C7.80109 10.25 7.61032 10.329 7.46967 10.4697C7.32902 10.6103 7.25 10.8011 7.25 11C7.25 11.1989 7.32902 11.3897 7.46967 11.5303C7.61032 11.671 7.80109 11.75 8 11.75H12.5C12.6989 11.75 12.8897 11.671 13.0303 11.5303C13.171 11.3897 13.25 11.1989 13.25 11C13.25 10.8011 13.171 10.6103 13.0303 10.4697C12.8897 10.329 12.6989 10.25 12.5 10.25H8Z"
                  fill="currentColor"
                />
              </svg>
            }
            isActive={currentPath === "/"}
          />
          <NavButton
            to="/safe"
            label="הכספת"
            icon={
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16.5 10.5V6.75C16.5 5.55653 16.0259 4.41193 15.182 3.56802C14.3381 2.72411 13.1935 2.25 12 2.25C10.8065 2.25 9.66193 2.72411 8.81802 3.56802C7.97411 4.41193 7.5 5.55653 7.5 6.75V10.5M6.75 21.75H17.25C17.8467 21.75 18.419 21.5129 18.841 21.091C19.2629 20.669 19.5 20.0967 19.5 19.5V12.75C19.5 12.1533 19.2629 11.581 18.841 11.159C18.419 10.7371 17.8467 10.5 17.25 10.5H6.75C6.15326 10.5 5.58097 10.7371 5.15901 11.159C4.73705 11.581 4.5 12.1533 4.5 12.75V19.5C4.5 20.0967 4.73705 20.669 5.15901 21.091C5.58097 21.5129 6.15326 21.75 6.75 21.75Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
            isActive={currentPath === "/safe"}
          />
          <NavButton
            to="/blog"
            label="קהילה"
            icon={
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20.25 8.511C21.134 8.795 21.75 9.639 21.75 10.608V14.894C21.75 16.03 20.903 16.994 19.77 17.087C19.43 17.114 19.09 17.139 18.75 17.159V20.25L15.75 17.25C14.396 17.25 13.056 17.195 11.73 17.087C11.4413 17.0637 11.1605 16.9813 10.905 16.845M20.25 8.511C20.0955 8.46127 19.9358 8.42939 19.774 8.416C17.0959 8.19368 14.4041 8.19368 11.726 8.416C10.595 8.51 9.75 9.473 9.75 10.608V14.894C9.75 15.731 10.21 16.474 10.905 16.845M20.25 8.511V6.637C20.25 5.016 19.098 3.611 17.49 3.402C15.4208 3.13379 13.3365 2.99951 11.25 3C9.135 3 7.052 3.137 5.01 3.402C3.402 3.611 2.25 5.016 2.25 6.637V12.863C2.25 14.484 3.402 15.889 5.01 16.098C5.587 16.173 6.167 16.238 6.75 16.292V21L10.905 16.845"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
            isActive={currentPath === "/blog"}
          />
          <NavButton
            to="/stories"
            label="סיפורים אישיים"
            icon={
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16.862 4.487L18.549 2.799C18.9007 2.44733 19.3777 2.24976 19.875 2.24976C20.3723 2.24976 20.8493 2.44733 21.201 2.799C21.5527 3.15068 21.7502 3.62766 21.7502 4.125C21.7502 4.62235 21.5527 5.09933 21.201 5.451L10.582 16.07C10.0533 16.5984 9.40137 16.9867 8.685 17.2L6 18L6.8 15.315C7.01328 14.5986 7.40163 13.9467 7.93 13.418L16.862 4.487ZM16.862 4.487L19.5 7.125M18 14V18.75C18 19.3467 17.7629 19.919 17.341 20.341C16.919 20.763 16.3467 21 15.75 21H5.25C4.65326 21 4.08097 20.763 3.65901 20.341C3.23705 19.919 3 19.3467 3 18.75V8.25C3 7.65327 3.23705 7.08097 3.65901 6.65901C4.08097 6.23706 4.65326 6 5.25 6H10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
            isActive={currentPath === "/stories"}
          />
          <NavButton
            to="/info"
            label="לקריאה נוספת"
            icon={
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17.593 3.322C18.693 3.45 19.5 4.399 19.5 5.507V21L12 17.25L4.5 21V5.507C4.5 4.399 5.306 3.45 6.407 3.322C10.1232 2.89063 13.8768 2.89063 17.593 3.322Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
            isActive={currentPath === "/info"}
          />
        </aside>

        {/* Main content - still RTL */}
        <main
          className="flex-1 flex flex-col items-center justify-start mx-auto w-full pt-6 pb-16 md:pb-12 pl-14 sm:pl-16 md:pl-20 lg:pl-24"
          dir="rtl"
        >
          {children}
          {/* Floating helpers */}

          <ButterflyButton />
          <SOSButton />
        </main>
      </div>
    </div>
  );
};
