import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, X, ArrowUpDown } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import type { Story } from "../../types"; // Adjust the import path as necessary
import { dummyStories } from "../../data/mock"; // Adjust the import path as necessary

// Interface for story data

const StoriesPage = () => {
  // State for stories data
  const [stories, setStories] = useState<Story[]>([]);
  const [filteredStories, setFilteredStories] = useState<Story[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showLatest, setShowLatest] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const { token } = useAuth();

  // Form state
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showAddForm && !token) {
      setShowAddForm(false);
    }
  }, [showAddForm, token]);

  // Initial dummy data
  useEffect(() => {
    setStories(dummyStories);
    setFilteredStories(dummyStories);
  }, []);

  // Filter stories based on search term and sort order
  useEffect(() => {
    let filtered = [...stories];

    if (searchTerm) {
      filtered = filtered.filter((story) => story.title.includes(searchTerm));
    }

    if (showLatest) {
      filtered.sort((a, b) => b.date.getTime() - a.date.getTime());
    } else {
      // Default sort (could be by ID or another field)
      filtered.sort((a, b) => a.date.getTime() - b.date.getTime());
    }

    setFilteredStories(filtered);
  }, [stories, searchTerm, showLatest]);

  // Handle search
  const handleSearch = () => {
    if (searchInputRef.current) {
      setSearchTerm(searchInputRef.current.value);
    }
  };

  // Handle add new story
  const handleAddStory = () => {
    if (!token) return;

    if (newTitle.trim() && newBody.trim()) {
      const newStory: Story = {
        id: Date.now().toString(),
        title: newTitle,
        body: newBody,
        date: new Date(),
      };

      setStories([...stories, newStory]);
      setNewTitle("");
      setNewBody("");
      setShowAddForm(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 mt-[104px] rtl " dir="rtl">
      {/* Header with title and add button */}
      <div className="flex flex-col items-start mb-8 gap-[16px]">
        <motion.h1
          className="text-2xl font-bold text-gray-800"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          סיפורים אישיים
        </motion.h1>

        <div className="flex items-center justify-end gap-3">
          <div className="relative group">
            <motion.button
              onClick={() => token && setShowAddForm(true)}
              className={`flex items-center justify-center w-10 h-10 rounded-full text-white transition-all ${
                !token ? "opacity-60 cursor-not-allowed" : ""
              }`}
              style={{ backgroundColor: "hsl(var(--main-color))" }}
              whileHover={{ scale: token ? 1.03 : 1 }}
              whileTap={{ scale: token ? 0.97 : 1 }}
              disabled={!token}
            >
              <Plus size={20} />
            </motion.button>

            {/* Tooltip that appears on hover when not authenticated */}
            {!token && (
              <div className="absolute top-1/2 right-full -translate-y-1/2 mr-3 w-48 bg-gray-800 text-white text-xs rounded p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 text-right">
                עלייך להתחבר דרך הצ'אט כדי לשתף סיפור
                <div className="absolute top-1/2 right-0 -translate-y-1/2 -mr-1 border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-800"></div>
              </div>
            )}
          </div>

          <span className="text-xl font-medium text-gray-800">
            שתפי <span style={{ color: "hsl(var(--main-color))" }}>מה</span> שעל{" "}
            <span style={{ color: "hsl(var(--main-color))" }}>ליבך</span>
          </span>
        </div>
      </div>
      {/* Search and filter controls - Updated to match the image */}
      {/* Search and filter controls - Two separate rounded buttons */}
      <div className="flex justify-start items-center gap-3 mb-6">
        {/* Recent toggle button */}
        <button
          onClick={() => setShowLatest(!showLatest)}
          className="flex items-center gap-2 py-[12px] pr-[16px] pl-[24px] bg-[#F4F6FA] rounded-full transition-colors"
          aria-label="הצג לפי סדר עדכניות"
        >
          {" "}
          <span
            className={`transition-transform ${showLatest ? "rotate-180" : ""}`}
          >
            <ArrowUpDown size={16} className="text-gray-600" />
          </span>
          <span className="text-gray-700 text-sm">אחרונים</span>
        </button>

        {/* Search button */}
        <div className="relative">
          {searchExpanded ? (
            <div className="flex items-center bg-[#F4F6FA] rounded-full overflow-hidden">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="חיפוש סיפורים..."
                className="pr-10 pl-12 py-2 w-64 focus:outline-none text-sm bg-transparent"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                autoFocus
                onBlur={() => {
                  if (!searchInputRef.current?.value) {
                    setSearchExpanded(false);
                  }
                }}
              />
              <button
                onClick={handleSearch}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full flex items-center justify-center"
              >
                <Search size={18} className="text-gray-500" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSearchExpanded(true)}
              className="bg-[#F4F6FA] p-3 rounded-full flex items-center justify-center"
              aria-label="פתח חיפוש"
            >
              <Search size={20} className="text-gray-600" />
            </button>
          )}
        </div>
      </div>
      {/* Stories grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
      >
        {filteredStories.map((story) => (
          <motion.div
            key={story.id}
            className="bg-[#F4F6FA] p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedStory(story)}
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-xl font-bold mb-2">{story.title}</h3>
            <p className="text-gray-600 line-clamp-3">{story.body}</p>
            <div className="mt-4 text-sm text-gray-500">
              {new Date(story.date).toLocaleDateString("he-IL")}
            </div>
          </motion.div>
        ))}
      </motion.div>
      {/* Empty state */}
      {filteredStories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">לא נמצאו סיפורים</p>
          <button
            onClick={() => {
              setSearchTerm("");
              if (searchInputRef.current) searchInputRef.current.value = "";
            }}
            className="text-blue-500 underline"
          >
            נקה חיפוש
          </button>
        </div>
      )}
      {/* Story detail modal */}
      <AnimatePresence>
        {selectedStory && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedStory(null)}
          >
            <motion.div
              className="bg-[#F4F6FA] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-10">
                <h2 className="text-2xl font-bold">{selectedStory.title}</h2>
                <button
                  onClick={() => setSelectedStory(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="mb-6 whitespace-pre-wrap">
                {selectedStory.body}
              </div>

              <div className="text-sm text-gray-500 mt-6">
                פורסם בתאריך{" "}
                {new Date(selectedStory.date).toLocaleDateString("he-IL")}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Add story modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddForm(false)}
          >
            <motion.div
              className="bg-white rounded-xl max-w-2xl w-full p-6"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold">שיתוף סיפור חדש</h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">כותרת</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="הוסיפי כותרת לסיפור שלך"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">תוכן</label>
                  <textarea
                    value={newBody}
                    onChange={(e) => setNewBody(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg h-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="כתבי את הסיפור שלך כאן..."
                  />
                </div>
              </div>

              <div className="flex justify-end mt-6 gap-3">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  ביטול
                </button>
                <button
                  onClick={handleAddStory}
                  disabled={!newTitle.trim() || !newBody.trim()}
                  className="px-4 py-2 bg-[#4762FF] text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  פרסום
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StoriesPage;
