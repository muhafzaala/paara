import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send } from "lucide-react";
import { assistantApi } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const STARTER_CHIPS = [
  "Tell me about Ajrak",
  "Gift under PKR 5000",
  "What is blue pottery?",
];

export function CraftAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try {
      const res = await assistantApi.chat(newMessages);
      const reply = res.data?.reply || "I'm sorry, I couldn't respond right now.";
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "The craft assistant is temporarily unavailable. Please try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-6 right-6 z-[90]">
        <AnimatePresence>
          {!open && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              whileHover={{ scale: 1.08 }}
              onClick={() => setOpen(true)}
              className="w-14 h-14 rounded-full grid place-items-center shadow-xl"
              style={{ background: "#C9921A", color: "#1C3A2A" }}
              aria-label="Open craft assistant"
            >
              <Sparkles size={22} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Chat panel */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="w-80 rounded-2xl shadow-xl overflow-hidden flex flex-col"
              style={{ maxHeight: "520px", background: "#FFF8EC" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3" style={{ background: "#1C3A2A" }}>
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-[#C9921A]" />
                  <span className="text-sm font-semibold text-[#F5EDD8]">Craft Assistant</span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="text-[rgba(245,237,216,0.6)] hover:text-[#F5EDD8] transition-colors"
                  aria-label="Close assistant"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: "240px", maxHeight: "320px" }}>
                {messages.length === 0 && (
                  <div className="text-center pt-4">
                    <p className="text-xs text-[#6B645A] mb-3">Ask me about Pakistani crafts, regions, or gift ideas</p>
                    <div className="flex flex-col gap-2">
                      {STARTER_CHIPS.map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => sendMessage(chip)}
                          className="text-xs px-3 py-2 rounded-full border border-[rgba(201,146,26,0.3)] text-[#C9921A] hover:bg-[rgba(201,146,26,0.1)] transition-colors text-left"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className="max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed"
                      style={{
                        background: msg.role === "user" ? "#1C3A2A" : "white",
                        color: msg.role === "user" ? "#F5EDD8" : "#1C3A2A",
                        borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white rounded-2xl px-4 py-3 flex gap-1 items-center">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                          className="w-1.5 h-1.5 rounded-full bg-[#C9921A]"
                        />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-[rgba(28,58,42,0.1)]">
                <form
                  onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
                  className="flex gap-2"
                >
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about crafts…"
                    disabled={loading}
                    className="flex-1 bg-white border border-[rgba(28,58,42,0.14)] rounded-full px-3 py-2 text-xs focus:outline-none focus:border-[#C9921A] disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="w-8 h-8 rounded-full grid place-items-center flex-shrink-0 disabled:opacity-40"
                    style={{ background: "#C9921A", color: "#1C3A2A" }}
                    aria-label="Send"
                  >
                    <Send size={13} />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

export default CraftAssistant;
