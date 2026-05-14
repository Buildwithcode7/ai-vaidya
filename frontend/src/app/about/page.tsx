"use client";
import { motion } from "framer-motion";
import { Leaf, Github, Code2, Database, Brain, Shield, Zap, BookOpen } from "lucide-react";
import Link from "next/link";

const techStack = [
  { category: "Frontend", items: ["Next.js 14 (App Router)", "TypeScript", "Tailwind CSS", "Framer Motion", "React Dropzone"] },
  { category: "Backend", items: ["FastAPI (Python)", "Uvicorn ASGI", "Pydantic v2", "Python-Multipart"] },
  { category: "AI / NLP", items: ["sentence-transformers/all-MiniLM-L6-v2", "LangChain (RAG)", "Groq API (LLaMA3)", "ChromaDB Vector DB"] },
  { category: "Document Processing", items: ["PyMuPDF (PDF extraction)", "python-docx (DOCX)", "pytesseract (OCR)", "Semantic chunking"] },
];

const architectureSteps = [
  { step: "1", icon: BookOpen, title: "Document Ingestion", desc: "User uploads PDF/TXT/DOCX. Text extracted page by page using PyMuPDF." },
  { step: "2", icon: Code2, title: "Preprocessing", desc: "Text cleaned, deduplicated, and split into 800-char overlapping semantic chunks." },
  { step: "3", icon: Brain, title: "Embedding Generation", desc: "Each chunk embedded with sentence-transformers (all-MiniLM-L6-v2, 384-dim)." },
  { step: "4", icon: Database, title: "Vector Storage", desc: "Embeddings stored in ChromaDB with cosine similarity indexing and metadata." },
  { step: "5", icon: Zap, title: "Semantic Retrieval", desc: "User query embedded → top-k chunks retrieved by cosine similarity." },
  { step: "6", icon: Shield, title: "Grounded Generation", desc: "Retrieved context injected into LLM prompt. LLaMA3 via Groq generates citation-backed answer." },
];

export default function AboutPage() {
  return (
    <div className="page-container">
      <div className="main-content" style={{ maxWidth: 1000 }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", padding: "40px 0 60px" }}>
          <div style={{
            width: 72, height: 72,
            background: "linear-gradient(135deg, #00897b, #558b2f)",
            borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px", boxShadow: "0 0 32px rgba(0,137,123,0.4)",
          }}>
            <Leaf size={36} color="#fff" />
          </div>
          <h1 className="heading-serif" style={{ fontSize: "2.5rem", marginBottom: 12 }}>
            About <span className="text-gradient">AI Vaidya</span>
          </h1>
          <p style={{ fontSize: "1.05rem", color: "var(--text-secondary)", maxWidth: 600, margin: "0 auto", lineHeight: 1.75 }}>
            An intelligent, domain-specific Retrieval-Augmented Generation (RAG) assistant
            for Ayurvedic knowledge, built for the hackathon.
          </p>
        </motion.div>

        {/* Problem Statement */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="glass-card" style={{ padding: 32, marginBottom: 32 }}>
          <h2 className="heading-serif" style={{ fontSize: "1.4rem", marginBottom: 12, color: "var(--teal-300)" }}>
            The Problem
          </h2>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.75 }}>
            Ayurveda has thousands of years of documented knowledge across classical Samhitas, research papers,
            and monographs. However, this wisdom is often inaccessible — locked in dense Sanskrit texts or
            scattered PDFs that generic AI models cannot reliably query without hallucinating.
            <br /><br />
            AI Vaidya solves this by creating a <strong style={{ color: "var(--text-gold)" }}>closed-domain RAG system</strong> where
            every answer is grounded exclusively in documents YOU upload. No internet. No hallucinations.
            Full citations.
          </p>
        </motion.div>

        {/* RAG Architecture */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} style={{ marginBottom: 40 }}>
          <h2 className="heading-serif" style={{ fontSize: "1.5rem", marginBottom: 24, textAlign: "center" }}>
            RAG Architecture
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {architectureSteps.map(({ step, icon: Icon, title, desc }, i) => (
              <motion.div
                key={step}
                className="glass-card-light"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                style={{ padding: "20px 18px", position: "relative" }}
              >
                <div style={{
                  position: "absolute", top: 16, right: 16,
                  fontSize: "2rem", fontFamily: "var(--font-playfair)",
                  color: "rgba(0,137,123,0.15)", fontWeight: 700,
                }}>
                  {step}
                </div>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "rgba(0,137,123,0.15)", border: "1px solid rgba(0,137,123,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12,
                }}>
                  <Icon size={18} style={{ color: "var(--teal-300)" }} />
                </div>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>
                  {title}
                </h3>
                <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tech Stack */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} style={{ marginBottom: 40 }}>
          <h2 className="heading-serif" style={{ fontSize: "1.5rem", marginBottom: 24, textAlign: "center" }}>
            Technology Stack
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
            {techStack.map(({ category, items }) => (
              <div key={category} className="glass-card" style={{ padding: 20 }}>
                <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--teal-300)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                  {category}
                </h3>
                {items.map(item => (
                  <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--sage-500)", flexShrink: 0 }} />
                    <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>{item}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Key Features */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="glass-card" style={{ padding: 32, marginBottom: 32 }}>
          <h2 className="heading-serif" style={{ fontSize: "1.4rem", marginBottom: 16, color: "var(--teal-300)" }}>
            Key Features
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px" }}>
            {[
              "RAG pipeline — no hallucinations",
              "Upload PDFs, TXT, DOCX (up to 100MB)",
              "Semantic chunk retrieval (cosine similarity)",
              "Citation-backed answers with page numbers",
              "Voice input (Speech-to-Text)",
              "Voice output (Text-to-Speech)",
              "Knowledge Graph visualization",
              "Semantic search across documents",
              "Document analytics dashboard",
              "Confidence scoring (High/Medium/Low)",
              "Chat history & context memory",
              "Free & open-source (MIT License)",
            ].map(f => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: "1px solid var(--border-subtle)", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--teal-500)", flexShrink: 0 }} />
                {f}
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} style={{ textAlign: "center", padding: "20px 0 60px" }}>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/upload" className="btn-primary">
              <BookOpen size={16} /> Get Started
            </Link>
            <a href="https://github.com/Buildwithcode7/RoomVerse-AI" target="_blank" rel="noopener noreferrer" className="btn-secondary">
              <Github size={16} /> View on GitHub
            </a>
          </div>
          <p style={{ marginTop: 16, fontSize: "0.8rem", color: "var(--text-muted)" }}>
            MIT License · Built with open-source AI tools
          </p>
        </motion.div>
      </div>
    </div>
  );
}
