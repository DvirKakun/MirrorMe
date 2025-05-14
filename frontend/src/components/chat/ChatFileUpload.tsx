// src/components/chat/ChatFileUpload.tsx
import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import {
  X,
  Image,
  FileVideo,
  Mic,
  UploadCloud,
  Loader2,
  Check,
} from "lucide-react";

interface FileWithPreview extends File {
  preview?: string;
  type: string;
}

interface ChatFileUploadProps {
  onUploadSuccess: (
    fileUrls: string[],
    fileObjects: File[],
    category: string
  ) => void;
  onUploadFailure: (category: string) => void;
  onCancel: () => void;
  showUploadUI: boolean;
  initialCategory?: "images" | "videos" | "records";
}

export const ChatFileUpload = ({
  onUploadSuccess,
  onUploadFailure,
  onCancel,
  showUploadUI,
  initialCategory = "images",
}: ChatFileUploadProps) => {
  const [activeTab, setActiveTab] = useState<"images" | "videos" | "records">(
    initialCategory
  );

  // Track files separately for each category
  const [imageFiles, setImageFiles] = useState<FileWithPreview[]>([]);
  const [videoFiles, setVideoFiles] = useState<FileWithPreview[]>([]);
  const [audioFiles, setAudioFiles] = useState<FileWithPreview[]>([]);

  // Track upload state for each category
  const [uploadingCategory, setUploadingCategory] = useState<string | null>(
    null
  );
  const [categoryStatus, setCategoryStatus] = useState<{
    images: "idle" | "success" | "error";
    videos: "idle" | "success" | "error";
    records: "idle" | "success" | "error";
  }>({
    images: "idle",
    videos: "idle",
    records: "idle",
  });

  // Clean up any previews when unmounting - MUST BE BEFORE CONDITIONAL RETURNS
  useEffect(() => {
    return () => {
      [...imageFiles, ...videoFiles, ...audioFiles].forEach((file) => {
        if (file.preview) URL.revokeObjectURL(file.preview);
      });
    };
  }, [imageFiles, videoFiles, audioFiles]);

  if (!showUploadUI) return null;

  // Get current files based on active tab
  const getCurrentFiles = () => {
    switch (activeTab) {
      case "images":
        return imageFiles;
      case "videos":
        return videoFiles;
      case "records":
        return audioFiles;
      default:
        return [];
    }
  };

  // Set files for current category
  const setCurrentFiles = (files: FileWithPreview[]) => {
    switch (activeTab) {
      case "images":
        setImageFiles(files);
        break;
      case "videos":
        setVideoFiles(files);
        break;
      case "records":
        setAudioFiles(files);
        break;
    }
  };

  const acceptedTypes = {
    images: ".jpg,.jpeg,.png,.gif,.webp",
    videos: ".mp4,.mov,.avi,.webm",
    records: ".mp3,.wav,.m4a,.ogg",
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as FileWithPreview[];

    // Create preview URLs for image files
    const filesWithPreviews = files.map((file) => {
      if (file.type.startsWith("image/")) {
        file.preview = URL.createObjectURL(file);
      }
      return file;
    });

    // Update files for the current category
    setCurrentFiles(filesWithPreviews);

    // Reset upload status for this category
    setCategoryStatus((prev) => ({
      ...prev,
      [activeTab]: "idle",
    }));
  };

  const handleTabChange = (tab: "images" | "videos" | "records") => {
    setActiveTab(tab);
  };

  // This is the key function for uploading files
  const uploadCurrentFiles = async () => {
    const currentFiles = getCurrentFiles();
    if (currentFiles.length === 0) return;

    setUploadingCategory(activeTab);

    try {
      // Create FormData
      const formData = new FormData();
      currentFiles.forEach((file) => {
        formData.append("files", file);
      });
      formData.append("category", activeTab);

      // Upload to server
      const response = await fetch("http://localhost:8000/vault/items", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();

      // Extract file URLs from response
      const fileUrls = data.files?.map((f: any) => f.url) || [];

      // Update status
      setCategoryStatus((prev) => ({
        ...prev,
        [activeTab]: "success",
      }));

      // Call the success handler with both URLs and original File objects
      onUploadSuccess(fileUrls, currentFiles, activeTab);

      // Clear files for this category
      setCurrentFiles([]);
    } catch (error) {
      console.error(`Error uploading ${activeTab}:`, error);
      setCategoryStatus((prev) => ({
        ...prev,
        [activeTab]: "error",
      }));
      onUploadFailure(activeTab);
    } finally {
      setUploadingCategory(null);
    }
  };
  const removeFile = (index: number) => {
    const currentFiles = getCurrentFiles();

    // Clean up preview URL to avoid memory leaks
    if (currentFiles[index]?.preview) {
      URL.revokeObjectURL(currentFiles[index].preview!);
    }

    // Remove file from the current category
    setCurrentFiles(currentFiles.filter((_, i) => i !== index));
  };

  // Get status color for tab indicator
  const getTabStatusColor = (tab: string) => {
    const status = categoryStatus[tab as keyof typeof categoryStatus];
    if (status === "success")
      return "text-green-500 border-b-2 border-green-500";
    if (status === "error") return "text-red-500 border-b-2 border-red-500";
    return tab === activeTab
      ? "text-[#4762FF] border-b-2 border-[#4762FF]"
      : "text-gray-500";
  };

  // Get status indicator for a tab
  const getTabStatusIndicator = (tab: string) => {
    const status = categoryStatus[tab as keyof typeof categoryStatus];
    if (status === "success") return <Check size={14} className="mr-1" />;
    if (status === "error") return <X size={14} className="mr-1" />;
    return null;
  };

  return (
    <div
      className="bg-white rounded-lg border shadow-sm p-4 mb-4 w-full"
      dir="rtl"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">העלאת קבצים</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={18} />
        </Button>
      </div>

      {/* Type selector tabs with status indicators */}
      <div className="flex border-b mb-4">
        <button
          className={`flex items-center px-4 py-2 ${getTabStatusColor(
            "images"
          )}`}
          onClick={() => handleTabChange("images")}
        >
          <Image size={16} className="ml-2" />
          <span>תמונות</span>
          {getTabStatusIndicator("images")}
        </button>
        <button
          className={`flex items-center px-4 py-2 ${getTabStatusColor(
            "videos"
          )}`}
          onClick={() => handleTabChange("videos")}
        >
          <FileVideo size={16} className="ml-2" />
          <span>סרטונים</span>
          {getTabStatusIndicator("videos")}
        </button>
        <button
          className={`flex items-center px-4 py-2 ${getTabStatusColor(
            "records"
          )}`}
          onClick={() => handleTabChange("records")}
        >
          <Mic size={16} className="ml-2" />
          <span>הקלטות</span>
          {getTabStatusIndicator("records")}
        </button>
      </div>

      {/* Status message for current category */}
      {categoryStatus[activeTab] === "success" && (
        <div className="bg-green-50 text-green-700 p-3 rounded-md mb-4 text-sm flex items-center">
          <div className="mr-2 flex-shrink-0">✅</div>
          <div>
            ה
            {activeTab === "images"
              ? "תמונות"
              : activeTab === "videos"
              ? "סרטונים"
              : "הקלטות"}{" "}
            הועלו בהצלחה
          </div>
        </div>
      )}

      {categoryStatus[activeTab] === "error" && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4 text-sm flex items-center">
          <div className="mr-2 flex-shrink-0">❌</div>
          <div>
            העלאת ה
            {activeTab === "images"
              ? "תמונות"
              : activeTab === "videos"
              ? "סרטונים"
              : "הקלטות"}{" "}
            נכשלה
          </div>
        </div>
      )}

      {/* File input area */}
      <div className="mb-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <label className="cursor-pointer block">
            <input
              type="file"
              multiple
              accept={acceptedTypes[activeTab]}
              onChange={handleFileChange}
              className="hidden"
              disabled={uploadingCategory !== null}
            />
            <div className="flex flex-col items-center">
              <UploadCloud className="h-10 w-10 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-1">
                גרור לכאן או לחץ לבחירת{" "}
                {activeTab === "images"
                  ? "תמונות"
                  : activeTab === "videos"
                  ? "סרטונים"
                  : "הקלטות"}
              </p>
              <p className="text-xs text-gray-500">
                {activeTab === "images" && "JPG, PNG, GIF או WEBP"}
                {activeTab === "videos" && "MP4, MOV, AVI או WEBM"}
                {activeTab === "records" && "MP3, WAV, M4A או OGG"}
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Preview of selected files for current category */}
      {getCurrentFiles().length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">
            נבחרו {getCurrentFiles().length}
            {activeTab === "images"
              ? " תמונות"
              : activeTab === "videos"
              ? " סרטונים"
              : " הקלטות"}
            :
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {getCurrentFiles().map((file, index) => (
              <div
                key={index}
                className="relative border rounded-md p-2 bg-gray-50"
              >
                {file.type.startsWith("image/") && file.preview ? (
                  <img
                    src={file.preview}
                    alt={file.name}
                    className="w-full h-20 object-cover mb-1 rounded"
                  />
                ) : file.type.startsWith("video/") ? (
                  <div className="w-full h-20 bg-gray-200 flex items-center justify-center mb-1 rounded">
                    <FileVideo className="text-gray-400" />
                  </div>
                ) : (
                  <div className="w-full h-20 bg-gray-200 flex items-center justify-center mb-1 rounded">
                    <Mic className="text-gray-400" />
                  </div>
                )}
                <p className="text-xs truncate">{file.name}</p>
                <button
                  className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow-sm"
                  onClick={() => removeFile(index)}
                  disabled={uploadingCategory !== null}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <div className="text-xs text-gray-500">
          {categoryStatus.images === "success" && "✓ תמונות "}
          {categoryStatus.videos === "success" && "✓ סרטונים "}
          {categoryStatus.records === "success" && "✓ הקלטות"}
        </div>
        <div className="flex">
          <Button
            onClick={onCancel}
            variant="outline"
            className="ml-2"
            disabled={uploadingCategory !== null}
          >
            סיום
          </Button>
          <Button
            onClick={uploadCurrentFiles}
            disabled={
              getCurrentFiles().length === 0 || uploadingCategory !== null
            }
            className="bg-[#4762FF] text-white"
          >
            {uploadingCategory === activeTab ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin h-4 w-4" />
                מעלה...
              </span>
            ) : (
              `העלאת ${getCurrentFiles().length} 
              ${
                activeTab === "images"
                  ? "תמונות"
                  : activeTab === "videos"
                  ? "סרטונים"
                  : "הקלטות"
              }`
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Component to display selected files in the chat
export const ChatFileDisplay = ({
  files,
  onRemove,
}: {
  files: FileWithPreview[];
  onRemove: (index: number) => void;
}) => {
  if (files.length === 0) return null;

  return (
    <div className="py-2">
      <div className="flex flex-wrap gap-2">
        {files.map((file, index) => (
          <div
            key={index}
            className="relative border rounded-md overflow-hidden bg-white shadow-sm"
          >
            {file.type.startsWith("image/") && file.preview ? (
              <div>
                <img
                  src={file.preview}
                  alt={file.name}
                  className="w-24 h-24 object-cover"
                />
                <div className="absolute top-1 right-1">
                  <button
                    className="bg-white rounded-full p-1 shadow-sm"
                    onClick={() => onRemove(index)}
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ) : file.type.startsWith("video/") ? (
              <div className="w-24 h-24 flex flex-col items-center justify-center bg-gray-100 p-2">
                <FileVideo className="h-10 w-10 text-gray-500" />
                <p className="text-xs truncate max-w-full mt-1">{file.name}</p>
                <button
                  className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm"
                  onClick={() => onRemove(index)}
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="w-24 h-24 flex flex-col items-center justify-center bg-gray-100 p-2">
                <Mic className="h-10 w-10 text-gray-500" />
                <p className="text-xs truncate max-w-full mt-1">{file.name}</p>
                <button
                  className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm"
                  onClick={() => onRemove(index)}
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Export the FileWithPreview type for use in other components
export type { FileWithPreview };
