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
  Navigate,
  Link,
  useNavigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { clsx } from "clsx";

// shadcn components

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

import { Label } from "@/components/ui/label";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
// Session hook – required for /chat
// -----------------------------
const useSession = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  useEffect(() => {
    fetch("http://localhost:8000/session")
      .then((r) => r.json())
      .then((d) => setSessionId(d.session_id))
      .catch(console.error);
  }, []);
  return sessionId;
};

// -----------------------------
// Main Layout
// -----------------------------
const Layout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen bg-rose-50 text-zinc-900 flex flex-row-reverse">
    {/* Right sidebar nav */}
    <aside className="w-16 md:w-64 bg-white/80 backdrop-blur shadow-sm flex flex-col items-center md:items-end py-6 sticky top-0 h-screen z-20">
      <Link
        to="/"
        className="font-bold text-lg tracking-tight mb-8 w-full text-center md:px-6"
      >
        MirrorMe
      </Link>
      <nav className="flex flex-col items-center md:items-end space-y-6 w-full md:px-6">
        <VerticalNavLink to="/" label="צ'אט" icon="💬" />
        <VerticalNavLink to="/blog" label="בלוג" icon="📝" />
        <VerticalNavLink to="/info" label="כל מה שאתה צריכה לדעת" icon="ℹ️" />
        <VerticalNavLink to="/stories" label="הסיפור שלי" icon="📚" />
        <VerticalNavLink to="/safe" label="הכספת" icon="🔒" />
      </nav>
    </aside>

    {/* Main body */}
    <main className="relative flex-1 flex flex-col items-center justify-start mx-auto w-full max-w-7xl px-4 pb-48 pt-6 overflow-x-hidden">
      {children}
      {/* Floating helpers */}
      <ButterflyButton />
      <SOSButton />
    </main>
  </div>
);

const VerticalNavLink = ({
  to,
  label,
  icon,
}: {
  to: string;
  label: string;
  icon: string;
}) => (
  <Link
    to={to}
    className="text-sm font-medium opacity-80 hover:opacity-100 transition-opacity flex flex-col md:flex-row items-center md:justify-end w-full gap-2 py-2 text-center md:text-right"
  >
    <span className="block text-xl mb-1 md:mb-0 mx-auto md:mx-0">{icon}</span>
    <span className="hidden md:block">{label}</span>
    <span className="block md:hidden text-xs w-full">{label}</span>
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
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: `היי, טוב שבאת.
לפעמים משהו קטן נוגע עמוק — גם אם את לא לגמרי יודעת למה.

אם יש לך משהו על הלב — את מוזמנת לכתוב.
לא כדי להסביר, רק כדי לשחרר.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const sessionId = useSession();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { role: "user", content: input };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_message: input,
          session_id: sessionId ?? "",
        }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Only scroll to bottom when messages change and there's more than the initial message
  useEffect(() => {
    if (messages.length > 1) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <section
      className="flex flex-col w-full md:w-4/5 lg:w-3/4 pt-10 pb-4 mt-4 h-[700px]"
      dir="rtl"
    >
      {/* Simplified container */}
      <div className="flex-1 rounded-lg border bg-white/90 backdrop-blur overflow-y-auto h-[450px] flex flex-col">
        {/* Message container with consistent padding */}
        <div className="p-6 flex-1 flex flex-col">
          {/* First message always visible at the top */}
          {messages.length > 0 && messages[0].role === "assistant" && (
            <Card className="max-w-[85%] ml-auto bg-white shadow-sm mb-6">
              <CardContent className="p-4 whitespace-pre-wrap text-right hebrew-text text-base">
                {messages[0].content}
              </CardContent>
            </Card>
          )}

          {/* Remaining messages (if any) */}
          {messages.slice(1).map((m, i) => (
            <Card
              key={i + 1}
              className={clsx("max-w-[85%] mb-6", {
                "mr-auto bg-rose-100 shadow-sm": m.role === "user",
                "ml-auto bg-white shadow-sm": m.role === "assistant",
              })}
            >
              <CardContent className="p-4 whitespace-pre-wrap text-right hebrew-text text-base">
                {m.content}
              </CardContent>
            </Card>
          ))}

          {/* Loading indicator */}
          {loading && (
            <Card className="max-w-[85%] bg-white ml-auto shadow-sm mb-6">
              <CardContent className="p-4 italic text-gray-500 text-right">
                דנה מקלידה...
              </CardContent>
            </Card>
          )}

          {/* Reference for auto-scrolling */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="mt-4 flex gap-3">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 resize-none text-right text-base p-2.5 min-h-[60px]"
          rows={2}
          placeholder="כתבי את ההודעה שלך..."
        />
        <Button
          onClick={sendMessage}
          disabled={!sessionId}
          className="px-5 py-1.5 h-auto"
        >
          שלח
        </Button>
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
      <div className="w-full max-w-lg mx-auto py-16 text-center" dir="rtl">
        <img
          src="/images/locked-safe.png" // Replace with your safe image
          alt="כספת נעולה"
          className="w-64 h-64 mx-auto mb-8 rounded-lg shadow-md"
        />
        <h1 className="text-2xl font-bold mb-4">הכספת הדיגיטלית</h1>
        <p className="text-lg mb-8">כדי לגשת לכספת, עליך להתחבר למערכת.</p>
      </div>
    );
  }

  // Authenticated but need safe code
  if (!isUnlocked) {
    return (
      <div className="w-full max-w-lg mx-auto py-16 text-center" dir="rtl">
        <img
          src="/images/safe-door.png" // Replace with your safe image
          alt="דלת כספת"
          className="w-80 h-80 mx-auto mb-8 rounded-lg shadow-md"
        />
        <h1 className="text-2xl font-bold mb-4">המקום הבטוח שלך</h1>
        <p className="text-lg mb-8">
          כאן תוכלי לשמור את כל התיעוד החשוב בצורה מאובטחת ופרטית. אף אחד מלבדך
          לא יוכל לראות את התכנים כאן.
        </p>

        <div className="max-w-xs mx-auto space-y-4">
          <div className="text-lg font-medium mb-2">
            אנא הזיני את קוד הכספת שלך:
          </div>
          <Input
            type="password"
            value={safeCode}
            onChange={(e) => setSafeCode(e.target.value)}
            className="text-center text-lg py-6"
            placeholder="●●●●"
          />
          <Button onClick={handleUnlock} className="w-full py-6 text-lg">
            פתיחת הכספת
          </Button>
        </div>
      </div>
    );
  }

  // Safe is unlocked - Google Drive-like interface
  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4" dir="rtl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">הכספת הדיגיטלית שלך</h1>

        {/* Add button (Google Drive style) */}
        <Button
          onClick={() => setShowUploadDialog(true)}
          className="rounded-full w-14 h-14 bg-gradient-to-br from-rose-400 to-rose-600 hover:from-rose-500 hover:to-rose-700 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center fixed bottom-8 left-8 z-10"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform duration-200 hover:scale-110"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </Button>
      </div>

      {/* Category folders */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        {Object.entries(categoryInfo).map(([key, info]) => (
          <button
            key={key}
            onClick={() => setCategory(key)}
            className={`p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow ${
              info.color
            } ${category === key ? "ring-2 ring-rose-500" : ""}`}
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
              className="mt-4"
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
          <Card className="w-full max-w-lg">
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
                  <Label htmlFor="category">קטגוריה:</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(categoryInfo).map(([key, info]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setCategory(key)}
                        className={`p-3 rounded-lg border text-center ${
                          category === key
                            ? "bg-rose-100 border-rose-300"
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
                  <Label htmlFor="file">בחירת קבצים:</Label>
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
                  >
                    ביטול
                  </Button>
                  <Button
                    onClick={handleUpload}
                    disabled={!files.length || loading}
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
            <div className="fixed top-4 left-4 z-50 bg-white/90 rounded-md shadow p-2 flex gap-2">
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
