"use client";
import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Send, Mic, MicOff, Volume2, VolumeX, Leaf, Loader2,
  BookOpen, ChevronDown, ChevronUp, Trash2, Sparkles,
  FileText, BarChart2
} from "lucide-react";
import toast from "react-hot-toast";
import { queryAPI, uploadAPI, ChatMessage, QueryResponse, DocumentMetadata } from "@/lib/api";

// ─── Confidence Badge ─────────────────────────────────────────────
function ConfidenceBadge({ level, score }: { level: string; score: number }) {
  const cls = level === "high" ? "badge-high" : level === "medium" ? "badge-medium" : "badge-low";
  const dot = level === "high" ? "#689f38" : level === "medium" ? "#d4a853" : "#e57373";
  return (
    <span className={cls}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: dot, display: "inline-block" }} />
      {level.charAt(0).toUpperCase() + level.slice(1)} Confidence · {Math.round(score * 100)}%
    </span>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────
function MessageBubble({ msg, onSpeak }: { msg: ChatMessage; onSpeak: (text: string) => void }) {
  const [showSources, setShowSources] = useState(false);
  const qr = msg.queryResponse;
  const isUser = msg.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start", marginBottom: 20 }}
    >
      {/* Avatar label */}
      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: 4, paddingLeft: isUser ? 0 : 4, paddingRight: isUser ? 4 : 0 }}>
        {isUser ? "You" : "🌿 AI Vaidya"}
      </div>

      {/* Bubble */}
      <div className={isUser ? "chat-bubble-user" : "chat-bubble-ai"}>
        {isUser ? (
          <p style={{ margin: 0 }}>{msg.content}</p>
        ) : (
          <div className="prose-ayurveda">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
          </div>
        )}

        {/* Metadata under AI message */}
        {!isUser && qr && (
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border-subtle)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
              <ConfidenceBadge level={qr.confidence} score={qr.confidence_score} />
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                {qr.processing_time_ms}ms
              </span>
              <button
                onClick={() => onSpeak(msg.content)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 2 }}
                title="Speak answer"
              >
                <Volume2 size={14} />
              </button>
            </div>

            {/* Related */}
            {(qr.related_herbs.length > 0 || qr.related_concepts.length > 0) && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                {[...qr.related_herbs, ...qr.related_concepts].slice(0, 6).map(t => (
                  <span key={t} className="tag-pill">{t}</span>
                ))}
              </div>
            )}

            {/* Sources toggle */}
            {qr.sources.length > 0 && (
              <button
                onClick={() => setShowSources(!showSources)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: "none", border: "none", cursor: "pointer",
                  color: "var(--teal-300)", fontSize: "0.8rem", fontWeight: 600, padding: 0,
                }}
              >
                <BookOpen size={13} />
                {qr.sources.length} source{qr.sources.length > 1 ? "s" : ""}
                {showSources ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            )}

            <AnimatePresence>
              {showSources && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {qr.sources.map((src, i) => (
                    <div key={i} className="source-card">
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--teal-300)" }}>
                          <FileText size={12} style={{ display: "inline", marginRight: 4 }} />
                          {src.document_name}
                        </span>
                        {src.page_number && (
                          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                            Page {src.page_number}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
                        "{src.chunk_text.slice(0, 200)}{src.chunk_text.length > 200 ? "..." : ""}"
                      </p>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 4 }}>
                        Relevance: {Math.round(src.relevance_score * 100)}%
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Suggestions ──────────────────────────────────────────────────
const DEFAULT_SUGGESTIONS = [
  "What are the three doshas in Ayurveda?",
  "How does turmeric help in wound healing?",
  "Explain Agni — the digestive fire",
  "Which herbs treat cough and cold?",
  "What is Panchakarma?",
  "Describe Ashwagandha's properties",
];

// ─── Main Chat Component ──────────────────────────────────────────
function ChatPageContent() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>(DEFAULT_SUGGESTIONS);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Load docs
    uploadAPI.listDocuments().then(r => setDocuments(r.data.documents || [])).catch(() => {});
    // Load suggestions
    queryAPI.getSuggestions().then(r => setSuggestions(r.data.suggestions || DEFAULT_SUGGESTIONS)).catch(() => {});
    // Pre-fill question from URL
    const q = searchParams.get("q");
    if (q) setInput(q);
  }, [searchParams]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = useCallback(async (text?: string) => {
    const question = (text || input).trim();
    if (!question || loading) return;

    const userMsg: ChatMessage = {
      role: "user",
      content: question,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const chatHistory = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));
      const res = await queryAPI.ask({
        question,
        top_k: 5,
        document_ids: selectedDocs.length > 0 ? selectedDocs : undefined,
        chat_history: chatHistory,
      });
      const qr: QueryResponse = res.data;
      const aiMsg: ChatMessage = {
        role: "assistant",
        content: qr.answer,
        timestamp: new Date().toISOString(),
        queryResponse: qr,
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (e: any) {
      toast.error(e.message || "Query failed");
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "⚠️ Could not connect to the AI backend. Please ensure the backend is running.",
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, selectedDocs]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── Voice Input ──────────────────────────────────────────────────
  const startListening = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { toast.error("Speech recognition not supported in this browser"); return; }
    const rec = new SR();
    rec.lang = "en-US"; rec.continuous = false; rec.interimResults = false;
    rec.onresult = (e: any) => setInput(e.results[0][0].transcript);
    rec.onend = () => setListening(false);
    rec.onerror = () => { setListening(false); toast.error("Mic error"); };
    rec.start();
    recognitionRef.current = rec;
    setListening(true);
  };

  const stopListening = () => { recognitionRef.current?.stop(); setListening(false); };

  // ── Voice Output ─────────────────────────────────────────────────
  const speak = (text: string) => {
    if (!window.speechSynthesis) { toast.error("Text-to-speech not supported"); return; }
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return; }
    const plain = text.replace(/[#*_`\[\]]/g, "");
    const utterance = new SpeechSynthesisUtterance(plain);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const clearChat = () => { setMessages([]); window.speechSynthesis?.cancel(); };

  return (
    <div style={{ height: "calc(100vh - 64px)", display: "flex", overflow: "hidden" }}>
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside style={{
        width: 260, flexShrink: 0,
        background: "rgba(7, 26, 21, 0.8)",
        borderRight: "1px solid var(--border-subtle)",
        display: "flex", flexDirection: "column",
        padding: "16px 12px",
        overflowY: "auto",
      }} className="hidden md:flex">
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
            Filter by Document
          </h3>
          {documents.filter(d => d.status === "completed").length === 0 ? (
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", padding: "8px 0" }}>
              No documents. <a href="/upload" style={{ color: "var(--teal-300)" }}>Upload one →</a>
            </p>
          ) : (
            documents.filter(d => d.status === "completed").map(doc => {
              const selected = selectedDocs.includes(doc.document_id);
              return (
                <button
                  key={doc.document_id}
                  onClick={() => setSelectedDocs(prev =>
                    selected ? prev.filter(id => id !== doc.document_id) : [...prev, doc.document_id]
                  )}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: 8,
                    width: "100%", padding: "8px 10px", marginBottom: 4,
                    background: selected ? "rgba(0,137,123,0.15)" : "transparent",
                    border: `1px solid ${selected ? "rgba(0,137,123,0.4)" : "transparent"}`,
                    borderRadius: 8, cursor: "pointer", textAlign: "left",
                    transition: "all 0.15s",
                  }}
                >
                  <FileText size={13} style={{ color: selected ? "var(--teal-300)" : "var(--text-muted)", marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: "0.8rem", color: selected ? "var(--text-primary)" : "var(--text-secondary)", wordBreak: "break-word" }}>
                      {doc.filename}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                      {doc.total_pages}p · {doc.total_chunks} chunks
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
            Suggested Questions
          </h3>
          {suggestions.slice(0, 6).map(q => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "7px 10px", marginBottom: 4,
                background: "none", border: "none", cursor: "pointer",
                color: "var(--text-secondary)", fontSize: "0.8rem",
                borderRadius: 6, transition: "all 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,137,123,0.08)")}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}
            >
              → {q}
            </button>
          ))}
        </div>

        {messages.length > 0 && (
          <button onClick={clearChat} className="btn-secondary" style={{ marginTop: "auto", fontSize: "0.8rem", padding: "8px 12px" }}>
            <Trash2 size={13} /> Clear Chat
          </button>
        )}
      </aside>

      {/* ── Main Chat Area ──────────────────────────────────── */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ textAlign: "center", paddingTop: 60 }}
            >
              <Leaf size={48} style={{ color: "var(--teal-500)", margin: "0 auto 16px", display: "block" }}
                className="animate-float" />
              <h2 className="heading-serif" style={{ fontSize: "1.6rem", marginBottom: 8 }}>
                Namaste! Ask AI Vaidya
              </h2>
              <p style={{ color: "var(--text-secondary)", maxWidth: 440, margin: "0 auto 32px", lineHeight: 1.7 }}>
                Ask any Ayurveda question. Answers are generated exclusively from your uploaded knowledge base.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10, maxWidth: 700, margin: "0 auto" }}>
                {suggestions.slice(0, 6).map(q => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="glass-card-light"
                    style={{
                      padding: "12px 14px", cursor: "pointer", textAlign: "left",
                      border: "1px solid var(--border-subtle)",
                      fontSize: "0.83rem", color: "var(--text-secondary)",
                      background: "none", borderRadius: 12, transition: "all 0.2s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,137,123,0.4)"; e.currentTarget.style.color = "var(--text-primary)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-subtle)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
                  >
                    <Sparkles size={12} style={{ color: "var(--teal-400)", marginRight: 6 }} />
                    {q}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} onSpeak={speak} />
          ))}

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", alignItems: "center", gap: 10, paddingLeft: 4 }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "10px 16px",
                background: "rgba(13, 43, 35, 0.8)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "18px 18px 18px 4px",
              }}>
                <Loader2 size={16} className="animate-spin" style={{ color: "var(--teal-400)" }} />
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                  Retrieving from knowledge base...
                </span>
              </div>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input Bar */}
        <div style={{
          borderTop: "1px solid var(--border-subtle)",
          padding: "16px 24px",
          background: "rgba(7, 26, 21, 0.95)",
        }}>
          <div style={{
            display: "flex", alignItems: "flex-end", gap: 10,
            background: "rgba(0,0,0,0.3)",
            border: "1px solid var(--border-medium)",
            borderRadius: 16,
            padding: "8px 8px 8px 16px",
          }}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about doshas, herbs, treatments, Panchakarma..."
              rows={1}
              style={{
                flex: 1, background: "none", border: "none", outline: "none",
                color: "var(--text-primary)", fontFamily: "var(--font-sans)",
                fontSize: "0.95rem", resize: "none", lineHeight: 1.5,
                paddingTop: 6, paddingBottom: 6,
                minHeight: 36, maxHeight: 120,
              }}
            />
            {/* Voice Input */}
            <button
              onClick={listening ? stopListening : startListening}
              style={{
                padding: 8, borderRadius: 10, border: "none", cursor: "pointer",
                background: listening ? "rgba(229,115,115,0.15)" : "transparent",
                color: listening ? "#e57373" : "var(--text-muted)",
                transition: "all 0.2s",
              }}
              title={listening ? "Stop listening" : "Voice input"}
            >
              {listening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
            {/* Send */}
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              style={{
                padding: "8px 16px", borderRadius: 10, border: "none", cursor: "pointer",
                background: input.trim() && !loading
                  ? "linear-gradient(135deg, var(--teal-600), var(--teal-800))"
                  : "rgba(0,137,123,0.15)",
                color: input.trim() && !loading ? "#fff" : "var(--text-muted)",
                transition: "all 0.2s", display: "flex", alignItems: "center", gap: 6,
                fontWeight: 600, fontSize: "0.85rem",
              }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
          <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", textAlign: "center", marginTop: 8 }}>
            Answers are generated only from uploaded documents · Press Enter to send
          </p>
        </div>
      </main>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "50vh" }}><Loader2 className="animate-spin" size={32} style={{ color: "var(--teal-400)" }} /></div>}>
      <ChatPageContent />
    </Suspense>
  );
}
