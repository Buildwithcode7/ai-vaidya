"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Database, FileText, Hash, BookOpen, TrendingUp,
  Leaf, Activity, RefreshCw, ExternalLink
} from "lucide-react";
import Link from "next/link";
import { uploadAPI, DocumentMetadata } from "@/lib/api";

interface Analytics {
  total_documents: number;
  total_chunks: number;
  total_pages: number;
  top_herbs: Array<{ herb: string; count: number }>;
  top_diseases: Array<{ concept: string; count: number }>;
}

function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <div className="glass-card" style={{ padding: 24, display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: `linear-gradient(135deg, ${color}22, ${color}11)`,
        border: `1px solid ${color}44`,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Icon size={22} style={{ color }} />
      </div>
      <div>
        <div style={{ fontSize: "1.6rem", fontWeight: 700, fontFamily: "var(--font-playfair)", color: "var(--text-primary)" }}>
          {value}
        </div>
        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{label}</div>
      </div>
    </div>
  );
}

export default function KnowledgePage() {
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [graphNodes, setGraphNodes] = useState<any[]>([]);
  const [graphEdges, setGraphEdges] = useState<any[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const [docsRes, analyticsRes] = await Promise.all([
        uploadAPI.listDocuments(),
        uploadAPI.getAnalytics(),
      ]);
      setDocuments(docsRes.data.documents || []);
      setAnalytics(analyticsRes.data);

      // Load knowledge graph
      const { queryAPI } = await import("@/lib/api");
      const graphRes = await queryAPI.getKnowledgeGraph();
      setGraphNodes(graphRes.data.nodes || []);
      setGraphEdges(graphRes.data.edges || []);
    } catch (e) {
      // backend offline
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const nodeTypeColor: Record<string, string> = {
    dosha: "#00897b", herb: "#689f38",
    treatment: "#d4a853", concept: "#7986cb", disease: "#e57373",
  };

  return (
    <div className="page-container bg-grid" style={{ minHeight: "100vh" }}>
      <div className="main-content">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
            <h1 className="heading-serif" style={{ fontSize: "2rem", marginBottom: 6 }}>
              <span className="text-gradient">Knowledge Base</span> Dashboard
            </h1>
            <p style={{ color: "var(--text-secondary)" }}>
              Overview of your uploaded Ayurveda document corpus
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={load} className="btn-secondary" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
              <RefreshCw size={14} /> Refresh
            </button>
            <Link href="/upload" className="btn-primary" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
              + Add Document
            </Link>
          </div>
        </div>

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
            {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 96 }} />)}
          </div>
        ) : (
          <>
            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16, marginBottom: 32 }}
            >
              <StatCard icon={FileText} label="Documents" value={analytics?.total_documents ?? 0} color="#00897b" />
              <StatCard icon={Hash} label="Chunks Indexed" value={analytics?.total_chunks?.toLocaleString() ?? 0} color="#689f38" />
              <StatCard icon={BookOpen} label="Pages Processed" value={analytics?.total_pages?.toLocaleString() ?? 0} color="#d4a853" />
              <StatCard icon={Activity} label="Top Herbs Found" value={analytics?.top_herbs?.length ?? 0} color="#7986cb" />
            </motion.div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
              {/* Document Table */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                <div className="glass-card" style={{ padding: 24 }}>
                  <h2 style={{ fontFamily: "var(--font-playfair)", fontSize: "1.1rem", marginBottom: 18, color: "var(--teal-300)" }}>
                    Uploaded Documents
                  </h2>
                  {documents.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
                      <Database size={40} style={{ margin: "0 auto 12px", display: "block", opacity: 0.4 }} />
                      <p>No documents uploaded yet</p>
                      <Link href="/upload" className="btn-primary" style={{ marginTop: 16, display: "inline-flex", fontSize: "0.85rem" }}>
                        Upload Document
                      </Link>
                    </div>
                  ) : (
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                            {["Document", "Pages", "Chunks", "Herbs", "Status", "Action"].map(h => (
                              <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {documents.map((doc, i) => (
                            <motion.tr
                              key={doc.document_id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.04 }}
                              style={{ borderBottom: "1px solid var(--border-subtle)" }}
                            >
                              <td style={{ padding: "12px 12px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <FileText size={14} style={{ color: "var(--teal-400)", flexShrink: 0 }} />
                                  <span style={{ fontSize: "0.85rem", color: "var(--text-primary)", wordBreak: "break-word", maxWidth: 200 }}>
                                    {doc.filename}
                                  </span>
                                </div>
                              </td>
                              <td style={{ padding: "12px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>{doc.total_pages}</td>
                              <td style={{ padding: "12px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>{doc.total_chunks}</td>
                              <td style={{ padding: "12px" }}>
                                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                                  {doc.top_herbs.slice(0, 2).map(h => (
                                    <span key={h} className="tag-pill" style={{ fontSize: "0.7rem", padding: "2px 8px" }}>{h}</span>
                                  ))}
                                  {doc.top_herbs.length > 2 && (
                                    <span className="tag-pill" style={{ fontSize: "0.7rem", padding: "2px 8px" }}>+{doc.top_herbs.length - 2}</span>
                                  )}
                                </div>
                              </td>
                              <td style={{ padding: "12px" }}>
                                <span style={{
                                  fontSize: "0.72rem", fontWeight: 600, padding: "3px 8px",
                                  borderRadius: 999,
                                  background: doc.status === "completed" ? "rgba(104,159,56,0.15)" : "rgba(212,168,83,0.15)",
                                  color: doc.status === "completed" ? "#8bc34a" : "#d4a853",
                                }}>
                                  {doc.status}
                                </span>
                              </td>
                              <td style={{ padding: "12px" }}>
                                <Link href={`/chat?doc=${doc.document_id}`} style={{ color: "var(--teal-400)", display: "inline-flex" }}>
                                  <ExternalLink size={14} />
                                </Link>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Right Column */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Top Herbs */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
                  <div className="glass-card" style={{ padding: 20 }}>
                    <h2 style={{ fontFamily: "var(--font-playfair)", fontSize: "1rem", marginBottom: 14, color: "var(--teal-300)" }}>
                      <Leaf size={14} style={{ display: "inline", marginRight: 6 }} />
                      Most Frequent Herbs
                    </h2>
                    {(analytics?.top_herbs || []).slice(0, 8).map(({ herb, count }, i) => (
                      <div key={herb} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", width: 16, textAlign: "right" }}>{i+1}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                            <span style={{ fontSize: "0.83rem", color: "var(--text-secondary)", textTransform: "capitalize" }}>{herb}</span>
                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{count}</span>
                          </div>
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${Math.min(100, count * 20)}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!analytics?.top_herbs?.length) && (
                      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Upload documents to see herb analytics</p>
                    )}
                  </div>
                </motion.div>

                {/* Knowledge Graph Legend */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                  <div className="glass-card" style={{ padding: 20 }}>
                    <h2 style={{ fontFamily: "var(--font-playfair)", fontSize: "1rem", marginBottom: 14, color: "var(--teal-300)" }}>
                      Knowledge Graph
                    </h2>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: 12 }}>
                      {graphNodes.length} nodes · {graphEdges.length} relationships found
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {Object.entries(nodeTypeColor).map(([type, color]) => (
                        <div key={type} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0 }} />
                          <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", textTransform: "capitalize" }}>{type}</span>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: "auto" }}>
                            {graphNodes.filter(n => n.type === type).length}
                          </span>
                        </div>
                      ))}
                    </div>
                    <Link href="/knowledge/graph" className="btn-secondary" style={{ marginTop: 16, fontSize: "0.82rem", padding: "8px 14px", display: "flex", justifyContent: "center" }}>
                      View Full Graph →
                    </Link>
                  </div>
                </motion.div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
