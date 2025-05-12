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
    author: "Anonymous",
    content:
      "I finally left last month. The hardest thing was believing I deserved peace.",
    likes: 14,
    date: "2024-04-01",
    category: "Survivor",
  },
  {
    id: 2,
    author: "A friend",
    content:
      "Supporting her was draining but worth every ounce. You are not alone.",
    likes: 5,
    date: "2024-05-01",
    category: "Supporter",
  },
  {
    id: 3,
    author: "Anonymous",
    content: "He said sorry every time… until I realized sorry wasn’t enough.",
    likes: 23,
    date: "2024-05-10",
    category: "Survivor",
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
  <div className="min-h-screen bg-rose-50 text-zinc-900 flex flex-col">
    {/* Top nav */}
    <header className="flex items-center justify-between px-4 py-2 shadow-sm bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/30 sticky top-0 z-10">
      <Link to="/" className="font-bold text-lg tracking-tight">
        MirrorMe
      </Link>
      <nav className="space-x-3 hidden md:block">
        <NavLink to="/blog" label="Blog" />
        <NavLink to="/info" label="Info" />
        <NavLink to="/stories" label="Stories" />
        <NavLink to="/safe" label="The Safe" />
      </nav>
      <AuthButtons />
    </header>

    {/* Main body */}
    <main className="flex-1 flex justify-center mx-auto w-full max-w-7xl px-4">
      {children}
      {/* Floating helpers */}
      <ButterflyButton />
      <SOSButton />
    </main>
  </div>
);

const NavLink = ({ to, label }: { to: string; label: string }) => (
  <Link
    to={to}
    className="text-sm font-medium opacity-80 hover:opacity-100 transition-opacity"
  >
    {label}
  </Link>
);

const AuthButtons = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  return token ? (
    <Button variant="outline" size="sm" onClick={() => logout()}>
      Logout
    </Button>
  ) : (
    <Button
      size="sm"
      onClick={() => {
        navigate("/login");
      }}
    >
      Login
    </Button>
  );
};

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
      content: "Hi I am Dana, How can I help you?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const sessionId = useSession();
  const bottomRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <section className="flex flex-col w-full md:w-3/5 lg:w-1/2 py-6">
      <ScrollArea className="flex-1 rounded-lg border bg-white/80 backdrop-blur p-4 space-y-4 h-[calc(100vh_-_200px)]">
        {messages.map((m, i) => (
          <Card
            key={i}
            className={clsx("max-w-prose", {
              "ml-auto bg-rose-100": m.role === "user",
              "bg-white": m.role === "assistant",
            })}
          >
            <CardContent className="p-3 whitespace-pre-wrap">
              {m.content}
            </CardContent>
          </Card>
        ))}
        {loading && (
          <Card className="max-w-prose bg-white">
            <CardContent className="p-3 italic text-gray-500">
              Dana is typing…
            </CardContent>
          </Card>
        )}
        <div ref={bottomRef} />
      </ScrollArea>
      <div className="mt-4 flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 resize-none"
          rows={2}
          placeholder="Write your message…"
        />
        <Button onClick={sendMessage} disabled={!sessionId}>
          Send
        </Button>
      </div>
    </section>
  );
};

// -----------------------------
// Anonymous Blog page
// -----------------------------
const BlogPage = () => {
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("recent");
  const [posts, setPosts] = useState(mockPosts);

  const filteredPosts = useMemo(() => {
    let result = [...posts];
    if (filter !== "all") {
      result = result.filter((p) => p.category === filter);
    }
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
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p))
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-10 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Tabs defaultValue="all" onValueChange={(v) => setFilter(v)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="Survivor">Survivor</TabsTrigger>
            <TabsTrigger value="Supporter">Supporter</TabsTrigger>
          </TabsList>
        </Tabs>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-md border px-3 py-1 text-sm bg-white shadow"
        >
          <option value="recent">Sort: Recent</option>
          <option value="likes">Sort: Most Liked</option>
        </select>
      </div>

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
                <div className="text-sm text-gray-400 mb-1">
                  {post.author} · {new Date(post.date).toLocaleDateString()}
                </div>
                <p className="text-base font-medium mb-2">{post.content}</p>
                <div className="text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleLike(post.id)}
                    className="text-sm"
                  >
                    ❤️ {post.likes} like{post.likes !== 1 ? "s" : ""}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Data & Info page
const InfoPage = () => <PlaceholderPage title="Helpful Resources" />;

// Personal Stories page
const StoriesPage = () => <PlaceholderPage title="Personal Stories" />;

// The Safe (requires login)
const SafePage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [category, setCategory] = useState("images");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [vaultFiles, setVaultFiles] = useState<VaultFile[]>([]);
  const [sort, setSort] = useState("desc");
  const [isFetching, setIsFetching] = useState(false);

  const acceptedTypes = fileTypesByCategory[category];

  useEffect(() => {
    fetchVaultFiles();
  }, [category]);

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
      setStatus(`✅ Uploaded ${data.files.length} file(s) to ${category}`);
      fetchVaultFiles();
    } catch (e) {
      console.error(e);
      setStatus("❌ Upload failed");
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

  return (
    <div className="w-full max-w-xl mx-auto py-10 space-y-8">
      <h2 className="text-2xl font-bold text-center">Vault – Upload & View</h2>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Choose Files</Label>
            <Input
              id="file"
              type="file"
              accept={acceptedTypes}
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              disabled={loading}
            />
            <p className="text-sm text-muted-foreground">
              Allowed: {acceptedTypes}
            </p>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Tabs
              defaultValue={category}
              onValueChange={(v) => {
                setCategory(v);
                setFiles([]);
                setStatus(null);
              }}
            >
              <TabsList>
                <TabsTrigger value="images">Images</TabsTrigger>
                <TabsTrigger value="videos">Videos</TabsTrigger>
                <TabsTrigger value="records">Records</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <Button onClick={handleUpload} disabled={!files.length || loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin size-4" /> Uploading…
              </span>
            ) : (
              "Upload to Vault"
            )}
          </Button>

          {status && (
            <p className="text-sm text-center mt-2 text-muted-foreground">
              {status}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between px-2">
        <h3 className="text-xl font-semibold">Uploaded {category}</h3>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-md border px-3 py-1 text-sm bg-white shadow"
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
      </div>

      <AnimatePresence>
        {isFetching ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-6 text-muted-foreground"
          >
            <Loader2 className="animate-spin inline-block mr-2" /> Loading{" "}
            {category}…
          </motion.div>
        ) : sortedFiles.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            No files found.
          </p>
        ) : (
          <div className="grid gap-4 grid-cols-2">
            {sortedFiles.map((file) => (
              <motion.div
                key={file.filename}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-sm text-center break-words group rounded overflow-hidden border bg-white shadow transition-transform hover:shadow-lg hover:-translate-y-1"
              >
                {category === "images" ? (
                  <img
                    src={file.url}
                    alt={file.filename}
                    className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : category === "videos" ? (
                  <video
                    src={file.url}
                    controls
                    className="w-full h-40 object-cover rounded"
                  />
                ) : (
                  <audio src={file.url} controls className="w-full p-1" />
                )}
                <p className="truncate mt-1 px-2 pb-2 text-xs text-gray-600">
                  {file.filename}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
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
// Login & Signup (very simple form examples)
// -----------------------------
const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const submit = async () => {
    try {
      const res = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pwd }),
      });
      const d = await res.json();
      login(d.token);
      navigate("/safe");
    } catch (e) {
      console.error(e);
    }
  };
  return (
    <div className="mx-auto w-full max-w-sm py-10 space-y-4">
      <h2 className="text-center text-2xl font-semibold">Login</h2>
      <Input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        placeholder="Password"
        type="password"
        value={pwd}
        onChange={(e) => setPwd(e.target.value)}
      />
      <Button className="w-full" onClick={submit}>
        Sign in
      </Button>
      <p className="text-sm text-center">
        No account?{" "}
        <Link to="/signup" className="underline">
          Sign up
        </Link>
      </p>
    </div>
  );
};

const SignupPage = () => {
  /* Similar to LoginPage – omitted for brevity */
  return <PlaceholderPage title="Signup" />;
};

// -----------------------------
// Floating helpers
// -----------------------------
const ButterflyButton = () => (
  <div className="fixed right-4 bottom-24 md:right-8 z-40">
    {/* Replace the button below with the provided Butterfly widget code */}
    <Button className="rounded-full shadow-lg w-14 h-14 bg-fuchsia-500 hover:bg-fuchsia-600">
      🦋
    </Button>
  </div>
);

const SOSButton = () => {
  const handleSOS = () => {
    // Clear sensitive traces
    localStorage.clear();
    sessionStorage.clear();
    // Redirect & remove history entry
    window.location.replace("https://www.ynet.co.il");
  };
  return (
    <div className="fixed right-4 bottom-4 md:right-8 z-50">
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
  const [token, setToken] = useState<string | null>(null);
  const login = (t: string) => setToken(t);
  const logout = () => setToken(null);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ token, login, logout }}>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<ChatPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/info" element={<InfoPage />} />
              <Route path="/stories" element={<StoriesPage />} />
              <Route path="/safe" element={<SafePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
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
