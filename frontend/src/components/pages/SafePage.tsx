import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../contexts/AuthContext";
import type { VaultFile } from "../../types/index";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "../../components/ui/card";
import { Label } from "../../components/ui/label";

export const SafePage = () => {
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
      <div
        className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-4 sm:p-6 w-full"
        dir="rtl"
      >
        <div className="flex flex-col md:flex-row max-w-full sm:max-w-lg md:max-w-3xl lg:max-w-5xl w-full mx-auto items-center md:items-start gap-6 md:gap-0">
          {/* Right side - Text and login message */}
          <div className="w-full md:w-3/5 space-y-4 pt-0 md:pt-8 order-2 md:order-1">
            <h1 className="text-2xl md:text-3xl font-bold text-[#333333] mb-2 text-center md:text-right">
              ברוכה הבאה אל <span className="text-[#4762FF]">הכספת</span>
            </h1>

            <p className="text-base md:text-lg text-[#333333] mb-4 md:mb-6 text-center md:text-right">
              כאן תוכלי להעלות איזה קבצים שתרצי הכל מוגן באבטחה
            </p>

            <div className="mt-4 md:mt-10 space-y-4 text-center md:text-right">
              <p className="text-[#666666] font-medium">
                כדי לגשת לכספת, עליך להתחבר למערכת תחילה.
              </p>
            </div>
          </div>

          {/* Left side - Image with blue border */}
          <div className="w-full sm:w-2/3 md:w-2/5 p-2 bg-white md:mr-6 order-1 md:order-2 flex justify-center">
            <img
              src="/images/locked-safe.png"
              alt="כספת נעולה"
              className="w-full max-w-[250px] md:max-w-full object-contain"
            />
          </div>
        </div>
      </div>
    );
  }

  // Authenticated but need safe code
  if (!isUnlocked) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-4 sm:p-6 w-full"
        dir="rtl"
      >
        <div className="flex flex-col md:flex-row max-w-full sm:max-w-lg md:max-w-3xl lg:max-w-5xl w-full mx-auto items-center md:items-start gap-6 md:gap-0">
          {/* Right side - Text and PIN input */}
          <div className="w-full md:w-3/5 space-y-4 pt-0 md:pt-8 order-2 md:order-1">
            <h1 className="text-2xl md:text-3xl font-bold text-[#333333] mb-2 text-center md:text-right">
              ברוכה הבאה אל <span className="text-[#4762FF]">הכספת</span>
            </h1>

            <p className="text-base md:text-lg text-[#333333] mb-4 md:mb-6 text-center md:text-right">
              כאן תוכלי לשמור את כל התיעוד החשוב בצורה מאובטחת ופרטית.
            </p>

            <div className="mt-4 md:mt-8 space-y-4 max-w-full md:max-w-md mx-auto md:mx-0">
              <label className="block text-[#333333] text-base font-medium text-center md:text-right">
                אנא הזיני את קוד הכספת שלך:
              </label>

              <Input
                type="password"
                value={safeCode}
                onChange={(e) => setSafeCode(e.target.value)}
                className="w-full text-center text-lg py-3 md:py-4 rounded-lg border-gray-300 focus:border-[#4762FF] focus:ring focus:ring-[#4762FF] focus:ring-opacity-20"
                placeholder="●●●●"
                maxLength={4}
              />

              <Button
                onClick={handleUnlock}
                className="w-full bg-[#4762FF] text-white hover:bg-blue-600 rounded-full py-3 text-base font-medium mt-2"
              >
                פתיחת הכספת
              </Button>
            </div>
          </div>

          {/* Left side - Image with blue border */}
          <div className="w-full sm:w-2/3 md:w-2/5 p-2 bg-white md:mr-6 order-1 md:order-2 flex justify-center">
            <img
              src="/images/locked-safe.png"
              alt="דלת כספת"
              className="w-full max-w-[250px] md:max-w-full object-contain"
            />
          </div>
        </div>
      </div>
    );
  }
  // Safe is unlocked - Google Drive-like interface
  return (
    <div
      className="w-full max-w-full sm:max-w-xl md:max-w-3xl lg:max-w-5xl mx-auto py-4 sm:py-6 md:py-8 px-3 sm:px-4"
      dir="rtl"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-3 sm:gap-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#333333] text-center sm:text-right">
            הכספת הדיגיטלית שלך
          </h1>
          <p className="text-[#666666] mt-1 sm:mt-2 text-center sm:text-right text-sm sm:text-base">
            כאן תוכלי להעלות איזה קבצים שתרצי הכל מוגן באבטחה
          </p>
        </div>

        {/* Share button */}
        <div className="flex gap-3 justify-center sm:justify-start mt-3 sm:mt-0">
          <Button
            variant="outline"
            className="text-[#4762FF] border-[#4762FF] rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm flex items-center gap-1 sm:gap-2"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="sm:w-[16px] sm:h-[16px]"
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
            className="bg-[#4762FF] text-white rounded-full p-1.5 sm:p-2.5 flex items-center justify-center gap-1 sm:gap-2"
          >
            {/* Plus icon */}
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
              className="sm:w-[16px] sm:h-[16px]"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>

            {/* File upload icon */}
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
              className="sm:w-[16px] sm:h-[16px]"
            >
              <path d="M14 3v4a1 1 0 0 0 1 1h4" />
              <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" />
              <path d="M12 11v6" />
              <path d="M9 14l3-3 3 3" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Category folders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8 md:mb-10">
        {Object.entries(categoryInfo).map(([key, info]) => (
          <button
            key={key}
            onClick={() => setCategory(key)}
            className={`p-3 sm:p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow ${
              info.color
            } ${category === key ? "ring-2 ring-[#4762FF]" : ""}`}
          >
            <div className="text-3xl sm:text-4xl md:text-5xl mb-2 sm:mb-3">
              {info.icon}
            </div>
            <h3 className="text-base sm:text-lg font-medium">{info.label}</h3>
            <p className="text-xs sm:text-sm text-gray-500">
              {vaultFiles.length > 0 && category === key
                ? `${vaultFiles.length} קבצים`
                : "לחצי לצפייה"}
            </p>
          </button>
        ))}
      </div>

      {/* Current category files */}
      <div className="bg-white rounded-lg border shadow-sm p-3 sm:p-4 md:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
            <span>{categoryInfo[category].icon}</span>
            <span>{categoryInfo[category].label}</span>
          </h2>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-md border px-2 sm:px-3 py-1 text-xs sm:text-sm bg-white shadow"
          >
            <option value="desc">חדש לישן</option>
            <option value="asc">ישן לחדש</option>
          </select>
        </div>

        {status && (
          <div className="mb-4 p-2 bg-green-50 border border-green-200 rounded text-center text-sm">
            {status}
          </div>
        )}

        {isFetching ? (
          <div className="text-center py-8 sm:py-12 text-gray-500">
            <Loader2 className="animate-spin inline-block mb-2 h-6 w-6 sm:h-8 sm:w-8" />
            <p>טוען {categoryInfo[category].label}...</p>
          </div>
        ) : sortedFiles.length === 0 ? (
          <div className="text-center py-10 sm:py-16 text-gray-500">
            <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4 opacity-30">
              {categoryInfo[category].icon}
            </div>
            <p className="text-base sm:text-lg">אין כרגע קבצים בתיקייה זו</p>
            <Button
              variant="outline"
              className="mt-3 sm:mt-4 border-[#4762FF] text-[#4762FF] text-sm"
              onClick={() => setShowUploadDialog(true)}
            >
              העלאת קבצים
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
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
                <p className="truncate p-2 text-[10px] sm:text-xs text-gray-600 text-center">
                  {file.filename}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Upload dialog (modal) */}
      {showUploadDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
          <Card className="w-full max-w-sm sm:max-w-md md:max-w-lg rounded-2xl overflow-hidden">
            <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-bold">
                  העלאת קבצים חדשים
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUploadDialog(false)}
                >
                  ×
                </Button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="category"
                    className="text-[#333333] font-medium text-sm sm:text-base"
                  >
                    קטגוריה:
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(categoryInfo).map(([key, info]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setCategory(key)}
                        className={`p-2 sm:p-3 rounded-lg border text-center ${
                          category === key
                            ? "bg-blue-50 border-[#4762FF]"
                            : "bg-white hover:bg-gray-50"
                        }`}
                      >
                        <div className="text-xl sm:text-2xl mb-1">
                          {info.icon}
                        </div>
                        <div className="text-xs sm:text-sm">{info.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="file"
                    className="text-[#333333] font-medium text-sm sm:text-base"
                  >
                    בחירת קבצים:
                  </Label>
                  <Input
                    id="file"
                    type="file"
                    accept={categoryInfo[category].acceptedTypes}
                    multiple
                    onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                    disabled={loading}
                    className="text-right text-xs sm:text-sm"
                  />
                  <p className="text-xs sm:text-sm text-gray-500">
                    פורמטים מותרים: {categoryInfo[category].acceptedTypes}
                  </p>
                </div>

                {files.length > 0 && (
                  <div className="bg-gray-50 p-2 rounded border">
                    <p className="font-medium mb-1 text-xs sm:text-sm">
                      נבחרו {files.length} קבצים:
                    </p>
                    <ul className="text-xs text-gray-600 max-h-16 sm:max-h-24 overflow-y-auto">
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
                    className="border-[#4762FF] text-[#4762FF] text-xs sm:text-sm"
                  >
                    ביטול
                  </Button>
                  <Button
                    onClick={handleUpload}
                    disabled={!files.length || loading}
                    className="bg-[#4762FF] text-white text-xs sm:text-sm"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="animate-spin size-3 sm:size-4" />{" "}
                        מעלה...
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
