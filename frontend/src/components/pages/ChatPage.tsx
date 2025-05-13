import { useState, useRef, useEffect } from "react";
import type { ChatMessage } from "../../types/index";
import { Card, CardContent } from "../../components/ui/card";
import { Textarea } from "../../components/ui/textarea";
import { TypingIndicator } from "../../components/widgets/TypingIndicator";
import { clsx } from "clsx";

export const ChatPage = () => {
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
      className="flex flex-col w-full max-w-[100%] sm:max-w-[95%] md:max-w-[90%] lg:max-w-[1064px] h-auto min-h-[calc(100vh-150px)] md:h-[518px] pt-4 sm:pt-6 md:pt-10 pb-4 mt-2 md:mt-4 mx-auto"
      dir="rtl"
    >
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
        className="flex-1 rounded-lg overflow-y-auto flex flex-col mb-4 scrollbar-thin"
        dir="ltr"
      >
        <div className="p-3 sm:p-4 md:p-6 flex-1 flex flex-col">
          {messages.slice(chatStarted ? 0 : 1).map((m, i) => (
            <Card
              key={i}
              className={clsx(
                "max-w-[90%] sm:max-w-[85%] mb-4 sm:mb-6 text-right break-words",
                {
                  "ml-auto text-[#F4F6FA] shadow-sm": m.role === "user",
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
              </CardContent>
            </Card>
          ))}

          {loading && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>
      </div>

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
            <button
              onClick={handleFileUpload}
              className="text-[#4762FF] border border-[#4762FF] rounded-full flex items-center gap-1 sm:gap-2 py-2 sm:py-[12px] px-3 sm:pr-[16px] sm:pl-[24px] hover:bg-blue-50 transition-colors text-xs sm:text-sm"
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
