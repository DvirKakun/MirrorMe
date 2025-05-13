// MirrorMe – React Front‑end scaffold
// -------------------------------------------------------------
// Tech stack: React 18 + TypeScript + Vite, TailwindCSS, shadcn/ui,
// TanStack Query, React‑Router v6. Shadcn components are imported
// using the alias "@/components/ui/*".
// -------------------------------------------------------------
// 1.  Create the project
//    pnpm create vite mirror-me --template react-ts
//    cd mirror-me && pnpm add -D tailwindcss postcss autoprefixer && npx tailwindcss init -p
//    pnpm add @tanstack/react-query react-router-dom clsx
//    # shadcn/ui install (see https://ui.shadcn.com/docs/installation)
// -------------------------------------------------------------
// 2.  Replace src/App.tsx with the content below.  Split the marked
//     sections into their own files later (e.g. ChatPage.tsx) – they
//     are kept together here for brevity.
// -------------------------------------------------------------
import type { ReactNode } from "react";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { clsx } from "clsx";

// shadcn components

import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Card, CardContent } from "./components/ui/card";
import { Textarea } from "./components/ui/textarea";

import { Label } from "./components/ui/label";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

import "./App.css";

// -----------------------------
// Auth Context (optional login)
// -----------------------------
interface AuthCtx {
  token: string | null;
  login: (t: string) => void;
  logout: () => void;
}

interface BlogPost {
  id: number;
  author: string;
  content: string;
  likes: number;
  date: string; // ISO date
  category: string;
}

interface VaultFile {
  filename: string;
  url: string;
  timestamp: string;
}

const fileTypesByCategory: Record<string, string> = {
  images: ".jpg,.jpeg,.png,.gif,.webp",
  videos: ".mp4,.mov,.avi,.webm",
  records: ".mp3,.wav,.m4a,.ogg",
};

const mockPosts: BlogPost[] = [
  {
    id: 1,
    author: "אנונימית",
    content: "סוף סוף עזבתי בחודש שעבר. הדבר הכי קשה היה להאמין שמגיע לי שקט.",
    likes: 14,
    date: "2024-04-01",
    category: "anonymous",
  },
  {
    id: 2,
    author: "חברה תומכת",
    content: "לתמוך בה היה מתיש, אבל שווה כל רגע. את לא לבד.",
    likes: 5,
    date: "2024-05-01",
    category: "supporting_friend",
  },
  {
    id: 3,
    author: "אנונימית",
    content: "הוא אמר סליחה כל פעם... עד שהבנתי שסליחה לא מספיקה.",
    likes: 23,
    date: "2024-05-10",
    category: "anonymous",
  },
  {
    id: 4,
    author: "אנונימית",
    content:
      "כשהוא הרים את הקול בפעם הראשונה, רעדתי. כשהוא הרים את היד בפעם האחרונה, ידעתי שזה הזמן ללכת.",
    likes: 31,
    date: "2024-05-15",
    category: "anonymous",
  },
  {
    id: 5,
    author: "חברה קרובה",
    content:
      "צפיתי בחברה שלי הופכת למישהי אחרת עם השנים. אחרי שהיא עזבה, ראיתי איך האור חוזר לעיניים שלה.",
    likes: 18,
    date: "2024-05-08",
    category: "close_friend",
  },
  {
    id: 6,
    author: "אנונימית",
    content:
      "למדתי שאהבה אמיתית לא כואבת. היום אני אוהבת את עצמי מספיק כדי לדעת את זה.",
    likes: 27,
    date: "2024-05-12",
    category: "anonymous",
  },
];
const AuthContext = createContext<AuthCtx | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("AuthContext missing");
  return ctx;
};

// -----------------------------
// Main Layout
// -----------------------------
const Layout = ({ children }: { children: ReactNode }) => {
  // Get current location for active state
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col">
      {/* Top header with MirrorMe title */}
      <header className="px-24 py-4 border-b shadow-sm bg-white flex items-center">
        <h1 className="font-bold text-xl tracking-tight ml-6">MirrorMe</h1>
      </header>

      <div className="flex flex-1">
        {/* Left side navigation */}
        <aside className="w-16 md:w-24 bg-white border-r flex flex-col items-center py-20 space-y-8">
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
          className="relative flex-1 flex flex-col items-center justify-start mx-auto w-full max-w-7xl pb-12 pt-6"
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

// Updated NavButton with SVG support and active state
const NavButton = ({
  to,
  label,
  icon,
  isActive,
}: {
  to: string;
  label: string;
  icon: ReactNode;
  isActive: boolean;
}) => (
  <Link
    to={to}
    className={`flex flex-col items-center text-center w-full gap-1 px-1 py-2 transition-colors relative ${
      isActive
        ? "text-[#4762FF] border-l-4 border-[#4762FF]"
        : "text-gray-600 hover:text-[#4762FF]"
    }`}
  >
    <div
      className={`text-2xl ${isActive ? "text-[#4762FF]" : "text-gray-600"}`}
    >
      {icon}
    </div>
    <span className="text-[10px] leading-tight">{label}</span>
  </Link>
);

// -----------------------------
// ChatPage – GPT‑like centered chat
// -----------------------------
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
const ChatPage = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatStarted, setChatStarted] = useState(false);

  const [sessionId, setSessionId] = useState<string | null>(() => {
    return localStorage.getItem("chatSessionId");
  });

  const sendMessage = async () => {
    if (!input.trim()) return;
    if (!chatStarted) setChatStarted(true);

    const userMsg: ChatMessage = { role: "user", content: input };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

  try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, session_id: sessionId || "" }),
      });
      const data = await res.json();
      if (data.session_id) {
        setSessionId(data.session_id);
        localStorage.setItem("chatSessionId", data.session_id);
      }
      setMessages((m) => [...m, { role: "assistant", content: data.response }]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  const handleFileUpload = () => console.log("File upload clicked");

  useEffect(() => {
    if (messages.length > 1) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <section
      className="flex flex-col w-full max-w-[1064px] h-[518px] pt-10 pb-4 mt-4 mx-auto"
      dir="rtl"
    >
      {!chatStarted && (
        <div className="text-right max-w-2xl mb-8 px-4 text-[#333] font-['Rubik'] leading-[125%]">
          <h2 className="text-2xl font-bold">היי, טוב שבאת.</h2>
          <p className="mb-2 text-lg">
            לפעמים <span className="text-[#4762FF] font-medium">משהו קטן</span>{" "}
            נוגע עמוק —<br />
            גם אם את לא לגמרי יודעת למה.
          </p>
          <p>
            <span className="text-[#4762FF] text-lg font-medium">
              אם יש לך משהו על הלב —
            </span>
            <br />
            את מוזמנת לכתוב.
            <br />
            לא כדי להסביר, רק כדי לשחרר.
          </p>
        </div>
      )}

      <div className="flex-1 rounded-lg overflow-y-auto flex flex-col mb-4">
        <div className="p-6 flex-1 flex flex-col">
          {messages.slice(chatStarted ? 0 : 1).map((m, i) => (
            <Card
              key={i}
              className={clsx("max-w-[85%] mb-6 text-right break-words", {
                "ml-auto text-[#F4F6FA] shadow-sm": m.role === "user",
                "ml-auto bg-transparent shadow-none border-none":
                  m.role === "assistant",
              })}
            >
              <CardContent
                className="p-4 text-base leading-relaxed font-['Rubik'] text-zinc-800 rtl whitespace-pre-wrap"
                dir="rtl"
              >
                <div
                  className="hebrew-text"
                  style={{ direction: "rtl", unicodeBidi: "plaintext" }}
                >
                  {m.content}
                </div>
              </CardContent>
            </Card>
          ))}

          {loading && (
            <Card className="max-w-[85%] bg-white ml-auto shadow-sm mb-6">
              <CardContent className="p-4 italic text-gray-500 text-right">
                דנה מקלידה...
              </CardContent>
            </Card>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="flex justify-center items-center w-full">
        <div className="bg-[#ededed] rounded-[32px] p-[24px] w-[848px] h-[192px] shadow-md relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full resize-none text-right text-base border-none focus:border-none focus:ring-0 bg-transparent placeholder-[#757575] shadow-none outline-none focus:outline-none h-[100px] focus:shadow-none !ring-0 !ring-offset-0 font-['Rubik']"
            placeholder="כתבי כל דבר..."
            rows={4}
            dir="rtl"
          />

          <div className="flex items-center justify-between absolute bottom-5 left-5 right-5">
            <button
              onClick={handleFileUpload}
              className="text-[#4762FF] border border-[#4762FF] rounded-full flex items-center gap-2 py-[12px] pr-[16px] pl-[24px] hover:bg-blue-50 transition-colors"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 10V11.5C1 11.8978 1.15804 12.2794 1.43934 12.5607C1.72064 12.842 2.10218 13 2.5 13H11.5C11.8978 13 12.2794 12.842 12.5607 12.5607C12.842 12.2794 13 11.8978 13 11.5V10M4 4L7 1M7 1L10 4M7 1V10"
                  stroke="#4762FF"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-xs font-medium">העלאת קבצים</span>
            </button>

            <button
              onClick={sendMessage}
              className="bg-[#4762FF] text-white rounded-full flex items-center justify-center w-12 h-12"
            >
              <svg
                className="w-10 h-10"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M24 20L25.8207 25.9167C21.4654 24.65 17.3584 22.649 13.6767 20C17.3582 17.351 21.465 15.3501 25.82 14.0834L24 20ZM24 20H19"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

// -----------------------------
// Anonymous Blog page
// -----------------------------
const BlogPage = () => {
  const [filter, setFilter] = useState("all"); // Add back filtering
  const [sort, setSort] = useState("recent");
  const [posts, setPosts] = useState(mockPosts);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostCategory, setNewPostCategory] = useState("anonymous"); // Track post category
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const { token } = useAuth();
  const [userLikes, setUserLikes] = useState<Record<number, boolean>>({});

  // Category options in Hebrew
  const categoryOptions = [
    { value: "anonymous", label: "אנונימית" },
    { value: "close_friend", label: "חברה קרובה" },
    { value: "supporting_friend", label: "חברה תומכת" },
  ];

  // Get label for a category value
  const getCategoryLabel = (value: string) => {
    return (
      categoryOptions.find((opt) => opt.value === value)?.label || "אנונימית"
    );
  };

  // Filter posts by category and sort
  const filteredPosts = useMemo(() => {
    let result = [...posts];

    // Apply category filter
    if (filter !== "all") {
      result = result.filter((p) => p.category === filter);
    }

    // Apply sorting
    if (sort === "likes") {
      result.sort((a, b) => b.likes - a.likes);
    } else {
      result.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    }
    return result;
  }, [posts, filter, sort]);

  const handleLike = (id: number) => {
    if (!token) return; // Only allow likes if authenticated

    // Toggle the like status for this post
    const newLikeStatus = !userLikes[id];
    setUserLikes((prev) => ({ ...prev, [id]: newLikeStatus }));

    // Update the post likes count
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, likes: p.likes + (newLikeStatus ? 1 : -1) } : p
      )
    );
  };

  const handleAddPost = () => {
    if (!newPostContent.trim() || !token) return;

    const newPost: BlogPost = {
      id: Date.now(), // Simple way to generate unique ID
      author: getCategoryLabel(newPostCategory), // Use the Hebrew label based on category
      content: newPostContent,
      likes: 0,
      date: new Date().toISOString(),
      category: newPostCategory,
    };

    setPosts((prev) => [newPost, ...prev]);
    setNewPostContent("");
    setShowNewPostForm(false);
  };

  return (
    <div
      className="w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto py-10 space-y-6"
      dir="rtl"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">בלוג</h2>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Category filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border px-3 py-1 text-sm bg-white shadow"
          >
            <option value="all">הכל</option>
            {categoryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Sort filter */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-md border px-3 py-1 text-sm bg-white shadow"
          >
            <option value="recent">מיון: חדש ביותר</option>
            <option value="likes">מיון: הכי אהוב</option>
          </select>

          {token && (
            <Button
              onClick={() => setShowNewPostForm(!showNewPostForm)}
              className="px-4"
            >
              {showNewPostForm ? "ביטול" : "פוסט חדש"}
            </Button>
          )}
        </div>
      </div>

      {/* New post form */}
      {showNewPostForm && token && (
        <Card className="mb-6">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-semibold">פוסט חדש</h3>

            {/* Category selection */}
            <div className="space-y-2">
              <Label htmlFor="category">בחרי קטגוריה:</Label>
              <select
                id="category"
                value={newPostCategory}
                onChange={(e) => setNewPostCategory(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm bg-white shadow"
              >
                {categoryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Post content */}
            <div className="space-y-2">
              <Label htmlFor="post-content">תוכן:</Label>
              <Textarea
                id="post-content"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="w-full resize-none text-right"
                placeholder="מה את רוצה לשתף..."
                rows={4}
              />
            </div>

            <div className="flex justify-start">
              <Button onClick={handleAddPost}>פרסם</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <AnimatePresence>
        {filteredPosts.map((post) => (
          <motion.div
            key={post.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="mb-4">
              <CardContent className="p-4">
                <div className="text-sm text-gray-400 mb-1 text-right">
                  {post.author} ·{" "}
                  {new Date(post.date).toLocaleDateString("he-IL")}
                </div>
                <p className="text-base font-medium mb-2 text-right">
                  {post.content}
                </p>
                <div className="text-left">
                  <Button
                    size="sm"
                    variant={userLikes[post.id] ? "default" : "ghost"}
                    onClick={() => handleLike(post.id)}
                    className="text-sm"
                    disabled={!token}
                  >
                    ❤️ {post.likes} {post.likes === 1 ? "לייק" : "לייקים"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {filteredPosts.length === 0 && (
        <div className="text-center text-gray-500 py-10">
          <p>לא נמצאו פוסטים בקטגוריה זו.</p>
        </div>
      )}

      {!token && (
        <div className="text-center text-gray-500 mt-4">
          <p>התחברו כדי לפרסם פוסטים חדשים ולהוסיף לייקים.</p>
        </div>
      )}
    </div>
  );
};
// Data & Info page
const InfoPage = () => <PlaceholderPage title="Helpful Resources" />;

// Personal Stories page
const StoriesPage = () => <PlaceholderPage title="Personal Stories" />;

// The Safe (requires login)
// SafePage with Hebrew RTL style, authentication, and Google Drive-like interface
const SafePage = () => {
  const { token } = useAuth();
  const [safeCode, setSafeCode] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [category, setCategory] = useState("images");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [vaultFiles, setVaultFiles] = useState<VaultFile[]>([]);
  const [sort, setSort] = useState("desc");
  const [isFetching, setIsFetching] = useState(false);
  const navigate = useNavigate();

  // Category info with Hebrew labels
  interface CategoryInfo {
    label: string;
    icon: string;
    acceptedTypes: string;
    color: string;
  }

  // Define the type for the entire category information object
  type CategoriesMap = {
    [key: string]: CategoryInfo;
  };

  // Category info with Hebrew labels (properly typed)
  const categoryInfo: CategoriesMap = {
    images: {
      label: "תמונות",
      icon: "📷",
      acceptedTypes: ".jpg,.jpeg,.png,.gif,.webp",
      color: "bg-blue-50",
    },
    videos: {
      label: "סרטונים",
      icon: "🎬",
      acceptedTypes: ".mp4,.mov,.avi,.webm",
      color: "bg-purple-50",
    },
    records: {
      label: "הקלטות",
      icon: "🎙️",
      acceptedTypes: ".mp3,.wav,.m4a,.ogg",
      color: "bg-amber-50",
    },
  };

  // Authentication check
  const validSafeCode = "1234"; // In a real app, this would come from the user's profile

  useEffect(() => {
    if (isUnlocked) {
      fetchVaultFiles();
    }
  }, [category, isUnlocked]);

  const fetchVaultFiles = async () => {
    setIsFetching(true);
    try {
      const res = await fetch(`http://localhost:8000/vault/${category}`);
      const data = await res.json();
      setVaultFiles(data.files);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetching(false);
    }
  };

  const handleUnlock = () => {
    if (safeCode === validSafeCode) {
      setIsUnlocked(true);
    } else {
      alert("קוד הכספת שגוי. אנא נסי שוב.");
    }
  };

  const handleUpload = async () => {
    if (!files.length) return;
    setLoading(true);
    setStatus(null);

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.append("category", category);

    try {
      const res = await fetch("http://localhost:8000/vault/items", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setStatus(
        `✅ הועלו ${data.files.length} קבצים ל${categoryInfo[category].label}`
      );
      fetchVaultFiles();
      setShowUploadDialog(false);
      setFiles([]);
    } catch (e) {
      console.error(e);
      setStatus("❌ העלאה נכשלה");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const sortedFiles = useMemo(() => {
    const sorted = [...vaultFiles];
    sorted.sort((a, b) => {
      const ta = new Date(a.timestamp).getTime();
      const tb = new Date(b.timestamp).getTime();
      return sort === "desc" ? tb - ta : ta - tb;
    });
    return sorted;
  }, [vaultFiles, sort]);

  // Not authenticated view
  if (!token) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[80vh] p-6"
        dir="rtl"
      >
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg w-full flex flex-col items-center">
          <img
            src="/images/locked-safe.png" // Update with the actual image path
            alt="כספת נעולה"
            className="w-72 h-72 mx-auto mb-6 object-contain"
          />
          <h1 className="text-2xl font-bold text-[#333333] mb-3 text-center">
            ברוכה הבאה אל הכספת
          </h1>
          <p className="text-[#333333] mb-8 text-center max-w-md">
            כאן תוכלי להעלות איזה קבצים שתרצי הכל מוגן באבטחה
          </p>
          <Button
            onClick={handleLogin}
            className="bg-[#4762FF] text-white hover:bg-blue-600 rounded-full px-6 py-3 text-base font-medium"
          >
            התחברות
          </Button>
        </div>
      </div>
    );
  }

  // Authenticated but need safe code
  if (!isUnlocked) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[80vh] p-6"
        dir="rtl"
      >
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg w-full flex flex-col items-center">
          <img
            src="/images/safe-door.jpg" // Update with the actual image path
            alt="דלת כספת"
            className="w-72 h-72 mx-auto mb-6 object-contain"
          />
          <h1 className="text-2xl font-bold text-[#333333] mb-3 text-center">
            ברוכה הבאה אל הכספת
          </h1>
          <p className="text-[#333333] mb-8 text-center max-w-md">
            כאן תוכלי להעלות איזה קבצים שתרצי הכל מוגן באבטחה
          </p>

          <div className="w-full max-w-md space-y-4">
            <label className="block text-[#333333] text-base font-medium mb-2 text-right">
              אנא הזיני את קוד הכספת שלך:
            </label>
            <Input
              type="password"
              value={safeCode}
              onChange={(e) => setSafeCode(e.target.value)}
              className="w-full text-center text-lg py-6 rounded-lg border-gray-300 focus:border-[#4762FF] focus:ring focus:ring-[#4762FF] focus:ring-opacity-20"
              placeholder="●●●●"
              maxLength={4}
            />
            <Button
              onClick={handleUnlock}
              className="w-full bg-[#4762FF] text-white hover:bg-blue-600 rounded-full py-3 mt-4 text-base font-medium"
            >
              פתיחת הכספת
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Safe is unlocked - Google Drive-like interface
  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4" dir="rtl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#333333]">
            הכספת הדיגיטלית שלך
          </h1>
          <p className="text-[#666666] mt-2">
            כאן תוכלי להעלות איזה קבצים שתרצי הכל מוגן באבטחה
          </p>
        </div>

        {/* Share button */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="text-[#4762FF] border-[#4762FF] rounded-full px-4 py-2 text-sm flex items-center gap-2"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7 11L12 6M12 6L17 11M12 6V18"
                stroke="#4762FF"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            שיתוף הכספת שלי
          </Button>

          {/* Add button (Google Drive style) */}
          <Button
            onClick={() => setShowUploadDialog(true)}
            className="bg-[#4762FF] text-white rounded-full px-4 py-2 text-sm flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            חדש
          </Button>
        </div>
      </div>

      {/* Category folders */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        {Object.entries(categoryInfo).map(([key, info]) => (
          <button
            key={key}
            onClick={() => setCategory(key)}
            className={`p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow ${
              info.color
            } ${category === key ? "ring-2 ring-[#4762FF]" : ""}`}
          >
            <div className="text-5xl mb-3">{info.icon}</div>
            <h3 className="text-lg font-medium">{info.label}</h3>
            <p className="text-sm text-gray-500">
              {vaultFiles.length > 0 && category === key
                ? `${vaultFiles.length} קבצים`
                : "לחצי לצפייה"}
            </p>
          </button>
        ))}
      </div>

      {/* Current category files */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span>{categoryInfo[category].icon}</span>
            <span>{categoryInfo[category].label}</span>
          </h2>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-md border px-3 py-1 text-sm bg-white shadow"
          >
            <option value="desc">חדש לישן</option>
            <option value="asc">ישן לחדש</option>
          </select>
        </div>

        {status && (
          <div className="mb-4 p-2 bg-green-50 border border-green-200 rounded text-center">
            {status}
          </div>
        )}

        {isFetching ? (
          <div className="text-center py-12 text-gray-500">
            <Loader2 className="animate-spin inline-block mb-2 h-8 w-8" />
            <p>טוען {categoryInfo[category].label}...</p>
          </div>
        ) : sortedFiles.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <div className="text-6xl mb-4 opacity-30">
              {categoryInfo[category].icon}
            </div>
            <p className="text-lg">אין כרגע קבצים בתיקייה זו</p>
            <Button
              variant="outline"
              className="mt-4 border-[#4762FF] text-[#4762FF]"
              onClick={() => setShowUploadDialog(true)}
            >
              העלאת קבצים
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {sortedFiles.map((file) => (
              <motion.div
                key={file.filename}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="group rounded overflow-hidden border bg-white shadow transition-transform hover:shadow-md hover:-translate-y-1"
              >
                {category === "images" ? (
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={file.url}
                      alt={file.filename}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ) : category === "videos" ? (
                  <div className="aspect-video bg-black">
                    <video
                      src={file.url}
                      controls
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="aspect-square flex items-center justify-center bg-amber-50 p-2">
                    <audio src={file.url} controls className="w-full" />
                  </div>
                )}
                <p className="truncate p-2 text-xs text-gray-600 text-center">
                  {file.filename}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Upload dialog (modal) */}
      {showUploadDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg rounded-2xl overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">העלאת קבצים חדשים</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUploadDialog(false)}
                >
                  ×
                </Button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="category"
                    className="text-[#333333] font-medium"
                  >
                    קטגוריה:
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(categoryInfo).map(([key, info]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setCategory(key)}
                        className={`p-3 rounded-lg border text-center ${
                          category === key
                            ? "bg-blue-50 border-[#4762FF]"
                            : "bg-white hover:bg-gray-50"
                        }`}
                      >
                        <div className="text-2xl mb-1">{info.icon}</div>
                        <div className="text-sm">{info.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file" className="text-[#333333] font-medium">
                    בחירת קבצים:
                  </Label>
                  <Input
                    id="file"
                    type="file"
                    accept={categoryInfo[category].acceptedTypes}
                    multiple
                    onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                    disabled={loading}
                    className="text-right"
                  />
                  <p className="text-sm text-gray-500">
                    פורמטים מותרים: {categoryInfo[category].acceptedTypes}
                  </p>
                </div>

                {files.length > 0 && (
                  <div className="bg-gray-50 p-2 rounded border">
                    <p className="font-medium mb-1">
                      נבחרו {files.length} קבצים:
                    </p>
                    <ul className="text-sm text-gray-600 max-h-24 overflow-y-auto">
                      {Array.from(files).map((file, i) => (
                        <li key={i} className="truncate">
                          {file.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowUploadDialog(false)}
                    className="border-[#4762FF] text-[#4762FF]"
                  >
                    ביטול
                  </Button>
                  <Button
                    onClick={handleUpload}
                    disabled={!files.length || loading}
                    className="bg-[#4762FF] text-white"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="animate-spin size-4" /> מעלה...
                      </span>
                    ) : (
                      "העלאה"
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
// Generic placeholder
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="mx-auto py-10 text-center text-zinc-600">
    <h2 className="text-2xl font-semibold mb-4">{title}</h2>
    <p>Coming soon…</p>
  </div>
);

// -----------------------------
// Floating helpers
// -----------------------------
const ButterflyButton = () => (
  <div className="fixed right-4 bottom-32 md:right-6 z-40">
    <Button className="rounded-full shadow-lg w-14 h-14 bg-fuchsia-500 hover:bg-fuchsia-600">
      🦋
    </Button>
  </div>
);

const SOSButton = () => {
  const handleSOS = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.replace("https://www.ynet.co.il");
  };
  return (
    <div className="fixed right-4 bottom-16 md:right-6 z-50">
      <Button
        variant="destructive"
        className="rounded-full shadow-xl w-14 h-14"
        onClick={handleSOS}
      >
        SOS
      </Button>
    </div>
  );
};

// -----------------------------
// App Root
// -----------------------------
const queryClient = new QueryClient();

export default function App() {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("dummyToken") || null;
  });

  const login = (t: string) => {
    setToken(t);
    localStorage.setItem("dummyToken", t);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("dummyToken");
  };

  // For testing - automatically generate a dummy token if not present
  const generateDummyToken = () => {
    return `dummy-token-${Math.random().toString(36).substring(2, 10)}`;
  };

  // Shortcut login for testing
  const handleTestLogin = () => {
    login(generateDummyToken());
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ token, login, logout }}>
        <Router>
          <Layout>
            {/* Testing bar for easy login/logout */}
            <div className="fixed bottom-4 left-4 z-50 bg-white/90 rounded-md shadow p-2 flex gap-2">
              {token ? (
                <Button size="sm" variant="outline" onClick={logout}>
                  התנתק (בדיקה)
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={handleTestLogin}>
                  התחבר (בדיקה)
                </Button>
              )}
            </div>

            <Routes>
              <Route path="/" element={<ChatPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/info" element={<InfoPage />} />
              <Route path="/stories" element={<StoriesPage />} />
              <Route path="/safe" element={<SafePage />} />
            </Routes>
          </Layout>
        </Router>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}

// -------------------------------------------------------------
// Tailwind globals (tailwind.config.js)
// -------------------------------------------------------------
// -------------------------------------------------------------
// This scaffold gives you a running app with ChatGPT‑style chat in the
// centre, pages ready for each use‑case, optional auth, floating helper
// buttons and a pastel rose theme aimed at a warm, empathic vibe.
// Flesh out each placeholder (blog CRUD, resources, stories, safe
// gallery) and wire up real API calls as your backend evolves.
// -------------------------------------------------------------
