import { useState, useRef, useEffect } from "react";
import { Textarea } from "../../components/ui/textarea";
import { Card, CardContent } from "../../components/ui/card";
import { ChatFileUpload } from "../../components/chat/ChatFileUpload";
import { TypingIndicator } from "../../components/widgets/TypingIndicator";
import { clsx } from "clsx";
import { useAuth } from "../../contexts/AuthContext";
import { FileVideo, Mic, X } from "lucide-react";
import type { ChatMessage, UploadedFile } from "../../types";

export const ChatPage = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

  const { token } = useAuth();

  const [conversationId, setConversationId] = useState<string | null>(() => {
    return localStorage.getItem("chatConversationId");
  });

  // Handle file upload button click
  const handleFileUploadClick = () => {
    setShowFileUpload(true);
  };

  const getSuccessMessage = (category: string): string => {
    const fileType =
      category === "images"
        ? "התמונות"
        : category === "videos"
        ? "הסרטונים"
        : "ההקלטות";

    return `${fileType} הועלו בהצלחה לכספת האישית שלך ✨
אנחנו שומרים עליהם בבטחה, רק עבורך.
את יכולה להיות רגועה שהתוכן שלך מאובטח ופרטי לחלוטין.`;
  };

  const getFailureMessage = (category: string): string => {
    const fileType =
      category === "images"
        ? "התמונות"
        : category === "videos"
        ? "הסרטונים"
        : "ההקלטות";

    return `לצערנו, העלאת ${fileType} לא הצליחה 💔
אל דאגה, זה לא באשמתך - לפעמים זה קורה.
את מוזמנת לנסות שוב, או לבחור קבצים אחרים.
אנחנו כאן איתך בכל שלב.`;
  };
  const handleUploadSuccess = async (
    fileUrls: string[],
    previewFiles: File[],
    category: string
  ) => {
    if (!chatStarted) setChatStarted(true);

    // Create file objects with preview URLs for display
    const files: UploadedFile[] = fileUrls.map((url, index) => {
      // Create object URL for preview
      const file = previewFiles[index];
      const previewUrl = URL.createObjectURL(file);

      return {
        url,
        previewUrl,
        name: file.name,
        type:
          category === "images"
            ? "image"
            : category === "videos"
            ? "video"
            : "audio",
      };
    });

    const successMessage = getSuccessMessage(category);

    // Add success message to UI immediately
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: successMessage,
        files,
      },
    ]);

    // Notify the chat endpoint about successful file upload
    try {
      // Check if we have a conversation ID first
      if (conversationId) {
        await fetch(`http://localhost:8000/conversation/${conversationId}`, {
          method: "PUT", // Changed from POST to PUT
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({
            file_type: category,
            amount: previewFiles.length,
            assistant_message: successMessage,
            // conversation_id removed from body since it's in the URL
          }),
        });
      } else {
        console.warn(
          "No conversation ID available, cannot update conversation"
        );
      }
    } catch (err) {
      console.error("Failed to notify about file upload:", err);
    }

    // Close the upload dialog
    setShowFileUpload(false);
  };

  // Handle upload failure
  const handleUploadFailure = (category: string) => {
    if (!chatStarted) setChatStarted(true);

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: getFailureMessage(category),
      },
    ]);

    setShowFileUpload(false);
  };

  useEffect(() => {
    return () => {
      // Clean up any created object URLs when component unmounts
      messages.forEach((message) => {
        if (message.files) {
          message.files.forEach((file) => {
            if (file.previewUrl) {
              URL.revokeObjectURL(file.previewUrl);
            }
          });
        }
      });
    };
  }, []);

  const sendMessage = async () => {
    // Regular text message sending logic unchanged
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
        body: JSON.stringify({
          message: input,
          conversation_id: conversationId || "",
        }),
      });
      const data = await res.json();
      if (data.conversation_id) {
        // Changed from session_id
        setConversationId(data.conversation_id); // Changed from session_id
        localStorage.setItem("chatConversationId", data.conversation_id); // Changed from chatSessionId
      }
      setMessages((m) => [...m, { role: "assistant", content: data.response }]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    if (messages.length > 1) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const MessageFiles = ({ files }: { files: UploadedFile[] }) => {
    return (
      <div className="flex flex-wrap gap-2 my-2 justify-end" dir="rtl">
        {files.map((file, index) => (
          <div
            key={index}
            className="border rounded-md overflow-hidden bg-white shadow-sm"
          >
            {file.type === "image" ? (
              <img
                src={file.previewUrl}
                alt={file.name || "תמונה שהועלתה"}
                className="w-24 h-24 object-cover cursor-pointer"
                loading="lazy"
                onClick={() => setEnlargedImage(file.previewUrl)}
              />
            ) : file.type === "video" ? (
              <div className="w-32 h-32">
                <video controls className="w-full h-full object-cover">
                  <source src={file.previewUrl} />
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 p-2">
                    <FileVideo className="h-10 w-10 text-gray-500" />
                    <p className="text-xs text-gray-500 truncate max-w-full mt-1">
                      {file.name || "סרטון"}
                    </p>
                  </div>
                </video>
              </div>
            ) : (
              <div className="w-32">
                <audio controls className="w-full mt-2">
                  <source src={file.previewUrl} />
                </audio>
                <div className="p-2 flex justify-center">
                  <Mic className="h-6 w-6 text-gray-500" />
                  <p className="text-xs text-gray-500 mr-1 truncate">
                    {file.name || "הקלטה"}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const ImageLightbox = () => {
    if (!enlargedImage) return null;

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
        onClick={() => setEnlargedImage(null)}
      >
        <div className="relative max-w-[90%] max-h-[90%]">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEnlargedImage(null);
            }}
            className="absolute top-2 right-2 bg-white rounded-full p-1 text-gray-800 hover:bg-gray-200"
          >
            <X size={24} />
          </button>
          <img
            src={enlargedImage}
            alt="Enlarged view"
            className="max-w-full max-h-[90vh] object-contain"
          />
        </div>
      </div>
    );
  };

  return (
    <section
      className="flex flex-col w-full max-w-[100%] sm:max-w-[95%] md:max-w-[90%] lg:max-w-[1064px] h-auto min-h-[calc(100vh-150px)] md:h-[518px] pt-4 sm:pt-6 md:pt-10 pb-4 mt-2 md:mt-4 mx-auto"
      dir="rtl"
    >
      <ImageLightbox />

      {/* Rest of the JSX remains unchanged */}
      {!chatStarted && (
        <div className="text-right max-w-full sm:max-w-xl md:max-w-2xl mb-6 sm:mb-8 px-3 sm:px-4 text-[#333] font-['Rubik'] leading-[125%]">
          <h2 className="text-xl sm:text-2xl font-bold">היי, טוב שבאת.</h2>
          <p className="mb-2 text-base sm:text-lg">
            לפעמים <span className="text-[#4762FF] font-medium">משהו קטן</span>{" "}
            נוגע עמוק —<br />
            גם אם את לא לגמרי יודעת למה.
          </p>
          <p>
            <span className="text-[#4762FF] text-base sm:text-lg font-medium">
              אם יש לך משהו על הלב —
            </span>
            <br />
            את מוזמנת לכתוב.
            <br />
            לא כדי להסביר, רק כדי לשחרר.
          </p>
        </div>
      )}

      <div
        dir="ltr"
        className="flex-1 rounded-lg overflow-y-auto flex flex-col mb-4 scrollbar-thin"
      >
        <div dir="rtl" className="p-3 sm:p-4 md:p-6 flex-1 flex flex-col">
          {messages.slice(chatStarted ? 0 : 1).map((m, i) => (
            <Card
              key={i}
              className={clsx(
                "max-w-[90%] sm:max-w-[85%] mb-4 sm:mb-6 text-right break-words",
                {
                  "ml-auto bg-white shadow-sm": m.role === "user",
                  // Change mr-auto to ml-auto
                  "ml-auto bg-transparent shadow-none border-none":
                    m.role === "assistant",
                }
              )}
            >
              <CardContent
                className="p-3 md:p-4 text-sm sm:text-base leading-relaxed font-['Rubik'] text-zinc-800 rtl whitespace-pre-wrap"
                dir="rtl"
              >
                <div
                  className="hebrew-text"
                  style={{ direction: "rtl", unicodeBidi: "plaintext" }}
                >
                  {m.content}
                </div>

                {/* Display uploaded files if present */}
                {m.files && m.files.length > 0 && (
                  <MessageFiles files={m.files} />
                )}
              </CardContent>
            </Card>
          ))}

          {loading && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* File upload component with modified props */}
      {showFileUpload && (
        <ChatFileUpload
          showUploadUI={showFileUpload}
          onUploadSuccess={handleUploadSuccess}
          onUploadFailure={handleUploadFailure}
          onCancel={() => setShowFileUpload(false)}
          initialCategory="images"
        />
      )}

      <div className="flex justify-center items-center w-full">
        <div className="bg-[#ededed] rounded-[32px] p-3 sm:p-4 md:p-[24px] w-full sm:w-[90%] md:w-[848px] h-auto min-h-[120px] sm:min-h-[160px] md:h-[192px] shadow-md relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full resize-none text-right text-sm sm:text-base border-none focus:border-none focus:ring-0 bg-transparent placeholder-[#757575] shadow-none outline-none focus:outline-none h-[60px] sm:h-[80px] md:h-[100px] focus:shadow-none !ring-0 !ring-offset-0 font-['Rubik']"
            placeholder="כתבי כל דבר..."
            rows={4}
            dir="rtl"
          />

          <div className="flex items-center justify-between absolute bottom-3 sm:bottom-4 md:bottom-5 left-3 sm:left-4 md:left-5 right-3 sm:right-4 md:right-5">
            <div className="relative group">
              <button
                onClick={token ? handleFileUploadClick : undefined}
                disabled={!token}
                className={`border rounded-full flex items-center gap-1 sm:gap-2 py-2 sm:py-[12px] px-3 sm:pr-[16px] sm:pl-[24px] transition-colors text-xs sm:text-sm ${
                  token
                    ? "text-[#4762FF] border-[#4762FF] hover:bg-blue-50"
                    : "text-gray-400 border-gray-300 cursor-not-allowed opacity-70"
                }`}
                aria-label={
                  token ? "העלאת קבצים" : "העלאת קבצים - דורש התחברות"
                }
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
                    stroke={token ? "#4762FF" : "#999999"}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-xs font-medium">העלאת קבצים</span>
              </button>

              {/* Tooltip that appears on hover when not authenticated */}
              {!token && (
                <div className="absolute bottom-full mb-2 right-0 w-48 bg-gray-800 text-white text-xs rounded p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 text-right">
                  עליך להתחבר דרך הצ'אט כדי להעלות קבצים
                  <div className="absolute top-full right-4 -mt-1 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              )}
            </div>

            <button
              onClick={sendMessage}
              className="bg-[#4762FF] text-white rounded-full flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12"
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

export default ChatPage;
