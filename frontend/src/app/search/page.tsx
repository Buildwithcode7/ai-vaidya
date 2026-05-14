"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, FileText, Loader2, BookOpen } from "lucide-react";
import { queryAPI, SearchResult } from "@/lib/api";
import toast from "react-hot-toast";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchTime, setSearchTime] = useState(0);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await queryAPI.search({ query, top_k: 12 });
      setResults(res.data.results || []);
      setSearchTime(res.data.search_time_ms);
    } catch (e: any) {
      toast.error(e.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase()
        ? <mark key={i} style={{ background: "rgba(0,137,123,0.25)", color: "var(--teal-200)", borderRadius: 2 }}>{part}</mark>
        : part
    );
  };

  return (
    <div className="page-container bg-grid">
      <div className="main-content" style={{ maxWidth: 900 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="heading-serif" style={{ fontSize: "2rem", marginBottom: 8 }}>
            Semantic <span className="text-gradient">Search</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", marginBottom: 32 }}>
            Search directly across your Ayurveda knowledge base using semantic similarity
          </p>

          {/* Search Bar */}
          <div style={{
            display: "flex", gap: 12, marginBottom: 32,
            background: "rgba(0,0,0,0.3)",
            border: "1px solid var(--border-medium)",
            borderRadius: 14, padding: "8px 8px 8px 18px",
          }}>
            <Search size={18} style={{ color: "var(--text-muted)", alignSelf: "center", flexShrink: 0 }} />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder="Search for herbs, doshas, treatments, symptoms..."
              style={{
                flex: 1, background: "none", border: "none", outline: "none",
                color: "var(--text-primary)", fontFamily: "var(--font-sans)", fontSize: "1rem",
                padding: "6px 0",
              }}
            />
            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="btn-primary"
              style={{ padding: "10px 24px" }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : "Search"}
            </button>
          </div>

          {/* Popular Searches */}
          {!searched && (
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 10 }}>Popular searches:</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["turmeric wound healing", "vata dosha", "panchakarma therapy", "agni digestion", "brahmi brain"].map(s => (
                  <button
                    key={s}
                    className="tag-pill"
                    style={{ cursor: "pointer" }}
                    onClick={() => { setQuery(s); }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          <AnimatePresence>
            {searched && !loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    {results.length} results in {searchTime}ms
                  </span>
                </div>

                {results.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
                    <BookOpen size={40} style={{ margin: "0 auto 12px", display: "block", opacity: 0.4 }} />
                    <p>No matching passages found. Try uploading relevant documents.</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {results.map((r, i) => (
                      <motion.div
                        key={i}
                        className="glass-card"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        style={{ padding: "18px 20px" }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <FileText size={14} style={{ color: "var(--teal-400)" }} />
                            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--teal-300)" }}>
                              {r.document_name}
                            </span>
                            {r.page_number && (
                              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                · Page {r.page_number}
                              </span>
                            )}
                          </div>
                          <div style={{
                            fontSize: "0.72rem", fontWeight: 700, padding: "2px 10px",
                            borderRadius: 999,
                            background: r.relevance_score > 0.7 ? "rgba(104,159,56,0.15)" : "rgba(212,168,83,0.1)",
                            color: r.relevance_score > 0.7 ? "#8bc34a" : "#d4a853",
                          }}>
                            {Math.round(r.relevance_score * 100)}% match
                          </div>
                        </div>
                        <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.7, margin: 0 }}>
                          {highlightText(r.chunk_text.slice(0, 400) + (r.chunk_text.length > 400 ? "..." : ""), query)}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
