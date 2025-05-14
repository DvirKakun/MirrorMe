import { useState, useMemo } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { mockPosts } from "../../data/mock";
import type { BlogPost } from "../../types/index";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Heart, X } from "lucide-react";

export const BlogPage = () => {
  const [filter, setFilter] = useState("all");
  const [posts, setPosts] = useState(mockPosts);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostCategory, setNewPostCategory] = useState("anonymous");
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [userLikes, setUserLikes] = useState<Record<number, boolean>>({});

  // Simulate authentication
  const { token } = useAuth();

  // Category options - simplified to match MirorMe style
  const categoryOptions = [
    { value: "anonymous", label: "אנונימית" },
    { value: "close_friend", label: "חברה קרובה" },
    { value: "supporting_friend", label: "חברה תומכת" },
  ];

  // Get label for a category
  const getCategoryLabel = (value: string) => {
    return (
      categoryOptions.find((opt) => opt.value === value)?.label || "אנונימית"
    );
  };

  // Filter and sort posts
  const filteredPosts = useMemo(() => {
    let result = [...posts];

    // Only keep the filter logic
    if (filter !== "all") {
      result = result.filter((p) => p.category === filter);
    }

    // Always sort by date (most recent first) since we're not using other sort options
    result.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return result;
  }, [posts, filter]); // Remove sort from dependencies since we're not using it

  // Handle like action
  const handleLike = (id: number) => {
    if (!token) return;
    const newLikeStatus = !userLikes[id];
    setUserLikes((prev) => ({ ...prev, [id]: newLikeStatus }));
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, likes: p.likes + (newLikeStatus ? 1 : -1) } : p
      )
    );
  };

  // Add new post
  const handleAddPost = () => {
    if (!newPostContent.trim() || !token) return;
    const newPost: BlogPost = {
      id: Date.now(),
      author: getCategoryLabel(newPostCategory),
      content: newPostContent,
      likes: 0,
      date: new Date().toISOString(),
      category: newPostCategory,
    };
    setPosts((prev) => [newPost, ...prev]);
    setNewPostContent("");
    setShowNewPostForm(false);
  };

  // Format date in simple format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getHours()}:${String(date.getMinutes()).padStart(
      2,
      "0"
    )} ${date.getDate()}.${date.getMonth() + 1}.${String(
      date.getFullYear()
    ).slice(2)}`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6" dir="rtl">
      {/* Header - With new title and color */}
      <div className="flex items-center justify-between mb-6 border-b pb-5">
        <h2 className="text-xl font-medium">
          <span style={{ color: "hsl(var(--main-color))" }}>קהילת</span>{" "}
          <span className="text-gray-800">MirrorMe</span>
        </h2>

        {token && (
          <motion.button
            onClick={() => setShowNewPostForm(!showNewPostForm)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-md text-white text-sm transition-all"
            style={{ backgroundColor: "hsl(var(--main-color))" }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {showNewPostForm ? (
              <>
                <X className="w-4 h-4" />
                <span>סגור</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>פוסט חדש</span>
              </>
            )}
          </motion.button>
        )}
      </div>

      {/* Minimal filters with added padding */}
      <div className="flex flex-wrap gap-3 mb-8 px-1">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-md text-sm transition-all`}
          style={{
            backgroundColor:
              filter === "all" ? "hsl(var(--main-color))" : "#F3F4F6",
            color: filter === "all" ? "white" : "#374151",
          }}
        >
          הכל
        </button>

        {categoryOptions.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setFilter(cat.value)}
            className={`px-4 py-2 rounded-md text-sm transition-all`}
            style={{
              backgroundColor:
                filter === cat.value ? "hsl(var(--main-color))" : "#F3F4F6",
              color: filter === cat.value ? "white" : "#374151",
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* New post form - Clean and minimal with increased padding */}
      <AnimatePresence>
        {showNewPostForm && token && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 overflow-hidden"
          >
            <div className="bg-gray-50 rounded-md overflow-hidden p-6 border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-4">
                פוסט חדש
              </h3>

              {/* Simple category selection */}
              <div className="flex gap-2 mb-5 flex-wrap">
                {categoryOptions.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setNewPostCategory(cat.value)}
                    className={`px-3 py-1.5 rounded-md text-xs transition-all`}
                    style={{
                      backgroundColor:
                        newPostCategory === cat.value
                          ? "hsl(var(--main-color))"
                          : "white",
                      color:
                        newPostCategory === cat.value ? "white" : "#374151",
                      border:
                        newPostCategory === cat.value
                          ? "none"
                          : "1px solid #E5E7EB",
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Simple textarea */}
              <div className="mb-5 bg-white border border-gray-200 rounded-md">
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="שתפי מה שעל ליבך..."
                  className="w-full p-4 text-sm border-none resize-none focus:ring-0 bg-transparent min-h-24"
                ></textarea>
              </div>

              <div className="flex justify-end">
                <motion.button
                  onClick={handleAddPost}
                  disabled={!newPostContent.trim()}
                  className="px-5 py-2 text-white text-sm rounded-md disabled:opacity-50"
                  style={{ backgroundColor: "hsl(var(--main-color))" }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  פרסם
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Blog posts - with scrollbar fix and improved spacing */}
      <div dir="ltr" className="overflow-y-auto">
        <div dir="rtl">
          <AnimatePresence>
            {filteredPosts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mb-6"
              >
                <div className="bg-gray-50 rounded-md overflow-hidden border border-gray-100">
                  {/* Author and date */}
                  <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                        {post.author.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{post.author}</div>
                        <div className="text-xs text-gray-500">
                          {formatDate(post.date)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Post content */}
                  <div className="p-6">
                    <p className="text-sm leading-relaxed text-gray-800">
                      {post.content}
                    </p>
                  </div>

                  {/* Interactive footer - like only */}
                  <div className="flex items-center px-6 py-4 border-t border-gray-100">
                    <button
                      onClick={() => handleLike(post.id)}
                      disabled={!token}
                      className="flex items-center gap-1.5"
                    >
                      <Heart
                        className={`w-5 h-5 transition-colors`}
                        style={{
                          fill: userLikes[post.id]
                            ? "hsl(var(--main-color))"
                            : "none",
                          color: userLikes[post.id]
                            ? "hsl(var(--main-color))"
                            : "#9CA3AF",
                        }}
                      />
                      <span className="text-sm text-gray-600">
                        {post.likes}
                      </span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Empty state */}
      {filteredPosts.length === 0 && (
        <div className="text-center py-12 px-6 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-500">אין פוסטים בקטגוריה זו</p>
        </div>
      )}

      {/* Login prompt */}
      {!token && (
        <div className="text-center mt-6 border border-gray-200 rounded-md p-6 bg-gray-50">
          <p className="text-sm text-gray-700 mb-3">התחברי כדי להשתתף בשיחה</p>
        </div>
      )}
    </div>
  );
};
